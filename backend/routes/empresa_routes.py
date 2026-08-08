from flask import Blueprint

from controllers.empresa_controller import (
    EmpresaController,
)


empresa_bp = Blueprint(
    "empresas",
    __name__,
    url_prefix="/api/empresas",
)


empresa_bp.post("")(
    EmpresaController.criar
)

empresa_bp.get("")(
    EmpresaController.listar
)

empresa_bp.get("/<int:empresa_id>")(
    EmpresaController.buscar_por_id
)

empresa_bp.put("/<int:empresa_id>")(
    EmpresaController.atualizar
)

empresa_bp.delete("/<int:empresa_id>")(
    EmpresaController.deletar
)