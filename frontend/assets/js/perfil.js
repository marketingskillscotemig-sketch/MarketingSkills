let usuarioPaginaPerfil = null;
let perfilPaginaPerfil = null;

let habilidadesPaginaPerfil = [];
let perfilHabilidadesPaginaPerfil = [];
let experienciasPaginaPerfil = [];
let formacoesPaginaPerfil = [];
let projetosPaginaPerfil = [];

let experienciaEmEdicaoId = null;
let formacaoEmEdicaoId = null;
let projetoEmEdicaoId = null;

let temporizadorMensagemPerfil = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaPerfil
);


async function iniciarPaginaPerfil() {
    registrarEventosPerfil();

    await carregarDadosPerfil();
}


function registrarEventosPerfil() {
    document
        .getElementById("botao-criar-perfil")
        .addEventListener(
            "click",
            () => abrirModalPerfil(true)
        );

    document
        .getElementById("botao-editar-perfil")
        .addEventListener(
            "click",
            () => abrirModalPerfil(false)
        );

    document
        .getElementById("formulario-perfil")
        .addEventListener(
            "submit",
            salvarPerfil
        );

    document
        .getElementById("botao-nova-experiencia")
        .addEventListener(
            "click",
            () => abrirModalExperiencia()
        );

    document
        .getElementById("formulario-experiencia")
        .addEventListener(
            "submit",
            salvarExperiencia
        );

    document
        .getElementById("lista-experiencias")
        .addEventListener(
            "click",
            tratarAcaoExperiencia
        );

    document
        .getElementById("botao-nova-formacao")
        .addEventListener(
            "click",
            () => abrirModalFormacao()
        );

    document
        .getElementById("formulario-formacao")
        .addEventListener(
            "submit",
            salvarFormacao
        );

    document
        .getElementById("lista-formacoes")
        .addEventListener(
            "click",
            tratarAcaoFormacao
        );

    document
        .getElementById("botao-novo-projeto")
        .addEventListener(
            "click",
            () => abrirModalProjeto()
        );

    document
        .getElementById("formulario-projeto")
        .addEventListener(
            "submit",
            salvarProjeto
        );

    document
        .getElementById("lista-projetos")
        .addEventListener(
            "click",
            tratarAcaoProjeto
        );

    document
        .getElementById("botao-adicionar-habilidade")
        .addEventListener(
            "click",
            abrirModalHabilidade
        );

    document
        .getElementById("formulario-habilidade-perfil")
        .addEventListener(
            "submit",
            adicionarHabilidade
        );

    document
        .getElementById("lista-habilidades-perfil")
        .addEventListener(
            "click",
            tratarAcaoHabilidade
        );

    document
        .getElementById("experiencia-atual")
        .addEventListener(
            "change",
            atualizarCampoFimExperiencia
        );

    document
        .getElementById("formacao-em-andamento")
        .addEventListener(
            "change",
            atualizarCampoFimFormacao
        );

    document
        .querySelectorAll("[data-fechar]")
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => fecharModal(
                    botao.dataset.fechar
                )
            );
        });
}


async function carregarDadosPerfil() {
    mostrarCarregamento(true);

    try {
        const sessao = await apiRequest(
            "/autenticacao/sessao"
        );

        if (
            !sessao.autenticado ||
            !sessao.usuario
        ) {
            return;
        }

        usuarioPaginaPerfil = sessao.usuario;

        if (
            usuarioPaginaPerfil.tipoConta !==
            "estudante"
        ) {
            window.location.href =
                "../index.html";

            return;
        }

        const [
            perfis,
            habilidades,
            perfilHabilidades,
            experiencias,
            formacoes,
            projetos,
        ] = await Promise.all([
            apiRequest(
                "/perfis-profissionais"
            ),
            apiRequest(
                "/habilidades"
            ),
            apiRequest(
                "/perfil-habilidades"
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

        perfilPaginaPerfil =
            perfis.find(
                perfil =>
                    perfil.usuarioId ===
                    usuarioPaginaPerfil.id
            ) || null;

        habilidadesPaginaPerfil =
            habilidades || [];

        if (perfilPaginaPerfil) {
            const perfilId =
                perfilPaginaPerfil.id;

            perfilHabilidadesPaginaPerfil =
                perfilHabilidades.filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfilId
                );

            experienciasPaginaPerfil =
                experiencias.filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfilId
                );

            formacoesPaginaPerfil =
                formacoes.filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfilId
                );

            projetosPaginaPerfil =
                projetos.filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfilId
                );
        } else {
            perfilHabilidadesPaginaPerfil = [];
            experienciasPaginaPerfil = [];
            formacoesPaginaPerfil = [];
            projetosPaginaPerfil = [];
        }

        renderizarPaginaPerfil();

    } catch (erro) {
        console.error(erro);

        mostrarMensagemPerfil(
            erro.message ||
            "Não foi possível carregar seu perfil.",
            "erro"
        );

    } finally {
        mostrarCarregamento(false);
    }
}


