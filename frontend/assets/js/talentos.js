let usuarioTalentos = null;
let empresaTalentos = null;

let usuariosTalentos = [];
let perfisTalentos = [];
let perfilHabilidadesTalentos = [];
let habilidadesTalentos = [];
let vagasTalentos = [];
let requisitosVagaTalentos = [];
let experienciasTalentos = [];
let formacoesTalentos = [];
let projetosTalentos = [];

let talentosMontados = [];
let vagaComparacaoTalentos = null;

let temporizadorMensagemTalentos = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaTalentos
);


async function iniciarPaginaTalentos() {
    const estado =
        document.getElementById(
            "estado-talentos"
        );

    try {
        const sessao =
            await apiRequest(
                "/autenticacao/sessao"
            );

        if (
            !sessao.autenticado ||
            !sessao.usuario
        ) {
            window.location.href =
                "./login.html";

            return;
        }

        usuarioTalentos =
            sessao.usuario;

        if (
            usuarioTalentos.tipoConta !==
            "empresa"
        ) {
            window.location.href =
                "../index.html";

            return;
        }

        const [
            usuarios,
            empresas,
            perfis,
            perfisHabilidades,
            habilidades,
            vagas,
            requisitos,
            experiencias,
            formacoes,
            projetos,
        ] = await Promise.all([
            apiRequest(
                "/talentos"
            ),
            apiRequest(
                "/empresas"
            ),
            apiRequest(
                "/perfis-profissionais"
            ),
            apiRequest(
                "/perfil-habilidades"
            ),
            apiRequest(
                "/habilidades"
            ),
            apiRequest(
                "/vagas"
            ),
            apiRequest(
                "/requisitos-vaga"
            ),
            apiRequest(
                "/experiencias-profissionais"
            ),
            apiRequest(
                "/formacoes-academicas"
            ),
            apiRequest(
                "/projetos"
            ),
        ]);

        usuariosTalentos =
            usuarios || [];

        perfisTalentos =
            perfis || [];

        perfilHabilidadesTalentos =
            perfisHabilidades || [];

        habilidadesTalentos =
            habilidades || [];

        vagasTalentos =
            vagas || [];

        requisitosVagaTalentos =
            requisitos || [];

        experienciasTalentos =
            experiencias || [];

        formacoesTalentos =
            formacoes || [];

        projetosTalentos =
            projetos || [];

        empresaTalentos =
            (empresas || []).find(
                empresa =>
                    empresa.usuarioId ===
                    usuarioTalentos.id
            ) || null;

        if (!empresaTalentos) {
            throw new Error(
                "Não foi possível localizar a empresa vinculada à sua conta."
            );
        }

        montarTalentos();

        preencherFiltrosTalentos();

        preencherVagasComparacao();

        registrarEventosTalentos();

        aplicarFiltrosTalentos();

    } catch (erro) {
        estado.textContent =
            erro.message ||
            "Não foi possível carregar os profissionais.";
    }
}


function montarTalentos() {
    talentosMontados =
        perfisTalentos
            .map(
                perfil => {
                    const usuario =
                        usuariosTalentos.find(
                            item =>
                                item.id ===
                                perfil.usuarioId
                        );

                    if (
                        !usuario ||
                        usuario.tipoConta !==
                        "estudante" ||
                        usuario.status !==
                        "ativo"
                    ) {
                        return null;
                    }

                    const habilidadesPerfil =
                        perfilHabilidadesTalentos
                            .filter(
                                item =>
                                    item.perfilProfissionalId ===
                                    perfil.id
                            )
                            .map(
                                item => {
                                    const habilidade =
                                        habilidadesTalentos.find(
                                            habilidadeItem =>
                                                habilidadeItem.id ===
                                                item.habilidadeId
                                        );

                                    return {
                                        ...item,
                                        habilidade:
                                            habilidade || null,
                                    };
                                }
                            )
                            .filter(
                                item =>
                                    item.habilidade
                            );

                    return {
                        usuario,
                        perfil,
                        habilidades:
                            habilidadesPerfil,

                        experiencias:
                            experienciasTalentos.filter(
                                item =>
                                    item.perfilProfissionalId ===
                                    perfil.id
                            ),

                        formacoes:
                            formacoesTalentos.filter(
                                item =>
                                    item.perfilProfissionalId ===
                                    perfil.id
                            ),

                        projetos:
                            projetosTalentos.filter(
                                item =>
                                    item.perfilProfissionalId ===
                                    perfil.id
                            ),

                        match: null,
                    };
                }
            )
            .filter(Boolean);
}


