from models.tendencia_mercado import TendenciaMercado


class BuscarTendenciaMercadoService:
    @staticmethod
    def executar(tendencia_id):
        tendencia = TendenciaMercado.buscar_por_id(
            tendencia_id
        )

        if tendencia is None:
            raise LookupError(
                "Tendência de mercado não encontrada."
            )

        return tendencia