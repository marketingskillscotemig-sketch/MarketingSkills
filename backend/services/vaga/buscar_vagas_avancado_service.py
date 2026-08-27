from repositories.vaga_repository import (
    VagaRepository,
)


class BuscarVagasAvancadoService:
    NIVEIS_VALIDOS = {
        "iniciante",
        "junior",
        "pleno",
        "senior",
    }

    MODALIDADES_VALIDAS = {
        "presencial",
        "hibrido",
        "remoto",
    }

    @staticmethod
    def executar(
        texto=None,
        nivel=None,
        modalidade=None,
        localizacao=None,
        habilidade_id=None,
    ):
        texto = (
            texto.strip()
            if texto
            else None
        )

        nivel = (
            nivel.strip().lower()
            if nivel
            else None
        )

        modalidade = (
            modalidade.strip().lower()
            if modalidade
            else None
        )

        localizacao = (
            localizacao.strip()
            if localizacao
            else None
        )

        if (
            nivel
            and nivel
            not in
            BuscarVagasAvancadoService
            .NIVEIS_VALIDOS
        ):
            raise ValueError(
                "Nível de experiência inválido."
            )

        if (
            modalidade
            and modalidade
            not in
            BuscarVagasAvancadoService
            .MODALIDADES_VALIDAS
        ):
            raise ValueError(
                "Modalidade inválida."
            )

        if habilidade_id:
            try:
                habilidade_id = int(
                    habilidade_id
                )

            except (
                TypeError,
                ValueError,
            ) as erro:
                raise ValueError(
                    "O ID da habilidade "
                    "deve ser numérico."
                ) from erro

            if habilidade_id <= 0:
                raise ValueError(
                    "O ID da habilidade "
                    "deve ser maior que zero."
                )

        resultados = (
            VagaRepository
            .buscar_avancado(
                texto_busca=texto,
                nivel=nivel,
                modalidade=modalidade,
                localizacao=localizacao,
                habilidade_id=habilidade_id,
            )
        )

        return [
            {
                "id":
                    vaga["id"],

                "empresaId":
                    vaga["empresa_id"],

                "empresaNome":
                    vaga["empresa_nome"],

                "titulo":
                    vaga["titulo"],

                "descricao":
                    vaga["descricao"],

                "nivelExperiencia":
                    vaga["nivel_experiencia"],

                "modalidade":
                    vaga["modalidade"],

                "localizacao":
                    vaga["localizacao"],

                "salarioMinimo":
                    vaga["salario_minimo"],

                "salarioMaximo":
                    vaga["salario_maximo"],

                "dataPublicacao":
                    (
                        vaga[
                            "data_publicacao"
                        ].isoformat()
                        if vaga[
                            "data_publicacao"
                        ]
                        else None
                    ),

                "status":
                    vaga["status"],

                "beneficios":
                    vaga["beneficios"],
            }
            for vaga in resultados
        ]