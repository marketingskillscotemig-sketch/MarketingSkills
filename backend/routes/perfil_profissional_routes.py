from flask import Blueprint

from controllers.perfil_profissional_controller import (
    PerfilProfissionalController,
)
from seguranca.autorizacao import (
    exigir_autenticacao,
    exigir_leitura_perfil,
    exigir_proprio_perfil,
    exigir_tipo_conta,
)


perfil_profissional_bp = Blueprint(
    "perfis_profissionais",
    __name__,
    url_prefix="/api/perfis-profissionais",
)


perfil_profissional_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        PerfilProfissionalController.criar
    )
)

perfil_profissional_bp.get("")(
    exigir_autenticacao(
        PerfilProfissionalController.listar
    )
)

# Perfil do estudante autenticado (ou null).
perfil_profissional_bp.get(
    "/meu"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        PerfilProfissionalController.meu
    )
)

perfil_profissional_bp.get(
    "/<int:perfil_id>"
)(
    exigir_leitura_perfil(
        PerfilProfissionalController.buscar_por_id
    )
)

perfil_profissional_bp.put(
    "/<int:perfil_id>"
)(
    exigir_proprio_perfil(
        PerfilProfissionalController.atualizar
    )
)

perfil_profissional_bp.delete(
    "/<int:perfil_id>"
)(
    exigir_proprio_perfil(
        PerfilProfissionalController.deletar
    )
)


perfil_profissional_bp.post(
    "/<int:perfil_id>/curriculo"
)(
    exigir_proprio_perfil(
        PerfilProfissionalController.enviar_curriculo
    )
)

perfil_profissional_bp.get(
    "/<int:perfil_id>/curriculo"
)(
    exigir_leitura_perfil(
        PerfilProfissionalController.visualizar_curriculo
    )
)


perfil_profissional_bp.post(
    "/<int:perfil_id>/foto"
)(
    exigir_proprio_perfil(
        PerfilProfissionalController.enviar_foto
    )
)

perfil_profissional_bp.get(
    "/<int:perfil_id>/foto"
)(
    exigir_leitura_perfil(
        PerfilProfissionalController.visualizar_foto
    )
)