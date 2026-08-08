from flask import Blueprint

from controllers.perfil_habilidade_controller import (
    PerfilHabilidadeController,
)


perfil_habilidade_bp = Blueprint(
    "perfil_habilidades",
    __name__,
    url_prefix="/api/perfil-habilidades",
)


perfil_habilidade_bp.post("")(
    PerfilHabilidadeController.criar
)

perfil_habilidade_bp.get("")(
    PerfilHabilidadeController.listar
)

perfil_habilidade_bp.get(
    "/<int:perfil_habilidade_id>"
)(
    PerfilHabilidadeController.buscar_por_id
)

perfil_habilidade_bp.put(
    "/<int:perfil_habilidade_id>"
)(
    PerfilHabilidadeController.atualizar
)

perfil_habilidade_bp.delete(
    "/<int:perfil_habilidade_id>"
)(
    PerfilHabilidadeController.deletar
)