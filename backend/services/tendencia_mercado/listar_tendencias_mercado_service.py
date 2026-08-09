from models.tendencia_mercado import TendenciaMercado


class ListarTendenciasMercadoService:
    @staticmethod
    def executar():
        return TendenciaMercado.listar_todos()