from extensions import db
from models.enums import NivelHabilidade, enum_values


class RequisitoVaga(db.Model):
    __tablename__ = "requisitos_vaga"

    id = db.Column(db.Integer, primary_key=True)

    vaga_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "vagas.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    habilidade_id = db.Column(
        db.Integer,
        db.ForeignKey("habilidades.id"),
        nullable=False,
        index=True,
    )

    nivel_exigido = db.Column(
        db.Enum(
            NivelHabilidade,
            values_callable=enum_values,
            name="nivel_habilidade_requisito",
        ),
        nullable=False,
    )

    obrigatorio = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
    )

    peso = db.Column(
        db.Numeric(5, 2),
        nullable=True,
    )

    descricao = db.Column(
        db.String(500),
        nullable=True,
    )

    vaga = db.relationship(
        "Vaga",
        back_populates="requisitos",
    )

    habilidade = db.relationship(
        "Habilidade",
        back_populates="requisitos_vaga",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        habilidade_id=None,
        nivel_exigido=None,
        obrigatorio=None,
        peso=None,
        descricao=None,
    ):
        if habilidade_id is not None:
            self.habilidade_id = habilidade_id

        if nivel_exigido is not None:
            self.nivel_exigido = nivel_exigido

        if obrigatorio is not None:
            self.obrigatorio = obrigatorio

        if peso is not None:
            self.peso = peso

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
            db.select(RequisitoVaga)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(RequisitoVaga, id)

    def to_dict(self):
        return {
            "id": self.id,
            "vagaId": self.vaga_id,
            "habilidadeId": self.habilidade_id,
            "nivelExigido": (
                self.nivel_exigido.value
                if self.nivel_exigido
                else None
            ),
            "obrigatorio": self.obrigatorio,
            "peso": (
                float(self.peso)
                if self.peso is not None
                else None
            ),
            "descricao": self.descricao,
        }