from flask import g, jsonify, request

from services.usuario.atualizar_usuario_service import (
    AtualizarUsuarioService,
)
from services.usuario.buscar_usuario_service import (
    BuscarUsuarioService,
)
from services.usuario.criar_usuario_service import (
    CriarUsuarioService,
)
from services.usuario.deletar_usuario_service import (
    DeletarUsuarioService,
)


class UsuarioController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            usuario = (
                CriarUsuarioService.executar(
                    dados
                )
            )

            return jsonify(
                usuario.to_dict()
            ), 201

        except ValueError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 400

    @staticmethod
    def listar():
        """
        Retorna somente o usuário autenticado.

        Mantemos uma lista como resposta para
        preservar compatibilidade temporária
        com o frontend antigo de Perfil.
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

            campos_protegidos = {
                "status",
                "tipoConta",
            }

            campos_recebidos = set(
                dados.keys()
            )

            campos_bloqueados = (
                campos_recebidos
                & campos_protegidos
            )

            if campos_bloqueados:
                return jsonify(
                    {
                        "erro": (
                            "Você não possui permissão "
                            "para alterar o status ou "
                            "o tipo da própria conta."
                        ),
                    }
                ), 403

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
            DeletarUsuarioService.executar(
                usuario_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 404