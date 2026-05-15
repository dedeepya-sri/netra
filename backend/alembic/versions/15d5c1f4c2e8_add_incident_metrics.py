"""add incident metrics

Revision ID: 15d5c1f4c2e8
Revises: baef5ca2bffa
Create Date: 2026-05-15 15:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "15d5c1f4c2e8"
down_revision: Union[str, Sequence[str], None] = "baef5ca2bffa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "incidents",
        sa.Column(
            "metrics",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'{}'::json"),
        ),
    )
    op.alter_column("incidents", "metrics", server_default=None)


def downgrade() -> None:
    op.drop_column("incidents", "metrics")
