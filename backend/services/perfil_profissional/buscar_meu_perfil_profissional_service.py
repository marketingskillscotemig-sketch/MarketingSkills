from repositories.perfil_repository import (
    PerfilRepository,
)


class BuscarMeuPerfilProfissionalService:
    @staticmethod
    def executar(usuario):
        """
        Retorna o perfil profissional do usuário
        autenticado ou None se ainda não existir.
        """
        return (
            PerfilRepository
            .buscar_perfil_por_usuario_id(
                usuario.id
            )
        )
