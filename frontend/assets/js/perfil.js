// ===================================================
// Página de Perfil (conta estudante)
// Perfil profissional, habilidades, experiência,
// formação e projetos. Contas de empresa são tratadas
// por perfil-empresa.js.
// ===================================================


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


document.addEventListener("DOMContentLoaded", iniciarPaginaPerfil);


async function iniciarPaginaPerfil() {
    registrarEventosPerfil();
    await carregarDadosPerfil();
}


function registrarEventosPerfil() {
    document.getElementById("botao-criar-perfil").addEventListener("click", abrirModalPerfilParaCriar);
    document.getElementById("botao-editar-perfil").addEventListener("click", abrirModalPerfilParaEditar);
    document.getElementById("formulario-perfil").addEventListener("submit", salvarPerfil);

    document.getElementById("botao-nova-experiencia").addEventListener("click", abrirModalNovaExperiencia);
    document.getElementById("formulario-experiencia").addEventListener("submit", salvarExperiencia);
    document.getElementById("lista-experiencias").addEventListener("click", tratarAcaoExperiencia);

    document.getElementById("botao-nova-formacao").addEventListener("click", abrirModalNovaFormacao);
    document.getElementById("formulario-formacao").addEventListener("submit", salvarFormacao);
    document.getElementById("lista-formacoes").addEventListener("click", tratarAcaoFormacao);

    document.getElementById("botao-novo-projeto").addEventListener("click", abrirModalNovoProjeto);
    document.getElementById("formulario-projeto").addEventListener("submit", salvarProjeto);
    document.getElementById("lista-projetos").addEventListener("click", tratarAcaoProjeto);

    document.getElementById("botao-adicionar-habilidade").addEventListener("click", abrirModalHabilidade);
    document.getElementById("formulario-habilidade-perfil").addEventListener("submit", adicionarHabilidade);
    document.getElementById("lista-habilidades-perfil").addEventListener("click", tratarAcaoHabilidade);

    document.getElementById("experiencia-atual").addEventListener("change", atualizarCampoFimExperiencia);
    document.getElementById("formacao-em-andamento").addEventListener("change", atualizarCampoFimFormacao);

    const botoesFechar = document.querySelectorAll("[data-fechar]");
    for (const botao of botoesFechar) {
        botao.addEventListener("click", function () {
            fecharModal(botao.dataset.fechar);
        });
    }
}


function abrirModalPerfilParaCriar() {
    abrirModalPerfil(true);
}


function abrirModalPerfilParaEditar() {
    abrirModalPerfil(false);
}


function abrirModalNovaExperiencia() {
    abrirModalExperiencia(null);
}


function abrirModalNovaFormacao() {
    abrirModalFormacao(null);
}


function abrirModalNovoProjeto() {
    abrirModalProjeto(null);
}


// ---- Carregamento de dados ----

async function carregarDadosPerfil() {
    mostrarCarregamento(true);

    try {
        const sessao = await apiRequest("/autenticacao/sessao");

        if (!sessao.autenticado || !sessao.usuario) {
            return;
        }

        usuarioPaginaPerfil = sessao.usuario;

        if (usuarioPaginaPerfil.tipoConta === "empresa") {
            mostrarCarregamento(false);
            await iniciarPerfilEmpresa(usuarioPaginaPerfil);
            return;
        }

        const perfis = await apiRequest("/perfis-profissionais");
        const habilidades = await apiRequest("/habilidades");
        const perfilHabilidades = await apiRequest("/perfil-habilidades");
        const experiencias = await apiRequest("/experiencias-profissionais");
        const formacoes = await apiRequest("/formacoes-academicas");
        const projetos = await apiRequest("/projetos");

        perfilPaginaPerfil = encontrarPerfilDoUsuarioPagina(perfis);
        habilidadesPaginaPerfil = habilidades || [];

        if (perfilPaginaPerfil) {
            const perfilId = perfilPaginaPerfil.id;

            perfilHabilidadesPaginaPerfil = filtrarPorPerfilId(perfilHabilidades, perfilId);
            experienciasPaginaPerfil = filtrarPorPerfilId(experiencias, perfilId);
            formacoesPaginaPerfil = filtrarPorPerfilId(formacoes, perfilId);
            projetosPaginaPerfil = filtrarPorPerfilId(projetos, perfilId);
        } else {
            perfilHabilidadesPaginaPerfil = [];
            experienciasPaginaPerfil = [];
            formacoesPaginaPerfil = [];
            projetosPaginaPerfil = [];
        }

        renderizarPaginaPerfil();

    } catch (erro) {
        console.error(erro);
        mostrarMensagemPerfil(erro.message || "Não foi possível carregar seu perfil.", "erro");

    } finally {
        mostrarCarregamento(false);
    }
}


