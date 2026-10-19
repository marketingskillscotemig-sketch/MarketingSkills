class ListarPlanosEstudoService:
    @staticmethod
    def executar(usuario):
        """
        Retorna somente os planos de estudo
        do usuário autenticado.
        """
        return sorted(
            usuario.planos_estudo,
            key=lambda plano: plano.id,
        )
