from models.tendencia_mercado import TendenciaMercado


class DeletarTendenciaMercadoService:
    @staticmethod
    def executar(tendencia_id):
        tendencia = TendenciaMercado.buscar_por_id(
            tendencia_id
        )

        if tendencia is None:
            raise LookupError(
                "Tendência de mercado não encontrada."
            )

        tendencia.deletar()