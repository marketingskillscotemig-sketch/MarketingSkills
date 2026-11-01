# Fluxograma — Cadastrar usuário (estudante ou empresa)

**Tipo:** entrada de dados
**Caso de uso:** uma pessoa cria uma conta de estudante ou de empresa. Ela precisa
aceitar os Termos de Uso e a Política de Privacidade; os dados são validados, o
sistema confere se o e-mail (e o CNPJ, no caso de empresa) ainda não existe e grava
a conta no banco junto com a data e a versão do aceite.

**Caminho pelas camadas:**
Frontend → Rota → Controller → Service → Repository → Models → MySQL → resposta

```mermaid
flowchart TD
    subgraph FRONT["Frontend — cadastro.html + autenticacao.js"]
        A([Usuário escolhe Estudante ou Empresa,<br/>preenche o formulário e marca<br/>'Li e aceito os Termos']) --> B{"Termos aceitos?<br/>Senha e confirmação iguais?<br/>Empresa: nome, razão social<br/>e CNPJ com 14 dígitos?"}
        B -- Não --> B1["Mostra a mensagem de erro<br/>sem chamar a API"]
        B -- Sim --> C["apiRequest() obtém o token CSRF<br/>e envia POST /api/autenticacao/cadastro<br/>com os dados e aceiteTermos: true"]
    end

    subgraph ROTA["Rota — routes/autenticacao_routes.py"]
        D["POST /api/autenticacao/cadastro<br/>limite de cadastros por IP<br/>+ verificação do token CSRF"]
    end

    subgraph CTRL["Controller — controllers/autenticacao_controller.py"]
        E["AutenticacaoController.cadastrar()<br/>lê o JSON da requisição"]
        F["Responde 400<br/>{ erro: mensagem }"]
        V["iniciar_sessao(usuario)<br/>+ gera novo token CSRF"]
        W["Responde 201<br/>{ mensagem, usuario, csrfToken }"]
    end

    subgraph SERV["Service — services/usuario/criar_usuario_service.py"]
        G["CriarUsuarioService.executar()<br/>valida nome, formato do e-mail<br/>e senha (8 a 128, diferente do e-mail)"]
        G1{"Dados válidos e<br/>aceiteTermos = true?"}
        I{"E-mail já<br/>cadastrado?"}
        J{"Tipo de conta"}
        K{"Nome fantasia, razão social<br/>e CNPJ válidos?"}
        M{"CNPJ já<br/>cadastrado?"}
        N["Cria o Model Usuario<br/>com a senha criptografada<br/>e o consentimento registrado:<br/>termos_aceitos_em + versao_termos"]
        O["Cria o Model Empresa<br/>ligado ao usuário"]
        P["db.session.commit()<br/>(em caso de falha: rollback)"]
    end

    subgraph REPO["Repository — repositories/conta_repository.py"]
        H["ContaRepository.buscar_usuario_por_email()"]
        L["ContaRepository.buscar_empresa_por_cnpj()"]
    end

    subgraph BANCO["Banco MySQL"]
        H2[("SELECT em usuarios<br/>WHERE email = ?")]
        L2[("SELECT em empresas<br/>WHERE cnpj = ?")]
        Q[("INSERT em usuarios<br/>(+ INSERT em empresas)")]
    end

    C --> D --> E --> G --> G1
    G1 -- Não --> F
    G1 -- Sim --> H --> H2 --> I
    I -- Sim --> F
    I -- Não --> J
    J -- Estudante --> N
    J -- Empresa --> K
    K -- Não --> F
    K -- Sim --> L --> L2 --> M
    M -- Sim --> F
    M -- Não --> N
    N -- Empresa --> O --> P
    N -- Estudante --> P
    P --> Q --> V --> W

    F --> X["Frontend mostra a mensagem de erro<br/>(ex.: 'Já existe um usuário com este e-mail.')"]
    W --> Y["Frontend mostra<br/>'Conta criada com sucesso.'"]
    Y --> Z([Redireciona para a página inicial<br/>já com a sessão iniciada])
```

## Responsabilidade de cada camada

| Camada | Arquivo | O que faz neste caso de uso |
|---|---|---|
| Frontend | `frontend/assets/js/autenticacao.js` | Validação rápida no navegador, envio dos dados com token CSRF e redirecionamento |
| Rota | `backend/routes/autenticacao_routes.py` | Liga `POST /api/autenticacao/cadastro` ao Controller, com limite de requisições por IP |
| Controller | `backend/controllers/autenticacao_controller.py` | Recebe a requisição, aciona o Service, inicia a sessão e devolve 201 ou 400 |
| Service | `backend/services/usuario/criar_usuario_service.py` | Regras do caso de uso: exige o aceite dos termos, valida os dados, impede e-mail ou CNPJ repetido, criptografa a senha e grava a conta com a data e a versão do aceite |
| Repository | `backend/repositories/conta_repository.py` | Consultas ao banco: busca usuário por e-mail e empresa por CNPJ |
| Models | `backend/models/usuario.py`, `backend/models/empresa.py` | Representam as tabelas `usuarios` e `empresas` (ORM SQLAlchemy) |
| Banco | MySQL | Tabelas `usuarios` e `empresas` |
