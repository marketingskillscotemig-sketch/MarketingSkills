from flask import Blueprint

from controllers.formacao_academica_controller import (
    FormacaoAcademicaController,
)
from seguranca.autorizacao import (
    exigir_tipo_conta,
)


formacao_academica_bp = Blueprint(
    "formacoes_academicas",
    __name__,
    url_prefix="/api/formacoes-academicas",
)


formacao_academica_bp.post("")(
    exigir_tipo_conta(
        "estudante"
    )(
        FormacaoAcademicaController.criar
    )
)

# Empresa: somente leitura da lista (tela de talentos).
formacao_academica_bp.get("")(
    exigir_tipo_conta(
        "estudante",
        "empresa"
    )(
        FormacaoAcademicaController.listar
    )
)

formacao_academica_bp.get(
    "/<int:formacao_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        FormacaoAcademicaController.buscar_por_id
    )
)

formacao_academica_bp.put(
    "/<int:formacao_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        FormacaoAcademicaController.atualizar
    )
)

formacao_academica_bp.delete(
    "/<int:formacao_id>"
)(
    exigir_tipo_conta(
        "estudante"
    )(
        FormacaoAcademicaController.deletar
    )
)