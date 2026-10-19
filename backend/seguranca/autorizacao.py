import hashlib
import hmac
import time
from functools import wraps

from flask import current_app, g, jsonify, session

from models.empresa import Empresa
from models.enums import StatusUsuario
from models.perfil_profissional import PerfilProfissional
from models.usuario import Usuario


# Tempo máximo de uma sessão desde o login,
# mesmo que ela continue sendo usada.
DURACAO_MAXIMA_SESSAO_SEGUNDOS = 8 * 60 * 60


def gerar_impressao_senha(usuario):
    """
    Impressão derivada do senha_hash atual
    (HMAC-SHA256 com a SECRET_KEY).

    Não contém a senha nem o próprio hash e
    muda sempre que a senha é alterada.
    """
    return hmac.new(
        str(
            current_app.config["SECRET_KEY"]
        ).encode("utf-8"),
        str(
            usuario.senha_hash or ""
        ).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def iniciar_sessao(usuario):
    """
    Cria uma sessão nova para o usuário.

    session.clear() antes de gravar os dados
    impede session fixation.
    """
    session.clear()

    session["usuario_id"] = usuario.id

    session["impressao_senha"] = (
        gerar_impressao_senha(usuario)
    )

    session["login_em"] = int(
        time.time()
    )

    session.permanent = True


def obter_usuario_autenticado():
    """
    Retorna o usuário autenticado da sessão atual.

    Retorna None (e limpa a sessão) se a sessão não
    existir, o usuário não existir, a conta estiver
    inativa, a senha tiver sido alterada depois do
    login ou o login tiver mais de 8 horas.
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

    impressao_senha = session.get(
        "impressao_senha"
    )

    if (
        not isinstance(impressao_senha, str)
        or not hmac.compare_digest(
            impressao_senha,
            gerar_impressao_senha(usuario),
        )
    ):
        session.clear()
        return None

    login_em = session.get("login_em")

    if (
        not isinstance(login_em, int)
        or isinstance(login_em, bool)
        or time.time() - login_em
        > DURACAO_MAXIMA_SESSAO_SEGUNDOS
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


def exigir_proprio_perfil(funcao):
    """
    Permite que somente o estudante dono do
    perfil profissional altere o perfil e os
    arquivos dele (foto e currículo).

    Impede que um usuário manipule o ID de
    outro perfil diretamente pela URL.
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

        if tipo_conta != "estudante":
            return jsonify(
                {
                    "erro": (
                        "Este recurso é exclusivo "
                        "para contas de estudante."
                    ),
                }
            ), 403

        perfil = (
            PerfilProfissional.buscar_por_id(
                kwargs.get("perfil_id")
            )
        )

        if perfil is None:
            return jsonify(
                {
                    "erro": (
                        "Perfil profissional não encontrado."
                    ),
                }
            ), 404

        if (
            perfil.usuario_id !=
            usuario.id
        ):
            return jsonify(
                {
                    "erro": (
                        "Você não possui permissão "
                        "para alterar este perfil."
                    ),
                }
            ), 403

        g.usuario_autenticado = usuario
        g.perfil_autenticado = perfil

        return funcao(
            *args,
            **kwargs,
        )

    return funcao_protegida


def exigir_leitura_perfil(funcao):
    """
    Permite visualizar um perfil profissional,
    a foto e o currículo somente ao estudante
    dono do perfil ou a uma conta empresa.

    Somente leitura: não libera alteração.
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

        perfil = (
            PerfilProfissional.buscar_por_id(
                kwargs.get("perfil_id")
            )
        )

        if perfil is None:
            return jsonify(
                {
                    "erro": (
                        "Perfil profissional não encontrado."
                    ),
                }
            ), 404

        tipo_conta = (
            usuario.tipo_conta.value
            if usuario.tipo_conta
            else None
        )

        eh_dono = (
            perfil.usuario_id ==
            usuario.id
        )

        if (
            not eh_dono
            and tipo_conta != "empresa"
        ):
            return jsonify(
                {
                    "erro": (
                        "Você não possui permissão "
                        "para acessar este perfil."
                    ),
                }
            ), 403

        g.usuario_autenticado = usuario
        g.perfil_autenticado = perfil

        return funcao(
            *args,
            **kwargs,
        )

    return funcao_protegida
