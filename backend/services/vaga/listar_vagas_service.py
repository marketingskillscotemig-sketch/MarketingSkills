from models.vaga import Vaga


class ListarVagasService:
    @staticmethod
    def executar():
        return Vaga.listar_todos()