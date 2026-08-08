from models.requisito_vaga import RequisitoVaga


class BuscarRequisitoVagaService:
    @staticmethod
    def executar(requisito_id):
        requisito = RequisitoVaga.buscar_por_id(
            requisito_id
        )

        if requisito is None:
            raise LookupError(
                "Requisito da vaga não encontrado."
            )

        return requisito
    