function encontrarPerfilDoUsuarioPagina(perfis) {
    for (const perfil of perfis) {
        if (perfil.usuarioId === usuarioPaginaPerfil.id) {
            return perfil;
        }
    }

    return null;
}


function filtrarPorPerfilId(lista, perfilId) {
    const resultado = [];

    for (const item of lista) {
        if (item.perfilProfissionalId === perfilId) {
            resultado.push(item);
        }
    }

    return resultado;
}


// ---- Renderização geral ----

function renderizarPaginaPerfil() {
    const semPerfil = document.getElementById("perfil-nao-criado");
    const conteudo = document.getElementById("conteudo-perfil");

    if (!perfilPaginaPerfil) {
        semPerfil.classList.remove("oculto");
        conteudo.classList.add("oculto");
        return;
    }

    semPerfil.classList.add("oculto");
    conteudo.classList.remove("oculto");

    renderizarIdentidade();
    renderizarSobreMim();
    renderizarExperiencias();
    renderizarFormacoes();
    renderizarProjetos();
    renderizarHabilidades();
    renderizarPreferencias();
}


function renderizarIdentidade() {
    document.getElementById("nome-perfil").textContent = usuarioPaginaPerfil.nome;
    document.getElementById("email-perfil").textContent = usuarioPaginaPerfil.email;

    let objetivo = perfilPaginaPerfil.objetivoProfissional;
    if (!objetivo) {
        objetivo = "Objetivo profissional não informado.";
    }
    document.getElementById("objetivo-resumo").textContent = objetivo;

    document.getElementById("nivel-resumo").textContent = formatarNivelExperiencia(perfilPaginaPerfil.nivelExperiencia);
    document.getElementById("modalidade-resumo").textContent = formatarModalidade(perfilPaginaPerfil.modalidadePreferida);

    let localizacao = perfilPaginaPerfil.localizacaoPreferida;
    if (!localizacao) {
        localizacao = "Localização não informada";
    }
    document.getElementById("localizacao-resumo").textContent = localizacao;

    renderizarFotoPerfil();
    renderizarCurriculo();
}


function renderizarFotoPerfil() {
    const imagem = document.getElementById("imagem-perfil");
    const inicial = document.getElementById("inicial-perfil");

    inicial.textContent = obterInicialPerfil(usuarioPaginaPerfil.nome);

    const fotoUrl = perfilPaginaPerfil.fotoUrl;

    if (!fotoUrl) {
        imagem.classList.add("oculto");
        inicial.classList.remove("oculto");
        imagem.removeAttribute("src");
        return;
    }

    let enderecoFoto = fotoUrl;
    if (!fotoUrl.startsWith("http://") && !fotoUrl.startsWith("https://")) {
        const origemBackend = API_BASE_URL.replace(/\/api$/, "");
        enderecoFoto = `${origemBackend}${fotoUrl}`;
    }

    imagem.onload = function () {
        imagem.classList.remove("oculto");
        inicial.classList.add("oculto");
    };

    imagem.onerror = function () {
        imagem.classList.add("oculto");
        inicial.classList.remove("oculto");
    };

    let separador = "?";
    if (enderecoFoto.includes("?")) {
        separador = "&";
    }
    imagem.src = `${enderecoFoto}${separador}v=${Date.now()}`;
}


function renderizarCurriculo() {
    const link = document.getElementById("link-curriculo");
    const curriculoUrl = perfilPaginaPerfil.curriculoUrl;

    if (!curriculoUrl) {
        link.classList.add("oculto");
        link.removeAttribute("href");
        return;
    }

    if (curriculoUrl.startsWith("http://") || curriculoUrl.startsWith("https://")) {
        link.href = curriculoUrl;
    } else {
        const origemBackend = API_BASE_URL.replace(/\/api$/, "");
        link.href = `${origemBackend}${curriculoUrl}`;
    }

    link.classList.remove("oculto");
}


function renderizarSobreMim() {
    let texto = perfilPaginaPerfil.sobreMim;
    if (!texto) {
        texto = "Você ainda não adicionou uma apresentação ao seu perfil.";
    }
    document.getElementById("texto-sobre-mim").textContent = texto;
}


// ---- Experiência profissional ----

