from models.notificacao import Notificacao


class AtualizarNotificacaoService:
    @staticmethod
    def executar(notificacao_id, dados):
        notificacao = Notificacao.buscar_por_id(
            notificacao_id
        )

        if notificacao is None:
            raise LookupError(
                "Notificação não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        if "alertaVagaId" in dados:
            raise ValueError(
                "O alerta da notificação não pode ser alterado."
            )

        if "dataEnvio" in dados:
            raise ValueError(
                "A data de envio da notificação não pode ser alterada."
            )

        campos_permitidos = {
            "titulo",
            "mensagem",
            "lida",
        }

        if not any(
            campo in dados
            for campo in campos_permitidos
        ):
            raise ValueError(
                "Nenhum campo válido foi informado para atualização."
            )

        titulo = dados.get("titulo")
        mensagem = dados.get("mensagem")
        lida = dados.get("lida")

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

        if mensagem is not None:
            if (
                not isinstance(mensagem, str)
                or not mensagem.strip()
            ):
                raise ValueError(
                    "A mensagem não pode ser vazia."
                )

            mensagem = mensagem.strip()

            if len(mensagem) > 500:
                raise ValueError(
                    "A mensagem não pode possuir mais de 500 caracteres."
                )

        if (
            lida is not None
            and not isinstance(lida, bool)
        ):
            raise ValueError(
                "O campo lida deve ser booleano."
            )

        return notificacao.atualizar(
            titulo=titulo,
            mensagem=mensagem,
            lida=lida,
        )