from models.enums import NivelHabilidade
from models.perfil_habilidade import PerfilHabilidade


class AtualizarPerfilHabilidadeService:
    @staticmethod
    def executar(perfil_habilidade_id, dados):
        perfil_habilidade = (
            PerfilHabilidade.buscar_por_id(
                perfil_habilidade_id
            )
        )

        if perfil_habilidade is None:
            raise LookupError(
                "Habilidade do perfil não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe o nível de domínio para atualização."
            )

        nivel_dominio = dados.get(
            "nivelDominio"
        )

        if nivel_dominio is None:
            raise ValueError(
                "O nível de domínio é obrigatório."
            )

        try:
            nivel_enum = NivelHabilidade(
                nivel_dominio
            )
        except ValueError as erro:
            raise ValueError(
                "Nível de domínio inválido."
            ) from erro

        return perfil_habilidade.atualizar(
            nivel_dominio=nivel_enum
        )