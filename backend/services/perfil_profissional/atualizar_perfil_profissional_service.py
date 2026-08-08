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

        nivel_experiencia = dados.get(
            "nivelExperiencia"
        )

        modalidade_preferida = dados.get(
            "modalidadePreferida"
        )

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

        nivel_enum = None

        if nivel_experiencia is not None:
            try:
                nivel_enum = NivelExperiencia(
                    nivel_experiencia
                )
            except ValueError as erro:
                raise ValueError(
                    "Nível de experiência inválido."
                ) from erro

        modalidade_enum = None

        if modalidade_preferida is not None:
            try:
                modalidade_enum = ModalidadeTrabalho(
                    modalidade_preferida
                )
            except ValueError as erro:
                raise ValueError(
                    "Modalidade de trabalho inválida."
                ) from erro

        if (
            horas_semanais_estudo is not None
            and (
                not isinstance(horas_semanais_estudo, int)
                or horas_semanais_estudo < 0
            )
        ):
            raise ValueError(
                "Horas semanais de estudo devem ser "
                "um número inteiro maior ou igual a zero."
            )

        if (
            pretensao_salarial is not None
            and pretensao_salarial < 0
        ):
            raise ValueError(
                "A pretensão salarial não pode ser negativa."
            )

        return perfil.atualizar(
            nivel_experiencia=nivel_enum,
            objetivo_profissional=objetivo_profissional,
            modalidade_preferida=modalidade_enum,
            localizacao_preferida=localizacao_preferida,
            horas_semanais_estudo=horas_semanais_estudo,
            pretensao_salarial=pretensao_salarial,
        )