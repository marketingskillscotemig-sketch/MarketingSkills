from flask import Blueprint

from controllers.etapa_estudo_controller import (
    EtapaEstudoController,
)


etapa_estudo_bp = Blueprint(
    "etapas_estudo",
    __name__,
    url_prefix="/api/etapas-estudo",
)


etapa_estudo_bp.post("")(
    EtapaEstudoController.criar
)

etapa_estudo_bp.get("")(
    EtapaEstudoController.listar
)

etapa_estudo_bp.get(
    "/<int:etapa_id>"
)(
    EtapaEstudoController.buscar_por_id
)

etapa_estudo_bp.put(
    "/<int:etapa_id>"
)(
    EtapaEstudoController.atualizar
)

etapa_estudo_bp.delete(
    "/<int:etapa_id>"
)(
    EtapaEstudoController.deletar
)