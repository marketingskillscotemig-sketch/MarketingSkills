# Market Skills

O **Market Skills** é uma plataforma web voltada para estudantes e profissionais que desejam compreender melhor as exigências do mercado de tecnologia, organizar suas habilidades, acompanhar oportunidades e planejar sua evolução profissional.

O projeto está sendo desenvolvido na disciplina de **Projeto de Software**.

---

## Problema

Estudantes e profissionais de desenvolvimento encontram informações dispersas sobre:

- vagas disponíveis;
- tecnologias exigidas;
- competências valorizadas;
- requisitos profissionais;
- tendências do mercado;
- planejamento de estudos.

Essa falta de organização dificulta a identificação das habilidades mais cobradas e a definição dos próximos passos profissionais.

---

## Proposta

O Market Skills centraliza informações relacionadas ao mercado de trabalho e ao desenvolvimento profissional.

A plataforma permite trabalhar com:

- usuários;
- perfis profissionais;
- habilidades;
- habilidades vinculadas aos perfis;
- empresas;
- vagas;
- requisitos das vagas;
- planos de estudo;
- etapas de estudo;
- alertas de vagas;
- notificações;
- tendências de mercado.

---

# Tecnologias

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-Cors
- Flask-WTF
- PyMySQL
- python-dotenv

## Banco de dados

- MySQL

## Ferramentas

- Git
- GitHub
- Visual Studio Code
- WAMP
- MySQL Workbench
- Figma

---

# Arquitetura

O backend foi organizado separando as responsabilidades da aplicação.

```text
Cliente / Frontend
        |
        v
   Controller
        |
        v
     Service
        |
        v
      Model
        |
        v
      MySQLgit status --short