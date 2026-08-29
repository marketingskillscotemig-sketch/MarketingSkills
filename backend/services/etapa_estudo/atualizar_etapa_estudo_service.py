from datetime import date

from models.enums import StatusEtapa
from models.etapa_estudo import EtapaEstudo
from repositories.estudo_repository import (
    EstudoRepository,
)


class AtualizarEtapaEstudoService:
    @staticmethod
    def executar(etapa_id, dados):
        etapa = EtapaEstudo.buscar_por_id(
            etapa_id
        )

        if etapa is None:
            raise LookupError(
                "Etapa de estudo não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        if "planoEstudoId" in dados:
            raise ValueError(
                "O plano de estudo da etapa não pode ser alterado."
            )

        campos_permitidos = {
            "titulo",
            "descricao",
            "ordem",
            "cargaHorariaEstimada",
            "dataInicioPrevista",
            "dataConclusao",
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
        descricao = dados.get("descricao")
        ordem = dados.get("ordem")
        carga_horaria = dados.get(
            "cargaHorariaEstimada"
        )
        data_inicio = dados.get(
            "dataInicioPrevista"
        )
        data_conclusao = dados.get(
            "dataConclusao"
        )
        status = dados.get("status")

        if titulo is not None:
            if (
                not isinstance(titulo, str)
                or not titulo.strip()
            ):
                raise ValueError(
                    "O título não pode ser vazio."
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

        if ordem is not None:
            if (
                not isinstance(ordem, int)
                or isinstance(ordem, bool)
                or ordem <= 0
            ):
                raise ValueError(
                    "A ordem deve ser um número inteiro maior que zero."
                )

            etapa_mesma_ordem = (
                EstudoRepository.buscar_etapa_por_plano_e_ordem(
                    etapa.plano_estudo_id,
                    ordem,
                )
            )

            if (
                etapa_mesma_ordem is not None
                and etapa_mesma_ordem.id != etapa.id
            ):
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

        data_inicio_final = (
            data_inicio_convertida
            if data_inicio is not None
            else etapa.data_inicio_prevista
        )

        data_conclusao_final = (
            data_conclusao_convertida
            if data_conclusao is not None
            else etapa.data_conclusao
        )

        if (
            data_inicio_final is not None
            and data_conclusao_final is not None
            and data_conclusao_final
            < data_inicio_final
        ):
            raise ValueError(
                "A data de conclusão não pode ser anterior "
                "à data de início prevista."
            )

        status_enum = None

        if status is not None:
            try:
                status_enum = StatusEtapa(
                    status
                )
            except ValueError as erro:
                raise ValueError(
                    "Status da etapa inválido."
                ) from erro

        return etapa.atualizar(
            titulo=titulo,
            descricao=descricao,
            ordem=ordem,
            carga_horaria_estimada=carga_horaria,
            data_inicio_prevista=data_inicio_convertida,
            data_conclusao=data_conclusao_convertida,
            status=status_enum,
        )