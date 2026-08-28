// ===================================================
// Página de Estudos
// Recomendações de habilidades, criação de trilhas de
// estudo, listagem de planos, etapas e progresso.
// ===================================================


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


document.addEventListener("DOMContentLoaded", iniciarEstudos);


async function iniciarEstudos() {
    registrarEventos();
    await carregarEstudos();
}


function registrarEventos() {
    document.getElementById("lista-recomendacoes").addEventListener("click", aoClicarListaRecomendacoes);
    document.getElementById("lista-planos").addEventListener("click", aoClicarListaPlanos);
    document.getElementById("detalhe-plano").addEventListener("click", tratarAcaoDetalhe);
}


function aoClicarListaRecomendacoes(evento) {
    const botao = evento.target.closest("[data-criar-trilha]");

    if (!botao) {
        return;
    }

    criarTrilhaRecomendada(Number(botao.dataset.criarTrilha), botao);
}


function aoClicarListaPlanos(evento) {
    const botao = evento.target.closest("[data-plano-id]");

    if (!botao) {
        return;
    }

    planoSelecionadoId = Number(botao.dataset.planoId);

    renderizarPlanos();
    renderizarDetalhePlano();
}


// ---- Carregamento de dados ----

async function carregarEstudos() {
    try {
        const sessao = await apiRequest("/autenticacao/sessao");
        const vagas = await apiRequest("/vagas");
        const requisitos = await apiRequest("/requisitos-vaga");
        const habilidades = await apiRequest("/habilidades");
        const perfis = await apiRequest("/perfis-profissionais");
        const perfisHabilidades = await apiRequest("/perfil-habilidades");
        const planos = await apiRequest("/planos-estudo");
        const etapas = await apiRequest("/etapas-estudo");

        if (!sessao.autenticado || !sessao.usuario) {
            window.location.href = "./login.html";
            return;
        }

        usuarioEstudos = sessao.usuario;
        vagasEstudos = vagas;
        requisitosEstudos = requisitos;
        habilidadesEstudos = habilidades;

        perfilEstudos = encontrarPerfilDoUsuario(perfis);

        habilidadesPerfilEstudos = [];
        if (perfilEstudos) {
            for (const item of perfisHabilidades) {
                if (item.perfilProfissionalId === perfilEstudos.id) {
                    habilidadesPerfilEstudos.push(item);
                }
            }
        }

        planosEstudos = [];
        for (const plano of planos) {
            if (plano.usuarioId === usuarioEstudos.id) {
                planosEstudos.push(plano);
            }
        }

        const idsPlanos = obterIdsPlanos();

        etapasEstudos = [];
        for (const etapa of etapas) {
            if (idEstaNaLista(idsPlanos, etapa.planoEstudoId)) {
                etapasEstudos.push(etapa);
            }
        }

        calcularRecomendacoes();

        if (planoSelecionadoId && !existePlanoComId(planoSelecionadoId)) {
            planoSelecionadoId = null;
        }

        if (!planoSelecionadoId && planosEstudos.length > 0) {
            planoSelecionadoId = planosEstudos[0].id;
        }

        renderizarTudo();

    } catch (erro) {
        console.error("Erro ao carregar estudos:", erro);
        mostrarMensagem("Não foi possível carregar os estudos.", "erro");
    }
}


function encontrarPerfilDoUsuario(perfis) {
    for (const perfil of perfis) {
        if (perfil.usuarioId === usuarioEstudos.id) {
            return perfil;
        }
    }

    return null;
}


function obterIdsPlanos() {
    const ids = [];

    for (const plano of planosEstudos) {
        ids.push(plano.id);
    }

    return ids;
}


function idEstaNaLista(lista, valor) {
    for (const item of lista) {
        if (item === valor) {
            return true;
        }
    }

    return false;
}


function existePlanoComId(id) {
    for (const plano of planosEstudos) {
        if (plano.id === id) {
            return true;
        }
    }

    return false;
}


