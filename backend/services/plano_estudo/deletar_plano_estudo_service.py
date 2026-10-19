from models.plano_estudo import PlanoEstudo


class DeletarPlanoEstudoService:
    @staticmethod
    def executar(usuario, plano_id):
        plano = PlanoEstudo.buscar_por_id(
            plano_id
        )

        if plano is None:
            raise LookupError(
                "Plano de estudo não encontrado."
            )

        if not plano.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar este plano de estudo."
            )

        plano.deletar()