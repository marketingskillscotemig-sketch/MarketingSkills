from models.tendencia_mercado import TendenciaMercado


class AtualizarTendenciaMercadoService:
    @staticmethod
    def executar(tendencia_id, dados):
        tendencia = TendenciaMercado.buscar_por_id(
            tendencia_id
        )

        if tendencia is None:
            raise LookupError(
                "Tendência de mercado não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        if "dataAtualizacao" in dados:
            raise ValueError(
                "A data de atualização é gerenciada automaticamente."
            )

        campos_permitidos = {
            "cargo",
            "tecnologia",
            "demanda",
            "mediaSalarial",
        }

        if not any(
            campo in dados
            for campo in campos_permitidos
        ):
            raise ValueError(
                "Nenhum campo válido foi informado para atualização."
            )

        cargo = dados.get("cargo")
        tecnologia = dados.get("tecnologia")
        demanda = dados.get("demanda")
        media_salarial = dados.get("mediaSalarial")

        if cargo is not None:
            if (
                not isinstance(cargo, str)
                or not cargo.strip()
            ):
                raise ValueError(
                    "O cargo não pode ser vazio."
                )

            cargo = cargo.strip()

            if len(cargo) > 150:
                raise ValueError(
                    "O cargo não pode possuir mais de 150 caracteres."
                )

        if tecnologia is not None:
            if (
                not isinstance(tecnologia, str)
                or not tecnologia.strip()
            ):
                raise ValueError(
                    "A tecnologia não pode ser vazia."
                )

            tecnologia = tecnologia.strip()

            if len(tecnologia) > 120:
                raise ValueError(
                    "A tecnologia não pode possuir mais de 120 caracteres."
                )

        if demanda is not None:
            if (
                not isinstance(demanda, (int, float))
                or isinstance(demanda, bool)
            ):
                raise ValueError(
                    "A demanda deve ser numérica."
                )

            if demanda < 0:
                raise ValueError(
                    "A demanda não pode ser negativa."
                )

            if demanda > 99999999.99:
                raise ValueError(
                    "A demanda ultrapassa o limite permitido."
                )

        if media_salarial is not None:
            if (
                not isinstance(
                    media_salarial,
                    (int, float),
                )
                or isinstance(media_salarial, bool)
            ):
                raise ValueError(
                    "A média salarial deve ser numérica."
                )

            if media_salarial < 0:
                raise ValueError(
                    "A média salarial não pode ser negativa."
                )

            if media_salarial > 9999999999.99:
                raise ValueError(
                    "A média salarial ultrapassa o limite permitido."
                )

        return tendencia.atualizar(
            cargo=cargo,
            tecnologia=tecnologia,
            demanda=demanda,
            media_salarial=media_salarial,
        )