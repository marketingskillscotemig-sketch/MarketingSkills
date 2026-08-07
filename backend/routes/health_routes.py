from flask import Blueprint, jsonify


health_bp = Blueprint(
    "health",
    __name__,
    url_prefix="/api",
)


@health_bp.get("/health")
def check_health():
    """
    Verifica se a API está inicializada e respondendo.

    Esta rota não acessa o banco de dados.
    """
    return jsonify(
        {
            "application": "Market Skills API",
            "status": "online",
            "version": "0.1.0",
        }
    ), 200