from models.vaga import Vaga


class DeletarVagaService:
    @staticmethod
    def executar(usuario, vaga_id):
        vaga = Vaga.buscar_por_id(
            vaga_id
        )

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        if not vaga.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "excluir esta vaga."
            )

        vaga.deletar()