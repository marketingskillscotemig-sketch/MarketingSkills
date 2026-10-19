from models.empresa import Empresa
from repositories.conta_repository import (
    ContaRepository,
)
from utils.validador_cnpj import (
    cnpj_valido,
    normalizar_cnpj,
)


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
            cnpj = dados.get("cnpj")

            # CNPJ vazio ou null é ignorado:
            # o CNPJ atual é mantido.
            if (
                cnpj is not None
                and str(cnpj).strip()
            ):
                cnpj = normalizar_cnpj(
                    cnpj
                )

                if not cnpj_valido(cnpj):
                    raise ValueError(
                        "Informe um CNPJ válido."
                    )

                empresa_existente = (
                    ContaRepository.buscar_empresa_por_cnpj(
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