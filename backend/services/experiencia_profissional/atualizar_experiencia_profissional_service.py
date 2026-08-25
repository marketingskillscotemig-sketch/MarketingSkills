from datetime import date

from models.experiencia_profissional import ExperienciaProfissional
from models.perfil_profissional import PerfilProfissional


class AtualizarExperienciaProfissionalService:
    @staticmethod
    def executar(experiencia_id, dados):
        if not dados:
            raise ValueError(
                "Os dados para atualização são obrigatórios."
            )

        experiencia = (
            ExperienciaProfissional.buscar_por_id(
                experiencia_id
            )
        )

        if experiencia is None:
            raise LookupError(
                "Experiência profissional não encontrada."
            )

        if "perfilProfissionalId" in dados:
            perfil_id = dados.get(
                "perfilProfissionalId"
            )

            if perfil_id is None:
                raise ValueError(
                    "O perfil profissional é obrigatório."
                )

            perfil = (
                PerfilProfissional.buscar_por_id(
                    perfil_id
                )
            )

            if perfil is None:
                raise LookupError(
                    "Perfil profissional não encontrado."
                )

            experiencia.perfil_profissional_id = (
                perfil_id
            )

        if "empresa" in dados:
            empresa = dados.get("empresa")

            if (
                not isinstance(empresa, str)
                or not empresa.strip()
            ):
                raise ValueError(
                    "A empresa é obrigatória."
                )

            empresa = empresa.strip()

            if len(empresa) > 180:
                raise ValueError(
                    "A empresa não pode possuir mais de 180 caracteres."
                )

            experiencia.empresa = empresa

        if "cargo" in dados:
            cargo = dados.get("cargo")

            if (
                not isinstance(cargo, str)
                or not cargo.strip()
            ):
                raise ValueError(
                    "O cargo é obrigatório."
                )

            cargo = cargo.strip()

            if len(cargo) > 180:
                raise ValueError(
                    "O cargo não pode possuir mais de 180 caracteres."
                )

            experiencia.cargo = cargo

        if "dataInicio" in dados:
            experiencia.data_inicio = (
                AtualizarExperienciaProfissionalService.converter_data(
                    dados.get("dataInicio"),
                    "Data de início",
                )
            )

        if "dataFim" in dados:
            experiencia.data_fim = (
                AtualizarExperienciaProfissionalService.converter_data(
                    dados.get("dataFim"),
                    "Data de fim",
                )
            )

        if "atual" in dados:
            atual = dados.get("atual")

            if not isinstance(atual, bool):
                raise ValueError(
                    "O campo atual deve ser verdadeiro ou falso."
                )

            experiencia.atual = atual

            if atual:
                experiencia.data_fim = None

        if "descricao" in dados:
            descricao = dados.get(
                "descricao"
            )

            if descricao is not None:
                if not isinstance(
                    descricao,
                    str,
                ):
                    raise ValueError(
                        "A descrição deve ser um texto."
                    )

                descricao = (
                    descricao.strip()
                    or None
                )

                if (
                    descricao
                    and len(descricao) > 1000
                ):
                    raise ValueError(
                        "A descrição não pode possuir "
                        "mais de 1000 caracteres."
                    )

            experiencia.descricao = descricao

        if (
            experiencia.data_inicio
            and experiencia.data_fim
            and experiencia.data_fim
            < experiencia.data_inicio
        ):
            raise ValueError(
                "A data de fim não pode ser anterior à data de início."
            )

        return experiencia.salvar()

    @staticmethod
    def converter_data(valor, nome_campo):
        if valor in (None, ""):
            return None

        try:
            return date.fromisoformat(valor)

        except (TypeError, ValueError) as erro:
            raise ValueError(
                f"{nome_campo} inválida. "
                "Use o formato YYYY-MM-DD."
            ) from erro