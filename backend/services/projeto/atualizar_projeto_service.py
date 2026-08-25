from models.perfil_profissional import PerfilProfissional
from models.projeto import Projeto


class AtualizarProjetoService:
    @staticmethod
    def executar(projeto_id, dados):
        if not dados:
            raise ValueError(
                "Os dados para atualização são obrigatórios."
            )

        projeto = Projeto.buscar_por_id(
            projeto_id
        )

        if projeto is None:
            raise LookupError(
                "Projeto não encontrado."
            )

        if "perfilProfissionalId" in dados:
            perfil_id = dados.get(
                "perfilProfissionalId"
            )

            if perfil_id is None:
                raise ValueError(
                    "O perfil profissional é obrigatório."
                )

            perfil = PerfilProfissional.buscar_por_id(
                perfil_id
            )

            if perfil is None:
                raise LookupError(
                    "Perfil profissional não encontrado."
                )

            projeto.perfil_profissional_id = (
                perfil_id
            )

        if "nome" in dados:
            nome = dados.get("nome")

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

            projeto.nome = nome

        if "descricao" in dados:
            descricao = dados.get(
                "descricao"
            )

            if descricao is not None:
                if not isinstance(
                    descricao,
                    str,
                ):
                    raise ValueError(
                        "A descrição deve ser um texto."
                    )

                descricao = (
                    descricao.strip()
                    or None
                )

                if (
                    descricao
                    and len(descricao) > 1000
                ):
                    raise ValueError(
                        "A descrição não pode possuir "
                        "mais de 1000 caracteres."
                    )

            projeto.descricao = descricao

        if "tecnologias" in dados:
            tecnologias = dados.get(
                "tecnologias"
            )

            if tecnologias is not None:
                if not isinstance(
                    tecnologias,
                    str,
                ):
                    raise ValueError(
                        "As tecnologias devem ser um texto."
                    )

                tecnologias = (
                    tecnologias.strip()
                    or None
                )

                if (
                    tecnologias
                    and len(tecnologias) > 255
                ):
                    raise ValueError(
                        "As tecnologias não podem possuir "
                        "mais de 255 caracteres."
                    )

            projeto.tecnologias = tecnologias

        if "link" in dados:
            link = dados.get("link")

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

            projeto.link = link

        return projeto.salvar()