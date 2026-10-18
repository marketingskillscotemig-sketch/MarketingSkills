from models.projeto import Projeto


class BuscarProjetoService:
    @staticmethod
    def executar(usuario, projeto_id):
        projeto = Projeto.buscar_por_id(
            projeto_id
        )

        if projeto is None:
            raise LookupError(
                "Projeto não encontrado."
            )

        if not projeto.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar este projeto."
            )

        return projeto