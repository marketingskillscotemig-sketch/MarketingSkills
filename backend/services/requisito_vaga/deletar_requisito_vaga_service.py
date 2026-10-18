from models.requisito_vaga import RequisitoVaga


class DeletarRequisitoVagaService:
    @staticmethod
    def executar(usuario, requisito_id):
        requisito = RequisitoVaga.buscar_por_id(
            requisito_id
        )

        if requisito is None:
            raise LookupError(
                "Requisito da vaga não encontrado."
            )

        if (
            requisito.vaga is None
            or not requisito.vaga.pertence_ao_usuario(
                usuario.id
            )
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "alterar os requisitos desta vaga."
            )

        requisito.deletar()