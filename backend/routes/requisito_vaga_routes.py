from flask import Blueprint

from controllers.requisito_vaga_controller import (
    RequisitoVagaController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


requisito_vaga_bp = Blueprint(
    "requisitos_vaga",
    __name__,
    url_prefix="/api/requisitos-vaga",
)


requisito_vaga_bp.post("")(
    exigir_tipo_conta(
        "empresa"
    )(
        RequisitoVagaController.criar
    )
)

# Leitura pública (Vagas, Talentos, Estudos, Mercado).
requisito_vaga_bp.get("")(
    RequisitoVagaController.listar
)

requisito_vaga_bp.get(
    "/<int:requisito_id>"
)(
    RequisitoVagaController.buscar_por_id
)

requisito_vaga_bp.put(
    "/<int:requisito_id>"
)(
    exigir_tipo_conta(
        "empresa"
    )(
        RequisitoVagaController.atualizar
    )
)

requisito_vaga_bp.delete(
    "/<int:requisito_id>"
)(
    exigir_tipo_conta(
        "empresa"
    )(
        RequisitoVagaController.deletar
    )
)