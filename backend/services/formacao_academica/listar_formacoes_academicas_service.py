from models.enums import (
    StatusUsuario,
    TipoConta,
)
from models.formacao_academica import FormacaoAcademica


class ListarFormacoesAcademicasService:
    @staticmethod
    def executar(usuario):
        """
        Estudante: somente as próprias formações.
        Empresa: somente leitura, formações de
        perfis de estudantes ativos (tela de talentos).
        """
        if usuario.tipo_conta == TipoConta.EMPRESA:
            return [
                formacao
                for formacao
                in FormacaoAcademica.listar_todos()
                if (
                    formacao.perfil_profissional
                    is not None
                    and formacao.perfil_profissional
                    .usuario.tipo_conta
                    == TipoConta.ESTUDANTE
                    and formacao.perfil_profissional
                    .usuario.status
                    == StatusUsuario.ATIVO
                )
            ]

        perfil = usuario.perfil_profissional

        if perfil is None:
            return []

        return sorted(
            perfil.formacoes_academicas,
            key=lambda formacao: formacao.id,
        )
