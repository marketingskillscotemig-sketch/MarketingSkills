from flask import Blueprint

from controllers.tendencia_mercado_controller import (
    TendenciaMercadoController,
)


tendencia_mercado_bp = Blueprint(
    "tendencias_mercado",
    __name__,
    url_prefix="/api/tendencias-mercado",
)


tendencia_mercado_bp.post("")(
    TendenciaMercadoController.criar
)

tendencia_mercado_bp.get("")(
    TendenciaMercadoController.listar
)

tendencia_mercado_bp.get(
    "/<int:tendencia_id>"
)(
    TendenciaMercadoController.buscar_por_id
)

tendencia_mercado_bp.put(
    "/<int:tendencia_id>"
)(
    TendenciaMercadoController.atualizar
)

tendencia_mercado_bp.delete(
    "/<int:tendencia_id>"
)(
    TendenciaMercadoController.deletar
)