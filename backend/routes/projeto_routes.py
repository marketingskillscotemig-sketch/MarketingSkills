from flask import Blueprint

from controllers.projeto_controller import (
    ProjetoController,
)


projeto_bp = Blueprint(
    "projetos",
    __name__,
    url_prefix="/api/projetos",
)


projeto_bp.post("")(
    ProjetoController.criar
)

projeto_bp.get("")(
    ProjetoController.listar
)

projeto_bp.get(
    "/<int:projeto_id>"
)(
    ProjetoController.buscar_por_id
)

projeto_bp.put(
    "/<int:projeto_id>"
)(
    ProjetoController.atualizar
)

projeto_bp.delete(
    "/<int:projeto_id>"
)(
    ProjetoController.deletar
)