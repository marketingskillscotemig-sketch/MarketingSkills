"""
Teste da compatibilidade entre o perfil do estudante e uma vaga
(GET /api/vagas/<vaga_id>/compatibilidade).

Roda em um banco SQLite em memória, criado só para o teste:
o MySQL configurado no backend/.env não é usado e nenhum dado
real é alterado.

Execução (PowerShell, dentro de backend):

    ..\\.venv\\Scripts\\python -m unittest tests.test_compatibilidade_vaga -v
"""

import sys
import unittest
from pathlib import Path


DIRETORIO_BACKEND = Path(__file__).resolve().parents[1]

if str(DIRETORIO_BACKEND) not in sys.path:
    sys.path.insert(0, str(DIRETORIO_BACKEND))

from sqlalchemy.pool import StaticPool  # noqa: E402
from werkzeug.security import generate_password_hash  # noqa: E402

from app import create_app  # noqa: E402
from config.settings import Config  # noqa: E402
from extensions import db  # noqa: E402
from models.empresa import Empresa  # noqa: E402
from models.enums import (  # noqa: E402
    CategoriaHabilidade,
    ModalidadeTrabalho,
    NivelExperiencia,
    NivelHabilidade,
    TipoConta,
)
from models.habilidade import Habilidade  # noqa: E402
from models.requisito_vaga import RequisitoVaga  # noqa: E402
from models.usuario import Usuario  # noqa: E402
from models.vaga import Vaga  # noqa: E402


URL_BASE = "https://localhost"

CABECALHOS_ORIGEM = {
    "Referer": URL_BASE + "/",
}

EMAIL_EMPRESA = "empresa.compatibilidade@teste.local"
SENHA_EMPRESA = "senha-da-empresa-123"

APP = None

# Preenchidos no setUpModule
HABILIDADES = {}
VAGA_TRES_REQUISITOS = None
VAGA_SEM_REQUISITOS = None
VAGA_OITO_REQUISITOS = None


def setUpModule():
    global APP
    global VAGA_TRES_REQUISITOS, VAGA_SEM_REQUISITOS
    global VAGA_OITO_REQUISITOS

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

        nomes = [
            "Python",
            "Flask",
            "JavaScript",
            "Docker",
            "SQL",
            "Git",
            "React",
            "Linux",
        ]

        for nome in nomes:
            habilidade = Habilidade(
                nome=nome,
                categoria=CategoriaHabilidade.LINGUAGEM,
            )
            db.session.add(habilidade)
            db.session.flush()
            HABILIDADES[nome] = habilidade.id

        usuario_empresa = Usuario(
            nome="Empresa Teste",
            email=EMAIL_EMPRESA,
            senha_hash=generate_password_hash(SENHA_EMPRESA),
            tipo_conta=TipoConta.EMPRESA,
        )
        db.session.add(usuario_empresa)
        db.session.flush()

        empresa = Empresa(
            usuario_id=usuario_empresa.id,
            nome="Empresa Teste",
        )
        db.session.add(empresa)
        db.session.flush()

        def criar_vaga(titulo, requisitos):
            vaga = Vaga(
                empresa_id=empresa.id,
                titulo=titulo,
                nivel_experiencia=NivelExperiencia.JUNIOR,
                modalidade=ModalidadeTrabalho.REMOTO,
            )
            db.session.add(vaga)
            db.session.flush()

            for nome, obrigatorio in requisitos:
                db.session.add(
                    RequisitoVaga(
                        vaga_id=vaga.id,
                        habilidade_id=HABILIDADES[nome],
                        nivel_exigido=NivelHabilidade.BASICO,
                        obrigatorio=obrigatorio,
                    )
                )

            return vaga.id

        VAGA_TRES_REQUISITOS = criar_vaga(
            "Desenvolvedor Python Júnior",
            [
                ("Python", True),
                ("Flask", False),
                ("JavaScript", True),
            ],
        )

        VAGA_SEM_REQUISITOS = criar_vaga(
            "Vaga sem requisitos",
            [],
        )

        VAGA_OITO_REQUISITOS = criar_vaga(
            "Vaga com oito requisitos",
            [(nome, False) for nome in nomes],
        )

        db.session.commit()


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


def rota_compatibilidade(vaga_id):
    return f"/api/vagas/{vaga_id}/compatibilidade"


