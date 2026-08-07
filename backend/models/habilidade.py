from extensions import db
from models.enums import (
    CategoriaHabilidade,
    enum_values,
)


class Habilidade(db.Model):
    __tablename__ = "habilidades"

    id = db.Column(db.Integer, primary_key=True)

    nome = db.Column(
        db.String(120),
        nullable=False,
        unique=True,
        index=True,
    )

    categoria = db.Column(
        db.Enum(
            CategoriaHabilidade,
            values_callable=enum_values,
            name="categoria_habilidade",
        ),
        nullable=False,
    )

    descricao = db.Column(
        db.String(500),
        nullable=True,
    )

    perfis = db.relationship(
        "PerfilHabilidade",
        back_populates="habilidade",
        cascade="all, delete-orphan",
    )

    requisitos_vaga = db.relationship(
        "RequisitoVaga",
        back_populates="habilidade",
    )

    planos_estudo = db.relationship(
        "PlanoEstudo",
        secondary="plano_habilidades",
        back_populates="habilidades",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        nome=None,
        categoria=None,
        descricao=None,
    ):
        if nome is not None:
            self.nome = nome

        if categoria is not None:
            self.categoria = categoria

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
            db.select(Habilidade)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(Habilidade, id)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "categoria": (
                self.categoria.value
                if self.categoria
                else None
            ),
            "descricao": self.descricao,
        }