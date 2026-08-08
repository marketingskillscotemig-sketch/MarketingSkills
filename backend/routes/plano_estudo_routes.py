from flask import Blueprint

from controllers.plano_estudo_controller import (
    PlanoEstudoController,
)


plano_estudo_bp = Blueprint(
    "planos_estudo",
    __name__,
    url_prefix="/api/planos-estudo",
)


plano_estudo_bp.post("")(
    PlanoEstudoController.criar
)

plano_estudo_bp.get("")(
    PlanoEstudoController.listar
)

plano_estudo_bp.get(
    "/<int:plano_id>"
)(
    PlanoEstudoController.buscar_por_id
)

plano_estudo_bp.put(
    "/<int:plano_id>"
)(
    PlanoEstudoController.atualizar
)

plano_estudo_bp.delete(
    "/<int:plano_id>"
)(
    PlanoEstudoController.deletar
)