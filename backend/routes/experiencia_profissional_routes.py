from flask import Blueprint

from controllers.experiencia_profissional_controller import (
    ExperienciaProfissionalController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


experiencia_profissional_bp = Blueprint(
    "experiencias_profissionais",
    __name__,
    url_prefix="/api/experiencias-profissionais",
)


experiencia_profissional_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        ExperienciaProfissionalController.criar
    )
)

# Empresa: somente leitura da lista (tela de talentos).
experiencia_profissional_bp.get("")(
    exigir_tipo_conta(
        "estudante",
        "empresa"
    )(
        ExperienciaProfissionalController.listar
    )
)

experiencia_profissional_bp.get(
    "/<int:experiencia_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        ExperienciaProfissionalController.buscar_por_id
    )
)

experiencia_profissional_bp.put(
    "/<int:experiencia_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        ExperienciaProfissionalController.atualizar
    )
)

experiencia_profissional_bp.delete(
    "/<int:experiencia_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        ExperienciaProfissionalController.deletar
    )
)