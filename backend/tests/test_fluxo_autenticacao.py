"""
Teste de integração do fluxo real de autenticação
e autorização do Market Skills.

Usa a aplicação real (create_app), o banco configurado
no backend/.env e contas de teste JÁ EXISTENTES.
Não cria, altera nem exclui registros: todo comando de
escrita no banco é bloqueado durante o teste.

Credenciais (nunca são exibidas pelo teste). Defina-as
como variáveis de ambiente ou no backend/.env (que não
vai para o Git):

    MS_TESTE_ESTUDANTE_EMAIL / MS_TESTE_ESTUDANTE_SENHA
    MS_TESTE_EMPRESA_EMAIL   / MS_TESTE_EMPRESA_SENHA

Sem elas, os testes que precisam de login são pulados.

Execução (PowerShell, dentro de backend):

    ..\\.venv\\Scripts\\python -m unittest tests.test_fluxo_autenticacao -v

O login tem limite de 5 tentativas por minuto por
e-mail: cada execução faz no máximo 2 logins por conta.
"""

import os
import re
import sys
import unittest
from pathlib import Path


DIRETORIO_BACKEND = Path(__file__).resolve().parents[1]

if str(DIRETORIO_BACKEND) not in sys.path:
    sys.path.insert(0, str(DIRETORIO_BACKEND))

from sqlalchemy import event  # noqa: E402

from app import create_app  # noqa: E402
from extensions import db  # noqa: E402


# HTTPS no cliente de testes: em produção o cookie de
# sessão é Secure e não seria reenviado por HTTP. Nada
# na configuração da aplicação é alterado.
URL_BASE = "https://localhost"

# Com HTTPS, o Flask-WTF exige um Referer da mesma
# origem nas requisições protegidas por CSRF.
CABECALHOS_ORIGEM = {
    "Referer": URL_BASE + "/",
}

ROTAS = (
    "/api/projetos",
    "/api/planos-estudo",
    "/api/etapas-estudo",
    "/api/alertas-vaga",
    "/api/notificacoes",
    "/api/talentos",
)

PERMISSOES_ESPERADAS = {
    "estudante": {
        "/api/projetos": 200,
        "/api/planos-estudo": 200,
        "/api/etapas-estudo": 200,
        "/api/alertas-vaga": 200,
        "/api/notificacoes": 200,
        "/api/talentos": 403,
    },
    "empresa": {
        "/api/projetos": 200,
        "/api/planos-estudo": 403,
        "/api/etapas-estudo": 403,
        "/api/alertas-vaga": 403,
        "/api/notificacoes": 403,
        "/api/talentos": 200,
    },
}

# Contato de um talento, entregue um por vez.
ROTA_CONTATO_TALENTO = "/api/talentos/{}/contato"

# ID que não existe: mesmo que o CSRF falhasse, a
# exclusão não encontraria registro algum.
ID_INEXISTENTE = 2147483647

COMANDOS_DE_ESCRITA = re.compile(
    r"^\s*(INSERT|UPDATE|DELETE|REPLACE|MERGE|ALTER|"
    r"CREATE|DROP|TRUNCATE|RENAME|GRANT|REVOKE|CALL|"
    r"LOCK)\b",
    re.IGNORECASE,
)

APP = None
ENGINE = None
ESCRITAS_BLOQUEADAS = []


def _bloquear_escrita(
    conn,
    cursor,
    statement,
    parameters,
    context,
    executemany,
):
    comando = COMANDOS_DE_ESCRITA.match(
        statement or ""
    )

    if comando:
        # Guarda só o tipo do comando, nunca os
        # parâmetros (podem conter dados pessoais).
        ESCRITAS_BLOQUEADAS.append(
            comando.group(1).upper()
        )

        raise RuntimeError(
            "Teste somente leitura: comando de "
            "escrita bloqueado."
        )


def setUpModule():
    global APP, ENGINE

    APP = create_app()

    with APP.app_context():
        ENGINE = db.engine

    event.listen(
        ENGINE,
        "before_cursor_execute",
        _bloquear_escrita,
    )


def tearDownModule():
    if ENGINE is not None:
        event.remove(
            ENGINE,
            "before_cursor_execute",
            _bloquear_escrita,
        )


def obter_credenciais(tipo_conta):
    email = os.getenv(
        f"MS_TESTE_{tipo_conta.upper()}_EMAIL"
    )

    senha = os.getenv(
        f"MS_TESTE_{tipo_conta.upper()}_SENHA"
    )

    if not email or not senha:
        return None

    return email, senha


