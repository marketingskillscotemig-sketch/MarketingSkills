from flask import jsonify, request

from services.vaga.atualizar_vaga_service import (
    AtualizarVagaService,
)
from services.vaga.buscar_vaga_service import (
    BuscarVagaService,
)
from services.vaga.buscar_vagas_avancado_service import (
    BuscarVagasAvancadoService,
)
from services.vaga.criar_vaga_service import (
    CriarVagaService,
)
from services.vaga.deletar_vaga_service import (
    DeletarVagaService,
)
from services.vaga.listar_vagas_service import (
    ListarVagasService,
)


class VagaController:
    @staticmethod
    def criar():
        try:
            dados = request.get_json(
                silent=True
            )

            vaga = CriarVagaService.executar(
                dados
            )

            return jsonify(
                vaga.to_dict()
            ), 201

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def listar():
        vagas = (
            ListarVagasService.executar()
        )

        return jsonify(
            [
                vaga.to_dict()
                for vaga in vagas
            ]
        ), 200

    @staticmethod
    def buscar_avancado():
        try:
            resultado = (
                BuscarVagasAvancadoService
                .executar(
                    texto=request.args.get(
                        "texto"
                    ),
                    nivel=request.args.get(
                        "nivel"
                    ),
                    modalidade=request.args.get(
                        "modalidade"
                    ),
                    localizacao=request.args.get(
                        "localizacao"
                    ),
                    habilidade_id=
                        request.args.get(
                            "habilidadeId"
                        ),
                )
            )

            return jsonify(
                resultado
            ), 200

        except ValueError as erro:
            return jsonify(
                {
                    "erro": str(erro),
                }
            ), 400

    @staticmethod
    def buscar_por_id(vaga_id):
        try:
            vaga = BuscarVagaService.executar(
                vaga_id
            )

            return jsonify(
                vaga.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

    @staticmethod
    def atualizar(vaga_id):
        try:
            dados = request.get_json(
                silent=True
            )

            vaga = AtualizarVagaService.executar(
                vaga_id,
                dados,
            )

            return jsonify(
                vaga.to_dict()
            ), 200

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404

        except ValueError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 400

    @staticmethod
    def deletar(vaga_id):
        try:
            DeletarVagaService.executar(
                vaga_id
            )

            return "", 204

        except LookupError as erro:
            return jsonify(
                {"erro": str(erro)}
            ), 404