function renderizarPaginaPerfil() {
    const semPerfil =
        document.getElementById(
            "perfil-nao-criado"
        );

    const conteudo =
        document.getElementById(
            "conteudo-perfil"
        );

    if (!perfilPaginaPerfil) {
        semPerfil.classList.remove(
            "oculto"
        );

        conteudo.classList.add(
            "oculto"
        );

        return;
    }

    semPerfil.classList.add(
        "oculto"
    );

    conteudo.classList.remove(
        "oculto"
    );

    renderizarIdentidade();
    renderizarSobreMim();
    renderizarExperiencias();
    renderizarFormacoes();
    renderizarProjetos();
    renderizarHabilidades();
    renderizarPreferencias();
}


function renderizarIdentidade() {
    document.getElementById(
        "nome-perfil"
    ).textContent =
        usuarioPaginaPerfil.nome;

    document.getElementById(
        "email-perfil"
    ).textContent =
        usuarioPaginaPerfil.email;

    document.getElementById(
        "objetivo-resumo"
    ).textContent =
        perfilPaginaPerfil
            .objetivoProfissional ||
        "Objetivo profissional não informado.";

    document.getElementById(
        "nivel-resumo"
    ).textContent =
        formatarNivelExperiencia(
            perfilPaginaPerfil
                .nivelExperiencia
        );

    document.getElementById(
        "modalidade-resumo"
    ).textContent =
        formatarModalidade(
            perfilPaginaPerfil
                .modalidadePreferida
        );

    document.getElementById(
        "localizacao-resumo"
    ).textContent =
        perfilPaginaPerfil
            .localizacaoPreferida ||
        "Localização não informada";

    renderizarFotoPerfil();
    renderizarCurriculo();
}


function renderizarFotoPerfil() {
    const imagem =
        document.getElementById(
            "imagem-perfil"
        );

    const inicial =
        document.getElementById(
            "inicial-perfil"
        );

    inicial.textContent =
        obterInicialPerfil(
            usuarioPaginaPerfil.nome
        );

    const fotoUrl =
        perfilPaginaPerfil.fotoUrl;

    if (!fotoUrl) {
        imagem.classList.add(
            "oculto"
        );

        inicial.classList.remove(
            "oculto"
        );

        imagem.removeAttribute(
            "src"
        );

        return;
    }

    let enderecoFoto = fotoUrl;

    if (
        !fotoUrl.startsWith("http://") &&
        !fotoUrl.startsWith("https://")
    ) {
        const origemBackend =
            API_BASE_URL.replace(
                /\/api$/,
                ""
            );

        enderecoFoto =
            `${origemBackend}${fotoUrl}`;
    }

    imagem.onload = () => {
        imagem.classList.remove(
            "oculto"
        );

        inicial.classList.add(
            "oculto"
        );
    };

    imagem.onerror = () => {
        imagem.classList.add(
            "oculto"
        );

        inicial.classList.remove(
            "oculto"
        );
    };

    imagem.src =
        `${enderecoFoto}${
            enderecoFoto.includes("?")
                ? "&"
                : "?"
        }v=${Date.now()}`;
}


function renderizarCurriculo() {
    const link =
        document.getElementById(
            "link-curriculo"
        );

    const curriculoUrl =
        perfilPaginaPerfil
            .curriculoUrl;

    if (!curriculoUrl) {
        link.classList.add(
            "oculto"
        );

        link.removeAttribute(
            "href"
        );

        return;
    }

    if (
        curriculoUrl.startsWith(
            "http://"
        ) ||
        curriculoUrl.startsWith(
            "https://"
        )
    ) {
        link.href =
            curriculoUrl;

    } else {
        const origemBackend =
            API_BASE_URL.replace(
                /\/api$/,
                ""
            );

        link.href =
            `${origemBackend}${curriculoUrl}`;
    }

    link.classList.remove(
        "oculto"
    );
}


function renderizarSobreMim() {
    document.getElementById(
        "texto-sobre-mim"
    ).textContent =
        perfilPaginaPerfil.sobreMim ||
        "Você ainda não adicionou uma apresentação ao seu perfil.";
}


