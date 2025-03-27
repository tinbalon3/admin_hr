"""initial Migration

Revision ID: de9b885f3bde
Revises: 
Create Date: 2025-03-24 14:15:42.655074

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'de9b885f3bde'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('employee',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password', sa.String(), nullable=False),
    sa.Column('phone', sa.String(), nullable=False),
    sa.Column('location', sa.String(), nullable=False),
    sa.Column('role', sa.Enum('EMPLOYEE', 'ADMIN', 'INTERN', name='user_roles'), server_default='EMPLOYEE', nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employee_email'), 'employee', ['email'], unique=True)
    op.create_table('leave_types',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('type_name', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('type_name')
    )
    op.create_table('leave_requests',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('employee_id', sa.UUID(), nullable=False),
    sa.Column('leave_type_id', sa.UUID(), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', name='leave_status'), server_default='PENDING', nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    sa.ForeignKeyConstraint(['employee_id'], ['employee.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['leave_type_id'], ['leave_types.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('work_schedules',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('employee_id', sa.UUID(), nullable=False),
    sa.Column('week_number', sa.String(), nullable=False),
    sa.Column('start_month', sa.String(), nullable=False),
    sa.Column('start_year', sa.String(), nullable=False),
    sa.Column('work_days', postgresql.JSON(astext_type=sa.Text()), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['employee_id'], ['employee.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('approvals',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('leave_request_id', sa.UUID(), nullable=False),
    sa.Column('employee_id', sa.UUID(), nullable=False),
    sa.Column('decision', sa.Enum('APPROVED', 'REJECTED', name='approval_decisions'), nullable=False),
    sa.Column('decision_date', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    sa.Column('comments', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['employee_id'], ['employee.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['leave_request_id'], ['leave_requests.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('approvals')
    op.drop_table('work_schedules')
    op.drop_table('leave_requests')
    op.drop_table('leave_types')
    op.drop_index(op.f('ix_employee_email'), table_name='employee')
    op.drop_table('employee')
    # ### end Alembic commands ###
