from models.projeto import Projeto


class ListarProjetosService:
    @staticmethod
    def executar():
        return Projeto.listar_todos()