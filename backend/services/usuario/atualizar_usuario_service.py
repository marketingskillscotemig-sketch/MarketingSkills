from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.usuario import Usuario
from repositories.conta_repository import (
    ContaRepository,
)
from services.usuario.criar_usuario_service import (
    validar_email,
    validar_nome,
    validar_senha,
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

        if not dados or not isinstance(dados, dict):
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        campos_protegidos = {
            "status",
            "tipoConta",
        }

        campos_recebidos = set(
            dados.keys()
        )

        campos_bloqueados = (
            campos_recebidos
            & campos_protegidos
        )

        if campos_bloqueados:
            raise PermissionError(
                "Você não possui permissão "
                "para alterar o status ou "
                "o tipo da própria conta."
            )

        altera_email = "email" in dados
        altera_senha = "senha" in dados

        # Alterar e-mail ou senha exige a senha
        # atual. Ela só é conferida, nunca salva.
        senha_atual = dados.get("senhaAtual")

        if altera_email or altera_senha:
            if (
                not isinstance(senha_atual, str)
                or not senha_atual
            ):
                raise PermissionError(
                    "Informe a senha atual para "
                    "alterar o e-mail ou a senha."
                )

            if not check_password_hash(
                usuario.senha_hash,
                senha_atual,
            ):
                raise PermissionError(
                    "Senha atual incorreta."
                )

        status = dados.get("status")
        tipo_conta = dados.get(
            "tipoConta"
        )

        nome = None

        if "nome" in dados:
            nome = validar_nome(
                dados.get("nome")
            )

        email = None

        if altera_email:
            email = validar_email(
                dados.get("email")
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

        if altera_senha:
            senha = validar_senha(
                dados.get("senha"),
                (
                    email
                    if email is not None
                    else usuario.email
                ),
            )

            senha_hash = generate_password_hash(
                senha
            )

        elif (
            altera_email
            and senha_atual.strip().lower()
            == email
        ):
            raise ValueError(
                "A senha não pode ser igual ao e-mail."
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