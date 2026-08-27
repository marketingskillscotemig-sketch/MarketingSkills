import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_wtf.csrf import CSRFError

from config.settings import Config
from extensions import csrf, db, migrate

from routes.alerta_vaga_routes import (
    alerta_vaga_bp,
)
from routes.autenticacao_routes import (
    autenticacao_bp,
)
from routes.empresa_routes import empresa_bp
from routes.etapa_estudo_routes import (
    etapa_estudo_bp,
)
from routes.experiencia_profissional_routes import (
    experiencia_profissional_bp,
)
from routes.formacao_academica_routes import (
    formacao_academica_bp,
)
from routes.habilidade_routes import habilidade_bp
from routes.health_routes import health_bp
from routes.notificacao_routes import notificacao_bp
from routes.perfil_habilidade_routes import (
    perfil_habilidade_bp,
)
from routes.perfil_profissional_routes import (
    perfil_profissional_bp,
)
from routes.plano_estudo_routes import (
    plano_estudo_bp,
)
from routes.projeto_routes import projeto_bp
from routes.requisito_vaga_routes import (
    requisito_vaga_bp,
)
from routes.talento_routes import talento_bp
from routes.tendencia_mercado_routes import (
    tendencia_mercado_bp,
)
from routes.usuario_routes import usuario_bp
from routes.vaga_routes import vaga_bp


def create_app() -> Flask:
    """
    Cria, configura e retorna uma
    instância da aplicação Flask.
    """
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)

    import models  # noqa: F401

    migrate.init_app(
        app,
        db,
    )

    csrf.init_app(app)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": (
                    app.config[
                        "CORS_ORIGINS"
                    ]
                ),
            }
        },
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "X-CSRFToken",
        ],
    )

    @app.errorhandler(CSRFError)
    def tratar_erro_csrf(
        erro,
    ):
        return jsonify(
            {
                "erro": (
                    "Requisição bloqueada "
                    "pela proteção de segurança."
                ),
                "codigo": "csrf_invalido",
            }
        ), 400

    app.register_blueprint(
        health_bp
    )

    app.register_blueprint(
        autenticacao_bp
    )

    app.register_blueprint(
        usuario_bp
    )

    app.register_blueprint(
        habilidade_bp
    )

    app.register_blueprint(
        perfil_profissional_bp
    )

    app.register_blueprint(
        perfil_habilidade_bp
    )

    app.register_blueprint(
        formacao_academica_bp
    )

    app.register_blueprint(
        experiencia_profissional_bp
    )

    app.register_blueprint(
        projeto_bp
    )

    app.register_blueprint(
        empresa_bp
    )

    app.register_blueprint(
        vaga_bp
    )

    app.register_blueprint(
        requisito_vaga_bp
    )

    app.register_blueprint(
        plano_estudo_bp
    )

    app.register_blueprint(
        etapa_estudo_bp
    )

    app.register_blueprint(
        alerta_vaga_bp
    )

    app.register_blueprint(
        notificacao_bp
    )

    app.register_blueprint(
        tendencia_mercado_bp
    )

    app.register_blueprint(
        talento_bp
    )

    return app


if __name__ == "__main__":
    debug_enabled = (
        os.getenv(
            "FLASK_DEBUG",
            "false",
        ).lower()
        == "true"
    )

    application = create_app()

    application.run(
        debug=debug_enabled
    )