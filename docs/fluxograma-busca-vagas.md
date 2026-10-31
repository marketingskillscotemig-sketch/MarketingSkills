# Fluxograma — Buscar vagas com filtros avançados

**Tipo:** recuperação de dados
**Caso de uso:** o estudante pesquisa vagas por texto, nível de experiência,
modalidade e localização, e recebe apenas as vagas ativas que atendem aos filtros.

**Caminho pelas camadas:**
Frontend → Rota → Controller → Service → Repository → Stored Procedure (MySQL) → resposta

```mermaid
flowchart TD
    subgraph FRONT["Frontend — vagas.html + vagas.js"]
        A([Estudante preenche os filtros:<br/>texto, modalidade, experiência, localização]) --> B["buscarVagas() monta os parâmetros<br/>com URLSearchParams"]
        B --> C["apiRequest() envia<br/>GET /api/vagas/busca-avancada?filtros"]
    end

    subgraph ROTA["Rota — routes/vaga_routes.py"]
        D["GET /api/vagas/busca-avancada<br/>(leitura pública)"]
    end

    subgraph CTRL["Controller — controllers/vaga_controller.py"]
        E["VagaController.buscar_avancado()<br/>lê os filtros de request.args"]
        F["Responde 400<br/>{ erro: mensagem }"]
        Q["Responde 200<br/>com a lista de vagas em JSON"]
    end

    subgraph SERV["Service — services/vaga/buscar_vagas_avancado_service.py"]
        G["BuscarVagasAvancadoService.executar()<br/>normaliza os textos (strip / lower)"]
        H{"Nível de experiência<br/>é válido?"}
        I{"Modalidade<br/>é válida?"}
        J{"ID da habilidade é<br/>numérico e maior que 0?"}
        P["Converte cada linha para JSON<br/>(camelCase, data em ISO)"]
    end

    subgraph REPO["Repository — repositories/vaga_repository.py"]
        K["VagaRepository.buscar_avancado()<br/>CALL sp_buscar_vagas_avancado(...)<br/>com parâmetros nomeados"]
        O["Converte o resultado<br/>em lista de dicionários"]
    end

    subgraph BANCO["Banco MySQL — database/procedures.sql"]
        L[("sp_buscar_vagas_avancado")]
        M["SELECT DISTINCT em vagas<br/>JOIN empresas<br/>LEFT JOIN requisitos_vaga e habilidades"]
        N["WHERE status = 'ativa'<br/>+ filtros de texto, nível,<br/>modalidade, localização e habilidade"]
    end

    C --> D --> E --> G --> H
    H -- Não --> F
    H -- Sim ou vazio --> I
    I -- Não --> F
    I -- Sim ou vazio --> J
    J -- Não --> F
    J -- Sim ou vazio --> K
    K --> L --> M --> N --> O --> P --> Q

    F --> R["Frontend mostra:<br/>'Não foi possível carregar as vagas.'"]
    Q --> S["ordenarVagas() aplica a ordenação escolhida"]
    S --> T(["mostrarVagasEstudante() exibe<br/>as vagas encontradas na tela"])
```

## Responsabilidade de cada camada

| Camada | Arquivo | O que faz neste caso de uso |
|---|---|---|
| Frontend | `frontend/assets/js/vagas.js` | Lê os filtros da tela, chama a API e exibe o resultado |
| Rota | `backend/routes/vaga_routes.py` | Liga `GET /api/vagas/busca-avancada` ao Controller |
| Controller | `backend/controllers/vaga_controller.py` | Recebe a requisição, aciona o Service e devolve 200 ou 400 |
| Service | `backend/services/vaga/buscar_vagas_avancado_service.py` | Regras do caso de uso: valida nível, modalidade e habilidade; formata a resposta |
| Repository | `backend/repositories/vaga_repository.py` | Executa a consulta SQL (`CALL` da Stored Procedure) |
| Banco | `backend/database/procedures.sql` | `sp_buscar_vagas_avancado`: filtra só vagas ativas com JOIN entre vagas, empresas, requisitos e habilidades |
