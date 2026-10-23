# Diagrama de Classes

Diagrama das classes de domínio do Market Skills, feito a partir dos
Models em `backend/models/`. Cada classe corresponde a uma tabela do
banco MySQL (nome da tabela entre parênteses na lista abaixo do diagrama).

```mermaid
classDiagram
    direction LR

    class Usuario {
        +int id
        +str nome
        +str email
        +str senha_hash
        +date data_cadastro
        +StatusUsuario status
        +TipoConta tipo_conta
    }

    class PerfilProfissional {
        +int id
        +int usuario_id
        +NivelExperiencia nivel_experiencia
        +str objetivo_profissional
        +ModalidadeTrabalho modalidade_preferida
        +str localizacao_preferida
        +int horas_semanais_estudo
        +decimal pretensao_salarial
        +str foto_url
        +str sobre_mim
        +str curriculo_url
    }

    class Habilidade {
        +int id
        +str nome
        +CategoriaHabilidade categoria
        +str descricao
    }

    class PerfilHabilidade {
        +int id
        +int perfil_profissional_id
        +int habilidade_id
        +NivelHabilidade nivel_dominio
        +datetime data_atualizacao
        +pertence_ao_usuario(usuario_id) bool
    }

    class ExperienciaProfissional {
        +int id
        +int perfil_profissional_id
        +str empresa
        +str cargo
        +date data_inicio
        +date data_fim
        +bool atual
        +str descricao
        +pertence_ao_usuario(usuario_id) bool
    }

    class FormacaoAcademica {
        +int id
        +int perfil_profissional_id
        +str instituicao
        +str curso
        +str tipo_formacao
        +date data_inicio
        +date data_fim
        +bool em_andamento
        +str descricao
        +pertence_ao_usuario(usuario_id) bool
    }

    class Projeto {
        +int id
        +int perfil_profissional_id
        +str nome
        +str descricao
        +str tecnologias
        +str link
        +pertence_ao_usuario(usuario_id) bool
    }

    class Empresa {
        +int id
        +int usuario_id
        +str nome
        +str razao_social
        +str cnpj
        +str setor
        +str porte
        +str localizacao
        +bool trabalho_remoto
        +str descricao
        +str site
        +str linkedin
        +str stack_tecnologico
        +str beneficios
        +str logo_url
        +str banner_url
    }

    class Vaga {
        +int id
        +int empresa_id
        +str titulo
        +str descricao
        +str beneficios
        +NivelExperiencia nivel_experiencia
        +ModalidadeTrabalho modalidade
        +str localizacao
        +decimal salario_minimo
        +decimal salario_maximo
        +date data_publicacao
        +StatusVaga status
        +pertence_ao_usuario(usuario_id) bool
    }

    class RequisitoVaga {
        +int id
        +int vaga_id
        +int habilidade_id
        +NivelHabilidade nivel_exigido
        +bool obrigatorio
        +decimal peso
        +str descricao
    }

    class PlanoEstudo {
        +int id
        +int usuario_id
        +str titulo
        +str objetivo
        +date data_criacao
        +date data_inicio
        +date data_fim_prevista
        +decimal percentual_conclusao
        +StatusPlano status
        +pertence_ao_usuario(usuario_id) bool
    }

    class EtapaEstudo {
        +int id
        +int plano_estudo_id
        +str titulo
        +str descricao
        +int ordem
        +int carga_horaria_estimada
        +date data_inicio_prevista
        +date data_conclusao
        +StatusEtapa status
    }

    class AlertaVaga {
        +int id
        +int usuario_id
        +str palavra_chave
        +str cidade
        +ModalidadeTrabalho modalidade
        +NivelExperiencia nivel_experiencia
        +bool ativo
        +pertence_ao_usuario(usuario_id) bool
    }

    class Notificacao {
        +int id
        +int alerta_vaga_id
        +str titulo
        +str mensagem
        +date data_envio
        +bool lida
        +pertence_ao_usuario(usuario_id) bool
    }

    class TendenciaMercado {
        +int id
        +str cargo
        +str tecnologia
        +decimal demanda
        +decimal media_salarial
        +date data_atualizacao
    }

    Usuario "1" *-- "0..1" PerfilProfissional : perfil_profissional
    Usuario "1" *-- "0..1" Empresa : empresa
    Usuario "1" *-- "0..*" PlanoEstudo : planos_estudo
    Usuario "1" *-- "0..*" AlertaVaga : alertas_vaga

    PerfilProfissional "1" *-- "0..*" PerfilHabilidade : habilidades
    PerfilProfissional "1" *-- "0..*" ExperienciaProfissional : experiencias_profissionais
    PerfilProfissional "1" *-- "0..*" FormacaoAcademica : formacoes_academicas
    PerfilProfissional "1" *-- "0..*" Projeto : projetos
    Habilidade "1" -- "0..*" PerfilHabilidade : perfis

    Empresa "1" *-- "0..*" Vaga : vagas
    Vaga "1" *-- "0..*" RequisitoVaga : requisitos
    Habilidade "1" -- "0..*" RequisitoVaga : requisitos_vaga

    PlanoEstudo "1" *-- "0..*" EtapaEstudo : etapas
    PlanoEstudo "0..*" -- "0..*" Habilidade : plano_habilidades

    AlertaVaga "1" *-- "0..*" Notificacao : notificacoes
```

