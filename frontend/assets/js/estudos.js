let planos = [];
let etapas = [];

let usuarioAtualEstudos = null;

let planoSelecionadoId = null;
let planoEmEdicaoId = null;
let etapaEmEdicaoId = null;

let temporizadorMensagem = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaEstudos
);


async function iniciarPaginaEstudos() {
    registrarEventos();

    await carregarDados();
}


function registrarEventos() {
    document
        .getElementById("botao-novo-plano")
        .addEventListener(
            "click",
            abrirNovoPlano
        );

    document
        .getElementById("botao-primeiro-plano")
        .addEventListener(
            "click",
            abrirNovoPlano
        );

    document
        .getElementById("botao-editar-plano")
        .addEventListener(
            "click",
            editarPlanoSelecionado
        );

    document
        .getElementById("botao-excluir-plano")
        .addEventListener(
            "click",
            excluirPlanoSelecionado
        );

    document
        .getElementById("botao-nova-etapa")
        .addEventListener(
            "click",
            abrirNovaEtapa
        );

    document
        .getElementById("formulario-plano")
        .addEventListener(
            "submit",
            salvarPlano
        );

    document
        .getElementById("formulario-etapa")
        .addEventListener(
            "submit",
            salvarEtapa
        );

    document
        .getElementById("lista-planos")
        .addEventListener(
            "click",
            selecionarPlano
        );

    document
        .getElementById("lista-etapas")
        .addEventListener(
            "click",
            tratarAcaoEtapa
        );

    document
        .querySelectorAll("[data-fechar]")
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => {
                    document
                        .getElementById(
                            botao.dataset.fechar
                        )
                        .close();
                }
            );
        });
}


async function carregarDados() {
    try {
        const [
            dadosSessao,
            dadosPlanos,
            dadosEtapas,
        ] = await Promise.all([
            apiRequest(
                "/autenticacao/sessao"
            ),
            apiRequest(
                "/planos-estudo"
            ),
            apiRequest(
                "/etapas-estudo"
            ),
        ]);

        if (
            !dadosSessao.autenticado ||
            !dadosSessao.usuario
        ) {
            window.location.href =
                "./login.html";

            return;
        }

        usuarioAtualEstudos =
            dadosSessao.usuario;

        planos =
            dadosPlanos.filter(
                plano =>
                    plano.usuarioId ===
                    usuarioAtualEstudos.id
            );

        const idsPlanos =
            new Set(
                planos.map(
                    plano => plano.id
                )
            );

        etapas =
            dadosEtapas.filter(
                etapa =>
                    idsPlanos.has(
                        etapa.planoEstudoId
                    )
            );

        definirPlanoSelecionado();

        renderizarPagina();

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            erro.message ||
            "Não foi possível carregar os estudos.",
            "erro"
        );
    }
}


function definirPlanoSelecionado() {
    if (
        planoSelecionadoId &&
        planos.some(
            plano =>
                plano.id ===
                planoSelecionadoId
        )
    ) {
        return;
    }

    planoSelecionadoId =
        planos.length
            ? planos[0].id
            : null;
}


function renderizarPagina() {
    renderizarListaPlanos();
    renderizarPlanoSelecionado();
}