function preencherFiltrosTalentos() {
    preencherSelectTalentos(
        "filtro-nivel-talentos",
        valoresUnicosTalentos(
            talentosMontados.map(
                talento =>
                    talento.perfil
                        .nivelExperiencia
            )
        ),
        formatarNivelExperienciaTalentos
    );

    preencherSelectTalentos(
        "filtro-modalidade-talentos",
        valoresUnicosTalentos(
            talentosMontados.map(
                talento =>
                    talento.perfil
                        .modalidadePreferida
            )
        ),
        formatarModalidadeTalentos
    );

    preencherSelectTalentos(
        "filtro-localizacao-talentos",
        valoresUnicosTalentos(
            talentosMontados.map(
                talento =>
                    talento.perfil
                        .localizacaoPreferida
            )
        )
    );

    preencherSelectTalentos(
        "filtro-habilidade-talentos",
        [...habilidadesTalentos]
            .sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            )
            .map(
                habilidade =>
                    ({
                        value:
                            String(
                                habilidade.id
                            ),
                        label:
                            habilidade.nome,
                    })
            )
    );
}


function preencherSelectTalentos(
    id,
    valores,
    formatador = null
) {
    const select =
        document.getElementById(id);

    valores.forEach(
        valor => {
            const option =
                document.createElement(
                    "option"
                );

            if (
                typeof valor === "object"
            ) {
                option.value =
                    valor.value;

                option.textContent =
                    valor.label;

            } else {
                option.value =
                    valor;

                option.textContent =
                    formatador
                        ? formatador(valor)
                        : valor;
            }

            select.appendChild(
                option
            );
        }
    );
}


function preencherVagasComparacao() {
    const select =
        document.getElementById(
            "comparar-vaga-talentos"
        );

    const vagasEmpresa =
        vagasTalentos
            .filter(
                vaga =>
                    vaga.empresaId ===
                    empresaTalentos.id &&
                    vaga.status !==
                    "encerrada"
            )
            .sort(
                (a, b) =>
                    a.titulo.localeCompare(
                        b.titulo,
                        "pt-BR"
                    )
            );

    vagasEmpresa.forEach(
        vaga => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(vaga.id);

            option.textContent =
                `${vaga.titulo} · ${
                    formatarStatusVagaTalentos(
                        vaga.status
                    )
                }`;

            select.appendChild(
                option
            );
        }
    );
}


function registrarEventosTalentos() {
    [
        "busca-talentos",
        "filtro-nivel-talentos",
        "filtro-modalidade-talentos",
        "filtro-localizacao-talentos",
        "filtro-habilidade-talentos",
    ].forEach(
        id => {
            const elemento =
                document.getElementById(id);

            elemento.addEventListener(
                elemento.tagName ===
                "INPUT"
                    ? "input"
                    : "change",
                aplicarFiltrosTalentos
            );
        }
    );

    document.getElementById(
        "comparar-vaga-talentos"
    ).addEventListener(
        "change",
        alterarComparacaoTalentos
    );

    document.getElementById(
        "grade-talentos"
    ).addEventListener(
        "click",
        evento => {
            const botao =
                evento.target.closest(
                    "[data-ver-talento]"
                );

            if (!botao) {
                return;
            }

            abrirPainelTalento(
                Number(
                    botao.dataset
                        .verTalento
                )
            );
        }
    );
}


