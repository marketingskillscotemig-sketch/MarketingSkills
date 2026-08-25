from pathlib import Path

from models.perfil_profissional import PerfilProfissional


class SalvarFotoService:
    TAMANHO_MAXIMO = 3 * 1024 * 1024

    @staticmethod
    def executar(perfil_id, arquivo):
        perfil = PerfilProfissional.buscar_por_id(
            perfil_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
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

        if tamanho > SalvarFotoService.TAMANHO_MAXIMO:
            raise ValueError(
                "A foto deve possuir no máximo 3 MB."
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
                "A foto deve estar no formato PNG ou JPEG."
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

        pasta_fotos.mkdir(
            parents=True,
            exist_ok=True,
        )

        for arquivo_antigo in (
            pasta_fotos.glob(
                f"perfil_{perfil_id}.*"
            )
        ):
            arquivo_antigo.unlink(
                missing_ok=True
            )

        nome_arquivo = (
            f"perfil_{perfil_id}"
            f"{extensao}"
        )

        caminho = (
            pasta_fotos
            / nome_arquivo
        )

        arquivo.save(caminho)

        foto_url = (
            f"/api/perfis-profissionais/"
            f"{perfil_id}/foto"
        )

        return perfil.atualizar(
            foto_url=foto_url
        )