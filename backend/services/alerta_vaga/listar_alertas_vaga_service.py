from models.alerta_vaga import AlertaVaga


class ListarAlertasVagaService:
    @staticmethod
    def executar():
        return AlertaVaga.listar_todos()