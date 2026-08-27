import re

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

        argumentos = {}

        if "nome" in dados:
            nome = (
                dados.get("nome") or ""
            ).strip()

            if len(nome) < 2:
                raise ValueError(
                    "O nome da empresa deve possuir "
                    "pelo menos 2 caracteres."
                )

            argumentos["nome"] = nome

        if "razaoSocial" in dados:
            argumentos["razao_social"] = (
                dados.get("razaoSocial") or ""
            ).strip()

        if "cnpj" in dados:
            cnpj = (
                dados.get("cnpj") or ""
            ).strip()

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
                    Empresa.buscar_por_cnpj(
                        cnpj
                    )
                )

                if (
                    empresa_existente
                    and
                    empresa_existente.id !=
                    empresa.id
                ):
                    raise ValueError(
                        "Já existe uma empresa cadastrada "
                        "com este CNPJ."
                    )

                argumentos["cnpj"] = cnpj

            else:
                argumentos["cnpj"] = None

        if "setor" in dados:
            argumentos["setor"] = (
                dados.get("setor") or ""
            ).strip()

        if "porte" in dados:
            argumentos["porte"] = (
                dados.get("porte") or ""
            ).strip()

        if "localizacao" in dados:
            argumentos["localizacao"] = (
                dados.get("localizacao") or ""
            ).strip()

        if "trabalhoRemoto" in dados:
            argumentos[
                "trabalho_remoto"
            ] = bool(
                dados.get(
                    "trabalhoRemoto"
                )
            )

        if "descricao" in dados:
            argumentos["descricao"] = (
                dados.get("descricao") or ""
            ).strip()

        if "site" in dados:
            argumentos["site"] = (
                dados.get("site") or ""
            ).strip()

        if "linkedin" in dados:
            argumentos["linkedin"] = (
                dados.get("linkedin") or ""
            ).strip()

        if "stackTecnologico" in dados:
            argumentos[
                "stack_tecnologico"
            ] = (
                dados.get(
                    "stackTecnologico"
                ) or ""
            ).strip()

        if "beneficios" in dados:
            argumentos["beneficios"] = (
                dados.get("beneficios") or ""
            ).strip()

        return empresa.atualizar(
            **argumentos
        )