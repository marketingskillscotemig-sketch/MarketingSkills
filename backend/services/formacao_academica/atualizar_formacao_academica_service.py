from datetime import date

from models.formacao_academica import FormacaoAcademica
from models.perfil_profissional import PerfilProfissional


class AtualizarFormacaoAcademicaService:
    @staticmethod
    def executar(formacao_id, dados):
        if not dados:
            raise ValueError(
                "Os dados para atualização são obrigatórios."
            )

        formacao = (
            FormacaoAcademica.buscar_por_id(
                formacao_id
            )
        )

        if formacao is None:
            raise LookupError(
                "Formação acadêmica não encontrada."
            )

        if "perfilProfissionalId" in dados:
            perfil_id = dados.get(
                "perfilProfissionalId"
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

            formacao.perfil_profissional_id = (
                perfil_id
            )

        if "instituicao" in dados:
            instituicao = dados.get(
                "instituicao"
            )

            if (
                not isinstance(instituicao, str)
                or not instituicao.strip()
            ):
                raise ValueError(
                    "A instituição é obrigatória."
                )

            instituicao = instituicao.strip()

            if len(instituicao) > 180:
                raise ValueError(
                    "A instituição não pode possuir "
                    "mais de 180 caracteres."
                )

            formacao.instituicao = instituicao

        if "curso" in dados:
            curso = dados.get("curso")

            if (
                not isinstance(curso, str)
                or not curso.strip()
            ):
                raise ValueError(
                    "O curso é obrigatório."
                )

            curso = curso.strip()

            if len(curso) > 180:
                raise ValueError(
                    "O curso não pode possuir "
                    "mais de 180 caracteres."
                )

            formacao.curso = curso

        if "tipoFormacao" in dados:
            tipo_formacao = dados.get(
                "tipoFormacao"
            )

            if tipo_formacao is not None:
                if not isinstance(
                    tipo_formacao,
                    str,
                ):
                    raise ValueError(
                        "O tipo de formação deve "
                        "ser um texto."
                    )

                tipo_formacao = (
                    tipo_formacao.strip()
                    or None
                )

                if (
                    tipo_formacao
                    and len(tipo_formacao) > 80
                ):
                    raise ValueError(
                        "O tipo de formação não pode "
                        "possuir mais de 80 caracteres."
                    )

            formacao.tipo_formacao = (
                tipo_formacao
            )

        if "dataInicio" in dados:
            formacao.data_inicio = (
                AtualizarFormacaoAcademicaService
                .converter_data(
                    dados.get("dataInicio"),
                    "Data de início",
                )
            )

        if "dataFim" in dados:
            formacao.data_fim = (
                AtualizarFormacaoAcademicaService
                .converter_data(
                    dados.get("dataFim"),
                    "Data de fim",
                )
            )

        if "emAndamento" in dados:
            em_andamento = dados.get(
                "emAndamento"
            )

            if not isinstance(
                em_andamento,
                bool,
            ):
                raise ValueError(
                    "O campo em andamento deve "
                    "ser verdadeiro ou falso."
                )

            formacao.em_andamento = (
                em_andamento
            )

            if em_andamento:
                formacao.data_fim = None

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
                    and len(descricao) > 500
                ):
                    raise ValueError(
                        "A descrição não pode possuir "
                        "mais de 500 caracteres."
                    )

            formacao.descricao = descricao

        if (
            formacao.data_inicio
            and formacao.data_fim
            and formacao.data_fim
            < formacao.data_inicio
        ):
            raise ValueError(
                "A data de fim não pode ser anterior "
                "à data de início."
            )

        return formacao.salvar()

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