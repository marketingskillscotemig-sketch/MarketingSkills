from flask import Blueprint

from controllers.empresa_controller import (
    EmpresaController,
)
from seguranca.autorizacao import (
    exigir_propria_empresa,
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

empresa_bp.get(
    "/<int:empresa_id>"
)(
    EmpresaController.buscar_por_id
)

empresa_bp.put(
    "/<int:empresa_id>"
)(
    exigir_propria_empresa(
        EmpresaController.atualizar
    )
)

empresa_bp.delete(
    "/<int:empresa_id>"
)(
    exigir_propria_empresa(
        EmpresaController.deletar
    )
)


empresa_bp.post(
    "/<int:empresa_id>/logo"
)(
    exigir_propria_empresa(
        EmpresaController.enviar_logo
    )
)

empresa_bp.get(
    "/<int:empresa_id>/logo"
)(
    EmpresaController.visualizar_logo
)


empresa_bp.post(
    "/<int:empresa_id>/banner"
)(
    exigir_propria_empresa(
        EmpresaController.enviar_banner
    )
)

empresa_bp.get(
    "/<int:empresa_id>/banner"
)(
    EmpresaController.visualizar_banner
)