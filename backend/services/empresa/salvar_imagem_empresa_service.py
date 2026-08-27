from pathlib import Path

from models.empresa import Empresa


class SalvarImagemEmpresaService:
    TAMANHO_MAXIMO_LOGO = 3 * 1024 * 1024
    TAMANHO_MAXIMO_BANNER = 5 * 1024 * 1024

    TIPOS_PERMITIDOS = {
        "logo",
        "banner",
    }

    @staticmethod
    def executar(
        empresa_id,
        arquivo,
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
            SalvarImagemEmpresaService
            .TIPOS_PERMITIDOS
        ):
            raise ValueError(
                "Tipo de imagem inválido."
            )

        if (
            arquivo is None
            or not arquivo.filename
        ):
            raise ValueError(
                "Selecione uma imagem PNG ou JPEG."
            )

        arquivo.stream.seek(0, 2)
        tamanho = arquivo.stream.tell()
        arquivo.stream.seek(0)

        tamanho_maximo = (
            SalvarImagemEmpresaService
            .TAMANHO_MAXIMO_LOGO
            if tipo == "logo"
            else
            SalvarImagemEmpresaService
            .TAMANHO_MAXIMO_BANNER
        )

        if tamanho > tamanho_maximo:
            limite_mb = (
                3
                if tipo == "logo"
                else 5
            )

            raise ValueError(
                f"A imagem deve possuir no máximo "
                f"{limite_mb} MB."
            )

        assinatura = arquivo.stream.read(8)
        arquivo.stream.seek(0)

        if assinatura.startswith(
            b"\x89PNG\r\n\x1a\n"
        ):
            extensao = ".png"

        elif assinatura.startswith(
            b"\xff\xd8\xff"
        ):
            extensao = ".jpg"

        else:
            raise ValueError(
                "A imagem deve estar no formato "
                "PNG ou JPEG."
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

        pasta_imagens.mkdir(
            parents=True,
            exist_ok=True,
        )

        for arquivo_antigo in (
            pasta_imagens.glob(
                f"empresa_{empresa_id}.*"
            )
        ):
            arquivo_antigo.unlink(
                missing_ok=True
            )

        nome_arquivo = (
            f"empresa_{empresa_id}"
            f"{extensao}"
        )

        caminho = (
            pasta_imagens
            / nome_arquivo
        )

        arquivo.save(caminho)

        imagem_url = (
            f"/api/empresas/"
            f"{empresa_id}/"
            f"{tipo}"
        )

        if tipo == "logo":
            return empresa.atualizar(
                logo_url=imagem_url
            )

        return empresa.atualizar(
            banner_url=imagem_url
        )