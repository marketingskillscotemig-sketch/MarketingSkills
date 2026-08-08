from models.perfil_profissional import PerfilProfissional


class DeletarPerfilProfissionalService:
    @staticmethod
    def executar(perfil_id):
        perfil = PerfilProfissional.buscar_por_id(
            perfil_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        perfil.deletar()