from extensions import db


class ExperienciaProfissional(db.Model):
    __tablename__ = "experiencias_profissionais"

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

    empresa = db.Column(
        db.String(180),
        nullable=False,
    )

    cargo = db.Column(
        db.String(180),
        nullable=False,
    )

    data_inicio = db.Column(
        db.Date,
        nullable=True,
    )

    data_fim = db.Column(
        db.Date,
        nullable=True,
    )

    atual = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    descricao = db.Column(
        db.String(1000),
        nullable=True,
    )

    perfil_profissional = db.relationship(
        "PerfilProfissional",
        back_populates="experiencias_profissionais",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        empresa=None,
        cargo=None,
        data_inicio=None,
        data_fim=None,
        atual=None,
        descricao=None,
    ):
        if empresa is not None:
            self.empresa = empresa

        if cargo is not None:
            self.cargo = cargo

        if data_inicio is not None:
            self.data_inicio = data_inicio

        if data_fim is not None:
            self.data_fim = data_fim

        if atual is not None:
            self.atual = atual

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
            db.select(ExperienciaProfissional)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(
            ExperienciaProfissional,
            id,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "perfilProfissionalId": self.perfil_profissional_id,
            "empresa": self.empresa,
            "cargo": self.cargo,
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
            "atual": self.atual,
            "descricao": self.descricao,
        }