function alterarComparacaoTalentos() {
    const vagaId =
        Number(
            document.getElementById(
                "comparar-vaga-talentos"
            ).value
        );

    vagaComparacaoTalentos =
        vagaId
            ? vagasTalentos.find(
                vaga =>
                    vaga.id ===
                    vagaId
            ) || null
            : null;

    calcularMatchesTalentos();

    aplicarFiltrosTalentos();
}


function calcularMatchesTalentos() {
    if (!vagaComparacaoTalentos) {
        talentosMontados.forEach(
            talento => {
                talento.match = null;
            }
        );

        return;
    }

    const requisitos =
        requisitosVagaTalentos.filter(
            requisito =>
                requisito.vagaId ===
                vagaComparacaoTalentos.id
        );

    talentosMontados.forEach(
        talento => {
            talento.match =
                calcularMatchTalento(
                    talento,
                    requisitos
                );
        }
    );
}


function calcularMatchTalento(
    talento,
    requisitos
) {
    if (!requisitos.length) {
        return {
            percentual: 0,
            atendidos: [],
            faltantes: [],
            requisitos: [],
        };
    }

    let pesoTotal = 0;
    let pesoAtendido = 0;

    const avaliados =
        requisitos.map(
            requisito => {
                const peso =
                    Number(
                        requisito.peso
                    ) ||
                    (
                        requisito.obrigatorio
                            ? 2
                            : 1
                    );

                pesoTotal += peso;

                const habilidade =
                    habilidadesTalentos.find(
                        item =>
                            item.id ===
                            requisito.habilidadeId
                    );

                const habilidadePerfil =
                    talento.habilidades.find(
                        item =>
                            item.habilidadeId ===
                            requisito.habilidadeId
                    );

                const nivelPerfil =
                    habilidadePerfil
                        ? obterPesoNivelHabilidade(
                            habilidadePerfil
                                .nivelDominio
                        )
                        : 0;

                const nivelExigido =
                    obterPesoNivelHabilidade(
                        requisito.nivelExigido
                    );

                const atendido =
                    Boolean(
                        habilidadePerfil
                    ) &&
                    nivelPerfil >=
                    nivelExigido;

                if (atendido) {
                    pesoAtendido += peso;
                }

                return {
                    requisito,
                    habilidade,
                    habilidadePerfil,
                    atendido,
                };
            }
        );

    const percentual =
        pesoTotal > 0
            ? Math.round(
                (
                    pesoAtendido /
                    pesoTotal
                ) * 100
            )
            : 0;

    return {
        percentual,
        requisitos: avaliados,

        atendidos:
            avaliados.filter(
                item =>
                    item.atendido
            ),

        faltantes:
            avaliados.filter(
                item =>
                    !item.atendido
            ),
    };
}