function renderizarExperiencias() {
    const conteiner = document.getElementById("lista-experiencias");

    if (experienciasPaginaPerfil.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma experiência profissional adicionada.
            </div>
        `;
        return;
    }

    const experiencias = experienciasPaginaPerfil.slice();
    experiencias.sort(function (a, b) {
        return obterTempoData(b.dataInicio) - obterTempoData(a.dataInicio);
    });

    let html = "";
    for (const experiencia of experiencias) {
        html = html + criarHtmlExperiencia(experiencia);
    }

    conteiner.innerHTML = html;
}


function criarHtmlExperiencia(experiencia) {
    let descricaoHtml = "";
    if (experiencia.descricao) {
        descricaoHtml = `<p class="descricao-trajetoria">${escaparHtmlPerfil(experiencia.descricao)}</p>`;
    }

    const periodo = formatarPeriodo(experiencia.dataInicio, experiencia.dataFim, experiencia.atual, "Atual");

    return `
        <article class="item-trajetoria">
            <span class="marcador-trajetoria"></span>

            <div class="conteudo-trajetoria">
                <h3>${escaparHtmlPerfil(experiencia.cargo)}</h3>
                <span class="instituicao-trajetoria">${escaparHtmlPerfil(experiencia.empresa)}</span>
                <span class="periodo-trajetoria">${periodo}</span>
                ${descricaoHtml}
            </div>

            <div class="acoes-item">
                <button type="button" class="botao-acao-item" data-editar-experiencia="${experiencia.id}">Editar</button>
                <button type="button" class="botao-acao-item perigo" data-excluir-experiencia="${experiencia.id}">Excluir</button>
            </div>
        </article>
    `;
}


function abrirModalExperiencia(experiencia) {
    let idExistente = null;
    if (experiencia) {
        idExistente = experiencia.id;
    }
    experienciaEmEdicaoId = idExistente;

    document.getElementById("formulario-experiencia").reset();

    let titulo = "Nova experiência";
    if (experiencia) {
        titulo = "Editar experiência";
    }
    document.getElementById("titulo-modal-experiencia").textContent = titulo;

    if (experiencia) {
        document.getElementById("experiencia-cargo").value = experiencia.cargo || "";
        document.getElementById("experiencia-empresa").value = experiencia.empresa || "";
        document.getElementById("experiencia-data-inicio").value = experiencia.dataInicio || "";
        document.getElementById("experiencia-data-fim").value = experiencia.dataFim || "";
        document.getElementById("experiencia-atual").checked = Boolean(experiencia.atual);
        document.getElementById("experiencia-descricao").value = experiencia.descricao || "";
    }

    atualizarCampoFimExperiencia();
    document.getElementById("modal-experiencia").showModal();
}


function atualizarCampoFimExperiencia() {
    const atual = document.getElementById("experiencia-atual").checked;
    const dataFim = document.getElementById("experiencia-data-fim");

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
        perfilProfissionalId: perfilPaginaPerfil.id,
        cargo: obterTextoCampo("experiencia-cargo"),
        empresa: obterTextoCampo("experiencia-empresa"),
        dataInicio: obterTextoCampo("experiencia-data-inicio"),
        dataFim: obterTextoCampo("experiencia-data-fim"),
        atual: document.getElementById("experiencia-atual").checked,
        descricao: obterTextoCampo("experiencia-descricao"),
    };

    try {
        if (experienciaEmEdicaoId) {
            await apiRequest(`/experiencias-profissionais/${experienciaEmEdicaoId}`, {
                method: "PUT",
                body: JSON.stringify(dados),
            });
            mostrarMensagemPerfil("Experiência atualizada.", "sucesso");
        } else {
            await apiRequest("/experiencias-profissionais", {
                method: "POST",
                body: JSON.stringify(dados),
            });
            mostrarMensagemPerfil("Experiência adicionada.", "sucesso");
        }

        fecharModal("modal-experiencia");
        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(erro.message, "erro");
    }
}


async function tratarAcaoExperiencia(evento) {
    const botaoEditar = evento.target.closest("[data-editar-experiencia]");
    const botaoExcluir = evento.target.closest("[data-excluir-experiencia]");

    if (botaoEditar) {
        const id = Number(botaoEditar.dataset.editarExperiencia);
        const experiencia = encontrarExperienciaPeloId(id);

        if (experiencia) {
            abrirModalExperiencia(experiencia);
        }
        return;
    }

    if (botaoExcluir) {
        const id = Number(botaoExcluir.dataset.excluirExperiencia);

        if (!window.confirm("Deseja excluir esta experiência?")) {
            return;
        }

        try {
            await apiRequest(`/experiencias-profissionais/${id}`, { method: "DELETE" });
            mostrarMensagemPerfil("Experiência excluída.", "sucesso");
            await carregarDadosPerfil();

        } catch (erro) {
            mostrarMensagemPerfil(erro.message, "erro");
        }
    }
}


function encontrarExperienciaPeloId(id) {
    for (const experiencia of experienciasPaginaPerfil) {
        if (experiencia.id === id) {
            return experiencia;
        }
    }

    return null;
}


// ---- Formação acadêmica ----

function renderizarFormacoes() {
    const conteiner = document.getElementById("lista-formacoes");

    if (formacoesPaginaPerfil.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma formação acadêmica adicionada.
            </div>
        `;
        return;
    }

    const formacoes = formacoesPaginaPerfil.slice();
    formacoes.sort(function (a, b) {
        return obterTempoData(b.dataInicio) - obterTempoData(a.dataInicio);
    });

    let html = "";
    for (const formacao of formacoes) {
        html = html + criarHtmlFormacao(formacao);
    }

    conteiner.innerHTML = html;
}


