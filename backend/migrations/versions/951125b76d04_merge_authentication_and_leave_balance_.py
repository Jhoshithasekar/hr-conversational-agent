"""merge authentication and leave balance heads

Revision ID: 951125b76d04
Revises: 8995d8a1d9b5, e7b4c2d9a516
Create Date: 2026-09-24 15:01:13.540180

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '951125b76d04'
down_revision: Union[str, Sequence[str], None] = ('8995d8a1d9b5', 'e7b4c2d9a516')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
