from datetime import date

from extensions import db


class TendenciaMercado(db.Model):
    __tablename__ = "tendencias_mercado"

    id = db.Column(db.Integer, primary_key=True)

    cargo = db.Column(
        db.String(150),
        nullable=False,
    )

    tecnologia = db.Column(
        db.String(120),
        nullable=False,
    )

    demanda = db.Column(
        db.Numeric(10, 2),
        nullable=True,
    )

    media_salarial = db.Column(
        db.Numeric(12, 2),
        nullable=True,
    )

    data_atualizacao = db.Column(
        db.Date,
        nullable=False,
        default=date.today,
        onupdate=date.today,
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()
        return self

    def atualizar(
        self,
        cargo=None,
        tecnologia=None,
        demanda=None,
        media_salarial=None,
    ):
        if cargo is not None:
            self.cargo = cargo

        if tecnologia is not None:
            self.tecnologia = tecnologia

        if demanda is not None:
            self.demanda = demanda

        if media_salarial is not None:
            self.media_salarial = media_salarial

        self.data_atualizacao = date.today()

        db.session.commit()
        return self

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def listar_todos():
        return db.session.execute(
            db.select(TendenciaMercado)
        ).scalars().all()

    @staticmethod
    def buscar_por_id(id):
        return db.session.get(TendenciaMercado, id)

    def to_dict(self):
        return {
            "id": self.id,
            "cargo": self.cargo,
            "tecnologia": self.tecnologia,
            "demanda": (
                float(self.demanda)
                if self.demanda is not None
                else None
            ),
            "mediaSalarial": (
                float(self.media_salarial)
                if self.media_salarial is not None
                else None
            ),
            "dataAtualizacao": (
                self.data_atualizacao.isoformat()
                if self.data_atualizacao
                else None
            ),
        }