import math

from models.vaga import Vaga
from repositories.perfil_repository import (
    PerfilRepository,
)
from repositories.vaga_repository import (
    VagaRepository,
)


class CalcularCompatibilidadeVagaService:
    """
    Caso de uso: calcular a compatibilidade entre o
    perfil do estudante autenticado e uma vaga.

    Regra: percentual = requisitos atendidos
    ÷ total de requisitos × 100 (arredondado).
    Um requisito é atendido quando a habilidade
    exigida está cadastrada no perfil do estudante.
    """

    @staticmethod
    def executar(
        usuario,
        vaga_id,
    ):
        vaga = Vaga.buscar_por_id(
            vaga_id
        )

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        requisitos = (
            VagaRepository
            .listar_requisitos_da_vaga(
                vaga.id
            )
        )

        perfil = (
            PerfilRepository
            .buscar_perfil_por_usuario_id(
                usuario.id
            )
        )

        # Sem perfil não há habilidades para comparar:
        # o frontend pede para o estudante completá-lo.
        habilidades_do_perfil = (
            PerfilRepository
            .listar_ids_habilidades_do_perfil(
                perfil.id
            )
            if perfil is not None
            else set()
        )

        itens = [
            {
                "requisitoId": requisito.id,
                "habilidadeId": requisito.habilidade_id,
                "obrigatorio": bool(
                    requisito.obrigatorio
                ),
                "atendido": (
                    requisito.habilidade_id
                    in habilidades_do_perfil
                ),
            }
            for requisito in requisitos
        ]

        total = len(itens)

        atendidos = sum(
            1
            for item in itens
            if item["atendido"]
        )

        obrigatorios_pendentes = sum(
            1
            for item in itens
            if item["obrigatorio"]
            and not item["atendido"]
        )

        percentual = None

        if perfil is not None and total > 0:
            # floor(x + 0,5) arredonda .5 para cima,
            # igual ao Math.round do JavaScript.
            percentual = math.floor(
                atendidos / total * 100 + 0.5
            )

        return {
            "vagaId": vaga.id,
            "possuiPerfil": perfil is not None,
            "totalRequisitos": total,
            "requisitosAtendidos": atendidos,
            "obrigatoriosPendentes": obrigatorios_pendentes,
            "percentual": percentual,
            "requisitos": itens,
        }
