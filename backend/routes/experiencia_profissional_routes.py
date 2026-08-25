from flask import Blueprint

from controllers.experiencia_profissional_controller import (
    ExperienciaProfissionalController,
)


experiencia_profissional_bp = Blueprint(
    "experiencias_profissionais",
    __name__,
    url_prefix="/api/experiencias-profissionais",
)


experiencia_profissional_bp.post("")(
    ExperienciaProfissionalController.criar
)

experiencia_profissional_bp.get("")(
    ExperienciaProfissionalController.listar
)

experiencia_profissional_bp.get(
    "/<int:experiencia_id>"
)(
    ExperienciaProfissionalController.buscar_por_id
)

experiencia_profissional_bp.put(
    "/<int:experiencia_id>"
)(
    ExperienciaProfissionalController.atualizar
)

experiencia_profissional_bp.delete(
    "/<int:experiencia_id>"
)(
    ExperienciaProfissionalController.deletar
)