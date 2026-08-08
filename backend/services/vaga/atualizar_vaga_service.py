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
    def executar(vaga_id, dados):
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

        empresa_id = dados.get("empresaId")
        titulo = dados.get("titulo")
        descricao = dados.get("descricao")
        nivel_experiencia = dados.get("nivelExperiencia")
        modalidade = dados.get("modalidade")
        localizacao = dados.get("localizacao")
        salario_minimo = dados.get("salarioMinimo")
        salario_maximo = dados.get("salarioMaximo")
        data_publicacao = dados.get("dataPublicacao")
        status = dados.get("status")

        if empresa_id is not None:
            empresa = Empresa.buscar_por_id(
                empresa_id
            )

            if empresa is None:
                raise LookupError(
                    "Empresa não encontrada."
                )

        if titulo is not None:
            titulo = titulo.strip()

            if not titulo:
                raise ValueError(
                    "O título da vaga não pode ser vazio."
                )

        if descricao is not None:
            descricao = descricao.strip()

        if localizacao is not None:
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
                modalidade_enum = ModalidadeTrabalho(
                    modalidade
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
            (salario_minimo, "salário mínimo"),
            (salario_maximo, "salário máximo"),
        ]:
            if valor is not None:
                if (
                    not isinstance(valor, (int, float))
                    or isinstance(valor, bool)
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
            if salario_minimo is not None
            else vaga.salario_minimo
        )

        salario_maximo_final = (
            salario_maximo
            if salario_maximo is not None
            else vaga.salario_maximo
        )

        if (
            salario_minimo_final is not None
            and salario_maximo_final is not None
            and salario_maximo_final < salario_minimo_final
        ):
            raise ValueError(
                "O salário máximo não pode ser menor "
                "que o salário mínimo."
            )

        data_convertida = None

        if data_publicacao is not None:
            try:
                data_convertida = date.fromisoformat(
                    data_publicacao
                )
            except (TypeError, ValueError) as erro:
                raise ValueError(
                    "Data de publicação inválida. "
                    "Use o formato YYYY-MM-DD."
                ) from erro

        return vaga.atualizar(
            empresa_id=empresa_id,
            titulo=titulo,
            descricao=descricao,
            nivel_experiencia=nivel_enum,
            modalidade=modalidade_enum,
            localizacao=localizacao,
            salario_minimo=salario_minimo,
            salario_maximo=salario_maximo,
            data_publicacao=data_convertida,
            status=status_enum,
        )