function aplicarFiltrosTalentos() {
    const busca =
        normalizarTextoTalentos(
            document.getElementById(
                "busca-talentos"
            ).value
        );

    const nivel =
        document.getElementById(
            "filtro-nivel-talentos"
        ).value;

    const modalidade =
        document.getElementById(
            "filtro-modalidade-talentos"
        ).value;

    const localizacao =
        document.getElementById(
            "filtro-localizacao-talentos"
        ).value;

    const habilidadeId =
        Number(
            document.getElementById(
                "filtro-habilidade-talentos"
            ).value
        );

    let resultado =
        talentosMontados.filter(
            talento => {
                const habilidadesTexto =
                    talento.habilidades
                        .map(
                            item =>
                                item.habilidade.nome
                        )
                        .join(" ");

                const experienciasTexto =
                    talento.experiencias
                        .map(
                            experiencia =>
                                [
                                    experiencia.cargo,
                                    experiencia.empresa,
                                    experiencia.descricao,
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                        )
                        .join(" ");

                const textoBusca =
                    normalizarTextoTalentos(
                        [
                            talento.usuario.nome,
                            talento.perfil
                                .objetivoProfissional,
                            talento.perfil
                                .localizacaoPreferida,
                            habilidadesTexto,
                            experienciasTexto,
                        ]
                            .filter(Boolean)
                            .join(" ")
                    );

                const atendeBusca =
                    !busca ||
                    textoBusca.includes(
                        busca
                    );

                const atendeNivel =
                    !nivel ||
                    talento.perfil
                        .nivelExperiencia ===
                    nivel;

                const atendeModalidade =
                    !modalidade ||
                    talento.perfil
                        .modalidadePreferida ===
                    modalidade;

                const atendeLocalizacao =
                    !localizacao ||
                    talento.perfil
                        .localizacaoPreferida ===
                    localizacao;

                const atendeHabilidade =
                    !habilidadeId ||
                    talento.habilidades.some(
                        item =>
                            item.habilidadeId ===
                            habilidadeId
                    );

                return (
                    atendeBusca &&
                    atendeNivel &&
                    atendeModalidade &&
                    atendeLocalizacao &&
                    atendeHabilidade
                );
            }
        );

    if (vagaComparacaoTalentos) {
        resultado =
            [...resultado].sort(
                (a, b) =>
                    (
                        b.match
                            ?.percentual ||
                        0
                    ) -
                    (
                        a.match
                            ?.percentual ||
                        0
                    )
            );
    } else {
        resultado =
            [...resultado].sort(
                (a, b) =>
                    a.usuario.nome
                        .localeCompare(
                            b.usuario.nome,
                            "pt-BR"
                        )
            );
    }

    renderizarTalentos(
        resultado
    );
}


function renderizarTalentos(
    talentos
) {
    const estado =
        document.getElementById(
            "estado-talentos"
        );

    const grade =
        document.getElementById(
            "grade-talentos"
        );

    const indicador =
        document.getElementById(
            "indicador-comparacao-talentos"
        );

    document.getElementById(
        "quantidade-talentos"
    ).textContent =
        talentos.length;

    indicador.classList.toggle(
        "oculto",
        !vagaComparacaoTalentos
    );

    if (!talentos.length) {
        grade.classList.add(
            "oculto"
        );

        estado.classList.remove(
            "oculto"
        );

        estado.textContent =
            "Nenhum profissional corresponde aos filtros selecionados.";

        return;
    }

    estado.classList.add(
        "oculto"
    );

    grade.classList.remove(
        "oculto"
    );

    grade.innerHTML =
        talentos
            .map(
                renderizarCartaoTalento
            )
            .join("");
}


function renderizarCartaoTalento(
    talento
) {
    const principaisHabilidades =
        talento.habilidades
            .slice(0, 4);

    const match =
        talento.match;

    return `
        <article class="cartao-talento">

            <div class="cabecalho-talento">

                ${renderizarFotoTalento(
                    talento,
                    false
                )}

                <div class="identidade-talento">

                    <h3>
                        ${escaparHtmlTalentos(
                            talento.usuario.nome
                        )}
                    </h3>

                    <div class="objetivo-talento">
                        ${
                            escaparHtmlTalentos(
                                talento.perfil
                                    .objetivoProfissional ||
                                "Objetivo profissional não informado"
                            )
                        }
                    </div>

                </div>

            </div>


            <div class="localizacao-talento">
                ${
                    escaparHtmlTalentos(
                        talento.perfil
                            .localizacaoPreferida ||
                        "Localização não informada"
                    )
                }
                ·
                ${
                    formatarModalidadeTalentos(
                        talento.perfil
                            .modalidadePreferida
                    )
                }
            </div>


            <div class="tags-talento">

                ${
                    principaisHabilidades.length
                        ? principaisHabilidades
                            .map(
                                item => `
                                    <span class="tag-talento">
                                        ${
                                            escaparHtmlTalentos(
                                                item.habilidade.nome
                                            )
                                        }
                                    </span>
                                `
                            )
                            .join("")
                        : `
                            <span class="sem-habilidades-talento">
                                Nenhuma habilidade cadastrada.
                            </span>
                        `
                }

            </div>


            ${
                match
                    ? `
                        <div class="compatibilidade-talento">

                            <div class="linha-compatibilidade-talento">

                                <span>
                                    Compatibilidade
                                </span>

                                <strong>
                                    ${match.percentual}%
                                </strong>

                            </div>

                            <div class="barra-match-talento">
                                <div
                                    style="width: ${match.percentual}%"
                                ></div>
                            </div>

                            <div class="resumo-requisitos-talento">

                                <span class="requisito-atendido">
                                    ✓
                                    ${match.atendidos.length}
                                    atendidos
                                </span>

                                <span class="requisito-faltante">
                                    ×
                                    ${match.faltantes.length}
                                    faltantes
                                </span>

                            </div>

                        </div>
                    `
                    : ""
            }


            <div class="rodape-cartao-talento">

                <span class="nivel-talento">
                    ${
                        formatarNivelExperienciaTalentos(
                            talento.perfil
                                .nivelExperiencia
                        )
                    }
                </span>

                <button
                    type="button"
                    class="botao-ver-talento"
                    data-ver-talento="${talento.perfil.id}"
                >
                    Ver perfil
                </button>

            </div>

        </article>
    `;
}


function abrirPainelTalento(
    perfilId
) {
    const talento =
        talentosMontados.find(
            item =>
                item.perfil.id ===
                perfilId
        );

    if (!talento) {
        return;
    }

    const painel =
        document.getElementById(
            "painel-talento"
        );

    const conteudo =
        document.getElementById(
            "conteudo-painel-talento"
        );

    conteudo.innerHTML =
        renderizarPainelTalento(
            talento
        );

    document.getElementById(
        "botao-fechar-painel-talento"
    ).addEventListener(
        "click",
        () => painel.close()
    );

    const copiar =
        document.getElementById(
            "botao-copiar-contato-talento"
        );

    if (copiar) {
        copiar.addEventListener(
            "click",
            () => copiarContatoTalento(
                talento
            )
        );
    }

    const visualizarCurriculo =
        document.getElementById(
            "botao-visualizar-curriculo-talento"
        );

    if (visualizarCurriculo) {
        visualizarCurriculo.addEventListener(
            "click",
            () => visualizarCurriculoTalento(
                talento
            )
        );
    }

    painel.showModal();
}


function renderizarPainelTalento(
    talento
) {
    return `
        <div class="conteudo-painel-talento">

            <div class="cabecalho-painel-talento">

                <div>
                    <span class="rotulo-talentos">
                        PERFIL PROFISSIONAL
                    </span>

                    <h2>
                        Visão completa
                    </h2>
                </div>

                <button
                    id="botao-fechar-painel-talento"
                    type="button"
                    class="botao-fechar-painel-talento"
                >
                    ×
                </button>

            </div>


            <div class="corpo-painel-talento">

                <div class="perfil-topo-painel">

                    ${renderizarFotoTalento(
                        talento,
                        true
                    )}

                    <div>

                        <h3>
                            ${
                                escaparHtmlTalentos(
                                    talento.usuario.nome
                                )
                            }
                        </h3>

                        <p>
                            ${
                                escaparHtmlTalentos(
                                    talento.perfil
                                        .objetivoProfissional ||
                                    "Objetivo profissional não informado"
                                )
                            }
                        </p>

                    </div>

                </div>


                <div class="metadados-painel-talento">

                    <span>
                        ${
                            formatarNivelExperienciaTalentos(
                                talento.perfil
                                    .nivelExperiencia
                            )
                        }
                    </span>

                    <span>
                        ${
                            formatarModalidadeTalentos(
                                talento.perfil
                                    .modalidadePreferida
                            )
                        }
                    </span>

                    <span>
                        ${
                            escaparHtmlTalentos(
                                talento.perfil
                                    .localizacaoPreferida ||
                                "Localização não informada"
                            )
                        }
                    </span>

                </div>


                <section class="secao-painel-talento">

                    <h4>
                        Sobre
                    </h4>

                    <p>
                        ${
                            escaparHtmlTalentos(
                                talento.perfil
                                    .sobreMim ||
                                "O profissional ainda não adicionou uma apresentação."
                            )
                        }
                    </p>

                </section>


                <section class="secao-painel-talento">

                    <h4>
                        Habilidades
                    </h4>

                    <div class="tags-talento">

                        ${
                            talento.habilidades.length
                                ? talento.habilidades
                                    .map(
                                        item => `
                                            <span class="tag-talento">
                                                ${
                                                    escaparHtmlTalentos(
                                                        item.habilidade.nome
                                                    )
                                                }
                                                ·
                                                ${
                                                    formatarNivelHabilidadeTalentos(
                                                        item.nivelDominio
                                                    )
                                                }
                                            </span>
                                        `
                                    )
                                    .join("")
                                : `
                                    <span class="sem-habilidades-talento">
                                        Nenhuma habilidade cadastrada.
                                    </span>
                                `
                        }

                    </div>

                </section>


                ${
                    renderizarCompatibilidadePainel(
                        talento
                    )
                }


                <section class="secao-painel-talento">

                    <h4>
                        Experiência profissional
                    </h4>

                    ${
                        renderizarExperienciasTalento(
                            talento.experiencias
                        )
                    }

                </section>


                <section class="secao-painel-talento">

                    <h4>
                        Formação acadêmica
                    </h4>

                    ${
                        renderizarFormacoesTalento(
                            talento.formacoes
                        )
                    }

                </section>


                <section class="secao-painel-talento">

                    <h4>
                        Projetos
                    </h4>

                    ${
                        renderizarProjetosTalento(
                            talento.projetos
                        )
                    }

                </section>


                <section class="secao-painel-talento">

                    <h4>
                        Currículo
                    </h4>

                    ${
                        talento.perfil.curriculoUrl
                            ? `
                                <p>
                                    O profissional possui
                                    um currículo disponível.
                                </p>
                            `
                            : `
                                <p>
                                    Este profissional ainda
                                    não enviou um currículo.
                                </p>
                            `
                    }

                </section>

            </div>


            <div class="acoes-painel-talento">

                ${
                    talento.perfil.curriculoUrl
                        ? `
                            <button
                                id="botao-visualizar-curriculo-talento"
                                type="button"
                                class="botao-copiar-contato"
                            >
                                Visualizar currículo
                            </button>
                        `
                        : ""
                }

                <button
                    id="botao-copiar-contato-talento"
                    type="button"
                    class="botao-copiar-contato"
                    ${
                        talento.usuario.email
                            ? ""
                            : "disabled"
                    }
                >
                    Copiar contato
                </button>

            </div>

        </div>
    `;
}


function renderizarCompatibilidadePainel(
    talento
) {
    if (
        !vagaComparacaoTalentos ||
        !talento.match
    ) {
        return "";
    }

    return `
        <section class="secao-painel-talento">

            <h4>
                Compatibilidade com
                ${
                    escaparHtmlTalentos(
                        vagaComparacaoTalentos.titulo
                    )
                }
            </h4>

            <div class="linha-compatibilidade-talento">

                <span>
                    Match calculado
                </span>

                <strong>
                    ${talento.match.percentual}%
                </strong>

            </div>

            <div class="barra-match-talento">
                <div
                    style="width: ${talento.match.percentual}%"
                ></div>
            </div>


            <div class="requisitos-painel-talento">

                ${
                    talento.match.requisitos
                        .map(
                            item => `
                                <div class="item-requisito-painel">

                                    <strong>
                                        ${
                                            item.atendido
                                                ? "✓"
                                                : "×"
                                        }

                                        ${
                                            escaparHtmlTalentos(
                                                item.habilidade
                                                    ?.nome ||
                                                "Habilidade"
                                            )
                                        }
                                    </strong>

                                    <span
                                        class="${
                                            item.atendido
                                                ? "requisito-atendido"
                                                : "requisito-faltante"
                                        }"
                                    >
                                        ${
                                            item.atendido
                                                ? "Atendido"
                                                : "Não atendido"
                                        }
                                    </span>

                                </div>
                            `
                        )
                        .join("")
                }

            </div>

        </section>
    `;
}


