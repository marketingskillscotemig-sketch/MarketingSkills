from flask import jsonify, request

from services.projeto.atualizar_projeto_service import (
    AtualizarProjetoService,
)
from services.projeto.buscar_projeto_service import (
    BuscarProjetoService,
)
from services.projeto.criar_projeto_service import (
    CriarProjetoService,
)
from services.projeto.deletar_projeto_service import (
    DeletarProjetoService,
)
from services.projeto.listar_projetos_service import (
    ListarProjetosService,
)


class ProjetoController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            projeto = CriarProjetoService.executar(
                dados
            )

            return jsonify(
                projeto.to_dict()
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
        projetos = (
            ListarProjetosService.executar()
        )

        return jsonify(
            [
                projeto.to_dict()
                for projeto in projetos
            ]
        ), 200

    @staticmethod
    def buscar_por_id(projeto_id):
        try:
            projeto = (
                BuscarProjetoService.executar(
                    projeto_id
                )
            )

            return jsonify(
                projeto.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(projeto_id):
        try:
            dados = request.get_json(
                silent=True
            )

            projeto = (
                AtualizarProjetoService.executar(
                    projeto_id,
                    dados,
                )
            )

            return jsonify(
                projeto.to_dict()
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
    def deletar(projeto_id):
        try:
            DeletarProjetoService.executar(
                projeto_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404