from models.experiencia_profissional import ExperienciaProfissional


class BuscarExperienciaProfissionalService:
    @staticmethod
    def executar(experiencia_id):
        experiencia = (
            ExperienciaProfissional.buscar_por_id(
                experiencia_id
            )
        )

        if experiencia is None:
            raise LookupError(
                "Experiência profissional não encontrada."
            )

        return experiencia