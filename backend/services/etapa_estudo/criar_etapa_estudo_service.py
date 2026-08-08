from datetime import date

from models.enums import StatusEtapa
from models.etapa_estudo import EtapaEstudo
from models.plano_estudo import PlanoEstudo


class CriarEtapaEstudoService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da etapa de estudo são obrigatórios."
            )

        plano_estudo_id = dados.get("planoEstudoId")
        titulo = dados.get("titulo")
        descricao = dados.get("descricao")
        ordem = dados.get("ordem")
        carga_horaria = dados.get("cargaHorariaEstimada")
        data_inicio = dados.get("dataInicioPrevista")
        data_conclusao = dados.get("dataConclusao")
        status = dados.get(
            "status",
            StatusEtapa.PENDENTE.value,
        )

        if plano_estudo_id is None:
            raise ValueError(
                "O plano de estudo é obrigatório."
            )

        plano = PlanoEstudo.buscar_por_id(
            plano_estudo_id
        )

        if plano is None:
            raise LookupError(
                "Plano de estudo não encontrado."
            )

        if not isinstance(titulo, str) or not titulo.strip():
            raise ValueError(
                "O título da etapa é obrigatório."
            )

        titulo = titulo.strip()

        if len(titulo) > 180:
            raise ValueError(
                "O título não pode possuir mais de 180 caracteres."
            )

        if descricao is not None:
            if not isinstance(descricao, str):
                raise ValueError(
                    "A descrição deve ser um texto."
                )

            descricao = descricao.strip()

            if len(descricao) > 500:
                raise ValueError(
                    "A descrição não pode possuir mais de 500 caracteres."
                )

        if (
            not isinstance(ordem, int)
            or isinstance(ordem, bool)
            or ordem <= 0
        ):
            raise ValueError(
                "A ordem deve ser um número inteiro maior que zero."
            )

        etapa_existente = (
            EtapaEstudo.buscar_por_plano_e_ordem(
                plano_estudo_id,
                ordem,
            )
        )

        if etapa_existente is not None:
            raise ValueError(
                "Já existe uma etapa com esta ordem neste plano."
            )

        if carga_horaria is not None:
            if (
                not isinstance(carga_horaria, int)
                or isinstance(carga_horaria, bool)
                or carga_horaria <= 0
            ):
                raise ValueError(
                    "A carga horária estimada deve ser "
                    "um número inteiro maior que zero."
                )

        data_inicio_convertida = None

        if data_inicio is not None:
            try:
                data_inicio_convertida = date.fromisoformat(
                    data_inicio
                )
            except (TypeError, ValueError) as erro:
                raise ValueError(
                    "Data de início prevista inválida. "
                    "Use o formato YYYY-MM-DD."
                ) from erro

        data_conclusao_convertida = None

        if data_conclusao is not None:
            try:
                data_conclusao_convertida = date.fromisoformat(
                    data_conclusao
                )
            except (TypeError, ValueError) as erro:
                raise ValueError(
                    "Data de conclusão inválida. "
                    "Use o formato YYYY-MM-DD."
                ) from erro

        if (
            data_inicio_convertida is not None
            and data_conclusao_convertida is not None
            and data_conclusao_convertida
            < data_inicio_convertida
        ):
            raise ValueError(
                "A data de conclusão não pode ser anterior "
                "à data de início prevista."
            )

        try:
            status_enum = StatusEtapa(status)
        except ValueError as erro:
            raise ValueError(
                "Status da etapa inválido."
            ) from erro

        etapa = EtapaEstudo(
            plano_estudo_id=plano_estudo_id,
            titulo=titulo,
            descricao=descricao,
            ordem=ordem,
            carga_horaria_estimada=carga_horaria,
            data_inicio_prevista=data_inicio_convertida,
            data_conclusao=data_conclusao_convertida,
            status=status_enum,
        )

        return etapa.salvar()