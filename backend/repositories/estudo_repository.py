from extensions import db
from models.etapa_estudo import EtapaEstudo


class EstudoRepository:
    @staticmethod
    def buscar_etapa_por_plano_e_ordem(
        plano_estudo_id,
        ordem,
    ):
        return db.session.execute(
            db.select(EtapaEstudo).where(
                EtapaEstudo.plano_estudo_id == plano_estudo_id,
                EtapaEstudo.ordem == ordem,
            )
        ).scalar_one_or_none()
