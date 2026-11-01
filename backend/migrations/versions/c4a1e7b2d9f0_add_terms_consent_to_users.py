"""add terms consent to users

Revision ID: c4a1e7b2d9f0
Revises: 9f347fc9c8c3
Create Date: 2026-10-31 21:30:00.000000

Registra o consentimento dos Termos de Uso e da Política
de Privacidade: data/hora do aceite e versão aceita.
As colunas aceitam vazio para não afetar contas antigas.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4a1e7b2d9f0'
down_revision = '9f347fc9c8c3'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('usuarios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('termos_aceitos_em', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('versao_termos', sa.String(length=20), nullable=True))


def downgrade():
    with op.batch_alter_table('usuarios', schema=None) as batch_op:
        batch_op.drop_column('versao_termos')
        batch_op.drop_column('termos_aceitos_em')
