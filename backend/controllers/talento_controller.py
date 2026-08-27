from flask import jsonify

from services.talento.listar_talentos_service import (
    ListarTalentosService,
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