from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)

from app.database import Base


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    __table_args__ = (
        CheckConstraint(
            "leave_type IN ('Sick', 'Casual', 'Earned', 'Maternity', 'Paternity')",
            name="ck_leave_balances_leave_type",
        ),
        CheckConstraint(
            "total_entitlement >= 0",
            name="ck_leave_balances_total_entitlement_non_negative",
        ),
        CheckConstraint(
            "used_days >= 0",
            name="ck_leave_balances_used_days_non_negative",
        ),
        CheckConstraint(
            "remaining_days >= 0",
            name="ck_leave_balances_remaining_days_non_negative",
        ),
        CheckConstraint(
            "remaining_days = total_entitlement - used_days",
            name="ck_leave_balances_remaining_days_consistent",
        ),
        UniqueConstraint(
            "employee_id",
            "leave_type",
            "year",
            name="uq_leave_balances_employee_leave_type_year",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    leave_type = Column(String(20), nullable=False)

    total_entitlement = Column(Numeric(8, 2), nullable=False)

    used_days = Column(Numeric(8, 2), nullable=False)

    remaining_days = Column(Numeric(8, 2), nullable=False)

    year = Column(Integer, nullable=False)