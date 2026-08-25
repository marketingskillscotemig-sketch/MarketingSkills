from extensions import db


class Projeto(db.Model):
    __tablename__ = "projetos"

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

    nome = db.Column(
        db.String(180),
        nullable=False,
    )

    descricao = db.Column(
        db.String(1000),
        nullable=True,
    )

    tecnologias = db.Column(
        db.String(255),
        nullable=True,
    )

    link = db.Column(
        db.String(500),
        nullable=True,
    )

    perfil_profissional = db.relationship(
        "PerfilProfissional",
        back_populates="projetos",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        nome=None,
        descricao=None,
        tecnologias=None,
        link=None,
    ):
        if nome is not None:
            self.nome = nome

        if descricao is not None:
            self.descricao = descricao

        if tecnologias is not None:
            self.tecnologias = tecnologias

        if link is not None:
            self.link = link

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(Projeto)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(
            Projeto,
            id,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "perfilProfissionalId": self.perfil_profissional_id,
            "nome": self.nome,
            "descricao": self.descricao,
            "tecnologias": self.tecnologias,
            "link": self.link,
        }