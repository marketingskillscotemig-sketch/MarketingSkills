from werkzeug.security import generate_password_hash

from models.usuario import Usuario


class CriarUsuarioService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError("Os dados do usuário são obrigatórios.")

        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")

        if not nome or not nome.strip():
            raise ValueError("O nome é obrigatório.")

        if not email or not email.strip():
            raise ValueError("O e-mail é obrigatório.")

        if not senha:
            raise ValueError("A senha é obrigatória.")

        nome = nome.strip()
        email = email.strip().lower()

        if len(nome) < 2:
            raise ValueError(
                "O nome deve possuir pelo menos 2 caracteres."
            )

        if "@" not in email:
            raise ValueError("Informe um e-mail válido.")

        if len(senha) < 6:
            raise ValueError(
                "A senha deve possuir pelo menos 6 caracteres."
            )

        usuario_existente = Usuario.buscar_por_email(email)

        if usuario_existente:
            raise ValueError("Já existe um usuário com este e-mail.")

        usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=generate_password_hash(senha),
        )

        return usuario.salvar()