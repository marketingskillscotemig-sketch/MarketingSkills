from datetime import date

from models.empresa import Empresa
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
    StatusVaga,
)
from models.vaga import Vaga


class CriarVagaService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da vaga são obrigatórios."
            )

        empresa_id = dados.get("empresaId")
        titulo = dados.get("titulo")
        descricao = dados.get("descricao")
        beneficios = dados.get("beneficios")
        nivel_experiencia = dados.get(
            "nivelExperiencia"
        )
        modalidade = dados.get("modalidade")
        localizacao = dados.get("localizacao")
        salario_minimo = dados.get(
            "salarioMinimo"
        )
        salario_maximo = dados.get(
            "salarioMaximo"
        )
        data_publicacao = dados.get(
            "dataPublicacao"
        )
        status = dados.get("status")

        if empresa_id is None:
            raise ValueError(
                "A empresa é obrigatória."
            )

        empresa = Empresa.buscar_por_id(
            empresa_id
        )

        if empresa is None:
            raise LookupError(
                "Empresa não encontrada."
            )

        if not titulo or not titulo.strip():
            raise ValueError(
                "O título da vaga é obrigatório."
            )

        titulo = titulo.strip()

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

        if nivel_experiencia is None:
            raise ValueError(
                "O nível de experiência é obrigatório."
            )

        try:
            nivel_enum = NivelExperiencia(
                nivel_experiencia
            )

        except ValueError as erro:
            raise ValueError(
                "Nível de experiência inválido."
            ) from erro

        if modalidade is None:
            raise ValueError(
                "A modalidade de trabalho é obrigatória."
            )

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

        status_enum = StatusVaga.ATIVA

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

        if (
            salario_minimo is not None
            and salario_maximo is not None
            and salario_maximo <
            salario_minimo
        ):
            raise ValueError(
                "O salário máximo não pode ser menor "
                "que o salário mínimo."
            )

        data_publicacao_convertida = (
            date.today()
        )

        if data_publicacao is not None:
            try:
                data_publicacao_convertida = (
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

        vaga = Vaga(
            empresa_id=empresa_id,
            titulo=titulo,
            descricao=descricao,
            beneficios=beneficios,
            nivel_experiencia=nivel_enum,
            modalidade=modalidade_enum,
            localizacao=localizacao,
            salario_minimo=salario_minimo,
            salario_maximo=salario_maximo,
            data_publicacao=(
                data_publicacao_convertida
            ),
            status=status_enum,
        )

        return vaga.salvar()