## Classes e tabelas

| Classe | Tabela | Arquivo |
|---|---|---|
| Usuario | `usuarios` | `models/usuario.py` |
| PerfilProfissional | `perfis_profissionais` | `models/perfil_profissional.py` |
| Habilidade | `habilidades` | `models/habilidade.py` |
| PerfilHabilidade | `perfil_habilidades` | `models/perfil_habilidade.py` |
| ExperienciaProfissional | `experiencias_profissionais` | `models/experiencia_profissional.py` |
| FormacaoAcademica | `formacoes_academicas` | `models/formacao_academica.py` |
| Projeto | `projetos` | `models/projeto.py` |
| Empresa | `empresas` | `models/empresa.py` |
| Vaga | `vagas` | `models/vaga.py` |
| RequisitoVaga | `requisitos_vaga` | `models/requisito_vaga.py` |
| PlanoEstudo | `planos_estudo` | `models/plano_estudo.py` |
| EtapaEstudo | `etapas_estudo` | `models/etapa_estudo.py` |
| AlertaVaga | `alertas_vaga` | `models/alerta_vaga.py` |
| Notificacao | `notificacoes` | `models/notificacao.py` |
| TendenciaMercado | `tendencias_mercado` | `models/tendencia_mercado.py` |
| (associação PlanoEstudo–Habilidade) | `plano_habilidades` | `models/plano_estudo.py` |

## Como ler o diagrama

- **Composição (`*--`)**: o objeto "parte" não existe sem o "todo".
  No código, a relação tem `cascade="all, delete-orphan"` e a chave
  estrangeira é obrigatória. Exemplo: ao excluir uma `Vaga`, os seus
  `RequisitoVaga` também são excluídos.
- **Associação (`--`)**: as duas classes existem de forma independente.
  Exemplo: uma `Habilidade` do catálogo é usada por vários requisitos
  de vagas e por vários perfis.
- **`0..1`**: `perfis_profissionais.usuario_id` e `empresas.usuario_id`
  são únicos, então cada usuário tem no máximo um perfil profissional
  (conta estudante) ou uma empresa (conta empresa).
- **`PerfilHabilidade`** é a classe de associação entre
  `PerfilProfissional` e `Habilidade`: guarda o nível de domínio e
  tem restrição de unicidade no par (perfil, habilidade). As duas
  chaves estrangeiras têm `ondelete="CASCADE"`, então o vínculo é
  removido se o perfil ou a habilidade for excluído.
- **`plano_habilidades`** é uma tabela associativa simples
  (muitos-para-muitos), sem atributos próprios.
- **`TendenciaMercado`** é um catálogo independente, sem chaves
  estrangeiras.
- Não há herança entre as classes de domínio: todas apenas estendem
  `db.Model` (classe base do Flask-SQLAlchemy).

## Enumerações

| Enum | Valores |
|---|---|
| StatusUsuario | `ativo`, `inativo` |
| TipoConta | `estudante`, `empresa` |
| NivelExperiencia | `iniciante`, `junior`, `pleno`, `senior` |
| ModalidadeTrabalho | `presencial`, `hibrido`, `remoto` |
| CategoriaHabilidade | `linguagem`, `framework`, `banco_dados`, `ferramenta`, `conceito`, `outra` |
| NivelHabilidade | `basico`, `intermediario`, `avancado` |
| StatusVaga | `ativa`, `pausada`, `encerrada` |
| StatusPlano | `nao_iniciado`, `em_andamento`, `pausado`, `concluido` |
| StatusEtapa | `pendente`, `em_andamento`, `concluida` |

## Métodos comuns

Além de `pertence_ao_usuario()` (indicado no diagrama nas classes que o
possuem, usado nas regras de autorização dos Services), todos os Models
têm os mesmos métodos de persistência: `salvar()`, `atualizar()`,
`deletar()`, `listar_todos()`, `buscar_por_id()` e `to_dict()`.
