from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect


# Instâncias compartilhadas pelas
# diferentes camadas da aplicação.

db = SQLAlchemy()

migrate = Migrate()

csrf = CSRFProtect()

# Limite de requisições (proteção contra força
# bruta). Armazenamento em memória: adequado ao
# ambiente local e a uma instância única. Os
# limites de cada rota ficam nos arquivos de rotas.
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",
)
