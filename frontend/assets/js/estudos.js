let usuarioEstudos = null;

let vagasEstudos = [];
let requisitosEstudos = [];
let habilidadesEstudos = [];

let perfilEstudos = null;
let habilidadesPerfilEstudos = [];

let planosEstudos = [];
let etapasEstudos = [];

let recomendacoesEstudos = [];

let planoSelecionadoId = null;

let temporizadorMensagem = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarEstudos
);


async function iniciarEstudos() {
    registrarEventos();

    await carregarEstudos();
}


function registrarEventos() {
    document.getElementById(
        "lista-recomendacoes"
    ).addEventListener(
        "click",
        evento => {

            const botao =
                evento.target.closest(
                    "[data-criar-trilha]"
                );

            if (!botao) {
                return;
            }

            criarTrilhaRecomendada(
                Number(
                    botao.dataset.criarTrilha
                ),
                botao
            );
        }
    );


    document.getElementById(
        "lista-planos"
    ).addEventListener(
        "click",
        evento => {

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

            renderizarPlanos();
            renderizarDetalhePlano();
        }
    );


    document.getElementById(
        "detalhe-plano"
    ).addEventListener(
        "click",
        tratarAcaoDetalhe
    );
}


async function carregarEstudos() {
    try {
        const [
            sessao,
            vagas,
            requisitos,
            habilidades,
            perfis,
            perfisHabilidades,
            planos,
            etapas,
        ] = await Promise.all([
            apiRequest(
                "/autenticacao/sessao"
            ),
            apiRequest(
                "/vagas"
            ),
            apiRequest(
                "/requisitos-vaga"
            ),
            apiRequest(
                "/habilidades"
            ),
            apiRequest(
                "/perfis-profissionais"
            ),
            apiRequest(
                "/perfil-habilidades"
            ),
            apiRequest(
                "/planos-estudo"
            ),
            apiRequest(
                "/etapas-estudo"
            ),
        ]);


        if (
            !sessao.autenticado ||
            !sessao.usuario
        ) {
            window.location.href =
                "./login.html";

            return;
        }


        usuarioEstudos =
            sessao.usuario;

        vagasEstudos =
            vagas;

        requisitosEstudos =
            requisitos;

        habilidadesEstudos =
            habilidades;


        perfilEstudos =
            perfis.find(
                perfil =>
                    perfil.usuarioId ===
                    usuarioEstudos.id
            ) || null;


        habilidadesPerfilEstudos =
            perfilEstudos
                ? perfisHabilidades.filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfilEstudos.id
                )
                : [];


        planosEstudos =
            planos.filter(
                plano =>
                    plano.usuarioId ===
                    usuarioEstudos.id
            );


        const idsPlanos =
            new Set(
                planosEstudos.map(
                    plano =>
                        plano.id
                )
            );


        etapasEstudos =
            etapas.filter(
                etapa =>
                    idsPlanos.has(
                        etapa.planoEstudoId
                    )
            );


        calcularRecomendacoes();


        if (
            planoSelecionadoId &&
            !planosEstudos.some(
                plano =>
                    plano.id ===
                    planoSelecionadoId
            )
        ) {
            planoSelecionadoId =
                null;
        }


        if (
            !planoSelecionadoId &&
            planosEstudos.length
        ) {
            planoSelecionadoId =
                planosEstudos[0].id;
        }


        renderizarTudo();

    } catch (erro) {
        console.error(
            "Erro ao carregar estudos:",
            erro
        );

        mostrarMensagem(
            "Não foi possível carregar os estudos.",
            "erro"
        );
    }
}


function renderizarTudo() {
    atualizarMetricas();
    renderizarRecomendacoes();
    renderizarPlanos();
    renderizarDetalhePlano();
}


function obterVagasAtivas() {
    return vagasEstudos.filter(
        vaga =>
            vaga.status === "ativa"
    );
}


function obterHabilidade(id) {
    return habilidadesEstudos.find(
        habilidade =>
            habilidade.id === id
    ) || null;
}


function calcularRecomendacoes() {
    const idsHabilidadesUsuario =
        new Set(
            habilidadesPerfilEstudos.map(
                item =>
                    item.habilidadeId
            )
        );


    const idsVagasAtivas =
        new Set(
            obterVagasAtivas().map(
                vaga =>
                    vaga.id
            )
        );


    const demanda =
        new Map();


    requisitosEstudos
        .filter(
            requisito =>
                idsVagasAtivas.has(
                    requisito.vagaId
                )
        )
        .forEach(requisito => {

            if (
                idsHabilidadesUsuario.has(
                    requisito.habilidadeId
                )
            ) {
                return;
            }


            const atual =
                demanda.get(
                    requisito.habilidadeId
                ) || 0;


            demanda.set(
                requisito.habilidadeId,
                atual + 1
            );
        });


    recomendacoesEstudos =
        [...demanda.entries()]
            .map(
                ([habilidadeId, quantidade]) => {

                    const habilidade =
                        obterHabilidade(
                            habilidadeId
                        );

                    return {
                        habilidadeId,
                        quantidade,
                        habilidade,
                    };
                }
            )
            .filter(
                item =>
                    item.habilidade
            )
            .sort(
                (a, b) =>
                    b.quantidade -
                    a.quantidade
            )
            .slice(0, 6);
}


