from flask import (
    jsonify,
    request,
    send_file,
)

from seguranca.autorizacao import (
    obter_usuario_autenticado,
)

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
from services.empresa.obter_imagem_empresa_service import (
    ObterImagemEmpresaService,
)
from services.empresa.salvar_imagem_empresa_service import (
    SalvarImagemEmpresaService,
)


class EmpresaController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            empresa = (
                CriarEmpresaService
                .executar(dados)
            )

            usuario = (
                obter_usuario_autenticado()
            )

            incluir_administrativos = (
                usuario is not None
                and
                usuario.id ==
                empresa.usuario_id
            )

            return jsonify(
                empresa.to_dict(
                    incluir_dados_administrativos=
                    incluir_administrativos
                )
            ), 201

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def listar():
        empresas = (
            ListarEmpresasService
            .executar()
        )

        return jsonify(
            [
                empresa.to_dict()
                for empresa in empresas
            ]
        ), 200

    @staticmethod
    def buscar_por_id(
        empresa_id
    ):
        try:
            empresa = (
                BuscarEmpresaService
                .executar(
                    empresa_id
                )
            )

            usuario = (
                obter_usuario_autenticado()
            )

            incluir_administrativos = (
                usuario is not None
                and
                usuario.id ==
                empresa.usuario_id
            )

            return jsonify(
                empresa.to_dict(
                    incluir_dados_administrativos=
                    incluir_administrativos
                )
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(
        empresa_id
    ):
        try:
            dados = request.get_json(
                silent=True
            )

            empresa = (
                AtualizarEmpresaService
                .executar(
                    empresa_id,
                    dados,
                )
            )

            usuario = (
                obter_usuario_autenticado()
            )

            incluir_administrativos = (
                usuario is not None
                and
                usuario.id ==
                empresa.usuario_id
            )

            return jsonify(
                empresa.to_dict(
                    incluir_dados_administrativos=
                    incluir_administrativos
                )
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
    def deletar(
        empresa_id
    ):
        try:
            (
                DeletarEmpresaService
                .executar(
                    empresa_id
                )
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def enviar_logo(
        empresa_id
    ):
        try:
            arquivo = request.files.get(
                "logo"
            )

            empresa = (
                SalvarImagemEmpresaService
                .executar(
                    empresa_id,
                    arquivo,
                    "logo",
                )
            )

            usuario = (
                obter_usuario_autenticado()
            )

            incluir_administrativos = (
                usuario is not None
                and
                usuario.id ==
                empresa.usuario_id
            )

            return jsonify(
                empresa.to_dict(
                    incluir_dados_administrativos=
                    incluir_administrativos
                )
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
    def visualizar_logo(
        empresa_id
    ):
        try:
            caminho, mimetype = (
                ObterImagemEmpresaService
                .executar(
                    empresa_id,
                    "logo",
                )
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

    @staticmethod
    def enviar_banner(
        empresa_id
    ):
        try:
            arquivo = request.files.get(
                "banner"
            )

            empresa = (
                SalvarImagemEmpresaService
                .executar(
                    empresa_id,
                    arquivo,
                    "banner",
                )
            )

            usuario = (
                obter_usuario_autenticado()
            )

            incluir_administrativos = (
                usuario is not None
                and
                usuario.id ==
                empresa.usuario_id
            )

            return jsonify(
                empresa.to_dict(
                    incluir_dados_administrativos=
                    incluir_administrativos
                )
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
    def visualizar_banner(
        empresa_id
    ):
        try:
            caminho, mimetype = (
                ObterImagemEmpresaService
                .executar(
                    empresa_id,
                    "banner",
                )
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