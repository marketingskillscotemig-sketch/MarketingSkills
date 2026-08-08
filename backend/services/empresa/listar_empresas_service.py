from models.empresa import Empresa


class ListarEmpresasService:
    @staticmethod
    def executar():
        return Empresa.listar_todos()