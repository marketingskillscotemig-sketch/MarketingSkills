from flask import Blueprint

from controllers.tendencia_mercado_controller import (
    TendenciaMercadoController,
)


tendencia_mercado_bp = Blueprint(
    "tendencias_mercado",
    __name__,
    url_prefix="/api/tendencias-mercado",
)


# Catálogo somente leitura pela API: as rotas de
# escrita (POST, PUT e DELETE) foram removidas por
# não existir perfil administrativo. O catálogo é
# mantido diretamente no banco de dados.
tendencia_mercado_bp.get("")(
    TendenciaMercadoController.listar
)

tendencia_mercado_bp.get(
    "/<int:tendencia_id>"
)(
    TendenciaMercadoController.buscar_por_id
)