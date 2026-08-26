let usuarioVagas = null;
let empresaVagas = null;

let vagas = [];
let empresas = [];
let requisitos = [];
let habilidades = [];

let perfilProfissional = null;
let habilidadesPerfil = [];

let vagaSelecionadaId = null;
let vagaEmEdicaoId = null;

let requisitosFormulario = [];


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaVagas
);


async function iniciarPaginaVagas() {
    try {
        const [
            sessao,
            dadosVagas,
            dadosEmpresas,
            dadosRequisitos,
            dadosHabilidades,
            perfis,
            perfisHabilidades,
        ] = await Promise.all([
            apiRequest(
                "/autenticacao/sessao"
            ),
            apiRequest(
                "/vagas"
            ),
            apiRequest(
                "/empresas"
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
        ]);

        if (
            !sessao.autenticado ||
            !sessao.usuario
        ) {
            window.location.href =
                "./login.html";

            return;
        }

        usuarioVagas =
            sessao.usuario;

        vagas =
            dadosVagas || [];

        empresas =
            dadosEmpresas || [];

        requisitos =
            dadosRequisitos || [];

        habilidades =
            dadosHabilidades || [];

        if (
            usuarioVagas.tipoConta ===
            "empresa"
        ) {
            iniciarExperienciaEmpresa();
            return;
        }

        iniciarExperienciaEstudante(
            perfis,
            perfisHabilidades
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar vagas:",
            erro
        );

        document.getElementById(
            "lista-vagas"
        ).innerHTML = `
            <div class="estado-vazio">
                Não foi possível carregar as vagas.
            </div>
        `;
    }
}


/* ============================= */
/* EMPRESA                       */
/* ============================= */


function iniciarExperienciaEmpresa() {
    empresaVagas =
        empresas.find(
            empresa =>
                empresa.usuarioId ===
                usuarioVagas.id
        ) || null;

    configurarNavegacaoEmpresa();
    configurarTelaEmpresa();
    registrarEventosEmpresa();

    if (!empresaVagas) {
        document.getElementById(
            "lista-vagas"
        ).innerHTML = `
            <div class="estado-vazio">
                Não foi possível localizar o perfil
                empresarial desta conta.
            </div>
        `;

        return;
    }

    atualizarResumoEmpresa();
    renderizarVagasEmpresa();
}


function configurarNavegacaoEmpresa() {
    document.getElementById(
        "navegacao-vagas"
    ).innerHTML = `
        <a href="../index.html">
            Dashboard
        </a>

        <a href="../index.html#talentos-empresa">
            Talentos
        </a>

        <a
            href="./vagas.html"
            class="ativo"
        >
            Minhas Vagas
        </a>

        <a href="./perfil.html">
            Perfil
        </a>
    `;
}


function configurarTelaEmpresa() {
    document.title =
        "Minhas Vagas | Market Skills";

    document.getElementById(
        "rotulo-hero-vagas"
    ).textContent =
        "Gestão de oportunidades";

    document.getElementById(
        "titulo-hero-vagas"
    ).textContent =
        "Gerencie as oportunidades da sua empresa.";

    document.getElementById(
        "descricao-hero-vagas"
    ).textContent =
        "Crie vagas, organize requisitos e acompanhe o status de cada oportunidade publicada no Market Skills.";

    document.getElementById(
        "acao-hero-empresa"
    ).classList.remove(
        "oculto"
    );

    document.getElementById(
        "rotulo-total-vagas"
    ).textContent =
        "Vagas ativas";

    document.getElementById(
        "rotulo-total-empresas"
    ).textContent =
        "Vagas pausadas";

    document.getElementById(
        "rotulo-total-habilidades"
    ).textContent =
        "Vagas encerradas";

    document.getElementById(
        "painel-filtros"
    ).classList.add(
        "oculto"
    );

    document.getElementById(
        "rotulo-listagem"
    ).textContent =
        "Publicações";

    document.getElementById(
        "titulo-listagem"
    ).textContent =
        "Minhas vagas";

    document.getElementById(
        "detalhe-vaga"
    ).innerHTML = `
        <div class="detalhe-vazio">

            <div class="icone-detalhe">
                &lt;/&gt;
            </div>

            <h2>
                Selecione uma vaga
            </h2>

            <p>
                Clique em uma oportunidade para
                visualizar informações, requisitos
                e ações de gerenciamento.
            </p>

        </div>
    `;
}


function registrarEventosEmpresa() {
    document.getElementById(
        "botao-criar-vaga"
    ).addEventListener(
        "click",
        () => abrirModalVaga()
    );

    document.getElementById(
        "botao-fechar-modal-vaga"
    ).addEventListener(
        "click",
        fecharModalVaga
    );

    document.getElementById(
        "botao-cancelar-vaga"
    ).addEventListener(
        "click",
        fecharModalVaga
    );

    document.getElementById(
        "botao-adicionar-requisito"
    ).addEventListener(
        "click",
        adicionarRequisitoFormulario
    );

    document.getElementById(
        "vaga-salario-definir"
    ).addEventListener(
        "change",
        atualizarEstadoSalario
    );

    document.getElementById(
        "lista-requisitos-formulario"
    ).addEventListener(
        "click",
        tratarAcaoRequisitoFormulario
    );

    document.getElementById(
        "lista-requisitos-formulario"
    ).addEventListener(
        "change",
        atualizarRequisitoFormulario
    );

    document.getElementById(
        "formulario-vaga"
    ).addEventListener(
        "submit",
        salvarVagaEmpresa
    );

    document.getElementById(
        "lista-vagas"
    ).addEventListener(
        "click",
        tratarAcaoListaEmpresa
    );

    document.getElementById(
        "detalhe-vaga"
    ).addEventListener(
        "click",
        tratarAcaoDetalheEmpresa
    );
}


function obterVagasDaEmpresa() {
    if (!empresaVagas) {
        return [];
    }

    return vagas.filter(
        vaga =>
            vaga.empresaId ===
            empresaVagas.id
    );
}


function atualizarResumoEmpresa() {
    const minhasVagas =
        obterVagasDaEmpresa();

    document.getElementById(
        "total-vagas"
    ).textContent =
        minhasVagas.filter(
            vaga =>
                vaga.status === "ativa"
        ).length;

    document.getElementById(
        "total-empresas"
    ).textContent =
        minhasVagas.filter(
            vaga =>
                vaga.status === "pausada"
        ).length;

    document.getElementById(
        "total-habilidades"
    ).textContent =
        minhasVagas.filter(
            vaga =>
                vaga.status === "encerrada"
        ).length;
}


function renderizarVagasEmpresa() {
    const conteiner =
        document.getElementById(
            "lista-vagas"
        );

    const minhasVagas =
        obterVagasDaEmpresa()
            .sort(
                (a, b) =>
                    new Date(
                        b.dataPublicacao || 0
                    ) -
                    new Date(
                        a.dataPublicacao || 0
                    )
            );

    document.getElementById(
        "quantidade-resultados"
    ).textContent =
        `${minhasVagas.length} vaga(s)`;

    if (!minhasVagas.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Sua empresa ainda não publicou
                nenhuma vaga.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        minhasVagas
            .map(vaga => {

                const selecionada =
                    vaga.id ===
                    vagaSelecionadaId;

                return `
                    <button
                        class="cartao-vaga ${
                            selecionada
                                ? "ativo"
                                : ""
                        }"
                        data-vaga-id="${vaga.id}"
                        type="button"
                    >

                        <div class="topo-cartao-vaga">

                            <div>

                                <h3>
                                    ${escaparHtml(
                                        vaga.titulo
                                    )}
                                </h3>

                                <span class="nome-empresa-vaga">
                                    ${escaparHtml(
                                        empresaVagas.nome
                                    )}
                                </span>

                            </div>

                            <span class="tag-vaga">
                                ${formatarStatusVaga(
                                    vaga.status
                                )}
                            </span>

                        </div>

                        <div class="informacoes-cartao-vaga">

                            <span>
                                ${formatarExperiencia(
                                    vaga.nivelExperiencia
                                )}
                            </span>

                            <span>
                                ${formatarModalidade(
                                    vaga.modalidade
                                )}
                            </span>

                            <span>
                                ${escaparHtml(
                                    vaga.localizacao ||
                                    "Localização não informada"
                                )}
                            </span>

                        </div>

                        <div class="rodape-cartao-vaga">

                            <span class="salario-cartao">
                                ${formatarFaixaSalarial(
                                    vaga
                                )}
                            </span>

                            <span class="data-cartao">
                                ${formatarData(
                                    vaga.dataPublicacao
                                )}
                            </span>

                        </div>

                    </button>
                `;
            })
            .join("");
}


function tratarAcaoListaEmpresa(evento) {
    const cartao =
        evento.target.closest(
            "[data-vaga-id]"
        );

    if (!cartao) {
        return;
    }

    selecionarVagaEmpresa(
        Number(
            cartao.dataset.vagaId
        )
    );
}


function selecionarVagaEmpresa(id) {
    vagaSelecionadaId =
        id;

    const vaga =
        vagas.find(
            item =>
                item.id === id &&
                item.empresaId ===
                empresaVagas.id
        );

    if (!vaga) {
        return;
    }

    renderizarVagasEmpresa();

    renderizarDetalheEmpresa(
        vaga
    );
}


function renderizarDetalheEmpresa(vaga) {
    const conteiner =
        document.getElementById(
            "detalhe-vaga"
        );

    const requisitosVaga =
        obterRequisitosVaga(
            vaga.id
        );

    const obrigatorios =
        requisitosVaga.filter(
            requisito =>
                requisito.obrigatorio
        );

    const diferenciais =
        requisitosVaga.filter(
            requisito =>
                !requisito.obrigatorio
        );

    const beneficiosHtml =
        vaga.beneficios
            ? `
                <section class="secao-detalhe">

                    <h3>
                        Benefícios
                    </h3>

                    <div class="bloco-beneficios-vaga">

                        <p>
                            ${escaparHtml(
                                vaga.beneficios
                            )}
                        </p>

                    </div>

                </section>
            `
            : "";

    conteiner.innerHTML = `
        <div class="cabecalho-detalhe-vaga">

            <span class="empresa-detalhe">
                ${escaparHtml(
                    empresaVagas.nome
                )}
            </span>

            <h2>
                ${escaparHtml(
                    vaga.titulo
                )}
            </h2>

            <div class="metadados-detalhe">

                <span>
                    ${formatarStatusVaga(
                        vaga.status
                    )}
                </span>

                <span>
                    ${formatarExperiencia(
                        vaga.nivelExperiencia
                    )}
                </span>

                <span>
                    ${formatarModalidade(
                        vaga.modalidade
                    )}
                </span>

                <span>
                    ${escaparHtml(
                        vaga.localizacao ||
                        "Localização não informada"
                    )}
                </span>

                <span>
                    Publicada em
                    ${formatarData(
                        vaga.dataPublicacao
                    )}
                </span>

            </div>

            <div class="salario-detalhe">
                ${formatarFaixaSalarial(
                    vaga
                )}
            </div>

        </div>

        <section class="secao-detalhe">

            <h3>
                Sobre a oportunidade
            </h3>

            <p>
                ${escaparHtml(
                    vaga.descricao ||
                    "Nenhuma descrição cadastrada."
                )}
            </p>

        </section>

        ${beneficiosHtml}

        <section class="secao-detalhe">

            <h3>
                Requisitos obrigatórios
            </h3>

            <div class="lista-requisitos">

                ${criarHtmlRequisitosEmpresa(
                    obrigatorios
                )}

            </div>

        </section>

        <section class="secao-detalhe">

            <h3>
                Diferenciais
            </h3>

            <div class="lista-requisitos">

                ${criarHtmlRequisitosEmpresa(
                    diferenciais
                )}

            </div>

        </section>

        <section class="secao-detalhe">

            <h3>
                Candidaturas
            </h3>

            <p>
                A gestão de candidatos será habilitada
                na próxima etapa do projeto.
            </p>

        </section>

        <div class="acoes-detalhe">

            <button
                class="botao botao-principal"
                type="button"
                data-editar-vaga="${vaga.id}"
            >
                Editar
            </button>

            ${
                vaga.status === "ativa"
                    ? `
                        <button
                            class="botao botao-contorno"
                            type="button"
                            data-status-vaga="${vaga.id}"
                            data-novo-status="pausada"
                        >
                            Pausar
                        </button>
                    `
                    : ""
            }

            ${
                vaga.status === "pausada"
                    ? `
                        <button
                            class="botao botao-contorno"
                            type="button"
                            data-status-vaga="${vaga.id}"
                            data-novo-status="ativa"
                        >
                            Reativar
                        </button>
                    `
                    : ""
            }

            ${
                vaga.status !== "encerrada"
                    ? `
                        <button
                            class="botao botao-contorno"
                            type="button"
                            data-status-vaga="${vaga.id}"
                            data-novo-status="encerrada"
                        >
                            Encerrar
                        </button>
                    `
                    : ""
            }

            <button
                class="botao botao-escuro"
                type="button"
                data-excluir-vaga="${vaga.id}"
            >
                Excluir
            </button>

        </div>
    `;
}


function criarHtmlRequisitosEmpresa(
    lista
) {
    if (!lista.length) {
        return `
            <div class="estado-vazio">
                Nenhum item cadastrado.
            </div>
        `;
    }

    return lista
        .map(requisito => {

            const habilidade =
                obterHabilidade(
                    requisito.habilidadeId
                );

            return `
                <div class="requisito-vaga">

                    <div class="requisito-identidade">

                        <span class="estado-requisito">
                            ✓
                        </span>

                        <div>

                            <strong>
                                ${escaparHtml(
                                    habilidade?.nome ||
                                    "Habilidade"
                                )}
                            </strong>

                            <small>
                                Nível:
                                ${formatarNivelHabilidade(
                                    requisito.nivelExigido
                                )}
                            </small>

                        </div>

                    </div>

                </div>
            `;
        })
        .join("");
}


async function tratarAcaoDetalheEmpresa(
    evento
) {
    const editar =
        evento.target.closest(
            "[data-editar-vaga]"
        );

    const alterarStatus =
        evento.target.closest(
            "[data-status-vaga]"
        );

    const excluir =
        evento.target.closest(
            "[data-excluir-vaga]"
        );

    if (editar) {
        const id =
            Number(
                editar.dataset.editarVaga
            );

        const vaga =
            vagas.find(
                item =>
                    item.id === id &&
                    item.empresaId ===
                    empresaVagas.id
            );

        if (vaga) {
            abrirModalVaga(
                vaga
            );
        }

        return;
    }

    if (alterarStatus) {
        const id =
            Number(
                alterarStatus.dataset
                    .statusVaga
            );

        const novoStatus =
            alterarStatus.dataset
                .novoStatus;

        await alterarStatusVaga(
            id,
            novoStatus
        );

        return;
    }

    if (excluir) {
        const id =
            Number(
                excluir.dataset.excluirVaga
            );

        await excluirVagaEmpresa(
            id
        );
    }
}


async function alterarStatusVaga(
    id,
    novoStatus
) {
    try {
        await apiRequest(
            `/vagas/${id}`,
            {
                method: "PUT",

                body: JSON.stringify({
                    status:
                        novoStatus,
                }),
            }
        );

        await recarregarDadosEmpresa(
            id
        );

    } catch (erro) {
        window.alert(
            erro.message
        );
    }
}


async function excluirVagaEmpresa(id) {
    if (
        !window.confirm(
            "Deseja realmente excluir esta vaga? Esta ação não poderá ser desfeita."
        )
    ) {
        return;
    }

    try {
        await apiRequest(
            `/vagas/${id}`,
            {
                method: "DELETE",
            }
        );

        vagaSelecionadaId =
            null;

        document.getElementById(
            "detalhe-vaga"
        ).innerHTML = `
            <div class="detalhe-vazio">

                <div class="icone-detalhe">
                    &lt;/&gt;
                </div>

                <h2>
                    Vaga excluída
                </h2>

                <p>
                    Selecione outra oportunidade
                    para continuar.
                </p>

            </div>
        `;

        await recarregarDadosEmpresa();

    } catch (erro) {
        window.alert(
            erro.message
        );
    }
}


function abrirModalVaga(
    vaga = null
) {
    vagaEmEdicaoId =
        vaga?.id || null;

    document.getElementById(
        "formulario-vaga"
    ).reset();

    requisitosFormulario = [];

    document.getElementById(
        "titulo-modal-vaga"
    ).textContent =
        vaga
            ? "Editar vaga"
            : "Criar nova vaga";

    document.getElementById(
        "botao-salvar-vaga"
    ).textContent =
        vaga
            ? "Salvar alterações"
            : "Publicar vaga";

    limparMensagemFormularioVaga();

    if (vaga) {
        document.getElementById(
            "vaga-titulo"
        ).value =
            vaga.titulo || "";

        document.getElementById(
            "vaga-descricao"
        ).value =
            vaga.descricao || "";

        document.getElementById(
            "vaga-beneficios"
        ).value =
            vaga.beneficios || "";

        document.getElementById(
            "vaga-nivel"
        ).value =
            vaga.nivelExperiencia ||
            "";

        document.getElementById(
            "vaga-modalidade"
        ).value =
            vaga.modalidade ||
            "";

        document.getElementById(
            "vaga-localizacao"
        ).value =
            vaga.localizacao ||
            "";

        document.getElementById(
            "vaga-salario-minimo"
        ).value =
            vaga.salarioMinimo ??
            "";

        document.getElementById(
            "vaga-salario-maximo"
        ).value =
            vaga.salarioMaximo ??
            "";

        const salarioADefinir =
            vaga.salarioMinimo === null &&
            vaga.salarioMaximo === null;

        document.getElementById(
            "vaga-salario-definir"
        ).checked =
            salarioADefinir;

        requisitosFormulario =
            obterRequisitosVaga(
                vaga.id
            ).map(
                requisito => ({
                    habilidadeId:
                        requisito
                            .habilidadeId,

                    nivelExigido:
                        requisito
                            .nivelExigido,

                    obrigatorio:
                        requisito
                            .obrigatorio,
                })
            );

    } else {
        document.getElementById(
            "vaga-salario-definir"
        ).checked =
            false;
    }

    atualizarEstadoSalario();
    renderizarRequisitosFormulario();

    document.getElementById(
        "modal-vaga"
    ).showModal();
}


function fecharModalVaga() {
    const modal =
        document.getElementById(
            "modal-vaga"
        );

    if (modal.open) {
        modal.close();
    }
}


function atualizarEstadoSalario() {
    const salarioADefinir =
        document.getElementById(
            "vaga-salario-definir"
        ).checked;

    const salarioMinimo =
        document.getElementById(
            "vaga-salario-minimo"
        );

    const salarioMaximo =
        document.getElementById(
            "vaga-salario-maximo"
        );

    salarioMinimo.disabled =
        salarioADefinir;

    salarioMaximo.disabled =
        salarioADefinir;

    if (salarioADefinir) {
        salarioMinimo.value =
            "";

        salarioMaximo.value =
            "";
    }
}


function adicionarRequisitoFormulario() {
    requisitosFormulario.push({
        habilidadeId: "",
        nivelExigido:
            "basico",
        obrigatorio:
            true,
    });

    renderizarRequisitosFormulario();
}


function renderizarRequisitosFormulario() {
    const conteiner =
        document.getElementById(
            "lista-requisitos-formulario"
        );

    if (!requisitosFormulario.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio estado-vazio-formulario">
                Nenhum requisito adicionado.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        requisitosFormulario
            .map(
                (
                    requisito,
                    indice
                ) => `
                    <div
                        class="requisito-vaga"
                        data-requisito-indice="${indice}"
                    >

                        <label>

                            <span>
                                Habilidade
                            </span>

                            <select
                                data-campo-requisito="habilidadeId"
                                required
                            >

                                <option value="">
                                    Selecione
                                </option>

                                ${habilidades
                                    .map(
                                        habilidade => `
                                            <option
                                                value="${habilidade.id}"
                                                ${
                                                    Number(
                                                        requisito.habilidadeId
                                                    ) ===
                                                    habilidade.id
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${escaparHtml(
                                                    habilidade.nome
                                                )}
                                            </option>
                                        `
                                    )
                                    .join("")}

                            </select>

                        </label>

                        <label>

                            <span>
                                Nível exigido
                            </span>

                            <select
                                data-campo-requisito="nivelExigido"
                            >

                                <option
                                    value="basico"
                                    ${
                                        requisito.nivelExigido ===
                                        "basico"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Básico
                                </option>

                                <option
                                    value="intermediario"
                                    ${
                                        requisito.nivelExigido ===
                                        "intermediario"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Intermediário
                                </option>

                                <option
                                    value="avancado"
                                    ${
                                        requisito.nivelExigido ===
                                        "avancado"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Avançado
                                </option>

                            </select>

                        </label>

                        <label>

                            <span>
                                Categoria
                            </span>

                            <select
                                data-campo-requisito="obrigatorio"
                            >

                                <option
                                    value="true"
                                    ${
                                        requisito.obrigatorio
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Obrigatório
                                </option>

                                <option
                                    value="false"
                                    ${
                                        !requisito.obrigatorio
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Diferencial
                                </option>

                            </select>

                        </label>

                        <button
                            type="button"
                            data-remover-requisito="${indice}"
                        >
                            Remover
                        </button>

                    </div>
                `
            )
            .join("");
}


function atualizarRequisitoFormulario(
    evento
) {
    const elemento =
        evento.target.closest(
            "[data-campo-requisito]"
        );

    if (!elemento) {
        return;
    }

    const linha =
        elemento.closest(
            "[data-requisito-indice]"
        );

    if (!linha) {
        return;
    }

    const indice =
        Number(
            linha.dataset
                .requisitoIndice
        );

    const campo =
        elemento.dataset
            .campoRequisito;

    let valor =
        elemento.value;

    if (
        campo ===
        "habilidadeId"
    ) {
        valor =
            valor
                ? Number(valor)
                : "";
    }

    if (
        campo ===
        "obrigatorio"
    ) {
        valor =
            valor === "true";
    }

    requisitosFormulario[
        indice
    ][campo] = valor;
}


function tratarAcaoRequisitoFormulario(
    evento
) {
    const botao =
        evento.target.closest(
            "[data-remover-requisito]"
        );

    if (!botao) {
        return;
    }

    const indice =
        Number(
            botao.dataset
                .removerRequisito
        );

    requisitosFormulario.splice(
        indice,
        1
    );

    renderizarRequisitosFormulario();
}


async function salvarVagaEmpresa(
    evento
) {
    evento.preventDefault();

    limparMensagemFormularioVaga();

    if (!empresaVagas) {
        mostrarMensagemFormularioVaga(
            "Perfil empresarial não encontrado."
        );

        return;
    }

    const habilidadesSelecionadas =
        requisitosFormulario
            .filter(
                requisito =>
                    requisito.habilidadeId
            )
            .map(
                requisito =>
                    Number(
                        requisito.habilidadeId
                    )
            );

    if (
        new Set(
            habilidadesSelecionadas
        ).size !==
        habilidadesSelecionadas.length
    ) {
        mostrarMensagemFormularioVaga(
            "A mesma habilidade não pode ser adicionada duas vezes."
        );

        return;
    }

    if (
        requisitosFormulario.some(
            requisito =>
                !requisito.habilidadeId
        )
    ) {
        mostrarMensagemFormularioVaga(
            "Selecione a habilidade de todos os requisitos."
        );

        return;
    }

    const salarioADefinir =
        document.getElementById(
            "vaga-salario-definir"
        ).checked;

    const salarioMinimo =
        salarioADefinir
            ? null
            : obterNumeroCampo(
                "vaga-salario-minimo"
            );

    const salarioMaximo =
        salarioADefinir
            ? null
            : obterNumeroCampo(
                "vaga-salario-maximo"
            );

    if (
        salarioMinimo !== null &&
        salarioMaximo !== null &&
        salarioMaximo <
        salarioMinimo
    ) {
        mostrarMensagemFormularioVaga(
            "O salário máximo não pode ser menor que o salário mínimo."
        );

        return;
    }

    const dados = {
        empresaId:
            empresaVagas.id,

        titulo:
            obterTextoCampo(
                "vaga-titulo"
            ),

        descricao:
            obterTextoCampo(
                "vaga-descricao"
            ),

        beneficios:
            obterTextoCampo(
                "vaga-beneficios"
            ),

        nivelExperiencia:
            document.getElementById(
                "vaga-nivel"
            ).value,

        modalidade:
            document.getElementById(
                "vaga-modalidade"
            ).value,

        localizacao:
            obterTextoCampo(
                "vaga-localizacao"
            ),

        salarioMinimo,

        salarioMaximo,
    };

    const botao =
        document.getElementById(
            "botao-salvar-vaga"
        );

    try {
        botao.disabled =
            true;

        botao.textContent =
            vagaEmEdicaoId
                ? "Salvando..."
                : "Publicando...";

        let vagaSalva = null;

        if (vagaEmEdicaoId) {
            vagaSalva =
                await apiRequest(
                    `/vagas/${vagaEmEdicaoId}`,
                    {
                        method: "PUT",

                        body: JSON.stringify(
                            dados
                        ),
                    }
                );

            await substituirRequisitosVaga(
                vagaSalva.id
            );

        } else {
            vagaSalva =
                await apiRequest(
                    "/vagas",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            ...dados,
                            status:
                                "ativa",
                        }),
                    }
                );

            await criarRequisitosFormulario(
                vagaSalva.id
            );
        }

        fecharModalVaga();

        await recarregarDadosEmpresa(
            vagaSalva.id
        );

    } catch (erro) {
        mostrarMensagemFormularioVaga(
            erro.message
        );

    } finally {
        botao.disabled =
            false;

        botao.textContent =
            vagaEmEdicaoId
                ? "Salvar alterações"
                : "Publicar vaga";
    }
}


async function substituirRequisitosVaga(
    vagaId
) {
    const antigos =
        obterRequisitosVaga(
            vagaId
        );

    for (
        const requisito
        of antigos
    ) {
        await apiRequest(
            `/requisitos-vaga/${requisito.id}`,
            {
                method: "DELETE",
            }
        );
    }

    await criarRequisitosFormulario(
        vagaId
    );
}


async function criarRequisitosFormulario(
    vagaId
) {
    for (
        const requisito
        of requisitosFormulario
    ) {
        await apiRequest(
            "/requisitos-vaga",
            {
                method: "POST",

                body: JSON.stringify({
                    vagaId,

                    habilidadeId:
                        Number(
                            requisito.habilidadeId
                        ),

                    nivelExigido:
                        requisito.nivelExigido,

                    obrigatorio:
                        requisito.obrigatorio,
                }),
            }
        );
    }
}


async function recarregarDadosEmpresa(
    selecionarId = null
) {
    const [
        dadosVagas,
        dadosRequisitos,
        dadosEmpresas,
    ] = await Promise.all([
        apiRequest(
            "/vagas"
        ),
        apiRequest(
            "/requisitos-vaga"
        ),
        apiRequest(
            "/empresas"
        ),
    ]);

    vagas =
        dadosVagas || [];

    requisitos =
        dadosRequisitos || [];

    empresas =
        dadosEmpresas || [];

    empresaVagas =
        empresas.find(
            empresa =>
                empresa.usuarioId ===
                usuarioVagas.id
        ) || null;

    atualizarResumoEmpresa();

    if (selecionarId) {
        vagaSelecionadaId =
            selecionarId;

        renderizarVagasEmpresa();

        const vaga =
            vagas.find(
                item =>
                    item.id ===
                    selecionarId &&
                    item.empresaId ===
                    empresaVagas.id
            );

        if (vaga) {
            renderizarDetalheEmpresa(
                vaga
            );
        }

        return;
    }

    renderizarVagasEmpresa();
}


function mostrarMensagemFormularioVaga(
    mensagem
) {
    const elemento =
        document.getElementById(
            "mensagem-formulario-vaga"
        );

    elemento.textContent =
        mensagem;

    elemento.className =
        "mensagem-formulario erro";
}


function limparMensagemFormularioVaga() {
    const elemento =
        document.getElementById(
            "mensagem-formulario-vaga"
        );

    elemento.textContent =
        "";

    elemento.className =
        "mensagem-formulario";
}


/* ============================= */
/* ESTUDANTE                     */
/* ============================= */


function iniciarExperienciaEstudante(
    perfis,
    perfisHabilidades
) {
    perfilProfissional =
        perfis.find(
            perfil =>
                perfil.usuarioId ===
                usuarioVagas.id
        ) || null;

    if (perfilProfissional) {
        habilidadesPerfil =
            perfisHabilidades.filter(
                item =>
                    item.perfilProfissionalId ===
                    perfilProfissional.id
            );
    }

    registrarEventosEstudante();

    atualizarResumoEstudante();

    aplicarFiltros();
}


function registrarEventosEstudante() {
    [
        "filtro-busca",
        "filtro-modalidade",
        "filtro-experiencia",
        "filtro-localizacao",
        "filtro-ordem",
    ].forEach(id => {

        const elemento =
            document.getElementById(
                id
            );

        elemento.addEventListener(
            id.includes(
                "filtro-busca"
            ) ||
            id.includes(
                "localizacao"
            )
                ? "input"
                : "change",

            aplicarFiltros
        );
    });

    document.getElementById(
        "lista-vagas"
    ).addEventListener(
        "click",
        evento => {

            const cartao =
                evento.target.closest(
                    "[data-vaga-id]"
                );

            if (!cartao) {
                return;
            }

            selecionarVagaEstudante(
                Number(
                    cartao.dataset.vagaId
                )
            );
        }
    );
}


function obterVagasAtivas() {
    return vagas.filter(
        vaga =>
            vaga.status === "ativa"
    );
}


function atualizarResumoEstudante() {
    const vagasAtivas =
        obterVagasAtivas();

    const empresasComVagas =
        new Set(
            vagasAtivas.map(
                vaga =>
                    vaga.empresaId
            )
        );

    const idsVagasAtivas =
        new Set(
            vagasAtivas.map(
                vaga =>
                    vaga.id
            )
        );

    const habilidadesProcuradas =
        new Set(
            requisitos
                .filter(
                    requisito =>
                        idsVagasAtivas.has(
                            requisito.vagaId
                        )
                )
                .map(
                    requisito =>
                        requisito.habilidadeId
                )
        );

    document.getElementById(
        "total-vagas"
    ).textContent =
        vagasAtivas.length;

    document.getElementById(
        "total-empresas"
    ).textContent =
        empresasComVagas.size;

    document.getElementById(
        "total-habilidades"
    ).textContent =
        habilidadesProcuradas.size;
}


function aplicarFiltros() {
    const busca =
        normalizarTexto(
            document.getElementById(
                "filtro-busca"
            ).value
        );

    const modalidade =
        document.getElementById(
            "filtro-modalidade"
        ).value;

    const experiencia =
        document.getElementById(
            "filtro-experiencia"
        ).value;

    const localizacao =
        normalizarTexto(
            document.getElementById(
                "filtro-localizacao"
            ).value
        );

    const ordem =
        document.getElementById(
            "filtro-ordem"
        ).value;

    let resultado =
        obterVagasAtivas()
            .filter(vaga => {

                const empresa =
                    obterEmpresa(
                        vaga.empresaId
                    );

                const nomesHabilidades =
                    obterRequisitosVaga(
                        vaga.id
                    )
                        .map(
                            requisito =>
                                obterHabilidade(
                                    requisito.habilidadeId
                                )?.nome || ""
                        )
                        .join(" ");

                const textoPesquisa =
                    normalizarTexto(
                        [
                            vaga.titulo,
                            vaga.localizacao,
                            empresa?.nome,
                            empresa?.setor,
                            nomesHabilidades,
                        ].join(" ")
                    );

                const atendeBusca =
                    !busca ||
                    textoPesquisa.includes(
                        busca
                    );

                const atendeModalidade =
                    !modalidade ||
                    vaga.modalidade ===
                    modalidade;

                const atendeExperiencia =
                    !experiencia ||
                    vaga.nivelExperiencia ===
                    experiencia;

                const atendeLocalizacao =
                    !localizacao ||
                    normalizarTexto(
                        vaga.localizacao || ""
                    ).includes(
                        localizacao
                    );

                return (
                    atendeBusca &&
                    atendeModalidade &&
                    atendeExperiencia &&
                    atendeLocalizacao
                );
            });

    ordenarVagas(
        resultado,
        ordem
    );

    renderizarVagasEstudante(
        resultado
    );
}


function ordenarVagas(
    lista,
    ordem
) {
    if (ordem === "salario") {
        lista.sort(
            (a, b) =>
                obterMaiorSalario(b) -
                obterMaiorSalario(a)
        );

        return;
    }

    if (ordem === "titulo") {
        lista.sort(
            (a, b) =>
                a.titulo.localeCompare(
                    b.titulo,
                    "pt-BR"
                )
        );

        return;
    }

    lista.sort(
        (a, b) =>
            new Date(
                b.dataPublicacao || 0
            ) -
            new Date(
                a.dataPublicacao || 0
            )
    );
}


function obterMaiorSalario(vaga) {
    return Number(
        vaga.salarioMaximo ??
        vaga.salarioMinimo ??
        0
    );
}


function renderizarVagasEstudante(
    vagasFiltradas
) {
    const conteiner =
        document.getElementById(
            "lista-vagas"
        );

    document.getElementById(
        "quantidade-resultados"
    ).textContent =
        `${vagasFiltradas.length} resultado(s)`;

    if (!vagasFiltradas.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga corresponde aos filtros.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        vagasFiltradas
            .map(vaga => {

                const empresa =
                    obterEmpresa(
                        vaga.empresaId
                    );

                const ativa =
                    vaga.id ===
                    vagaSelecionadaId;

                return `
                    <button
                        class="cartao-vaga ${
                            ativa
                                ? "ativo"
                                : ""
                        }"
                        data-vaga-id="${vaga.id}"
                        type="button"
                    >

                        <div class="topo-cartao-vaga">

                            <div>

                                <h3>
                                    ${escaparHtml(
                                        vaga.titulo
                                    )}
                                </h3>

                                <span class="nome-empresa-vaga">
                                    ${escaparHtml(
                                        empresa?.nome ||
                                        "Empresa"
                                    )}
                                </span>

                            </div>

                            <span class="tag-vaga">
                                Ativa
                            </span>

                        </div>

                        <div class="informacoes-cartao-vaga">

                            <span>
                                ${formatarExperiencia(
                                    vaga.nivelExperiencia
                                )}
                            </span>

                            <span>
                                ${formatarModalidade(
                                    vaga.modalidade
                                )}
                            </span>

                            <span>
                                ${escaparHtml(
                                    vaga.localizacao ||
                                    "Localização não informada"
                                )}
                            </span>

                        </div>

                        <div class="rodape-cartao-vaga">

                            <span class="salario-cartao">
                                ${formatarFaixaSalarial(
                                    vaga
                                )}
                            </span>

                            <span class="data-cartao">
                                ${formatarData(
                                    vaga.dataPublicacao
                                )}
                            </span>

                        </div>

                    </button>
                `;
            })
            .join("");
}


function selecionarVagaEstudante(id) {
    vagaSelecionadaId =
        id;

    const vaga =
        vagas.find(
            item =>
                item.id === id
        );

    if (!vaga) {
        return;
    }

    aplicarFiltros();

    renderizarDetalheEstudante(
        vaga
    );
}


function renderizarDetalheEstudante(
    vaga
) {
    const conteiner =
        document.getElementById(
            "detalhe-vaga"
        );

    const empresa =
        obterEmpresa(
            vaga.empresaId
        );

    const requisitosVaga =
        obterRequisitosVaga(
            vaga.id
        );

    const habilidadesUsuario =
        new Set(
            habilidadesPerfil.map(
                item =>
                    item.habilidadeId
            )
        );

    const requisitosAtendidos =
        requisitosVaga.filter(
            requisito =>
                habilidadesUsuario.has(
                    requisito.habilidadeId
                )
        );

    const possuiPerfil =
        Boolean(
            perfilProfissional
        );

    let compatibilidade =
        null;

    if (
        possuiPerfil &&
        requisitosVaga.length
    ) {
        compatibilidade =
            Math.round(
                (
                    requisitosAtendidos.length /
                    requisitosVaga.length
                ) * 100
            );
    }

    const requisitosHtml =
        criarHtmlRequisitosEstudante(
            requisitosVaga,
            habilidadesUsuario,
            possuiPerfil
        );

    const siteEmpresa =
        normalizarUrl(
            empresa?.site
        );

    const beneficiosHtml =
        vaga.beneficios
            ? `
                <section class="secao-detalhe">

                    <h3>
                        Benefícios
                    </h3>

                    <div class="bloco-beneficios-vaga">

                        <p>
                            ${escaparHtml(
                                vaga.beneficios
                            )}
                        </p>

                    </div>

                </section>
            `
            : "";

    conteiner.innerHTML = `
        <div class="cabecalho-detalhe-vaga">

            <span class="empresa-detalhe">
                ${escaparHtml(
                    empresa?.nome ||
                    "Empresa"
                )}
            </span>

            <h2>
                ${escaparHtml(
                    vaga.titulo
                )}
            </h2>

            <div class="metadados-detalhe">

                <span>
                    ${formatarExperiencia(
                        vaga.nivelExperiencia
                    )}
                </span>

                <span>
                    ${formatarModalidade(
                        vaga.modalidade
                    )}
                </span>

                <span>
                    ${escaparHtml(
                        vaga.localizacao ||
                        "Localização não informada"
                    )}
                </span>

                <span>
                    Publicada em
                    ${formatarData(
                        vaga.dataPublicacao
                    )}
                </span>

            </div>

            <div class="salario-detalhe">
                ${formatarFaixaSalarial(
                    vaga
                )}
            </div>

        </div>

        ${criarHtmlCompatibilidade(
            compatibilidade,
            requisitosAtendidos.length,
            requisitosVaga.length,
            possuiPerfil
        )}

        <section class="secao-detalhe">

            <h3>
                Sobre a oportunidade
            </h3>

            <p>
                ${escaparHtml(
                    vaga.descricao ||
                    "A empresa ainda não adicionou uma descrição detalhada para esta vaga."
                )}
            </p>

        </section>

        ${beneficiosHtml}

        <section class="secao-detalhe">

            <h3>
                Requisitos
            </h3>

            <div class="lista-requisitos">
                ${requisitosHtml}
            </div>

        </section>

        <section class="secao-detalhe">

            <h3>
                Sobre a empresa
            </h3>

            <div class="bloco-empresa">

                <strong>
                    ${escaparHtml(
                        empresa?.nome ||
                        "Empresa"
                    )}
                </strong>

                <span>
                    ${escaparHtml(
                        empresa?.setor ||
                        "Setor não informado"
                    )}
                </span>

                <p>
                    ${escaparHtml(
                        empresa?.descricao ||
                        "A empresa ainda não adicionou uma descrição."
                    )}
                </p>

            </div>

        </section>

        <div class="acoes-detalhe">

            <button
                class="botao-candidatura"
                type="button"
                disabled
            >
                Candidatura em breve
            </button>

            ${
                siteEmpresa
                    ? `
                        <a
                            class="link-empresa"
                            href="${escaparHtml(
                                siteEmpresa
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Site da empresa
                        </a>
                    `
                    : ""
            }

        </div>
    `;
}


function criarHtmlCompatibilidade(
    compatibilidade,
    atendidos,
    total,
    possuiPerfil
) {
    if (!possuiPerfil) {
        return `
            <div class="compatibilidade-vaga">

                <div class="topo-compatibilidade">

                    <span>
                        Compatibilidade
                    </span>

                    <strong>
                        —
                    </strong>

                </div>

                <p class="texto-compatibilidade">
                    Complete seu perfil para comparar suas
                    habilidades com esta oportunidade.
                </p>

            </div>
        `;
    }

    if (!total) {
        return `
            <div class="compatibilidade-vaga">

                <div class="topo-compatibilidade">

                    <span>
                        Compatibilidade
                    </span>

                    <strong>
                        —
                    </strong>

                </div>

                <p class="texto-compatibilidade">
                    Esta vaga ainda não possui requisitos
                    técnicos cadastrados.
                </p>

            </div>
        `;
    }

    return `
        <div class="compatibilidade-vaga">

            <div class="topo-compatibilidade">

                <span>
                    Compatibilidade com seu perfil
                </span>

                <strong>
                    ${compatibilidade}%
                </strong>

            </div>

            <div class="barra-compatibilidade-vaga">

                <span
                    style="width: ${compatibilidade}%"
                ></span>

            </div>

            <p class="texto-compatibilidade">
                Você possui ${atendidos} de
                ${total} requisito(s) desta oportunidade.
            </p>

        </div>
    `;
}


function criarHtmlRequisitosEstudante(
    requisitosVaga,
    habilidadesUsuario,
    possuiPerfil
) {
    if (!requisitosVaga.length) {
        return `
            <div class="estado-vazio">
                Nenhum requisito técnico cadastrado.
            </div>
        `;
    }

    return requisitosVaga
        .map(requisito => {

            const habilidade =
                obterHabilidade(
                    requisito.habilidadeId
                );

            const atendido =
                possuiPerfil &&
                habilidadesUsuario.has(
                    requisito.habilidadeId
                );

            return `
                <div class="
                    requisito-vaga
                    ${
                        atendido
                            ? "requisito-atendido"
                            : "requisito-pendente"
                    }
                ">

                    <div class="requisito-identidade">

                        <span class="estado-requisito">
                            ${
                                atendido
                                    ? "✓"
                                    : "+"
                            }
                        </span>

                        <div>

                            <strong>
                                ${escaparHtml(
                                    habilidade?.nome ||
                                    "Habilidade"
                                )}
                            </strong>

                            <small>
                                Nível:
                                ${formatarNivelHabilidade(
                                    requisito.nivelExigido
                                )}
                            </small>

                        </div>

                    </div>

                    <span class="tipo-requisito">
                        ${
                            requisito.obrigatorio
                                ? "Obrigatório"
                                : "Diferencial"
                        }
                    </span>

                </div>
            `;
        })
        .join("");
}


/* ============================= */
/* FUNÇÕES COMPARTILHADAS        */
/* ============================= */


function obterEmpresa(empresaId) {
    return empresas.find(
        empresa =>
            empresa.id ===
            empresaId
    ) || null;
}


function obterRequisitosVaga(vagaId) {
    return requisitos.filter(
        requisito =>
            requisito.vagaId ===
            vagaId
    );
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


function obterTextoCampo(id) {
    return document
        .getElementById(id)
        .value
        .trim();
}


function obterNumeroCampo(id) {
    const valor =
        document.getElementById(
            id
        ).value;

    if (valor === "") {
        return null;
    }

    return Number(valor);
}


function formatarFaixaSalarial(vaga) {
    const possuiMinimo =
        vaga.salarioMinimo !== null &&
        vaga.salarioMinimo !== undefined &&
        vaga.salarioMinimo !== "";

    const possuiMaximo =
        vaga.salarioMaximo !== null &&
        vaga.salarioMaximo !== undefined &&
        vaga.salarioMaximo !== "";

    if (
        !possuiMinimo &&
        !possuiMaximo
    ) {
        return "Salário a definir";
    }

    const minimo =
        Number(
            vaga.salarioMinimo
        );

    const maximo =
        Number(
            vaga.salarioMaximo
        );

    if (
        possuiMinimo &&
        possuiMaximo
    ) {
        return (
            `${formatarMoeda(minimo)} - ` +
            `${formatarMoeda(maximo)}`
        );
    }

    if (possuiMinimo) {
        return (
            "A partir de " +
            formatarMoeda(
                minimo
            )
        );
    }

    return (
        "Até " +
        formatarMoeda(
            maximo
        )
    );
}


function formatarMoeda(valor) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
        }
    ).format(valor);
}


