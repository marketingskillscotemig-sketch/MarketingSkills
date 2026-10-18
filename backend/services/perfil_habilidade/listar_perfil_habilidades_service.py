from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.perfil_habilidade import PerfilHabilidade


class ListarPerfilHabilidadesService:
    @staticmethod
    def executar(usuario):
        """
        Estudante: somente os próprios vínculos.
        Empresa: somente leitura, vínculos de perfis
        de estudantes ativos (Talentos e Vagas).
        """
        if usuario.tipo_conta == TipoConta.EMPRESA:
            return [
                registro
                for registro
                in PerfilHabilidade.listar_todos()
                if (
                    registro.perfil_profissional
                    is not None
                    and registro.perfil_profissional
                    .usuario.tipo_conta
                    == TipoConta.ESTUDANTE
                    and registro.perfil_profissional
                    .usuario.status
                    == StatusUsuario.ATIVO
                )
            ]

        perfil = usuario.perfil_profissional

        if perfil is None:
            return []

        return sorted(
            perfil.habilidades,
            key=lambda registro: registro.id,
        )