function renderizarExperiencias() {
    const conteiner =
        document.getElementById(
            "lista-experiencias"
        );

    if (
        !experienciasPaginaPerfil.length
    ) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma experiência profissional adicionada.
            </div>
        `;

        return;
    }

    const experiencias =
        [...experienciasPaginaPerfil]
            .sort(
                (a, b) =>
                    obterTempoData(
                        b.dataInicio
                    ) -
                    obterTempoData(
                        a.dataInicio
                    )
            );

    conteiner.innerHTML =
        experiencias
            .map(experiencia => `
                <article class="item-trajetoria">

                    <span class="marcador-trajetoria"></span>

                    <div class="conteudo-trajetoria">

                        <h3>
                            ${escaparHtmlPerfil(
                                experiencia.cargo
                            )}
                        </h3>

                        <span class="instituicao-trajetoria">
                            ${escaparHtmlPerfil(
                                experiencia.empresa
                            )}
                        </span>

                        <span class="periodo-trajetoria">
                            ${formatarPeriodo(
                                experiencia.dataInicio,
                                experiencia.dataFim,
                                experiencia.atual,
                                "Atual"
                            )}
                        </span>

                        ${
                            experiencia.descricao
                                ? `
                                    <p class="descricao-trajetoria">
                                        ${escaparHtmlPerfil(
                                            experiencia.descricao
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <div class="acoes-item">

                        <button
                            type="button"
                            class="botao-acao-item"
                            data-editar-experiencia="${experiencia.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-acao-item perigo"
                            data-excluir-experiencia="${experiencia.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `)
            .join("");
}


