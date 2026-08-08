from models.etapa_estudo import EtapaEstudo


class BuscarEtapaEstudoService:
    @staticmethod
    def executar(etapa_id):
        etapa = EtapaEstudo.buscar_por_id(
            etapa_id
        )

        if etapa is None:
            raise LookupError(
                "Etapa de estudo não encontrada."
            )

        return etapa