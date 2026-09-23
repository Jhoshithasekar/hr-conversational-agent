"""create leave balance table

Revision ID: e7b4c2d9a516
Revises: d6f1a9c3e824
Create Date: 2026-09-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e7b4c2d9a516"
down_revision: Union[str, Sequence[str], None] = "d6f1a9c3e824"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leave_balances",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("leave_type", sa.String(length=20), nullable=False),
        sa.Column("total_entitlement", sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column("used_days", sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column("remaining_days", sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.CheckConstraint(
            "leave_type IN ('Sick', 'Casual', 'Earned', 'Maternity', 'Paternity')",
            name="ck_leave_balances_leave_type",
        ),
        sa.CheckConstraint(
            "total_entitlement >= 0",
            name="ck_leave_balances_total_entitlement_non_negative",
        ),
        sa.CheckConstraint(
            "used_days >= 0",
            name="ck_leave_balances_used_days_non_negative",
        ),
        sa.CheckConstraint(
            "remaining_days >= 0",
            name="ck_leave_balances_remaining_days_non_negative",
        ),
        sa.CheckConstraint(
            "remaining_days = total_entitlement - used_days",
            name="ck_leave_balances_remaining_days_consistent",
        ),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "employee_id",
            "leave_type",
            "year",
            name="uq_leave_balances_employee_leave_type_year",
        ),
    )
    op.create_index(
        op.f("ix_leave_balances_id"),
        "leave_balances",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_leave_balances_id"), table_name="leave_balances")
    op.drop_table("leave_balances")