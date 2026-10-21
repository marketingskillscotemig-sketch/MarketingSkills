import os
from datetime import timedelta
from urllib.parse import quote_plus

from dotenv import load_dotenv
from flask.helpers import get_debug_flag


load_dotenv()


AMBIENTES_VALIDOS = {
    "development",
    "production",
}

TAMANHO_MINIMO_SECRET_KEY = 32

# Valores de exemplo/placeholder que nunca
# podem ser usados como SECRET_KEY em produção.
SECRET_KEYS_INSEGURAS = {
    "change-this-value",
    "development-key-change-before-production",
    "your-secret-key",
    "secret",
    "changeme",
}


def obter_ambiente() -> str:
    """
    Retorna o ambiente da aplicação.

    Sem APP_ENV, assume produção: um deploy
    sem configuração falha de forma segura em
    vez de rodar com regras de desenvolvimento.
    """
    return os.getenv(
        "APP_ENV",
        "production",
    ).strip().lower()


def ler_booleano(nome: str, padrao: bool) -> bool:
    valor = os.getenv(nome)

    if valor is None or not valor.strip():
        return padrao

    return valor.strip().lower() == "true"


def build_database_uri() -> str:
    """
    Monta a URL de conexão com o MySQL
    usando variáveis de ambiente.
    """

    user = quote_plus(
        os.getenv(
            "DB_USER",
            "root",
        )
    )

    password = quote_plus(
        os.getenv(
            "DB_PASSWORD",
            "",
        )
    )

    host = os.getenv(
        "DB_HOST",
        "localhost",
    )

    port = os.getenv(
        "DB_PORT",
        "3306",
    )

    database = os.getenv(
        "DB_NAME",
        "market_skills",
    )

    return (
        f"mysql+pymysql://{user}:{password}"
        f"@{host}:{port}/{database}"
    )


class Config:
    """Configurações gerais da aplicação."""

    APP_ENV = obter_ambiente()

    # Sem valor padrão: a chave deve vir do
    # backend/.env (local) ou das variáveis de
    # ambiente do servidor (produção).
    SECRET_KEY = os.getenv(
        "SECRET_KEY"
    )

    SQLALCHEMY_DATABASE_URI = (
        build_database_uri()
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,

        "connect_args": {
            "init_command": (
                "SET SESSION "
                "default_storage_engine=InnoDB"
            ),
        },
    }

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            (
                "http://127.0.0.1:5500,"
                "http://localhost:5500"
            ),
        ).split(",")
        if origin.strip()
    ]

    # Segurança da sessão

    SESSION_COOKIE_NAME = (
        "market_skills_session"
    )

    SESSION_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"

    # Produção: true por padrão (exige HTTPS).
    # Desenvolvimento: false por padrão, para o
    # login local via HTTP continuar funcionando.
    SESSION_COOKIE_SECURE = ler_booleano(
        "SESSION_COOKIE_SECURE",
        APP_ENV == "production",
    )

    SESSION_COOKIE_PATH = "/"

    PERMANENT_SESSION_LIFETIME = (
        timedelta(hours=2)
    )

    SESSION_REFRESH_EACH_REQUEST = True

    # Tamanho máximo do corpo da requisição.
    # O maior upload aceito é de 5 MiB (currículo
    # e banner); 6 MiB dá folga ao multipart.
    # Acima disso, a requisição é recusada com
    # HTTP 413 antes de o corpo ser lido.
    MAX_CONTENT_LENGTH = 6 * 1024 * 1024


def validar_configuracao(app) -> None:
    """
    Impede a aplicação de iniciar com
    configuração insegura.

    Em produção exige: SECRET_KEY forte,
    FLASK_DEBUG=false e SESSION_COOKIE_SECURE=true.
    Em desenvolvimento exige apenas SECRET_KEY.
    """
    ambiente = app.config.get("APP_ENV")

    if ambiente not in AMBIENTES_VALIDOS:
        raise RuntimeError(
            f"APP_ENV inválido: '{ambiente}'. "
            "Use 'development' ou 'production'."
        )

    erros = []

    secret_key = app.config.get("SECRET_KEY")

    if not secret_key or not str(secret_key).strip():
        erros.append(
            "SECRET_KEY não configurada. Defina-a no "
            "backend/.env (desenvolvimento) ou nas "
            "variáveis de ambiente do servidor (produção)."
        )

    if ambiente == "production":
        if secret_key and len(secret_key) < (
            TAMANHO_MINIMO_SECRET_KEY
        ):
            erros.append(
                "SECRET_KEY deve possuir pelo menos "
                f"{TAMANHO_MINIMO_SECRET_KEY} caracteres. "
                "Gere uma com: python -c "
                "\"import secrets; print(secrets.token_hex(32))\""
            )

        if (
            secret_key
            and secret_key.strip().lower()
            in SECRET_KEYS_INSEGURAS
        ):
            erros.append(
                "SECRET_KEY usa um valor de exemplo. "
                "Gere uma chave nova para produção."
            )

        if app.debug or get_debug_flag():
            erros.append(
                "FLASK_DEBUG deve ser false em produção."
            )

        if not app.config.get("SESSION_COOKIE_SECURE"):
            erros.append(
                "SESSION_COOKIE_SECURE deve ser true "
                "em produção (exige HTTPS)."
            )

    if erros:
        raise RuntimeError(
            f"Configuração insegura para APP_ENV="
            f"'{ambiente}':\n- "
            + "\n- ".join(erros)
        )

    if (
        ambiente == "development"
        and len(secret_key) < TAMANHO_MINIMO_SECRET_KEY
    ):
        app.logger.warning(
            "SECRET_KEY com menos de %s caracteres: "
            "aceitável apenas em desenvolvimento.",
            TAMANHO_MINIMO_SECRET_KEY,
        )