function renderizarExperienciasTalento(
    experiencias
) {
    if (!experiencias.length) {
        return `
            <p>
                Nenhuma experiência profissional cadastrada.
            </p>
        `;
    }

    return [...experiencias]
        .sort(
            (a, b) =>
                String(
                    b.dataInicio || ""
                ).localeCompare(
                    String(
                        a.dataInicio || ""
                    )
                )
        )
        .map(
            experiencia => `
                <div class="item-trajetoria-talento">

                    <strong>
                        ${
                            escaparHtmlTalentos(
                                experiencia.cargo
                            )
                        }
                    </strong>

                    <span>
                        ${
                            escaparHtmlTalentos(
                                experiencia.empresa
                            )
                        }
                        ·
                        ${
                            formatarPeriodoTalentos(
                                experiencia.dataInicio,
                                experiencia.dataFim,
                                experiencia.atual
                            )
                        }
                    </span>

                    ${
                        experiencia.descricao
                            ? `
                                <p>
                                    ${
                                        escaparHtmlTalentos(
                                            experiencia.descricao
                                        )
                                    }
                                </p>
                            `
                            : ""
                    }

                </div>
            `
        )
        .join("");
}


function renderizarFormacoesTalento(
    formacoes
) {
    if (!formacoes.length) {
        return `
            <p>
                Nenhuma formação acadêmica cadastrada.
            </p>
        `;
    }

    return formacoes
        .map(
            formacao => `
                <div class="item-trajetoria-talento">

                    <strong>
                        ${
                            escaparHtmlTalentos(
                                formacao.curso
                            )
                        }
                    </strong>

                    <span>
                        ${
                            escaparHtmlTalentos(
                                formacao.instituicao
                            )
                        }
                        ${
                            formacao.tipoFormacao
                                ? ` · ${
                                    escaparHtmlTalentos(
                                        formacao.tipoFormacao
                                    )
                                }`
                                : ""
                        }
                    </span>

                    ${
                        formacao.descricao
                            ? `
                                <p>
                                    ${
                                        escaparHtmlTalentos(
                                            formacao.descricao
                                        )
                                    }
                                </p>
                            `
                            : ""
                    }

                </div>
            `
        )
        .join("");
}


