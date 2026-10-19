from models.alerta_vaga import AlertaVaga
from models.enums import (
    ModalidadeTrabalho,
    NivelExperiencia,
)


class CriarAlertaVagaService:
    @staticmethod
    def executar(usuario, dados):
        if not dados:
            raise ValueError(
                "Os dados do alerta de vaga são obrigatórios."
            )

        palavra_chave = dados.get("palavraChave")
        cidade = dados.get("cidade")
        modalidade = dados.get("modalidade")
        nivel_experiencia = dados.get(
            "nivelExperiencia"
        )
        ativo = dados.get("ativo", True)

        # O dono do alerta vem sempre da sessão
        # autenticada. Qualquer "usuarioId" enviado
        # no JSON é ignorado.
        usuario_id = usuario.id

        if palavra_chave is not None:
            if not isinstance(
                palavra_chave,
                str,
            ):
                raise ValueError(
                    "A palavra-chave deve ser um texto."
                )

            palavra_chave = palavra_chave.strip()

            if len(palavra_chave) > 120:
                raise ValueError(
                    "A palavra-chave não pode possuir "
                    "mais de 120 caracteres."
                )

        if cidade is not None:
            if not isinstance(cidade, str):
                raise ValueError(
                    "A cidade deve ser um texto."
                )

            cidade = cidade.strip()

            if len(cidade) > 120:
                raise ValueError(
                    "A cidade não pode possuir "
                    "mais de 120 caracteres."
                )

        modalidade_enum = None

        if modalidade is not None:
            try:
                modalidade_enum = (
                    ModalidadeTrabalho(
                        modalidade
                    )
                )
            except ValueError as erro:
                raise ValueError(
                    "Modalidade de trabalho inválida."
                ) from erro

        nivel_enum = None

        if nivel_experiencia is not None:
            try:
                nivel_enum = NivelExperiencia(
                    nivel_experiencia
                )
            except ValueError as erro:
                raise ValueError(
                    "Nível de experiência inválido."
                ) from erro

        if not isinstance(ativo, bool):
            raise ValueError(
                "O campo ativo deve ser booleano."
            )

        alerta = AlertaVaga(
            usuario_id=usuario_id,
            palavra_chave=palavra_chave,
            cidade=cidade,
            modalidade=modalidade_enum,
            nivel_experiencia=nivel_enum,
            ativo=ativo,
        )

        return alerta.salvar()