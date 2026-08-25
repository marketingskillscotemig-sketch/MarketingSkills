from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
)
from models.perfil_profissional import PerfilProfissional


class AtualizarPerfilProfissionalService:
    @staticmethod
    def executar(perfil_id, dados):
        perfil = PerfilProfissional.buscar_por_id(
            perfil_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        nivel_enum = None

        if "nivelExperiencia" in dados:
            nivel_experiencia = dados.get(
                "nivelExperiencia"
            )

            if nivel_experiencia not in (
                None,
                "",
            ):
                try:
                    nivel_enum = NivelExperiencia(
                        nivel_experiencia
                    )

                except ValueError as erro:
                    raise ValueError(
                        "Nível de experiência inválido."
                    ) from erro

        modalidade_enum = None

        if "modalidadePreferida" in dados:
            modalidade_preferida = dados.get(
                "modalidadePreferida"
            )

            if modalidade_preferida not in (
                None,
                "",
            ):
                try:
                    modalidade_enum = ModalidadeTrabalho(
                        modalidade_preferida
                    )

                except ValueError as erro:
                    raise ValueError(
                        "Modalidade de trabalho inválida."
                    ) from erro

        objetivo_profissional = dados.get(
            "objetivoProfissional"
        )

        localizacao_preferida = dados.get(
            "localizacaoPreferida"
        )

        horas_semanais_estudo = dados.get(
            "horasSemanaisEstudo"
        )

        pretensao_salarial = dados.get(
            "pretensaoSalarial"
        )

        foto_url = dados.get(
            "fotoUrl"
        )

        sobre_mim = dados.get(
            "sobreMim"
        )

        curriculo_url = dados.get(
            "curriculoUrl"
        )

        if (
            horas_semanais_estudo is not None
            and (
                not isinstance(
                    horas_semanais_estudo,
                    int,
                )
                or isinstance(
                    horas_semanais_estudo,
                    bool,
                )
                or horas_semanais_estudo < 0
            )
        ):
            raise ValueError(
                "Horas semanais de estudo devem ser "
                "um número inteiro maior ou igual a zero."
            )

        if (
            pretensao_salarial is not None
            and (
                not isinstance(
                    pretensao_salarial,
                    (int, float),
                )
                or isinstance(
                    pretensao_salarial,
                    bool,
                )
                or pretensao_salarial < 0
            )
        ):
            raise ValueError(
                "A pretensão salarial não pode ser negativa."
            )

        if "fotoUrl" in dados:
            foto_url = (
                AtualizarPerfilProfissionalService
                .validar_texto_opcional(
                    foto_url,
                    "A URL da foto",
                    500,
                )
            )

        if "sobreMim" in dados:
            sobre_mim = (
                AtualizarPerfilProfissionalService
                .validar_texto_opcional(
                    sobre_mim,
                    "O campo sobre mim",
                    None,
                )
            )

        if "curriculoUrl" in dados:
            curriculo_url = (
                AtualizarPerfilProfissionalService
                .validar_texto_opcional(
                    curriculo_url,
                    "A URL do currículo",
                    500,
                )
            )

        return perfil.atualizar(
            nivel_experiencia=nivel_enum,
            objetivo_profissional=objetivo_profissional,
            modalidade_preferida=modalidade_enum,
            localizacao_preferida=localizacao_preferida,
            horas_semanais_estudo=horas_semanais_estudo,
            pretensao_salarial=pretensao_salarial,
            foto_url=foto_url,
            sobre_mim=sobre_mim,
            curriculo_url=curriculo_url,
        )

    @staticmethod
    def validar_texto_opcional(
        valor,
        nome_campo,
        limite,
    ):
        if valor is None:
            return None

        if not isinstance(valor, str):
            raise ValueError(
                f"{nome_campo} deve ser um texto."
            )

        valor = valor.strip()

        if (
            limite is not None
            and len(valor) > limite
        ):
            raise ValueError(
                f"{nome_campo} não pode possuir "
                f"mais de {limite} caracteres."
            )

        return valor