function criarHtmlFormacao(formacao) {
    let tipoHtml = "";
    if (formacao.tipoFormacao) {
        tipoHtml = `${escaparHtmlPerfil(formacao.tipoFormacao)} · `;
    }

    let descricaoHtml = "";
    if (formacao.descricao) {
        descricaoHtml = `<p class="descricao-trajetoria">${escaparHtmlPerfil(formacao.descricao)}</p>`;
    }

    const periodo = formatarPeriodo(formacao.dataInicio, formacao.dataFim, formacao.emAndamento, "Em andamento");

    return `
        <article class="item-trajetoria">
            <span class="marcador-trajetoria"></span>

            <div class="conteudo-trajetoria">
                <h3>${escaparHtmlPerfil(formacao.curso)}</h3>
                <span class="instituicao-trajetoria">${escaparHtmlPerfil(formacao.instituicao)}</span>
                <span class="periodo-trajetoria">${tipoHtml}${periodo}</span>
                ${descricaoHtml}
            </div>

            <div class="acoes-item">
                <button type="button" class="botao-acao-item" data-editar-formacao="${formacao.id}">Editar</button>
                <button type="button" class="botao-acao-item perigo" data-excluir-formacao="${formacao.id}">Excluir</button>
            </div>
        </article>
    `;
}


function abrirModalFormacao(formacao) {
    let idExistente = null;
    if (formacao) {
        idExistente = formacao.id;
    }
    formacaoEmEdicaoId = idExistente;

    document.getElementById("formulario-formacao").reset();

    let titulo = "Nova formação";
    if (formacao) {
        titulo = "Editar formação";
    }
    document.getElementById("titulo-modal-formacao").textContent = titulo;

    if (formacao) {
        document.getElementById("formacao-instituicao").value = formacao.instituicao || "";
        document.getElementById("formacao-curso").value = formacao.curso || "";
        document.getElementById("formacao-tipo").value = formacao.tipoFormacao || "";
        document.getElementById("formacao-data-inicio").value = formacao.dataInicio || "";
        document.getElementById("formacao-data-fim").value = formacao.dataFim || "";
        document.getElementById("formacao-em-andamento").checked = Boolean(formacao.emAndamento);
        document.getElementById("formacao-descricao").value = formacao.descricao || "";
    }

    atualizarCampoFimFormacao();
    document.getElementById("modal-formacao").showModal();
}


function atualizarCampoFimFormacao() {
    const emAndamento = document.getElementById("formacao-em-andamento").checked;
    const dataFim = document.getElementById("formacao-data-fim");

    dataFim.disabled = emAndamento;
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
        perfilProfissionalId: perfilPaginaPerfil.id,
        instituicao: obterTextoCampo("formacao-instituicao"),
        curso: obterTextoCampo("formacao-curso"),
        tipoFormacao: obterTextoCampo("formacao-tipo"),
        dataInicio: obterTextoCampo("formacao-data-inicio"),
        dataFim: obterTextoCampo("formacao-data-fim"),
        emAndamento: document.getElementById("formacao-em-andamento").checked,
        descricao: obterTextoCampo("formacao-descricao"),
    };

    try {
        if (formacaoEmEdicaoId) {
            await apiRequest(`/formacoes-academicas/${formacaoEmEdicaoId}`, {
                method: "PUT",
                body: JSON.stringify(dados),
            });
            mostrarMensagemPerfil("Formação atualizada.", "sucesso");
        } else {
            await apiRequest("/formacoes-academicas", {
                method: "POST",
                body: JSON.stringify(dados),
            });
            mostrarMensagemPerfil("Formação adicionada.", "sucesso");
        }

        fecharModal("modal-formacao");
        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(erro.message, "erro");
    }
}


