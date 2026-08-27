from functools import wraps

from flask import g, jsonify, session

from models.empresa import Empresa
from models.enums import StatusUsuario
from models.usuario import Usuario


def obter_usuario_autenticado():
    """
    Retorna o usuário autenticado da sessão atual.

    Se a sessão não existir, o usuário não existir
    ou a conta estiver inativa, retorna None.
    """
    usuario_id = session.get(
        "usuario_id"
    )

    if usuario_id is None:
        return None

    usuario = Usuario.buscar_por_id(
        usuario_id
    )

    if usuario is None:
        session.clear()
        return None

    if (
        usuario.status !=
        StatusUsuario.ATIVO
    ):
        session.clear()
        return None

    return usuario


def exigir_autenticacao(funcao):
    """
    Permite o acesso somente a usuários
    autenticados e ativos.
    """

    @wraps(funcao)
    def funcao_protegida(
        *args,
        **kwargs,
    ):
        usuario = (
            obter_usuario_autenticado()
        )

        if usuario is None:
            return jsonify(
                {
                    "erro": (
                        "Autenticação necessária."
                    ),
                }
            ), 401

        g.usuario_autenticado = usuario

        return funcao(
            *args,
            **kwargs,
        )

    return funcao_protegida


def exigir_tipo_conta(
    *tipos_permitidos,
):
    """
    Permite acesso somente aos tipos
    de conta informados.

    Exemplo:
    @exigir_tipo_conta("empresa")
    """

    def decorador(funcao):
        @wraps(funcao)
        def funcao_protegida(
            *args,
            **kwargs,
        ):
            usuario = (
                obter_usuario_autenticado()
            )

            if usuario is None:
                return jsonify(
                    {
                        "erro": (
                            "Autenticação necessária."
                        ),
                    }
                ), 401

            tipo_conta = (
                usuario.tipo_conta.value
                if usuario.tipo_conta
                else None
            )

            if (
                tipo_conta
                not in tipos_permitidos
            ):
                return jsonify(
                    {
                        "erro": (
                            "Você não possui permissão "
                            "para acessar este recurso."
                        ),
                    }
                ), 403

            g.usuario_autenticado = usuario

            return funcao(
                *args,
                **kwargs,
            )

        return funcao_protegida

    return decorador


def exigir_proprio_usuario(funcao):
    """
    Permite que um usuário acesse somente
    recursos cujo usuario_id seja o dele.

    Impede manipulação manual do ID na URL.
    """

    @wraps(funcao)
    def funcao_protegida(
        *args,
        **kwargs,
    ):
        usuario = (
            obter_usuario_autenticado()
        )

        if usuario is None:
            return jsonify(
                {
                    "erro": (
                        "Autenticação necessária."
                    ),
                }
            ), 401

        usuario_id = kwargs.get(
            "usuario_id"
        )

        if (
            usuario_id is None
            or
            usuario.id != usuario_id
        ):
            return jsonify(
                {
                    "erro": (
                        "Você não possui permissão "
                        "para acessar esta conta."
                    ),
                }
            ), 403

        g.usuario_autenticado = usuario

        return funcao(
            *args,
            **kwargs,
        )

    return funcao_protegida


def exigir_propria_empresa(funcao):
    """
    Permite que somente a própria conta empresarial
    altere recursos da empresa vinculada ao usuário.

    Impede que uma empresa manipule o ID de outra
    empresa diretamente pela URL.
    """

    @wraps(funcao)
    def funcao_protegida(
        *args,
        **kwargs,
    ):
        usuario = (
            obter_usuario_autenticado()
        )

        if usuario is None:
            return jsonify(
                {
                    "erro": (
                        "Autenticação necessária."
                    ),
                }
            ), 401

        tipo_conta = (
            usuario.tipo_conta.value
            if usuario.tipo_conta
            else None
        )

        if tipo_conta != "empresa":
            return jsonify(
                {
                    "erro": (
                        "Este recurso é exclusivo "
                        "para contas empresariais."
                    ),
                }
            ), 403

        empresa_id = kwargs.get(
            "empresa_id"
        )

        empresa = (
            Empresa.buscar_por_id(
                empresa_id
            )
        )

        if empresa is None:
            return jsonify(
                {
                    "erro": (
                        "Empresa não encontrada."
                    ),
                }
            ), 404

        if (
            empresa.usuario_id !=
            usuario.id
        ):
            return jsonify(
                {
                    "erro": (
                        "Você não possui permissão "
                        "para alterar esta empresa."
                    ),
                }
            ), 403

        g.usuario_autenticado = usuario
        g.empresa_autenticada = empresa

        return funcao(
            *args,
            **kwargs,
        )

    return funcao_protegida