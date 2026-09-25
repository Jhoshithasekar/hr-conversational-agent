from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import require_manager_role
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.department import Department
from app.models.employee import Employee
from app.models.leave_balance import LeaveBalance
from app.models.leave_request import LeaveRequest
from app.models.policy_document import PolicyDocument
from app.schemas.leave_request import LeaveRequestAction

router = APIRouter(
    prefix="/manager",
    tags=["Manager Workspace"],
)


def _serialize_dt(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def _serialize_num(val: Decimal | float | int | None) -> float:
    return float(val) if val is not None else 0.0


@router.get("/dashboard")
def get_manager_dashboard(
    current_user: Employee = Depends(require_manager_role),
    db: Session = Depends(get_db),
):
    """Returns key metrics and recent team activity for the authenticated manager."""
    reports = (
        db.query(Employee)
        .filter(Employee.manager_id == current_user.id)
        .all()
    )
    report_ids = [r.id for r in reports]

    team_count = len(reports)
    pending_requests_count = 0
    recent_activity: list[dict[str, Any]] = []
    on_leave_today_count = 0

    if report_ids:
        pending_requests_count = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.employee_id.in_(report_ids),
                LeaveRequest.status.ilike("pending"),
            )
            .count()
        )

        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)

        on_leave_today_count = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.employee_id.in_(report_ids),
                LeaveRequest.status == "Approved",
                LeaveRequest.start_date <= today_end,
                LeaveRequest.end_date >= today_start,
            )
            .count()
        )

        # Recent 5 requests from direct reports
        recent_reqs = (
            db.query(LeaveRequest, Employee)
            .join(Employee, LeaveRequest.employee_id == Employee.id)
            .filter(LeaveRequest.employee_id.in_(report_ids))
            .order_by(
                LeaveRequest.submitted_at.desc().nullslast(),
                LeaveRequest.id.desc(),
            )
            .limit(5)
            .all()
        )

        for req, emp in recent_reqs:
            recent_activity.append({
                "id": req.id,
                "employee_id": emp.id,
                "employee_name": emp.name,
                "employee_role": emp.role,
                "request_type": req.request_type,
                "start_date": _serialize_dt(req.start_date),
                "end_date": _serialize_dt(req.end_date),
                "total_days": _serialize_num(req.total_days),
                "status": req.status,
                "submitted_at": _serialize_dt(req.submitted_at),
                "reason": req.reason,
            })

    return {
        "manager_id": current_user.id,
        "manager_name": current_user.name,
        "team_count": team_count,
        "pending_requests_count": pending_requests_count,
        "action_required_count": pending_requests_count,
        "on_leave_today_count": on_leave_today_count,
        "recent_activity": recent_activity,
    }


@router.get("/team")
def get_manager_team(
    current_user: Employee = Depends(require_manager_role),
    db: Session = Depends(get_db),
):
    """Returns direct reports with their roles, departments, leave balances, and request status."""
    reports = (
        db.query(Employee)
        .filter(Employee.manager_id == current_user.id)
        .order_by(Employee.name.asc())
        .all()
    )

    team_list = []
    current_year = datetime.utcnow().year
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)

    for emp in reports:
        # Department name
        dept_name = "Not Assigned"
        if emp.department_id:
            dept = db.query(Department).filter(Department.id == emp.department_id).first()
            if dept:
                dept_name = dept.name

        # Leave balances
        balances = (
            db.query(LeaveBalance)
            .filter(
                LeaveBalance.employee_id == emp.id,
                LeaveBalance.year == current_year,
            )
            .all()
        )
        balance_list = [
            {
                "leave_type": b.leave_type,
                "remaining_days": _serialize_num(b.remaining_days),
                "used_days": _serialize_num(b.used_days),
                "total_entitlement": _serialize_num(b.total_entitlement),
            }
            for b in balances
        ]

        # Pending requests count
        pending_count = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.employee_id == emp.id,
                LeaveRequest.status.ilike("pending"),
            )
            .count()
        )

        # Active request today check
        active_today = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.employee_id == emp.id,
                LeaveRequest.status == "Approved",
                LeaveRequest.start_date <= today_end,
                LeaveRequest.end_date >= today_start,
            )
            .first()
        )

        current_status = emp.status
        if active_today:
            if "home" in active_today.request_type.lower():
                current_status = "WFH Today"
            else:
                current_status = "On Leave Today"

        team_list.append({
            "id": emp.id,
            "name": emp.name,
            "email": emp.email,
            "role": emp.role,
            "department_id": emp.department_id,
            "department_name": dept_name,
            "status": current_status,
            "raw_status": emp.status,
            "pending_requests_count": pending_count,
            "leave_balances": balance_list,
        })

    return team_list


