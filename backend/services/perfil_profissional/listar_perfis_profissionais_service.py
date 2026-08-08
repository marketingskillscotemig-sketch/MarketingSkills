from models.perfil_profissional import PerfilProfissional


class ListarPerfisProfissionaisService:
    @staticmethod
    def executar():
        return PerfilProfissional.listar_todos()