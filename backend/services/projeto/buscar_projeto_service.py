from models.projeto import Projeto


class BuscarProjetoService:
    @staticmethod
    def executar(projeto_id):
        projeto = Projeto.buscar_por_id(
            projeto_id
        )

        if projeto is None:
            raise LookupError(
                "Projeto não encontrado."
            )

        return projeto