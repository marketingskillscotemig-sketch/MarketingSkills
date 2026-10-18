from flask import Blueprint

from controllers.vaga_controller import (
    VagaController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


vaga_bp = Blueprint(
    "vagas",
    __name__,
    url_prefix="/api/vagas",
)


vaga_bp.post("")(
    exigir_tipo_conta(
        "empresa"
    )(
        VagaController.criar
    )
)

# Leitura pública: lista, busca avançada e detalhe.
vaga_bp.get("")(
    VagaController.listar
)

vaga_bp.get(
    "/busca-avancada"
)(
    VagaController.buscar_avancado
)

vaga_bp.get(
    "/<int:vaga_id>"
)(
    VagaController.buscar_por_id
)

vaga_bp.put(
    "/<int:vaga_id>"
)(
    exigir_tipo_conta(
        "empresa"
    )(
        VagaController.atualizar
    )
)

vaga_bp.delete(
    "/<int:vaga_id>"
)(
    exigir_tipo_conta(
        "empresa"
    )(
        VagaController.deletar
    )
)