from models.formacao_academica import FormacaoAcademica


class ListarFormacoesAcademicasService:
    @staticmethod
    def executar():
        return FormacaoAcademica.listar_todos()