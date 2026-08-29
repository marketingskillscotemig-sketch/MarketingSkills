from extensions import db
from models.enums import StatusEtapa, enum_values


class EtapaEstudo(db.Model):
    __tablename__ = "etapas_estudo"

    id = db.Column(db.Integer, primary_key=True)

    plano_estudo_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "planos_estudo.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    titulo = db.Column(
        db.String(180),
        nullable=False,
    )

    descricao = db.Column(
        db.String(500),
        nullable=True,
    )

    ordem = db.Column(
        db.Integer,
        nullable=False,
    )

    carga_horaria_estimada = db.Column(
        db.Integer,
        nullable=True,
    )

    data_inicio_prevista = db.Column(
        db.Date,
        nullable=True,
    )

    data_conclusao = db.Column(
        db.Date,
        nullable=True,
    )

    status = db.Column(
        db.Enum(
            StatusEtapa,
            values_callable=enum_values,
            name="status_etapa",
        ),
        nullable=False,
        default=StatusEtapa.PENDENTE,
    )

    plano_estudo = db.relationship(
        "PlanoEstudo",
        back_populates="etapas",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        titulo=None,
        descricao=None,
        ordem=None,
        carga_horaria_estimada=None,
        data_inicio_prevista=None,
        data_conclusao=None,
        status=None,
    ):
        if titulo is not None:
            self.titulo = titulo

        if descricao is not None:
            self.descricao = descricao

        if ordem is not None:
            self.ordem = ordem

        if carga_horaria_estimada is not None:
            self.carga_horaria_estimada = carga_horaria_estimada

        if data_inicio_prevista is not None:
            self.data_inicio_prevista = data_inicio_prevista

        if data_conclusao is not None:
            self.data_conclusao = data_conclusao

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
            db.select(EtapaEstudo)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(EtapaEstudo, id)

    def to_dict(self):
        return {
            "id": self.id,
            "planoEstudoId": self.plano_estudo_id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "ordem": self.ordem,
            "cargaHorariaEstimada": self.carga_horaria_estimada,
            "dataInicioPrevista": (
                self.data_inicio_prevista.isoformat()
                if self.data_inicio_prevista
                else None
            ),
            "dataConclusao": (
                self.data_conclusao.isoformat()
                if self.data_conclusao
                else None
            ),
            "status": (
                self.status.value
                if self.status
                else None
            ),
        }