async function tratarAcaoFormacao(evento) {
    const botaoEditar = evento.target.closest("[data-editar-formacao]");
    const botaoExcluir = evento.target.closest("[data-excluir-formacao]");

    if (botaoEditar) {
        const id = Number(botaoEditar.dataset.editarFormacao);
        const formacao = encontrarFormacaoPeloId(id);

        if (formacao) {
            abrirModalFormacao(formacao);
        }
        return;
    }

    if (botaoExcluir) {
        const id = Number(botaoExcluir.dataset.excluirFormacao);

        if (!window.confirm("Deseja excluir esta formação?")) {
            return;
        }

        try {
            await apiRequest(`/formacoes-academicas/${id}`, { method: "DELETE" });
            mostrarMensagemPerfil("Formação excluída.", "sucesso");
            await carregarDadosPerfil();

        } catch (erro) {
            mostrarMensagemPerfil(erro.message, "erro");
        }
    }
}


function encontrarFormacaoPeloId(id) {
    for (const formacao of formacoesPaginaPerfil) {
        if (formacao.id === id) {
            return formacao;
        }
    }

    return null;
}


// ---- Projetos ----

function renderizarProjetos() {
    const conteiner = document.getElementById("lista-projetos");

    if (projetosPaginaPerfil.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhum projeto ou atividade adicionado.
            </div>
        `;
        return;
    }

    let html = "";
    for (const projeto of projetosPaginaPerfil) {
        html = html + criarHtmlProjeto(projeto);
    }

    conteiner.innerHTML = html;
}


function criarHtmlProjeto(projeto) {
    let tecnologiasHtml = "";
    if (projeto.tecnologias) {
        tecnologiasHtml = `<p class="tecnologias-projeto">${escaparHtmlPerfil(projeto.tecnologias)}</p>`;
    }

    let descricao = "Sem descrição cadastrada.";
    if (projeto.descricao) {
        descricao = escaparHtmlPerfil(projeto.descricao);
    }

    let linkHtml = "";
    if (projeto.link) {
        const urlSegura = escaparAtributoPerfil(projeto.link);
        linkHtml = `<a href="${urlSegura}" class="link-projeto" target="_blank" rel="noopener noreferrer">Ver projeto</a>`;
    }

    return `
        <article class="cartao-projeto">
            <div class="cabecalho-projeto">
                <h3>${escaparHtmlPerfil(projeto.nome)}</h3>

                <div class="acoes-item">
                    <button type="button" class="botao-acao-item" data-editar-projeto="${projeto.id}">Editar</button>
                    <button type="button" class="botao-acao-item perigo" data-excluir-projeto="${projeto.id}">Excluir</button>
                </div>
            </div>

            ${tecnologiasHtml}
            <p class="descricao-projeto">${descricao}</p>
            ${linkHtml}
        </article>
    `;
}


function abrirModalProjeto(projeto) {
    let idExistente = null;
    if (projeto) {
        idExistente = projeto.id;
    }
    projetoEmEdicaoId = idExistente;

    document.getElementById("formulario-projeto").reset();

    let titulo = "Novo projeto";
    if (projeto) {
        titulo = "Editar projeto";
    }
    document.getElementById("titulo-modal-projeto").textContent = titulo;

    if (projeto) {
        document.getElementById("projeto-nome").value = projeto.nome || "";
        document.getElementById("projeto-tecnologias").value = projeto.tecnologias || "";
        document.getElementById("projeto-link").value = projeto.link || "";
        document.getElementById("projeto-descricao").value = projeto.descricao || "";
    }

    document.getElementById("modal-projeto").showModal();
}


async function salvarProjeto(evento) {
    evento.preventDefault();

    if (!perfilPaginaPerfil) {
        return;
    }

    const dados = {
        perfilProfissionalId: perfilPaginaPerfil.id,
        nome: obterTextoCampo("projeto-nome"),
        tecnologias: obterTextoCampo("projeto-tecnologias"),
        link: obterTextoCampo("projeto-link"),
        descricao: obterTextoCampo("projeto-descricao"),
    };

    try {
        if (projetoEmEdicaoId) {
            await apiRequest(`/projetos/${projetoEmEdicaoId}`, {
                method: "PUT",
                body: JSON.stringify(dados),
            });
            mostrarMensagemPerfil("Projeto atualizado.", "sucesso");
        } else {
            await apiRequest("/projetos", {
                method: "POST",
                body: JSON.stringify(dados),
            });
            mostrarMensagemPerfil("Projeto adicionado.", "sucesso");
        }

        fecharModal("modal-projeto");
        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(erro.message, "erro");
    }
}


async function tratarAcaoProjeto(evento) {
    const botaoEditar = evento.target.closest("[data-editar-projeto]");
    const botaoExcluir = evento.target.closest("[data-excluir-projeto]");

    if (botaoEditar) {
        const id = Number(botaoEditar.dataset.editarProjeto);
        const projeto = encontrarProjetoPeloId(id);

        if (projeto) {
            abrirModalProjeto(projeto);
        }
        return;
    }

    if (botaoExcluir) {
        const id = Number(botaoExcluir.dataset.excluirProjeto);

        if (!window.confirm("Deseja excluir este projeto?")) {
            return;
        }

        try {
            await apiRequest(`/projetos/${id}`, { method: "DELETE" });
            mostrarMensagemPerfil("Projeto excluído.", "sucesso");
            await carregarDadosPerfil();

        } catch (erro) {
            mostrarMensagemPerfil(erro.message, "erro");
        }
    }
}


function encontrarProjetoPeloId(id) {
    for (const projeto of projetosPaginaPerfil) {
        if (projeto.id === id) {
            return projeto;
        }
    }

    return null;
}


// ---- Habilidades do perfil ----

function renderizarHabilidades() {
    const conteiner = document.getElementById("lista-habilidades-perfil");

    if (perfilHabilidadesPaginaPerfil.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma habilidade adicionada ao perfil.
            </div>
        `;
        return;
    }

    let html = "";
    for (const associacao of perfilHabilidadesPaginaPerfil) {
        const habilidade = encontrarHabilidadePeloIdPagina(associacao.habilidadeId);

        if (habilidade) {
            html = html + criarHtmlItemHabilidade(associacao, habilidade);
        }
    }

    conteiner.innerHTML = html;
}


