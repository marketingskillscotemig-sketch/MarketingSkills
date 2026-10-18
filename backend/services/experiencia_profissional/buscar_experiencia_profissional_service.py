from models.experiencia_profissional import ExperienciaProfissional


class BuscarExperienciaProfissionalService:
    @staticmethod
    def executar(usuario, experiencia_id):
        experiencia = (
            ExperienciaProfissional.buscar_por_id(
                experiencia_id
            )
        )

        if experiencia is None:
            raise LookupError(
                "Experiência profissional não encontrada."
            )

        if not experiencia.pertence_ao_usuario(
            usuario.id
        ):
            raise PermissionError(
                "Você não possui permissão para "
                "acessar esta experiência profissional."
            )

        return experiencia