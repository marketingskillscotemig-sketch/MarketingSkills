from models.empresa import Empresa


class CriarEmpresaService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da empresa são obrigatórios."
            )

        nome = dados.get("nome")
        setor = dados.get("setor")
        descricao = dados.get("descricao")
        site = dados.get("site")

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

        if setor is not None:
            setor = setor.strip()

        if descricao is not None:
            descricao = descricao.strip()

        if site is not None:
            site = site.strip()

        empresa = Empresa(
            nome=nome,
            setor=setor,
            descricao=descricao,
            site=site,
        )

        return empresa.salvar()