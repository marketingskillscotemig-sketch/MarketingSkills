from models.usuario import Usuario


class BuscarUsuarioService:
    @staticmethod
    def executar(usuario_id):
        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            raise LookupError("Usuário não encontrado.")

        return usuario