class ClienteApi:
    """
    Um único test_client do Flask por cliente:
    a sessão e os cookies são preservados entre
    todas as requisições do fluxo.
    """

    def __init__(self):
        self.cliente = APP.test_client()

    def get(self, rota):
        return self.cliente.get(
            rota,
            base_url=URL_BASE,
        )

    def enviar(
        self,
        metodo,
        rota,
        token_csrf=None,
        json=None,
    ):
        cabecalhos = dict(
            CABECALHOS_ORIGEM
        )

        if token_csrf is not None:
            cabecalhos["X-CSRFToken"] = token_csrf

        return self.cliente.open(
            rota,
            method=metodo,
            base_url=URL_BASE,
            headers=cabecalhos,
            json=json,
        )

    def obter_token_csrf(self):
        resposta = self.get(
            "/api/autenticacao/csrf"
        )

        if resposta.status_code != 200:
            raise AssertionError(
                "GET /api/autenticacao/csrf retornou "
                f"HTTP {resposta.status_code}."
            )

        return resposta.get_json()["csrfToken"]

    def login(self, email, senha):
        token = self.obter_token_csrf()

        return self.enviar(
            "POST",
            "/api/autenticacao/login",
            token_csrf=token,
            json={
                "email": email,
                "senha": senha,
            },
        )


def autenticar(tipo_conta):
    """
    Faz o login real da conta de teste e devolve
    (cliente, token_csrf_da_sessao).
    """
    credenciais = obter_credenciais(
        tipo_conta
    )

    if credenciais is None:
        raise unittest.SkipTest(
            f"Defina MS_TESTE_{tipo_conta.upper()}_EMAIL "
            f"e MS_TESTE_{tipo_conta.upper()}_SENHA "
            "para testar a conta "
            f"{tipo_conta}."
        )

    cliente = ClienteApi()

    resposta = cliente.login(
        *credenciais
    )

    if resposta.status_code != 200:
        dica = (
            " Limite de login atingido: aguarde "
            "1 minuto."
            if resposta.status_code == 429
            else
            " Confira as variáveis "
            f"MS_TESTE_{tipo_conta.upper()}_*."
        )

        raise AssertionError(
            f"Login da conta {tipo_conta} retornou "
            f"HTTP {resposta.status_code}.{dica}"
        )

    dados = resposta.get_json()

    tipo_retornado = (
        dados.get("usuario") or {}
    ).get("tipoConta")

    if tipo_retornado != tipo_conta:
        raise AssertionError(
            f"A conta de teste de {tipo_conta} "
            f"é do tipo '{tipo_retornado}'."
        )

    # O login gera um token CSRF novo para a
    # sessão nova. Ele nunca é exibido.
    return cliente, dados["csrfToken"]


class TesteSomenteLeitura(unittest.TestCase):
    def tearDown(self):
        self.assertEqual(
            ESCRITAS_BLOQUEADAS,
            [],
            "Um comando de escrita no banco foi "
            "tentado durante o teste.",
        )


class TesteSemSessao(TesteSomenteLeitura):
    def test_rotas_protegidas_retornam_401(self):
        cliente = ClienteApi()

        for rota in ROTAS:
            with self.subTest(rota=rota):
                resposta = cliente.get(rota)

                self.assertEqual(
                    resposta.status_code,
                    401,
                    f"GET {rota} sem sessão",
                )

                self.assertEqual(
                    resposta.get_json(),
                    {"erro": "Autenticação necessária."},
                )

    def test_contato_de_talento_exige_login(self):
        resposta = ClienteApi().get(
            ROTA_CONTATO_TALENTO.format(1)
        )

        self.assertEqual(
            resposta.status_code,
            401,
        )

    def test_sessao_informa_nao_autenticado(self):
        resposta = ClienteApi().get(
            "/api/autenticacao/sessao"
        )

        self.assertEqual(
            resposta.status_code,
            200,
        )

        self.assertIs(
            resposta.get_json()["autenticado"],
            False,
        )


class TesteCsrf(TesteSomenteLeitura):
    def assert_csrf_rejeitado(
        self,
        resposta,
        descricao,
    ):
        self.assertEqual(
            resposta.status_code,
            400,
            descricao,
        )

        self.assertEqual(
            resposta.get_json().get("codigo"),
            "csrf_invalido",
            descricao,
        )

    def test_login_sem_token_csrf_rejeitado(self):
        cliente = ClienteApi()

        cliente.obter_token_csrf()

        resposta = cliente.enviar(
            "POST",
            "/api/autenticacao/login",
            json={},
        )

        self.assert_csrf_rejeitado(
            resposta,
            "POST login sem X-CSRFToken",
        )

    def test_login_com_token_csrf_invalido_rejeitado(self):
        cliente = ClienteApi()

        cliente.obter_token_csrf()

        resposta = cliente.enviar(
            "POST",
            "/api/autenticacao/login",
            token_csrf="token-invalido",
            json={},
        )

        self.assert_csrf_rejeitado(
            resposta,
            "POST login com X-CSRFToken inválido",
        )

    def test_token_de_outra_sessao_rejeitado(self):
        outro_cliente = ClienteApi()

        token_de_outra_sessao = (
            outro_cliente.obter_token_csrf()
        )

        cliente = ClienteApi()

        cliente.obter_token_csrf()

        resposta = cliente.enviar(
            "POST",
            "/api/autenticacao/login",
            token_csrf=token_de_outra_sessao,
            json={},
        )

        self.assert_csrf_rejeitado(
            resposta,
            "POST login com token de outra sessão",
        )

    def test_sessao_autenticada_exige_csrf(self):
        cliente, token = autenticar(
            "estudante",
        )

        requisicoes = (
            ("POST", "/api/autenticacao/logout"),
            (
                "DELETE",
                f"/api/notificacoes/{ID_INEXISTENTE}",
            ),
        )

        for metodo, rota in requisicoes:
            for token_enviado, situacao in (
                (None, "sem token"),
                ("token-invalido", "token inválido"),
            ):
                with self.subTest(
                    metodo=metodo,
                    rota=rota,
                    situacao=situacao,
                ):
                    self.assert_csrf_rejeitado(
                        cliente.enviar(
                            metodo,
                            rota,
                            token_csrf=token_enviado,
                        ),
                        f"{metodo} {rota} {situacao}",
                    )

        # As requisições rejeitadas não encerraram
        # a sessão (o logout não foi executado).
        self.assertEqual(
            cliente.get(
                "/api/planos-estudo"
            ).status_code,
            200,
        )

        resposta = cliente.enviar(
            "POST",
            "/api/autenticacao/logout",
            token_csrf=token,
        )

        self.assertEqual(
            resposta.status_code,
            200,
        )


