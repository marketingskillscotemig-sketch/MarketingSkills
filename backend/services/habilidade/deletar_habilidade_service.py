from models.habilidade import Habilidade


class DeletarHabilidadeService:
    @staticmethod
    def executar(habilidade_id):
        habilidade = Habilidade.buscar_por_id(
            habilidade_id
        )

        if habilidade is None:
            raise LookupError(
                "Habilidade não encontrada."
            )

        habilidade.deletar()