@router.get("/requests")
def get_manager_team_requests(
    status_filter: str | None = Query(None, alias="status"),
    request_type: str | None = Query(None, alias="request_type"),
    search: str | None = Query(None, alias="search"),
    current_user: Employee = Depends(require_manager_role),
    db: Session = Depends(get_db),
):
    """Returns requests submitted by the manager's direct reports with filtering."""
    reports = (
        db.query(Employee.id)
        .filter(Employee.manager_id == current_user.id)
        .all()
    )
    report_ids = [r[0] for r in reports]

    if not report_ids:
        return []

    query = (
        db.query(LeaveRequest, Employee, Department)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .outerjoin(Department, Employee.department_id == Department.id)
        .filter(LeaveRequest.employee_id.in_(report_ids))
    )

    if status_filter and status_filter.lower() != "all":
        query = query.filter(func.lower(LeaveRequest.status) == status_filter.lower())

    if request_type and request_type.lower() != "all":
        query = query.filter(func.lower(LeaveRequest.request_type) == request_type.lower())

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Employee.name.ilike(search_pattern))
            | (LeaveRequest.reason.ilike(search_pattern))
        )

    results = (
        query.order_by(
            LeaveRequest.submitted_at.desc().nullslast(),
            LeaveRequest.id.desc(),
        )
        .all()
    )

    items = []
    for req, emp, dept in results:
        items.append({
            "id": req.id,
            "employee_id": emp.id,
            "employee_name": emp.name,
            "employee_email": emp.email,
            "employee_role": emp.role,
            "department_name": dept.name if dept else "General",
            "request_type": req.request_type,
            "start_date": _serialize_dt(req.start_date),
            "end_date": _serialize_dt(req.end_date),
            "total_days": _serialize_num(req.total_days),
            "half_full_day": req.half_full_day,
            "reason": req.reason,
            "status": req.status,
            "submitted_at": _serialize_dt(req.submitted_at),
            "manager_comment": req.manager_comment,
        })

    return items


