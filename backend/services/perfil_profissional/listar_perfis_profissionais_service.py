from models.enums import TipoConta
from models.perfil_profissional import PerfilProfissional
from repositories.perfil_repository import (
    PerfilRepository,
)


class ListarPerfisProfissionaisService:
    @staticmethod
    def executar(usuario):
        """
        Empresa: todos os perfis (tela de talentos).
        Estudante: somente o próprio perfil,
        em uma lista com 0 ou 1 item.
        """
        if (
            usuario.tipo_conta
            == TipoConta.EMPRESA
        ):
            return PerfilProfissional.listar_todos()

        perfil = (
            PerfilRepository
            .buscar_perfil_por_usuario_id(
                usuario.id
            )
        )

        if perfil is None:
            return []

        return [perfil]
