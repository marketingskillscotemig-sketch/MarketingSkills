import re

from models.empresa import Empresa
from repositories.conta_repository import (
    ContaRepository,
)


class CriarEmpresaService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da empresa são obrigatórios."
            )

        usuario_id = dados.get("usuarioId")
        nome = dados.get("nome")
        razao_social = dados.get("razaoSocial")
        cnpj = dados.get("cnpj")
        setor = dados.get("setor")
        porte = dados.get("porte")
        localizacao = dados.get("localizacao")
        trabalho_remoto = dados.get(
            "trabalhoRemoto",
            False,
        )
        descricao = dados.get("descricao")
        site = dados.get("site")
        linkedin = dados.get("linkedin")
        stack_tecnologico = dados.get(
            "stackTecnologico"
        )
        beneficios = dados.get("beneficios")

        if not usuario_id:
            raise ValueError(
                "O usuário responsável pela empresa é obrigatório."
            )

        if not nome or not nome.strip():
            raise ValueError(
                "O nome da empresa é obrigatório."
            )

        nome = nome.strip()

        if len(nome) < 2:
            raise ValueError(
                "O nome da empresa deve possuir "
                "pelo menos 2 caracteres."
            )

        razao_social = (
            razao_social.strip()
            if razao_social
            else None
        )

        setor = (
            setor.strip()
            if setor
            else None
        )

        porte = (
            porte.strip()
            if porte
            else None
        )

        localizacao = (
            localizacao.strip()
            if localizacao
            else None
        )

        descricao = (
            descricao.strip()
            if descricao
            else None
        )

        site = (
            site.strip()
            if site
            else None
        )

        linkedin = (
            linkedin.strip()
            if linkedin
            else None
        )

        stack_tecnologico = (
            stack_tecnologico.strip()
            if stack_tecnologico
            else None
        )

        beneficios = (
            beneficios.strip()
            if beneficios
            else None
        )

        if cnpj:
            cnpj = re.sub(
                r"\D",
                "",
                cnpj,
            )

            if len(cnpj) != 14:
                raise ValueError(
                    "O CNPJ deve possuir 14 dígitos."
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

        else:
            cnpj = None

        empresa = Empresa(
            usuario_id=usuario_id,
            nome=nome,
            razao_social=razao_social,
            cnpj=cnpj,
            setor=setor,
            porte=porte,
            localizacao=localizacao,
            trabalho_remoto=bool(
                trabalho_remoto
            ),
            descricao=descricao,
            site=site,
            linkedin=linkedin,
            stack_tecnologico=stack_tecnologico,
            beneficios=beneficios,
        )

        return empresa.salvar()