function encontrarHabilidadePeloIdPagina(id) {
    for (const habilidade of habilidadesPaginaPerfil) {
        if (habilidade.id === id) {
            return habilidade;
        }
    }

    return null;
}


function criarHtmlItemHabilidade(associacao, habilidade) {
    return `
        <div class="item-habilidade-perfil">
            <div class="dados-habilidade-perfil">
                <strong>${escaparHtmlPerfil(habilidade.nome)}</strong>
                <span>${formatarCategoriaHabilidade(habilidade.categoria)}</span>
            </div>

            <span class="nivel-habilidade">${formatarNivelHabilidade(associacao.nivelDominio)}</span>

            <button type="button" class="botao-remover-habilidade" data-remover-habilidade="${associacao.id}" title="Remover habilidade">
                ×
            </button>
        </div>
    `;
}


function abrirModalHabilidade() {
    const seletor = document.getElementById("habilidade-selecionada");

    const idsAssociados = [];
    for (const item of perfilHabilidadesPaginaPerfil) {
        idsAssociados.push(item.habilidadeId);
    }

    const disponiveis = [];
    for (const habilidade of habilidadesPaginaPerfil) {
        if (!idEstaNaListaPagina(idsAssociados, habilidade.id)) {
            disponiveis.push(habilidade);
        }
    }

    disponiveis.sort(function (a, b) {
        return a.nome.localeCompare(b.nome, "pt-BR");
    });

    let opcoesHtml = "";
    for (const habilidade of disponiveis) {
        opcoesHtml = opcoesHtml + `<option value="${habilidade.id}">${escaparHtmlPerfil(habilidade.nome)}</option>`;
    }

    seletor.innerHTML = `<option value="">Selecione uma habilidade</option>${opcoesHtml}`;

    document.getElementById("habilidade-nivel").value = "basico";
    document.getElementById("modal-habilidade-perfil").showModal();
}


function idEstaNaListaPagina(lista, valor) {
    for (const item of lista) {
        if (item === valor) {
            return true;
        }
    }

    return false;
}


async function adicionarHabilidade(evento) {
    evento.preventDefault();

    if (!perfilPaginaPerfil) {
        return;
    }

    const habilidadeId = Number(document.getElementById("habilidade-selecionada").value);
    const nivelDominio = document.getElementById("habilidade-nivel").value;

    if (!habilidadeId) {
        mostrarMensagemPerfil("Selecione uma habilidade.", "erro");
        return;
    }

    try {
        await apiRequest("/perfil-habilidades", {
            method: "POST",
            body: JSON.stringify({
                perfilProfissionalId: perfilPaginaPerfil.id,
                habilidadeId: habilidadeId,
                nivelDominio: nivelDominio,
            }),
        });

        fecharModal("modal-habilidade-perfil");
        mostrarMensagemPerfil("Habilidade adicionada.", "sucesso");
        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(erro.message, "erro");
    }
}


