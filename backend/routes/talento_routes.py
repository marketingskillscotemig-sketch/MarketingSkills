from flask import Blueprint

from controllers.talento_controller import (
    TalentoController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
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