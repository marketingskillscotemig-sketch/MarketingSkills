from models.empresa import Empresa


class DeletarEmpresaService:
    @staticmethod
    def executar(empresa_id):
        empresa = Empresa.buscar_por_id(
            empresa_id
        )

        if empresa is None:
            raise LookupError(
                "Empresa não encontrada."
            )

        empresa.deletar()