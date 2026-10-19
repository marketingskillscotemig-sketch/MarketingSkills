import re

from werkzeug.security import generate_password_hash

from extensions import db
from models.empresa import Empresa
from models.enums import TipoConta
from models.usuario import Usuario
from repositories.conta_repository import (
    ContaRepository,
)
from utils.validador_cnpj import (
    cnpj_valido,
    normalizar_cnpj,
)


TAMANHO_MAXIMO_NOME = 120
TAMANHO_MAXIMO_EMAIL = 180
TAMANHO_MINIMO_SENHA = 8
TAMANHO_MAXIMO_SENHA = 128

# Formato simples: algo@dominio.tld
_PADRAO_EMAIL = re.compile(
    r"[^@\s]+@"
    r"(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+"
    r"[a-z]{2,}"
)


def validar_nome(nome):
    """
    Valida e normaliza o nome do usuário.
    Mesma regra no cadastro e na atualização.
    """
    if nome is None or (
        isinstance(nome, str)
        and not nome.strip()
    ):
        raise ValueError(
            "O nome é obrigatório."
        )

    if not isinstance(nome, str):
        raise ValueError(
            "O nome deve ser um texto."
        )

    nome = nome.strip()

    if len(nome) < 2:
        raise ValueError(
            "O nome deve possuir pelo menos 2 caracteres."
        )

    if len(nome) > TAMANHO_MAXIMO_NOME:
        raise ValueError(
            "O nome deve possuir no máximo 120 caracteres."
        )

    return nome


def validar_email(email):
    """
    Valida e normaliza o e-mail.
    Mesma regra no cadastro e na atualização.
    """
    if email is None or (
        isinstance(email, str)
        and not email.strip()
    ):
        raise ValueError(
            "O e-mail é obrigatório."
        )

    if not isinstance(email, str):
        raise ValueError(
            "Informe um e-mail válido."
        )

    email = email.strip().lower()

    if len(email) > TAMANHO_MAXIMO_EMAIL:
        raise ValueError(
            "O e-mail deve possuir no máximo "
            "180 caracteres."
        )

    if not _PADRAO_EMAIL.fullmatch(email):
        raise ValueError(
            "Informe um e-mail válido."
        )

    return email


def validar_senha(senha, email):
    """
    Política de senha. Mesma regra no cadastro
    e na alteração de senha.
    """
    if senha is None or senha == "":
        raise ValueError(
            "A senha é obrigatória."
        )

    if not isinstance(senha, str):
        raise ValueError(
            "A senha deve ser um texto."
        )

    if len(senha) < TAMANHO_MINIMO_SENHA:
        raise ValueError(
            "A senha deve possuir pelo menos 8 caracteres."
        )

    if len(senha) > TAMANHO_MAXIMO_SENHA:
        raise ValueError(
            "A senha deve possuir no máximo 128 caracteres."
        )

    if senha.strip().lower() == email.strip().lower():
        raise ValueError(
            "A senha não pode ser igual ao e-mail."
        )

    return senha


class CriarUsuarioService:
    @staticmethod
    def executar(dados):
        if not dados or not isinstance(dados, dict):
            raise ValueError(
                "Os dados do usuário são obrigatórios."
            )

        nome = validar_nome(
            dados.get("nome")
        )

        email = validar_email(
            dados.get("email")
        )

        senha = validar_senha(
            dados.get("senha"),
            email,
        )

        tipo_conta = dados.get(
            "tipoConta",
            TipoConta.ESTUDANTE.value,
        )

        nome_empresa = dados.get(
            "nomeEmpresa"
        )

        razao_social = dados.get(
            "razaoSocial"
        )

        cnpj = dados.get(
            "cnpj"
        )

        usuario_existente = (
            ContaRepository.buscar_usuario_por_email(
                email
            )
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

        if (
            tipo_conta_enum ==
            TipoConta.EMPRESA
        ):
            if (
                not isinstance(nome_empresa, str)
                or not nome_empresa.strip()
            ):
                raise ValueError(
                    "O nome fantasia da empresa é obrigatório."
                )

            if (
                not isinstance(razao_social, str)
                or not razao_social.strip()
            ):
                raise ValueError(
                    "A Razão Social da empresa é obrigatória."
                )

            if not cnpj:
                raise ValueError(
                    "O CNPJ da empresa é obrigatório."
                )

            nome_empresa = (
                nome_empresa.strip()
            )

            razao_social = (
                razao_social.strip()
            )

            cnpj = normalizar_cnpj(
                cnpj
            )

            if len(nome_empresa) < 2:
                raise ValueError(
                    "O nome fantasia deve possuir "
                    "pelo menos 2 caracteres."
                )

            if len(nome_empresa) > 150:
                raise ValueError(
                    "O nome fantasia deve possuir "
                    "no máximo 150 caracteres."
                )

            if len(razao_social) < 2:
                raise ValueError(
                    "A Razão Social deve possuir "
                    "pelo menos 2 caracteres."
                )

            if len(razao_social) > 180:
                raise ValueError(
                    "A Razão Social deve possuir "
                    "no máximo 180 caracteres."
                )

            if not cnpj_valido(
                cnpj
            ):
                raise ValueError(
                    "Informe um CNPJ válido."
                )

            empresa_existente = (
                ContaRepository.buscar_empresa_por_cnpj(
                    cnpj
                )
            )

            if empresa_existente:
                raise ValueError(
                    "Já existe uma empresa cadastrada "
                    "com este CNPJ."
                )

        usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=generate_password_hash(
                senha
            ),
            tipo_conta=tipo_conta_enum,
        )

        try:
            db.session.add(
                usuario
            )

            db.session.flush()

            if (
                tipo_conta_enum ==
                TipoConta.EMPRESA
            ):
                empresa = Empresa(
                    usuario_id=usuario.id,
                    nome=nome_empresa,
                    razao_social=razao_social,
                    cnpj=cnpj,
                )

                db.session.add(
                    empresa
                )

            db.session.commit()

            return usuario

        except Exception:
            db.session.rollback()
            raise