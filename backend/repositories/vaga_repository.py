from sqlalchemy import text

from extensions import db


class VagaRepository:
    @staticmethod
    def buscar_avancado(
        texto_busca=None,
        nivel=None,
        modalidade=None,
        localizacao=None,
        habilidade_id=None,
    ):
        consulta = text(
            """
            CALL sp_buscar_vagas_avancado(
                :texto_busca,
                :nivel,
                :modalidade,
                :localizacao,
                :habilidade_id
            )
            """
        )

        parametros = {
            "texto_busca": texto_busca,
            "nivel": nivel,
            "modalidade": modalidade,
            "localizacao": localizacao,
            "habilidade_id": habilidade_id,
        }

        resultado = db.session.execute(
            consulta,
            parametros,
        )

        return [
            dict(linha)
            for linha in resultado.mappings().all()
        ]