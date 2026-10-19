from flask import Blueprint

from controllers.notificacao_controller import (
    NotificacaoController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


notificacao_bp = Blueprint(
    "notificacoes",
    __name__,
    url_prefix="/api/notificacoes",
)


notificacao_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        NotificacaoController.criar
    )
)

notificacao_bp.get("")(
    exigir_tipo_conta(
        "estudante"
    )(
        NotificacaoController.listar
    )
)

notificacao_bp.get(
    "/<int:notificacao_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        NotificacaoController.buscar_por_id
    )
)

notificacao_bp.put(
    "/<int:notificacao_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        NotificacaoController.atualizar
    )
)

notificacao_bp.delete(
    "/<int:notificacao_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        NotificacaoController.deletar
    )
)