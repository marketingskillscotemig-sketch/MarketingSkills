from flask import jsonify, request

from services.empresa.atualizar_empresa_service import (
    AtualizarEmpresaService,
)
from services.empresa.buscar_empresa_service import (
    BuscarEmpresaService,
)
from services.empresa.criar_empresa_service import (
    CriarEmpresaService,
)
from services.empresa.deletar_empresa_service import (
    DeletarEmpresaService,
)
from services.empresa.listar_empresas_service import (
    ListarEmpresasService,
)


class EmpresaController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            empresa = CriarEmpresaService.executar(
                dados
            )

            return jsonify(
                empresa.to_dict()
            ), 201

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def listar():
        empresas = ListarEmpresasService.executar()

        return jsonify(
            [
                empresa.to_dict()
                for empresa in empresas
            ]
        ), 200

    @staticmethod
    def buscar_por_id(empresa_id):
        try:
            empresa = BuscarEmpresaService.executar(
                empresa_id
            )

            return jsonify(
                empresa.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(empresa_id):
        try:
            dados = request.get_json(silent=True)

            empresa = AtualizarEmpresaService.executar(
                empresa_id,
                dados,
            )

            return jsonify(
                empresa.to_dict()
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
    def deletar(empresa_id):
        try:
            DeletarEmpresaService.executar(
                empresa_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404