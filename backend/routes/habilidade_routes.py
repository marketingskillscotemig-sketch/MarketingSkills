from flask import Blueprint

from controllers.habilidade_controller import (
    HabilidadeController,
)


habilidade_bp = Blueprint(
    "habilidades",
    __name__,
    url_prefix="/api/habilidades",
)


habilidade_bp.post("")(
    HabilidadeController.criar
)

habilidade_bp.get("")(
    HabilidadeController.listar
)

habilidade_bp.get("/<int:habilidade_id>")(
    HabilidadeController.buscar_por_id
)

habilidade_bp.put("/<int:habilidade_id>")(
    HabilidadeController.atualizar
)

habilidade_bp.delete("/<int:habilidade_id>")(
    HabilidadeController.deletar
)