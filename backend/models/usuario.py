from datetime import date

from extensions import db
from models.enums import StatusUsuario, enum_values


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)

    nome = db.Column(
        db.String(120),
        nullable=False,
    )

    email = db.Column(
        db.String(180),
        nullable=False,
        unique=True,
        index=True,
    )

    senha_hash = db.Column(
        db.String(255),
        nullable=False,
    )

    data_cadastro = db.Column(
        db.Date,
        nullable=False,
        default=date.today,
    )

    status = db.Column(
        db.Enum(
            StatusUsuario,
            values_callable=enum_values,
            name="status_usuario",
        ),
        nullable=False,
        default=StatusUsuario.ATIVO,
    )

    perfil_profissional = db.relationship(
        "PerfilProfissional",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan",
    )

    planos_estudo = db.relationship(
        "PlanoEstudo",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )

    alertas_vaga = db.relationship(
        "AlertaVaga",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        nome=None,
        email=None,
        senha_hash=None,
        status=None,
    ):
        if nome is not None:
            self.nome = nome

        if email is not None:
            self.email = email

        if senha_hash is not None:
            self.senha_hash = senha_hash

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
            db.select(Usuario)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(Usuario, id)

    @staticmethod
    def buscar_por_email(email):
        return db.session.execute(
            db.select(Usuario).where(
                Usuario.email == email
            )
        ).scalar_one_or_none()

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "dataCadastro": (
                self.data_cadastro.isoformat()
                if self.data_cadastro
                else None
            ),
            "status": (
                self.status.value
                if self.status
                else None
            ),
        }