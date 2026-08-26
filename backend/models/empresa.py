from extensions import db


class Empresa(db.Model):
    __tablename__ = "empresas"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "usuarios.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    nome = db.Column(
        db.String(150),
        nullable=False,
    )

    setor = db.Column(
        db.String(120),
        nullable=True,
    )

    descricao = db.Column(
        db.String(500),
        nullable=True,
    )

    site = db.Column(
        db.String(255),
        nullable=True,
    )

    usuario = db.relationship(
        "Usuario",
        back_populates="empresa",
    )

    vagas = db.relationship(
        "Vaga",
        back_populates="empresa",
        cascade="all, delete-orphan",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        nome=None,
        setor=None,
        descricao=None,
        site=None,
    ):
        if nome is not None:
            self.nome = nome

        if setor is not None:
            self.setor = setor

        if descricao is not None:
            self.descricao = descricao

        if site is not None:
            self.site = site

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(Empresa)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(
            Empresa,
            id,
        )

    @staticmethod
    def buscar_por_usuario_id(
        usuario_id
    ):
        return db.session.execute(
            db.select(Empresa).where(
                Empresa.usuario_id ==
                usuario_id
            )
        ).scalar_one_or_none()

    def to_dict(self):
        return {
            "id": self.id,
            "usuarioId": self.usuario_id,
            "nome": self.nome,
            "setor": self.setor,
            "descricao": self.descricao,
            "site": self.site,
        }