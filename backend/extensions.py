from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect


# Instâncias compartilhadas pelas
# diferentes camadas da aplicação.

db = SQLAlchemy()

migrate = Migrate()

csrf = CSRFProtect()