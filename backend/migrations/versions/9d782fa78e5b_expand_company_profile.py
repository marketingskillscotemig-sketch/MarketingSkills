"""expand company profile

Revision ID: 9d782fa78e5b
Revises: 049179ac8c5c
Create Date: 2026-08-26 20:21:14.684829

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = "9d782fa78e5b"
down_revision = "049179ac8c5c"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table(
        "empresas",
        schema=None,
    ) as batch_op:
        batch_op.add_column(
            sa.Column(
                "razao_social",
                sa.String(length=180),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "cnpj",
                sa.String(length=14),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "porte",
                sa.String(length=50),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "localizacao",
                sa.String(length=150),
                nullable=True,
            )
        )

        # Primeiro entra como nullable para preservar
        # as empresas já existentes no banco.
        batch_op.add_column(
            sa.Column(
                "trabalho_remoto",
                sa.Boolean(),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "linkedin",
                sa.String(length=255),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "stack_tecnologico",
                sa.Text(),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "beneficios",
                sa.Text(),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "logo_url",
                sa.String(length=500),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "banner_url",
                sa.String(length=500),
                nullable=True,
            )
        )

        batch_op.alter_column(
            "descricao",
            existing_type=mysql.VARCHAR(
                collation="utf8mb4_unicode_ci",
                length=500,
            ),
            type_=sa.Text(),
            existing_nullable=True,
        )

        batch_op.create_index(
            batch_op.f(
                "ix_empresas_cnpj"
            ),
            ["cnpj"],
            unique=True,
        )

    # Empresas já existentes passam a ter
    # trabalho remoto como falso.
    op.execute(
        """
        UPDATE empresas
        SET trabalho_remoto = 0
        WHERE trabalho_remoto IS NULL
        """
    )

    # Depois de preencher os registros antigos,
    # a coluna passa a ser obrigatória.
    with op.batch_alter_table(
        "empresas",
        schema=None,
    ) as batch_op:
        batch_op.alter_column(
            "trabalho_remoto",
            existing_type=sa.Boolean(),
            nullable=False,
        )


def downgrade():
    with op.batch_alter_table(
        "empresas",
        schema=None,
    ) as batch_op:
        batch_op.drop_index(
            batch_op.f(
                "ix_empresas_cnpj"
            )
        )

        batch_op.alter_column(
            "descricao",
            existing_type=sa.Text(),
            type_=mysql.VARCHAR(
                collation="utf8mb4_unicode_ci",
                length=500,
            ),
            existing_nullable=True,
        )

        batch_op.drop_column(
            "banner_url"
        )

        batch_op.drop_column(
            "logo_url"
        )

        batch_op.drop_column(
            "beneficios"
        )

        batch_op.drop_column(
            "stack_tecnologico"
        )

        batch_op.drop_column(
            "linkedin"
        )

        batch_op.drop_column(
            "trabalho_remoto"
        )

        batch_op.drop_column(
            "localizacao"
        )

        batch_op.drop_column(
            "porte"
        )

        batch_op.drop_column(
            "cnpj"
        )

        batch_op.drop_column(
            "razao_social"
        )