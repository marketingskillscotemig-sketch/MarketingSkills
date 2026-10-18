from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.projeto import Projeto


class ListarProjetosService:
    @staticmethod
    def executar(usuario):
        """
        Estudante: somente os próprios projetos.
        Empresa: somente leitura, projetos de
        perfis de estudantes ativos (tela de talentos).
        """
        if usuario.tipo_conta == TipoConta.EMPRESA:
            return [
                projeto
                for projeto
                in Projeto.listar_todos()
                if (
                    projeto.perfil_profissional
                    is not None
                    and projeto.perfil_profissional
                    .usuario.tipo_conta
                    == TipoConta.ESTUDANTE
                    and projeto.perfil_profissional
                    .usuario.status
                    == StatusUsuario.ATIVO
                )
            ]

        perfil = usuario.perfil_profissional

        if perfil is None:
            return []

        return sorted(
            perfil.projetos,
            key=lambda projeto: projeto.id,
        )
