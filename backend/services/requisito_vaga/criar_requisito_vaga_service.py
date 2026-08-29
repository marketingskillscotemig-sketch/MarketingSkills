from models.enums import NivelHabilidade
from models.habilidade import Habilidade
from models.requisito_vaga import RequisitoVaga
from models.vaga import Vaga
from repositories.vaga_repository import (
    VagaRepository,
)


class CriarRequisitoVagaService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados do requisito da vaga são obrigatórios."
            )

        vaga_id = dados.get("vagaId")
        habilidade_id = dados.get("habilidadeId")
        nivel_exigido = dados.get("nivelExigido")
        obrigatorio = dados.get("obrigatorio", True)
        peso = dados.get("peso")
        descricao = dados.get("descricao")

        if vaga_id is None:
            raise ValueError(
                "A vaga é obrigatória."
            )

        if habilidade_id is None:
            raise ValueError(
                "A habilidade é obrigatória."
            )

        if nivel_exigido is None:
            raise ValueError(
                "O nível exigido é obrigatório."
            )

        vaga = Vaga.buscar_por_id(vaga_id)

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        habilidade = Habilidade.buscar_por_id(
            habilidade_id
        )

        if habilidade is None:
            raise LookupError(
                "Habilidade não encontrada."
            )

        requisito_existente = (
            VagaRepository.buscar_requisito_por_vaga_e_habilidade(
                vaga_id,
                habilidade_id,
            )
        )

        if requisito_existente is not None:
            raise ValueError(
                "Esta habilidade já é um requisito desta vaga."
            )

        try:
            nivel_enum = NivelHabilidade(
                nivel_exigido
            )
        except ValueError as erro:
            raise ValueError(
                "Nível exigido inválido."
            ) from erro

        if not isinstance(obrigatorio, bool):
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

        requisito = RequisitoVaga(
            vaga_id=vaga_id,
            habilidade_id=habilidade_id,
            nivel_exigido=nivel_enum,
            obrigatorio=obrigatorio,
            peso=peso,
            descricao=descricao,
        )

        return requisito.salvar()