function atualizarMetricas() {
    document.getElementById(
        "total-habilidades-perfil"
    ).textContent =
        habilidadesPerfilEstudos.length;


    document.getElementById(
        "total-recomendacoes"
    ).textContent =
        recomendacoesEstudos.length;


    document.getElementById(
        "total-planos-ativos"
    ).textContent =
        planosEstudos.filter(
            plano =>
                plano.status ===
                "em_andamento"
        ).length;
}


function renderizarRecomendacoes() {
    const conteiner =
        document.getElementById(
            "lista-recomendacoes"
        );


    if (!perfilEstudos) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Complete seu perfil profissional para
                receber recomendações personalizadas.
            </div>
        `;

        return;
    }


    if (!recomendacoesEstudos.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                No momento não encontramos novas habilidades
                para recomendar com base nas vagas cadastradas.
            </div>
        `;

        return;
    }


    conteiner.innerHTML =
        recomendacoesEstudos
            .map(item => {

                const habilidade =
                    item.habilidade;


                return `
                    <article class="cartao-recomendacao">

                        <div class="topo-recomendacao">

                            <span class="icone-recomendacao">
                                +
                            </span>

                            <span class="demanda-recomendacao">
                                ${item.quantidade}
                                vaga(s)
                            </span>

                        </div>


                        <h3>
                            ${escaparHtml(
                                habilidade.nome
                            )}
                        </h3>

                        <span class="categoria-recomendacao">
                            ${formatarCategoria(
                                habilidade.categoria
                            )}
                        </span>


                        <p>
                            Esta habilidade aparece entre
                            as exigências atuais do mercado
                            e ainda não está registrada no
                            seu perfil.
                        </p>


                        <div class="acoes-recomendacao">

                            <button
                                class="botao-criar-trilha"
                                data-criar-trilha="${habilidade.id}"
                                type="button"
                            >
                                Criar trilha de estudo
                            </button>

                        </div>

                    </article>
                `;
            })
            .join("");
}


async function criarTrilhaRecomendada(
    habilidadeId,
    botao
) {
    const habilidade =
        obterHabilidade(
            habilidadeId
        );


    if (!habilidade) {
        return;
    }


    const planoExistente =
        planosEstudos.find(
            plano =>
                normalizarTexto(
                    plano.titulo
                ) ===
                normalizarTexto(
                    `Trilha: ${habilidade.nome}`
                )
        );


    if (planoExistente) {
        planoSelecionadoId =
            planoExistente.id;

        renderizarPlanos();
        renderizarDetalhePlano();

        mostrarMensagem(
            "Você já possui uma trilha para esta habilidade.",
            "sucesso"
        );

        return;
    }


    const textoOriginal =
        botao.textContent;


    botao.disabled = true;
    botao.textContent =
        "Criando trilha...";


    try {
        const hoje =
            new Date()
                .toISOString()
                .slice(0, 10);


        const plano =
            await apiRequest(
                "/planos-estudo",
                {
                    method: "POST",

                    body: JSON.stringify({
                        usuarioId:
                            usuarioEstudos.id,

                        titulo:
                            `Trilha: ${habilidade.nome}`,

                        objetivo:
                            `Desenvolver conhecimentos em ${habilidade.nome} com base nas demandas encontradas nas vagas do Market Skills.`,

                        dataInicio:
                            hoje,

                        percentualConclusao:
                            0,

                        status:
                            "em_andamento",
                    }),
                }
            );


        const etapas =
            criarEtapasPadrao(
                habilidade.nome,
                plano.id
            );


        for (
            const etapa of etapas
        ) {
            await apiRequest(
                "/etapas-estudo",
                {
                    method: "POST",
                    body: JSON.stringify(
                        etapa
                    ),
                }
            );
        }


        planoSelecionadoId =
            plano.id;


        mostrarMensagem(
            `Trilha de ${habilidade.nome} criada.`,
            "sucesso"
        );


        await carregarEstudos();

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            erro.message ||
            "Não foi possível criar a trilha.",
            "erro"
        );

    } finally {
        botao.disabled = false;
        botao.textContent =
            textoOriginal;
    }
}


