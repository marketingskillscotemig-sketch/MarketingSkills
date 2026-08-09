let empresas = [];
let vagas = [];
let habilidades = [];
let requisitos = [];

let empresaFiltroId = null;
let vagaSelecionadaId = null;

let empresaEmEdicaoId = null;
let vagaEmEdicaoId = null;
let requisitoEmEdicaoId = null;

let temporizadorMensagem = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaVagas
);


async function iniciarPaginaVagas() {
    registrarEventos();

    await carregarDados();
}


function registrarEventos() {
    document
        .getElementById("botao-nova-empresa")
        .addEventListener(
            "click",
            () => abrirModalEmpresa()
        );

    document
        .getElementById("botao-nova-vaga")
        .addEventListener(
            "click",
            abrirModalNovaVaga
        );

    document
        .getElementById("botao-nova-vaga-topo")
        .addEventListener(
            "click",
            abrirModalNovaVaga
        );

    document
        .getElementById("botao-todas-empresas")
        .addEventListener(
            "click",
            () => {
                empresaFiltroId = null;

                renderizarEmpresas();
                renderizarVagas();
            }
        );

    document
        .getElementById("filtro-busca")
        .addEventListener(
            "input",
            renderizarVagas
        );

    document
        .getElementById("filtro-status")
        .addEventListener(
            "change",
            renderizarVagas
        );

    document
        .getElementById("filtro-modalidade")
        .addEventListener(
            "change",
            renderizarVagas
        );

    document
        .getElementById("lista-empresas")
        .addEventListener(
            "click",
            tratarAcaoEmpresa
        );

    document
        .getElementById("lista-vagas")
        .addEventListener(
            "click",
            tratarAcaoVaga
        );

    document
        .getElementById("detalhe-vaga")
        .addEventListener(
            "click",
            tratarAcaoDetalhe
        );

    document
        .getElementById("formulario-empresa")
        .addEventListener(
            "submit",
            salvarEmpresa
        );

    document
        .getElementById("formulario-vaga")
        .addEventListener(
            "submit",
            salvarVaga
        );

    document
        .getElementById("formulario-requisito")
        .addEventListener(
            "submit",
            salvarRequisito
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
            dadosEmpresas,
            dadosVagas,
            dadosHabilidades,
            dadosRequisitos,
        ] = await Promise.all([
            apiRequest("/empresas"),
            apiRequest("/vagas"),
            apiRequest("/habilidades"),
            apiRequest("/requisitos-vaga"),
        ]);

        empresas = dadosEmpresas;
        vagas = dadosVagas;
        habilidades = dadosHabilidades;
        requisitos = dadosRequisitos;

        definirVagaSelecionada();

        renderizarTudo();

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            erro.message ||
            "Não foi possível carregar os dados.",
            "erro"
        );
    }
}


function renderizarTudo() {
    renderizarMetricas();
    renderizarEmpresas();
    renderizarVagas();
    preencherEmpresasDoFormulario();
}


function definirVagaSelecionada() {
    const idSalvo =
        Number(
            localStorage.getItem(
                "vagaSelecionadaId"
            )
        );

    if (
        idSalvo &&
        vagas.some(
            vaga => vaga.id === idSalvo
        )
    ) {
        vagaSelecionadaId = idSalvo;

        return;
    }

    vagaSelecionadaId =
        vagas.length
            ? vagas[0].id
            : null;

    salvarVagaSelecionada();
}


function salvarVagaSelecionada() {
    if (vagaSelecionadaId) {
        localStorage.setItem(
            "vagaSelecionadaId",
            String(vagaSelecionadaId)
        );
    } else {
        localStorage.removeItem(
            "vagaSelecionadaId"
        );
    }
}


