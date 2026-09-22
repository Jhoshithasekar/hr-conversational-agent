"""create leave record table

Revision ID: 8a6f4c2d91b7
Revises: f34b4e2bb494
Create Date: 2026-09-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8a6f4c2d91b7"
down_revision: Union[str, Sequence[str], None] = "f34b4e2bb494"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leave_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("leave_request_id", sa.Integer(), nullable=True),
        sa.Column("leave_type", sa.String(length=30), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("total_days", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("recorded_at", sa.DateTime(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
        sa.ForeignKeyConstraint(["leave_request_id"], ["leave_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_leave_records_id"),
        "leave_records",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_leave_records_id"), table_name="leave_records")
    op.drop_table("leave_records")