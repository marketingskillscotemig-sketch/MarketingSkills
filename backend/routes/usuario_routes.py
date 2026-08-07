from flask import Blueprint

from controllers.usuario_controller import UsuarioController


usuario_bp = Blueprint(
    "usuarios",
    __name__,
    url_prefix="/api/usuarios",
)


usuario_bp.post("")(
    UsuarioController.criar
)

usuario_bp.get("")(
    UsuarioController.listar
)

usuario_bp.get("/<int:usuario_id>")(
    UsuarioController.buscar_por_id
)

usuario_bp.put("/<int:usuario_id>")(
    UsuarioController.atualizar
)

usuario_bp.delete("/<int:usuario_id>")(
    UsuarioController.deletar
)