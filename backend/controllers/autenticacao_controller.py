from flask import jsonify, request, session

from models.usuario import Usuario
from services.autenticacao.autenticar_usuario_service import (
    AutenticarUsuarioService,
)
from services.usuario.criar_usuario_service import (
    CriarUsuarioService,
)


class AutenticacaoController:
    @staticmethod
    def cadastrar():
        try:
            dados = request.get_json(
                silent=True
            )

            usuario = CriarUsuarioService.executar(
                dados
            )

            session.clear()
            session["usuario_id"] = usuario.id

            return jsonify(
                {
                    "mensagem": (
                        "Conta criada com sucesso."
                    ),
                    "usuario": usuario.to_dict(),
                }
            ), 201

        except ValueError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 400

    @staticmethod
    def login():
        try:
            dados = request.get_json(
                silent=True
            )

            usuario = (
                AutenticarUsuarioService.executar(
                    dados
                )
            )

            session.clear()
            session["usuario_id"] = usuario.id

            return jsonify(
                {
                    "mensagem": (
                        "Login realizado com sucesso."
                    ),
                    "usuario": usuario.to_dict(),
                }
            ), 200

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
    def sessao():
        usuario_id = session.get(
            "usuario_id"
        )

        if usuario_id is None:
            return jsonify(
                {
                    "autenticado": False,
                    "usuario": None,
                }
            ), 200

        usuario = Usuario.buscar_por_id(
            usuario_id
        )

        if usuario is None:
            session.clear()

            return jsonify(
                {
                    "autenticado": False,
                    "usuario": None,
                }
            ), 200

        return jsonify(
            {
                "autenticado": True,
                "usuario": usuario.to_dict(),
            }
        ), 200

    @staticmethod
    def logout():
        session.clear()

        return jsonify(
            {
                "mensagem": (
                    "Logout realizado com sucesso."
                ),
            }
        ), 200