function renderizarProjetosTalento(
    projetos
) {
    if (!projetos.length) {
        return `
            <p>
                Nenhum projeto cadastrado.
            </p>
        `;
    }

    return projetos
        .map(
            projeto => `
                <div class="item-trajetoria-talento">

                    <strong>
                        ${
                            escaparHtmlTalentos(
                                projeto.nome
                            )
                        }
                    </strong>

                    ${
                        projeto.tecnologias
                            ? `
                                <span>
                                    ${
                                        escaparHtmlTalentos(
                                            projeto.tecnologias
                                        )
                                    }
                                </span>
                            `
                            : ""
                    }

                    ${
                        projeto.descricao
                            ? `
                                <p>
                                    ${
                                        escaparHtmlTalentos(
                                            projeto.descricao
                                        )
                                    }
                                </p>
                            `
                            : ""
                    }

                </div>
            `
        )
        .join("");
}


function renderizarFotoTalento(
    talento,
    grande
) {
    const classe =
        grande
            ? "foto-talento-grande"
            : "foto-talento";

    if (
        talento.perfil.fotoUrl
    ) {
        return `
            <div class="${classe}">
                <img
                    src="${
                        obterUrlBackendTalentos(
                            talento.perfil.fotoUrl
                        )
                    }"
                    alt="Foto de ${
                        escaparHtmlTalentos(
                            talento.usuario.nome
                        )
                    }"
                >
            </div>
        `;
    }

    return `
        <div class="${classe}">
            ${
                escaparHtmlTalentos(
                    obterInicialTalentos(
                        talento.usuario.nome
                    )
                )
            }
        </div>
    `;
}


