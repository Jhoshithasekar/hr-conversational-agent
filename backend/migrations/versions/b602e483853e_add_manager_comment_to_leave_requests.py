"""add_manager_comment_to_leave_requests

Revision ID: b602e483853e
Revises: 951125b76d04
Create Date: 2026-09-24 20:42:03.557059

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b602e483853e'
down_revision: Union[str, Sequence[str], None] = '951125b76d04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
