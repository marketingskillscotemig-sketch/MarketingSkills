from flask import Blueprint

from controllers.etapa_estudo_controller import (
    EtapaEstudoController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


etapa_estudo_bp = Blueprint(
    "etapas_estudo",
    __name__,
    url_prefix="/api/etapas-estudo",
)


etapa_estudo_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        EtapaEstudoController.criar
    )
)

etapa_estudo_bp.get("")(
    exigir_tipo_conta(
        "estudante"
    )(
        EtapaEstudoController.listar
    )
)

etapa_estudo_bp.get(
    "/<int:etapa_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        EtapaEstudoController.buscar_por_id
    )
)

etapa_estudo_bp.put(
    "/<int:etapa_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        EtapaEstudoController.atualizar
    )
)

etapa_estudo_bp.delete(
    "/<int:etapa_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        EtapaEstudoController.deletar
    )
)