from flask import g, jsonify, request

from services.alerta_vaga.atualizar_alerta_vaga_service import (
    AtualizarAlertaVagaService,
)
from services.alerta_vaga.buscar_alerta_vaga_service import (
    BuscarAlertaVagaService,
)
from services.alerta_vaga.criar_alerta_vaga_service import (
    CriarAlertaVagaService,
)
from services.alerta_vaga.deletar_alerta_vaga_service import (
    DeletarAlertaVagaService,
)
from services.alerta_vaga.listar_alertas_vaga_service import (
    ListarAlertasVagaService,
)


class AlertaVagaController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            alerta = CriarAlertaVagaService.executar(
                g.usuario_autenticado,
                dados,
            )

            return jsonify(
                alerta.to_dict()
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
        alertas = ListarAlertasVagaService.executar(
            g.usuario_autenticado
        )

        return jsonify(
            [
                alerta.to_dict()
                for alerta in alertas
            ]
        ), 200

    @staticmethod
    def buscar_por_id(alerta_id):
        try:
            alerta = BuscarAlertaVagaService.executar(
                g.usuario_autenticado,
                alerta_id,
            )

            return jsonify(
                alerta.to_dict()
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
    def atualizar(alerta_id):
        try:
            dados = request.get_json(silent=True)

            alerta = AtualizarAlertaVagaService.executar(
                g.usuario_autenticado,
                alerta_id,
                dados,
            )

            return jsonify(
                alerta.to_dict()
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
    def deletar(alerta_id):
        try:
            DeletarAlertaVagaService.executar(
                g.usuario_autenticado,
                alerta_id,
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