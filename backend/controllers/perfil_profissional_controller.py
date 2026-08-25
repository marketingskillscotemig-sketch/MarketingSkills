from flask import jsonify, request, send_file

from services.perfil_profissional.atualizar_perfil_profissional_service import (
    AtualizarPerfilProfissionalService,
)
from services.perfil_profissional.buscar_perfil_profissional_service import (
    BuscarPerfilProfissionalService,
)
from services.perfil_profissional.criar_perfil_profissional_service import (
    CriarPerfilProfissionalService,
)
from services.perfil_profissional.deletar_perfil_profissional_service import (
    DeletarPerfilProfissionalService,
)
from services.perfil_profissional.listar_perfis_profissionais_service import (
    ListarPerfisProfissionaisService,
)
from services.perfil_profissional.obter_curriculo_service import (
    ObterCurriculoService,
)
from services.perfil_profissional.obter_foto_service import (
    ObterFotoService,
)
from services.perfil_profissional.salvar_curriculo_service import (
    SalvarCurriculoService,
)
from services.perfil_profissional.salvar_foto_service import (
    SalvarFotoService,
)


class PerfilProfissionalController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            perfil = (
                CriarPerfilProfissionalService
                .executar(dados)
            )

            return jsonify(
                perfil.to_dict()
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
        perfis = (
            ListarPerfisProfissionaisService
            .executar()
        )

        return jsonify(
            [
                perfil.to_dict()
                for perfil in perfis
            ]
        ), 200

    @staticmethod
    def buscar_por_id(perfil_id):
        try:
            perfil = (
                BuscarPerfilProfissionalService
                .executar(perfil_id)
            )

            return jsonify(
                perfil.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(perfil_id):
        try:
            dados = request.get_json(
                silent=True
            )

            perfil = (
                AtualizarPerfilProfissionalService
                .executar(
                    perfil_id,
                    dados,
                )
            )

            return jsonify(
                perfil.to_dict()
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
    def deletar(perfil_id):
        try:
            (
                DeletarPerfilProfissionalService
                .executar(perfil_id)
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def enviar_curriculo(perfil_id):
        try:
            arquivo = request.files.get(
                "curriculo"
            )

            perfil = (
                SalvarCurriculoService
                .executar(
                    perfil_id,
                    arquivo,
                )
            )

            return jsonify(
                perfil.to_dict()
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
    def visualizar_curriculo(
        perfil_id
    ):
        try:
            caminho = (
                ObterCurriculoService
                .executar(perfil_id)
            )

            return send_file(
                caminho,
                mimetype="application/pdf",
                as_attachment=False,
                download_name=(
                    f"curriculo-perfil-"
                    f"{perfil_id}.pdf"
                ),
            )

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def enviar_foto(perfil_id):
        try:
            arquivo = request.files.get(
                "foto"
            )

            perfil = (
                SalvarFotoService
                .executar(
                    perfil_id,
                    arquivo,
                )
            )

            return jsonify(
                perfil.to_dict()
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
    def visualizar_foto(perfil_id):
        try:
            caminho, mimetype = (
                ObterFotoService
                .executar(perfil_id)
            )

            return send_file(
                caminho,
                mimetype=mimetype,
                as_attachment=False,
                max_age=0,
            )

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404