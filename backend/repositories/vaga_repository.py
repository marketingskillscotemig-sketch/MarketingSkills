from sqlalchemy import text

from extensions import db
from models.requisito_vaga import RequisitoVaga


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

    @staticmethod
    def buscar_requisito_por_vaga_e_habilidade(
        vaga_id,
        habilidade_id,
    ):
        return db.session.execute(
            db.select(RequisitoVaga).where(
                RequisitoVaga.vaga_id == vaga_id,
                RequisitoVaga.habilidade_id == habilidade_id,
            )
        ).scalar_one_or_none()
