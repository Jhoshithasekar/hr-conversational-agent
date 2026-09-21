from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

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