@router.get("/requests/{request_id}")
def get_manager_request_detail(
    request_id: int,
    current_user: Employee = Depends(require_manager_role),
    db: Session = Depends(get_db),
):
    """Returns detailed information for a single request, including leave balance, policy info, and overlap warnings."""
    req = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found",
        )

    requester = db.query(Employee).filter(Employee.id == req.employee_id).first()
    if not requester:
        raise HTTPException(
            status_code=404,
            detail="Requester not found",
        )

    # Authorization: Ensure requester reports to current manager
    role_norm = (current_user.role or "").strip().lower()
    if role_norm != "hr" and requester.manager_id != current_user.id and req.approver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not authorized to view this request",
        )

    # Department
    dept_name = "Not Assigned"
    if requester.department_id:
        dept = db.query(Department).filter(Department.id == requester.department_id).first()
        if dept:
            dept_name = dept.name

    # Relevant leave balance
    clean_type = req.request_type.replace(" Leave", "").strip()
    balance_year = req.start_date.year if req.start_date else datetime.utcnow().year
    balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.employee_id == requester.id,
            LeaveBalance.leave_type.ilike(clean_type),
            LeaveBalance.year == balance_year,
        )
        .first()
    )

    leave_balance_info = None
    if balance:
        leave_balance_info = {
            "leave_type": balance.leave_type,
            "remaining_days": _serialize_num(balance.remaining_days),
            "used_days": _serialize_num(balance.used_days),
            "total_entitlement": _serialize_num(balance.total_entitlement),
            "year": balance.year,
        }

    # Overlap detection: find overlapping requests in the manager's team
    direct_report_ids = [
        r[0]
        for r in db.query(Employee.id)
        .filter(Employee.manager_id == current_user.id)
        .all()
    ]
    if requester.id not in direct_report_ids:
        direct_report_ids.append(requester.id)

    overlapping_records = (
        db.query(LeaveRequest, Employee)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .filter(
            LeaveRequest.id != req.id,
            LeaveRequest.employee_id.in_(direct_report_ids),
            LeaveRequest.status.in_(["Approved", "Pending"]),
            LeaveRequest.start_date <= req.end_date,
            LeaveRequest.end_date >= req.start_date,
        )
        .all()
    )

    overlaps = []
    for o_req, o_emp in overlapping_records:
        overlaps.append({
            "request_id": o_req.id,
            "employee_id": o_emp.id,
            "employee_name": o_emp.name,
            "request_type": o_req.request_type,
            "start_date": _serialize_dt(o_req.start_date),
            "end_date": _serialize_dt(o_req.end_date),
            "total_days": _serialize_num(o_req.total_days),
            "status": o_req.status,
            "is_same_employee": o_emp.id == requester.id,
        })

    # Policy guidelines from PolicyDocument or default policy standards
    policies = (
        db.query(PolicyDocument)
        .filter(
            PolicyDocument.is_active == True,
            (PolicyDocument.title.ilike(f"%{clean_type}%"))
            | (PolicyDocument.category.ilike(f"%{clean_type}%"))
            | (PolicyDocument.category.ilike("%leave%")),
        )
        .all()
    )

    policy_guidance = []
    for pol in policies:
        policy_guidance.append({
            "id": pol.id,
            "title": pol.title,
            "category": pol.category,
            "version": pol.version,
            "effective_date": _serialize_dt(pol.effective_date),
        })

    if not policy_guidance:
        policy_guidance.append({
            "title": f"Standard {req.request_type} Policy",
            "category": "Time Off & Workplace Policy",
            "guideline": "Approval required by reporting manager prior to start date. Consecutive absence beyond 3 days requires medical certification if sick leave.",
        })

    # Audit Trail for this request
    audit_records = (
        db.query(AuditLog, Employee)
        .outerjoin(Employee, AuditLog.user_id == Employee.id)
        .filter(
            AuditLog.entity_type == "LeaveRequest",
            AuditLog.entity_id == req.id,
        )
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    audit_trail = [
        {
            "id": a.id,
            "action": a.action,
            "actor_name": actor.name if actor else f"User #{a.user_id}",
            "approver_action": a.approver_action,
            "status": a.status,
            "timestamp": _serialize_dt(a.timestamp),
            "comment": a.prompt_text,
        }
        for a, actor in audit_records
    ]

    return {
        "id": req.id,
        "request_type": req.request_type,
        "start_date": _serialize_dt(req.start_date),
        "end_date": _serialize_dt(req.end_date),
        "total_days": _serialize_num(req.total_days),
        "half_full_day": req.half_full_day,
        "reason": req.reason,
        "status": req.status,
        "submitted_at": _serialize_dt(req.submitted_at),
        "manager_comment": req.manager_comment,
        "employee": {
            "id": requester.id,
            "name": requester.name,
            "email": requester.email,
            "role": requester.role,
            "department_name": dept_name,
        },
        "leave_balance": leave_balance_info,
        "overlapping_requests": overlaps,
        "policy_guidance": policy_guidance,
        "audit_trail": audit_trail,
    }
