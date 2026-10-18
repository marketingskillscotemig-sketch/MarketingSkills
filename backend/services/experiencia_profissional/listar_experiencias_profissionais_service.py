from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.experiencia_profissional import ExperienciaProfissional


class ListarExperienciasProfissionaisService:
    @staticmethod
    def executar(usuario):
        """
        Estudante: somente as próprias experiências.
        Empresa: somente leitura, experiências de
        perfis de estudantes ativos (tela de talentos).
        """
        if usuario.tipo_conta == TipoConta.EMPRESA:
            return [
                experiencia
                for experiencia
                in ExperienciaProfissional.listar_todos()
                if (
                    experiencia.perfil_profissional
                    is not None
                    and experiencia.perfil_profissional
                    .usuario.tipo_conta
                    == TipoConta.ESTUDANTE
                    and experiencia.perfil_profissional
                    .usuario.status
                    == StatusUsuario.ATIVO
                )
            ]

        perfil = usuario.perfil_profissional

        if perfil is None:
            return []

        return sorted(
            perfil.experiencias_profissionais,
            key=lambda experiencia: experiencia.id,
        )