function renderizarFormacoes() {
    const conteiner =
        document.getElementById(
            "lista-formacoes"
        );

    if (!formacoesPaginaPerfil.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma formação acadêmica adicionada.
            </div>
        `;

        return;
    }

    const formacoes =
        [...formacoesPaginaPerfil]
            .sort(
                (a, b) =>
                    obterTempoData(
                        b.dataInicio
                    ) -
                    obterTempoData(
                        a.dataInicio
                    )
            );

    conteiner.innerHTML =
        formacoes
            .map(formacao => `
                <article class="item-trajetoria">

                    <span class="marcador-trajetoria"></span>

                    <div class="conteudo-trajetoria">

                        <h3>
                            ${escaparHtmlPerfil(
                                formacao.curso
                            )}
                        </h3>

                        <span class="instituicao-trajetoria">
                            ${escaparHtmlPerfil(
                                formacao.instituicao
                            )}
                        </span>

                        <span class="periodo-trajetoria">
                            ${
                                formacao.tipoFormacao
                                    ? `${escaparHtmlPerfil(
                                        formacao.tipoFormacao
                                    )} · `
                                    : ""
                            }

                            ${formatarPeriodo(
                                formacao.dataInicio,
                                formacao.dataFim,
                                formacao.emAndamento,
                                "Em andamento"
                            )}
                        </span>

                        ${
                            formacao.descricao
                                ? `
                                    <p class="descricao-trajetoria">
                                        ${escaparHtmlPerfil(
                                            formacao.descricao
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <div class="acoes-item">

                        <button
                            type="button"
                            class="botao-acao-item"
                            data-editar-formacao="${formacao.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-acao-item perigo"
                            data-excluir-formacao="${formacao.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `)
            .join("");
}


function renderizarProjetos() {
    const conteiner =
        document.getElementById(
            "lista-projetos"
        );

    if (!projetosPaginaPerfil.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhum projeto ou atividade adicionado.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        projetosPaginaPerfil
            .map(projeto => `
                <article class="cartao-projeto">

                    <div class="cabecalho-projeto">

                        <h3>
                            ${escaparHtmlPerfil(
                                projeto.nome
                            )}
                        </h3>

                        <div class="acoes-item">

                            <button
                                type="button"
                                class="botao-acao-item"
                                data-editar-projeto="${projeto.id}"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="botao-acao-item perigo"
                                data-excluir-projeto="${projeto.id}"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>

                    ${
                        projeto.tecnologias
                            ? `
                                <p class="tecnologias-projeto">
                                    ${escaparHtmlPerfil(
                                        projeto.tecnologias
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <p class="descricao-projeto">
                        ${
                            projeto.descricao
                                ? escaparHtmlPerfil(
                                    projeto.descricao
                                )
                                : "Sem descrição cadastrada."
                        }
                    </p>

                    ${
                        projeto.link
                            ? `
                                <a
                                    href="${escaparAtributoPerfil(
                                        projeto.link
                                    )}"
                                    class="link-projeto"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Ver projeto
                                </a>
                            `
                            : ""
                    }

                </article>
            `)
            .join("");
}


function renderizarHabilidades() {
    const conteiner =
        document.getElementById(
            "lista-habilidades-perfil"
        );

    if (
        !perfilHabilidadesPaginaPerfil.length
    ) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma habilidade adicionada ao perfil.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        perfilHabilidadesPaginaPerfil
            .map(associacao => {
                const habilidade =
                    habilidadesPaginaPerfil
                        .find(
                            item =>
                                item.id ===
                                associacao.habilidadeId
                        );

                if (!habilidade) {
                    return "";
                }

                return `
                    <div class="item-habilidade-perfil">

                        <div class="dados-habilidade-perfil">

                            <strong>
                                ${escaparHtmlPerfil(
                                    habilidade.nome
                                )}
                            </strong>

                            <span>
                                ${formatarCategoriaHabilidade(
                                    habilidade.categoria
                                )}
                            </span>

                        </div>

                        <span class="nivel-habilidade">
                            ${formatarNivelHabilidade(
                                associacao.nivelDominio
                            )}
                        </span>

                        <button
                            type="button"
                            class="botao-remover-habilidade"
                            data-remover-habilidade="${associacao.id}"
                            title="Remover habilidade"
                        >
                            ×
                        </button>

                    </div>
                `;
            })
            .join("");
}


function renderizarPreferencias() {
    document.getElementById(
        "preferencia-modalidade"
    ).textContent =
        formatarModalidade(
            perfilPaginaPerfil
                .modalidadePreferida
        );

    document.getElementById(
        "preferencia-localizacao"
    ).textContent =
        perfilPaginaPerfil
            .localizacaoPreferida ||
        "Não informada";

    document.getElementById(
        "preferencia-salarial"
    ).textContent =
        formatarSalario(
            perfilPaginaPerfil
                .pretensaoSalarial
        );
}


function abrirModalPerfil(criando = false) {
    const modal =
        document.getElementById(
            "modal-perfil"
        );

    document.getElementById(
        "titulo-modal-perfil"
    ).textContent =
        criando
            ? "Criar perfil"
            : "Editar perfil";

    document.getElementById(
        "formulario-perfil"
    ).reset();

    if (
        perfilPaginaPerfil &&
        !criando
    ) {
        document.getElementById(
            "perfil-sobre-mim"
        ).value =
            perfilPaginaPerfil.sobreMim ||
            "";

        document.getElementById(
            "perfil-objetivo"
        ).value =
            perfilPaginaPerfil
                .objetivoProfissional ||
            "";

        document.getElementById(
            "perfil-nivel"
        ).value =
            perfilPaginaPerfil
                .nivelExperiencia ||
            "";

        document.getElementById(
            "perfil-modalidade"
        ).value =
            perfilPaginaPerfil
                .modalidadePreferida ||
            "";

        document.getElementById(
            "perfil-localizacao"
        ).value =
            perfilPaginaPerfil
                .localizacaoPreferida ||
            "";

        document.getElementById(
            "perfil-pretensao"
        ).value =
            perfilPaginaPerfil
                .pretensaoSalarial ??
            "";
    }

    modal.showModal();
}


async function salvarPerfil(evento) {
    evento.preventDefault();

    const arquivoFoto =
        document.getElementById(
            "perfil-foto-arquivo"
        ).files[0] || null;

    const arquivoCurriculo =
        document.getElementById(
            "perfil-curriculo-arquivo"
        ).files[0] || null;

    const dados = {
        sobreMim:
            obterTextoCampo(
                "perfil-sobre-mim"
            ),

        objetivoProfissional:
            obterTextoCampo(
                "perfil-objetivo"
            ),

        nivelExperiencia:
            obterTextoCampo(
                "perfil-nivel"
            ),

        modalidadePreferida:
            obterTextoCampo(
                "perfil-modalidade"
            ),

        localizacaoPreferida:
            obterTextoCampo(
                "perfil-localizacao"
            ),

        pretensaoSalarial:
            obterNumeroCampo(
                "perfil-pretensao"
            ),
    };

    try {
        validarArquivoFoto(
            arquivoFoto
        );

        validarArquivoCurriculo(
            arquivoCurriculo
        );

        const perfilJaExistia =
            Boolean(
                perfilPaginaPerfil
            );

        let perfilSalvo = null;

        if (perfilPaginaPerfil) {
            perfilSalvo =
                await apiRequest(
                    `/perfis-profissionais/${perfilPaginaPerfil.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(
                            dados
                        ),
                    }
                );

        } else {
            perfilSalvo =
                await apiRequest(
                    "/perfis-profissionais",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            usuarioId:
                                usuarioPaginaPerfil.id,
                            ...dados,
                        }),
                    }
                );
        }

        if (arquivoFoto) {
            const formularioFoto =
                new FormData();

            formularioFoto.append(
                "foto",
                arquivoFoto
            );

            await apiRequest(
                `/perfis-profissionais/${perfilSalvo.id}/foto`,
                {
                    method: "POST",
                    body: formularioFoto,
                }
            );
        }

        if (arquivoCurriculo) {
            const formularioCurriculo =
                new FormData();

            formularioCurriculo.append(
                "curriculo",
                arquivoCurriculo
            );

            await apiRequest(
                `/perfis-profissionais/${perfilSalvo.id}/curriculo`,
                {
                    method: "POST",
                    body: formularioCurriculo,
                }
            );
        }

        fecharModal(
            "modal-perfil"
        );

        mostrarMensagemPerfil(
            perfilJaExistia
                ? "Perfil atualizado com sucesso."
                : "Perfil criado com sucesso.",
            "sucesso"
        );

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(
            erro.message,
            "erro"
        );
    }
}


