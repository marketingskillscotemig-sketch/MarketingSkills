import os
from urllib.parse import quote_plus

from dotenv import load_dotenv


# Carrega as variáveis definidas no arquivo .env.
load_dotenv()


def build_database_uri() -> str:
    """
    Monta a URL de conexão com o MySQL usando variáveis de ambiente.

    quote_plus protege caracteres especiais presentes no usuário
    ou na senha antes que sejam incluídos na URL.
    """
    user = quote_plus(os.getenv("DB_USER", "root"))
    password = quote_plus(os.getenv("DB_PASSWORD", ""))

    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    database = os.getenv("DB_NAME", "market_skills")

    return (
        f"mysql+pymysql://{user}:{password}"
        f"@{host}:{port}/{database}"
    )


class Config:
    """Configurações gerais da aplicação."""

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "development-key-change-before-production",
    )

    SQLALCHEMY_DATABASE_URI = build_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "connect_args": {
        "init_command": (
        "SET SESSION default_storage_engine=InnoDB"
            ),
        },
    }

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://127.0.0.1:5500,http://localhost:5500",
        ).split(",")
        if origin.strip()
    ]