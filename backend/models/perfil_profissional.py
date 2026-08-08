from extensions import db
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
    enum_values,
)


class PerfilProfissional(db.Model):
    __tablename__ = "perfis_profissionais"

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "usuarios.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    nivel_experiencia = db.Column(
        db.Enum(
            NivelExperiencia,
            values_callable=enum_values,
            name="nivel_experiencia",
        ),
        nullable=True,
    )

    objetivo_profissional = db.Column(
        db.String(255),
        nullable=True,
    )

    modalidade_preferida = db.Column(
        db.Enum(
            ModalidadeTrabalho,
            values_callable=enum_values,
            name="modalidade_trabalho",
        ),
        nullable=True,
    )

    localizacao_preferida = db.Column(
        db.String(150),
        nullable=True,
    )

    horas_semanais_estudo = db.Column(
        db.Integer,
        nullable=True,
    )

    pretensao_salarial = db.Column(
        db.Numeric(12, 2),
        nullable=True,
    )

    usuario = db.relationship(
        "Usuario",
        back_populates="perfil_profissional",
    )

    habilidades = db.relationship(
        "PerfilHabilidade",
        back_populates="perfil_profissional",
        cascade="all, delete-orphan",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        nivel_experiencia=None,
        objetivo_profissional=None,
        modalidade_preferida=None,
        localizacao_preferida=None,
        horas_semanais_estudo=None,
        pretensao_salarial=None,
    ):
        if nivel_experiencia is not None:
            self.nivel_experiencia = nivel_experiencia

        if objetivo_profissional is not None:
            self.objetivo_profissional = objetivo_profissional

        if modalidade_preferida is not None:
            self.modalidade_preferida = modalidade_preferida

        if localizacao_preferida is not None:
            self.localizacao_preferida = localizacao_preferida

        if horas_semanais_estudo is not None:
            self.horas_semanais_estudo = horas_semanais_estudo

        if pretensao_salarial is not None:
            self.pretensao_salarial = pretensao_salarial

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(PerfilProfissional)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(PerfilProfissional, id)

    @staticmethod
    def buscar_por_usuario_id(usuario_id):
        return db.session.execute(
            db.select(PerfilProfissional).where(
                PerfilProfissional.usuario_id == usuario_id
            )
        ).scalar_one_or_none()

    def to_dict(self):
        return {
            "id": self.id,
            "usuarioId": self.usuario_id,
            "nivelExperiencia": (
                self.nivel_experiencia.value
                if self.nivel_experiencia
                else None
            ),
            "objetivoProfissional": self.objetivo_profissional,
            "modalidadePreferida": (
                self.modalidade_preferida.value
                if self.modalidade_preferida
                else None
            ),
            "localizacaoPreferida": self.localizacao_preferida,
            "horasSemanaisEstudo": self.horas_semanais_estudo,
            "pretensaoSalarial": (
                float(self.pretensao_salarial)
                if self.pretensao_salarial is not None
                else None
            ),
        }