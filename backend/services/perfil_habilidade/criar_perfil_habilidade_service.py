from models.enums import NivelHabilidade
from models.habilidade import Habilidade
from models.perfil_habilidade import PerfilHabilidade
from models.perfil_profissional import PerfilProfissional


class CriarPerfilHabilidadeService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da habilidade do perfil são obrigatórios."
            )

        perfil_profissional_id = dados.get(
            "perfilProfissionalId"
        )

        habilidade_id = dados.get(
            "habilidadeId"
        )

        nivel_dominio = dados.get(
            "nivelDominio"
        )

        if perfil_profissional_id is None:
            raise ValueError(
                "O perfil profissional é obrigatório."
            )

        if habilidade_id is None:
            raise ValueError(
                "A habilidade é obrigatória."
            )

        if nivel_dominio is None:
            raise ValueError(
                "O nível de domínio é obrigatório."
            )

        perfil = PerfilProfissional.buscar_por_id(
            perfil_profissional_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        habilidade = Habilidade.buscar_por_id(
            habilidade_id
        )

        if habilidade is None:
            raise LookupError(
                "Habilidade não encontrada."
            )

        existente = (
            PerfilHabilidade.buscar_por_perfil_e_habilidade(
                perfil_profissional_id,
                habilidade_id,
            )
        )

        if existente is not None:
            raise ValueError(
                "Esta habilidade já está cadastrada neste perfil."
            )

        try:
            nivel_enum = NivelHabilidade(
                nivel_dominio
            )
        except ValueError as erro:
            raise ValueError(
                "Nível de domínio inválido."
            ) from erro

        perfil_habilidade = PerfilHabilidade(
            perfil_profissional_id=perfil_profissional_id,
            habilidade_id=habilidade_id,
            nivel_dominio=nivel_enum,
        )

        return perfil_habilidade.salvar()