from datetime import date

from extensions import db


class Notificacao(db.Model):
    __tablename__ = "notificacoes"

    id = db.Column(db.Integer, primary_key=True)

    alerta_vaga_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "alertas_vaga.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    titulo = db.Column(
        db.String(180),
        nullable=False,
    )

    mensagem = db.Column(
        db.String(500),
        nullable=False,
    )

    data_envio = db.Column(
        db.Date,
        nullable=False,
        default=date.today,
    )

    lida = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    alerta_vaga = db.relationship(
        "AlertaVaga",
        back_populates="notificacoes",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        titulo=None,
        mensagem=None,
        lida=None,
    ):
        if titulo is not None:
            self.titulo = titulo

        if mensagem is not None:
            self.mensagem = mensagem

        if lida is not None:
            self.lida = lida

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(Notificacao)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(Notificacao, id)

    def to_dict(self):
        return {
            "id": self.id,
            "alertaVagaId": self.alerta_vaga_id,
            "titulo": self.titulo,
            "mensagem": self.mensagem,
            "dataEnvio": (
                self.data_envio.isoformat()
                if self.data_envio
                else None
            ),
            "lida": self.lida,
        }