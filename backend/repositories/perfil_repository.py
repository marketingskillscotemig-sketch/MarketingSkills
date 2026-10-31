from extensions import db
from models.habilidade import Habilidade
from models.perfil_habilidade import PerfilHabilidade
from models.perfil_profissional import PerfilProfissional


class PerfilRepository:
    @staticmethod
    def buscar_habilidade_por_nome(nome):
        return db.session.execute(
            db.select(Habilidade).where(
                Habilidade.nome == nome
            )
        ).scalar_one_or_none()

    @staticmethod
    def buscar_perfil_por_usuario_id(usuario_id):
        return db.session.execute(
            db.select(
                PerfilProfissional
            ).where(
                PerfilProfissional.usuario_id
                == usuario_id
            )
        ).scalar_one_or_none()

    @staticmethod
    def buscar_perfil_habilidade(
        perfil_profissional_id,
        habilidade_id,
    ):
        return db.session.execute(
            db.select(PerfilHabilidade).where(
                PerfilHabilidade.perfil_profissional_id
                == perfil_profissional_id,
                PerfilHabilidade.habilidade_id
                == habilidade_id,
            )
        ).scalar_one_or_none()

    @staticmethod
    def listar_ids_habilidades_do_perfil(
        perfil_profissional_id,
    ):
        """
        IDs das habilidades que o estudante
        cadastrou no próprio perfil.
        """
        return set(
            db.session.execute(
                db.select(
                    PerfilHabilidade.habilidade_id
                ).where(
                    PerfilHabilidade.perfil_profissional_id
                    == perfil_profissional_id
                )
            ).scalars().all()
        )
