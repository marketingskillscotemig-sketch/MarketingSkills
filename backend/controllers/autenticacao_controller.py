from flask import jsonify, request, session
from flask_wtf.csrf import generate_csrf

from seguranca.autorizacao import (
    obter_usuario_autenticado,
)
from services.autenticacao.autenticar_usuario_service import (
    AutenticarUsuarioService,
)
from services.usuario.criar_usuario_service import (
    CriarUsuarioService,
)


class AutenticacaoController:
    @staticmethod
    def token_csrf():
        """
        Gera um token CSRF associado
        à sessão atual.
        """

        return jsonify(
            {
                "csrfToken": generate_csrf(),
            }
        ), 200

    @staticmethod
    def cadastrar():
        try:
            dados = request.get_json(
                silent=True
            )

            usuario = (
                CriarUsuarioService.executar(
                    dados
                )
            )

            session.clear()

            session["usuario_id"] = (
                usuario.id
            )

            session.permanent = True

            novo_token_csrf = (
                generate_csrf()
            )

            return jsonify(
                {
                    "mensagem": (
                        "Conta criada com sucesso."
                    ),
                    "usuario": usuario.to_dict(),
                    "csrfToken": (
                        novo_token_csrf
                    ),
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

            session["usuario_id"] = (
                usuario.id
            )

            session.permanent = True

            novo_token_csrf = (
                generate_csrf()
            )

            return jsonify(
                {
                    "mensagem": (
                        "Login realizado com sucesso."
                    ),
                    "usuario": usuario.to_dict(),
                    "csrfToken": (
                        novo_token_csrf
                    ),
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
        usuario = (
            obter_usuario_autenticado()
        )

        if usuario is None:
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