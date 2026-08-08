from models.perfil_habilidade import PerfilHabilidade


class ListarPerfilHabilidadesService:
    @staticmethod
    def executar():
        return PerfilHabilidade.listar_todos()