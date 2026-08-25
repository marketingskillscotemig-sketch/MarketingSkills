from datetime import date

from models.formacao_academica import FormacaoAcademica
from models.perfil_profissional import PerfilProfissional


class CriarFormacaoAcademicaService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da formação acadêmica são obrigatórios."
            )

        perfil_id = dados.get("perfilProfissionalId")
        instituicao = dados.get("instituicao")
        curso = dados.get("curso")
        tipo_formacao = dados.get("tipoFormacao")
        data_inicio = dados.get("dataInicio")
        data_fim = dados.get("dataFim")
        em_andamento = dados.get("emAndamento", False)
        descricao = dados.get("descricao")

        if perfil_id is None:
            raise ValueError(
                "O perfil profissional é obrigatório."
            )

        perfil = PerfilProfissional.buscar_por_id(
            perfil_id
        )

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        if (
            not isinstance(instituicao, str)
            or not instituicao.strip()
        ):
            raise ValueError(
                "A instituição é obrigatória."
            )

        if (
            not isinstance(curso, str)
            or not curso.strip()
        ):
            raise ValueError(
                "O curso é obrigatório."
            )

        instituicao = instituicao.strip()
        curso = curso.strip()

        if len(instituicao) > 180:
            raise ValueError(
                "A instituição não pode possuir mais de 180 caracteres."
            )

        if len(curso) > 180:
            raise ValueError(
                "O curso não pode possuir mais de 180 caracteres."
            )

        if tipo_formacao is not None:
            if not isinstance(tipo_formacao, str):
                raise ValueError(
                    "O tipo de formação deve ser um texto."
                )

            tipo_formacao = (
                tipo_formacao.strip() or None
            )

            if (
                tipo_formacao
                and len(tipo_formacao) > 80
            ):
                raise ValueError(
                    "O tipo de formação não pode possuir "
                    "mais de 80 caracteres."
                )

        if not isinstance(em_andamento, bool):
            raise ValueError(
                "O campo em andamento deve ser verdadeiro ou falso."
            )

        data_inicio_convertida = (
            CriarFormacaoAcademicaService
            .converter_data(
                data_inicio,
                "Data de início",
            )
        )

        data_fim_convertida = (
            CriarFormacaoAcademicaService
            .converter_data(
                data_fim,
                "Data de fim",
            )
        )

        if em_andamento:
            data_fim_convertida = None

        if (
            data_inicio_convertida
            and data_fim_convertida
            and data_fim_convertida
            < data_inicio_convertida
        ):
            raise ValueError(
                "A data de fim não pode ser anterior "
                "à data de início."
            )

        if descricao is not None:
            if not isinstance(descricao, str):
                raise ValueError(
                    "A descrição deve ser um texto."
                )

            descricao = descricao.strip() or None

            if (
                descricao
                and len(descricao) > 500
            ):
                raise ValueError(
                    "A descrição não pode possuir mais "
                    "de 500 caracteres."
                )

        formacao = FormacaoAcademica(
            perfil_profissional_id=perfil_id,
            instituicao=instituicao,
            curso=curso,
            tipo_formacao=tipo_formacao,
            data_inicio=data_inicio_convertida,
            data_fim=data_fim_convertida,
            em_andamento=em_andamento,
            descricao=descricao,
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