from flask import Blueprint

from controllers.notificacao_controller import (
    NotificacaoController,
)


notificacao_bp = Blueprint(
    "notificacoes",
    __name__,
    url_prefix="/api/notificacoes",
)


notificacao_bp.post("")(
    NotificacaoController.criar
)

notificacao_bp.get("")(
    NotificacaoController.listar
)

notificacao_bp.get(
    "/<int:notificacao_id>"
)(
    NotificacaoController.buscar_por_id
)

notificacao_bp.put(
    "/<int:notificacao_id>"
)(
    NotificacaoController.atualizar
)

notificacao_bp.delete(
    "/<int:notificacao_id>"
)(
    NotificacaoController.deletar
)