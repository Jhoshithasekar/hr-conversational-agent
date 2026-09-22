from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)  # type: ignore[reportMissingImports]

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'passed', 'failed')",
            name="ck_audit_logs_status",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    timestamp = Column(
        DateTime,
        nullable=False
    )

    action = Column(
        String(100),
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="pending"
    )

    prompt_text = Column(
        Text,
        nullable=True
    )

    extracted_parameters = Column(
        JSON,
        nullable=True
    )

    entity_type = Column(
        String(50),
        nullable=True
    )

    entity_id = Column(
        Integer,
        nullable=True
    )

    approver_action = Column(
        String(50),
        nullable=True
    )
