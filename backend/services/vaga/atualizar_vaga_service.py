from datetime import date

from models.empresa import Empresa
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
    StatusVaga,
)
from models.vaga import Vaga


class AtualizarVagaService:
    @staticmethod
    def executar(
        vaga_id,
        dados,
    ):
        vaga = Vaga.buscar_por_id(
            vaga_id
        )

        if vaga is None:
            raise LookupError(
                "Vaga não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        empresa_id = dados.get(
            "empresaId"
        )

        titulo = dados.get(
            "titulo"
        )

        descricao = dados.get(
            "descricao"
        )

        beneficios = dados.get(
            "beneficios"
        )

        nivel_experiencia = dados.get(
            "nivelExperiencia"
        )

        modalidade = dados.get(
            "modalidade"
        )

        localizacao = dados.get(
            "localizacao"
        )

        possui_salario_minimo = (
            "salarioMinimo" in dados
        )

        possui_salario_maximo = (
            "salarioMaximo" in dados
        )

        salario_minimo = dados.get(
            "salarioMinimo"
        )

        salario_maximo = dados.get(
            "salarioMaximo"
        )

        data_publicacao = dados.get(
            "dataPublicacao"
        )

        status = dados.get(
            "status"
        )

        if empresa_id is not None:
            empresa = Empresa.buscar_por_id(
                empresa_id
            )

            if empresa is None:
                raise LookupError(
                    "Empresa não encontrada."
                )

        if titulo is not None:
            if not isinstance(
                titulo,
                str,
            ):
                raise ValueError(
                    "O título da vaga deve ser um texto."
                )

            titulo = titulo.strip()

            if not titulo:
                raise ValueError(
                    "O título da vaga não pode ser vazio."
                )

        if descricao is not None:
            if not isinstance(
                descricao,
                str,
            ):
                raise ValueError(
                    "A descrição deve ser um texto."
                )

            descricao = descricao.strip()

        if beneficios is not None:
            if not isinstance(
                beneficios,
                str,
            ):
                raise ValueError(
                    "Os benefícios devem ser informados como texto."
                )

            beneficios = beneficios.strip()

        if localizacao is not None:
            if not isinstance(
                localizacao,
                str,
            ):
                raise ValueError(
                    "A localização deve ser um texto."
                )

            localizacao = localizacao.strip()

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

        status_enum = None

        if status is not None:
            try:
                status_enum = StatusVaga(
                    status
                )

            except ValueError as erro:
                raise ValueError(
                    "Status da vaga inválido."
                ) from erro

        for valor, nome_campo in [
            (
                salario_minimo,
                "salário mínimo",
            ),
            (
                salario_maximo,
                "salário máximo",
            ),
        ]:
            if valor is not None:
                if (
                    not isinstance(
                        valor,
                        (int, float),
                    )
                    or isinstance(
                        valor,
                        bool,
                    )
                ):
                    raise ValueError(
                        f"O {nome_campo} deve ser numérico."
                    )

                if valor < 0:
                    raise ValueError(
                        f"O {nome_campo} não pode ser negativo."
                    )

        salario_minimo_final = (
            salario_minimo
            if possui_salario_minimo
            else vaga.salario_minimo
        )

        salario_maximo_final = (
            salario_maximo
            if possui_salario_maximo
            else vaga.salario_maximo
        )

        if (
            salario_minimo_final is not None
            and salario_maximo_final is not None
            and salario_maximo_final
            < salario_minimo_final
        ):
            raise ValueError(
                "O salário máximo não pode ser menor "
                "que o salário mínimo."
            )

        data_convertida = None

        if data_publicacao is not None:
            try:
                data_convertida = (
                    date.fromisoformat(
                        data_publicacao
                    )
                )

            except (
                TypeError,
                ValueError,
            ) as erro:
                raise ValueError(
                    "Data de publicação inválida. "
                    "Use o formato YYYY-MM-DD."
                ) from erro

        argumentos = {
            "empresa_id": empresa_id,
            "titulo": titulo,
            "descricao": descricao,
            "beneficios": beneficios,
            "nivel_experiencia": nivel_enum,
            "modalidade": modalidade_enum,
            "localizacao": localizacao,
            "data_publicacao": data_convertida,
            "status": status_enum,
        }

        if possui_salario_minimo:
            argumentos[
                "salario_minimo"
            ] = salario_minimo

        if possui_salario_maximo:
            argumentos[
                "salario_maximo"
            ] = salario_maximo

        return vaga.atualizar(
            **argumentos
        )