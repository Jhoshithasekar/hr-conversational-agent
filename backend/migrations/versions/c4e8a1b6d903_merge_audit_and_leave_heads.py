"""merge audit and leave migration heads

Revision ID: c4e8a1b6d903
Revises: 47b61b4e2e86, b7d2e9f4c1a6
Create Date: 2026-09-22

"""
from typing import Sequence, Union


revision: str = "c4e8a1b6d903"
down_revision: Union[str, Sequence[str], None] = (
    "47b61b4e2e86",
    "b7d2e9f4c1a6",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass