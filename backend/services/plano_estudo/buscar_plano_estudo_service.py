from models.plano_estudo import PlanoEstudo


class BuscarPlanoEstudoService:
    @staticmethod
    def executar(plano_id):
        plano = PlanoEstudo.buscar_por_id(
            plano_id
        )

        if plano is None:
            raise LookupError(
                "Plano de estudo não encontrado."
            )

        return plano