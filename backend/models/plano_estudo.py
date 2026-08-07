from datetime import date

from extensions import db
from models.enums import StatusPlano, enum_values


plano_habilidades = db.Table(
    "plano_habilidades",
    db.Column(
        "plano_estudo_id",
        db.Integer,
        db.ForeignKey(
            "planos_estudo.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
    db.Column(
        "habilidade_id",
        db.Integer,
        db.ForeignKey(
            "habilidades.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


class PlanoEstudo(db.Model):
    __tablename__ = "planos_estudo"

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

    titulo = db.Column(
        db.String(180),
        nullable=False,
    )

    objetivo = db.Column(
        db.String(500),
        nullable=True,
    )

    data_criacao = db.Column(
        db.Date,
        nullable=False,
        default=date.today,
    )

    data_inicio = db.Column(
        db.Date,
        nullable=True,
    )

    data_fim_prevista = db.Column(
        db.Date,
        nullable=True,
    )

    percentual_conclusao = db.Column(
        db.Numeric(5, 2),
        nullable=False,
        default=0,
    )

    status = db.Column(
        db.Enum(
            StatusPlano,
            values_callable=enum_values,
            name="status_plano",
        ),
        nullable=False,
        default=StatusPlano.NAO_INICIADO,
    )

    usuario = db.relationship(
        "Usuario",
        back_populates="planos_estudo",
    )

    etapas = db.relationship(
        "EtapaEstudo",
        back_populates="plano_estudo",
        cascade="all, delete-orphan",
        order_by="EtapaEstudo.ordem",
    )

    habilidades = db.relationship(
        "Habilidade",
        secondary=plano_habilidades,
        back_populates="planos_estudo",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        titulo=None,
        objetivo=None,
        data_inicio=None,
        data_fim_prevista=None,
        percentual_conclusao=None,
        status=None,
    ):
        if titulo is not None:
            self.titulo = titulo

        if objetivo is not None:
            self.objetivo = objetivo

        if data_inicio is not None:
            self.data_inicio = data_inicio

        if data_fim_prevista is not None:
            self.data_fim_prevista = data_fim_prevista

        if percentual_conclusao is not None:
            self.percentual_conclusao = percentual_conclusao

        if status is not None:
            self.status = status

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(PlanoEstudo)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(PlanoEstudo, id)

    def to_dict(self):
        return {
            "id": self.id,
            "usuarioId": self.usuario_id,
            "titulo": self.titulo,
            "objetivo": self.objetivo,
            "dataCriacao": (
                self.data_criacao.isoformat()
                if self.data_criacao
                else None
            ),
            "dataInicio": (
                self.data_inicio.isoformat()
                if self.data_inicio
                else None
            ),
            "dataFimPrevista": (
                self.data_fim_prevista.isoformat()
                if self.data_fim_prevista
                else None
            ),
            "percentualConclusao": (
                float(self.percentual_conclusao)
                if self.percentual_conclusao is not None
                else 0
            ),
            "status": (
                self.status.value
                if self.status
                else None
            ),
        }