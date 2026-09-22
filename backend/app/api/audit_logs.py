from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import (
    AuditLogCreate,
    AuditLogResponse
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get(
    "/",
    response_model=list[AuditLogResponse]
)
def get_audit_logs(
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).all()


@router.get(
    "/{audit_id}",
    response_model=AuditLogResponse
)
def get_audit_log(
    audit_id: int,
    db: Session = Depends(get_db)
):
    audit = db.query(AuditLog).filter(
        AuditLog.id == audit_id
    ).first()

    if not audit:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found"
        )

    return audit


@router.post(
    "/",
    response_model=AuditLogResponse,
    status_code=201
)
def create_audit_log(
    audit_data: AuditLogCreate,
    db: Session = Depends(get_db)
):
    audit = AuditLog(
        user_id=audit_data.user_id,
        timestamp=audit_data.timestamp,
        action=audit_data.action,
        status=audit_data.status,
        prompt_text=audit_data.prompt_text,
        extracted_parameters=audit_data.extracted_parameters,
        entity_type=audit_data.entity_type,
        entity_id=audit_data.entity_id,
        approver_action=audit_data.approver_action
    )

    db.add(audit)
    db.commit()
    db.refresh(audit)

    return audit