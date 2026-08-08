from models.habilidade import Habilidade


class ListarHabilidadesService:
    @staticmethod
    def executar():
        return Habilidade.listar_todos()