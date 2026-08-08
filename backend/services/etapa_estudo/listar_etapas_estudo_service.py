from models.etapa_estudo import EtapaEstudo


class ListarEtapasEstudoService:
    @staticmethod
    def executar():
        return EtapaEstudo.listar_todos()