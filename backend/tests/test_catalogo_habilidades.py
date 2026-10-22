"""
Teste do catálogo de habilidades e das habilidades
do perfil do estudante.

Roda em um banco SQLite em memória, criado só para o
teste: o MySQL configurado no backend/.env não é usado
e nenhum dado real é alterado.

Execução (PowerShell, dentro de backend):

    ..\\.venv\\Scripts\\python -m unittest tests.test_catalogo_habilidades -v

O ranking de talentos usa uma stored procedure do
MySQL (CALL), que não existe no SQLite; por isso ele
não é executado aqui.
"""

import importlib.util
import sys
import unittest
from pathlib import Path


DIRETORIO_BACKEND = Path(__file__).resolve().parents[1]

if str(DIRETORIO_BACKEND) not in sys.path:
    sys.path.insert(0, str(DIRETORIO_BACKEND))

from alembic.migration import MigrationContext  # noqa: E402
from alembic.operations import Operations  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app import create_app  # noqa: E402
from config.settings import Config  # noqa: E402
from extensions import db  # noqa: E402
from models.enums import CategoriaHabilidade  # noqa: E402


ARQUIVO_MIGRATION = (
    DIRETORIO_BACKEND
    / "migrations"
    / "versions"
    / "9f347fc9c8c3_seed_skills_catalog.py"
)

URL_BASE = "https://localhost"

CABECALHOS_ORIGEM = {
    "Referer": URL_BASE + "/",
}

APP = None
MIGRATION = None


def carregar_migration():
    especificacao = importlib.util.spec_from_file_location(
        "migration_catalogo_habilidades",
        ARQUIVO_MIGRATION,
    )
    modulo = importlib.util.module_from_spec(especificacao)
    especificacao.loader.exec_module(modulo)
    return modulo


def executar_migration():
    with APP.app_context():
        with db.engine.begin() as conexao:
            contexto = MigrationContext.configure(conexao)
            with Operations.context(contexto):
                MIGRATION.upgrade()


def contar_habilidades():
    with APP.app_context():
        return db.session.execute(
            text("SELECT COUNT(*) FROM habilidades")
        ).scalar_one()


def setUpModule():
    global APP, MIGRATION

    # Troca o banco só durante a criação do app de
    # teste e restaura a configuração logo depois.
    uri_original = Config.SQLALCHEMY_DATABASE_URI
    opcoes_originais = Config.SQLALCHEMY_ENGINE_OPTIONS

    Config.SQLALCHEMY_DATABASE_URI = "sqlite://"
    Config.SQLALCHEMY_ENGINE_OPTIONS = {
        "poolclass": StaticPool,
        "connect_args": {"check_same_thread": False},
    }

    try:
        APP = create_app()
    finally:
        Config.SQLALCHEMY_DATABASE_URI = uri_original
        Config.SQLALCHEMY_ENGINE_OPTIONS = opcoes_originais

    with APP.app_context():
        db.create_all()

        # Simula um banco que já tinha habilidades,
        # uma delas com o nome em outra caixa.
        db.session.execute(
            text(
                "INSERT INTO habilidades (nome, categoria) "
                "VALUES ('python', 'linguagem'), "
                "('Kotlin', 'linguagem')"
            )
        )
        db.session.commit()

    MIGRATION = carregar_migration()
    executar_migration()


def tearDownModule():
    if APP is not None:
        with APP.app_context():
            db.session.remove()
            db.drop_all()


class ClienteApi:
    def __init__(self):
        self.cliente = APP.test_client()
        self.token = None

    def get(self, rota):
        return self.cliente.get(rota, base_url=URL_BASE)

    def enviar(self, metodo, rota, json=None):
        cabecalhos = dict(CABECALHOS_ORIGEM)

        if self.token is None:
            self.token = self.get(
                "/api/autenticacao/csrf"
            ).get_json()["csrfToken"]

        cabecalhos["X-CSRFToken"] = self.token

        resposta = self.cliente.open(
            rota,
            method=metodo,
            base_url=URL_BASE,
            headers=cabecalhos,
            json=json,
        )

        dados = resposta.get_json(silent=True)
        if isinstance(dados, dict) and dados.get("csrfToken"):
            self.token = dados["csrfToken"]

        return resposta


