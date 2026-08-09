from models.alerta_vaga import AlertaVaga


class BuscarAlertaVagaService:
    @staticmethod
    def executar(alerta_id):
        alerta = AlertaVaga.buscar_por_id(
            alerta_id
        )

        if alerta is None:
            raise LookupError(
                "Alerta de vaga não encontrado."
            )

        return alerta