async function tratarAcaoHabilidade(evento) {
    const botao = evento.target.closest("[data-remover-habilidade]");

    if (!botao) {
        return;
    }

    const id = Number(botao.dataset.removerHabilidade);

    if (!window.confirm("Deseja remover esta habilidade do perfil?")) {
        return;
    }

    try {
        await apiRequest(`/perfil-habilidades/${id}`, { method: "DELETE" });
        mostrarMensagemPerfil("Habilidade removida.", "sucesso");
        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(erro.message, "erro");
    }
}


// ---- Preferências e dados do perfil ----

function renderizarPreferencias() {
    document.getElementById("preferencia-modalidade").textContent = formatarModalidade(perfilPaginaPerfil.modalidadePreferida);

    let localizacao = perfilPaginaPerfil.localizacaoPreferida;
    if (!localizacao) {
        localizacao = "Não informada";
    }
    document.getElementById("preferencia-localizacao").textContent = localizacao;

    document.getElementById("preferencia-salarial").textContent = formatarSalario(perfilPaginaPerfil.pretensaoSalarial);
}


function abrirModalPerfil(criando) {
    const modal = document.getElementById("modal-perfil");

    let titulo = "Editar perfil";
    if (criando) {
        titulo = "Criar perfil";
    }
    document.getElementById("titulo-modal-perfil").textContent = titulo;

    document.getElementById("formulario-perfil").reset();

    if (perfilPaginaPerfil && !criando) {
        document.getElementById("perfil-sobre-mim").value = perfilPaginaPerfil.sobreMim || "";
        document.getElementById("perfil-objetivo").value = perfilPaginaPerfil.objetivoProfissional || "";
        document.getElementById("perfil-nivel").value = perfilPaginaPerfil.nivelExperiencia || "";
        document.getElementById("perfil-modalidade").value = perfilPaginaPerfil.modalidadePreferida || "";
        document.getElementById("perfil-localizacao").value = perfilPaginaPerfil.localizacaoPreferida || "";

        let pretensao = perfilPaginaPerfil.pretensaoSalarial;
        if (pretensao === null || pretensao === undefined) {
            pretensao = "";
        }
        document.getElementById("perfil-pretensao").value = pretensao;
    }

    modal.showModal();
}


async function salvarPerfil(evento) {
    evento.preventDefault();

    const arquivoFoto = document.getElementById("perfil-foto-arquivo").files[0] || null;
    const arquivoCurriculo = document.getElementById("perfil-curriculo-arquivo").files[0] || null;

    const dados = {
        sobreMim: obterTextoCampo("perfil-sobre-mim"),
        objetivoProfissional: obterTextoCampo("perfil-objetivo"),
        nivelExperiencia: obterTextoCampo("perfil-nivel"),
        modalidadePreferida: obterTextoCampo("perfil-modalidade"),
        localizacaoPreferida: obterTextoCampo("perfil-localizacao"),
        pretensaoSalarial: obterNumeroCampo("perfil-pretensao"),
    };

    try {
        validarArquivoFoto(arquivoFoto);
        validarArquivoCurriculo(arquivoCurriculo);

        const perfilJaExistia = Boolean(perfilPaginaPerfil);
        let perfilSalvo = null;

        if (perfilPaginaPerfil) {
            perfilSalvo = await apiRequest(`/perfis-profissionais/${perfilPaginaPerfil.id}`, {
                method: "PUT",
                body: JSON.stringify(dados),
            });
        } else {
            const dadosParaCriar = Object.assign({ usuarioId: usuarioPaginaPerfil.id }, dados);

            perfilSalvo = await apiRequest("/perfis-profissionais", {
                method: "POST",
                body: JSON.stringify(dadosParaCriar),
            });
        }

        if (arquivoFoto) {
            const formularioFoto = new FormData();
            formularioFoto.append("foto", arquivoFoto);

            await apiRequest(`/perfis-profissionais/${perfilSalvo.id}/foto`, {
                method: "POST",
                body: formularioFoto,
            });
        }

        if (arquivoCurriculo) {
            const formularioCurriculo = new FormData();
            formularioCurriculo.append("curriculo", arquivoCurriculo);

            await apiRequest(`/perfis-profissionais/${perfilSalvo.id}/curriculo`, {
                method: "POST",
                body: formularioCurriculo,
            });
        }

        fecharModal("modal-perfil");

        let mensagem = "Perfil criado com sucesso.";
        if (perfilJaExistia) {
            mensagem = "Perfil atualizado com sucesso.";
        }
        mostrarMensagemPerfil(mensagem, "sucesso");

        await carregarDadosPerfil();

    } catch (erro) {
        mostrarMensagemPerfil(erro.message, "erro");
    }
}


