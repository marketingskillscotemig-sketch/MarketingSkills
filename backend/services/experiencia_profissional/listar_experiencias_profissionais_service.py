from models.experiencia_profissional import ExperienciaProfissional


class ListarExperienciasProfissionaisService:
    @staticmethod
    def executar():
        return ExperienciaProfissional.listar_todos()