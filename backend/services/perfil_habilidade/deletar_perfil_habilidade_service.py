from models.perfil_habilidade import PerfilHabilidade


class DeletarPerfilHabilidadeService:
    @staticmethod
    def executar(perfil_habilidade_id):
        perfil_habilidade = (
            PerfilHabilidade.buscar_por_id(
                perfil_habilidade_id
            )
        )

        if perfil_habilidade is None:
            raise LookupError(
                "Habilidade do perfil não encontrada."
            )

        perfil_habilidade.deletar()