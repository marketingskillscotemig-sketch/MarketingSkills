from extensions import db


_NAO_INFORMADO = object()


class Empresa(db.Model):
    __tablename__ = "empresas"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "usuarios.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    # Nome fantasia da empresa.
    nome = db.Column(
        db.String(150),
        nullable=False,
    )

    razao_social = db.Column(
        db.String(180),
        nullable=True,
    )

    cnpj = db.Column(
        db.String(14),
        nullable=True,
        unique=True,
        index=True,
    )

    setor = db.Column(
        db.String(120),
        nullable=True,
    )

    porte = db.Column(
        db.String(50),
        nullable=True,
    )

    localizacao = db.Column(
        db.String(150),
        nullable=True,
    )

    trabalho_remoto = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    descricao = db.Column(
        db.Text,
        nullable=True,
    )

    site = db.Column(
        db.String(255),
        nullable=True,
    )

    linkedin = db.Column(
        db.String(255),
        nullable=True,
    )

    stack_tecnologico = db.Column(
        db.Text,
        nullable=True,
    )

    beneficios = db.Column(
        db.Text,
        nullable=True,
    )

    logo_url = db.Column(
        db.String(500),
        nullable=True,
    )

    banner_url = db.Column(
        db.String(500),
        nullable=True,
    )

    usuario = db.relationship(
        "Usuario",
        back_populates="empresa",
    )

    vagas = db.relationship(
        "Vaga",
        back_populates="empresa",
        cascade="all, delete-orphan",
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        nome=_NAO_INFORMADO,
        razao_social=_NAO_INFORMADO,
        cnpj=_NAO_INFORMADO,
        setor=_NAO_INFORMADO,
        porte=_NAO_INFORMADO,
        localizacao=_NAO_INFORMADO,
        trabalho_remoto=_NAO_INFORMADO,
        descricao=_NAO_INFORMADO,
        site=_NAO_INFORMADO,
        linkedin=_NAO_INFORMADO,
        stack_tecnologico=_NAO_INFORMADO,
        beneficios=_NAO_INFORMADO,
        logo_url=_NAO_INFORMADO,
        banner_url=_NAO_INFORMADO,
    ):
        if nome is not _NAO_INFORMADO:
            self.nome = nome

        if razao_social is not _NAO_INFORMADO:
            self.razao_social = razao_social

        if cnpj is not _NAO_INFORMADO:
            self.cnpj = cnpj

        if setor is not _NAO_INFORMADO:
            self.setor = setor

        if porte is not _NAO_INFORMADO:
            self.porte = porte

        if localizacao is not _NAO_INFORMADO:
            self.localizacao = localizacao

        if trabalho_remoto is not _NAO_INFORMADO:
            self.trabalho_remoto = trabalho_remoto

        if descricao is not _NAO_INFORMADO:
            self.descricao = descricao

        if site is not _NAO_INFORMADO:
            self.site = site

        if linkedin is not _NAO_INFORMADO:
            self.linkedin = linkedin

        if stack_tecnologico is not _NAO_INFORMADO:
            self.stack_tecnologico = stack_tecnologico

        if beneficios is not _NAO_INFORMADO:
            self.beneficios = beneficios

        if logo_url is not _NAO_INFORMADO:
            self.logo_url = logo_url

        if banner_url is not _NAO_INFORMADO:
            self.banner_url = banner_url

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(Empresa)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(
            Empresa,
            id,
        )

    def to_dict(
        self,
        incluir_dados_administrativos=False,
    ):
        dados = {
            "id": self.id,
            "usuarioId": self.usuario_id,
            "nome": self.nome,
            "setor": self.setor,
            "porte": self.porte,
            "localizacao": self.localizacao,
            "trabalhoRemoto": self.trabalho_remoto,
            "descricao": self.descricao,
            "site": self.site,
            "linkedin": self.linkedin,
            "stackTecnologico": self.stack_tecnologico,
            "beneficios": self.beneficios,
            "logoUrl": self.logo_url,
            "bannerUrl": self.banner_url,
        }

        if incluir_dados_administrativos:
            dados.update(
                {
                    "razaoSocial":
                        self.razao_social,

                    "cnpj":
                        self.cnpj,
                }
            )

        return dados