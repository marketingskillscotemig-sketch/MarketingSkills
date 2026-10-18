from datetime import date

from models.experiencia_profissional import ExperienciaProfissional


class CriarExperienciaProfissionalService:
    @staticmethod
    def executar(usuario, dados):
        if not dados:
            raise ValueError(
                "Os dados da experiência profissional são obrigatórios."
            )

        empresa = dados.get("empresa")
        cargo = dados.get("cargo")
        data_inicio = dados.get("dataInicio")
        data_fim = dados.get("dataFim")
        atual = dados.get("atual", False)
        descricao = dados.get("descricao")

        # O perfil vem sempre da sessão autenticada.
        # Qualquer "perfilProfissionalId" enviado no
        # JSON é ignorado.
        perfil = usuario.perfil_profissional

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        perfil_id = perfil.id

        if (
            not isinstance(empresa, str)
            or not empresa.strip()
        ):
            raise ValueError(
                "A empresa é obrigatória."
            )

        if (
            not isinstance(cargo, str)
            or not cargo.strip()
        ):
            raise ValueError(
                "O cargo é obrigatório."
            )

        empresa = empresa.strip()
        cargo = cargo.strip()

        if len(empresa) > 180:
            raise ValueError(
                "A empresa não pode possuir mais de 180 caracteres."
            )

        if len(cargo) > 180:
            raise ValueError(
                "O cargo não pode possuir mais de 180 caracteres."
            )

        if not isinstance(atual, bool):
            raise ValueError(
                "O campo atual deve ser verdadeiro ou falso."
            )

        data_inicio_convertida = (
            CriarExperienciaProfissionalService.converter_data(
                data_inicio,
                "Data de início",
            )
        )

        data_fim_convertida = (
            CriarExperienciaProfissionalService.converter_data(
                data_fim,
                "Data de fim",
            )
        )

        if atual:
            data_fim_convertida = None

        if (
            data_inicio_convertida
            and data_fim_convertida
            and data_fim_convertida < data_inicio_convertida
        ):
            raise ValueError(
                "A data de fim não pode ser anterior à data de início."
            )

        if descricao is not None:
            if not isinstance(descricao, str):
                raise ValueError(
                    "A descrição deve ser um texto."
                )

            descricao = descricao.strip() or None

            if (
                descricao
                and len(descricao) > 1000
            ):
                raise ValueError(
                    "A descrição não pode possuir mais de 1000 caracteres."
                )

        experiencia = ExperienciaProfissional(
            perfil_profissional_id=perfil_id,
            empresa=empresa,
            cargo=cargo,
            data_inicio=data_inicio_convertida,
            data_fim=data_fim_convertida,
            atual=atual,
            descricao=descricao,
        )

        return experiencia.salvar()

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