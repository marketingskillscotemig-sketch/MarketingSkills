from werkzeug.security import check_password_hash

from models.usuario import Usuario


class DeletarUsuarioService:
    @staticmethod
    def executar(usuario_id, dados=None):
        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            raise LookupError("Usuário não encontrado.")

        # Excluir a conta exige a senha atual.
        # Ela só é conferida, nunca salva.
        senha_atual = (
            dados.get("senhaAtual")
            if isinstance(dados, dict)
            else None
        )

        if not isinstance(senha_atual, str) or not senha_atual:
            raise PermissionError(
                "Informe a senha atual para excluir a conta."
            )

        if not check_password_hash(usuario.senha_hash, senha_atual):
            raise PermissionError("Senha atual incorreta.")

        usuario.deletar()