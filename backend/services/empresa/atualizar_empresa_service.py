from models.empresa import Empresa


class AtualizarEmpresaService:
    @staticmethod
    def executar(empresa_id, dados):
        empresa = Empresa.buscar_por_id(
            empresa_id
        )

        if empresa is None:
            raise LookupError(
                "Empresa não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        nome = dados.get("nome")
        setor = dados.get("setor")
        descricao = dados.get("descricao")
        site = dados.get("site")

        if nome is not None:
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

        return empresa.atualizar(
            nome=nome,
            setor=setor,
            descricao=descricao,
            site=site,
        )