from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, ForeignKey

from app.database import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    request_type = Column(String(30), nullable=False)

    start_date = Column(DateTime, nullable=False)

    end_date = Column(DateTime, nullable=False)

    total_days = Column(Numeric(5, 2), nullable=False)

    half_full_day = Column(String(20), nullable=True)

    reason = Column(Text, nullable=False)

    approver_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    status = Column(String(20), nullable=False)

    submitted_at = Column(DateTime, nullable=True)

    manager_comment = Column(Text, nullable=True)