function renderizarTudo() {
    atualizarMetricas();
    renderizarRecomendacoes();
    renderizarPlanos();
    renderizarDetalhePlano();
}


// ---- Recomendações ----

function obterVagasAtivas() {
    const ativas = [];

    for (const vaga of vagasEstudos) {
        if (vaga.status === "ativa") {
            ativas.push(vaga);
        }
    }

    return ativas;
}


function obterHabilidade(id) {
    for (const habilidade of habilidadesEstudos) {
        if (habilidade.id === id) {
            return habilidade;
        }
    }

    return null;
}


function calcularRecomendacoes() {
    const idsHabilidadesUsuario = [];
    for (const item of habilidadesPerfilEstudos) {
        idsHabilidadesUsuario.push(item.habilidadeId);
    }

    const vagasAtivas = obterVagasAtivas();
    const idsVagasAtivas = [];
    for (const vaga of vagasAtivas) {
        idsVagasAtivas.push(vaga.id);
    }

    const demandas = [];

    for (const requisito of requisitosEstudos) {
        if (!idEstaNaLista(idsVagasAtivas, requisito.vagaId)) {
            continue;
        }

        if (idEstaNaLista(idsHabilidadesUsuario, requisito.habilidadeId)) {
            continue;
        }

        incrementarDemanda(demandas, requisito.habilidadeId);
    }

    const recomendacoes = [];

    for (const demanda of demandas) {
        const habilidade = obterHabilidade(demanda.habilidadeId);

        if (habilidade) {
            recomendacoes.push({
                habilidadeId: demanda.habilidadeId,
                quantidade: demanda.quantidade,
                habilidade: habilidade,
            });
        }
    }

    recomendacoes.sort(function (a, b) {
        return b.quantidade - a.quantidade;
    });

    recomendacoesEstudos = recomendacoes.slice(0, 6);
}


function incrementarDemanda(lista, habilidadeId) {
    for (const item of lista) {
        if (item.habilidadeId === habilidadeId) {
            item.quantidade = item.quantidade + 1;
            return;
        }
    }

    lista.push({ habilidadeId: habilidadeId, quantidade: 1 });
}


function atualizarMetricas() {
    document.getElementById("total-habilidades-perfil").textContent = habilidadesPerfilEstudos.length;
    document.getElementById("total-recomendacoes").textContent = recomendacoesEstudos.length;

    let totalAtivos = 0;
    for (const plano of planosEstudos) {
        if (plano.status === "em_andamento") {
            totalAtivos = totalAtivos + 1;
        }
    }

    document.getElementById("total-planos-ativos").textContent = totalAtivos;
}


function renderizarRecomendacoes() {
    const conteiner = document.getElementById("lista-recomendacoes");

    if (!perfilEstudos) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Complete seu perfil profissional para
                receber recomendações personalizadas.
            </div>
        `;
        return;
    }

    if (recomendacoesEstudos.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                No momento não encontramos novas habilidades
                para recomendar com base nas vagas cadastradas.
            </div>
        `;
        return;
    }

    let html = "";
    for (const item of recomendacoesEstudos) {
        html = html + criarHtmlRecomendacao(item);
    }

    conteiner.innerHTML = html;
}


function criarHtmlRecomendacao(item) {
    const habilidade = item.habilidade;

    return `
        <article class="cartao-recomendacao">
            <div class="topo-recomendacao">
                <span class="icone-recomendacao">+</span>
                <span class="demanda-recomendacao">${item.quantidade} vaga(s)</span>
            </div>

            <h3>${escaparHtml(habilidade.nome)}</h3>
            <span class="categoria-recomendacao">${formatarCategoria(habilidade.categoria)}</span>

            <p>
                Esta habilidade aparece entre as exigências atuais do
                mercado e ainda não está registrada no seu perfil.
            </p>

            <div class="acoes-recomendacao">
                <button class="botao-criar-trilha" data-criar-trilha="${habilidade.id}" type="button">
                    Criar trilha de estudo
                </button>
            </div>
        </article>
    `;
}


