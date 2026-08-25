from flask import jsonify, request

from services.formacao_academica.atualizar_formacao_academica_service import (
    AtualizarFormacaoAcademicaService,
)
from services.formacao_academica.buscar_formacao_academica_service import (
    BuscarFormacaoAcademicaService,
)
from services.formacao_academica.criar_formacao_academica_service import (
    CriarFormacaoAcademicaService,
)
from services.formacao_academica.deletar_formacao_academica_service import (
    DeletarFormacaoAcademicaService,
)
from services.formacao_academica.listar_formacoes_academicas_service import (
    ListarFormacoesAcademicasService,
)


class FormacaoAcademicaController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            formacao = (
                CriarFormacaoAcademicaService
                .executar(dados)
            )

            return jsonify(
                formacao.to_dict()
            ), 201

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def listar():
        formacoes = (
            ListarFormacoesAcademicasService
            .executar()
        )

        return jsonify(
            [
                formacao.to_dict()
                for formacao in formacoes
            ]
        ), 200

    @staticmethod
    def buscar_por_id(formacao_id):
        try:
            formacao = (
                BuscarFormacaoAcademicaService
                .executar(formacao_id)
            )

            return jsonify(
                formacao.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(formacao_id):
        try:
            dados = request.get_json(
                silent=True
            )

            formacao = (
                AtualizarFormacaoAcademicaService
                .executar(
                    formacao_id,
                    dados,
                )
            )

            return jsonify(
                formacao.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def deletar(formacao_id):
        try:
            (
                DeletarFormacaoAcademicaService
                .executar(formacao_id)
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404