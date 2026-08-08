from datetime import date

from models.enums import StatusPlano
from models.plano_estudo import PlanoEstudo
from models.usuario import Usuario


class CriarPlanoEstudoService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados do plano de estudo são obrigatórios."
            )

        usuario_id = dados.get("usuarioId")
        titulo = dados.get("titulo")
        objetivo = dados.get("objetivo")
        data_inicio = dados.get("dataInicio")
        data_fim_prevista = dados.get("dataFimPrevista")
        percentual_conclusao = dados.get(
            "percentualConclusao",
            0,
        )
        status = dados.get(
            "status",
            StatusPlano.NAO_INICIADO.value,
        )

        if usuario_id is None:
            raise ValueError(
                "O usuário é obrigatório."
            )

        usuario = Usuario.buscar_por_id(
            usuario_id
        )

        if usuario is None:
            raise LookupError(
                "Usuário não encontrado."
            )

        if not isinstance(titulo, str) or not titulo.strip():
            raise ValueError(
                "O título do plano de estudo é obrigatório."
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

        if (
            data_inicio_convertida is not None
            and data_fim_convertida is not None
            and data_fim_convertida < data_inicio_convertida
        ):
            raise ValueError(
                "A data de fim prevista não pode ser "
                "anterior à data de início."
            )

        if (
            not isinstance(percentual_conclusao, (int, float))
            or isinstance(percentual_conclusao, bool)
        ):
            raise ValueError(
                "O percentual de conclusão deve ser numérico."
            )

        if not 0 <= percentual_conclusao <= 100:
            raise ValueError(
                "O percentual de conclusão deve estar "
                "entre 0 e 100."
            )

        try:
            status_enum = StatusPlano(status)
        except ValueError as erro:
            raise ValueError(
                "Status do plano de estudo inválido."
            ) from erro

        plano = PlanoEstudo(
            usuario_id=usuario_id,
            titulo=titulo,
            objetivo=objetivo,
            data_inicio=data_inicio_convertida,
            data_fim_prevista=data_fim_convertida,
            percentual_conclusao=percentual_conclusao,
            status=status_enum,
        )

        return plano.salvar()