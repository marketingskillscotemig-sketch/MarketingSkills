from models.formacao_academica import FormacaoAcademica


class DeletarFormacaoAcademicaService:
    @staticmethod
    def executar(formacao_id):
        formacao = (
            FormacaoAcademica.buscar_por_id(
                formacao_id
            )
        )

        if formacao is None:
            raise LookupError(
                "Formação acadêmica não encontrada."
            )

        formacao.deletar()