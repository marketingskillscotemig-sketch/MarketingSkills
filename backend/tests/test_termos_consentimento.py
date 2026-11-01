"""
Teste do consentimento dos Termos de Uso e da Política
de Privacidade no cadastro (POST /api/autenticacao/cadastro).

Roda em um banco SQLite em memória, criado só para o teste:
o MySQL configurado no backend/.env não é usado e nenhum dado
real é alterado.

Execução (PowerShell, dentro de backend):

    ..\\.venv\\Scripts\\python -m unittest tests.test_termos_consentimento -v
"""

import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path


DIRETORIO_BACKEND = Path(__file__).resolve().parents[1]

if str(DIRETORIO_BACKEND) not in sys.path:
    sys.path.insert(0, str(DIRETORIO_BACKEND))

from sqlalchemy.pool import StaticPool  # noqa: E402

from app import create_app  # noqa: E402
from config.settings import Config  # noqa: E402
from extensions import db  # noqa: E402
from models.usuario import Usuario  # noqa: E402
from services.usuario.criar_usuario_service import (  # noqa: E402
    VERSAO_TERMOS_ATUAL,
)


URL_BASE = "https://localhost"

CABECALHOS_ORIGEM = {
    "Referer": URL_BASE + "/",
}

APP = None


def setUpModule():
    global APP

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


def dados_cadastro(email, **extras):
    dados = {
        "nome": "Estudante Teste",
        "email": email,
        "senha": "senha-de-teste-123",
        "tipoConta": "estudante",
    }
    dados.update(extras)
    return dados


def buscar_usuario(email):
    with APP.app_context():
        return db.session.execute(
            db.select(Usuario).where(Usuario.email == email)
        ).scalar_one_or_none()


class TesteTermosConsentimento(unittest.TestCase):
    def test_cadastro_sem_aceite_e_recusado(self):
        email = "sem.aceite@teste.local"

        resposta = ClienteApi().enviar(
            "POST",
            "/api/autenticacao/cadastro",
            dados_cadastro(email),
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("Termos de Uso", resposta.get_json()["erro"])
        self.assertIsNone(buscar_usuario(email), "a conta não pode ser criada")

    def test_cadastro_com_recusa_e_recusado(self):
        email = "recusou@teste.local"

        resposta = ClienteApi().enviar(
            "POST",
            "/api/autenticacao/cadastro",
            dados_cadastro(email, aceiteTermos=False),
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertIsNone(buscar_usuario(email))

    def test_aceite_precisa_ser_verdadeiro(self):
        # Só true conta como aceite: textos como "sim"
        # não são aceitos como decisão do usuário.
        email = "aceite.texto@teste.local"

        resposta = ClienteApi().enviar(
            "POST",
            "/api/autenticacao/cadastro",
            dados_cadastro(email, aceiteTermos="sim"),
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertIsNone(buscar_usuario(email))

    def test_cadastro_com_aceite_registra_data_e_versao(self):
        email = "aceitou@teste.local"
        antes = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=5)

        resposta = ClienteApi().enviar(
            "POST",
            "/api/autenticacao/cadastro",
            dados_cadastro(email, aceiteTermos=True),
        )

        self.assertEqual(resposta.status_code, 201)

        usuario = buscar_usuario(email)
        self.assertIsNotNone(usuario)
        self.assertEqual(usuario.versao_termos, VERSAO_TERMOS_ATUAL)
        self.assertIsNotNone(usuario.termos_aceitos_em)
        self.assertGreaterEqual(usuario.termos_aceitos_em, antes)

        dados_usuario = resposta.get_json()["usuario"]
        self.assertEqual(dados_usuario["versaoTermos"], VERSAO_TERMOS_ATUAL)
        self.assertIsNotNone(dados_usuario["termosAceitosEm"])


if __name__ == "__main__":
    unittest.main()