// ---- Criação de trilha/plano ----

async function criarTrilhaRecomendada(habilidadeId, botao) {
    const habilidade = obterHabilidade(habilidadeId);

    if (!habilidade) {
        return;
    }

    const planoExistente = encontrarPlanoPeloTitulo(`Trilha: ${habilidade.nome}`);

    if (planoExistente) {
        planoSelecionadoId = planoExistente.id;

        renderizarPlanos();
        renderizarDetalhePlano();

        mostrarMensagem("Você já possui uma trilha para esta habilidade.", "sucesso");
        return;
    }

    const textoOriginal = botao.textContent;

    botao.disabled = true;
    botao.textContent = "Criando trilha...";

    try {
        const hoje = new Date().toISOString().slice(0, 10);

        const plano = await apiRequest("/planos-estudo", {
            method: "POST",
            body: JSON.stringify({
                usuarioId: usuarioEstudos.id,
                titulo: `Trilha: ${habilidade.nome}`,
                objetivo: `Desenvolver conhecimentos em ${habilidade.nome} com base nas demandas encontradas nas vagas do Market Skills.`,
                dataInicio: hoje,
                percentualConclusao: 0,
                status: "em_andamento",
            }),
        });

        const etapas = criarEtapasPadrao(habilidade.nome, plano.id);

        for (const etapa of etapas) {
            await apiRequest("/etapas-estudo", {
                method: "POST",
                body: JSON.stringify(etapa),
            });
        }

        planoSelecionadoId = plano.id;

        mostrarMensagem(`Trilha de ${habilidade.nome} criada.`, "sucesso");

        await carregarEstudos();

    } catch (erro) {
        console.error(erro);
        mostrarMensagem(erro.message || "Não foi possível criar a trilha.", "erro");

    } finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}


function encontrarPlanoPeloTitulo(titulo) {
    const tituloNormalizado = normalizarTexto(titulo);

    for (const plano of planosEstudos) {
        if (normalizarTexto(plano.titulo) === tituloNormalizado) {
            return plano;
        }
    }

    return null;
}


function criarEtapasPadrao(habilidadeNome, planoId) {
    return [
        {
            planoEstudoId: planoId,
            titulo: `Fundamentos de ${habilidadeNome}`,
            descricao: `Entenda os principais conceitos e fundamentos de ${habilidadeNome}.`,
            ordem: 1,
            cargaHorariaEstimada: 4,
            status: "pendente",
        },
        {
            planoEstudoId: planoId,
            titulo: `Prática com ${habilidadeNome}`,
            descricao: `Pratique ${habilidadeNome} com exercícios e exemplos aplicados.`,
            ordem: 2,
            cargaHorariaEstimada: 6,
            status: "pendente",
        },
        {
            planoEstudoId: planoId,
            titulo: `Projeto com ${habilidadeNome}`,
            descricao: `Desenvolva um pequeno projeto para consolidar seus conhecimentos em ${habilidadeNome}.`,
            ordem: 3,
            cargaHorariaEstimada: 8,
            status: "pendente",
        },
    ];
}


// ---- Listagem de planos ----

