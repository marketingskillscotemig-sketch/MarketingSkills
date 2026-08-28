let usuario = null;
let empresaAtual = null;

let vagas = [];
let empresas = [];
let requisitos = [];
let habilidades = [];

let perfil = null;
let habilidadesPerfil = [];

let vagaSelecionadaId = null;
let vagaEditandoId = null;
let requisitosFormulario = [];


document.addEventListener("DOMContentLoaded", iniciarPagina);


async function iniciarPagina() {
    try {
        const sessao = await apiRequest("/autenticacao/sessao");

        if (!sessao.autenticado) {
            window.location.href = "./login.html";
            return;
        }

        const vagasCarregadas = await apiRequest("/vagas");
        const empresasCarregadas = await apiRequest("/empresas");
        const requisitosCarregados = await apiRequest("/requisitos-vaga");
        const habilidadesCarregadas = await apiRequest("/habilidades");
        const perfis = await apiRequest("/perfis-profissionais");
        const perfisHabilidades = await apiRequest("/perfil-habilidades");

        usuario = sessao.usuario;
        vagas = vagasCarregadas || [];
        empresas = empresasCarregadas || [];
        requisitos = requisitosCarregados || [];
        habilidades = habilidadesCarregadas || [];

        if (usuario.tipoConta === "empresa") {
            iniciarEmpresa();
        } else {
            iniciarEstudante(
                perfis,
                perfisHabilidades
            );
        }

    } catch (erro) {
        console.error(erro);

        document.getElementById("lista-vagas").innerHTML = `
            <div class="estado-vazio">
                Não foi possível carregar as vagas.
            </div>
        `;
    }
}


/* =========================================================
   ESTUDANTE
========================================================= */


function iniciarEstudante(
    perfis,
    perfisHabilidades
) {
    perfil = perfis.find(
        item => item.usuarioId === usuario.id
    );

    if (perfil) {
        habilidadesPerfil = perfisHabilidades.filter(
            item => item.perfilProfissionalId === perfil.id
        );
    }

    registrarEventosEstudante();
    atualizarResumoEstudante();
    buscarVagas();
}


function registrarEventosEstudante() {
    document.getElementById("filtro-busca")
        .addEventListener("input", buscarVagas);

    document.getElementById("filtro-modalidade")
        .addEventListener("change", buscarVagas);

    document.getElementById("filtro-experiencia")
        .addEventListener("change", buscarVagas);

    document.getElementById("filtro-localizacao")
        .addEventListener("input", buscarVagas);

    document.getElementById("filtro-ordem")
        .addEventListener("change", buscarVagas);

    document.getElementById("lista-vagas")
        .addEventListener("click", function (evento) {
            const botao = evento.target.closest("[data-vaga-id]");

            if (!botao) {
                return;
            }

            selecionarVaga(
                Number(botao.dataset.vagaId)
            );
        });
}


async function buscarVagas() {
    const texto =
        document.getElementById("filtro-busca").value.trim();

    const modalidade =
        document.getElementById("filtro-modalidade").value;

    const nivel =
        document.getElementById("filtro-experiencia").value;

    const localizacao =
        document.getElementById("filtro-localizacao").value.trim();

    const ordem =
        document.getElementById("filtro-ordem").value;

    const parametros = new URLSearchParams();

    if (texto) {
        parametros.set("texto", texto);
    }

    if (modalidade) {
        parametros.set("modalidade", modalidade);
    }

    if (nivel) {
        parametros.set("nivel", nivel);
    }

    if (localizacao) {
        parametros.set("localizacao", localizacao);
    }

    try {
        let rota = "/vagas/busca-avancada";

        if (parametros.toString()) {
            rota += "?" + parametros.toString();
        }

        const resultado =
            await apiRequest(rota);

        ordenarVagas(
            resultado,
            ordem
        );

        mostrarVagasEstudante(
            resultado
        );

    } catch (erro) {
        console.error(erro);

        document.getElementById("lista-vagas").innerHTML = `
            <div class="estado-vazio">
                Erro ao buscar vagas.
            </div>
        `;
    }
}


function ordenarVagas(lista, ordem) {
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

    if (ordem === "salario") {
        lista.sort(
            (a, b) =>
                maiorSalario(b) -
                maiorSalario(a)
        );

        return;
    }

    lista.sort(
        (a, b) =>
            new Date(b.dataPublicacao || 0) -
            new Date(a.dataPublicacao || 0)
    );
}


