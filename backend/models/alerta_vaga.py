from extensions import db
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
    enum_values,
)


class AlertaVaga(db.Model):
    __tablename__ = "alertas_vaga"

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "usuarios.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    palavra_chave = db.Column(
        db.String(120),
        nullable=True,
    )

    cidade = db.Column(
        db.String(120),
        nullable=True,
    )

    modalidade = db.Column(
        db.Enum(
            ModalidadeTrabalho,
            values_callable=enum_values,
            name="modalidade_alerta",
        ),
        nullable=True,
    )

    nivel_experiencia = db.Column(
        db.Enum(
            NivelExperiencia,
            values_callable=enum_values,
            name="nivel_experiencia_alerta",
        ),
        nullable=True,
    )

    ativo = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
    )

    usuario = db.relationship(
        "Usuario",
        back_populates="alertas_vaga",
    )

    notificacoes = db.relationship(
        "Notificacao",
        back_populates="alerta_vaga",
        cascade="all, delete-orphan",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        palavra_chave=None,
        cidade=None,
        modalidade=None,
        nivel_experiencia=None,
        ativo=None,
    ):
        if palavra_chave is not None:
            self.palavra_chave = palavra_chave

        if cidade is not None:
            self.cidade = cidade

        if modalidade is not None:
            self.modalidade = modalidade

        if nivel_experiencia is not None:
            self.nivel_experiencia = nivel_experiencia

        if ativo is not None:
            self.ativo = ativo

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(AlertaVaga)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(AlertaVaga, id)

    def to_dict(self):
        return {
            "id": self.id,
            "usuarioId": self.usuario_id,
            "palavraChave": self.palavra_chave,
            "cidade": self.cidade,
            "modalidade": (
                self.modalidade.value
                if self.modalidade
                else None
            ),
            "nivelExperiencia": (
                self.nivel_experiencia.value
                if self.nivel_experiencia
                else None
            ),
            "ativo": self.ativo,
        }