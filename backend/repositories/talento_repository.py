from sqlalchemy import text

from extensions import db


class TalentoRepository:
    @staticmethod
    def ranking_por_vaga(
        vaga_id,
    ):
        consulta = text(
            """
            CALL sp_ranking_talentos_por_vaga(
                :vaga_id
            )
            """
        )

        resultado = db.session.execute(
            consulta,
            {
                "vaga_id": vaga_id,
            },
        )

        return [
            dict(linha)
            for linha
            in resultado.mappings().all()
        ]