class TestePermissoesPorConta:
    TIPO_CONTA = None

    @classmethod
    def setUpClass(cls):
        cls.cliente, cls.token = autenticar(
            cls.TIPO_CONTA,
        )

    def test_1_sessao_autenticada(self):
        dados = self.cliente.get(
            "/api/autenticacao/sessao"
        ).get_json()

        self.assertIs(
            dados["autenticado"],
            True,
        )

        self.assertEqual(
            dados["usuario"]["tipoConta"],
            self.TIPO_CONTA,
        )

    def test_2_permissoes_das_rotas(self):
        esperado = PERMISSOES_ESPERADAS[
            self.TIPO_CONTA
        ]

        for rota in ROTAS:
            with self.subTest(rota=rota):
                resposta = self.cliente.get(rota)

                self.assertEqual(
                    resposta.status_code,
                    esperado[rota],
                    f"GET {rota} como {self.TIPO_CONTA}",
                )

                if esperado[rota] == 200:
                    self.assertIsInstance(
                        resposta.get_json(),
                        list,
                    )
                else:
                    self.assertEqual(
                        resposta.get_json(),
                        {
                            "erro": (
                                "Você não possui permissão "
                                "para acessar este recurso."
                            ),
                        },
                    )

    def test_3_logout_encerra_a_sessao(self):
        resposta = self.cliente.enviar(
            "POST",
            "/api/autenticacao/logout",
            token_csrf=self.token,
        )

        self.assertEqual(
            resposta.status_code,
            200,
        )

        for rota in ROTAS:
            with self.subTest(rota=rota):
                self.assertEqual(
                    self.cliente.get(rota).status_code,
                    401,
                    f"GET {rota} após logout",
                )


class TesteContaEstudante(
    TestePermissoesPorConta,
    TesteSomenteLeitura,
):
    TIPO_CONTA = "estudante"

    # Roda depois de test_2 e antes do logout (test_3).
    def test_2a_estudante_nao_acessa_contato(self):
        resposta = self.cliente.get(
            ROTA_CONTATO_TALENTO.format(1)
        )

        self.assertEqual(
            resposta.status_code,
            403,
        )


class TesteContaEmpresa(
    TestePermissoesPorConta,
    TesteSomenteLeitura,
):
    TIPO_CONTA = "empresa"

    # Roda depois de test_2 e antes do logout (test_3).
    def test_2a_talentos_sem_email(self):
        talentos = self.cliente.get(
            "/api/talentos"
        ).get_json()

        self.assertIsInstance(talentos, list)

        for talento in talentos:
            with self.subTest(talento=talento.get("id")):
                # Só a presença da chave é verificada:
                # nenhum e-mail é exibido pelo teste.
                self.assertNotIn(
                    "email",
                    talento,
                    "GET /api/talentos expõe e-mail",
                )

        if not talentos:
            self.skipTest(
                "Nenhum talento cadastrado para "
                "testar a rota de contato."
            )

        resposta = self.cliente.get(
            ROTA_CONTATO_TALENTO.format(
                talentos[0]["id"]
            )
        )

        self.assertEqual(
            resposta.status_code,
            200,
        )

        self.assertEqual(
            set(resposta.get_json()),
            {"email"},
        )

        self.assertEqual(
            resposta.headers.get("Cache-Control"),
            "no-store",
        )

    def test_2b_contato_de_quem_nao_e_talento(self):
        propria_conta = self.cliente.get(
            "/api/autenticacao/sessao"
        ).get_json()["usuario"]

        resposta = self.cliente.get(
            ROTA_CONTATO_TALENTO.format(
                propria_conta["id"]
            )
        )

        self.assertEqual(
            resposta.status_code,
            404,
        )


if __name__ == "__main__":
    unittest.main()
