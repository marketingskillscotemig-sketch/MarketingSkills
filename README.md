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

O Market Skills segue a arquitetura **cliente-servidor**: o **frontend** e a **API** são aplicações separadas, que rodam em servidores distintos e se comunicam apenas por requisições HTTP com dados em JSON.

```text
┌─────────────────────────────┐        HTTP (JSON)        ┌─────────────────────────────┐
│  FRONTEND (cliente)         │  ───────────────────────► │  API (servidor)             │
│  HTML + CSS + JavaScript    │                           │  Python + Flask             │
│  pasta: frontend/           │  ◄─────────────────────── │  pasta: backend/            │
│                             │                           │                             │
│  Local: Live Server :5500   │                           │  Local: Flask :5000         │
│  AWS:   Nginx (HTTPS)       │                           │  AWS:   Gunicorn :5000      │
└─────────────────────────────┘                           └──────────────┬──────────────┘
                                                                         │ SQLAlchemy
                                                                         ▼
                                                          ┌─────────────────────────────┐
                                                          │  Banco de dados MySQL       │
                                                          │  Local: WAMP | AWS: RDS     │
                                                          └─────────────────────────────┘
```

## Frontend e API em servidores separados

| | Frontend | API |
|---|---|---|
| Pasta no repositório | `frontend/` | `backend/` |
| Tecnologia | HTML, CSS e JavaScript | Python + Flask |
| Servidor local | Live Server do VS Code — `http://127.0.0.1:5500` | Servidor do Flask — `http://127.0.0.1:5000` |
| Servidor na AWS | Nginx (arquivos estáticos, HTTPS) | Gunicorn (serviço `market-skills` no systemd) |

O frontend **não acessa o banco de dados**: toda informação é obtida por requisições à API. Essas requisições ficam centralizadas em `frontend/assets/js/api.js`, que escolhe o endereço da API conforme o ambiente:

```javascript
// frontend/assets/js/api.js
const API_BASE_URL =
    HOSTS_LOCAIS.has(window.location.hostname)
        ? "http://127.0.0.1:5000/api"  // local: API em outro servidor (porta 5000)
        : "/api";                       // AWS: Nginx encaminha /api para o Gunicorn
```

Como, no ambiente local, frontend (porta 5500) e API (porta 5000) estão em origens diferentes, a API libera o acesso do frontend com **CORS** (`Flask-Cors`, configurado em `backend/app.py` pela variável `CORS_ORIGINS`). As requisições que alteram dados enviam um **token CSRF** no cabeçalho `X-CSRFToken`.

## Organização da API em camadas

```text
Requisição HTTP do frontend
        │
        ▼
     Routes          backend/routes/         Liga cada URL ao Controller
        │
        ▼
   Controllers       backend/controllers/    Recebe a requisição e aciona o caso de uso
        │
        ▼
    Services         backend/services/       Um Service por caso de uso, com as regras da aplicação
        │
        ▼
  Repositories       backend/repositories/   Consultas ao banco (SQL e Stored Procedures)
        │
        ▼
     Models          backend/models/         Classes do domínio mapeadas para tabelas (ORM SQLAlchemy)
        │
        ▼
 MySQL / Stored Procedures   backend/database/procedures.sql
```

| Camada | Exemplos |
|---|---|
| Controllers | `vaga_controller.py`, `talento_controller.py`, `autenticacao_controller.py` |
| Services (um por caso de uso) | `services/vaga/buscar_vagas_avancado_service.py`, `services/talento/ranking_talentos_service.py`, `services/usuario/criar_usuario_service.py` |
| Repositories | `vaga_repository.py` (`CALL sp_buscar_vagas_avancado`), `talento_repository.py` (`CALL sp_ranking_talentos_por_vaga`), `conta_repository.py` |
| Models | `usuario.py`, `vaga.py`, `empresa.py`, `perfil_profissional.py`, `habilidade.py` |

## Hospedagem

O sistema está publicado na AWS:

- **EC2 (Ubuntu):** Nginx serve o frontend com HTTPS e encaminha as rotas `/api/` para a API rodando no Gunicorn.
- **RDS (MySQL):** banco de dados de produção, acessível apenas pela EC2.

## Termos de consentimento

Na criação da conta (`frontend/pages/cadastro.html`), o usuário precisa marcar **"Li e aceito os Termos de Uso e a Política de Privacidade"**, com link para `frontend/pages/termos.html`.

- O frontend (`autenticacao.js`) envia a decisão para a API no campo `aceiteTermos`.
- O `CriarUsuarioService` recusa o cadastro (HTTP 400) se o aceite não for enviado.
- Com o aceite, a decisão fica registrada na tabela `usuarios`: `termos_aceitos_em` (data e hora) e `versao_termos` (versão aceita).
- Teste automático: `backend/tests/test_termos_consentimento.py`.

## Como executar localmente

São dois servidores, iniciados separadamente.

