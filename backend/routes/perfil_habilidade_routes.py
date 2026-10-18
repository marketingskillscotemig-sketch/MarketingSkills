from flask import Blueprint

from controllers.perfil_habilidade_controller import (
    PerfilHabilidadeController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


perfil_habilidade_bp = Blueprint(
    "perfil_habilidades",
    __name__,
    url_prefix="/api/perfil-habilidades",
)


perfil_habilidade_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        PerfilHabilidadeController.criar
    )
)

# Empresa: somente leitura da lista (Talentos e Vagas).
perfil_habilidade_bp.get("")(
    exigir_tipo_conta(
        "estudante",
        "empresa"
    )(
        PerfilHabilidadeController.listar
    )
)

perfil_habilidade_bp.get(
    "/<int:perfil_habilidade_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PerfilHabilidadeController.buscar_por_id
    )
)

perfil_habilidade_bp.put(
    "/<int:perfil_habilidade_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PerfilHabilidadeController.atualizar
    )
)

perfil_habilidade_bp.delete(
    "/<int:perfil_habilidade_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PerfilHabilidadeController.deletar
    )
)