let usuarioVagas = null;

let vagas = [];
let empresas = [];
let requisitos = [];
let habilidades = [];

let perfilProfissional = null;
let habilidadesPerfil = [];

let vagaSelecionadaId = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaVagas
);


async function iniciarPaginaVagas() {
    registrarEventos();

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
            dadosVagas;

        empresas =
            dadosEmpresas;

        requisitos =
            dadosRequisitos;

        habilidades =
            dadosHabilidades;


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


        atualizarResumo();
        aplicarFiltros();

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


function registrarEventos() {
    [
        "filtro-busca",
        "filtro-modalidade",
        "filtro-experiencia",
        "filtro-localizacao",
        "filtro-ordem",
    ].forEach(id => {

        const elemento =
            document.getElementById(id);

        elemento.addEventListener(
            id.includes("filtro-busca") ||
            id.includes("localizacao")
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

            selecionarVaga(
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


function obterEmpresa(empresaId) {
    return empresas.find(
        empresa =>
            empresa.id === empresaId
    ) || null;
}


function obterRequisitosVaga(vagaId) {
    return requisitos.filter(
        requisito =>
            requisito.vagaId === vagaId
    );
}


function obterHabilidade(habilidadeId) {
    return habilidades.find(
        habilidade =>
            habilidade.id ===
            habilidadeId
    ) || null;
}


function atualizarResumo() {
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


    renderizarVagas(
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


function renderizarVagas(
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


function selecionarVaga(id) {
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

    renderizarDetalhe(
        vaga
    );
}


function renderizarDetalhe(vaga) {
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
        criarHtmlRequisitos(
            requisitosVaga,
            habilidadesUsuario,
            possuiPerfil
        );


    const siteEmpresa =
        normalizarUrl(
            empresa?.site
        );


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


        ${
            criarHtmlCompatibilidade(
                compatibilidade,
                requisitosAtendidos.length,
                requisitosVaga.length,
                possuiPerfil
            )
        }


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
                title="A empresa ainda não informou um link de candidatura."
            >
                Link de candidatura não informado
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


function criarHtmlRequisitos(
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


function formatarFaixaSalarial(vaga) {
    const minimo =
        Number(
            vaga.salarioMinimo
        );


    const maximo =
        Number(
            vaga.salarioMaximo
        );


    const temMinimo =
        Number.isFinite(minimo) &&
        vaga.salarioMinimo !== null;


    const temMaximo =
        Number.isFinite(maximo) &&
        vaga.salarioMaximo !== null;


    if (
        temMinimo &&
        temMaximo
    ) {
        return (
            `${formatarMoeda(minimo)} - ` +
            `${formatarMoeda(maximo)}`
        );
    }


    if (temMinimo) {
        return (
            `A partir de ` +
            formatarMoeda(minimo)
        );
    }


    if (temMaximo) {
        return (
            `Até ` +
            formatarMoeda(maximo)
        );
    }


    return "Salário não informado";
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
        remoto: "Remoto",
        hibrido: "Híbrido",
        presencial: "Presencial",
    };

    return valores[valor] ||
        "Não informada";
}


function formatarExperiencia(valor) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return valores[valor] ||
        "Não informado";
}


function formatarNivelHabilidade(valor) {
    const valores = {
        basico: "Básico",
        intermediario: "Intermediário",
        avancado: "Avançado",
    };

    return valores[valor] ||
        valor ||
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


function normalizarUrl(valor) {
    const url =
        String(
            valor ?? ""
        ).trim();


    if (!url) {
        return null;
    }


    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
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