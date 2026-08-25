let usuarioMercado = null;

let vagasMercado = [];
let empresasMercado = [];
let requisitosMercado = [];
let habilidadesMercado = [];
let tendenciasMercado = [];

let perfilMercado = null;
let habilidadesPerfilMercado = [];


document.addEventListener(
    "DOMContentLoaded",
    iniciarMercado
);


async function iniciarMercado() {
    try {
        const [
            sessao,
            vagas,
            empresas,
            requisitos,
            habilidades,
            tendencias,
            perfis,
            perfisHabilidades,
        ] = await Promise.all([
            apiRequest("/autenticacao/sessao"),
            apiRequest("/vagas"),
            apiRequest("/empresas"),
            apiRequest("/requisitos-vaga"),
            apiRequest("/habilidades"),
            apiRequest("/tendencias-mercado"),
            apiRequest("/perfis-profissionais"),
            apiRequest("/perfil-habilidades"),
        ]);


        if (
            !sessao.autenticado ||
            !sessao.usuario
        ) {
            window.location.href =
                "./login.html";

            return;
        }


        usuarioMercado =
            sessao.usuario;

        vagasMercado =
            vagas;

        empresasMercado =
            empresas;

        requisitosMercado =
            requisitos;

        habilidadesMercado =
            habilidades;

        tendenciasMercado =
            tendencias;


        perfilMercado =
            perfis.find(
                perfil =>
                    perfil.usuarioId ===
                    usuarioMercado.id
            ) || null;


        if (perfilMercado) {
            habilidadesPerfilMercado =
                perfisHabilidades.filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfilMercado.id
                );
        }


        renderizarMercado();

    } catch (erro) {
        console.error(
            "Erro ao carregar Mercado:",
            erro
        );

        mostrarErroMercado();
    }
}


function renderizarMercado() {
    atualizarMetricas();
    renderizarDemanda();
    renderizarInsights();
    renderizarTendencias();
    renderizarVagasRecentes();
}


function obterVagasAtivas() {
    return vagasMercado.filter(
        vaga =>
            vaga.status === "ativa"
    );
}


