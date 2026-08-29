from extensions import db
from models.empresa import Empresa
from models.usuario import Usuario


class ContaRepository:
    @staticmethod
    def buscar_usuario_por_email(email):
        return db.session.execute(
            db.select(Usuario).where(
                Usuario.email == email
            )
        ).scalar_one_or_none()

    @staticmethod
    def buscar_empresa_por_cnpj(cnpj):
        return db.session.execute(
            db.select(Empresa).where(
                Empresa.cnpj == cnpj
            )
        ).scalar_one_or_none()
