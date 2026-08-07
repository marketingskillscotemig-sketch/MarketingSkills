import os

from flask import Flask
from flask_cors import CORS

from config.settings import Config
from extensions import db, migrate
from routes.health_routes import health_bp


def create_app() -> Flask:
    """
    Cria, configura e retorna uma instância da aplicação Flask.

    Todas as extensões, rotas e configurações gerais devem ser
    registradas nesta função.
    """
    app = Flask(__name__)

    # Carrega as configurações definidas em config/settings.py.
    app.config.from_object(Config)

    # Inicializa as extensões compartilhadas.
    db.init_app(app)
    migrate.init_app(app, db)

    # Permite que o frontend autorizado acesse as rotas da API.
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"],
            }
        },
    )

    # Registra as rotas da aplicação.
    app.register_blueprint(health_bp)

    return app


if __name__ == "__main__":
    debug_enabled = (
        os.getenv("FLASK_DEBUG", "false").lower() == "true"
    )

    application = create_app()
    application.run(debug=debug_enabled)