function renderizarListaPlanos() {
    const conteiner =
        document.getElementById(
            "lista-planos"
        );

    document.getElementById(
        "quantidade-planos"
    ).textContent =
        planos.length;

    if (!planos.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhum plano cadastrado.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        planos
            .map(plano => `
                <button
                    type="button"
                    class="
                        item-plano
                        ${
                            plano.id ===
                            planoSelecionadoId
                                ? "selecionado"
                                : ""
                        }
                    "
                    data-plano-id="${plano.id}"
                >
                    <strong>
                        ${escaparHtml(
                            plano.titulo
                        )}
                    </strong>

                    <span>
                        ${formatarStatusPlano(
                            plano.status
                        )}
                        ·
                        ${
                            plano.percentualConclusao
                        }%
                    </span>
                </button>
            `)
            .join("");
}


function selecionarPlano(evento) {
    const botao =
        evento.target.closest(
            "[data-plano-id]"
        );

    if (!botao) {
        return;
    }

    planoSelecionadoId =
        Number(
            botao.dataset.planoId
        );

    renderizarPagina();
}


function obterPlanoSelecionado() {
    return planos.find(
        plano =>
            plano.id ===
            planoSelecionadoId
    );
}


function renderizarPlanoSelecionado() {
    const estadoVazio =
        document.getElementById(
            "estado-sem-plano"
        );

    const conteudo =
        document.getElementById(
            "conteudo-plano"
        );

    const plano =
        obterPlanoSelecionado();

    if (!plano) {
        estadoVazio.classList.remove(
            "oculto"
        );

        conteudo.classList.add(
            "oculto"
        );

        return;
    }

    estadoVazio.classList.add(
        "oculto"
    );

    conteudo.classList.remove(
        "oculto"
    );

    document.getElementById(
        "titulo-plano"
    ).textContent =
        plano.titulo;

    document.getElementById(
        "objetivo-plano"
    ).textContent =
        plano.objetivo ||
        "Nenhum objetivo informado.";

    document.getElementById(
        "status-plano"
    ).textContent =
        formatarStatusPlano(
            plano.status
        );

    document.getElementById(
        "percentual-plano"
    ).textContent =
        `${plano.percentualConclusao}%`;

    document.getElementById(
        "inicio-plano"
    ).textContent =
        formatarData(
            plano.dataInicio
        );

    document.getElementById(
        "fim-plano"
    ).textContent =
        formatarData(
            plano.dataFimPrevista
        );

    document.getElementById(
        "preenchimento-progresso"
    ).style.width =
        `${
            plano.percentualConclusao
        }%`;

    renderizarEtapas();
}


function renderizarEtapas() {
    const conteiner =
        document.getElementById(
            "lista-etapas"
        );

    const etapasDoPlano =
        etapas
            .filter(
                etapa =>
                    etapa.planoEstudoId ===
                    planoSelecionadoId
            )
            .sort(
                (a, b) =>
                    a.ordem - b.ordem
            );

    if (!etapasDoPlano.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma etapa cadastrada neste plano.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        etapasDoPlano
            .map(etapa => `
                <article class="item-etapa">

                    <div class="ordem-etapa">
                        ${etapa.ordem}
                    </div>

                    <div class="dados-etapa">
                        <strong>
                            ${escaparHtml(
                                etapa.titulo
                            )}
                        </strong>

                        <p>
                            ${
                                etapa.descricao
                                    ? escaparHtml(
                                        etapa.descricao
                                    )
                                    : "Sem descrição."
                            }
                        </p>

                        <div class="metadados-etapa">
                            <span>
                                ${formatarStatusEtapa(
                                    etapa.status
                                )}
                            </span>

                            <span>
                                ${
                                    etapa.cargaHorariaEstimada
                                        ? `${etapa.cargaHorariaEstimada}h`
                                        : "Carga não informada"
                                }
                            </span>

                            <span>
                                Início:
                                ${formatarData(
                                    etapa.dataInicioPrevista
                                )}
                            </span>
                        </div>
                    </div>

                    <div class="acoes-etapa">

                        <button
                            type="button"
                            class="botao-pequeno"
                            data-editar-etapa="${etapa.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-pequeno perigo"
                            data-excluir-etapa="${etapa.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `)
            .join("");
}


function abrirNovoPlano() {
    planoEmEdicaoId = null;

    document.getElementById(
        "titulo-modal-plano"
    ).textContent =
        "Novo plano";

    document.getElementById(
        "formulario-plano"
    ).reset();

    document.getElementById(
        "plano-percentual"
    ).value = "0";

    document.getElementById(
        "plano-status"
    ).value =
        "nao_iniciado";

    document.getElementById(
        "modal-plano"
    ).showModal();
}


function editarPlanoSelecionado() {
    const plano =
        obterPlanoSelecionado();

    if (!plano) {
        return;
    }

    planoEmEdicaoId =
        plano.id;

    document.getElementById(
        "titulo-modal-plano"
    ).textContent =
        "Editar plano";

    document.getElementById(
        "plano-titulo"
    ).value =
        plano.titulo;

    document.getElementById(
        "plano-objetivo"
    ).value =
        plano.objetivo || "";

    document.getElementById(
        "plano-data-inicio"
    ).value =
        plano.dataInicio || "";

    document.getElementById(
        "plano-data-fim"
    ).value =
        plano.dataFimPrevista || "";

    document.getElementById(
        "plano-percentual"
    ).value =
        plano.percentualConclusao;

    document.getElementById(
        "plano-status"
    ).value =
        plano.status;

    document.getElementById(
        "modal-plano"
    ).showModal();
}


async function salvarPlano(evento) {
    evento.preventDefault();

    const dados = {
        titulo:
            document.getElementById(
                "plano-titulo"
            ).value.trim(),

        objetivo:
            document.getElementById(
                "plano-objetivo"
            ).value.trim(),

        percentualConclusao:
            Number(
                document.getElementById(
                    "plano-percentual"
                ).value
            ),

        status:
            document.getElementById(
                "plano-status"
            ).value,
    };

    const dataInicio =
        document.getElementById(
            "plano-data-inicio"
        ).value;

    const dataFim =
        document.getElementById(
            "plano-data-fim"
        ).value;

    if (dataInicio) {
        dados.dataInicio =
            dataInicio;
    }

    if (dataFim) {
        dados.dataFimPrevista =
            dataFim;
    }

    try {
        if (planoEmEdicaoId) {
            await apiRequest(
                `/planos-estudo/${
                    planoEmEdicaoId
                }`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagem(
                "Plano atualizado com sucesso.",
                "sucesso"
            );

        } else {
            dados.usuarioId =
                usuarioAtualEstudos.id;

            const planoCriado =
                await apiRequest(
                    "/planos-estudo",
                    {
                        method: "POST",
                        body: JSON.stringify(
                            dados
                        ),
                    }
                );

            planoSelecionadoId =
                planoCriado.id;

            mostrarMensagem(
                "Plano criado com sucesso.",
                "sucesso"
            );
        }

        document.getElementById(
            "modal-plano"
        ).close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function excluirPlanoSelecionado() {
    const plano =
        obterPlanoSelecionado();

    if (!plano) {
        return;
    }

    const confirmou =
        window.confirm(
            `Excluir o plano "${plano.titulo}"?`
        );

    if (!confirmou) {
        return;
    }

    try {
        await apiRequest(
            `/planos-estudo/${plano.id}`,
            {
                method: "DELETE",
            }
        );

        planoSelecionadoId = null;

        mostrarMensagem(
            "Plano excluído com sucesso.",
            "sucesso"
        );

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function abrirNovaEtapa() {
    if (!planoSelecionadoId) {
        return;
    }

    etapaEmEdicaoId = null;

    document.getElementById(
        "titulo-modal-etapa"
    ).textContent =
        "Nova etapa";

    document.getElementById(
        "formulario-etapa"
    ).reset();

    const etapasDoPlano =
        etapas.filter(
            etapa =>
                etapa.planoEstudoId ===
                planoSelecionadoId
        );

    document.getElementById(
        "etapa-ordem"
    ).value =
        etapasDoPlano.length + 1;

    document.getElementById(
        "etapa-status"
    ).value =
        "pendente";

    document.getElementById(
        "modal-etapa"
    ).showModal();
}


function tratarAcaoEtapa(evento) {
    const botaoEditar =
        evento.target.closest(
            "[data-editar-etapa]"
        );

    if (botaoEditar) {
        abrirEdicaoEtapa(
            Number(
                botaoEditar.dataset
                    .editarEtapa
            )
        );

        return;
    }

    const botaoExcluir =
        evento.target.closest(
            "[data-excluir-etapa]"
        );

    if (botaoExcluir) {
        excluirEtapa(
            Number(
                botaoExcluir.dataset
                    .excluirEtapa
            )
        );
    }
}


function abrirEdicaoEtapa(etapaId) {
    const etapa =
        etapas.find(
            item =>
                item.id === etapaId
        );

    if (!etapa) {
        return;
    }

    etapaEmEdicaoId =
        etapa.id;

    document.getElementById(
        "titulo-modal-etapa"
    ).textContent =
        "Editar etapa";

    document.getElementById(
        "etapa-titulo"
    ).value =
        etapa.titulo;

    document.getElementById(
        "etapa-descricao"
    ).value =
        etapa.descricao || "";

    document.getElementById(
        "etapa-ordem"
    ).value =
        etapa.ordem;

    document.getElementById(
        "etapa-carga-horaria"
    ).value =
        etapa.cargaHorariaEstimada || "";

    document.getElementById(
        "etapa-data-inicio"
    ).value =
        etapa.dataInicioPrevista || "";

    document.getElementById(
        "etapa-data-conclusao"
    ).value =
        etapa.dataConclusao || "";

    document.getElementById(
        "etapa-status"
    ).value =
        etapa.status;

    document.getElementById(
        "modal-etapa"
    ).showModal();
}


async function salvarEtapa(evento) {
    evento.preventDefault();

    const dados = {
        titulo:
            document.getElementById(
                "etapa-titulo"
            ).value.trim(),

        descricao:
            document.getElementById(
                "etapa-descricao"
            ).value.trim(),

        ordem:
            Number(
                document.getElementById(
                    "etapa-ordem"
                ).value
            ),

        status:
            document.getElementById(
                "etapa-status"
            ).value,
    };

    const carga =
        document.getElementById(
            "etapa-carga-horaria"
        ).value;

    const dataInicio =
        document.getElementById(
            "etapa-data-inicio"
        ).value;

    const dataConclusao =
        document.getElementById(
            "etapa-data-conclusao"
        ).value;

    if (carga) {
        dados.cargaHorariaEstimada =
            Number(carga);
    }

    if (dataInicio) {
        dados.dataInicioPrevista =
            dataInicio;
    }

    if (dataConclusao) {
        dados.dataConclusao =
            dataConclusao;
    }

    try {
        if (etapaEmEdicaoId) {
            await apiRequest(
                `/etapas-estudo/${
                    etapaEmEdicaoId
                }`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagem(
                "Etapa atualizada com sucesso.",
                "sucesso"
            );

        } else {
            dados.planoEstudoId =
                planoSelecionadoId;

            await apiRequest(
                "/etapas-estudo",
                {
                    method: "POST",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagem(
                "Etapa criada com sucesso.",
                "sucesso"
            );
        }

        document.getElementById(
            "modal-etapa"
        ).close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function excluirEtapa(
    etapaId
) {
    const etapa =
        etapas.find(
            item =>
                item.id === etapaId
        );

    if (!etapa) {
        return;
    }

    const confirmou =
        window.confirm(
            `Excluir a etapa "${etapa.titulo}"?`
        );

    if (!confirmou) {
        return;
    }

    try {
        await apiRequest(
            `/etapas-estudo/${etapa.id}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagem(
            "Etapa excluída com sucesso.",
            "sucesso"
        );

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function formatarStatusPlano(status) {
    const valores = {
        nao_iniciado:
            "Não iniciado",

        em_andamento:
            "Em andamento",

        pausado:
            "Pausado",

        concluido:
            "Concluído",
    };

    return valores[status] || status;
}


function formatarStatusEtapa(status) {
    const valores = {
        pendente:
            "Pendente",

        em_andamento:
            "Em andamento",

        concluida:
            "Concluída",
    };

    return valores[status] || status;
}


function formatarData(data) {
    if (!data) {
        return "Não informada";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );
}


function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function mostrarMensagem(
    texto,
    tipo = ""
) {
    const elemento =
        document.getElementById(
            "mensagem"
        );

    clearTimeout(
        temporizadorMensagem
    );

    elemento.textContent =
        texto;

    elemento.className =
        `mensagem ${tipo}`;

    temporizadorMensagem =
        setTimeout(
            () => {
                elemento.classList.add(
                    "oculto"
                );
            },
            3500
        );
}