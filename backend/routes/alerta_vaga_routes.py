from flask import Blueprint

from controllers.alerta_vaga_controller import (
    AlertaVagaController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


alerta_vaga_bp = Blueprint(
    "alertas_vaga",
    __name__,
    url_prefix="/api/alertas-vaga",
)


alerta_vaga_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        AlertaVagaController.criar
    )
)

alerta_vaga_bp.get("")(
    exigir_tipo_conta(
        "estudante"
    )(
        AlertaVagaController.listar
    )
)

alerta_vaga_bp.get(
    "/<int:alerta_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        AlertaVagaController.buscar_por_id
    )
)

alerta_vaga_bp.put(
    "/<int:alerta_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        AlertaVagaController.atualizar
    )
)

alerta_vaga_bp.delete(
    "/<int:alerta_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        AlertaVagaController.deletar
    )
)