function renderizarPlanos() {
    const conteiner = document.getElementById("lista-planos");

    if (planosEstudos.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Você ainda não iniciou nenhuma trilha.
            </div>
        `;
        return;
    }

    const planosOrdenados = planosEstudos.slice();
    planosOrdenados.sort(function (a, b) {
        return b.id - a.id;
    });

    let html = "";
    for (const plano of planosOrdenados) {
        html = html + criarHtmlPlano(plano);
    }

    conteiner.innerHTML = html;
}


function criarHtmlPlano(plano) {
    const selecionado = plano.id === planoSelecionadoId;

    let classeAtivo = "";
    if (selecionado) {
        classeAtivo = "ativo";
    }

    const percentual = Math.round(Number(plano.percentualConclusao || 0));

    return `
        <button class="item-plano ${classeAtivo}" data-plano-id="${plano.id}" type="button">
            <strong>${escaparHtml(plano.titulo)}</strong>
            <span>${formatarStatusPlano(plano.status)} · ${percentual}%</span>
            <div class="progresso-mini">
                <span style="width: ${percentual}%"></span>
            </div>
        </button>
    `;
}


function obterPlanoSelecionado() {
    for (const plano of planosEstudos) {
        if (plano.id === planoSelecionadoId) {
            return plano;
        }
    }

    return null;
}


// ---- Detalhe do plano / etapas ----

function renderizarDetalhePlano() {
    const conteiner = document.getElementById("detalhe-plano");
    const plano = obterPlanoSelecionado();

    if (!plano) {
        conteiner.innerHTML = `
            <div class="detalhe-vazio">
                <div class="icone-detalhe">✓</div>
                <h2>Nenhum plano selecionado</h2>
                <p>
                    Escolha uma recomendação para gerar
                    uma trilha de estudos personalizada.
                </p>
            </div>
        `;
        return;
    }

    const etapas = [];
    for (const etapa of etapasEstudos) {
        if (etapa.planoEstudoId === plano.id) {
            etapas.push(etapa);
        }
    }

    etapas.sort(function (a, b) {
        return a.ordem - b.ordem;
    });

    const percentual = Math.round(Number(plano.percentualConclusao || 0));

    let etapasHtml = "";
    if (etapas.length > 0) {
        for (const etapa of etapas) {
            etapasHtml = etapasHtml + criarHtmlEtapa(etapa);
        }
    } else {
        etapasHtml = `
            <div class="estado-vazio">
                Nenhuma etapa cadastrada neste plano.
            </div>
        `;
    }

    const objetivo = plano.objetivo || "Plano de desenvolvimento profissional.";

    conteiner.innerHTML = `
        <div class="topo-plano">
            <div>
                <span class="rotulo-estudos">Plano selecionado</span>
                <h2>${escaparHtml(plano.titulo)}</h2>
                <p>${escaparHtml(objetivo)}</p>
            </div>

            <button class="botao-excluir-plano" data-excluir-plano="${plano.id}" type="button">
                Excluir plano
            </button>
        </div>

        <div class="bloco-progresso">
            <div class="topo-progresso">
                <span>Seu progresso</span>
                <strong>${percentual}%</strong>
            </div>
            <div class="barra-progresso">
                <span style="width: ${percentual}%"></span>
            </div>
        </div>

        <h3 class="titulo-etapas">Etapas da trilha</h3>

        <div class="lista-etapas">
            ${etapasHtml}
        </div>
    `;
}


function criarHtmlEtapa(etapa) {
    const concluida = etapa.status === "concluida";

    let classeConcluida = "";
    if (concluida) {
        classeConcluida = "concluida";
    }

    let numero = etapa.ordem;
    if (concluida) {
        numero = "✓";
    }

    let textoCarga = "Carga horária não informada";
    if (etapa.cargaHorariaEstimada) {
        textoCarga = `${etapa.cargaHorariaEstimada}h estimadas`;
    }

    let textoBotao = "Concluir";
    if (concluida) {
        textoBotao = "Reabrir";
    }

    return `
        <article class="etapa-estudo ${classeConcluida}">
            <div class="identidade-etapa">
                <span class="numero-etapa">${numero}</span>
                <div>
                    <strong>${escaparHtml(etapa.titulo)}</strong>
                    <small>${textoCarga} · ${formatarStatusEtapa(etapa.status)}</small>
                </div>
            </div>

            <button class="botao-etapa" data-alterar-etapa="${etapa.id}" type="button">
                ${textoBotao}
            </button>
        </article>
    `;
}


async function tratarAcaoDetalhe(evento) {
    const botaoEtapa = evento.target.closest("[data-alterar-etapa]");

    if (botaoEtapa) {
        await alterarStatusEtapa(Number(botaoEtapa.dataset.alterarEtapa));
        return;
    }

    const botaoExcluir = evento.target.closest("[data-excluir-plano]");

    if (botaoExcluir) {
        await excluirPlano(Number(botaoExcluir.dataset.excluirPlano));
    }
}


async function alterarStatusEtapa(etapaId) {
    const etapa = encontrarEtapaPeloId(etapaId);

    if (!etapa) {
        return;
    }

    let novoStatus = "concluida";
    if (etapa.status === "concluida") {
        novoStatus = "pendente";
    }

    try {
        await apiRequest(`/etapas-estudo/${etapa.id}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus }),
        });

        await atualizarProgressoPlano(etapa.planoEstudoId, etapa.id, novoStatus);
        await carregarEstudos();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    }
}


