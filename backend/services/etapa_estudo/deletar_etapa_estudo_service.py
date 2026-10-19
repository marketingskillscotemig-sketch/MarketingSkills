from models.etapa_estudo import EtapaEstudo


class DeletarEtapaEstudoService:
    @staticmethod
    def executar(usuario, etapa_id):
        etapa = EtapaEstudo.buscar_por_id(
            etapa_id
        )

        if etapa is None:
            raise LookupError(
                "Etapa de estudo não encontrada."
            )

        if (
            etapa.plano_estudo is None
            or not etapa.plano_estudo.pertence_ao_usuario(
                usuario.id
            )
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar esta etapa de estudo."
            )

        etapa.deletar()