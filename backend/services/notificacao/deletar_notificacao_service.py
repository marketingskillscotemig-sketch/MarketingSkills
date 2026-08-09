from models.notificacao import Notificacao


class DeletarNotificacaoService:
    @staticmethod
    def executar(notificacao_id):
        notificacao = Notificacao.buscar_por_id(
            notificacao_id
        )

        if notificacao is None:
            raise LookupError(
                "Notificação não encontrada."
            )

        notificacao.deletar()