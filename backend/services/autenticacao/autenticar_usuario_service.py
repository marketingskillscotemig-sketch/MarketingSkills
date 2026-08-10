from werkzeug.security import check_password_hash

from models.enums import StatusUsuario
from models.usuario import Usuario


class AutenticarUsuarioService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados de login são obrigatórios."
            )

        email = dados.get("email")
        senha = dados.get("senha")

        if not email or not email.strip():
            raise ValueError(
                "O e-mail é obrigatório."
            )

        if not senha:
            raise ValueError(
                "A senha é obrigatória."
            )

        email = email.strip().lower()

        usuario = Usuario.buscar_por_email(
            email
        )

        if usuario is None:
            raise ValueError(
                "E-mail ou senha inválidos."
            )

        senha_valida = check_password_hash(
            usuario.senha_hash,
            senha,
        )

        if not senha_valida:
            raise ValueError(
                "E-mail ou senha inválidos."
            )

        if usuario.status != StatusUsuario.ATIVO:
            raise PermissionError(
                "Esta conta está inativa."
            )

        return usuario