function criarEtapasPadrao(
    habilidadeNome,
    planoId
) {
    return [
        {
            planoEstudoId:
                planoId,

            titulo:
                `Fundamentos de ${habilidadeNome}`,

            descricao:
                `Entenda os principais conceitos e fundamentos de ${habilidadeNome}.`,

            ordem:
                1,

            cargaHorariaEstimada:
                4,

            status:
                "pendente",
        },

        {
            planoEstudoId:
                planoId,

            titulo:
                `Prática com ${habilidadeNome}`,

            descricao:
                `Pratique ${habilidadeNome} com exercícios e exemplos aplicados.`,

            ordem:
                2,

            cargaHorariaEstimada:
                6,

            status:
                "pendente",
        },

        {
            planoEstudoId:
                planoId,

            titulo:
                `Projeto com ${habilidadeNome}`,

            descricao:
                `Desenvolva um pequeno projeto para consolidar seus conhecimentos em ${habilidadeNome}.`,

            ordem:
                3,

            cargaHorariaEstimada:
                8,

            status:
                "pendente",
        },
    ];
}


function renderizarPlanos() {
    const conteiner =
        document.getElementById(
            "lista-planos"
        );


    if (!planosEstudos.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Você ainda não iniciou nenhuma trilha.
            </div>
        `;

        return;
    }


    conteiner.innerHTML =
        [...planosEstudos]
            .sort(
                (a, b) =>
                    b.id - a.id
            )
            .map(plano => {

                const selecionado =
                    plano.id ===
                    planoSelecionadoId;


                const percentual =
                    Math.round(
                        Number(
                            plano.percentualConclusao ||
                            0
                        )
                    );


                return `
                    <button
                        class="
                            item-plano
                            ${
                                selecionado
                                    ? "ativo"
                                    : ""
                            }
                        "
                        data-plano-id="${plano.id}"
                        type="button"
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
                            ${percentual}%
                        </span>

                        <div class="progresso-mini">
                            <span
                                style="width: ${percentual}%"
                            ></span>
                        </div>

                    </button>
                `;
            })
            .join("");
}


function obterPlanoSelecionado() {
    return planosEstudos.find(
        plano =>
            plano.id ===
            planoSelecionadoId
    ) || null;
}


function renderizarDetalhePlano() {
    const conteiner =
        document.getElementById(
            "detalhe-plano"
        );


    const plano =
        obterPlanoSelecionado();


    if (!plano) {
        conteiner.innerHTML = `
            <div class="detalhe-vazio">

                <div class="icone-detalhe">
                    ✓
                </div>

                <h2>
                    Nenhum plano selecionado
                </h2>

                <p>
                    Escolha uma recomendação para gerar
                    uma trilha de estudos personalizada.
                </p>

            </div>
        `;

        return;
    }


    const etapas =
        etapasEstudos
            .filter(
                etapa =>
                    etapa.planoEstudoId ===
                    plano.id
            )
            .sort(
                (a, b) =>
                    a.ordem -
                    b.ordem
            );


    const percentual =
        Math.round(
            Number(
                plano.percentualConclusao ||
                0
            )
        );


    const etapasHtml =
        etapas.length
            ? etapas
                .map(
                    etapa =>
                        criarHtmlEtapa(
                            etapa
                        )
                )
                .join("")
            : `
                <div class="estado-vazio">
                    Nenhuma etapa cadastrada neste plano.
                </div>
            `;


    conteiner.innerHTML = `

        <div class="topo-plano">

            <div>

                <span class="rotulo-estudos">
                    Plano selecionado
                </span>

                <h2>
                    ${escaparHtml(
                        plano.titulo
                    )}
                </h2>

                <p>
                    ${escaparHtml(
                        plano.objetivo ||
                        "Plano de desenvolvimento profissional."
                    )}
                </p>

            </div>


            <button
                class="botao-excluir-plano"
                data-excluir-plano="${plano.id}"
                type="button"
            >
                Excluir plano
            </button>

        </div>


        <div class="bloco-progresso">

            <div class="topo-progresso">

                <span>
                    Seu progresso
                </span>

                <strong>
                    ${percentual}%
                </strong>

            </div>

            <div class="barra-progresso">
                <span
                    style="width: ${percentual}%"
                ></span>
            </div>

        </div>


        <h3 class="titulo-etapas">
            Etapas da trilha
        </h3>


        <div class="lista-etapas">
            ${etapasHtml}
        </div>
    `;
}


function criarHtmlEtapa(etapa) {
    const concluida =
        etapa.status ===
        "concluida";


    return `
        <article class="
            etapa-estudo
            ${
                concluida
                    ? "concluida"
                    : ""
            }
        ">

            <div class="identidade-etapa">

                <span class="numero-etapa">
                    ${
                        concluida
                            ? "✓"
                            : etapa.ordem
                    }
                </span>

                <div>

                    <strong>
                        ${escaparHtml(
                            etapa.titulo
                        )}
                    </strong>

                    <small>
                        ${
                            etapa.cargaHorariaEstimada
                                ? `${etapa.cargaHorariaEstimada}h estimadas`
                                : "Carga horária não informada"
                        }
                        ·
                        ${formatarStatusEtapa(
                            etapa.status
                        )}
                    </small>

                </div>

            </div>


            <button
                class="botao-etapa"
                data-alterar-etapa="${etapa.id}"
                type="button"
            >
                ${
                    concluida
                        ? "Reabrir"
                        : "Concluir"
                }
            </button>

        </article>
    `;
}


async function tratarAcaoDetalhe(evento) {
    const botaoEtapa =
        evento.target.closest(
            "[data-alterar-etapa]"
        );


    if (botaoEtapa) {
        await alterarStatusEtapa(
            Number(
                botaoEtapa.dataset
                    .alterarEtapa
            )
        );

        return;
    }


    const botaoExcluir =
        evento.target.closest(
            "[data-excluir-plano]"
        );


    if (botaoExcluir) {
        await excluirPlano(
            Number(
                botaoExcluir.dataset
                    .excluirPlano
            )
        );
    }
}


async function alterarStatusEtapa(
    etapaId
) {
    const etapa =
        etapasEstudos.find(
            item =>
                item.id ===
                etapaId
        );


    if (!etapa) {
        return;
    }


    const novoStatus =
        etapa.status ===
        "concluida"
            ? "pendente"
            : "concluida";


    try {
        await apiRequest(
            `/etapas-estudo/${etapa.id}`,
            {
                method: "PUT",

                body: JSON.stringify({
                    status:
                        novoStatus,
                }),
            }
        );


        await atualizarProgressoPlano(
            etapa.planoEstudoId,
            etapa.id,
            novoStatus
        );


        await carregarEstudos();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function atualizarProgressoPlano(
    planoId,
    etapaAlteradaId,
    novoStatus
) {
    const etapasPlano =
        etapasEstudos.filter(
            etapa =>
                etapa.planoEstudoId ===
                planoId
        );


    if (!etapasPlano.length) {
        return;
    }


    const quantidadeConcluidas =
        etapasPlano.filter(
            etapa => {

                if (
                    etapa.id ===
                    etapaAlteradaId
                ) {
                    return (
                        novoStatus ===
                        "concluida"
                    );
                }

                return (
                    etapa.status ===
                    "concluida"
                );
            }
        ).length;


    const percentual =
        Math.round(
            (
                quantidadeConcluidas /
                etapasPlano.length
            ) * 100
        );


    let status =
        "em_andamento";


    if (percentual === 100) {
        status =
            "concluido";
    }


    await apiRequest(
        `/planos-estudo/${planoId}`,
        {
            method: "PUT",

            body: JSON.stringify({
                percentualConclusao:
                    percentual,

                status,
            }),
        }
    );
}


async function excluirPlano(
    planoId
) {
    const plano =
        planosEstudos.find(
            item =>
                item.id ===
                planoId
        );


    if (!plano) {
        return;
    }


    const confirmou =
        window.confirm(
            `Excluir "${plano.titulo}"?`
        );


    if (!confirmou) {
        return;
    }


    try {
        await apiRequest(
            `/planos-estudo/${planoId}`,
            {
                method: "DELETE",
            }
        );


        planoSelecionadoId =
            null;


        mostrarMensagem(
            "Plano excluído.",
            "sucesso"
        );


        await carregarEstudos();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function formatarCategoria(valor) {
    const categorias = {
        linguagem:
            "Linguagem",

        framework:
            "Framework",

        banco_dados:
            "Banco de dados",

        ferramenta:
            "Ferramenta",

        conceito:
            "Conceito",

        outra:
            "Outra",
    };


    return categorias[valor] ||
        "Tecnologia";
}


function formatarStatusPlano(valor) {
    const status = {
        nao_iniciado:
            "Não iniciado",

        em_andamento:
            "Em andamento",

        pausado:
            "Pausado",

        concluido:
            "Concluído",
    };


    return status[valor] ||
        "Não informado";
}


function formatarStatusEtapa(valor) {
    const status = {
        pendente:
            "Pendente",

        em_andamento:
            "Em andamento",

        concluida:
            "Concluída",
    };


    return status[valor] ||
        "Não informado";
}


function normalizarTexto(valor) {
    return String(
        valor ?? ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


function escaparHtml(valor) {
    return String(
        valor ?? ""
    )
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
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function mostrarMensagem(
    texto,
    tipo
) {
    const mensagem =
        document.getElementById(
            "mensagem"
        );


    mensagem.textContent =
        texto;


    mensagem.className =
        `mensagem ${tipo}`;


    clearTimeout(
        temporizadorMensagem
    );


    temporizadorMensagem =
        setTimeout(
            () => {
                mensagem.classList.add(
                    "oculto"
                );
            },
            3500
        );
}