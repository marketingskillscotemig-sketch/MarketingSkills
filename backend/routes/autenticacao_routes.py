from flask import Blueprint, request
from flask_limiter.util import get_remote_address

from controllers.autenticacao_controller import (
    AutenticacaoController,
)
from extensions import limiter


# Limites contra força bruta e criação de contas
# em massa (excedido: HTTP 429).
#
# Os limites por IP são folgados porque uma sala
# de aula costuma sair pelo mesmo IP. O limite por
# e-mail é o que protege cada conta.
LIMITE_LOGIN_POR_IP = "30 per minute;300 per hour"
LIMITE_LOGIN_POR_EMAIL = "5 per minute;20 per hour"
LIMITE_CADASTRO_POR_IP = "40 per minute;400 per hour"


def chave_login_por_email():
    """
    Chave do limite por e-mail do login.

    Sem e-mail utilizável no corpo, usa o IP.
    """
    dados = request.get_json(
        silent=True
    )

    email = (
        dados.get("email")
        if isinstance(dados, dict)
        else None
    )

    if isinstance(email, str) and email.strip():
        return (
            "login-email:"
            + email.strip().lower()[:180]
        )

    return (
        "login-sem-email:"
        + get_remote_address()
    )


autenticacao_bp = Blueprint(
    "autenticacao",
    __name__,
    url_prefix="/api/autenticacao",
)


autenticacao_bp.get(
    "/csrf"
)(
    AutenticacaoController.token_csrf
)


autenticacao_bp.post(
    "/cadastro"
)(
    limiter.limit(
        LIMITE_CADASTRO_POR_IP
    )(
        AutenticacaoController.cadastrar
    )
)


autenticacao_bp.post(
    "/login"
)(
    limiter.limit(
        LIMITE_LOGIN_POR_IP
    )(
        limiter.limit(
            LIMITE_LOGIN_POR_EMAIL,
            key_func=chave_login_por_email,
        )(
            AutenticacaoController.login
        )
    )
)


autenticacao_bp.get(
    "/sessao"
)(
    AutenticacaoController.sessao
)


autenticacao_bp.post(
    "/logout"
)(
    AutenticacaoController.logout
)