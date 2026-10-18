from flask import g, jsonify, request

from services.talento.listar_talentos_service import (
    ListarTalentosService,
)
from services.talento.ranking_talentos_service import (
    RankingTalentosService,
)


class TalentoController:
    @staticmethod
    def listar():
        talentos = (
            ListarTalentosService.executar()
        )

        return jsonify(
            [
                {
                    "id": talento.id,
                    "nome": talento.nome,
                    "email": talento.email,
                    "status": (
                        talento.status.value
                        if talento.status
                        else None
                    ),
                    "tipoConta": (
                        talento.tipo_conta.value
                        if talento.tipo_conta
                        else None
                    ),
                }
                for talento in talentos
            ]
        ), 200

    @staticmethod
    def ranking_por_vaga():
        try:
            resultado = (
                RankingTalentosService
                .executar(
                    g.usuario_autenticado,
                    request.args.get(
                        "vagaId"
                    ),
                )
            )

            return jsonify(
                resultado
            ), 200

        except PermissionError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 403

        except LookupError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 404

        except ValueError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 400