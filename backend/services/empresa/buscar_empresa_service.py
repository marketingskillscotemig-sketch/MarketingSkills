from models.empresa import Empresa


class BuscarEmpresaService:
    @staticmethod
    def executar(empresa_id):
        empresa = Empresa.buscar_por_id(
            empresa_id
        )

        if empresa is None:
            raise LookupError(
                "Empresa não encontrada."
            )

        return empresa