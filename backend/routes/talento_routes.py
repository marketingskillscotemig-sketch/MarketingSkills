from flask import Blueprint, session
from flask_limiter.util import get_remote_address

from controllers.talento_controller import (
    TalentoController,
)
from extensions import limiter
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


# O e-mail do talento é entregue um por vez e com
# limite por usuário, para evitar coleta em massa.
LIMITE_CONTATO_TALENTO = "30 per minute;300 per day"


def chave_contato_por_usuario():
    usuario_id = session.get("usuario_id")

    if usuario_id is None:
        return (
            "contato-talento-ip:"
            + get_remote_address()
        )

    return (
        "contato-talento:"
        + str(usuario_id)
    )


talento_bp = Blueprint(
    "talentos",
    __name__,
    url_prefix="/api/talentos",
)


talento_bp.get("")(
    exigir_tipo_conta(
        "empresa"
    )(
        TalentoController.listar
    )
)


talento_bp.get(
    "/ranking"
)(
    exigir_tipo_conta(
        "empresa"
    )(
        TalentoController.ranking_por_vaga
    )
)


talento_bp.get(
    "/<int:usuario_id>/contato"
)(
    limiter.limit(
        LIMITE_CONTATO_TALENTO,
        key_func=chave_contato_por_usuario,
    )(
        exigir_tipo_conta(
            "empresa"
        )(
            TalentoController.contato
        )
    )
)