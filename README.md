# Market Skills

O **Market Skills** é uma plataforma web voltada para estudantes, profissionais e empresas, com o objetivo de centralizar informações sobre habilidades, oportunidades de trabalho, desenvolvimento profissional e necessidades do mercado de tecnologia.

O projeto está sendo desenvolvido na disciplina de **Projeto de Software**.

---

# Problema

Estudantes e profissionais de desenvolvimento encontram informações dispersas sobre:

- vagas disponíveis;
- tecnologias exigidas;
- competências valorizadas;
- requisitos profissionais;
- tendências do mercado;
- planejamento de estudos.

Além disso, empresas precisam encontrar profissionais com habilidades compatíveis com suas oportunidades.

Essa falta de centralização dificulta tanto o desenvolvimento profissional quanto o processo de recrutamento.

---

# Proposta

O Market Skills centraliza informações relacionadas ao mercado de trabalho e ao desenvolvimento profissional.

A plataforma trabalha com:

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

O sistema também possui uma experiência específica para empresas, permitindo:

- criação e gerenciamento de vagas;
- definição de requisitos obrigatórios e diferenciais;
- busca de talentos;
- análise de compatibilidade entre profissionais e vagas;
- consulta ao perfil profissional e currículo;
- gerenciamento do perfil empresarial.

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
- SQLAlchemy
- PyMySQL
- python-dotenv

## Banco de Dados

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

O backend foi organizado com separação de responsabilidades.

```text
Cliente / Frontend
        |
        v
     Routes
        |
        v
   Controller
        |
        v
     Service
        |
        v
   Repository
        |
        v
Stored Procedure / MySQL