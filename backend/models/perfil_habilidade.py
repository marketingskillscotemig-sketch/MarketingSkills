from extensions import db
from models.enums import (
    NivelHabilidade,
    enum_values,
)


class PerfilHabilidade(db.Model):
    __tablename__ = "perfil_habilidades"

    id = db.Column(db.Integer, primary_key=True)

    perfil_profissional_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "perfis_profissionais.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    habilidade_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "habilidades.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    nivel_dominio = db.Column(
        db.Enum(
            NivelHabilidade,
            values_callable=enum_values,
            name="nivel_habilidade",
        ),
        nullable=False,
    )

    data_atualizacao = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    __table_args__ = (
        db.UniqueConstraint(
            "perfil_profissional_id",
            "habilidade_id",
            name="uq_perfil_habilidade",
        ),
    )

    perfil_profissional = db.relationship(
        "PerfilProfissional",
        back_populates="habilidades",
    )

    habilidade = db.relationship(
        "Habilidade",
        back_populates="perfis",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(self, nivel_dominio=None):
        if nivel_dominio is not None:
            self.nivel_dominio = nivel_dominio

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(PerfilHabilidade)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(PerfilHabilidade, id)

    def to_dict(self):
        return {
            "id": self.id,
            "perfilProfissionalId": self.perfil_profissional_id,
            "habilidadeId": self.habilidade_id,
            "nivelDominio": (
                self.nivel_dominio.value
                if self.nivel_dominio
                else None
            ),
            "dataAtualizacao": (
                self.data_atualizacao.isoformat()
                if self.data_atualizacao
                else None
            ),
        }