function formatarData(data) {
    if (!data) {
        return "Data não informada";
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


function formatarModalidade(valor) {
    const valores = {
        remoto:
            "Remoto",
        hibrido:
            "Híbrido",
        presencial:
            "Presencial",
    };

    return (
        valores[valor] ||
        "Não informada"
    );
}


function formatarExperiencia(valor) {
    const valores = {
        iniciante:
            "Iniciante",
        junior:
            "Júnior",
        pleno:
            "Pleno",
        senior:
            "Sênior",
    };

    return (
        valores[valor] ||
        "Não informado"
    );
}


function formatarNivelHabilidade(valor) {
    const valores = {
        basico:
            "Básico",
        intermediario:
            "Intermediário",
        avancado:
            "Avançado",
    };

    return (
        valores[valor] ||
        valor ||
        "Não informado"
    );
}


function formatarStatusVaga(valor) {
    const valores = {
        ativa:
            "Ativa",
        pausada:
            "Pausada",
        encerrada:
            "Encerrada",
    };

    return (
        valores[valor] ||
        "Status desconhecido"
    );
}


function normalizarTexto(valor) {
    return String(
        valor ?? ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


function normalizarUrl(valor) {
    const url =
        String(
            valor ?? ""
        ).trim();

    if (!url) {
        return null;
    }

    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        )
    ) {
        return url;
    }

    return `https://${url}`;
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