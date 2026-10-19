from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from models.enums import StatusUsuario
from repositories.conta_repository import (
    ContaRepository,
)


# Hash fixo usado quando o e-mail não existe: o login
# gasta o mesmo tempo com e sem conta cadastrada e
# não revela quais e-mails existem.
_HASH_FICTICIO = generate_password_hash(
    "senha-ficticia-para-comparacao-de-tempo"
)


class AutenticarUsuarioService:
    @staticmethod
    def executar(dados):
        if not dados or not isinstance(dados, dict):
            raise ValueError(
                "Os dados de login são obrigatórios."
            )

        email = dados.get("email")
        senha = dados.get("senha")

        if not email or (
            isinstance(email, str)
            and not email.strip()
        ):
            raise ValueError(
                "O e-mail é obrigatório."
            )

        if not senha:
            raise ValueError(
                "A senha é obrigatória."
            )

        if (
            not isinstance(email, str)
            or not isinstance(senha, str)
        ):
            raise ValueError(
                "E-mail ou senha inválidos."
            )

        email = email.strip().lower()

        usuario = ContaRepository.buscar_usuario_por_email(
            email
        )

        if usuario is None:
            check_password_hash(
                _HASH_FICTICIO,
                senha,
            )

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