def cadastrar_estudante(email):
    cliente = ClienteApi()

    resposta = cliente.enviar(
        "POST",
        "/api/autenticacao/cadastro",
        {
            "nome": "Estudante Teste",
            "email": email,
            "senha": "senha-de-teste-123",
            "tipoConta": "estudante",
            "aceiteTermos": True,
        },
    )
    assert resposta.status_code == 201, resposta.get_json()

    return cliente


def criar_perfil_com_habilidades(cliente, nomes):
    resposta = cliente.enviar(
        "POST",
        "/api/perfis-profissionais",
        {"objetivoProfissional": "Desenvolvedor"},
    )
    assert resposta.status_code == 201, resposta.get_json()

    for nome in nomes:
        resposta = cliente.enviar(
            "POST",
            "/api/perfil-habilidades",
            {
                "habilidadeId": HABILIDADES[nome],
                "nivelDominio": "basico",
            },
        )
        assert resposta.status_code == 201, resposta.get_json()


class TesteCompatibilidadeVaga(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Estudante com Python e Flask no perfil.
        cls.estudante = cadastrar_estudante(
            "estudante.compatibilidade@teste.local"
        )
        criar_perfil_com_habilidades(
            cls.estudante,
            ["Python", "Flask"],
        )

    def test_percentual_e_requisitos_atendidos(self):
        resposta = self.estudante.get(
            rota_compatibilidade(VAGA_TRES_REQUISITOS)
        )
        self.assertEqual(resposta.status_code, 200)

        dados = resposta.get_json()

        # 2 de 3 requisitos: round(66,67) = 67%,
        # o mesmo número que a tela mostrava antes.
        self.assertTrue(dados["possuiPerfil"])
        self.assertEqual(dados["totalRequisitos"], 3)
        self.assertEqual(dados["requisitosAtendidos"], 2)
        self.assertEqual(dados["percentual"], 67)

        # Falta JavaScript, que é obrigatório.
        self.assertEqual(dados["obrigatoriosPendentes"], 1)

        atendidos = {
            item["habilidadeId"]: item["atendido"]
            for item in dados["requisitos"]
        }
        self.assertTrue(atendidos[HABILIDADES["Python"]])
        self.assertTrue(atendidos[HABILIDADES["Flask"]])
        self.assertFalse(atendidos[HABILIDADES["JavaScript"]])

    def test_arredonda_meio_para_cima_como_no_frontend(self):
        # 1 de 8 = 12,5% → 13% (igual ao Math.round do JS).
        cliente = cadastrar_estudante(
            "estudante.arredondamento@teste.local"
        )
        criar_perfil_com_habilidades(cliente, ["Python"])

        dados = cliente.get(
            rota_compatibilidade(VAGA_OITO_REQUISITOS)
        ).get_json()

        self.assertEqual(dados["requisitosAtendidos"], 1)
        self.assertEqual(dados["percentual"], 13)

    def test_vaga_sem_requisitos_nao_tem_percentual(self):
        dados = self.estudante.get(
            rota_compatibilidade(VAGA_SEM_REQUISITOS)
        ).get_json()

        self.assertTrue(dados["possuiPerfil"])
        self.assertEqual(dados["totalRequisitos"], 0)
        self.assertIsNone(dados["percentual"])

    def test_estudante_sem_perfil(self):
        cliente = cadastrar_estudante(
            "estudante.sem.perfil@teste.local"
        )

        resposta = cliente.get(
            rota_compatibilidade(VAGA_TRES_REQUISITOS)
        )
        self.assertEqual(resposta.status_code, 200)

        dados = resposta.get_json()
        self.assertFalse(dados["possuiPerfil"])
        self.assertIsNone(dados["percentual"])
        self.assertEqual(dados["requisitosAtendidos"], 0)

    def test_vaga_inexistente(self):
        resposta = self.estudante.get(
            rota_compatibilidade(999999)
        )
        self.assertEqual(resposta.status_code, 404)

    def test_exige_login(self):
        resposta = ClienteApi().get(
            rota_compatibilidade(VAGA_TRES_REQUISITOS)
        )
        self.assertEqual(resposta.status_code, 401)

    def test_empresa_nao_acessa(self):
        cliente = ClienteApi()

        resposta = cliente.enviar(
            "POST",
            "/api/autenticacao/login",
            {
                "email": EMAIL_EMPRESA,
                "senha": SENHA_EMPRESA,
            },
        )
        self.assertEqual(resposta.status_code, 200)

        resposta = cliente.get(
            rota_compatibilidade(VAGA_TRES_REQUISITOS)
        )
        self.assertEqual(resposta.status_code, 403)


if __name__ == "__main__":
    unittest.main()
