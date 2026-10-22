from flask import jsonify

from services.habilidade.buscar_habilidade_service import (
    BuscarHabilidadeService,
)
from services.habilidade.listar_habilidades_service import (
    ListarHabilidadesService,
)


class HabilidadeController:
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
