from models.plano_estudo import PlanoEstudo


class ListarPlanosEstudoService:
    @staticmethod
    def executar():
        return PlanoEstudo.listar_todos()