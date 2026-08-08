from flask import Blueprint

from controllers.perfil_profissional_controller import (
    PerfilProfissionalController,
)


perfil_profissional_bp = Blueprint(
    "perfis_profissionais",
    __name__,
    url_prefix="/api/perfis-profissionais",
)


perfil_profissional_bp.post("")(
    PerfilProfissionalController.criar
)

perfil_profissional_bp.get("")(
    PerfilProfissionalController.listar
)

perfil_profissional_bp.get("/<int:perfil_id>")(
    PerfilProfissionalController.buscar_por_id
)

perfil_profissional_bp.put("/<int:perfil_id>")(
    PerfilProfissionalController.atualizar
)

perfil_profissional_bp.delete("/<int:perfil_id>")(
    PerfilProfissionalController.deletar
)