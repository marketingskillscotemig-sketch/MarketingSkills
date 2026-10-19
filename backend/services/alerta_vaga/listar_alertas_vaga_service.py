class ListarAlertasVagaService:
    @staticmethod
    def executar(usuario):
        """
        Retorna somente os alertas de vaga
        do usuário autenticado.
        """
        return sorted(
            usuario.alertas_vaga,
            key=lambda alerta: alerta.id,
        )