function renderizarMetricas() {
    const vagasAtivas =
        vagas.filter(
            vaga =>
                vaga.status === "ativa"
        );

    document.getElementById(
        "metrica-empresas"
    ).textContent =
        empresas.length;

    document.getElementById(
        "metrica-vagas-ativas"
    ).textContent =
        vagasAtivas.length;

    document.getElementById(
        "metrica-requisitos"
    ).textContent =
        requisitos.length;
}


function renderizarEmpresas() {
    const conteiner =
        document.getElementById(
            "lista-empresas"
        );

    document
        .getElementById(
            "botao-todas-empresas"
        )
        .classList.toggle(
            "ativo",
            empresaFiltroId === null
        );

    if (!empresas.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma empresa cadastrada.
            </div>
        `;

        return;
    }

    const ordenadas =
        [...empresas].sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );

    conteiner.innerHTML =
        ordenadas
            .map(empresa => `
                <article
                    class="
                        item-empresa
                        ${
                            empresa.id ===
                            empresaFiltroId
                                ? "selecionada"
                                : ""
                        }
                    "
                >

                    <button
                        type="button"
                        class="selecionar-empresa"
                        data-filtrar-empresa="${empresa.id}"
                    >
                        <strong>
                            ${escaparHtml(empresa.nome)}
                        </strong>

                        <span>
                            ${
                                empresa.setor
                                    ? escaparHtml(
                                        empresa.setor
                                    )
                                    : "Setor não informado"
                            }
                        </span>
                    </button>

                    <div class="acoes-empresa">

                        <button
                            type="button"
                            class="botao-pequeno"
                            data-editar-empresa="${empresa.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-pequeno perigo"
                            data-excluir-empresa="${empresa.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `)
            .join("");
}


function renderizarVagas() {
    const conteiner =
        document.getElementById(
            "lista-vagas"
        );

    const filtradas =
        obterVagasFiltradas();

    if (
        vagaSelecionadaId &&
        !filtradas.some(
            vaga =>
                vaga.id ===
                vagaSelecionadaId
        )
    ) {
        vagaSelecionadaId =
            filtradas.length
                ? filtradas[0].id
                : null;

        salvarVagaSelecionada();
    }

    if (!filtradas.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga corresponde aos filtros.
            </div>
        `;

        renderizarDetalheVaga();

        return;
    }

    conteiner.innerHTML =
        filtradas
            .map(vaga => {
                const empresa =
                    obterEmpresa(
                        vaga.empresaId
                    );

                return `
                    <article
                        class="
                            cartao-vaga
                            ${
                                vaga.id ===
                                vagaSelecionadaId
                                    ? "selecionada"
                                    : ""
                            }
                        "
                    >

                        <div class="topo-cartao-vaga">

                            <button
                                type="button"
                                class="conteudo-cartao-vaga"
                                data-selecionar-vaga="${vaga.id}"
                            >
                                <h3>
                                    ${escaparHtml(vaga.titulo)}
                                </h3>

                                <span class="empresa-cartao-vaga">
                                    ${
                                        empresa
                                            ? escaparHtml(
                                                empresa.nome
                                            )
                                            : "Empresa não encontrada"
                                    }
                                </span>
                            </button>

                            <span
                                class="
                                    etiqueta-vaga
                                    ${vaga.status}
                                "
                            >
                                ${formatarStatus(vaga.status)}
                            </span>

                        </div>


                        <div class="metadados-vaga">

                            <span>
                                ${formatarModalidade(
                                    vaga.modalidade
                                )}
                            </span>

                            <span>
                                ${formatarNivelExperiencia(
                                    vaga.nivelExperiencia
                                )}
                            </span>

                            <span>
                                ${
                                    vaga.localizacao
                                        ? escaparHtml(
                                            vaga.localizacao
                                        )
                                        : "Local não informado"
                                }
                            </span>

                        </div>


                        <div class="salario-cartao">
                            ${formatarFaixaSalarial(vaga)}
                        </div>


                        <div class="acoes-cartao-vaga">

                            <button
                                type="button"
                                class="botao-pequeno"
                                data-editar-vaga="${vaga.id}"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="botao-pequeno perigo"
                                data-excluir-vaga="${vaga.id}"
                            >
                                Excluir
                            </button>

                        </div>

                    </article>
                `;
            })
            .join("");

    renderizarDetalheVaga();
}


function obterVagasFiltradas() {
    const busca =
        document.getElementById(
            "filtro-busca"
        ).value
            .trim()
            .toLowerCase();

    const status =
        document.getElementById(
            "filtro-status"
        ).value;

    const modalidade =
        document.getElementById(
            "filtro-modalidade"
        ).value;

    return [...vagas]
        .filter(vaga => {
            const empresa =
                obterEmpresa(
                    vaga.empresaId
                );

            const texto =
                [
                    vaga.titulo,
                    vaga.localizacao,
                    empresa?.nome,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

            const correspondeBusca =
                !busca ||
                texto.includes(busca);

            const correspondeStatus =
                !status ||
                vaga.status === status;

            const correspondeModalidade =
                !modalidade ||
                vaga.modalidade === modalidade;

            const correspondeEmpresa =
                empresaFiltroId === null ||
                vaga.empresaId ===
                    empresaFiltroId;

            return (
                correspondeBusca &&
                correspondeStatus &&
                correspondeModalidade &&
                correspondeEmpresa
            );
        })
        .sort(
            (a, b) =>
                new Date(
                    b.dataPublicacao
                ) -
                new Date(
                    a.dataPublicacao
                )
        );
}


function renderizarDetalheVaga() {
    const conteiner =
        document.getElementById(
            "detalhe-vaga"
        );

    const vaga =
        vagas.find(
            item =>
                item.id ===
                vagaSelecionadaId
        );

    if (!vaga) {
        conteiner.innerHTML = `
            <div class="estado-detalhe-vazio">

                <div class="icone-detalhe-vazio">
                    &lt;/&gt;
                </div>

                <h2>
                    Nenhuma vaga selecionada
                </h2>

                <p>
                    Selecione ou cadastre uma oportunidade.
                </p>

            </div>
        `;

        return;
    }

    const empresa =
        obterEmpresa(
            vaga.empresaId
        );

    const requisitosDaVaga =
        requisitos.filter(
            requisito =>
                requisito.vagaId ===
                vaga.id
        );

    conteiner.innerHTML = `
        <div class="cabecalho-detalhe">

            <div class="identificacao-vaga">

                <span class="subtitulo-bloco">
                    Detalhes da oportunidade
                </span>

                <h2>
                    ${escaparHtml(vaga.titulo)}
                </h2>

                <span>
                    ${
                        empresa
                            ? escaparHtml(empresa.nome)
                            : "Empresa não encontrada"
                    }
                </span>

            </div>


            <div class="acoes-detalhe">

                <button
                    type="button"
                    class="botao botao-contorno"
                    data-editar-vaga-detalhe="${vaga.id}"
                >
                    Editar vaga
                </button>

                <button
                    type="button"
                    class="botao botao-perigo"
                    data-excluir-vaga-detalhe="${vaga.id}"
                >
                    Excluir
                </button>

            </div>

        </div>


        <div class="informacoes-detalhe">

            <div class="informacao-detalhe">
                <span>Modalidade</span>

                <strong>
                    ${formatarModalidade(
                        vaga.modalidade
                    )}
                </strong>
            </div>


            <div class="informacao-detalhe">
                <span>Experiência</span>

                <strong>
                    ${formatarNivelExperiencia(
                        vaga.nivelExperiencia
                    )}
                </strong>
            </div>


            <div class="informacao-detalhe">
                <span>Localização</span>

                <strong>
                    ${
                        vaga.localizacao
                            ? escaparHtml(
                                vaga.localizacao
                            )
                            : "Não informada"
                    }
                </strong>
            </div>


            <div class="informacao-detalhe">
                <span>Publicação</span>

                <strong>
                    ${formatarData(
                        vaga.dataPublicacao
                    )}
                </strong>
            </div>

        </div>


        <div class="descricao-vaga-detalhe">

            <h3>Faixa salarial</h3>

            <p>
                ${formatarFaixaSalarial(vaga)}
            </p>

        </div>


        <div class="descricao-vaga-detalhe">

            <h3>Descrição</h3>

            <p>
                ${
                    vaga.descricao
                        ? escaparHtml(
                            vaga.descricao
                        )
                        : "Nenhuma descrição cadastrada."
                }
            </p>

        </div>


        <section class="secao-requisitos">

            <div class="cabecalho-requisitos">

                <div>
                    <span class="subtitulo-bloco">
                        Competências exigidas
                    </span>

                    <h3>
                        Requisitos da vaga
                        (${requisitosDaVaga.length})
                    </h3>
                </div>

                <button
                    type="button"
                    class="botao botao-principal"
                    data-novo-requisito="${vaga.id}"
                >
                    Adicionar requisito
                </button>

            </div>


            <div class="lista-requisitos">

                ${
                    renderizarRequisitos(
                        requisitosDaVaga
                    )
                }

            </div>

        </section>
    `;
}


function renderizarRequisitos(
    requisitosDaVaga
) {
    if (!requisitosDaVaga.length) {
        return `
            <div class="estado-vazio">
                Nenhum requisito cadastrado para esta vaga.
            </div>
        `;
    }

    return requisitosDaVaga
        .map(requisito => {
            const habilidade =
                obterHabilidade(
                    requisito.habilidadeId
                );

            return `
                <article class="item-requisito">

                    <div class="dados-requisito">

                        <strong>
                            ${
                                habilidade
                                    ? escaparHtml(
                                        habilidade.nome
                                    )
                                    : "Habilidade não encontrada"
                            }
                        </strong>


                        <div class="metadados-requisito">

                            <span>
                                ${formatarNivelHabilidade(
                                    requisito.nivelExigido
                                )}
                            </span>

                            <span>
                                ${
                                    requisito.obrigatorio
                                        ? "Obrigatório"
                                        : "Desejável"
                                }
                            </span>

                            ${
                                requisito.peso !== null
                                    ? `
                                        <span>
                                            Peso:
                                            ${requisito.peso}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        ${
                            requisito.descricao
                                ? `
                                    <span class="descricao-requisito">
                                        ${escaparHtml(
                                            requisito.descricao
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <div class="acoes-requisito">

                        <button
                            type="button"
                            class="botao-pequeno"
                            data-editar-requisito="${requisito.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-pequeno perigo"
                            data-excluir-requisito="${requisito.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `;
        })
        .join("");
}


function tratarAcaoEmpresa(evento) {
    const selecionar =
        evento.target.closest(
            "[data-filtrar-empresa]"
        );

    const editar =
        evento.target.closest(
            "[data-editar-empresa]"
        );

    const excluir =
        evento.target.closest(
            "[data-excluir-empresa]"
        );

    if (selecionar) {
        empresaFiltroId =
            Number(
                selecionar.dataset
                    .filtrarEmpresa
            );

        renderizarEmpresas();
        renderizarVagas();

        return;
    }

    if (editar) {
        const empresa =
            obterEmpresa(
                Number(
                    editar.dataset
                        .editarEmpresa
                )
            );

        if (empresa) {
            abrirModalEmpresa(
                empresa
            );
        }

        return;
    }

    if (excluir) {
        excluirEmpresa(
            Number(
                excluir.dataset
                    .excluirEmpresa
            )
        );
    }
}


function tratarAcaoVaga(evento) {
    const selecionar =
        evento.target.closest(
            "[data-selecionar-vaga]"
        );

    const editar =
        evento.target.closest(
            "[data-editar-vaga]"
        );

    const excluir =
        evento.target.closest(
            "[data-excluir-vaga]"
        );

    if (selecionar) {
        vagaSelecionadaId =
            Number(
                selecionar.dataset
                    .selecionarVaga
            );

        salvarVagaSelecionada();

        renderizarVagas();

        return;
    }

    if (editar) {
        const vaga =
            obterVaga(
                Number(
                    editar.dataset
                        .editarVaga
                )
            );

        if (vaga) {
            abrirModalVaga(vaga);
        }

        return;
    }

    if (excluir) {
        excluirVaga(
            Number(
                excluir.dataset
                    .excluirVaga
            )
        );
    }
}


function tratarAcaoDetalhe(evento) {
    const editar =
        evento.target.closest(
            "[data-editar-vaga-detalhe]"
        );

    const excluir =
        evento.target.closest(
            "[data-excluir-vaga-detalhe]"
        );

    const novoRequisito =
        evento.target.closest(
            "[data-novo-requisito]"
        );

    const editarRequisito =
        evento.target.closest(
            "[data-editar-requisito]"
        );

    const excluirRequisito =
        evento.target.closest(
            "[data-excluir-requisito]"
        );

    if (editar) {
        const vaga =
            obterVaga(
                Number(
                    editar.dataset
                        .editarVagaDetalhe
                )
            );

        if (vaga) {
            abrirModalVaga(vaga);
        }

        return;
    }

    if (excluir) {
        excluirVaga(
            Number(
                excluir.dataset
                    .excluirVagaDetalhe
            )
        );

        return;
    }

    if (novoRequisito) {
        abrirModalRequisito();

        return;
    }

    if (editarRequisito) {
        const requisito =
            requisitos.find(
                item =>
                    item.id ===
                    Number(
                        editarRequisito.dataset
                            .editarRequisito
                    )
            );

        if (requisito) {
            abrirModalRequisito(
                requisito
            );
        }

        return;
    }

    if (excluirRequisito) {
        excluirRequisitoDaVaga(
            Number(
                excluirRequisito.dataset
                    .excluirRequisito
            )
        );
    }
}


function abrirModalEmpresa(
    empresa = null
) {
    empresaEmEdicaoId =
        empresa?.id || null;

    document.getElementById(
        "titulo-modal-empresa"
    ).textContent =
        empresa
            ? "Editar empresa"
            : "Nova empresa";

    document.getElementById(
        "empresa-nome"
    ).value =
        empresa?.nome || "";

    document.getElementById(
        "empresa-setor"
    ).value =
        empresa?.setor || "";

    document.getElementById(
        "empresa-site"
    ).value =
        empresa?.site || "";

    document.getElementById(
        "empresa-descricao"
    ).value =
        empresa?.descricao || "";

    document
        .getElementById(
            "modal-empresa"
        )
        .showModal();
}


async function salvarEmpresa(evento) {
    evento.preventDefault();

    const dados = {
        nome:
            document.getElementById(
                "empresa-nome"
            ).value.trim(),

        setor:
            document.getElementById(
                "empresa-setor"
            ).value.trim(),

        site:
            document.getElementById(
                "empresa-site"
            ).value.trim(),

        descricao:
            document.getElementById(
                "empresa-descricao"
            ).value.trim(),
    };

    try {
        if (empresaEmEdicaoId) {
            await apiRequest(
                `/empresas/${empresaEmEdicaoId}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            dados
                        ),
                }
            );

            mostrarMensagem(
                "Empresa atualizada com sucesso.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/empresas",
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            dados
                        ),
                }
            );

            mostrarMensagem(
                "Empresa cadastrada com sucesso.",
                "sucesso"
            );
        }

        document
            .getElementById(
                "modal-empresa"
            )
            .close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function excluirEmpresa(
    empresaId
) {
    const empresa =
        obterEmpresa(empresaId);

    if (!empresa) {
        return;
    }

    const possuiVagas =
        vagas.some(
            vaga =>
                vaga.empresaId ===
                empresaId
        );

    if (possuiVagas) {
        mostrarMensagem(
            "Esta empresa possui vagas cadastradas. " +
            "Exclua ou mova as vagas antes de excluir a empresa.",
            "erro"
        );

        return;
    }

    const confirmar =
        window.confirm(
            `Excluir a empresa "${empresa.nome}"?`
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/empresas/${empresaId}`,
            {
                method: "DELETE",
            }
        );

        if (
            empresaFiltroId ===
            empresaId
        ) {
            empresaFiltroId = null;
        }

        mostrarMensagem(
            "Empresa excluída com sucesso.",
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


function abrirModalNovaVaga() {
    if (!empresas.length) {
        mostrarMensagem(
            "Cadastre uma empresa antes de criar uma vaga.",
            "erro"
        );

        return;
    }

    abrirModalVaga();
}


function abrirModalVaga(
    vaga = null
) {
    vagaEmEdicaoId =
        vaga?.id || null;

    preencherEmpresasDoFormulario();

    document.getElementById(
        "titulo-modal-vaga"
    ).textContent =
        vaga
            ? "Editar vaga"
            : "Nova vaga";

    document.getElementById(
        "vaga-empresa"
    ).value =
        vaga?.empresaId ||
        empresaFiltroId ||
        empresas[0]?.id ||
        "";

    document.getElementById(
        "vaga-titulo"
    ).value =
        vaga?.titulo || "";

    document.getElementById(
        "vaga-nivel"
    ).value =
        vaga?.nivelExperiencia ||
        "junior";

    document.getElementById(
        "vaga-modalidade"
    ).value =
        vaga?.modalidade ||
        "remoto";

    document.getElementById(
        "vaga-localizacao"
    ).value =
        vaga?.localizacao || "";

    document.getElementById(
        "vaga-status"
    ).value =
        vaga?.status ||
        "ativa";

    document.getElementById(
        "vaga-salario-minimo"
    ).value =
        vaga?.salarioMinimo ?? "";

    document.getElementById(
        "vaga-salario-maximo"
    ).value =
        vaga?.salarioMaximo ?? "";

    document.getElementById(
        "vaga-data-publicacao"
    ).value =
        vaga?.dataPublicacao ||
        obterDataAtual();

    document.getElementById(
        "vaga-descricao"
    ).value =
        vaga?.descricao || "";

    document
        .getElementById("modal-vaga")
        .showModal();
}


function preencherEmpresasDoFormulario() {
    const seletor =
        document.getElementById(
            "vaga-empresa"
        );

    if (!empresas.length) {
        seletor.innerHTML = `
            <option value="">
                Nenhuma empresa cadastrada
            </option>
        `;

        return;
    }

    seletor.innerHTML =
        empresas
            .map(
                empresa => `
                    <option value="${empresa.id}">
                        ${escaparHtml(empresa.nome)}
                    </option>
                `
            )
            .join("");
}


async function salvarVaga(evento) {
    evento.preventDefault();

    const dados = {
        empresaId:
            Number(
                document.getElementById(
                    "vaga-empresa"
                ).value
            ),

        titulo:
            document.getElementById(
                "vaga-titulo"
            ).value.trim(),

        descricao:
            document.getElementById(
                "vaga-descricao"
            ).value.trim(),

        nivelExperiencia:
            document.getElementById(
                "vaga-nivel"
            ).value,

        modalidade:
            document.getElementById(
                "vaga-modalidade"
            ).value,

        localizacao:
            document.getElementById(
                "vaga-localizacao"
            ).value.trim(),

        dataPublicacao:
            document.getElementById(
                "vaga-data-publicacao"
            ).value,

        status:
            document.getElementById(
                "vaga-status"
            ).value,
    };

    const salarioMinimo =
        document.getElementById(
            "vaga-salario-minimo"
        ).value;

    const salarioMaximo =
        document.getElementById(
            "vaga-salario-maximo"
        ).value;

    if (salarioMinimo !== "") {
        dados.salarioMinimo =
            Number(salarioMinimo);
    }

    if (salarioMaximo !== "") {
        dados.salarioMaximo =
            Number(salarioMaximo);
    }

    try {
        let resposta;

        if (vagaEmEdicaoId) {
            resposta =
                await apiRequest(
                    `/vagas/${vagaEmEdicaoId}`,
                    {
                        method: "PUT",
                        body:
                            JSON.stringify(
                                dados
                            ),
                    }
                );

            mostrarMensagem(
                "Vaga atualizada com sucesso.",
                "sucesso"
            );

        } else {
            resposta =
                await apiRequest(
                    "/vagas",
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                dados
                            ),
                    }
                );

            vagaSelecionadaId =
                resposta.id;

            salvarVagaSelecionada();

            mostrarMensagem(
                "Vaga cadastrada com sucesso.",
                "sucesso"
            );
        }

        document
            .getElementById(
                "modal-vaga"
            )
            .close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function excluirVaga(
    vagaId
) {
    const vaga =
        obterVaga(vagaId);

    if (!vaga) {
        return;
    }

    const confirmar =
        window.confirm(
            `Excluir a vaga "${vaga.titulo}"? ` +
            "Os requisitos associados também serão removidos."
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/vagas/${vagaId}`,
            {
                method: "DELETE",
            }
        );

        if (
            vagaSelecionadaId ===
            vagaId
        ) {
            vagaSelecionadaId = null;

            salvarVagaSelecionada();
        }

        mostrarMensagem(
            "Vaga excluída com sucesso.",
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


function abrirModalRequisito(
    requisito = null
) {
    if (!vagaSelecionadaId) {
        return;
    }

    if (!habilidades.length) {
        mostrarMensagem(
            "Nenhuma habilidade está cadastrada. " +
            "Cadastre habilidades na página de Perfil primeiro.",
            "erro"
        );

        return;
    }

    requisitoEmEdicaoId =
        requisito?.id || null;

    document.getElementById(
        "titulo-modal-requisito"
    ).textContent =
        requisito
            ? "Editar requisito"
            : "Novo requisito";

    preencherHabilidadesDoRequisito(
        requisito
    );

    document.getElementById(
        "requisito-nivel"
    ).value =
        requisito?.nivelExigido ||
        "basico";

    document.getElementById(
        "requisito-peso"
    ).value =
        requisito?.peso ?? "";

    document.getElementById(
        "requisito-obrigatorio"
    ).checked =
        requisito
            ? requisito.obrigatorio
            : true;

    document.getElementById(
        "requisito-descricao"
    ).value =
        requisito?.descricao || "";

    document
        .getElementById(
            "modal-requisito"
        )
        .showModal();
}


function preencherHabilidadesDoRequisito(
    requisito
) {
    const seletor =
        document.getElementById(
            "requisito-habilidade"
        );

    seletor.innerHTML =
        habilidades
            .sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            )
            .map(
                habilidade => `
                    <option
                        value="${habilidade.id}"
                    >
                        ${escaparHtml(habilidade.nome)}
                    </option>
                `
            )
            .join("");

    if (requisito) {
        seletor.value =
            requisito.habilidadeId;
    }
}


async function salvarRequisito(
    evento
) {
    evento.preventDefault();

    if (!vagaSelecionadaId) {
        return;
    }

    const dados = {
        habilidadeId:
            Number(
                document.getElementById(
                    "requisito-habilidade"
                ).value
            ),

        nivelExigido:
            document.getElementById(
                "requisito-nivel"
            ).value,

        obrigatorio:
            document.getElementById(
                "requisito-obrigatorio"
            ).checked,

        descricao:
            document.getElementById(
                "requisito-descricao"
            ).value.trim(),
    };

    const peso =
        document.getElementById(
            "requisito-peso"
        ).value;

    if (peso !== "") {
        dados.peso =
            Number(peso);
    }

    try {
        if (requisitoEmEdicaoId) {
            await apiRequest(
                `/requisitos-vaga/${requisitoEmEdicaoId}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            dados
                        ),
                }
            );

            mostrarMensagem(
                "Requisito atualizado com sucesso.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/requisitos-vaga",
                {
                    method: "POST",
                    body:
                        JSON.stringify({
                            vagaId:
                                vagaSelecionadaId,
                            ...dados,
                        }),
                }
            );

            mostrarMensagem(
                "Requisito adicionado à vaga.",
                "sucesso"
            );
        }

        document
            .getElementById(
                "modal-requisito"
            )
            .close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function excluirRequisitoDaVaga(
    requisitoId
) {
    const requisito =
        requisitos.find(
            item =>
                item.id ===
                requisitoId
        );

    if (!requisito) {
        return;
    }

    const habilidade =
        obterHabilidade(
            requisito.habilidadeId
        );

    const confirmar =
        window.confirm(
            `Excluir o requisito "${
                habilidade?.nome ||
                "selecionado"
            }"?`
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/requisitos-vaga/${requisitoId}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagem(
            "Requisito excluído com sucesso.",
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


function obterEmpresa(
    empresaId
) {
    return empresas.find(
        empresa =>
            empresa.id ===
            empresaId
    ) || null;
}


function obterVaga(
    vagaId
) {
    return vagas.find(
        vaga =>
            vaga.id ===
            vagaId
    ) || null;
}


function obterHabilidade(
    habilidadeId
) {
    return habilidades.find(
        habilidade =>
            habilidade.id ===
            habilidadeId
    ) || null;
}


function formatarNivelExperiencia(
    nivel
) {
    const nomes = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return nomes[nivel] ||
        "Não informado";
}


function formatarModalidade(
    modalidade
) {
    const nomes = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return nomes[modalidade] ||
        "Não informada";
}


function formatarStatus(
    status
) {
    const nomes = {
        ativa: "Ativa",
        pausada: "Pausada",
        encerrada: "Encerrada",
    };

    return nomes[status] ||
        status;
}


function formatarNivelHabilidade(
    nivel
) {
    const nomes = {
        basico: "Básico",
        intermediario: "Intermediário",
        avancado: "Avançado",
    };

    return nomes[nivel] ||
        "Não informado";
}


function formatarMoeda(
    valor
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
        }
    ).format(Number(valor));
}


function formatarFaixaSalarial(
    vaga
) {
    const minimo =
        vaga.salarioMinimo;

    const maximo =
        vaga.salarioMaximo;

    if (
        minimo !== null &&
        maximo !== null
    ) {
        return (
            `${formatarMoeda(minimo)} - ` +
            `${formatarMoeda(maximo)}`
        );
    }

    if (minimo !== null) {
        return (
            `A partir de ` +
            formatarMoeda(minimo)
        );
    }

    if (maximo !== null) {
        return (
            `Até ` +
            formatarMoeda(maximo)
        );
    }

    return "Salário não informado";
}


function formatarData(
    data
) {
    if (!data) {
        return "Não informada";
    }

    return new Intl.DateTimeFormat(
        "pt-BR"
    ).format(
        new Date(
            `${data}T12:00:00`
        )
    );
}


function obterDataAtual() {
    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${ano}-${mes}-${dia}`;
}


function escaparHtml(
    valor
) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarMensagem(
    texto,
    tipo
) {
    const elemento =
        document.getElementById(
            "mensagem-sistema"
        );

    clearTimeout(
        temporizadorMensagem
    );

    elemento.textContent =
        texto;

    elemento.className =
        `mensagem-sistema visivel ${tipo}`;

    temporizadorMensagem =
        setTimeout(
            () => {
                elemento.className =
                    "mensagem-sistema";
            },
            3500
        );
}