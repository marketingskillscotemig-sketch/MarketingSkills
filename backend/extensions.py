from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy


# Instâncias compartilhadas pelas diferentes camadas da aplicação.
# Elas serão vinculadas ao Flask dentro da função create_app().
db = SQLAlchemy()
migrate = Migrate()