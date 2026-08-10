from flask import Blueprint

from controllers.autenticacao_controller import (
    AutenticacaoController,
)


autenticacao_bp = Blueprint(
    "autenticacao",
    __name__,
    url_prefix="/api/autenticacao",
)


autenticacao_bp.post(
    "/cadastro"
)(
    AutenticacaoController.cadastrar
)

autenticacao_bp.post(
    "/login"
)(
    AutenticacaoController.login
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