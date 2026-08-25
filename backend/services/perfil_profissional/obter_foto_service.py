from pathlib import Path

from models.perfil_profissional import PerfilProfissional


class ObterFotoService:
    @staticmethod
    def executar(perfil_id):
        perfil = PerfilProfissional.buscar_por_id(
            perfil_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        pasta_backend = (
            Path(__file__)
            .resolve()
            .parents[2]
        )

        pasta_fotos = (
            pasta_backend
            / "uploads"
            / "fotos"
        )

        for extensao, mimetype in (
            (".png", "image/png"),
            (".jpg", "image/jpeg"),
        ):
            caminho = (
                pasta_fotos
                / f"perfil_{perfil_id}{extensao}"
            )

            if caminho.exists():
                return caminho, mimetype

        raise LookupError(
            "Foto de perfil não encontrada."
        )