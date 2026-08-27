from pathlib import Path

from models.empresa import Empresa


class ObterImagemEmpresaService:
    TIPOS_PERMITIDOS = {
        "logo",
        "banner",
    }

    @staticmethod
    def executar(
        empresa_id,
        tipo,
    ):
        empresa = Empresa.buscar_por_id(
            empresa_id
        )

        if empresa is None:
            raise LookupError(
                "Empresa não encontrada."
            )

        if tipo not in (
            ObterImagemEmpresaService
            .TIPOS_PERMITIDOS
        ):
            raise LookupError(
                "Tipo de imagem inválido."
            )

        pasta_backend = (
            Path(__file__)
            .resolve()
            .parents[2]
        )

        pasta_imagens = (
            pasta_backend
            / "uploads"
            / "empresas"
            / tipo
        )

        for extensao, mimetype in (
            (".png", "image/png"),
            (".jpg", "image/jpeg"),
        ):
            caminho = (
                pasta_imagens
                / (
                    f"empresa_{empresa_id}"
                    f"{extensao}"
                )
            )

            if caminho.exists():
                return (
                    caminho,
                    mimetype,
                )

        nome_imagem = (
            "Logo"
            if tipo == "logo"
            else "Banner"
        )

        raise LookupError(
            f"{nome_imagem} da empresa "
            "não encontrado."
        )