function validarArquivoFoto(arquivo) {
    if (!arquivo) {
        return;
    }

    const nome =
        arquivo.name.toLowerCase();

    const extensaoValida =
        nome.endsWith(".png") ||
        nome.endsWith(".jpg") ||
        nome.endsWith(".jpeg");

    const tipoValido =
        arquivo.type ===
            "image/png" ||
        arquivo.type ===
            "image/jpeg";

    if (
        !extensaoValida ||
        !tipoValido
    ) {
        throw new Error(
            "A foto deve estar no formato PNG ou JPEG."
        );
    }

    if (
        arquivo.size >
        3 * 1024 * 1024
    ) {
        throw new Error(
            "A foto deve possuir no máximo 3 MB."
        );
    }
}


function validarArquivoCurriculo(
    arquivo
) {
    if (!arquivo) {
        return;
    }

    const nome =
        arquivo.name.toLowerCase();

    if (
        arquivo.type !==
            "application/pdf" &&
        !nome.endsWith(".pdf")
    ) {
        throw new Error(
            "O currículo deve estar no formato PDF."
        );
    }

    if (
        arquivo.size >
        5 * 1024 * 1024
    ) {
        throw new Error(
            "O currículo deve possuir no máximo 5 MB."
        );
    }
}


function abrirModalExperiencia(
    experiencia = null
) {
    experienciaEmEdicaoId =
        experiencia?.id || null;

    document.getElementById(
        "formulario-experiencia"
    ).reset();

    document.getElementById(
        "titulo-modal-experiencia"
    ).textContent =
        experiencia
            ? "Editar experiência"
            : "Nova experiência";

    if (experiencia) {
        document.getElementById(
            "experiencia-cargo"
        ).value =
            experiencia.cargo || "";

        document.getElementById(
            "experiencia-empresa"
        ).value =
            experiencia.empresa || "";

        document.getElementById(
            "experiencia-data-inicio"
        ).value =
            experiencia.dataInicio || "";

        document.getElementById(
            "experiencia-data-fim"
        ).value =
            experiencia.dataFim || "";

        document.getElementById(
            "experiencia-atual"
        ).checked =
            Boolean(
                experiencia.atual
            );

        document.getElementById(
            "experiencia-descricao"
        ).value =
            experiencia.descricao ||
            "";
    }

    atualizarCampoFimExperiencia();

    document.getElementById(
        "modal-experiencia"
    ).showModal();
}


function atualizarCampoFimExperiencia() {
    const atual =
        document.getElementById(
            "experiencia-atual"
        ).checked;

    const dataFim =
        document.getElementById(
            "experiencia-data-fim"
        );

    dataFim.disabled = atual;

    if (atual) {
        dataFim.value = "";
    }
}


