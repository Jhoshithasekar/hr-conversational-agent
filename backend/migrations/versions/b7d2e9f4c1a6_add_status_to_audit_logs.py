"""add status to audit logs

Revision ID: b7d2e9f4c1a6
Revises: 8a6f4c2d91b7
Create Date: 2026-09-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7d2e9f4c1a6"
down_revision: Union[str, Sequence[str], None] = "8a6f4c2d91b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "audit_logs",
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
    )
    op.create_check_constraint(
        "ck_audit_logs_status",
        "audit_logs",
        "status IN ('pending', 'passed', 'failed')",
    )
    op.alter_column("audit_logs", "status", server_default=None)


def downgrade() -> None:
    op.drop_constraint(
        "ck_audit_logs_status",
        "audit_logs",
        type_="check",
    )
    op.drop_column("audit_logs", "status")