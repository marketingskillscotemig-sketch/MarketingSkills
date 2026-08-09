from flask import Blueprint

from controllers.alerta_vaga_controller import (
    AlertaVagaController,
)


alerta_vaga_bp = Blueprint(
    "alertas_vaga",
    __name__,
    url_prefix="/api/alertas-vaga",
)


alerta_vaga_bp.post("")(
    AlertaVagaController.criar
)

alerta_vaga_bp.get("")(
    AlertaVagaController.listar
)

alerta_vaga_bp.get(
    "/<int:alerta_id>"
)(
    AlertaVagaController.buscar_por_id
)

alerta_vaga_bp.put(
    "/<int:alerta_id>"
)(
    AlertaVagaController.atualizar
)

alerta_vaga_bp.delete(
    "/<int:alerta_id>"
)(
    AlertaVagaController.deletar
)