async function copiarContatoTalento(
    talento
) {
    const email =
        talento.usuario.email;

    if (!email) {
        mostrarMensagemTalentos(
            "Este profissional não possui contato disponível."
        );

        return;
    }

    try {
        await navigator.clipboard.writeText(
            email
        );

        mostrarMensagemTalentos(
            `Contato copiado: ${email}`
        );

    } catch (erro) {
        mostrarMensagemTalentos(
            `Contato: ${email}`
        );
    }
}


function visualizarCurriculoTalento(
    talento
) {
    if (
        !talento.perfil.curriculoUrl
    ) {
        mostrarMensagemTalentos(
            "Este profissional não possui currículo disponível."
        );

        return;
    }

    const url =
        `${API_BASE_URL}` +
        `/perfis-profissionais/` +
        `${talento.perfil.id}` +
        `/curriculo`;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


function obterUrlBackendTalentos(
    caminho
) {
    if (
        caminho.startsWith(
            "http://"
        ) ||
        caminho.startsWith(
            "https://"
        )
    ) {
        return caminho;
    }

    const origemBackend =
        API_BASE_URL.replace(
            /\/api$/,
            ""
        );

    return (
        `${origemBackend}${caminho}`
    );
}


function obterPesoNivelHabilidade(
    valor
) {
    const niveis = {
        basico: 1,
        básico: 1,
        intermediario: 2,
        intermediário: 2,
        avancado: 3,
        avançado: 3,
        especialista: 4,
    };

    return (
        niveis[
            normalizarTextoTalentos(
                valor
            )
        ] || 0
    );
}


function valoresUnicosTalentos(
    valores
) {
    return [
        ...new Set(
            valores.filter(Boolean)
        ),
    ].sort(
        (a, b) =>
            String(a).localeCompare(
                String(b),
                "pt-BR"
            )
    );
}


function normalizarTextoTalentos(
    valor
) {
    return String(
        valor || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


function formatarNivelExperienciaTalentos(
    valor
) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return (
        valores[valor] ||
        "Nível não informado"
    );
}


function formatarModalidadeTalentos(
    valor
) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return (
        valores[valor] ||
        "Modalidade não informada"
    );
}


function formatarNivelHabilidadeTalentos(
    valor
) {
    const valores = {
        basico: "Básico",
        intermediario: "Intermediário",
        avancado: "Avançado",
        especialista: "Especialista",
    };

    return (
        valores[valor] ||
        valor ||
        "Não informado"
    );
}


function formatarStatusVagaTalentos(
    valor
) {
    const valores = {
        ativa: "Ativa",
        pausada: "Pausada",
        encerrada: "Encerrada",
    };

    return (
        valores[valor] ||
        valor
    );
}


function formatarPeriodoTalentos(
    inicio,
    fim,
    atual
) {
    const inicioFormatado =
        formatarMesAnoTalentos(
            inicio
        );

    const fimFormatado =
        atual
            ? "Atual"
            : formatarMesAnoTalentos(
                fim
            );

    if (
        inicioFormatado &&
        fimFormatado
    ) {
        return (
            `${inicioFormatado} — ` +
            fimFormatado
        );
    }

    return (
        inicioFormatado ||
        fimFormatado ||
        "Período não informado"
    );
}


function formatarMesAnoTalentos(
    valor
) {
    if (!valor) {
        return "";
    }

    const partes =
        valor.split("-");

    if (partes.length < 2) {
        return valor;
    }

    return `${partes[1]}/${partes[0]}`;
}


function obterInicialTalentos(
    nome
) {
    return String(
        nome || "P"
    )
        .trim()
        .charAt(0)
        .toUpperCase();
}


function escaparHtmlTalentos(
    valor
) {
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


function mostrarMensagemTalentos(
    mensagem
) {
    const elemento =
        document.getElementById(
            "mensagem-talentos"
        );

    clearTimeout(
        temporizadorMensagemTalentos
    );

    elemento.textContent =
        mensagem;

    elemento.classList.add(
        "visivel"
    );

    temporizadorMensagemTalentos =
        setTimeout(
            () => {
                elemento.classList.remove(
                    "visivel"
                );
            },
            3200
        );
}