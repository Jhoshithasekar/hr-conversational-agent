from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_employee
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.employee import Employee
from app.models.leave_balance import LeaveBalance
from app.models.leave_request import LeaveRequest
from app.schemas.leave_request import (
    LeaveRequestAction,
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestUpdate,
)

router = APIRouter(
    prefix="/leave-requests",
    tags=["Leave / WFH Requests"]
)


@router.get("/", response_model=list[LeaveRequestResponse])
def get_leave_requests(db: Session = Depends(get_db)):
    return db.query(LeaveRequest).all()


@router.get("/{request_id}", response_model=LeaveRequestResponse)
def get_leave_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    return request


@router.post("/", response_model=LeaveRequestResponse)
def create_leave_request(
    request_data: LeaveRequestCreate,
    db: Session = Depends(get_db)
):
    new_request = LeaveRequest(**request_data.model_dump())

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.put("/{request_id}", response_model=LeaveRequestResponse)
def update_leave_request(
    request_id: int,
    request_data: LeaveRequestUpdate,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    for key, value in request_data.model_dump().items():
        setattr(request, key, value)

    db.commit()
    db.refresh(request)

    return request


@router.delete("/{request_id}")
def delete_leave_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found"
        )

    db.delete(request)
    db.commit()

    return {
        "message": "Leave/WFH request deleted successfully"
    }


@router.patch("/{request_id}/approve")
def approve_leave_request(
    request_id: int,
    action_data: LeaveRequestAction | None = None,
    current_user: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found",
        )

    requester = db.query(Employee).filter(Employee.id == request.employee_id).first()
    if not requester:
        raise HTTPException(
            status_code=404,
            detail="Requester not found",
        )

    role_norm = (current_user.role or "").strip().lower()
    if role_norm != "hr" and requester.manager_id != current_user.id and request.approver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not authorized to approve this request",
        )

    was_already_approved = request.status == "Approved"
    request.status = "Approved"
    if action_data and action_data.comment:
        request.manager_comment = action_data.comment.strip()

    # Deduct leave balance if not already approved
    if not was_already_approved and "home" not in request.request_type.lower():
        clean_type = request.request_type.replace(" Leave", "").strip()
        balance_year = request.start_date.year if request.start_date else datetime.utcnow().year
        balance = (
            db.query(LeaveBalance)
            .filter(
                LeaveBalance.employee_id == requester.id,
                LeaveBalance.leave_type.ilike(clean_type),
                LeaveBalance.year == balance_year,
            )
            .first()
        )
        if balance:
            balance.used_days = balance.used_days + request.total_days
            balance.remaining_days = max(Decimal("0.0"), balance.total_entitlement - balance.used_days)

    # Write audit log
    audit_entry = AuditLog(
        user_id=current_user.id,
        timestamp=datetime.utcnow(),
        action="Approve Leave Request",
        status="passed",
        entity_type="LeaveRequest",
        entity_id=request.id,
        approver_action="Approved",
        prompt_text=action_data.comment if (action_data and action_data.comment) else None,
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(request)

    return {
        "message": "Leave/WFH request approved",
        "request_id": request.id,
        "status": request.status,
        "manager_comment": request.manager_comment,
    }


@router.patch("/{request_id}/reject")
def reject_leave_request(
    request_id: int,
    action_data: LeaveRequestAction | None = None,
    current_user: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    request = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Leave/WFH request not found",
        )

    requester = db.query(Employee).filter(Employee.id == request.employee_id).first()
    if not requester:
        raise HTTPException(
            status_code=404,
            detail="Requester not found",
        )

    role_norm = (current_user.role or "").strip().lower()
    if role_norm != "hr" and requester.manager_id != current_user.id and request.approver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not authorized to reject this request",
        )

    request.status = "Rejected"
    if action_data and action_data.comment:
        request.manager_comment = action_data.comment.strip()

    # Write audit log
    audit_entry = AuditLog(
        user_id=current_user.id,
        timestamp=datetime.utcnow(),
        action="Reject Leave Request",
        status="passed",
        entity_type="LeaveRequest",
        entity_id=request.id,
        approver_action="Rejected",
        prompt_text=action_data.comment if (action_data and action_data.comment) else None,
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(request)

    return {
        "message": "Leave/WFH request rejected",
        "request_id": request.id,
        "status": request.status,
        "manager_comment": request.manager_comment,
    }