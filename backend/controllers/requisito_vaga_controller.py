from flask import jsonify, request

from services.requisito_vaga.atualizar_requisito_vaga_service import (
    AtualizarRequisitoVagaService,
)
from services.requisito_vaga.buscar_requisito_vaga_service import (
    BuscarRequisitoVagaService,
)
from services.requisito_vaga.criar_requisito_vaga_service import (
    CriarRequisitoVagaService,
)
from services.requisito_vaga.deletar_requisito_vaga_service import (
    DeletarRequisitoVagaService,
)
from services.requisito_vaga.listar_requisitos_vaga_service import (
    ListarRequisitosVagaService,
)


class RequisitoVagaController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            requisito = CriarRequisitoVagaService.executar(
                dados
            )

            return jsonify(
                requisito.to_dict()
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
        requisitos = (
            ListarRequisitosVagaService.executar()
        )

        return jsonify(
            [
                requisito.to_dict()
                for requisito in requisitos
            ]
        ), 200

    @staticmethod
    def buscar_por_id(requisito_id):
        try:
            requisito = (
                BuscarRequisitoVagaService.executar(
                    requisito_id
                )
            )

            return jsonify(
                requisito.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(requisito_id):
        try:
            dados = request.get_json(silent=True)

            requisito = (
                AtualizarRequisitoVagaService.executar(
                    requisito_id,
                    dados,
                )
            )

            return jsonify(
                requisito.to_dict()
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
    def deletar(requisito_id):
        try:
            DeletarRequisitoVagaService.executar(
                requisito_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404