from extensions import db


class FormacaoAcademica(db.Model):
    __tablename__ = "formacoes_academicas"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    perfil_profissional_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "perfis_profissionais.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    instituicao = db.Column(
        db.String(180),
        nullable=False,
    )

    curso = db.Column(
        db.String(180),
        nullable=False,
    )

    tipo_formacao = db.Column(
        db.String(80),
        nullable=True,
    )

    data_inicio = db.Column(
        db.Date,
        nullable=True,
    )

    data_fim = db.Column(
        db.Date,
        nullable=True,
    )

    em_andamento = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    descricao = db.Column(
        db.String(500),
        nullable=True,
    )

    perfil_profissional = db.relationship(
        "PerfilProfissional",
        back_populates="formacoes_academicas",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        instituicao=None,
        curso=None,
        tipo_formacao=None,
        data_inicio=None,
        data_fim=None,
        em_andamento=None,
        descricao=None,
    ):
        if instituicao is not None:
            self.instituicao = instituicao

        if curso is not None:
            self.curso = curso

        if tipo_formacao is not None:
            self.tipo_formacao = tipo_formacao

        if data_inicio is not None:
            self.data_inicio = data_inicio

        if data_fim is not None:
            self.data_fim = data_fim

        if em_andamento is not None:
            self.em_andamento = em_andamento

        if descricao is not None:
            self.descricao = descricao

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(FormacaoAcademica)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(
            FormacaoAcademica,
            id,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "perfilProfissionalId": self.perfil_profissional_id,
            "instituicao": self.instituicao,
            "curso": self.curso,
            "tipoFormacao": self.tipo_formacao,
            "dataInicio": (
                self.data_inicio.isoformat()
                if self.data_inicio
                else None
            ),
            "dataFim": (
                self.data_fim.isoformat()
                if self.data_fim
                else None
            ),
            "emAndamento": self.em_andamento,
            "descricao": self.descricao,
        }