from flask import jsonify, request

from services.perfil_habilidade.atualizar_perfil_habilidade_service import (
    AtualizarPerfilHabilidadeService,
)
from services.perfil_habilidade.buscar_perfil_habilidade_service import (
    BuscarPerfilHabilidadeService,
)
from services.perfil_habilidade.criar_perfil_habilidade_service import (
    CriarPerfilHabilidadeService,
)
from services.perfil_habilidade.deletar_perfil_habilidade_service import (
    DeletarPerfilHabilidadeService,
)
from services.perfil_habilidade.listar_perfil_habilidades_service import (
    ListarPerfilHabilidadesService,
)


class PerfilHabilidadeController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            perfil_habilidade = (
                CriarPerfilHabilidadeService.executar(
                    dados
                )
            )

            return jsonify(
                perfil_habilidade.to_dict()
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
        registros = (
            ListarPerfilHabilidadesService.executar()
        )

        return jsonify(
            [
                registro.to_dict()
                for registro in registros
            ]
        ), 200

    @staticmethod
    def buscar_por_id(perfil_habilidade_id):
        try:
            registro = (
                BuscarPerfilHabilidadeService.executar(
                    perfil_habilidade_id
                )
            )

            return jsonify(
                registro.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(perfil_habilidade_id):
        try:
            dados = request.get_json(silent=True)

            registro = (
                AtualizarPerfilHabilidadeService.executar(
                    perfil_habilidade_id,
                    dados,
                )
            )

            return jsonify(
                registro.to_dict()
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
    def deletar(perfil_habilidade_id):
        try:
            DeletarPerfilHabilidadeService.executar(
                perfil_habilidade_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404