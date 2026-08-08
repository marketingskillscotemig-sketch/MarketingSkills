from flask import jsonify, request

from services.plano_estudo.atualizar_plano_estudo_service import (
    AtualizarPlanoEstudoService,
)
from services.plano_estudo.buscar_plano_estudo_service import (
    BuscarPlanoEstudoService,
)
from services.plano_estudo.criar_plano_estudo_service import (
    CriarPlanoEstudoService,
)
from services.plano_estudo.deletar_plano_estudo_service import (
    DeletarPlanoEstudoService,
)
from services.plano_estudo.listar_planos_estudo_service import (
    ListarPlanosEstudoService,
)


class PlanoEstudoController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            plano = CriarPlanoEstudoService.executar(
                dados
            )

            return jsonify(
                plano.to_dict()
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
        planos = ListarPlanosEstudoService.executar()

        return jsonify(
            [
                plano.to_dict()
                for plano in planos
            ]
        ), 200

    @staticmethod
    def buscar_por_id(plano_id):
        try:
            plano = BuscarPlanoEstudoService.executar(
                plano_id
            )

            return jsonify(
                plano.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(plano_id):
        try:
            dados = request.get_json(silent=True)

            plano = AtualizarPlanoEstudoService.executar(
                plano_id,
                dados,
            )

            return jsonify(
                plano.to_dict()
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
    def deletar(plano_id):
        try:
            DeletarPlanoEstudoService.executar(
                plano_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404