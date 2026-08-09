from flask import jsonify, request

from services.notificacao.atualizar_notificacao_service import (
    AtualizarNotificacaoService,
)
from services.notificacao.buscar_notificacao_service import (
    BuscarNotificacaoService,
)
from services.notificacao.criar_notificacao_service import (
    CriarNotificacaoService,
)
from services.notificacao.deletar_notificacao_service import (
    DeletarNotificacaoService,
)
from services.notificacao.listar_notificacoes_service import (
    ListarNotificacoesService,
)


class NotificacaoController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(silent=True)

            notificacao = CriarNotificacaoService.executar(
                dados
            )

            return jsonify(
                notificacao.to_dict()
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
        notificacoes = (
            ListarNotificacoesService.executar()
        )

        return jsonify(
            [
                notificacao.to_dict()
                for notificacao in notificacoes
            ]
        ), 200

    @staticmethod
    def buscar_por_id(notificacao_id):
        try:
            notificacao = (
                BuscarNotificacaoService.executar(
                    notificacao_id
                )
            )

            return jsonify(
                notificacao.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(notificacao_id):
        try:
            dados = request.get_json(silent=True)

            notificacao = (
                AtualizarNotificacaoService.executar(
                    notificacao_id,
                    dados,
                )
            )

            return jsonify(
                notificacao.to_dict()
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
    def deletar(notificacao_id):
        try:
            DeletarNotificacaoService.executar(
                notificacao_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404