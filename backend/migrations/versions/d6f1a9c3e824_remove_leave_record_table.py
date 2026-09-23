"""remove leave record table

Revision ID: d6f1a9c3e824
Revises: c4e8a1b6d903
Create Date: 2026-09-23

"""
from typing import Sequence, Union

from alembic import op


revision: str = "d6f1a9c3e824"
down_revision: Union[str, Sequence[str], None] = "c4e8a1b6d903"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_leave_records_id", table_name="leave_records")
    op.drop_table("leave_records")


def downgrade() -> None:
    raise NotImplementedError(
        "Recreating leave_records requires restoring its original schema."
    )