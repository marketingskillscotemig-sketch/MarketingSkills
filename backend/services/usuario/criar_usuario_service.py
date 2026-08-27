import re

from werkzeug.security import generate_password_hash

from extensions import db
from models.empresa import Empresa
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

        nome_empresa = dados.get(
            "nomeEmpresa"
        )

        razao_social = dados.get(
            "razaoSocial"
        )

        cnpj = dados.get(
            "cnpj"
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

        if len(nome) > 120:
            raise ValueError(
                "O nome deve possuir no máximo 120 caracteres."
            )

        if "@" not in email:
            raise ValueError(
                "Informe um e-mail válido."
            )

        if len(senha) < 6:
            raise ValueError(
                "A senha deve possuir pelo menos 6 caracteres."
            )

        usuario_existente = (
            Usuario.buscar_por_email(
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
                not nome_empresa
                or not nome_empresa.strip()
            ):
                raise ValueError(
                    "O nome fantasia da empresa é obrigatório."
                )

            if (
                not razao_social
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

            cnpj = (
                CriarUsuarioService
                .normalizar_cnpj(
                    cnpj
                )
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

            if not (
                CriarUsuarioService
                .cnpj_valido(
                    cnpj
                )
            ):
                raise ValueError(
                    "Informe um CNPJ válido."
                )

            empresa_existente = (
                Empresa.buscar_por_cnpj(
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

    @staticmethod
    def normalizar_cnpj(
        cnpj
    ):
        return re.sub(
            r"\D",
            "",
            str(cnpj),
        )

    @staticmethod
    def cnpj_valido(
        cnpj
    ):
        if not cnpj:
            return False

        if len(cnpj) != 14:
            return False

        if not cnpj.isdigit():
            return False

        if cnpj == cnpj[0] * 14:
            return False

        primeiro_digito = (
            CriarUsuarioService
            .calcular_digito_cnpj(
                cnpj[:12],
                [
                    5, 4, 3, 2,
                    9, 8, 7, 6,
                    5, 4, 3, 2,
                ],
            )
        )

        segundo_digito = (
            CriarUsuarioService
            .calcular_digito_cnpj(
                cnpj[:12] +
                str(
                    primeiro_digito
                ),
                [
                    6, 5, 4, 3, 2,
                    9, 8, 7, 6,
                    5, 4, 3, 2,
                ],
            )
        )

        return (
            cnpj[-2:] ==
            f"{primeiro_digito}"
            f"{segundo_digito}"
        )

    @staticmethod
    def calcular_digito_cnpj(
        numeros,
        pesos,
    ):
        soma = sum(
            int(numero) * peso
            for numero, peso
            in zip(
                numeros,
                pesos,
            )
        )

        resto = soma % 11

        if resto < 2:
            return 0

        return 11 - resto