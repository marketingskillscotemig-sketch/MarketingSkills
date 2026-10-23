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
```

---

## Funcionalidades Implementadas

1. **Cadastrar estudante** — Frontend (`cadastro.html` + `autenticacao.js`) envia os dados do formulário de cadastro para a API Flask em `POST /api/autenticacao/cadastro`. A rota aciona o `AutenticacaoController`, que delega a criação para o `CriarUsuarioService`. O Service valida os dados e persiste um novo registro através do Model `Usuario` na tabela `usuarios` do banco de dados.

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

## Diagrama de Classes

O diagrama de classes do domínio (Models, atributos, relacionamentos e cardinalidades), em Mermaid, está em [`docs/diagrama-classes.md`](docs/diagrama-classes.md).
