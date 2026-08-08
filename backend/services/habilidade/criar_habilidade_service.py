from models.enums import CategoriaHabilidade
from models.habilidade import Habilidade


class CriarHabilidadeService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da habilidade são obrigatórios."
            )

        nome = dados.get("nome")
        categoria = dados.get("categoria")
        descricao = dados.get("descricao")

        if not nome or not nome.strip():
            raise ValueError("O nome é obrigatório.")

        if not categoria:
            raise ValueError("A categoria é obrigatória.")

        nome = nome.strip()

        if descricao is not None:
            descricao = descricao.strip()

        try:
            categoria_enum = CategoriaHabilidade(categoria)
        except ValueError as erro:
            raise ValueError(
                "Categoria de habilidade inválida."
            ) from erro

        habilidade_existente = Habilidade.buscar_por_nome(nome)

        if habilidade_existente:
            raise ValueError(
                "Já existe uma habilidade com este nome."
            )

        habilidade = Habilidade(
            nome=nome,
            categoria=categoria_enum,
            descricao=descricao,
        )

        return habilidade.salvar()