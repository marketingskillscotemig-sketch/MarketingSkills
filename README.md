# Market Skills

O Market Skills é uma plataforma web voltada para estudantes e desenvolvedores que desejam compreender melhor as exigências do mercado de tecnologia e planejar sua evolução profissional.

## Problema

Profissionais e estudantes de desenvolvimento encontram informações dispersas sobre vagas, tecnologias exigidas, competências valorizadas e tendências do mercado.

Essa falta de organização dificulta:

- a identificação das habilidades mais cobradas;
- a comparação entre o perfil profissional e os requisitos das vagas;
- a escolha dos próximos conteúdos a estudar;
- a criação de um plano de desenvolvimento profissional;
- o acompanhamento da própria evolução.

## Proposta

O Market Skills pretende centralizar e organizar informações sobre o mercado de desenvolvimento de software, permitindo que o usuário:

- cadastre suas competências e interesses;
- visualize requisitos recorrentes em vagas;
- compare suas habilidades com as exigências do mercado;
- encontre oportunidades compatíveis com seu perfil;
- receba sugestões de estudo;
- acompanhe seu progresso;
- consulte tendências de tecnologias e áreas de atuação.

## Tecnologias

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-Cors
- PyMySQL
- python-dotenv

### Banco de dados

- MySQL

### Ferramentas

- Git
- GitHub
- Figma
- Visual Studio Code

## Arquitetura do backend

O backend utiliza separação por responsabilidades:

```text
Controller
    ↓
Service
    ↓
Model ou Repository
    ↓
MySQL