from werkzeug.security import generate_password_hash

from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.usuario import Usuario
from repositories.conta_repository import (
    ContaRepository,
)


class AtualizarUsuarioService:
    @staticmethod
    def executar(
        usuario_id,
        dados,
    ):
        usuario = Usuario.buscar_por_id(
            usuario_id
        )

        if usuario is None:
            raise LookupError(
                "Usuário não encontrado."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")
        status = dados.get("status")
        tipo_conta = dados.get(
            "tipoConta"
        )

        if nome is not None:
            nome = nome.strip()

            if len(nome) < 2:
                raise ValueError(
                    "O nome deve possuir pelo menos "
                    "2 caracteres."
                )

        if email is not None:
            email = email.strip().lower()

            if "@" not in email:
                raise ValueError(
                    "Informe um e-mail válido."
                )

            usuario_com_email = (
                ContaRepository.buscar_usuario_por_email(
                    email
                )
            )

            if (
                usuario_com_email is not None
                and usuario_com_email.id
                != usuario.id
            ):
                raise ValueError(
                    "Já existe um usuário com este e-mail."
                )

        senha_hash = None

        if senha is not None:
            if len(senha) < 6:
                raise ValueError(
                    "A senha deve possuir pelo menos "
                    "6 caracteres."
                )

            senha_hash = generate_password_hash(
                senha
            )

        status_enum = None

        if status is not None:
            try:
                status_enum = StatusUsuario(
                    status
                )

            except ValueError as erro:
                raise ValueError(
                    "Status inválido. "
                    "Use 'ativo' ou 'inativo'."
                ) from erro

        tipo_conta_enum = None

        if tipo_conta is not None:
            try:
                tipo_conta_enum = TipoConta(
                    tipo_conta
                )

            except ValueError as erro:
                raise ValueError(
                    "Tipo de conta inválido. "
                    "Use 'estudante' ou 'empresa'."
                ) from erro

        return usuario.atualizar(
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            status=status_enum,
            tipo_conta=tipo_conta_enum,
        )