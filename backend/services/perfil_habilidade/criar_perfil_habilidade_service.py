from models.enums import NivelHabilidade
from models.habilidade import Habilidade
from models.perfil_habilidade import PerfilHabilidade
from repositories.perfil_repository import (
    PerfilRepository,
)


class CriarPerfilHabilidadeService:
    @staticmethod
    def executar(usuario, dados):
        if not dados:
            raise ValueError(
                "Os dados da habilidade do perfil são obrigatórios."
            )

        habilidade_id = dados.get(
            "habilidadeId"
        )

        nivel_dominio = dados.get(
            "nivelDominio"
        )

        if habilidade_id is None:
            raise ValueError(
                "A habilidade é obrigatória."
            )

        if nivel_dominio is None:
            raise ValueError(
                "O nível de domínio é obrigatório."
            )

        # O perfil vem sempre da sessão autenticada.
        # Qualquer "perfilProfissionalId" enviado no
        # JSON é ignorado.
        perfil = usuario.perfil_profissional

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        perfil_profissional_id = perfil.id

        habilidade = Habilidade.buscar_por_id(
            habilidade_id
        )

        if habilidade is None:
            raise LookupError(
                "Habilidade não encontrada."
            )

        existente = (
            PerfilRepository.buscar_perfil_habilidade(
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