**1. Banco de dados**
- Inicie o MySQL (WAMP).
- Execute `backend/database/create_database.sql` para criar o banco `market_skills`.

**2. API (servidor 1)**
```powershell
python -m venv .venv
.venv\Scripts\pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
```
No `backend/.env`, use `APP_ENV=development`, `SESSION_COOKIE_SECURE=false` e os dados do seu MySQL. Depois:
```powershell
cd backend
..\.venv\Scripts\flask --app app db upgrade
..\.venv\Scripts\python.exe app.py
```
Execute também `backend/database/procedures.sql` no MySQL para criar as Stored Procedures.
A API fica disponível em `http://127.0.0.1:5000` (teste: `http://127.0.0.1:5000/api/health`).

**3. Frontend (servidor 2)**
- No VS Code, clique com o botão direito em `frontend/index.html` → **Open with Live Server**.
- O site abre em `http://127.0.0.1:5500/frontend/index.html` e consome a API da porta 5000.

---

## Funcionalidades Implementadas

1. **Cadastrar estudante** — Frontend (`cadastro.html` + `autenticacao.js`) envia os dados do formulário de cadastro para a API Flask em `POST /api/autenticacao/cadastro`. A rota aciona o `AutenticacaoController`, que delega a criação para o `CriarUsuarioService`. O Service valida os dados e persiste um novo registro através do Model `Usuario` na tabela `usuarios` do banco de dados. O cadastro só é concluído se o usuário aceitar os **Termos de Uso e a Política de Privacidade** (`termos.html`): o Service recusa o cadastro sem o aceite e grava a data/hora e a versão aceita nos campos `termos_aceitos_em` e `versao_termos` do Model `Usuario`.

2. **Atualizar perfil profissional** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `PUT /api/perfis-profissionais/<perfil_id>`. O `PerfilProfissionalController` recebe a requisição e delega a atualização ao `AtualizarPerfilProfissionalService`, que aplica as validações e atualiza o registro através do Model `PerfilProfissional` na tabela `perfis_profissionais`.

3. **Adicionar habilidade ao perfil** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `POST /api/perfil-habilidades`. O `PerfilHabilidadeController` delega ao `CriarPerfilHabilidadeService`, que valida os dados e cria o registro através do Model `PerfilHabilidade` na tabela `perfil_habilidades`.

4. **Cadastrar experiência profissional** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `POST /api/experiencias-profissionais`. O `ExperienciaProfissionalController` delega ao `CriarExperienciaProfissionalService`, que valida os dados e persiste o registro através do Model `ExperienciaProfissional` na tabela `experiencias_profissionais`.

5. **Cadastrar formação acadêmica** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `POST /api/formacoes-academicas`. O `FormacaoAcademicaController` delega ao `CriarFormacaoAcademicaService`, que valida os dados e persiste o registro através do Model `FormacaoAcademica` na tabela `formacoes_academicas`.

6. **Cadastrar projeto** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `POST /api/projetos`. O `ProjetoController` delega ao `CriarProjetoService`, que valida os dados e persiste o registro através do Model `Projeto` na tabela `projetos`.

7. **Criar vaga** — Frontend (`vagas.html` + `vagas.js`) chama a API Flask em `POST /api/vagas`. O `VagaController` delega ao `CriarVagaService`, que valida os dados da vaga e persiste o registro através do Model `Vaga` na tabela `vagas`.

8. **Buscar vagas com filtros avançados** — Frontend (`vagas.html` + `vagas.js`) chama a API Flask em `GET /api/vagas/busca-avancada`. O `VagaController` delega ao `BuscarVagasAvancadoService`, que valida os filtros e utiliza o **Repository** `VagaRepository` para executar a **Stored Procedure** `sp_buscar_vagas_avancado` diretamente no banco MySQL, retornando as vagas ativas que atendem aos critérios informados.

9. **Comparar e rankear talentos por vaga** — Frontend (`talentos.html` + `talentos.js`) chama a API Flask em `GET /api/talentos/ranking`. O `TalentoController` delega ao `RankingTalentosService`, que utiliza o **Repository** `TalentoRepository` para executar a **Stored Procedure** `sp_ranking_talentos_por_vaga` diretamente no banco MySQL, retornando os talentos ordenados por percentual de compatibilidade com a vaga informada.

10. **Excluir vaga** — Frontend (`vagas.html` + `vagas.js`) chama a API Flask em `DELETE /api/vagas/<vaga_id>`. O `VagaController` delega ao `DeletarVagaService`, que verifica a existência da vaga e remove o registro através do Model `Vaga` na tabela `vagas`.

11. **Atualizar experiência profissional** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `PUT /api/experiencias-profissionais/<experiencia_id>`. O `ExperienciaProfissionalController` delega ao `AtualizarExperienciaProfissionalService`, que verifica se a experiência pertence ao estudante autenticado, valida os dados e atualiza o registro através do Model `ExperienciaProfissional` na tabela `experiencias_profissionais`.

