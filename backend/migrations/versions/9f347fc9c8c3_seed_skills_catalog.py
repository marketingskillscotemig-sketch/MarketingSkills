"""seed skills catalog

Revision ID: 9f347fc9c8c3
Revises: 9d782fa78e5b
Create Date: 2026-10-21 23:14:16

Amplia o catálogo de habilidades (tabela habilidades).

A migration é segura para rodar em qualquer banco:
- só insere habilidades que ainda não existem
  (comparação de nome sem diferenciar maiúsculas);
- não altera nem remove habilidades existentes;
- não mexe em IDs, perfis, vagas ou planos de estudo.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9f347fc9c8c3"
down_revision = "9d782fa78e5b"
branch_labels = None
depends_on = None


# (nome, categoria, descrição)
# As categorias são os valores do enum CategoriaHabilidade.
HABILIDADES = [
    # Linguagens
    ("Python", "linguagem", "Linguagem de programação de uso geral."),
    ("JavaScript", "linguagem", "Linguagem de programação da web."),
    ("TypeScript", "linguagem", "JavaScript com tipagem estática."),
    ("Java", "linguagem", "Linguagem orientada a objetos multiplataforma."),
    ("C", "linguagem", "Linguagem de programação estruturada."),
    ("C++", "linguagem", "Linguagem derivada do C com orientação a objetos."),
    ("C#", "linguagem", "Linguagem orientada a objetos da plataforma .NET."),
    ("PHP", "linguagem", "Linguagem para desenvolvimento web no servidor."),
    ("SQL", "linguagem", "Linguagem de consulta a bancos de dados relacionais."),
    ("HTML", "linguagem", "Linguagem de marcação de páginas web."),
    ("CSS", "linguagem", "Linguagem de estilos de páginas web."),

    # Frameworks e ambientes (frontend e backend)
    ("React", "framework", "Biblioteca JavaScript para interfaces."),
    ("Vue.js", "framework", "Framework JavaScript para interfaces."),
    ("Flask", "framework", "Microframework web em Python."),
    ("Django", "framework", "Framework web completo em Python."),
    ("Node.js", "framework", "Ambiente de execução JavaScript no servidor."),
    ("Express", "framework", "Framework web para Node.js."),

    # Bancos de dados
    ("MySQL", "banco_dados", "Banco de dados relacional."),
    ("PostgreSQL", "banco_dados", "Banco de dados relacional."),
    ("SQLite", "banco_dados", "Banco de dados relacional em arquivo."),
    ("MongoDB", "banco_dados", "Banco de dados NoSQL orientado a documentos."),

    # Ferramentas
    ("Git", "ferramenta", "Controle de versão de código."),
    ("GitHub", "ferramenta", "Hospedagem de repositórios Git."),
    ("Docker", "ferramenta", "Execução de aplicações em contêineres."),
    ("Postman", "ferramenta", "Teste e documentação de APIs."),
    ("VS Code", "ferramenta", "Editor de código."),

    # Conceitos
    ("Programação Orientada a Objetos", "conceito", "Classes, objetos, herança e encapsulamento."),
    ("Estruturas de Dados", "conceito", "Listas, pilhas, filas, árvores e grafos."),
    ("Algoritmos", "conceito", "Lógica, ordenação, busca e complexidade."),
    ("APIs REST", "conceito", "Criação e consumo de APIs HTTP."),
    ("Testes de Software", "conceito", "Testes automatizados e qualidade de software."),
    ("Segurança da Informação", "conceito", "Boas práticas de segurança em sistemas."),
    ("Banco de Dados", "conceito", "Modelagem e uso de bancos de dados."),
    ("Engenharia de Software", "conceito", "Processos, requisitos e arquitetura de software."),
]


def upgrade():
    conexao = op.get_bind()

    buscar = sa.text(
        "SELECT id FROM habilidades "
        "WHERE LOWER(nome) = LOWER(:nome)"
    )

    inserir = sa.text(
        "INSERT INTO habilidades (nome, categoria, descricao) "
        "VALUES (:nome, :categoria, :descricao)"
    )

    for nome, categoria, descricao in HABILIDADES:
        existente = conexao.execute(
            buscar,
            {"nome": nome},
        ).first()

        if existente is None:
            conexao.execute(
                inserir,
                {
                    "nome": nome,
                    "categoria": categoria,
                    "descricao": descricao,
                },
            )


def downgrade():
    # Não remove nada: as habilidades podem já estar
    # ligadas a perfis, requisitos de vagas e planos
    # de estudo, e a exclusão apagaria esses vínculos.
    pass
