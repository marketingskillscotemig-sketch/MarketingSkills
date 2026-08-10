from werkzeug.security import generate_password_hash

from models.enums import TipoConta
from models.usuario import Usuario


class CriarUsuarioService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados do usuário são obrigatórios."
            )

        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")
        tipo_conta = dados.get(
            "tipoConta",
            TipoConta.ESTUDANTE.value,
        )

        if not nome or not nome.strip():
            raise ValueError(
                "O nome é obrigatório."
            )

        if not email or not email.strip():
            raise ValueError(
                "O e-mail é obrigatório."
            )

        if not senha:
            raise ValueError(
                "A senha é obrigatória."
            )

        nome = nome.strip()
        email = email.strip().lower()

        if len(nome) < 2:
            raise ValueError(
                "O nome deve possuir pelo menos 2 caracteres."
            )

        if "@" not in email:
            raise ValueError(
                "Informe um e-mail válido."
            )

        if len(senha) < 6:
            raise ValueError(
                "A senha deve possuir pelo menos 6 caracteres."
            )

        usuario_existente = Usuario.buscar_por_email(
            email
        )

        if usuario_existente:
            raise ValueError(
                "Já existe um usuário com este e-mail."
            )

        try:
            tipo_conta_enum = TipoConta(
                tipo_conta
            )

        except ValueError as erro:
            raise ValueError(
                "Tipo de conta inválido. "
                "Use 'estudante' ou 'empresa'."
            ) from erro

        usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=generate_password_hash(
                senha
            ),
            tipo_conta=tipo_conta_enum,
        )

        return usuario.salvar()