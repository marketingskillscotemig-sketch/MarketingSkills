from flask import Blueprint

from controllers.habilidade_controller import (
    HabilidadeController,
)


habilidade_bp = Blueprint(
    "habilidades",
    __name__,
    url_prefix="/api/habilidades",
)


# Catálogo somente leitura pela API: as rotas de
# escrita (POST, PUT e DELETE) foram removidas por
# não existir perfil administrativo. O catálogo é
# mantido diretamente no banco de dados.
habilidade_bp.get("")(
    HabilidadeController.listar
)

habilidade_bp.get("/<int:habilidade_id>")(
    HabilidadeController.buscar_por_id
)