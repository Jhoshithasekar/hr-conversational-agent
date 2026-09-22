from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text

from app.database import Base


class LeaveRecord(Base):
    __tablename__ = "leave_records"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )
    leave_request_id = Column(
        Integer,
        ForeignKey("leave_requests.id"),
        nullable=True
    )
    manager_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    leave_type = Column(String(30), nullable=False)

    start_date = Column(DateTime, nullable=False)

    end_date = Column(DateTime, nullable=False)

    total_days = Column(Numeric(5, 2), nullable=False)

    recorded_at = Column(DateTime, nullable=False)

    notes = Column(Text, nullable=True)