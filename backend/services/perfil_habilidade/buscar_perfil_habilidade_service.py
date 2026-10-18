from models.perfil_habilidade import PerfilHabilidade


class BuscarPerfilHabilidadeService:
    @staticmethod
    def executar(usuario, perfil_habilidade_id):
        perfil_habilidade = (
            PerfilHabilidade.buscar_por_id(
                perfil_habilidade_id
            )
        )

        if perfil_habilidade is None:
            raise LookupError(
                "Habilidade do perfil não encontrada."
            )

        if not perfil_habilidade.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar esta habilidade do perfil."
            )

        return perfil_habilidade