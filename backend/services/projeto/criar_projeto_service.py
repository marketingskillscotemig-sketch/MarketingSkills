from models.projeto import Projeto


class CriarProjetoService:
    @staticmethod
    def executar(usuario, dados):
        if not dados:
            raise ValueError(
                "Os dados do projeto são obrigatórios."
            )

        nome = dados.get("nome")
        descricao = dados.get("descricao")
        tecnologias = dados.get("tecnologias")
        link = dados.get("link")

        # O perfil vem sempre da sessão autenticada.
        # Qualquer "perfilProfissionalId" enviado no
        # JSON é ignorado.
        perfil = usuario.perfil_profissional

        if perfil is None:
            raise LookupError(
                "Perfil profissional não encontrado."
            )

        perfil_id = perfil.id

        if (
            not isinstance(nome, str)
            or not nome.strip()
        ):
            raise ValueError(
                "O nome do projeto é obrigatório."
            )

        nome = nome.strip()

        if len(nome) > 180:
            raise ValueError(
                "O nome do projeto não pode possuir "
                "mais de 180 caracteres."
            )

        if descricao is not None:
            if not isinstance(descricao, str):
                raise ValueError(
                    "A descrição deve ser um texto."
                )

            descricao = descricao.strip() or None

            if (
                descricao
                and len(descricao) > 1000
            ):
                raise ValueError(
                    "A descrição não pode possuir "
                    "mais de 1000 caracteres."
                )

        if tecnologias is not None:
            if not isinstance(tecnologias, str):
                raise ValueError(
                    "As tecnologias devem ser um texto."
                )

            tecnologias = tecnologias.strip() or None

            if (
                tecnologias
                and len(tecnologias) > 255
            ):
                raise ValueError(
                    "As tecnologias não podem possuir "
                    "mais de 255 caracteres."
                )

        if link is not None:
            if not isinstance(link, str):
                raise ValueError(
                    "O link deve ser um texto."
                )

            link = link.strip() or None

            if link and len(link) > 500:
                raise ValueError(
                    "O link não pode possuir "
                    "mais de 500 caracteres."
                )

            # Somente http:// ou https:// (bloqueia
            # javascript:, data:, ftp: etc.).
            if link and not link.lower().startswith(
                ("http://", "https://")
            ):
                raise ValueError(
                    "O link deve começar com "
                    "http:// ou https://."
                )

        projeto = Projeto(
            perfil_profissional_id=perfil_id,
            nome=nome,
            descricao=descricao,
            tecnologias=tecnologias,
            link=link,
        )

        return projeto.salvar()