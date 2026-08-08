from models.enums import CategoriaHabilidade
from models.habilidade import Habilidade


class AtualizarHabilidadeService:
    @staticmethod
    def executar(habilidade_id, dados):
        habilidade = Habilidade.buscar_por_id(
            habilidade_id
        )

        if habilidade is None:
            raise LookupError(
                "Habilidade não encontrada."
            )

        if not dados:
            raise ValueError(
                "Informe ao menos um campo para atualização."
            )

        nome = dados.get("nome")
        categoria = dados.get("categoria")
        descricao = dados.get("descricao")

        if nome is not None:
            nome = nome.strip()

            if not nome:
                raise ValueError(
                    "O nome não pode ser vazio."
                )

            existente = Habilidade.buscar_por_nome(nome)

            if (
                existente is not None
                and existente.id != habilidade.id
            ):
                raise ValueError(
                    "Já existe uma habilidade com este nome."
                )

        categoria_enum = None

        if categoria is not None:
            try:
                categoria_enum = CategoriaHabilidade(
                    categoria
                )
            except ValueError as erro:
                raise ValueError(
                    "Categoria de habilidade inválida."
                ) from erro

        if descricao is not None:
            descricao = descricao.strip()

        return habilidade.atualizar(
            nome=nome,
            categoria=categoria_enum,
            descricao=descricao,
        )