12. **Excluir experiência profissional** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `DELETE /api/experiencias-profissionais/<experiencia_id>`. O `ExperienciaProfissionalController` delega ao `DeletarExperienciaProfissionalService`, que verifica se a experiência pertence ao estudante autenticado e remove o registro através do Model `ExperienciaProfissional` na tabela `experiencias_profissionais`.

13. **Atualizar formação acadêmica** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `PUT /api/formacoes-academicas/<formacao_id>`. O `FormacaoAcademicaController` delega ao `AtualizarFormacaoAcademicaService`, que verifica se a formação pertence ao estudante autenticado, valida os dados e atualiza o registro através do Model `FormacaoAcademica` na tabela `formacoes_academicas`.

14. **Excluir formação acadêmica** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `DELETE /api/formacoes-academicas/<formacao_id>`. O `FormacaoAcademicaController` delega ao `DeletarFormacaoAcademicaService`, que verifica se a formação pertence ao estudante autenticado e remove o registro através do Model `FormacaoAcademica` na tabela `formacoes_academicas`.

15. **Atualizar projeto** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `PUT /api/projetos/<projeto_id>`. O `ProjetoController` delega ao `AtualizarProjetoService`, que verifica se o projeto pertence ao estudante autenticado, valida os dados e atualiza o registro através do Model `Projeto` na tabela `projetos`.

16. **Excluir projeto** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `DELETE /api/projetos/<projeto_id>`. O `ProjetoController` delega ao `DeletarProjetoService`, que verifica se o projeto pertence ao estudante autenticado e remove o registro através do Model `Projeto` na tabela `projetos`.

17. **Remover habilidade do perfil** — Frontend (`perfil.html` + `perfil.js`) chama a API Flask em `DELETE /api/perfil-habilidades/<perfil_habilidade_id>`. O `PerfilHabilidadeController` delega ao `DeletarPerfilHabilidadeService`, que verifica se o vínculo pertence ao estudante autenticado e remove o registro através do Model `PerfilHabilidade` na tabela `perfil_habilidades` (a habilidade continua no catálogo `habilidades`).

18. **Atualizar vaga** — Frontend (`vagas.html` + `vagas.js`) chama a API Flask em `PUT /api/vagas/<vaga_id>`. O `VagaController` delega ao `AtualizarVagaService`, que verifica se a vaga pertence à empresa autenticada, valida os dados e atualiza o registro através do Model `Vaga` na tabela `vagas`.

19. **Criar plano de estudos** — Frontend (`estudos.html` + `estudos.js`) chama a API Flask em `POST /api/planos-estudo`. O `PlanoEstudoController` delega ao `CriarPlanoEstudoService`, que valida os dados e grava o plano do estudante autenticado através do Model `PlanoEstudo` na tabela `planos_estudo`.

20. **Atualizar status de etapa de estudo** — Frontend (`estudos.html` + `estudos.js`) chama a API Flask em `PUT /api/etapas-estudo/<etapa_id>` com o novo `status`. O `EtapaEstudoController` delega ao `AtualizarEtapaEstudoService`, que verifica se o plano da etapa pertence ao estudante autenticado, valida o status (`pendente`, `em_andamento` ou `concluida`) e atualiza o registro através do Model `EtapaEstudo` na tabela `etapas_estudo` (se a `ordem` também for enviada, o `EstudoRepository` impede ordem repetida no mesmo plano).

21. **Calcular compatibilidade do perfil com a vaga** — Frontend (`vagas.html` + `vagas.js`) chama a API Flask em `GET /api/vagas/<vaga_id>/compatibilidade` (somente estudante autenticado). O `VagaController` delega ao `CalcularCompatibilidadeVagaService`, que usa o **Repository** `VagaRepository` para buscar os requisitos da vaga e o `PerfilRepository` para buscar as habilidades do perfil do estudante. O Service aplica a regra do caso de uso — percentual = requisitos atendidos ÷ total de requisitos × 100 — e devolve o percentual, quantos requisitos obrigatórios ainda faltam e quais requisitos estão atendidos, exibidos na tela de detalhe da vaga.

## Diagrama de Classes

O diagrama de classes do domínio (Models, atributos, relacionamentos e cardinalidades), em Mermaid, está em [`docs/diagrama-classes.md`](docs/diagrama-classes.md).

## Fluxogramas dos Casos de Uso

Fluxogramas com o passo a passo pelas camadas (Frontend → Controller → Service → Repository → banco):

- **Recuperação de dados:** [`docs/fluxograma-busca-vagas.md`](docs/fluxograma-busca-vagas.md) — Buscar vagas com filtros avançados
- **Entrada de dados:** [`docs/fluxograma-cadastro-usuario.md`](docs/fluxograma-cadastro-usuario.md) — Cadastrar usuário (estudante ou empresa)
