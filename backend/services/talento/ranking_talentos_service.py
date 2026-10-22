from models.vaga import Vaga
from repositories.talento_repository import (
    TalentoRepository,
)


class RankingTalentosService:
    @staticmethod
    def executar(
        usuario,
        vaga_id,
    ):
        if not vaga_id:
            raise ValueError(
                "Informe o ID da vaga."
            )

        try:
            vaga_id = int(
                vaga_id
            )

        except (
            TypeError,
            ValueError,
        ) as erro:
            raise ValueError(
                "O ID da vaga deve ser numérico."
            ) from erro

        if vaga_id <= 0:
            raise ValueError(
                "O ID da vaga deve ser maior que zero."
            )

        # Autorização antes da consulta: a procedure
        # só roda para vaga existente e da própria empresa.
        vaga = Vaga.buscar_por_id(
            vaga_id
        )

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        if not vaga.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "consultar o ranking desta vaga."
            )

        resultados = (
            TalentoRepository
            .ranking_por_vaga(
                vaga_id
            )
        )

        return [
            {
                "perfilId":
                    item["perfil_id"],

                "usuarioId":
                    item["usuario_id"],

                "nome":
                    item["nome"],

                "requisitosTotais":
                    int(
                        item[
                            "requisitos_totais"
                        ] or 0
                    ),

                "requisitosAtendidos":
                    int(
                        item[
                            "requisitos_atendidos"
                        ] or 0
                    ),

                "percentualMatch":
                    float(
                        item[
                            "percentual_match"
                        ] or 0
                    ),
            }
            for item in resultados
        ]