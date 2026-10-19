class ListarEtapasEstudoService:
    @staticmethod
    def executar(usuario):
        """
        Retorna somente as etapas dos planos de
        estudo do usuário autenticado.
        """
        etapas = []

        for plano in usuario.planos_estudo:
            etapas.extend(plano.etapas)

        return sorted(
            etapas,
            key=lambda etapa: etapa.id,
        )
