from flask import Blueprint

from controllers.vaga_controller import (
    VagaController,
)


vaga_bp = Blueprint(
    "vagas",
    __name__,
    url_prefix="/api/vagas",
)


vaga_bp.post("")(
    VagaController.criar
)

vaga_bp.get("")(
    VagaController.listar
)

vaga_bp.get("/<int:vaga_id>")(
    VagaController.buscar_por_id
)

vaga_bp.put("/<int:vaga_id>")(
    VagaController.atualizar
)

vaga_bp.delete("/<int:vaga_id>")(
    VagaController.deletar
)