function maiorSalario(vaga) {
    return Number(
        vaga.salarioMaximo ||
        vaga.salarioMinimo ||
        0
    );
}


function mostrarVagasEstudante(lista) {
    const div = document.getElementById("lista-vagas");

    document.getElementById(
        "quantidade-resultados"
    ).textContent =
        `${lista.length} resultado(s)`;

    if (lista.length === 0) {
        div.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga encontrada.
            </div>
        `;

        return;
    }

    let html = "";

    lista.forEach(function (vaga) {
        const empresa =
            buscarEmpresa(vaga.empresaId);

        const ativo =
            vaga.id === vagaSelecionadaId
                ? "ativo"
                : "";

        html += `
            <button
                class="cartao-vaga ${ativo}"
                data-vaga-id="${vaga.id}"
                type="button"
            >
                <div class="topo-cartao-vaga">
                    <div>
                        <h3>${escapar(vaga.titulo)}</h3>

                        <span class="nome-empresa-vaga">
                            ${escapar(
                                empresa
                                    ? empresa.nome
                                    : vaga.empresaNome || "Empresa"
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
                        ${escapar(
                            vaga.localizacao ||
                            "Localização não informada"
                        )}
                    </span>
                </div>

                <div class="rodape-cartao-vaga">
                    <span class="salario-cartao">
                        ${formatarSalario(vaga)}
                    </span>

                    <span class="data-cartao">
                        ${formatarData(
                            vaga.dataPublicacao
                        )}
                    </span>
                </div>
            </button>
        `;
    });

    div.innerHTML = html;
}


function selecionarVaga(id) {
    vagaSelecionadaId = id;

    const vaga =
        vagas.find(
            item => item.id === id
        );

    if (!vaga) {
        return;
    }

    buscarVagas();
    mostrarDetalheEstudante(vaga);
}


function mostrarDetalheEstudante(vaga) {
    const empresa =
        buscarEmpresa(vaga.empresaId);

    const requisitosVaga =
        buscarRequisitos(vaga.id);

    const idsHabilidades =
        habilidadesPerfil.map(
            item => item.habilidadeId
        );

    let atendidos = 0;

    requisitosVaga.forEach(function (requisito) {
        if (
            idsHabilidades.includes(
                requisito.habilidadeId
            )
        ) {
            atendidos++;
        }
    });

    let compatibilidade = null;

    if (
        perfil &&
        requisitosVaga.length > 0
    ) {
        compatibilidade = Math.round(
            atendidos /
            requisitosVaga.length *
            100
        );
    }

    let htmlRequisitos = "";

    requisitosVaga.forEach(function (requisito) {
        const habilidade =
            buscarHabilidade(
                requisito.habilidadeId
            );

        const possui =
            idsHabilidades.includes(
                requisito.habilidadeId
            );

        htmlRequisitos += `
            <div class="
                requisito-vaga
                ${
                    possui
                        ? "requisito-atendido"
                        : "requisito-pendente"
                }
            ">
                <div class="requisito-identidade">
                    <span class="estado-requisito">
                        ${possui ? "✓" : "+"}
                    </span>

                    <div>
                        <strong>
                            ${escapar(
                                habilidade
                                    ? habilidade.nome
                                    : "Habilidade"
                            )}
                        </strong>

                        <small>
                            Nível:
                            ${formatarNivel(
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
    });

    if (!htmlRequisitos) {
        htmlRequisitos = `
            <div class="estado-vazio">
                Nenhum requisito cadastrado.
            </div>
        `;
    }

    let htmlCompatibilidade = "";

    if (!perfil) {
        htmlCompatibilidade = `
            <div class="compatibilidade-vaga">
                Complete seu perfil para comparar
                suas habilidades.
            </div>
        `;

    } else if (compatibilidade !== null) {
        htmlCompatibilidade = `
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
                    ${requisitosVaga.length}
                    requisito(s).
                </p>
            </div>
        `;
    }

    const div =
        document.getElementById(
            "detalhe-vaga"
        );

    div.innerHTML = `
        <div class="cabecalho-detalhe-vaga">
            <span class="empresa-detalhe">
                ${escapar(
                    empresa
                        ? empresa.nome
                        : "Empresa"
                )}
            </span>

            <h2>
                ${escapar(vaga.titulo)}
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
                    ${escapar(
                        vaga.localizacao ||
                        "Localização não informada"
                    )}
                </span>
            </div>

            <div class="salario-detalhe">
                ${formatarSalario(vaga)}
            </div>
        </div>

        ${htmlCompatibilidade}

        <section class="secao-detalhe">
            <h3>Sobre a oportunidade</h3>

            <p>
                ${escapar(
                    vaga.descricao ||
                    "Sem descrição."
                )}
            </p>
        </section>

        <section class="secao-detalhe">
            <h3>Requisitos</h3>

            <div class="lista-requisitos">
                ${htmlRequisitos}
            </div>
        </section>

        <section class="secao-detalhe">
            <h3>Sobre a empresa</h3>

            <div class="bloco-empresa">
                <strong>
                    ${escapar(
                        empresa
                            ? empresa.nome
                            : "Empresa"
                    )}
                </strong>

                <p>
                    ${escapar(
                        empresa &&
                        empresa.descricao
                            ? empresa.descricao
                            : "Sem descrição."
                    )}
                </p>
            </div>
        </section>

        <div class="acoes-detalhe">
            <button
                class="botao-candidatura"
                disabled
            >
                Candidatura em breve
            </button>
        </div>
    `;
}


function atualizarResumoEstudante() {
    const ativas = vagas.filter(vaga => vaga.status === "ativa");

    const idsEmpresas = [];
    const idsVagas = [];
    for (const vaga of ativas) {
        if (!idsEmpresas.includes(vaga.empresaId)) {
            idsEmpresas.push(vaga.empresaId);
        }
        idsVagas.push(vaga.id);
    }

    const idsHabilidades = [];
    for (const requisito of requisitos) {
        if (idsVagas.includes(requisito.vagaId) && !idsHabilidades.includes(requisito.habilidadeId)) {
            idsHabilidades.push(requisito.habilidadeId);
        }
    }

    document.getElementById("total-vagas").textContent = ativas.length;
    document.getElementById("total-empresas").textContent = idsEmpresas.length;
    document.getElementById("total-habilidades").textContent = idsHabilidades.length;
}


/* =========================================================
   EMPRESA
========================================================= */


function iniciarEmpresa() {
    empresaAtual =
        empresas.find(
            item =>
                item.usuarioId === usuario.id
        );

    configurarTelaEmpresa();
    registrarEventosEmpresa();

    if (!empresaAtual) {
        document.getElementById(
            "lista-vagas"
        ).innerHTML = `
            <div class="estado-vazio">
                Empresa não encontrada.
            </div>
        `;

        return;
    }

    atualizarResumoEmpresa();
    mostrarVagasEmpresa();
}


function configurarTelaEmpresa() {
    document.title =
        "Minhas Vagas | Market Skills";

    document.getElementById(
        "navegacao-vagas"
    ).innerHTML = `
        <a href="../index.html">
            Dashboard
        </a>

        <a href="./talentos.html?v=1">
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
        "Crie vagas, organize requisitos e acompanhe suas publicações.";

    document.getElementById(
        "acao-hero-empresa"
    ).classList.remove("oculto");

    document.getElementById(
        "painel-filtros"
    ).classList.add("oculto");

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
        "titulo-listagem"
    ).textContent =
        "Minhas vagas";
}


function registrarEventosEmpresa() {
    document.getElementById(
        "botao-criar-vaga"
    ).addEventListener(
        "click",
        function () {
            abrirModal();
        }
    );

    document.getElementById(
        "botao-fechar-modal-vaga"
    ).addEventListener(
        "click",
        fecharModal
    );

    document.getElementById(
        "botao-cancelar-vaga"
    ).addEventListener(
        "click",
        fecharModal
    );

    document.getElementById(
        "botao-adicionar-requisito"
    ).addEventListener(
        "click",
        adicionarRequisito
    );

    document.getElementById(
        "vaga-salario-definir"
    ).addEventListener(
        "change",
        atualizarSalario
    );

    document.getElementById(
        "formulario-vaga"
    ).addEventListener(
        "submit",
        salvarVaga
    );

    document.getElementById(
        "lista-vagas"
    ).addEventListener(
        "click",
        clicarVagaEmpresa
    );

    document.getElementById(
        "detalhe-vaga"
    ).addEventListener(
        "click",
        clicarAcaoEmpresa
    );

    document.getElementById(
        "lista-requisitos-formulario"
    ).addEventListener(
        "click",
        removerRequisito
    );

    document.getElementById(
        "lista-requisitos-formulario"
    ).addEventListener(
        "change",
        alterarRequisito
    );
}


function vagasDaEmpresa() {
    return vagas.filter(
        vaga =>
            vaga.empresaId ===
            empresaAtual.id
    );
}


function atualizarResumoEmpresa() {
    const lista =
        vagasDaEmpresa();

    document.getElementById(
        "total-vagas"
    ).textContent =
        lista.filter(
            vaga => vaga.status === "ativa"
        ).length;

    document.getElementById(
        "total-empresas"
    ).textContent =
        lista.filter(
            vaga => vaga.status === "pausada"
        ).length;

    document.getElementById(
        "total-habilidades"
    ).textContent =
        lista.filter(
            vaga => vaga.status === "encerrada"
        ).length;
}


function mostrarVagasEmpresa() {
    const lista =
        vagasDaEmpresa();

    lista.sort(
        (a, b) =>
            new Date(b.dataPublicacao || 0) -
            new Date(a.dataPublicacao || 0)
    );

    document.getElementById(
        "quantidade-resultados"
    ).textContent =
        `${lista.length} vaga(s)`;

    const div =
        document.getElementById(
            "lista-vagas"
        );

    if (lista.length === 0) {
        div.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga cadastrada.
            </div>
        `;

        return;
    }

    let html = "";

    lista.forEach(function (vaga) {
        const ativo =
            vaga.id === vagaSelecionadaId
                ? "ativo"
                : "";

        html += `
            <button
                class="cartao-vaga ${ativo}"
                data-vaga-id="${vaga.id}"
                type="button"
            >
                <div class="topo-cartao-vaga">
                    <div>
                        <h3>
                            ${escapar(vaga.titulo)}
                        </h3>

                        <span class="nome-empresa-vaga">
                            ${escapar(
                                empresaAtual.nome
                            )}
                        </span>
                    </div>

                    <span class="tag-vaga">
                        ${formatarStatus(
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
                        ${escapar(
                            vaga.localizacao ||
                            "Não informada"
                        )}
                    </span>
                </div>

                <div class="rodape-cartao-vaga">
                    <span>
                        ${formatarSalario(vaga)}
                    </span>

                    <span>
                        ${formatarData(
                            vaga.dataPublicacao
                        )}
                    </span>
                </div>
            </button>
        `;
    });

    div.innerHTML = html;
}


function clicarVagaEmpresa(evento) {
    const botao =
        evento.target.closest(
            "[data-vaga-id]"
        );

    if (!botao) {
        return;
    }

    vagaSelecionadaId =
        Number(
            botao.dataset.vagaId
        );

    mostrarVagasEmpresa();

    const vaga =
        vagas.find(
            item =>
                item.id === vagaSelecionadaId
        );

    if (vaga) {
        mostrarDetalheEmpresa(vaga);
    }
}


function mostrarDetalheEmpresa(vaga) {
    const requisitosVaga =
        buscarRequisitos(vaga.id);

    let htmlObrigatorios = "";
    let htmlDiferenciais = "";

    requisitosVaga.forEach(function (requisito) {
        const habilidade =
            buscarHabilidade(
                requisito.habilidadeId
            );

        const html = `
            <div class="requisito-vaga">
                <strong>
                    ${escapar(
                        habilidade
                            ? habilidade.nome
                            : "Habilidade"
                    )}
                </strong>

                <small>
                    ${formatarNivel(
                        requisito.nivelExigido
                    )}
                </small>
            </div>
        `;

        if (requisito.obrigatorio) {
            htmlObrigatorios += html;
        } else {
            htmlDiferenciais += html;
        }
    });

    document.getElementById(
        "detalhe-vaga"
    ).innerHTML = `
        <div class="cabecalho-detalhe-vaga">
            <span class="empresa-detalhe">
                ${escapar(
                    empresaAtual.nome
                )}
            </span>

            <h2>
                ${escapar(vaga.titulo)}
            </h2>

            <div class="metadados-detalhe">
                <span>
                    ${formatarStatus(
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
            </div>

            <div class="salario-detalhe">
                ${formatarSalario(vaga)}
            </div>
        </div>

        <section class="secao-detalhe">
            <h3>Sobre a oportunidade</h3>

            <p>
                ${escapar(
                    vaga.descricao ||
                    "Sem descrição."
                )}
            </p>
        </section>

        <section class="secao-detalhe">
            <h3>Requisitos obrigatórios</h3>

            <div class="lista-requisitos">
                ${
                    htmlObrigatorios ||
                    "Nenhum requisito obrigatório."
                }
            </div>
        </section>

        <section class="secao-detalhe">
            <h3>Diferenciais</h3>

            <div class="lista-requisitos">
                ${
                    htmlDiferenciais ||
                    "Nenhum diferencial."
                }
            </div>
        </section>

        <div class="acoes-detalhe">
            <button
                class="botao botao-principal"
                data-editar="${vaga.id}"
            >
                Editar
            </button>

            ${
                vaga.status === "ativa"
                    ? `
                        <button
                            class="botao botao-contorno"
                            data-status="${vaga.id}"
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
                            data-status="${vaga.id}"
                            data-novo-status="ativa"
                        >
                            Reativar
                        </button>
                    `
                    : ""
            }

            <button
                class="botao botao-contorno"
                data-status="${vaga.id}"
                data-novo-status="encerrada"
            >
                Encerrar
            </button>

            <button
                class="botao botao-escuro"
                data-excluir="${vaga.id}"
            >
                Excluir
            </button>
        </div>
    `;
}


async function clicarAcaoEmpresa(evento) {
    const editar =
        evento.target.closest(
            "[data-editar]"
        );

    const status =
        evento.target.closest(
            "[data-status]"
        );

    const excluir =
        evento.target.closest(
            "[data-excluir]"
        );

    if (editar) {
        const vaga =
            vagas.find(
                item =>
                    item.id ===
                    Number(
                        editar.dataset.editar
                    )
            );

        if (vaga) {
            abrirModal(vaga);
        }

        return;
    }

    if (status) {
        await mudarStatus(
            Number(status.dataset.status),
            status.dataset.novoStatus
        );

        return;
    }

    if (excluir) {
        await excluirVaga(
            Number(
                excluir.dataset.excluir
            )
        );
    }
}


function abrirModal(vaga = null) {
    vagaEditandoId =
        vaga ? vaga.id : null;

    requisitosFormulario = [];

    document.getElementById(
        "formulario-vaga"
    ).reset();

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
            vaga.nivelExperiencia || "";

        document.getElementById(
            "vaga-modalidade"
        ).value =
            vaga.modalidade || "";

        document.getElementById(
            "vaga-localizacao"
        ).value =
            vaga.localizacao || "";

        let salarioMinimoCampo = vaga.salarioMinimo;
        if (salarioMinimoCampo === null || salarioMinimoCampo === undefined) {
            salarioMinimoCampo = "";
        }
        document.getElementById("vaga-salario-minimo").value = salarioMinimoCampo;

        let salarioMaximoCampo = vaga.salarioMaximo;
        if (salarioMaximoCampo === null || salarioMaximoCampo === undefined) {
            salarioMaximoCampo = "";
        }
        document.getElementById("vaga-salario-maximo").value = salarioMaximoCampo;

        const semSalario =
            vaga.salarioMinimo === null &&
            vaga.salarioMaximo === null;

        document.getElementById(
            "vaga-salario-definir"
        ).checked =
            semSalario;

        requisitosFormulario =
            buscarRequisitos(
                vaga.id
            ).map(
                requisito => ({
                    habilidadeId:
                        requisito.habilidadeId,

                    nivelExigido:
                        requisito.nivelExigido,

                    obrigatorio:
                        requisito.obrigatorio,
                })
            );
    }

    atualizarSalario();
    mostrarRequisitosFormulario();

    document.getElementById(
        "modal-vaga"
    ).showModal();
}


function fecharModal() {
    document.getElementById(
        "modal-vaga"
    ).close();
}


function adicionarRequisito() {
    requisitosFormulario.push({
        habilidadeId: "",
        nivelExigido: "basico",
        obrigatorio: true,
    });

    mostrarRequisitosFormulario();
}


function mostrarRequisitosFormulario() {
    const div =
        document.getElementById(
            "lista-requisitos-formulario"
        );

    if (requisitosFormulario.length === 0) {
        div.innerHTML = `
            <div class="estado-vazio">
                Nenhum requisito adicionado.
            </div>
        `;

        return;
    }

    let html = "";

    requisitosFormulario.forEach(
        function (requisito, indice) {

            let opcoes = "";

            habilidades.forEach(
                function (habilidade) {

                    const selecionado =
                        Number(
                            requisito.habilidadeId
                        ) === habilidade.id
                            ? "selected"
                            : "";

                    opcoes += `
                        <option
                            value="${habilidade.id}"
                            ${selecionado}
                        >
                            ${escapar(
                                habilidade.nome
                            )}
                        </option>
                    `;
                }
            );

            html += `
                <div
                    class="requisito-vaga"
                    data-indice="${indice}"
                >
                    <label>
                        <span>Habilidade</span>

                        <select data-campo="habilidadeId">
                            <option value="">
                                Selecione
                            </option>

                            ${opcoes}
                        </select>
                    </label>

                    <label>
                        <span>Nível</span>

                        <select data-campo="nivelExigido">
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
                        <span>Categoria</span>

                        <select data-campo="obrigatorio">
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
                        data-remover="${indice}"
                    >
                        Remover
                    </button>
                </div>
            `;
        }
    );

    div.innerHTML = html;
}


function alterarRequisito(evento) {
    const campo =
        evento.target.closest(
            "[data-campo]"
        );

    if (!campo) {
        return;
    }

    const linha =
        campo.closest(
            "[data-indice]"
        );

    const indice =
        Number(
            linha.dataset.indice
        );

    const nome =
        campo.dataset.campo;

    let valor =
        campo.value;

    if (nome === "habilidadeId") {
        valor =
            valor
                ? Number(valor)
                : "";
    }

    if (nome === "obrigatorio") {
        valor =
            valor === "true";
    }

    requisitosFormulario[
        indice
    ][nome] = valor;
}


function removerRequisito(evento) {
    const botao =
        evento.target.closest(
            "[data-remover]"
        );

    if (!botao) {
        return;
    }

    requisitosFormulario.splice(
        Number(
            botao.dataset.remover
        ),
        1
    );

    mostrarRequisitosFormulario();
}


function atualizarSalario() {
    const semSalario =
        document.getElementById(
            "vaga-salario-definir"
        ).checked;

    const minimo =
        document.getElementById(
            "vaga-salario-minimo"
        );

    const maximo =
        document.getElementById(
            "vaga-salario-maximo"
        );

    minimo.disabled =
        semSalario;

    maximo.disabled =
        semSalario;

    if (semSalario) {
        minimo.value = "";
        maximo.value = "";
    }
}


async function salvarVaga(evento) {
    evento.preventDefault();

    const semSalario =
        document.getElementById(
            "vaga-salario-definir"
        ).checked;

    const dados = {
        empresaId:
            empresaAtual.id,

        titulo:
            valor("vaga-titulo"),

        descricao:
            valor("vaga-descricao"),

        beneficios:
            valor("vaga-beneficios"),

        nivelExperiencia:
            document.getElementById(
                "vaga-nivel"
            ).value,

        modalidade:
            document.getElementById(
                "vaga-modalidade"
            ).value,

        localizacao:
            valor("vaga-localizacao"),

        salarioMinimo:
            semSalario
                ? null
                : numero(
                    "vaga-salario-minimo"
                ),

        salarioMaximo:
            semSalario
                ? null
                : numero(
                    "vaga-salario-maximo"
                ),
    };

    try {
        let vagaSalva;

        if (vagaEditandoId) {
            vagaSalva =
                await apiRequest(
                    `/vagas/${vagaEditandoId}`,
                    {
                        method: "PUT",
                        body:
                            JSON.stringify(
                                dados
                            ),
                    }
                );

            await apagarRequisitos(
                vagaSalva.id
            );

        } else {
            const dadosParaCriar = Object.assign({}, dados, { status: "ativa" });

            vagaSalva =
                await apiRequest(
                    "/vagas",
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                dadosParaCriar
                            ),
                    }
                );
        }

        await salvarRequisitos(
            vagaSalva.id
        );

        fecharModal();
        await recarregarEmpresa();

        vagaSelecionadaId =
            vagaSalva.id;

        mostrarVagasEmpresa();

        const vaga =
            vagas.find(
                item =>
                    item.id ===
                    vagaSalva.id
            );

        if (vaga) {
            mostrarDetalheEmpresa(vaga);
        }

    } catch (erro) {
        document.getElementById(
            "mensagem-formulario-vaga"
        ).textContent =
            erro.message;
    }
}


