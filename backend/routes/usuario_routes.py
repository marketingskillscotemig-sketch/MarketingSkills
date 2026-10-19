from flask import Blueprint

from controllers.usuario_controller import (
    UsuarioController,
)
from seguranca.autorizacao import (
    exigir_autenticacao,
    exigir_proprio_usuario,
)


usuario_bp = Blueprint(
    "usuarios",
    __name__,
    url_prefix="/api/usuarios",
)


# O POST /api/usuarios legado (público) foi
# removido. O fluxo oficial de cadastro é:
# POST /api/autenticacao/cadastro


# Um usuário autenticado pode consultar
# somente os próprios dados.
usuario_bp.get("")(
    exigir_autenticacao(
        UsuarioController.listar
    )
)


usuario_bp.get(
    "/<int:usuario_id>"
)(
    exigir_proprio_usuario(
        UsuarioController.buscar_por_id
    )
)


usuario_bp.put(
    "/<int:usuario_id>"
)(
    exigir_proprio_usuario(
        UsuarioController.atualizar
    )
)


usuario_bp.delete(
    "/<int:usuario_id>"
)(
    exigir_proprio_usuario(
        UsuarioController.deletar
    )
)