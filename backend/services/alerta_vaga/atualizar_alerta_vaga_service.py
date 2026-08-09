from models.alerta_vaga import AlertaVaga
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
)


class AtualizarAlertaVagaService:
    @staticmethod
    def executar(alerta_id, dados):
        alerta = AlertaVaga.buscar_por_id(
            alerta_id
        )

        if alerta is None:
            raise LookupError(
                "Alerta de vaga não encontrado."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        if "usuarioId" in dados:
            raise ValueError(
                "O usuário do alerta não pode ser alterado."
            )

        campos_permitidos = {
            "palavraChave",
            "cidade",
            "modalidade",
            "nivelExperiencia",
            "ativo",
        }

        if not any(
            campo in dados
            for campo in campos_permitidos
        ):
            raise ValueError(
                "Nenhum campo válido foi informado "
                "para atualização."
            )

        palavra_chave = dados.get(
            "palavraChave"
        )
        cidade = dados.get("cidade")
        modalidade = dados.get("modalidade")
        nivel_experiencia = dados.get(
            "nivelExperiencia"
        )
        ativo = dados.get("ativo")

        if palavra_chave is not None:
            if not isinstance(
                palavra_chave,
                str,
            ):
                raise ValueError(
                    "A palavra-chave deve ser um texto."
                )

            palavra_chave = palavra_chave.strip()

            if len(palavra_chave) > 120:
                raise ValueError(
                    "A palavra-chave não pode possuir "
                    "mais de 120 caracteres."
                )

        if cidade is not None:
            if not isinstance(cidade, str):
                raise ValueError(
                    "A cidade deve ser um texto."
                )

            cidade = cidade.strip()

            if len(cidade) > 120:
                raise ValueError(
                    "A cidade não pode possuir "
                    "mais de 120 caracteres."
                )

        modalidade_enum = None

        if modalidade is not None:
            try:
                modalidade_enum = (
                    ModalidadeTrabalho(
                        modalidade
                    )
                )
            except ValueError as erro:
                raise ValueError(
                    "Modalidade de trabalho inválida."
                ) from erro

        nivel_enum = None

        if nivel_experiencia is not None:
            try:
                nivel_enum = NivelExperiencia(
                    nivel_experiencia
                )
            except ValueError as erro:
                raise ValueError(
                    "Nível de experiência inválido."
                ) from erro

        if (
            ativo is not None
            and not isinstance(ativo, bool)
        ):
            raise ValueError(
                "O campo ativo deve ser booleano."
            )

        return alerta.atualizar(
            palavra_chave=palavra_chave,
            cidade=cidade,
            modalidade=modalidade_enum,
            nivel_experiencia=nivel_enum,
            ativo=ativo,
        )