from pathlib import Path

from models.perfil_profissional import PerfilProfissional


class ObterCurriculoService:
    @staticmethod
    def executar(perfil_id):
        perfil = PerfilProfissional.buscar_por_id(
            perfil_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        if not perfil.curriculo_url:
            raise LookupError(
                "Currículo não encontrado."
            )

        pasta_backend = (
            Path(__file__)
            .resolve()
            .parents[2]
        )

        caminho = (
            pasta_backend
            / "uploads"
            / "curriculos"
            / f"perfil_{perfil_id}.pdf"
        )

        if not caminho.exists():
            raise LookupError(
                "Currículo não encontrado."
            )

        return caminho