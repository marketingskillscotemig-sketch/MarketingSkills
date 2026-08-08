from models.vaga import Vaga


class BuscarVagaService:
    @staticmethod
    def executar(vaga_id):
        vaga = Vaga.buscar_por_id(
            vaga_id
        )

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        return vaga