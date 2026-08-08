from flask import jsonify, request

from services.habilidade.atualizar_habilidade_service import (
    AtualizarHabilidadeService,
)
from services.habilidade.buscar_habilidade_service import (
    BuscarHabilidadeService,
)
from services.habilidade.criar_habilidade_service import (
    CriarHabilidadeService,
)
from services.habilidade.deletar_habilidade_service import (
    DeletarHabilidadeService,
)
from services.habilidade.listar_habilidades_service import (
    ListarHabilidadesService,
)


class HabilidadeController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            habilidade = CriarHabilidadeService.executar(
                dados
            )

            return jsonify(
                habilidade.to_dict()
            ), 201

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def listar():
        habilidades = ListarHabilidadesService.executar()

        return jsonify(
            [
                habilidade.to_dict()
                for habilidade in habilidades
            ]
        ), 200

    @staticmethod
    def buscar_por_id(habilidade_id):
        try:
            habilidade = BuscarHabilidadeService.executar(
                habilidade_id
            )

            return jsonify(
                habilidade.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(habilidade_id):
        try:
            dados = request.get_json(silent=True)

            habilidade = AtualizarHabilidadeService.executar(
                habilidade_id,
                dados,
            )

            return jsonify(
                habilidade.to_dict()
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
    def deletar(habilidade_id):
        try:
            DeletarHabilidadeService.executar(
                habilidade_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404