async function salvarExperiencia(evento) {
    evento.preventDefault();

    if (!perfilPaginaPerfil) {
        return;
    }

    const dados = {
        perfilProfissionalId:
            perfilPaginaPerfil.id,

        cargo:
            obterTextoCampo(
                "experiencia-cargo"
            ),

        empresa:
            obterTextoCampo(
                "experiencia-empresa"
            ),

        dataInicio:
            obterTextoCampo(
                "experiencia-data-inicio"
            ),

        dataFim:
            obterTextoCampo(
                "experiencia-data-fim"
            ),

        atual:
            document.getElementById(
                "experiencia-atual"
            ).checked,

        descricao:
            obterTextoCampo(
                "experiencia-descricao"
            ),
    };

    try {
        if (experienciaEmEdicaoId) {
            await apiRequest(
                `/experiencias-profissionais/${experienciaEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagemPerfil(
                "Experiência atualizada.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/experiencias-profissionais",
                {
                    method: "POST",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagemPerfil(
                "Experiência adicionada.",
                "sucesso"
            );
        }

        fecharModal(
            "modal-experiencia"
        );

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(
            erro.message,
            "erro"
        );
    }
}


async function tratarAcaoExperiencia(
    evento
) {
    const botaoEditar =
        evento.target.closest(
            "[data-editar-experiencia]"
        );

    const botaoExcluir =
        evento.target.closest(
            "[data-excluir-experiencia]"
        );

    if (botaoEditar) {
        const id =
            Number(
                botaoEditar.dataset
                    .editarExperiencia
            );

        const experiencia =
            experienciasPaginaPerfil.find(
                item =>
                    item.id === id
            );

        if (experiencia) {
            abrirModalExperiencia(
                experiencia
            );
        }

        return;
    }

    if (botaoExcluir) {
        const id =
            Number(
                botaoExcluir.dataset
                    .excluirExperiencia
            );

        if (
            !window.confirm(
                "Deseja excluir esta experiência?"
            )
        ) {
            return;
        }

        try {
            await apiRequest(
                `/experiencias-profissionais/${id}`,
                {
                    method: "DELETE",
                }
            );

            mostrarMensagemPerfil(
                "Experiência excluída.",
                "sucesso"
            );

            await carregarDadosPerfil();

        } catch (erro) {
            mostrarMensagemPerfil(
                erro.message,
                "erro"
            );
        }
    }
}


function abrirModalFormacao(
    formacao = null
) {
    formacaoEmEdicaoId =
        formacao?.id || null;

    document.getElementById(
        "formulario-formacao"
    ).reset();

    document.getElementById(
        "titulo-modal-formacao"
    ).textContent =
        formacao
            ? "Editar formação"
            : "Nova formação";

    if (formacao) {
        document.getElementById(
            "formacao-instituicao"
        ).value =
            formacao.instituicao || "";

        document.getElementById(
            "formacao-curso"
        ).value =
            formacao.curso || "";

        document.getElementById(
            "formacao-tipo"
        ).value =
            formacao.tipoFormacao || "";

        document.getElementById(
            "formacao-data-inicio"
        ).value =
            formacao.dataInicio || "";

        document.getElementById(
            "formacao-data-fim"
        ).value =
            formacao.dataFim || "";

        document.getElementById(
            "formacao-em-andamento"
        ).checked =
            Boolean(
                formacao.emAndamento
            );

        document.getElementById(
            "formacao-descricao"
        ).value =
            formacao.descricao || "";
    }

    atualizarCampoFimFormacao();

    document.getElementById(
        "modal-formacao"
    ).showModal();
}


function atualizarCampoFimFormacao() {
    const emAndamento =
        document.getElementById(
            "formacao-em-andamento"
        ).checked;

    const dataFim =
        document.getElementById(
            "formacao-data-fim"
        );

    dataFim.disabled =
        emAndamento;

    if (emAndamento) {
        dataFim.value = "";
    }
}


async function salvarFormacao(evento) {
    evento.preventDefault();

    if (!perfilPaginaPerfil) {
        return;
    }

    const dados = {
        perfilProfissionalId:
            perfilPaginaPerfil.id,

        instituicao:
            obterTextoCampo(
                "formacao-instituicao"
            ),

        curso:
            obterTextoCampo(
                "formacao-curso"
            ),

        tipoFormacao:
            obterTextoCampo(
                "formacao-tipo"
            ),

        dataInicio:
            obterTextoCampo(
                "formacao-data-inicio"
            ),

        dataFim:
            obterTextoCampo(
                "formacao-data-fim"
            ),

        emAndamento:
            document.getElementById(
                "formacao-em-andamento"
            ).checked,

        descricao:
            obterTextoCampo(
                "formacao-descricao"
            ),
    };

    try {
        if (formacaoEmEdicaoId) {
            await apiRequest(
                `/formacoes-academicas/${formacaoEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagemPerfil(
                "Formação atualizada.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/formacoes-academicas",
                {
                    method: "POST",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagemPerfil(
                "Formação adicionada.",
                "sucesso"
            );
        }

        fecharModal(
            "modal-formacao"
        );

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(
            erro.message,
            "erro"
        );
    }
}


async function tratarAcaoFormacao(
    evento
) {
    const botaoEditar =
        evento.target.closest(
            "[data-editar-formacao]"
        );

    const botaoExcluir =
        evento.target.closest(
            "[data-excluir-formacao]"
        );

    if (botaoEditar) {
        const id =
            Number(
                botaoEditar.dataset
                    .editarFormacao
            );

        const formacao =
            formacoesPaginaPerfil.find(
                item =>
                    item.id === id
            );

        if (formacao) {
            abrirModalFormacao(
                formacao
            );
        }

        return;
    }

    if (botaoExcluir) {
        const id =
            Number(
                botaoExcluir.dataset
                    .excluirFormacao
            );

        if (
            !window.confirm(
                "Deseja excluir esta formação?"
            )
        ) {
            return;
        }

        try {
            await apiRequest(
                `/formacoes-academicas/${id}`,
                {
                    method: "DELETE",
                }
            );

            mostrarMensagemPerfil(
                "Formação excluída.",
                "sucesso"
            );

            await carregarDadosPerfil();

        } catch (erro) {
            mostrarMensagemPerfil(
                erro.message,
                "erro"
            );
        }
    }
}


function abrirModalProjeto(
    projeto = null
) {
    projetoEmEdicaoId =
        projeto?.id || null;

    document.getElementById(
        "formulario-projeto"
    ).reset();

    document.getElementById(
        "titulo-modal-projeto"
    ).textContent =
        projeto
            ? "Editar projeto"
            : "Novo projeto";

    if (projeto) {
        document.getElementById(
            "projeto-nome"
        ).value =
            projeto.nome || "";

        document.getElementById(
            "projeto-tecnologias"
        ).value =
            projeto.tecnologias || "";

        document.getElementById(
            "projeto-link"
        ).value =
            projeto.link || "";

        document.getElementById(
            "projeto-descricao"
        ).value =
            projeto.descricao || "";
    }

    document.getElementById(
        "modal-projeto"
    ).showModal();
}


async function salvarProjeto(evento) {
    evento.preventDefault();

    if (!perfilPaginaPerfil) {
        return;
    }

    const dados = {
        perfilProfissionalId:
            perfilPaginaPerfil.id,

        nome:
            obterTextoCampo(
                "projeto-nome"
            ),

        tecnologias:
            obterTextoCampo(
                "projeto-tecnologias"
            ),

        link:
            obterTextoCampo(
                "projeto-link"
            ),

        descricao:
            obterTextoCampo(
                "projeto-descricao"
            ),
    };

    try {
        if (projetoEmEdicaoId) {
            await apiRequest(
                `/projetos/${projetoEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagemPerfil(
                "Projeto atualizado.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/projetos",
                {
                    method: "POST",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            mostrarMensagemPerfil(
                "Projeto adicionado.",
                "sucesso"
            );
        }

        fecharModal(
            "modal-projeto"
        );

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(
            erro.message,
            "erro"
        );
    }
}


async function tratarAcaoProjeto(
    evento
) {
    const botaoEditar =
        evento.target.closest(
            "[data-editar-projeto]"
        );

    const botaoExcluir =
        evento.target.closest(
            "[data-excluir-projeto]"
        );

    if (botaoEditar) {
        const id =
            Number(
                botaoEditar.dataset
                    .editarProjeto
            );

        const projeto =
            projetosPaginaPerfil.find(
                item =>
                    item.id === id
            );

        if (projeto) {
            abrirModalProjeto(
                projeto
            );
        }

        return;
    }

    if (botaoExcluir) {
        const id =
            Number(
                botaoExcluir.dataset
                    .excluirProjeto
            );

        if (
            !window.confirm(
                "Deseja excluir este projeto?"
            )
        ) {
            return;
        }

        try {
            await apiRequest(
                `/projetos/${id}`,
                {
                    method: "DELETE",
                }
            );

            mostrarMensagemPerfil(
                "Projeto excluído.",
                "sucesso"
            );

            await carregarDadosPerfil();

        } catch (erro) {
            mostrarMensagemPerfil(
                erro.message,
                "erro"
            );
        }
    }
}


function abrirModalHabilidade() {
    const seletor =
        document.getElementById(
            "habilidade-selecionada"
        );

    const idsAssociados =
        new Set(
            perfilHabilidadesPaginaPerfil
                .map(
                    item =>
                        item.habilidadeId
                )
        );

    const disponiveis =
        habilidadesPaginaPerfil
            .filter(
                habilidade =>
                    !idsAssociados.has(
                        habilidade.id
                    )
            )
            .sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            );

    seletor.innerHTML = `
        <option value="">
            Selecione uma habilidade
        </option>

        ${disponiveis
            .map(
                habilidade => `
                    <option value="${habilidade.id}">
                        ${escaparHtmlPerfil(
                            habilidade.nome
                        )}
                    </option>
                `
            )
            .join("")}
    `;

    document.getElementById(
        "habilidade-nivel"
    ).value = "basico";

    document.getElementById(
        "modal-habilidade-perfil"
    ).showModal();
}


async function adicionarHabilidade(
    evento
) {
    evento.preventDefault();

    if (!perfilPaginaPerfil) {
        return;
    }

    const habilidadeId =
        Number(
            document.getElementById(
                "habilidade-selecionada"
            ).value
        );

    const nivelDominio =
        document.getElementById(
            "habilidade-nivel"
        ).value;

    if (!habilidadeId) {
        mostrarMensagemPerfil(
            "Selecione uma habilidade.",
            "erro"
        );

        return;
    }

    try {
        await apiRequest(
            "/perfil-habilidades",
            {
                method: "POST",
                body: JSON.stringify({
                    perfilProfissionalId:
                        perfilPaginaPerfil.id,
                    habilidadeId,
                    nivelDominio,
                }),
            }
        );

        fecharModal(
            "modal-habilidade-perfil"
        );

        mostrarMensagemPerfil(
            "Habilidade adicionada.",
            "sucesso"
        );

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(
            erro.message,
            "erro"
        );
    }
}


async function tratarAcaoHabilidade(
    evento
) {
    const botao =
        evento.target.closest(
            "[data-remover-habilidade]"
        );

    if (!botao) {
        return;
    }

    const id =
        Number(
            botao.dataset
                .removerHabilidade
        );

    if (
        !window.confirm(
            "Deseja remover esta habilidade do perfil?"
        )
    ) {
        return;
    }

    try {
        await apiRequest(
            `/perfil-habilidades/${id}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagemPerfil(
            "Habilidade removida.",
            "sucesso"
        );

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(
            erro.message,
            "erro"
        );
    }
}


function mostrarCarregamento(
    carregando
) {
    document.getElementById(
        "carregando-perfil"
    ).classList.toggle(
        "oculto",
        !carregando
    );
}


function fecharModal(id) {
    const modal =
        document.getElementById(id);

    if (
        modal &&
        modal.open
    ) {
        modal.close();
    }
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


function obterInicialPerfil(nome) {
    if (!nome) {
        return "U";
    }

    return nome
        .trim()
        .charAt(0)
        .toUpperCase();
}


function formatarNivelExperiencia(
    nivel
) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return (
        valores[nivel] ||
        "Nível não informado"
    );
}


function formatarModalidade(
    modalidade
) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return (
        valores[modalidade] ||
        "Não informada"
    );
}


function formatarNivelHabilidade(
    nivel
) {
    const valores = {
        basico: "Básico",
        intermediario:
            "Intermediário",
        avancado: "Avançado",
    };

    return (
        valores[nivel] ||
        nivel ||
        "Não informado"
    );
}


function formatarCategoriaHabilidade(
    categoria
) {
    const valores = {
        linguagem: "Linguagem",
        framework: "Framework",
        banco_dados:
            "Banco de dados",
        ferramenta: "Ferramenta",
        conceito: "Conceito",
        outra: "Outra",
    };

    return (
        valores[categoria] ||
        "Competência"
    );
}


function formatarSalario(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "Não informada";
    }

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "Não informada";
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        }
    );
}


function formatarPeriodo(
    inicio,
    fim,
    atual,
    textoAtual
) {
    const inicioFormatado =
        formatarMesAno(inicio);

    const fimFormatado =
        atual
            ? textoAtual
            : formatarMesAno(fim);

    if (
        !inicioFormatado &&
        !fimFormatado
    ) {
        return "Período não informado";
    }

    if (!inicioFormatado) {
        return fimFormatado;
    }

    if (!fimFormatado) {
        return inicioFormatado;
    }

    return (
        `${inicioFormatado} — ` +
        `${fimFormatado}`
    );
}


function formatarMesAno(valor) {
    if (!valor) {
        return "";
    }

    const partes =
        valor.split("-");

    if (partes.length < 2) {
        return valor;
    }

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    if (
        !ano ||
        !mes
    ) {
        return valor;
    }

    const data =
        new Date(
            ano,
            mes - 1,
            1
        );

    return data.toLocaleDateString(
        "pt-BR",
        {
            month: "short",
            year: "numeric",
        }
    );
}


function obterTempoData(valor) {
    if (!valor) {
        return 0;
    }

    const tempo =
        new Date(valor).getTime();

    return Number.isNaN(tempo)
        ? 0
        : tempo;
}


function escaparHtmlPerfil(valor) {
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


function escaparAtributoPerfil(valor) {
    return escaparHtmlPerfil(
        valor
    );
}


function mostrarMensagemPerfil(
    mensagem,
    tipo = "sucesso"
) {
    const elemento =
        document.getElementById(
            "mensagem-sistema"
        );

    clearTimeout(
        temporizadorMensagemPerfil
    );

    elemento.textContent =
        mensagem;

    elemento.className =
        `mensagem-sistema ${tipo} visivel`;

    temporizadorMensagemPerfil =
        setTimeout(
            () => {
                elemento.className =
                    "mensagem-sistema";
            },
            3500
        );
}