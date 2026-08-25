from flask import jsonify, request

from services.experiencia_profissional.atualizar_experiencia_profissional_service import (
    AtualizarExperienciaProfissionalService,
)
from services.experiencia_profissional.buscar_experiencia_profissional_service import (
    BuscarExperienciaProfissionalService,
)
from services.experiencia_profissional.criar_experiencia_profissional_service import (
    CriarExperienciaProfissionalService,
)
from services.experiencia_profissional.deletar_experiencia_profissional_service import (
    DeletarExperienciaProfissionalService,
)
from services.experiencia_profissional.listar_experiencias_profissionais_service import (
    ListarExperienciasProfissionaisService,
)


class ExperienciaProfissionalController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            experiencia = (
                CriarExperienciaProfissionalService
                .executar(dados)
            )

            return jsonify(
                experiencia.to_dict()
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
        experiencias = (
            ListarExperienciasProfissionaisService
            .executar()
        )

        return jsonify(
            [
                experiencia.to_dict()
                for experiencia in experiencias
            ]
        ), 200

    @staticmethod
    def buscar_por_id(experiencia_id):
        try:
            experiencia = (
                BuscarExperienciaProfissionalService
                .executar(experiencia_id)
            )

            return jsonify(
                experiencia.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(experiencia_id):
        try:
            dados = request.get_json(
                silent=True
            )

            experiencia = (
                AtualizarExperienciaProfissionalService
                .executar(
                    experiencia_id,
                    dados,
                )
            )

            return jsonify(
                experiencia.to_dict()
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
    def deletar(experiencia_id):
        try:
            (
                DeletarExperienciaProfissionalService
                .executar(experiencia_id)
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404