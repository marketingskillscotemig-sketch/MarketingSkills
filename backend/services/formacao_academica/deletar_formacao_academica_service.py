from models.formacao_academica import FormacaoAcademica


class DeletarFormacaoAcademicaService:
    @staticmethod
    def executar(usuario, formacao_id):
        formacao = (
            FormacaoAcademica.buscar_por_id(
                formacao_id
            )
        )

        if formacao is None:
            raise LookupError(
                "Formação acadêmica não encontrada."
            )

        if not formacao.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar esta formação acadêmica."
            )

        formacao.deletar()