from flask import Blueprint

from controllers.formacao_academica_controller import (
    FormacaoAcademicaController,
)


formacao_academica_bp = Blueprint(
    "formacoes_academicas",
    __name__,
    url_prefix="/api/formacoes-academicas",
)


formacao_academica_bp.post("")(
    FormacaoAcademicaController.criar
)

formacao_academica_bp.get("")(
    FormacaoAcademicaController.listar
)

formacao_academica_bp.get(
    "/<int:formacao_id>"
)(
    FormacaoAcademicaController.buscar_por_id
)

formacao_academica_bp.put(
    "/<int:formacao_id>"
)(
    FormacaoAcademicaController.atualizar
)

formacao_academica_bp.delete(
    "/<int:formacao_id>"
)(
    FormacaoAcademicaController.deletar
)