import os

from flask import Flask
from flask_cors import CORS

from config.settings import Config
from extensions import db, migrate
from routes.health_routes import health_bp
from routes.usuario_routes import usuario_bp
from routes.habilidade_routes import habilidade_bp
from routes.perfil_profissional_routes import (
    perfil_profissional_bp,
)
from routes.perfil_habilidade_routes import (
    perfil_habilidade_bp,
)
from routes.empresa_routes import empresa_bp
from routes.vaga_routes import vaga_bp
from routes.requisito_vaga_routes import (
    requisito_vaga_bp,
)
from routes.plano_estudo_routes import (
    plano_estudo_bp,
)


def create_app() -> Flask:
    """
    Cria, configura e retorna uma instância da aplicação Flask.

    Todas as extensões, rotas e configurações gerais devem ser
    registradas nesta função.
    """
    app = Flask(__name__)

    # Carrega as configurações definidas em config/settings.py.
    app.config.from_object(Config)

    # Inicializa o SQLAlchemy.
    db.init_app(app)

    # Importa as Models para registrá-las no metadata do SQLAlchemy.
    # O import fica dentro da factory para evitar dependências circulares.
    import models  # noqa: F401

    # Inicializa o controle de migrations após as Models serem registradas.
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
    app.register_blueprint(usuario_bp)
    app.register_blueprint(habilidade_bp)
    app.register_blueprint(perfil_profissional_bp)
    app.register_blueprint(perfil_habilidade_bp)
    app.register_blueprint(empresa_bp)
    app.register_blueprint(vaga_bp)
    app.register_blueprint(requisito_vaga_bp)
    app.register_blueprint(plano_estudo_bp)
    return app


if __name__ == "__main__":
    debug_enabled = (
        os.getenv("FLASK_DEBUG", "false").lower() == "true"
    )

    application = create_app()
    application.run(debug=debug_enabled)