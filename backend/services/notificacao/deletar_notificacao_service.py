from models.notificacao import Notificacao


class DeletarNotificacaoService:
    @staticmethod
    def executar(usuario, notificacao_id):
        notificacao = Notificacao.buscar_por_id(
            notificacao_id
        )

        if notificacao is None:
            raise LookupError(
                "Notificação não encontrada."
            )

        if not notificacao.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar esta notificação."
            )

        notificacao.deletar()