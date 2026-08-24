let alertasMercado = [];
let notificacoesMercado = [];
let tendenciasMercado = [];

let usuarioAtualMercado = null;

let alertaEmEdicaoId = null;
let notificacaoEmEdicaoId = null;
let tendenciaEmEdicaoId = null;

let temporizadorMensagemMercado = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaMercado
);


async function iniciarPaginaMercado() {
    registrarEventosMercado();

    await carregarDadosMercado();
}


function registrarEventosMercado() {
    document
        .getElementById("botao-novo-alerta")
        .addEventListener(
            "click",
            abrirNovoAlerta
        );

    document
        .getElementById("botao-nova-notificacao")
        .addEventListener(
            "click",
            abrirNovaNotificacao
        );

    document
        .getElementById("botao-nova-tendencia")
        .addEventListener(
            "click",
            abrirNovaTendencia
        );

    document
        .getElementById("formulario-alerta")
        .addEventListener(
            "submit",
            salvarAlerta
        );

    document
        .getElementById("formulario-notificacao")
        .addEventListener(
            "submit",
            salvarNotificacao
        );

    document
        .getElementById("formulario-tendencia")
        .addEventListener(
            "submit",
            salvarTendencia
        );

    document
        .getElementById("lista-alertas")
        .addEventListener(
            "click",
            tratarAcaoAlerta
        );

    document
        .getElementById("lista-notificacoes")
        .addEventListener(
            "click",
            tratarAcaoNotificacao
        );

    document
        .getElementById("lista-tendencias")
        .addEventListener(
            "click",
            tratarAcaoTendencia
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


async function carregarDadosMercado() {
    try {
        const [
            sessao,
            alertas,
            notificacoes,
            tendencias,
        ] = await Promise.all([
            apiRequest("/autenticacao/sessao"),
            apiRequest("/alertas-vaga"),
            apiRequest("/notificacoes"),
            apiRequest("/tendencias-mercado"),
        ]);

        if (
            !sessao.autenticado ||
            !sessao.usuario
        ) {
            window.location.href =
                "./login.html";

            return;
        }

        usuarioAtualMercado =
            sessao.usuario;

        alertasMercado =
            alertas.filter(
                alerta =>
                    alerta.usuarioId ===
                    usuarioAtualMercado.id
            );

        const idsAlertas =
            new Set(
                alertasMercado.map(
                    alerta => alerta.id
                )
            );

        notificacoesMercado =
            notificacoes.filter(
                notificacao =>
                    idsAlertas.has(
                        notificacao.alertaVagaId
                    )
            );

        tendenciasMercado =
            tendencias;

        renderizarMercado();

    } catch (erro) {
        console.error(erro);

        mostrarMensagemMercado(
            erro.message ||
            "Não foi possível carregar os dados.",
            "erro"
        );
    }
}


function renderizarMercado() {
    renderizarAlertas();
    renderizarNotificacoes();
    renderizarTendencias();
}


function renderizarAlertas() {
    const conteiner =
        document.getElementById(
            "lista-alertas"
        );

    if (!alertasMercado.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhum alerta cadastrado.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        alertasMercado
            .map(alerta => `
                <article class="item-gerenciamento">

                    <div class="topo-item">
                        <div>
                            <strong>
                                ${escaparHtmlMercado(
                                    alerta.palavraChave ||
                                    "Alerta sem palavra-chave"
                                )}
                            </strong>

                            <span>
                                ${
                                    alerta.ativo
                                        ? "Ativo"
                                        : "Inativo"
                                }
                            </span>
                        </div>
                    </div>

                    <div class="detalhes-item">
                        <span>
                            ${escaparHtmlMercado(
                                alerta.cidade ||
                                "Cidade não informada"
                            )}
                        </span>

                        <span>
                            ${formatarModalidadeMercado(
                                alerta.modalidade
                            )}
                        </span>

                        <span>
                            ${formatarNivelMercado(
                                alerta.nivelExperiencia
                            )}
                        </span>
                    </div>

                    <div class="acoes-item">
                        <button
                            class="botao-pequeno"
                            data-editar-alerta="${alerta.id}"
                            type="button"
                        >
                            Editar
                        </button>

                        <button
                            class="botao-pequeno perigo"
                            data-excluir-alerta="${alerta.id}"
                            type="button"
                        >
                            Excluir
                        </button>
                    </div>

                </article>
            `)
            .join("");
}


function abrirNovoAlerta() {
    alertaEmEdicaoId = null;

    document.getElementById(
        "formulario-alerta"
    ).reset();

    document.getElementById(
        "alerta-ativo"
    ).checked = true;

    document.getElementById(
        "titulo-modal-alerta"
    ).textContent =
        "Novo alerta";

    document.getElementById(
        "modal-alerta"
    ).showModal();
}


function tratarAcaoAlerta(evento) {
    const editar =
        evento.target.closest(
            "[data-editar-alerta]"
        );

    if (editar) {
        editarAlerta(
            Number(
                editar.dataset.editarAlerta
            )
        );

        return;
    }

    const excluir =
        evento.target.closest(
            "[data-excluir-alerta]"
        );

    if (excluir) {
        excluirAlerta(
            Number(
                excluir.dataset.excluirAlerta
            )
        );
    }
}


function editarAlerta(id) {
    const alerta =
        alertasMercado.find(
            item => item.id === id
        );

    if (!alerta) {
        return;
    }

    alertaEmEdicaoId = id;

    document.getElementById(
        "titulo-modal-alerta"
    ).textContent =
        "Editar alerta";

    document.getElementById(
        "alerta-palavra"
    ).value =
        alerta.palavraChave || "";

    document.getElementById(
        "alerta-cidade"
    ).value =
        alerta.cidade || "";

    document.getElementById(
        "alerta-modalidade"
    ).value =
        alerta.modalidade || "";

    document.getElementById(
        "alerta-nivel"
    ).value =
        alerta.nivelExperiencia || "";

    document.getElementById(
        "alerta-ativo"
    ).checked =
        alerta.ativo;

    document.getElementById(
        "modal-alerta"
    ).showModal();
}


async function salvarAlerta(evento) {
    evento.preventDefault();

    const dados = {
        palavraChave:
            document.getElementById(
                "alerta-palavra"
            ).value.trim(),

        cidade:
            document.getElementById(
                "alerta-cidade"
            ).value.trim(),

        ativo:
            document.getElementById(
                "alerta-ativo"
            ).checked,
    };

    const modalidade =
        document.getElementById(
            "alerta-modalidade"
        ).value;

    const nivel =
        document.getElementById(
            "alerta-nivel"
        ).value;

    if (modalidade) {
        dados.modalidade = modalidade;
    }

    if (nivel) {
        dados.nivelExperiencia = nivel;
    }

    try {
        if (alertaEmEdicaoId) {
            await apiRequest(
                `/alertas-vaga/${alertaEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados),
                }
            );
        } else {
            dados.usuarioId =
                usuarioAtualMercado.id;

            await apiRequest(
                "/alertas-vaga",
                {
                    method: "POST",
                    body: JSON.stringify(dados),
                }
            );
        }

        document.getElementById(
            "modal-alerta"
        ).close();

        mostrarMensagemMercado(
            "Alerta salvo com sucesso.",
            "sucesso"
        );

        await carregarDadosMercado();

    } catch (erro) {
        mostrarMensagemMercado(
            erro.message,
            "erro"
        );
    }
}


async function excluirAlerta(id) {
    if (!confirm("Excluir este alerta?")) {
        return;
    }

    try {
        await apiRequest(
            `/alertas-vaga/${id}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagemMercado(
            "Alerta excluído.",
            "sucesso"
        );

        await carregarDadosMercado();

    } catch (erro) {
        mostrarMensagemMercado(
            erro.message,
            "erro"
        );
    }
}


function renderizarNotificacoes() {
    const conteiner =
        document.getElementById(
            "lista-notificacoes"
        );

    if (!notificacoesMercado.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma notificação cadastrada.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        notificacoesMercado
            .map(notificacao => `
                <article class="item-gerenciamento">

                    <div class="topo-item">
                        <div>
                            <strong>
                                ${escaparHtmlMercado(
                                    notificacao.titulo
                                )}
                            </strong>

                            <span>
                                ${
                                    notificacao.lida
                                        ? "Lida"
                                        : "Não lida"
                                }
                            </span>
                        </div>
                    </div>

                    <div class="detalhes-item">
                        <span>
                            ${escaparHtmlMercado(
                                notificacao.mensagem
                            )}
                        </span>

                        <span>
                            ${formatarDataMercado(
                                notificacao.dataEnvio
                            )}
                        </span>
                    </div>

                    <div class="acoes-item">
                        <button
                            class="botao-pequeno"
                            data-editar-notificacao="${notificacao.id}"
                            type="button"
                        >
                            Editar
                        </button>

                        <button
                            class="botao-pequeno perigo"
                            data-excluir-notificacao="${notificacao.id}"
                            type="button"
                        >
                            Excluir
                        </button>
                    </div>

                </article>
            `)
            .join("");
}


function preencherAlertasNotificacao() {
    const seletor =
        document.getElementById(
            "notificacao-alerta"
        );

    seletor.innerHTML =
        alertasMercado
            .map(alerta => `
                <option value="${alerta.id}">
                    ${escaparHtmlMercado(
                        alerta.palavraChave ||
                        `Alerta ${alerta.id}`
                    )}
                </option>
            `)
            .join("");
}


function abrirNovaNotificacao() {
    if (!alertasMercado.length) {
        mostrarMensagemMercado(
            "Crie primeiro um alerta de vaga.",
            "erro"
        );

        return;
    }

    notificacaoEmEdicaoId = null;

    document.getElementById(
        "formulario-notificacao"
    ).reset();

    preencherAlertasNotificacao();

    document.getElementById(
        "notificacao-alerta"
    ).disabled = false;

    document.getElementById(
        "titulo-modal-notificacao"
    ).textContent =
        "Nova notificação";

    document.getElementById(
        "modal-notificacao"
    ).showModal();
}


function tratarAcaoNotificacao(evento) {
    const editar =
        evento.target.closest(
            "[data-editar-notificacao]"
        );

    if (editar) {
        editarNotificacao(
            Number(
                editar.dataset
                    .editarNotificacao
            )
        );

        return;
    }

    const excluir =
        evento.target.closest(
            "[data-excluir-notificacao]"
        );

    if (excluir) {
        excluirNotificacao(
            Number(
                excluir.dataset
                    .excluirNotificacao
            )
        );
    }
}


function editarNotificacao(id) {
    const notificacao =
        notificacoesMercado.find(
            item => item.id === id
        );

    if (!notificacao) {
        return;
    }

    notificacaoEmEdicaoId = id;

    preencherAlertasNotificacao();

    document.getElementById(
        "titulo-modal-notificacao"
    ).textContent =
        "Editar notificação";

    document.getElementById(
        "notificacao-alerta"
    ).value =
        notificacao.alertaVagaId;

    document.getElementById(
        "notificacao-alerta"
    ).disabled = true;

    document.getElementById(
        "notificacao-titulo"
    ).value =
        notificacao.titulo;

    document.getElementById(
        "notificacao-mensagem"
    ).value =
        notificacao.mensagem;

    document.getElementById(
        "notificacao-lida"
    ).checked =
        notificacao.lida;

    document.getElementById(
        "modal-notificacao"
    ).showModal();
}


async function salvarNotificacao(evento) {
    evento.preventDefault();

    const dados = {
        titulo:
            document.getElementById(
                "notificacao-titulo"
            ).value.trim(),

        mensagem:
            document.getElementById(
                "notificacao-mensagem"
            ).value.trim(),

        lida:
            document.getElementById(
                "notificacao-lida"
            ).checked,
    };

    try {
        if (notificacaoEmEdicaoId) {
            await apiRequest(
                `/notificacoes/${notificacaoEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados),
                }
            );
        } else {
            dados.alertaVagaId =
                Number(
                    document.getElementById(
                        "notificacao-alerta"
                    ).value
                );

            await apiRequest(
                "/notificacoes",
                {
                    method: "POST",
                    body: JSON.stringify(dados),
                }
            );
        }

        document.getElementById(
            "modal-notificacao"
        ).close();

        mostrarMensagemMercado(
            "Notificação salva com sucesso.",
            "sucesso"
        );

        await carregarDadosMercado();

    } catch (erro) {
        mostrarMensagemMercado(
            erro.message,
            "erro"
        );
    }
}


async function excluirNotificacao(id) {
    if (!confirm("Excluir esta notificação?")) {
        return;
    }

    try {
        await apiRequest(
            `/notificacoes/${id}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagemMercado(
            "Notificação excluída.",
            "sucesso"
        );

        await carregarDadosMercado();

    } catch (erro) {
        mostrarMensagemMercado(
            erro.message,
            "erro"
        );
    }
}


function renderizarTendencias() {
    const conteiner =
        document.getElementById(
            "lista-tendencias"
        );

    if (!tendenciasMercado.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma tendência cadastrada.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        tendenciasMercado
            .map(tendencia => `
                <article class="item-gerenciamento">

                    <div class="topo-item">
                        <div>
                            <strong>
                                ${escaparHtmlMercado(
                                    tendencia.cargo
                                )}
                            </strong>

                            <span>
                                ${escaparHtmlMercado(
                                    tendencia.tecnologia
                                )}
                            </span>
                        </div>
                    </div>

                    <div class="detalhes-item">
                        <span>
                            Demanda:
                            ${
                                tendencia.demanda ??
                                "Não informada"
                            }
                        </span>

                        <span>
                            Salário médio:
                            ${formatarMoedaMercado(
                                tendencia.mediaSalarial
                            )}
                        </span>

                        <span>
                            Atualização:
                            ${formatarDataMercado(
                                tendencia.dataAtualizacao
                            )}
                        </span>
                    </div>

                    <div class="acoes-item">
                        <button
                            class="botao-pequeno"
                            data-editar-tendencia="${tendencia.id}"
                            type="button"
                        >
                            Editar
                        </button>

                        <button
                            class="botao-pequeno perigo"
                            data-excluir-tendencia="${tendencia.id}"
                            type="button"
                        >
                            Excluir
                        </button>
                    </div>

                </article>
            `)
            .join("");
}


function abrirNovaTendencia() {
    tendenciaEmEdicaoId = null;

    document.getElementById(
        "formulario-tendencia"
    ).reset();

    document.getElementById(
        "titulo-modal-tendencia"
    ).textContent =
        "Nova tendência";

    document.getElementById(
        "modal-tendencia"
    ).showModal();
}


function tratarAcaoTendencia(evento) {
    const editar =
        evento.target.closest(
            "[data-editar-tendencia]"
        );

    if (editar) {
        editarTendencia(
            Number(
                editar.dataset
                    .editarTendencia
            )
        );

        return;
    }

    const excluir =
        evento.target.closest(
            "[data-excluir-tendencia]"
        );

    if (excluir) {
        excluirTendencia(
            Number(
                excluir.dataset
                    .excluirTendencia
            )
        );
    }
}


function editarTendencia(id) {
    const tendencia =
        tendenciasMercado.find(
            item => item.id === id
        );

    if (!tendencia) {
        return;
    }

    tendenciaEmEdicaoId = id;

    document.getElementById(
        "titulo-modal-tendencia"
    ).textContent =
        "Editar tendência";

    document.getElementById(
        "tendencia-cargo"
    ).value =
        tendencia.cargo;

    document.getElementById(
        "tendencia-tecnologia"
    ).value =
        tendencia.tecnologia;

    document.getElementById(
        "tendencia-demanda"
    ).value =
        tendencia.demanda ?? "";

    document.getElementById(
        "tendencia-salario"
    ).value =
        tendencia.mediaSalarial ?? "";

    document.getElementById(
        "modal-tendencia"
    ).showModal();
}


async function salvarTendencia(evento) {
    evento.preventDefault();

    const dados = {
        cargo:
            document.getElementById(
                "tendencia-cargo"
            ).value.trim(),

        tecnologia:
            document.getElementById(
                "tendencia-tecnologia"
            ).value.trim(),
    };

    const demanda =
        document.getElementById(
            "tendencia-demanda"
        ).value;

    const salario =
        document.getElementById(
            "tendencia-salario"
        ).value;

    if (demanda !== "") {
        dados.demanda =
            Number(demanda);
    }

    if (salario !== "") {
        dados.mediaSalarial =
            Number(salario);
    }

    try {
        if (tendenciaEmEdicaoId) {
            await apiRequest(
                `/tendencias-mercado/${tendenciaEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados),
                }
            );
        } else {
            await apiRequest(
                "/tendencias-mercado",
                {
                    method: "POST",
                    body: JSON.stringify(dados),
                }
            );
        }

        document.getElementById(
            "modal-tendencia"
        ).close();

        mostrarMensagemMercado(
            "Tendência salva com sucesso.",
            "sucesso"
        );

        await carregarDadosMercado();

    } catch (erro) {
        mostrarMensagemMercado(
            erro.message,
            "erro"
        );
    }
}


async function excluirTendencia(id) {
    if (!confirm("Excluir esta tendência?")) {
        return;
    }

    try {
        await apiRequest(
            `/tendencias-mercado/${id}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagemMercado(
            "Tendência excluída.",
            "sucesso"
        );

        await carregarDadosMercado();

    } catch (erro) {
        mostrarMensagemMercado(
            erro.message,
            "erro"
        );
    }
}


function formatarModalidadeMercado(valor) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return valores[valor] ||
        "Modalidade não informada";
}


function formatarNivelMercado(valor) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return valores[valor] ||
        "Experiência não informada";
}


function formatarDataMercado(data) {
    if (!data) {
        return "Não informada";
    }

    const partes = data.split("-");

    return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : data;
}


function formatarMoedaMercado(valor) {
    if (
        valor === null ||
        valor === undefined
    ) {
        return "Não informado";
    }

    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            }
        );
}


function escaparHtmlMercado(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarMensagemMercado(
    texto,
    tipo = ""
) {
    const elemento =
        document.getElementById(
            "mensagem"
        );

    clearTimeout(
        temporizadorMensagemMercado
    );

    elemento.textContent = texto;

    elemento.className =
        `mensagem ${tipo}`;

    temporizadorMensagemMercado =
        setTimeout(
            () => {
                elemento.classList.add(
                    "oculto"
                );
            },
            3500
        );
}