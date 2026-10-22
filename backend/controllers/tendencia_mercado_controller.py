from flask import jsonify

from services.tendencia_mercado.buscar_tendencia_mercado_service import (
    BuscarTendenciaMercadoService,
)
from services.tendencia_mercado.listar_tendencias_mercado_service import (
    ListarTendenciasMercadoService,
)


class TendenciaMercadoController:
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
