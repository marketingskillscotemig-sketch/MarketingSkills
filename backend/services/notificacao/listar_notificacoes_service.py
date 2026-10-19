class ListarNotificacoesService:
    @staticmethod
    def executar(usuario):
        """
        Retorna somente as notificações dos alertas
        de vaga do usuário autenticado.
        """
        notificacoes = []

        for alerta in usuario.alertas_vaga:
            notificacoes.extend(alerta.notificacoes)

        return sorted(
            notificacoes,
            key=lambda notificacao: notificacao.id,
        )
