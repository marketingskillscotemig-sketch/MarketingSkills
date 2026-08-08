from datetime import date

from models.enums import StatusPlano
from models.plano_estudo import PlanoEstudo


class AtualizarPlanoEstudoService:
    @staticmethod
    def executar(plano_id, dados):
        plano = PlanoEstudo.buscar_por_id(
            plano_id
        )

        if plano is None:
            raise LookupError(
                "Plano de estudo não encontrado."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        if "usuarioId" in dados:
            raise ValueError(
                "O usuário do plano de estudo não pode ser alterado."
            )

        campos_permitidos = {
            "titulo",
            "objetivo",
            "dataInicio",
            "dataFimPrevista",
            "percentualConclusao",
            "status",
        }

        if not any(
            campo in dados
            for campo in campos_permitidos
        ):
            raise ValueError(
                "Nenhum campo válido foi informado para atualização."
            )

        titulo = dados.get("titulo")
        objetivo = dados.get("objetivo")
        data_inicio = dados.get("dataInicio")
        data_fim_prevista = dados.get("dataFimPrevista")
        percentual_conclusao = dados.get(
            "percentualConclusao"
        )
        status = dados.get("status")

        if titulo is not None:
            if not isinstance(titulo, str) or not titulo.strip():
                raise ValueError(
                    "O título não pode ser vazio."
                )

            titulo = titulo.strip()

            if len(titulo) > 180:
                raise ValueError(
                    "O título não pode possuir mais de 180 caracteres."
                )

        if objetivo is not None:
            if not isinstance(objetivo, str):
                raise ValueError(
                    "O objetivo deve ser um texto."
                )

            objetivo = objetivo.strip()

            if len(objetivo) > 500:
                raise ValueError(
                    "O objetivo não pode possuir mais de 500 caracteres."
                )

        data_inicio_convertida = None

        if data_inicio is not None:
            try:
                data_inicio_convertida = date.fromisoformat(
                    data_inicio
                )
            except (TypeError, ValueError) as erro:
                raise ValueError(
                    "Data de início inválida. "
                    "Use o formato YYYY-MM-DD."
                ) from erro

        data_fim_convertida = None

        if data_fim_prevista is not None:
            try:
                data_fim_convertida = date.fromisoformat(
                    data_fim_prevista
                )
            except (TypeError, ValueError) as erro:
                raise ValueError(
                    "Data de fim prevista inválida. "
                    "Use o formato YYYY-MM-DD."
                ) from erro

        data_inicio_final = (
            data_inicio_convertida
            if data_inicio is not None
            else plano.data_inicio
        )

        data_fim_final = (
            data_fim_convertida
            if data_fim_prevista is not None
            else plano.data_fim_prevista
        )

        if (
            data_inicio_final is not None
            and data_fim_final is not None
            and data_fim_final < data_inicio_final
        ):
            raise ValueError(
                "A data de fim prevista não pode ser "
                "anterior à data de início."
            )

        if percentual_conclusao is not None:
            if (
                not isinstance(
                    percentual_conclusao,
                    (int, float),
                )
                or isinstance(
                    percentual_conclusao,
                    bool,
                )
            ):
                raise ValueError(
                    "O percentual de conclusão deve ser numérico."
                )

            if not 0 <= percentual_conclusao <= 100:
                raise ValueError(
                    "O percentual de conclusão deve estar "
                    "entre 0 e 100."
                )

        status_enum = None

        if status is not None:
            try:
                status_enum = StatusPlano(
                    status
                )
            except ValueError as erro:
                raise ValueError(
                    "Status do plano de estudo inválido."
                ) from erro

        return plano.atualizar(
            titulo=titulo,
            objetivo=objetivo,
            data_inicio=data_inicio_convertida,
            data_fim_prevista=data_fim_convertida,
            percentual_conclusao=percentual_conclusao,
            status=status_enum,
        )