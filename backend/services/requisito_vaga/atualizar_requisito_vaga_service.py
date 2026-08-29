from models.enums import NivelHabilidade
from models.habilidade import Habilidade
from models.requisito_vaga import RequisitoVaga
from repositories.vaga_repository import (
    VagaRepository,
)


class AtualizarRequisitoVagaService:
    @staticmethod
    def executar(requisito_id, dados):
        requisito = RequisitoVaga.buscar_por_id(
            requisito_id
        )

        if requisito is None:
            raise LookupError(
                "Requisito da vaga não encontrado."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        if "vagaId" in dados:
            raise ValueError(
                "A vaga do requisito não pode ser alterada."
            )

        campos_permitidos = {
            "habilidadeId",
            "nivelExigido",
            "obrigatorio",
            "peso",
            "descricao",
        }

        if not any(
            campo in dados
            for campo in campos_permitidos
        ):
            raise ValueError(
                "Nenhum campo válido foi informado para atualização."
            )

        habilidade_id = dados.get("habilidadeId")
        nivel_exigido = dados.get("nivelExigido")
        obrigatorio = dados.get("obrigatorio")
        peso = dados.get("peso")
        descricao = dados.get("descricao")

        if habilidade_id is not None:
            habilidade = Habilidade.buscar_por_id(
                habilidade_id
            )

            if habilidade is None:
                raise LookupError(
                    "Habilidade não encontrada."
                )

            requisito_existente = (
                VagaRepository.buscar_requisito_por_vaga_e_habilidade(
                    requisito.vaga_id,
                    habilidade_id,
                )
            )

            if (
                requisito_existente is not None
                and requisito_existente.id != requisito.id
            ):
                raise ValueError(
                    "Esta habilidade já é um requisito desta vaga."
                )

        nivel_enum = None

        if nivel_exigido is not None:
            try:
                nivel_enum = NivelHabilidade(
                    nivel_exigido
                )
            except ValueError as erro:
                raise ValueError(
                    "Nível exigido inválido."
                ) from erro

        if (
            obrigatorio is not None
            and not isinstance(obrigatorio, bool)
        ):
            raise ValueError(
                "O campo obrigatório deve ser booleano."
            )

        if peso is not None:
            if (
                not isinstance(peso, (int, float))
                or isinstance(peso, bool)
            ):
                raise ValueError(
                    "O peso deve ser numérico."
                )

            if peso < 0:
                raise ValueError(
                    "O peso não pode ser negativo."
                )

            if peso > 999.99:
                raise ValueError(
                    "O peso não pode ser maior que 999.99."
                )

        if descricao is not None:
            if not isinstance(descricao, str):
                raise ValueError(
                    "A descrição deve ser um texto."
                )

            descricao = descricao.strip()

        return requisito.atualizar(
            habilidade_id=habilidade_id,
            nivel_exigido=nivel_enum,
            obrigatorio=obrigatorio,
            peso=peso,
            descricao=descricao,
        )