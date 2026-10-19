from flask import Blueprint

from controllers.plano_estudo_controller import (
    PlanoEstudoController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


plano_estudo_bp = Blueprint(
    "planos_estudo",
    __name__,
    url_prefix="/api/planos-estudo",
)


plano_estudo_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        PlanoEstudoController.criar
    )
)

plano_estudo_bp.get("")(
    exigir_tipo_conta(
        "estudante"
    )(
        PlanoEstudoController.listar
    )
)

plano_estudo_bp.get(
    "/<int:plano_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PlanoEstudoController.buscar_por_id
    )
)

plano_estudo_bp.put(
    "/<int:plano_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PlanoEstudoController.atualizar
    )
)

plano_estudo_bp.delete(
    "/<int:plano_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PlanoEstudoController.deletar
    )
)