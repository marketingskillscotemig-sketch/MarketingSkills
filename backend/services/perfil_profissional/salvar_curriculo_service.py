from pathlib import Path

from models.perfil_profissional import PerfilProfissional


class SalvarCurriculoService:
    TAMANHO_MAXIMO = 5 * 1024 * 1024

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
                "Selecione um currículo em PDF."
            )

        if not arquivo.filename.lower().endswith(
            ".pdf"
        ):
            raise ValueError(
                "O currículo deve estar no formato PDF."
            )

        arquivo.stream.seek(0, 2)
        tamanho = arquivo.stream.tell()
        arquivo.stream.seek(0)

        if tamanho > SalvarCurriculoService.TAMANHO_MAXIMO:
            raise ValueError(
                "O currículo deve possuir no máximo 5 MB."
            )

        assinatura = arquivo.stream.read(5)
        arquivo.stream.seek(0)

        if assinatura != b"%PDF-":
            raise ValueError(
                "O arquivo enviado não é um PDF válido."
            )

        pasta_backend = (
            Path(__file__)
            .resolve()
            .parents[2]
        )

        pasta_curriculos = (
            pasta_backend
            / "uploads"
            / "curriculos"
        )

        pasta_curriculos.mkdir(
            parents=True,
            exist_ok=True,
        )

        nome_arquivo = (
            f"perfil_{perfil_id}.pdf"
        )

        caminho = (
            pasta_curriculos
            / nome_arquivo
        )

        arquivo.save(caminho)

        curriculo_url = (
            f"/api/perfis-profissionais/"
            f"{perfil_id}/curriculo"
        )

        return perfil.atualizar(
            curriculo_url=curriculo_url
        )