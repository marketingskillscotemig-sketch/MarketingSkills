from models.tendencia_mercado import TendenciaMercado


class CriarTendenciaMercadoService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da tendência de mercado são obrigatórios."
            )

        cargo = dados.get("cargo")
        tecnologia = dados.get("tecnologia")
        demanda = dados.get("demanda")
        media_salarial = dados.get("mediaSalarial")

        if (
            not isinstance(cargo, str)
            or not cargo.strip()
        ):
            raise ValueError(
                "O cargo é obrigatório."
            )

        cargo = cargo.strip()

        if len(cargo) > 150:
            raise ValueError(
                "O cargo não pode possuir mais de 150 caracteres."
            )

        if (
            not isinstance(tecnologia, str)
            or not tecnologia.strip()
        ):
            raise ValueError(
                "A tecnologia é obrigatória."
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

        tendencia = TendenciaMercado(
            cargo=cargo,
            tecnologia=tecnologia,
            demanda=demanda,
            media_salarial=media_salarial,
        )

        return tendencia.salvar()