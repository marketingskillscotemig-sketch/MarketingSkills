from extensions import db


class Empresa(db.Model):
    __tablename__ = "empresas"

    id = db.Column(db.Integer, primary_key=True)

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

    vagas = db.relationship(
        "Vaga",
        back_populates="empresa",
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
        return db.session.get(Empresa, id)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "setor": self.setor,
            "descricao": self.descricao,
            "site": self.site,
        }