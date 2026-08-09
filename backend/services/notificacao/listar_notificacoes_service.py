from models.notificacao import Notificacao


class ListarNotificacoesService:
    @staticmethod
    def executar():
        return Notificacao.listar_todos()