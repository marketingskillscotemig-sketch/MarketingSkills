from models.alerta_vaga import AlertaVaga


class DeletarAlertaVagaService:
    @staticmethod
    def executar(usuario, alerta_id):
        alerta = AlertaVaga.buscar_por_id(
            alerta_id
        )

        if alerta is None:
            raise LookupError(
                "Alerta de vaga não encontrado."
            )

        if not alerta.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar este alerta de vaga."
            )

        alerta.deletar()