async function apagarRequisitos(vagaId) {
    const antigos =
        buscarRequisitos(vagaId);

    for (const requisito of antigos) {
        await apiRequest(
            `/requisitos-vaga/${requisito.id}`,
            {
                method: "DELETE",
            }
        );
    }
}


async function salvarRequisitos(vagaId) {
    for (
        const requisito
        of requisitosFormulario
    ) {
        if (!requisito.habilidadeId) {
            continue;
        }

        await apiRequest(
            "/requisitos-vaga",
            {
                method: "POST",

                body: JSON.stringify({
                    vagaId: vagaId,
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


async function mudarStatus(
    id,
    novoStatus
) {
    try {
        await apiRequest(
            `/vagas/${id}`,
            {
                method: "PUT",
                body:
                    JSON.stringify({
                        status:
                            novoStatus,
                    }),
            }
        );

        await recarregarEmpresa();

        const vaga =
            vagas.find(
                item => item.id === id
            );

        if (vaga) {
            vagaSelecionadaId = id;
            mostrarVagasEmpresa();
            mostrarDetalheEmpresa(vaga);
        }

    } catch (erro) {
        alert(erro.message);
    }
}


async function excluirVaga(id) {
    const confirmar =
        window.confirm(
            "Deseja excluir esta vaga?"
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/vagas/${id}`,
            {
                method: "DELETE",
            }
        );

        vagaSelecionadaId = null;

        await recarregarEmpresa();

        document.getElementById(
            "detalhe-vaga"
        ).innerHTML = `
            <div class="detalhe-vazio">
                <h2>Vaga excluída</h2>
            </div>
        `;

    } catch (erro) {
        alert(erro.message);
    }
}


async function recarregarEmpresa() {
    const vagasCarregadas = await apiRequest("/vagas");
    const requisitosCarregados = await apiRequest("/requisitos-vaga");

    vagas = vagasCarregadas || [];
    requisitos = requisitosCarregados || [];

    atualizarResumoEmpresa();
    mostrarVagasEmpresa();
}


/* =========================================================
   FUNÇÕES SIMPLES COMPARTILHADAS
========================================================= */


function buscarEmpresa(id) {
    return empresas.find(
        empresa => empresa.id === id
    );
}


function buscarHabilidade(id) {
    return habilidades.find(
        habilidade =>
            habilidade.id === id
    );
}


function buscarRequisitos(vagaId) {
    return requisitos.filter(
        requisito =>
            requisito.vagaId === vagaId
    );
}


function valor(id) {
    return document
        .getElementById(id)
        .value
        .trim();
}


function numero(id) {
    const valorCampo =
        document.getElementById(
            id
        ).value;

    if (valorCampo === "") {
        return null;
    }

    return Number(valorCampo);
}


function formatarExperiencia(valor) {
    const nomes = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return nomes[valor] || "Não informado";
}


function formatarModalidade(valor) {
    const nomes = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return nomes[valor] || "Não informada";
}


function formatarStatus(valor) {
    const nomes = {
        ativa: "Ativa",
        pausada: "Pausada",
        encerrada: "Encerrada",
    };

    return nomes[valor] || valor;
}


function formatarNivel(valor) {
    const nomes = {
        basico: "Básico",
        intermediario: "Intermediário",
        avancado: "Avançado",
    };

    return nomes[valor] || valor;
}


function formatarData(data) {
    if (!data) {
        return "Sem data";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}


function formatarSalario(vaga) {
    const minimo =
        vaga.salarioMinimo;

    const maximo =
        vaga.salarioMaximo;

    if (
        minimo === null &&
        maximo === null
    ) {
        return "Salário a definir";
    }

    if (
        minimo !== null &&
        maximo !== null
    ) {
        return (
            formatarMoeda(minimo) +
            " - " +
            formatarMoeda(maximo)
        );
    }

    if (minimo !== null) {
        return (
            "A partir de " +
            formatarMoeda(minimo)
        );
    }

    return (
        "Até " +
        formatarMoeda(maximo)
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


function escapar(texto) {
    return String(
        texto || ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}