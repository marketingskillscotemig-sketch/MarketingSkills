from models.requisito_vaga import RequisitoVaga


class ListarRequisitosVagaService:
    @staticmethod
    def executar():
        return RequisitoVaga.listar_todos()