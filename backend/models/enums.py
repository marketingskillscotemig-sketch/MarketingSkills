from enum import Enum


class StatusUsuario(str, Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"

class TipoConta(str, Enum):
    ESTUDANTE = "estudante"
    EMPRESA = "empresa"


class NivelExperiencia(str, Enum):
    INICIANTE = "iniciante"
    JUNIOR = "junior"
    PLENO = "pleno"
    SENIOR = "senior"


class ModalidadeTrabalho(str, Enum):
    PRESENCIAL = "presencial"
    HIBRIDO = "hibrido"
    REMOTO = "remoto"


class CategoriaHabilidade(str, Enum):
    LINGUAGEM = "linguagem"
    FRAMEWORK = "framework"
    BANCO_DADOS = "banco_dados"
    FERRAMENTA = "ferramenta"
    CONCEITO = "conceito"
    OUTRA = "outra"


class NivelHabilidade(str, Enum):
    BASICO = "basico"
    INTERMEDIARIO = "intermediario"
    AVANCADO = "avancado"


def enum_values(enum_class):
    return [item.value for item in enum_class]

class StatusVaga(str, Enum):
    ATIVA = "ativa"
    PAUSADA = "pausada"
    ENCERRADA = "encerrada"


class StatusPlano(str, Enum):
    NAO_INICIADO = "nao_iniciado"
    EM_ANDAMENTO = "em_andamento"
    PAUSADO = "pausado"
    CONCLUIDO = "concluido"


class StatusEtapa(str, Enum):
    PENDENTE = "pendente"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDA = "concluida"