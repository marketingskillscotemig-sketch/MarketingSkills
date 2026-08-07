from datetime import date

from extensions import db
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
    StatusVaga,
    enum_values,
)


class Vaga(db.Model):
    __tablename__ = "vagas"

    id = db.Column(db.Integer, primary_key=True)

    empresa_id = db.Column(
        db.Integer,
        db.ForeignKey("empresas.id"),
        nullable=False,
        index=True,
    )

    titulo = db.Column(
        db.String(180),
        nullable=False,
    )

    descricao = db.Column(
        db.Text,
        nullable=True,
    )

    nivel_experiencia = db.Column(
        db.Enum(
            NivelExperiencia,
            values_callable=enum_values,
            name="nivel_experiencia_vaga",
        ),
        nullable=False,
    )

    modalidade = db.Column(
        db.Enum(
            ModalidadeTrabalho,
            values_callable=enum_values,
            name="modalidade_vaga",
        ),
        nullable=False,
    )

    localizacao = db.Column(
        db.String(150),
        nullable=True,
    )

    salario_minimo = db.Column(
        db.Numeric(12, 2),
        nullable=True,
    )

    salario_maximo = db.Column(
        db.Numeric(12, 2),
        nullable=True,
    )

    data_publicacao = db.Column(
        db.Date,
        nullable=False,
        default=date.today,
    )

    status = db.Column(
        db.Enum(
            StatusVaga,
            values_callable=enum_values,
            name="status_vaga",
        ),
        nullable=False,
        default=StatusVaga.ATIVA,
    )

    empresa = db.relationship(
        "Empresa",
        back_populates="vagas",
    )

    requisitos = db.relationship(
        "RequisitoVaga",
        back_populates="vaga",
        cascade="all, delete-orphan",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        empresa_id=None,
        titulo=None,
        descricao=None,
        nivel_experiencia=None,
        modalidade=None,
        localizacao=None,
        salario_minimo=None,
        salario_maximo=None,
        data_publicacao=None,
        status=None,
    ):
        if empresa_id is not None:
            self.empresa_id = empresa_id

        if titulo is not None:
            self.titulo = titulo

        if descricao is not None:
            self.descricao = descricao

        if nivel_experiencia is not None:
            self.nivel_experiencia = nivel_experiencia

        if modalidade is not None:
            self.modalidade = modalidade

        if localizacao is not None:
            self.localizacao = localizacao

        if salario_minimo is not None:
            self.salario_minimo = salario_minimo

        if salario_maximo is not None:
            self.salario_maximo = salario_maximo

        if data_publicacao is not None:
            self.data_publicacao = data_publicacao

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
            db.select(Vaga)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(Vaga, id)

    def to_dict(self):
        return {
            "id": self.id,
            "empresaId": self.empresa_id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "nivelExperiencia": (
                self.nivel_experiencia.value
                if self.nivel_experiencia
                else None
            ),
            "modalidade": (
                self.modalidade.value
                if self.modalidade
                else None
            ),
            "localizacao": self.localizacao,
            "salarioMinimo": (
                float(self.salario_minimo)
                if self.salario_minimo is not None
                else None
            ),
            "salarioMaximo": (
                float(self.salario_maximo)
                if self.salario_maximo is not None
                else None
            ),
            "dataPublicacao": (
                self.data_publicacao.isoformat()
                if self.data_publicacao
                else None
            ),
            "status": (
                self.status.value
                if self.status
                else None
            ),
        }