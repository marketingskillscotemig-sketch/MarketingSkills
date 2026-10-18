from flask import Blueprint

from controllers.projeto_controller import (
    ProjetoController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


projeto_bp = Blueprint(
    "projetos",
    __name__,
    url_prefix="/api/projetos",
)


projeto_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        ProjetoController.criar
    )
)

# Empresa: somente leitura da lista (tela de talentos).
projeto_bp.get("")(
    exigir_tipo_conta(
        "estudante",
        "empresa"
    )(
        ProjetoController.listar
    )
)

projeto_bp.get(
    "/<int:projeto_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        ProjetoController.buscar_por_id
    )
)

projeto_bp.put(
    "/<int:projeto_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        ProjetoController.atualizar
    )
)

projeto_bp.delete(
    "/<int:projeto_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        ProjetoController.deletar
    )
)