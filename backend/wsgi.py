"""
Ponto de entrada WSGI para servidores de produção
(por exemplo, gunicorn).

Execute a partir da pasta backend:

    gunicorn wsgi:application

Toda a configuração vem de create_app()
e das variáveis de ambiente; nada é
duplicado aqui.
"""

from app import create_app

application = create_app()
