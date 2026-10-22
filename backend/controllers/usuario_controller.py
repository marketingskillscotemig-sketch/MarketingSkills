from flask import g, jsonify, request

from services.usuario.atualizar_usuario_service import (
    AtualizarUsuarioService,
)
from services.usuario.buscar_usuario_service import (
    BuscarUsuarioService,
)
from services.usuario.deletar_usuario_service import (
    DeletarUsuarioService,
)


class UsuarioController:
    @staticmethod
    def listar():
        """
        Retorna somente o usuário autenticado,
        dentro de uma lista.
        """

        usuario = (
            g.usuario_autenticado
        )

        return jsonify(
            [
                usuario.to_dict()
            ]
        ), 200

    @staticmethod
    def buscar_por_id(
        usuario_id
    ):
        try:
            usuario = (
                BuscarUsuarioService.executar(
                    usuario_id
                )
            )

            return jsonify(
                usuario.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 404

    @staticmethod
    def atualizar(
        usuario_id
    ):
        try:
            dados = request.get_json(
                silent=True
            )

            if not dados:
                raise ValueError(
                    "Informe ao menos um campo "
                    "para atualização."
                )

            usuario = (
                AtualizarUsuarioService.executar(
                    usuario_id,
                    dados,
                )
            )

            return jsonify(
                usuario.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 404

        except PermissionError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 403

        except ValueError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 400

    @staticmethod
    def deletar(
        usuario_id
    ):
        try:
            dados = request.get_json(
                silent=True
            )

            DeletarUsuarioService.executar(
                usuario_id,
                dados,
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 404

        except PermissionError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 403