class TesteCatalogoHabilidades(unittest.TestCase):
    def test_catalogo_contem_as_habilidades_novas(self):
        resposta = ClienteApi().get("/api/habilidades")

        self.assertEqual(resposta.status_code, 200)

        nomes = {item["nome"] for item in resposta.get_json()}

        for nome, _categoria, _descricao in MIGRATION.HABILIDADES:
            if nome.lower() == "python":
                continue
            with self.subTest(nome=nome):
                self.assertIn(nome, nomes)

    def test_habilidades_existentes_preservadas(self):
        nomes = {
            item["nome"]
            for item in ClienteApi().get("/api/habilidades").get_json()
        }

        # "python" já existia: não foi duplicado nem renomeado.
        self.assertIn("python", nomes)
        self.assertNotIn("Python", nomes)
        self.assertIn("Kotlin", nomes)

    def test_sem_nomes_duplicados(self):
        nomes = [
            item["nome"].lower()
            for item in ClienteApi().get("/api/habilidades").get_json()
        ]

        self.assertEqual(len(nomes), len(set(nomes)))

    def test_categorias_validas(self):
        validas = {categoria.value for categoria in CategoriaHabilidade}
        habilidades = ClienteApi().get("/api/habilidades").get_json()

        for item in habilidades:
            with self.subTest(nome=item["nome"]):
                self.assertIn(item["categoria"], validas)

        categorias = {item["nome"]: item["categoria"] for item in habilidades}
        self.assertEqual(categorias["React"], "framework")
        self.assertEqual(categorias["MySQL"], "banco_dados")
        self.assertEqual(categorias["Docker"], "ferramenta")
        self.assertEqual(categorias["APIs REST"], "conceito")

    def test_migration_pode_rodar_de_novo(self):
        antes = contar_habilidades()

        executar_migration()

        self.assertEqual(contar_habilidades(), antes)


class TesteHabilidadesDoPerfil(unittest.TestCase):
    def test_adicionar_alterar_e_remover(self):
        cliente = ClienteApi()

        resposta = cliente.enviar(
            "POST",
            "/api/autenticacao/cadastro",
            {
                "nome": "Estudante Teste",
                "email": "estudante.catalogo@teste.local",
                "senha": "senha-de-teste-123",
                "tipoConta": "estudante",
            },
        )
        self.assertEqual(resposta.status_code, 201)

        resposta = cliente.enviar(
            "POST",
            "/api/perfis-profissionais",
            {"objetivoProfissional": "Desenvolvedor"},
        )
        self.assertEqual(resposta.status_code, 201)

        ids = {
            item["nome"]: item["id"]
            for item in cliente.get("/api/habilidades").get_json()
        }

        criadas = []
        for nome, nivel in (
            ("React", "basico"),
            ("MySQL", "intermediario"),
            ("Docker", "avancado"),
        ):
            with self.subTest(habilidade=nome, nivel=nivel):
                resposta = cliente.enviar(
                    "POST",
                    "/api/perfil-habilidades",
                    {"habilidadeId": ids[nome], "nivelDominio": nivel},
                )
                self.assertEqual(resposta.status_code, 201)
                self.assertEqual(resposta.get_json()["nivelDominio"], nivel)
                criadas.append(resposta.get_json()["id"])

        resposta = cliente.enviar(
            "POST",
            "/api/perfil-habilidades",
            {"habilidadeId": ids["React"], "nivelDominio": "basico"},
        )
        self.assertEqual(resposta.status_code, 400, "habilidade repetida no perfil")

        resposta = cliente.enviar(
            "POST",
            "/api/perfil-habilidades",
            {"habilidadeId": ids["Git"], "nivelDominio": "expert"},
        )
        self.assertEqual(resposta.status_code, 400, "nível inválido")

        resposta = cliente.enviar(
            "PUT",
            f"/api/perfil-habilidades/{criadas[0]}",
            {"nivelDominio": "avancado"},
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.get_json()["nivelDominio"], "avancado")

        self.assertEqual(
            len(cliente.get("/api/perfil-habilidades").get_json()),
            3,
        )

        resposta = cliente.enviar(
            "DELETE",
            f"/api/perfil-habilidades/{criadas[1]}",
        )
        self.assertEqual(resposta.status_code, 204)

        restantes = cliente.get("/api/perfil-habilidades").get_json()
        self.assertEqual(
            sorted(item["id"] for item in restantes),
            sorted([criadas[0], criadas[2]]),
        )

        # Remover a habilidade do perfil não remove
        # a habilidade do catálogo.
        nomes = {item["nome"] for item in cliente.get("/api/habilidades").get_json()}
        self.assertIn("MySQL", nomes)


if __name__ == "__main__":
    unittest.main()