function validarArquivoFoto(arquivo) {
    if (!arquivo) {
        return;
    }

    const nome = arquivo.name.toLowerCase();
    const extensaoValida = nome.endsWith(".png") || nome.endsWith(".jpg") || nome.endsWith(".jpeg");
    const tipoValido = arquivo.type === "image/png" || arquivo.type === "image/jpeg";

    if (!extensaoValida || !tipoValido) {
        throw new Error("A foto deve estar no formato PNG ou JPEG.");
    }

    if (arquivo.size > 3 * 1024 * 1024) {
        throw new Error("A foto deve possuir no máximo 3 MB.");
    }
}


function validarArquivoCurriculo(arquivo) {
    if (!arquivo) {
        return;
    }

    const nome = arquivo.name.toLowerCase();

    if (arquivo.type !== "application/pdf" && !nome.endsWith(".pdf")) {
        throw new Error("O currículo deve estar no formato PDF.");
    }

    if (arquivo.size > 5 * 1024 * 1024) {
        throw new Error("O currículo deve possuir no máximo 5 MB.");
    }
}


// ---- Utilidades gerais ----

function mostrarCarregamento(carregando) {
    document.getElementById("carregando-perfil").classList.toggle("oculto", !carregando);
}


function fecharModal(id) {
    const modal = document.getElementById(id);

    if (modal && modal.open) {
        modal.close();
    }
}


function obterTextoCampo(id) {
    return document.getElementById(id).value.trim();
}


function obterNumeroCampo(id) {
    const valor = document.getElementById(id).value;

    if (valor === "") {
        return null;
    }

    return Number(valor);
}


function obterInicialPerfil(nome) {
    if (!nome) {
        return "U";
    }

    return nome.trim().charAt(0).toUpperCase();
}


function formatarNivelExperiencia(nivel) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return valores[nivel] || "Nível não informado";
}


function formatarModalidade(modalidade) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return valores[modalidade] || "Não informada";
}


function formatarNivelHabilidade(nivel) {
    const valores = {
        basico: "Básico",
        intermediario: "Intermediário",
        avancado: "Avançado",
    };

    return valores[nivel] || nivel || "Não informado";
}


function formatarCategoriaHabilidade(categoria) {
    const valores = {
        linguagem: "Linguagem",
        framework: "Framework",
        banco_dados: "Banco de dados",
        ferramenta: "Ferramenta",
        conceito: "Conceito",
        outra: "Outra",
    };

    return valores[categoria] || "Competência";
}


function formatarSalario(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "Não informada";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "Não informada";
    }

    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


function formatarPeriodo(inicio, fim, atual, textoAtual) {
    const inicioFormatado = formatarMesAno(inicio);

    let fimFormatado = formatarMesAno(fim);
    if (atual) {
        fimFormatado = textoAtual;
    }

    if (!inicioFormatado && !fimFormatado) {
        return "Período não informado";
    }

    if (!inicioFormatado) {
        return fimFormatado;
    }

    if (!fimFormatado) {
        return inicioFormatado;
    }

    return `${inicioFormatado} — ${fimFormatado}`;
}


function formatarMesAno(valor) {
    if (!valor) {
        return "";
    }

    const partes = valor.split("-");

    if (partes.length < 2) {
        return valor;
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);

    if (!ano || !mes) {
        return valor;
    }

    const data = new Date(ano, mes - 1, 1);

    return data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}


function obterTempoData(valor) {
    if (!valor) {
        return 0;
    }

    const tempo = new Date(valor).getTime();

    if (Number.isNaN(tempo)) {
        return 0;
    }

    return tempo;
}


function escaparHtmlPerfil(valor) {
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


function escaparAtributoPerfil(valor) {
    return escaparHtmlPerfil(valor);
}


function mostrarMensagemPerfil(mensagem, tipo) {
    if (!tipo) {
        tipo = "sucesso";
    }

    const elemento = document.getElementById("mensagem-sistema");

    clearTimeout(temporizadorMensagemPerfil);

    elemento.textContent = mensagem;
    elemento.className = `mensagem-sistema ${tipo} visivel`;

    temporizadorMensagemPerfil = setTimeout(function () {
        elemento.className = "mensagem-sistema";
    }, 3500);
}
