from flask import jsonify, request

from services.tendencia_mercado.atualizar_tendencia_mercado_service import (
    AtualizarTendenciaMercadoService,
)
from services.tendencia_mercado.buscar_tendencia_mercado_service import (
    BuscarTendenciaMercadoService,
)
from services.tendencia_mercado.criar_tendencia_mercado_service import (
    CriarTendenciaMercadoService,
)
from services.tendencia_mercado.deletar_tendencia_mercado_service import (
    DeletarTendenciaMercadoService,
)
from services.tendencia_mercado.listar_tendencias_mercado_service import (
    ListarTendenciasMercadoService,
)


class TendenciaMercadoController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            tendencia = CriarTendenciaMercadoService.executar(
                dados
            )

            return jsonify(
                tendencia.to_dict()
            ), 201

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def listar():
        tendencias = (
            ListarTendenciasMercadoService.executar()
        )

        return jsonify(
            [
                tendencia.to_dict()
                for tendencia in tendencias
            ]
        ), 200

    @staticmethod
    def buscar_por_id(tendencia_id):
        try:
            tendencia = (
                BuscarTendenciaMercadoService.executar(
                    tendencia_id
                )
            )

            return jsonify(
                tendencia.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(tendencia_id):
        try:
            dados = request.get_json(silent=True)

            tendencia = (
                AtualizarTendenciaMercadoService.executar(
                    tendencia_id,
                    dados,
                )
            )

            return jsonify(
                tendencia.to_dict()
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
    def deletar(tendencia_id):
        try:
            DeletarTendenciaMercadoService.executar(
                tendencia_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404