function encontrarEtapaPeloId(id) {
    for (const etapa of etapasEstudos) {
        if (etapa.id === id) {
            return etapa;
        }
    }

    return null;
}


async function atualizarProgressoPlano(planoId, etapaAlteradaId, novoStatus) {
    const etapasPlano = [];
    for (const etapa of etapasEstudos) {
        if (etapa.planoEstudoId === planoId) {
            etapasPlano.push(etapa);
        }
    }

    if (etapasPlano.length === 0) {
        return;
    }

    let quantidadeConcluidas = 0;

    for (const etapa of etapasPlano) {
        if (etapa.id === etapaAlteradaId) {
            if (novoStatus === "concluida") {
                quantidadeConcluidas = quantidadeConcluidas + 1;
            }
        } else if (etapa.status === "concluida") {
            quantidadeConcluidas = quantidadeConcluidas + 1;
        }
    }

    const percentual = Math.round((quantidadeConcluidas / etapasPlano.length) * 100);

    let status = "em_andamento";
    if (percentual === 100) {
        status = "concluido";
    }

    await apiRequest(`/planos-estudo/${planoId}`, {
        method: "PUT",
        body: JSON.stringify({ percentualConclusao: percentual, status: status }),
    });
}


async function excluirPlano(planoId) {
    const plano = encontrarPlanoPeloId(planoId);

    if (!plano) {
        return;
    }

    const confirmou = window.confirm(`Excluir "${plano.titulo}"?`);

    if (!confirmou) {
        return;
    }

    try {
        await apiRequest(`/planos-estudo/${planoId}`, { method: "DELETE" });

        planoSelecionadoId = null;

        mostrarMensagem("Plano excluído.", "sucesso");

        await carregarEstudos();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    }
}


function encontrarPlanoPeloId(id) {
    for (const plano of planosEstudos) {
        if (plano.id === id) {
            return plano;
        }
    }

    return null;
}


// ---- Formatação e utilidades ----

function formatarCategoria(valor) {
    const categorias = {
        linguagem: "Linguagem",
        framework: "Framework",
        banco_dados: "Banco de dados",
        ferramenta: "Ferramenta",
        conceito: "Conceito",
        outra: "Outra",
    };

    return categorias[valor] || "Tecnologia";
}


function formatarStatusPlano(valor) {
    const status = {
        nao_iniciado: "Não iniciado",
        em_andamento: "Em andamento",
        pausado: "Pausado",
        concluido: "Concluído",
    };

    return status[valor] || "Não informado";
}


function formatarStatusEtapa(valor) {
    const status = {
        pendente: "Pendente",
        em_andamento: "Em andamento",
        concluida: "Concluída",
    };

    return status[valor] || "Não informado";
}


function normalizarTexto(valor) {
    let texto = valor;
    if (texto === null || texto === undefined) {
        texto = "";
    }

    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


function escaparHtml(valor) {
    let texto = valor;
    if (texto === null || texto === undefined) {
        texto = "";
    }

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;

    clearTimeout(temporizadorMensagem);

    temporizadorMensagem = setTimeout(function () {
        mensagem.classList.add("oculto");
    }, 3500);
}
