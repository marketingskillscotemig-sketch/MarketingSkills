from flask import g, jsonify, request

from services.etapa_estudo.atualizar_etapa_estudo_service import (
    AtualizarEtapaEstudoService,
)
from services.etapa_estudo.buscar_etapa_estudo_service import (
    BuscarEtapaEstudoService,
)
from services.etapa_estudo.criar_etapa_estudo_service import (
    CriarEtapaEstudoService,
)
from services.etapa_estudo.deletar_etapa_estudo_service import (
    DeletarEtapaEstudoService,
)
from services.etapa_estudo.listar_etapas_estudo_service import (
    ListarEtapasEstudoService,
)


class EtapaEstudoController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            etapa = CriarEtapaEstudoService.executar(
                g.usuario_autenticado,
                dados,
            )

            return jsonify(
                etapa.to_dict()
            ), 201

        except PermissionError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 403

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
        etapas = ListarEtapasEstudoService.executar(
            g.usuario_autenticado
        )

        return jsonify(
            [
                etapa.to_dict()
                for etapa in etapas
            ]
        ), 200

    @staticmethod
    def buscar_por_id(etapa_id):
        try:
            etapa = BuscarEtapaEstudoService.executar(
                g.usuario_autenticado,
                etapa_id,
            )

            return jsonify(
                etapa.to_dict()
            ), 200

        except PermissionError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 403

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(etapa_id):
        try:
            dados = request.get_json(silent=True)

            etapa = AtualizarEtapaEstudoService.executar(
                g.usuario_autenticado,
                etapa_id,
                dados,
            )

            return jsonify(
                etapa.to_dict()
            ), 200

        except PermissionError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 403

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def deletar(etapa_id):
        try:
            DeletarEtapaEstudoService.executar(
                g.usuario_autenticado,
                etapa_id,
            )

            return "", 204

        except PermissionError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 403

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404