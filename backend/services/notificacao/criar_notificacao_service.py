from models.alerta_vaga import AlertaVaga
from models.notificacao import Notificacao


class CriarNotificacaoService:
    @staticmethod
    def executar(dados):
        if not dados:
            raise ValueError(
                "Os dados da notificação são obrigatórios."
            )

        alerta_vaga_id = dados.get("alertaVagaId")
        titulo = dados.get("titulo")
        mensagem = dados.get("mensagem")
        lida = dados.get("lida", False)

        if alerta_vaga_id is None:
            raise ValueError(
                "O alerta de vaga é obrigatório."
            )

        alerta = AlertaVaga.buscar_por_id(
            alerta_vaga_id
        )

        if alerta is None:
            raise LookupError(
                "Alerta de vaga não encontrado."
            )

        if (
            not isinstance(titulo, str)
            or not titulo.strip()
        ):
            raise ValueError(
                "O título da notificação é obrigatório."
            )

        titulo = titulo.strip()

        if len(titulo) > 180:
            raise ValueError(
                "O título não pode possuir mais de 180 caracteres."
            )

        if (
            not isinstance(mensagem, str)
            or not mensagem.strip()
        ):
            raise ValueError(
                "A mensagem da notificação é obrigatória."
            )

        mensagem = mensagem.strip()

        if len(mensagem) > 500:
            raise ValueError(
                "A mensagem não pode possuir mais de 500 caracteres."
            )

        if not isinstance(lida, bool):
            raise ValueError(
                "O campo lida deve ser booleano."
            )

        notificacao = Notificacao(
            alerta_vaga_id=alerta_vaga_id,
            titulo=titulo,
            mensagem=mensagem,
            lida=lida,
        )

        return notificacao.salvar()