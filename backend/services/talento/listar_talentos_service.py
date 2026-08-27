from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.usuario import Usuario


class ListarTalentosService:
    @staticmethod
    def executar():
        usuarios = Usuario.listar_todos()

        return [
            usuario
            for usuario in usuarios
            if (
                usuario.tipo_conta
                == TipoConta.ESTUDANTE
                and usuario.status
                == StatusUsuario.ATIVO
                and usuario.perfil_profissional
                is not None
            )
        ]