function atualizarMetricas() {
    const vagasAtivas =
        obterVagasAtivas();


    const idsVagasAtivas =
        new Set(
            vagasAtivas.map(
                vaga => vaga.id
            )
        );


    const habilidadesDemandadas =
        new Set(
            requisitosMercado
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


    const tecnologias =
        new Set(
            tendenciasMercado
                .map(
                    item =>
                        item.tecnologia
                            ?.trim()
                            .toLowerCase()
                )
                .filter(Boolean)
        );


    document.getElementById(
        "total-vagas"
    ).textContent =
        vagasAtivas.length;


    document.getElementById(
        "total-habilidades"
    ).textContent =
        habilidadesDemandadas.size;


    document.getElementById(
        "total-empresas"
    ).textContent =
        empresasMercado.length;


    document.getElementById(
        "total-tecnologias"
    ).textContent =
        tecnologias.size;
}


function renderizarDemanda() {
    const conteiner =
        document.getElementById(
            "lista-habilidades-demanda"
        );


    const vagasAtivas =
        obterVagasAtivas();


    const idsVagasAtivas =
        new Set(
            vagasAtivas.map(
                vaga => vaga.id
            )
        );


    const contagem =
        new Map();


    requisitosMercado
        .filter(
            requisito =>
                idsVagasAtivas.has(
                    requisito.vagaId
                )
        )
        .forEach(requisito => {

            const atual =
                contagem.get(
                    requisito.habilidadeId
                ) || 0;

            contagem.set(
                requisito.habilidadeId,
                atual + 1
            );
        });


    const ranking =
        [...contagem.entries()]
            .map(
                ([habilidadeId, quantidade]) => {

                    const habilidade =
                        habilidadesMercado.find(
                            item =>
                                item.id ===
                                habilidadeId
                        );

                    return {
                        nome:
                            habilidade?.nome ||
                            "Habilidade",
                        quantidade,
                    };
                }
            )
            .sort(
                (a, b) =>
                    b.quantidade -
                    a.quantidade
            )
            .slice(0, 5);


    if (!ranking.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Ainda não existem requisitos suficientes
                para calcular a demanda.
            </div>
        `;

        return;
    }


    const maiorValor =
        ranking[0].quantidade;


    conteiner.innerHTML =
        ranking
            .map(item => {

                const largura =
                    (
                        item.quantidade /
                        maiorValor
                    ) * 100;

                return `
                    <div class="item-demanda">

                        <span class="nome-demanda">
                            ${escaparHtmlMercado(
                                item.nome
                            )}
                        </span>

                        <div class="barra-demanda">
                            <span
                                style="width: ${largura}%"
                            ></span>
                        </div>

                        <span class="valor-demanda">
                            ${item.quantidade}
                        </span>

                    </div>
                `;
            })
            .join("");
}


function renderizarInsights() {
    const conteiner =
        document.getElementById(
            "insights-perfil"
        );


    const vagasAtivas =
        obterVagasAtivas();


    if (!perfilMercado) {
        conteiner.innerHTML = `
            <div class="insight">

                <span class="icone-insight">
                    !
                </span>

                <div>
                    <strong>
                        Complete seu perfil profissional
                    </strong>

                    <p>
                        Um perfil completo permitirá que o
                        Market Skills ofereça análises mais
                        personalizadas.
                    </p>
                </div>

            </div>

            <div class="insight">

                <span class="icone-insight">
                    ↗
                </span>

                <div>
                    <strong>
                        ${vagasAtivas.length} vagas ativas
                    </strong>

                    <p>
                        Explore as oportunidades disponíveis
                        atualmente na plataforma.
                    </p>
                </div>

            </div>
        `;

        return;
    }


    const habilidadesUsuario =
        new Set(
            habilidadesPerfilMercado.map(
                item =>
                    item.habilidadeId
            )
        );


    const contagemDemanda =
        new Map();


    const idsVagasAtivas =
        new Set(
            vagasAtivas.map(
                vaga => vaga.id
            )
        );


    requisitosMercado
        .filter(
            requisito =>
                idsVagasAtivas.has(
                    requisito.vagaId
                )
        )
        .forEach(requisito => {

            const atual =
                contagemDemanda.get(
                    requisito.habilidadeId
                ) || 0;

            contagemDemanda.set(
                requisito.habilidadeId,
                atual + 1
            );
        });


    const recomendacao =
        [...contagemDemanda.entries()]
            .filter(
                ([habilidadeId]) =>
                    !habilidadesUsuario.has(
                        habilidadeId
                    )
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    let habilidadeRecomendada =
        null;


    if (recomendacao) {
        habilidadeRecomendada =
            habilidadesMercado.find(
                habilidade =>
                    habilidade.id ===
                    recomendacao[0]
            );
    }


    let html = `
        <div class="insight">

            <span class="icone-insight">
                ✓
            </span>

            <div>
                <strong>
                    Perfil conectado ao mercado
                </strong>

                <p>
                    Você possui
                    ${habilidadesPerfilMercado.length}
                    habilidade(s) registrada(s) no seu perfil.
                </p>
            </div>

        </div>


        <div class="insight">

            <span class="icone-insight">
                ↗
            </span>

            <div>
                <strong>
                    ${vagasAtivas.length}
                    oportunidade(s) ativa(s)
                </strong>

                <p>
                    Novas vagas podem ser comparadas com
                    suas competências profissionais.
                </p>
            </div>

        </div>
    `;


    if (habilidadeRecomendada) {
        html += `
            <div class="insight">

                <span class="icone-insight">
                    +
                </span>

                <div>
                    <strong>
                        Acompanhe:
                        ${escaparHtmlMercado(
                            habilidadeRecomendada.nome
                        )}
                    </strong>

                    <p>
                        Essa habilidade aparece entre as
                        demandas atuais e ainda não está
                        registrada no seu perfil.
                    </p>
                </div>

            </div>
        `;
    }


    conteiner.innerHTML =
        html;
}


function renderizarTendencias() {
    const conteiner =
        document.getElementById(
            "lista-tendencias"
        );


    const tendencias =
        [...tendenciasMercado]
            .sort(
                (a, b) =>
                    Number(b.demanda || 0) -
                    Number(a.demanda || 0)
            )
            .slice(0, 5);


    if (!tendencias.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma tendência de mercado
                disponível no momento.
            </div>
        `;

        return;
    }


    conteiner.innerHTML =
        tendencias
            .map(tendencia => `

                <div class="item-tendencia-mercado">

                    <div>

                        <strong>
                            ${escaparHtmlMercado(
                                tendencia.tecnologia ||
                                tendencia.cargo ||
                                "Tendência"
                            )}
                        </strong>

                        <small>
                            ${escaparHtmlMercado(
                                tendencia.cargo ||
                                "Mercado de tecnologia"
                            )}
                        </small>

                    </div>

                    <span class="demanda-tendencia">
                        Demanda:
                        ${formatarDemanda(
                            tendencia.demanda
                        )}
                    </span>

                </div>

            `)
            .join("");
}


function renderizarVagasRecentes() {
    const conteiner =
        document.getElementById(
            "lista-vagas-recentes"
        );


    const vagas =
        obterVagasAtivas()
            .sort(
                (a, b) =>
                    new Date(
                        b.dataPublicacao || 0
                    ) -
                    new Date(
                        a.dataPublicacao || 0
                    )
            )
            .slice(0, 4);


    if (!vagas.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga ativa disponível agora.
            </div>
        `;

        return;
    }


    conteiner.innerHTML =
        vagas
            .map(vaga => {

                const empresa =
                    empresasMercado.find(
                        item =>
                            item.id ===
                            vaga.empresaId
                    );


                return `
                    <div class="vaga-mercado">

                        <div>

                            <strong>
                                ${escaparHtmlMercado(
                                    vaga.titulo
                                )}
                            </strong>

                            <small>
                                ${escaparHtmlMercado(
                                    empresa?.nome ||
                                    "Empresa"
                                )}
                            </small>

                        </div>

                        <span class="tag-modalidade">
                            ${formatarModalidade(
                                vaga.modalidade
                            )}
                        </span>

                    </div>
                `;
            })
            .join("");
}


function formatarModalidade(valor) {
    const modalidades = {
        remoto: "Remoto",
        presencial: "Presencial",
        hibrido: "Híbrido",
    };

    return modalidades[valor] ||
        "Não informada";
}


function formatarDemanda(valor) {
    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return new Intl.NumberFormat(
        "pt-BR",
        {
            maximumFractionDigits: 0,
        }
    ).format(numero);
}


function escaparHtmlMercado(valor) {
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


function mostrarErroMercado() {
    [
        "lista-habilidades-demanda",
        "insights-perfil",
        "lista-tendencias",
        "lista-vagas-recentes",
    ].forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.innerHTML = `
                <div class="estado-vazio">
                    Não foi possível carregar
                    os dados agora.
                </div>
            `;
        }
    });
}