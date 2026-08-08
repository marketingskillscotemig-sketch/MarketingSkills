from models.vaga import Vaga


class DeletarVagaService:
    @staticmethod
    def executar(vaga_id):
        vaga = Vaga.buscar_por_id(
            vaga_id
        )

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        vaga.deletar()