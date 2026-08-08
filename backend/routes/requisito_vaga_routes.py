from flask import Blueprint

from controllers.requisito_vaga_controller import (
    RequisitoVagaController,
)


requisito_vaga_bp = Blueprint(
    "requisitos_vaga",
    __name__,
    url_prefix="/api/requisitos-vaga",
)


requisito_vaga_bp.post("")(
    RequisitoVagaController.criar
)

requisito_vaga_bp.get("")(
    RequisitoVagaController.listar
)

requisito_vaga_bp.get(
    "/<int:requisito_id>"
)(
    RequisitoVagaController.buscar_por_id
)

requisito_vaga_bp.put(
    "/<int:requisito_id>"
)(
    RequisitoVagaController.atualizar
)

requisito_vaga_bp.delete(
    "/<int:requisito_id>"
)(
    RequisitoVagaController.deletar
)