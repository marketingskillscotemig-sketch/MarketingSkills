from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.usuario import Usuario


class ObterContatoTalentoService:
    @staticmethod
    def executar(usuario_id):
        """
        Retorna o e-mail de um único talento:
        estudante ativo com perfil profissional
        (o mesmo critério da lista de talentos).
        Qualquer outro usuário é tratado como
        não encontrado.
        """
        usuario = Usuario.buscar_por_id(
            usuario_id
        )

        if (
            usuario is None
            or usuario.tipo_conta
            != TipoConta.ESTUDANTE
            or usuario.status
            != StatusUsuario.ATIVO
            or usuario.perfil_profissional
            is None
        ):
            raise LookupError(
                "Talento não encontrado."
            )

        return {
            "email": usuario.email,
        }
