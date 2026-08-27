// ===================================================
// Página de Talentos (visão da empresa)
// ===================================================
// Este arquivo foi escrito com JavaScript básico:
// variáveis, arrays, if/else, for/for...of, funções
// tradicionais, eventos, DOM e await.
// ===================================================


// ----- Variáveis globais da página -----

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
let rankingBancoTalentos = [];

let temporizadorMensagemTalentos = null;


document.addEventListener("DOMContentLoaded", iniciarPaginaTalentos);


// ----- Início da página -----

async function iniciarPaginaTalentos() {
    const estado = document.getElementById("estado-talentos");

    try {
        const sessao = await apiRequest("/autenticacao/sessao");

        if (!sessao.autenticado || !sessao.usuario) {
            window.location.href = "./login.html";
            return;
        }

        usuarioTalentos = sessao.usuario;

        if (usuarioTalentos.tipoConta !== "empresa") {
            window.location.href = "../index.html";
            return;
        }

        await carregarDadosTalentos();

        if (!empresaTalentos) {
            throw new Error("Não foi possível localizar a empresa vinculada à sua conta.");
        }

        montarTalentos();
        preencherFiltrosTalentos();
        preencherVagasComparacao();
        registrarEventosTalentos();
        aplicarFiltrosTalentos();

    } catch (erro) {
        estado.textContent = erro.message || "Não foi possível carregar os profissionais.";
    }
}


// Busca, uma de cada vez, todos os dados que a página precisa.
async function carregarDadosTalentos() {
    const usuarios = await apiRequest("/talentos");
    usuariosTalentos = usuarios || [];

    const empresas = await apiRequest("/empresas") || [];
    empresaTalentos = null;
    for (const empresa of empresas) {
        if (empresa.usuarioId === usuarioTalentos.id) {
            empresaTalentos = empresa;
            break;
        }
    }

    const perfis = await apiRequest("/perfis-profissionais");
    perfisTalentos = perfis || [];

    const perfisHabilidades = await apiRequest("/perfil-habilidades");
    perfilHabilidadesTalentos = perfisHabilidades || [];

    const habilidades = await apiRequest("/habilidades");
    habilidadesTalentos = habilidades || [];

    const vagas = await apiRequest("/vagas");
    vagasTalentos = vagas || [];

    const requisitos = await apiRequest("/requisitos-vaga");
    requisitosVagaTalentos = requisitos || [];

    const experiencias = await apiRequest("/experiencias-profissionais");
    experienciasTalentos = experiencias || [];

    const formacoes = await apiRequest("/formacoes-academicas");
    formacoesTalentos = formacoes || [];

    const projetos = await apiRequest("/projetos");
    projetosTalentos = projetos || [];
}


// ----- Montagem da lista de talentos -----

function montarTalentos() {
    talentosMontados = [];

    for (const perfil of perfisTalentos) {
        const usuario = encontrarUsuarioPeloId(perfil.usuarioId);

        if (!usuario) {
            continue;
        }

        if (usuario.tipoConta !== "estudante" || usuario.status !== "ativo") {
            continue;
        }

        const talento = {
            usuario: usuario,
            perfil: perfil,
            habilidades: montarHabilidadesDoPerfil(perfil.id),
            experiencias: filtrarPorPerfil(experienciasTalentos, perfil.id),
            formacoes: filtrarPorPerfil(formacoesTalentos, perfil.id),
            projetos: filtrarPorPerfil(projetosTalentos, perfil.id),
            match: null
        };

        talentosMontados.push(talento);
    }
}


function encontrarUsuarioPeloId(id) {
    for (const usuario of usuariosTalentos) {
        if (usuario.id === id) {
            return usuario;
        }
    }
    return null;
}


function montarHabilidadesDoPerfil(perfilId) {
    const lista = [];

    for (const item of perfilHabilidadesTalentos) {
        if (item.perfilProfissionalId !== perfilId) {
            continue;
        }

        const habilidade = encontrarHabilidadePeloId(item.habilidadeId);

        if (!habilidade) {
            continue;
        }

        item.habilidade = habilidade;
        lista.push(item);
    }

    return lista;
}


function encontrarHabilidadePeloId(id) {
    for (const habilidade of habilidadesTalentos) {
        if (habilidade.id === id) {
            return habilidade;
        }
    }
    return null;
}


function filtrarPorPerfil(lista, perfilId) {
    const resultado = [];

    for (const item of lista) {
        if (item.perfilProfissionalId === perfilId) {
            resultado.push(item);
        }
    }

    return resultado;
}


// ----- Filtros e comparação com vaga (preenchimento dos selects) -----

function preencherFiltrosTalentos() {
    const niveis = [];
    const modalidades = [];
    const localizacoes = [];

    for (const talento of talentosMontados) {
        niveis.push(talento.perfil.nivelExperiencia);
        modalidades.push(talento.perfil.modalidadePreferida);
        localizacoes.push(talento.perfil.localizacaoPreferida);
    }

    preencherSelectTalentos("filtro-nivel-talentos", valoresUnicosTalentos(niveis), formatarNivelExperienciaTalentos);
    preencherSelectTalentos("filtro-modalidade-talentos", valoresUnicosTalentos(modalidades), formatarModalidadeTalentos);
    preencherSelectTalentos("filtro-localizacao-talentos", valoresUnicosTalentos(localizacoes), null);

    preencherSelectHabilidades();
}


function preencherSelectTalentos(id, valores, formatador) {
    const select = document.getElementById(id);

    for (const valor of valores) {
        const option = document.createElement("option");
        option.value = valor;

        if (formatador) {
            option.textContent = formatador(valor);
        } else {
            option.textContent = valor;
        }

        select.appendChild(option);
    }
}


function preencherSelectHabilidades() {
    const habilidadesOrdenadas = habilidadesTalentos.slice();

    habilidadesOrdenadas.sort(function (a, b) {
        return a.nome.localeCompare(b.nome, "pt-BR");
    });

    const select = document.getElementById("filtro-habilidade-talentos");

    for (const habilidade of habilidadesOrdenadas) {
        const option = document.createElement("option");
        option.value = String(habilidade.id);
        option.textContent = habilidade.nome;
        select.appendChild(option);
    }
}


function preencherVagasComparacao() {
    const select = document.getElementById("comparar-vaga-talentos");
    const vagasEmpresa = [];

    for (const vaga of vagasTalentos) {
        if (vaga.empresaId === empresaTalentos.id && vaga.status !== "encerrada") {
            vagasEmpresa.push(vaga);
        }
    }

    vagasEmpresa.sort(function (a, b) {
        return a.titulo.localeCompare(b.titulo, "pt-BR");
    });

    for (const vaga of vagasEmpresa) {
        const option = document.createElement("option");
        option.value = String(vaga.id);
        option.textContent = vaga.titulo + " · " + formatarStatusVagaTalentos(vaga.status);
        select.appendChild(option);
    }
}


// ----- Eventos da página -----

function registrarEventosTalentos() {
    const idsFiltros = [
        "busca-talentos",
        "filtro-nivel-talentos",
        "filtro-modalidade-talentos",
        "filtro-localizacao-talentos",
        "filtro-habilidade-talentos"
    ];

    for (const id of idsFiltros) {
        const elemento = document.getElementById(id);

        if (elemento.tagName === "INPUT") {
            elemento.addEventListener("input", aplicarFiltrosTalentos);
        } else {
            elemento.addEventListener("change", aplicarFiltrosTalentos);
        }
    }

    document.getElementById("comparar-vaga-talentos").addEventListener("change", alterarComparacaoTalentos);

    document.getElementById("grade-talentos").addEventListener("click", function (evento) {
        const botao = evento.target.closest("[data-ver-talento]");

        if (!botao) {
            return;
        }

        abrirPainelTalento(Number(botao.dataset.verTalento));
    });
}


// ----- Comparação com vaga (ranking vindo do backend) -----

async function alterarComparacaoTalentos() {
    const select = document.getElementById("comparar-vaga-talentos");
    const vagaId = Number(select.value);

    if (!vagaId) {
        vagaComparacaoTalentos = null;
        rankingBancoTalentos = [];
        aplicarMatchNosTalentos();
        aplicarFiltrosTalentos();
        return;
    }

    vagaComparacaoTalentos = encontrarVagaPeloId(vagaId);

    if (!vagaComparacaoTalentos) {
        aplicarFiltrosTalentos();
        return;
    }

    select.disabled = true;

    try {
        const ranking = await apiRequest("/talentos/ranking?vagaId=" + vagaComparacaoTalentos.id);
        rankingBancoTalentos = ranking || [];
        aplicarMatchNosTalentos();
        aplicarFiltrosTalentos();

    } catch (erro) {
        rankingBancoTalentos = [];
        vagaComparacaoTalentos = null;
        select.value = "";
        aplicarMatchNosTalentos();
        aplicarFiltrosTalentos();
        mostrarMensagemTalentos(erro.message || "Não foi possível calcular o ranking de talentos.");

    } finally {
        select.disabled = false;
    }
}


function encontrarVagaPeloId(id) {
    for (const vaga of vagasTalentos) {
        if (vaga.id === id) {
            return vaga;
        }
    }
    return null;
}


// O percentual de compatibilidade vem SEMPRE do backend (/talentos/ranking).
// Aqui só organizamos, com loops simples, quais requisitos foram
// atendidos e quais estão faltando, para exibir na tela.
function aplicarMatchNosTalentos() {
    if (!vagaComparacaoTalentos) {
        for (const talento of talentosMontados) {
            talento.match = null;
        }
        return;
    }

    const requisitos = filtrarPorVaga(requisitosVagaTalentos, vagaComparacaoTalentos.id);

    for (const talento of talentosMontados) {
        const percentual = encontrarPercentualNoRanking(talento.perfil.id);
        const detalheRequisitos = verificarRequisitosTalento(talento, requisitos);

        talento.match = {
            percentual: percentual,
            requisitos: detalheRequisitos.todos,
            atendidos: detalheRequisitos.atendidos,
            faltantes: detalheRequisitos.faltantes
        };
    }
}


function filtrarPorVaga(lista, vagaId) {
    const resultado = [];

    for (const item of lista) {
        if (item.vagaId === vagaId) {
            resultado.push(item);
        }
    }

    return resultado;
}


function encontrarPercentualNoRanking(perfilId) {
    for (const item of rankingBancoTalentos) {
        if (Number(item.perfilId) === perfilId) {
            return Number(item.percentualMatch);
        }
    }
    return 0;
}


function verificarRequisitosTalento(talento, requisitos) {
    const todos = [];
    const atendidos = [];
    const faltantes = [];

    for (const requisito of requisitos) {
        const habilidade = encontrarHabilidadePeloId(requisito.habilidadeId);
        const habilidadePerfil = encontrarHabilidadeDoTalento(talento, requisito.habilidadeId);

        let atendido = false;

        if (habilidadePerfil) {
            const nivelPerfil = obterPesoNivelHabilidade(habilidadePerfil.nivelDominio);
            const nivelExigido = obterPesoNivelHabilidade(requisito.nivelExigido);

            if (nivelPerfil >= nivelExigido) {
                atendido = true;
            }
        }

        const item = {
            requisito: requisito,
            habilidade: habilidade,
            atendido: atendido
        };

        todos.push(item);

        if (atendido) {
            atendidos.push(item);
        } else {
            faltantes.push(item);
        }
    }

    return {
        todos: todos,
        atendidos: atendidos,
        faltantes: faltantes
    };
}


function encontrarHabilidadeDoTalento(talento, habilidadeId) {
    for (const item of talento.habilidades) {
        if (item.habilidadeId === habilidadeId) {
            return item;
        }
    }
    return null;
}


// ----- Busca, filtros e ordenação -----

function aplicarFiltrosTalentos() {
    const busca = normalizarTextoTalentos(document.getElementById("busca-talentos").value);
    const nivel = document.getElementById("filtro-nivel-talentos").value;
    const modalidade = document.getElementById("filtro-modalidade-talentos").value;
    const localizacao = document.getElementById("filtro-localizacao-talentos").value;
    const habilidadeId = Number(document.getElementById("filtro-habilidade-talentos").value);

    const resultado = [];

    for (const talento of talentosMontados) {
        if (talentoAtendeFiltros(talento, busca, nivel, modalidade, localizacao, habilidadeId)) {
            resultado.push(talento);
        }
    }

    ordenarTalentos(resultado);
    renderizarTalentos(resultado);
}


function talentoAtendeFiltros(talento, busca, nivel, modalidade, localizacao, habilidadeId) {
    if (busca) {
        const textoBusca = montarTextoBuscaTalento(talento);
        if (textoBusca.indexOf(busca) === -1) {
            return false;
        }
    }

    if (nivel && talento.perfil.nivelExperiencia !== nivel) {
        return false;
    }

    if (modalidade && talento.perfil.modalidadePreferida !== modalidade) {
        return false;
    }

    if (localizacao && talento.perfil.localizacaoPreferida !== localizacao) {
        return false;
    }

    if (habilidadeId && !talentoTemHabilidade(talento, habilidadeId)) {
        return false;
    }

    return true;
}


function talentoTemHabilidade(talento, habilidadeId) {
    for (const item of talento.habilidades) {
        if (item.habilidadeId === habilidadeId) {
            return true;
        }
    }
    return false;
}


function montarTextoBuscaTalento(talento) {
    let nomesHabilidades = "";
    for (const item of talento.habilidades) {
        nomesHabilidades += item.habilidade.nome + " ";
    }

    let textoExperiencias = "";
    for (const experiencia of talento.experiencias) {
        textoExperiencias += experiencia.cargo + " " + experiencia.empresa + " ";
        if (experiencia.descricao) {
            textoExperiencias += experiencia.descricao + " ";
        }
    }

    let texto = talento.usuario.nome + " ";
    texto += (talento.perfil.objetivoProfissional || "") + " ";
    texto += (talento.perfil.localizacaoPreferida || "") + " ";
    texto += nomesHabilidades + " ";
    texto += textoExperiencias;

    return normalizarTextoTalentos(texto);
}


function ordenarTalentos(lista) {
    if (vagaComparacaoTalentos) {
        lista.sort(function (a, b) {
            const percentualA = a.match ? a.match.percentual : 0;
            const percentualB = b.match ? b.match.percentual : 0;
            return percentualB - percentualA;
        });
    } else {
        lista.sort(function (a, b) {
            return a.usuario.nome.localeCompare(b.usuario.nome, "pt-BR");
        });
    }
}


// ----- Renderização da grade de talentos -----

function renderizarTalentos(talentos) {
    const estado = document.getElementById("estado-talentos");
    const grade = document.getElementById("grade-talentos");
    const indicador = document.getElementById("indicador-comparacao-talentos");

    document.getElementById("quantidade-talentos").textContent = talentos.length;

    if (vagaComparacaoTalentos) {
        indicador.classList.remove("oculto");
    } else {
        indicador.classList.add("oculto");
    }

    if (talentos.length === 0) {
        grade.classList.add("oculto");
        estado.classList.remove("oculto");
        estado.textContent = "Nenhum profissional corresponde aos filtros selecionados.";
        return;
    }

    estado.classList.add("oculto");
    grade.classList.remove("oculto");

    let html = "";
    for (const talento of talentos) {
        html += renderizarCartaoTalento(talento);
    }

    grade.innerHTML = html;
}


function renderizarCartaoTalento(talento) {
    const foto = renderizarFotoTalento(talento, false);
    const nome = escaparHtmlTalentos(talento.usuario.nome);

    let objetivo = "Objetivo profissional não informado";
    if (talento.perfil.objetivoProfissional) {
        objetivo = talento.perfil.objetivoProfissional;
    }
    objetivo = escaparHtmlTalentos(objetivo);

    let localizacao = "Localização não informada";
    if (talento.perfil.localizacaoPreferida) {
        localizacao = talento.perfil.localizacaoPreferida;
    }
    localizacao = escaparHtmlTalentos(localizacao);

    const modalidade = formatarModalidadeTalentos(talento.perfil.modalidadePreferida);
    const nivel = formatarNivelExperienciaTalentos(talento.perfil.nivelExperiencia);

    const tagsHtml = renderizarTagsHabilidades(talento.habilidades, 4, false);
    const compatibilidadeHtml = renderizarCompatibilidadeCartao(talento.match);

    return `
        <article class="cartao-talento">
            <div class="cabecalho-talento">
                ${foto}
                <div class="identidade-talento">
                    <h3>${nome}</h3>
                    <div class="objetivo-talento">${objetivo}</div>
                </div>
            </div>

            <div class="localizacao-talento">${localizacao} · ${modalidade}</div>

            <div class="tags-talento">${tagsHtml}</div>

            ${compatibilidadeHtml}

            <div class="rodape-cartao-talento">
                <span class="nivel-talento">${nivel}</span>
                <button type="button" class="botao-ver-talento" data-ver-talento="${talento.perfil.id}">
                    Ver perfil
                </button>
            </div>
        </article>
    `;
}


function renderizarTagsHabilidades(habilidades, limite, comNivel) {
    if (habilidades.length === 0) {
        return '<span class="sem-habilidades-talento">Nenhuma habilidade cadastrada.</span>';
    }

    let quantidade = habilidades.length;
    if (limite && limite < quantidade) {
        quantidade = limite;
    }

    let html = "";

    for (let i = 0; i < quantidade; i++) {
        const item = habilidades[i];
        const nome = escaparHtmlTalentos(item.habilidade.nome);

        if (comNivel) {
            const nivel = formatarNivelHabilidadeTalentos(item.nivelDominio);
            html += `<span class="tag-talento">${nome} · ${nivel}</span>`;
        } else {
            html += `<span class="tag-talento">${nome}</span>`;
        }
    }

    return html;
}


function renderizarCompatibilidadeCartao(match) {
    if (!match) {
        return "";
    }

    return `
        <div class="compatibilidade-talento">
            <div class="linha-compatibilidade-talento">
                <span>Compatibilidade</span>
                <strong>${match.percentual}%</strong>
            </div>

            <div class="barra-match-talento">
                <div style="width: ${match.percentual}%"></div>
            </div>

            <div class="resumo-requisitos-talento">
                <span class="requisito-atendido">✓ ${match.atendidos.length} atendidos</span>
                <span class="requisito-faltante">× ${match.faltantes.length} faltantes</span>
            </div>
        </div>
    `;
}


// ----- Painel (modal) com o perfil completo do talento -----

function abrirPainelTalento(perfilId) {
    const talento = encontrarTalentoPeloPerfilId(perfilId);

    if (!talento) {
        return;
    }

    const painel = document.getElementById("painel-talento");
    const conteudo = document.getElementById("conteudo-painel-talento");

    conteudo.innerHTML = renderizarPainelTalento(talento);

    document.getElementById("botao-fechar-painel-talento").addEventListener("click", function () {
        painel.close();
    });

    const botaoCopiar = document.getElementById("botao-copiar-contato-talento");
    if (botaoCopiar) {
        botaoCopiar.addEventListener("click", function () {
            copiarContatoTalento(talento);
        });
    }

    const botaoCurriculo = document.getElementById("botao-visualizar-curriculo-talento");
    if (botaoCurriculo) {
        botaoCurriculo.addEventListener("click", function () {
            visualizarCurriculoTalento(talento);
        });
    }

    painel.showModal();
}


function encontrarTalentoPeloPerfilId(perfilId) {
    for (const talento of talentosMontados) {
        if (talento.perfil.id === perfilId) {
            return talento;
        }
    }
    return null;
}


function renderizarPainelTalento(talento) {
    const foto = renderizarFotoTalento(talento, true);
    const nome = escaparHtmlTalentos(talento.usuario.nome);

    let objetivo = "Objetivo profissional não informado";
    if (talento.perfil.objetivoProfissional) {
        objetivo = talento.perfil.objetivoProfissional;
    }
    objetivo = escaparHtmlTalentos(objetivo);

    const nivel = formatarNivelExperienciaTalentos(talento.perfil.nivelExperiencia);
    const modalidade = formatarModalidadeTalentos(talento.perfil.modalidadePreferida);

    let localizacao = "Localização não informada";
    if (talento.perfil.localizacaoPreferida) {
        localizacao = talento.perfil.localizacaoPreferida;
    }
    localizacao = escaparHtmlTalentos(localizacao);

    let sobreMim = "O profissional ainda não adicionou uma apresentação.";
    if (talento.perfil.sobreMim) {
        sobreMim = talento.perfil.sobreMim;
    }
    sobreMim = escaparHtmlTalentos(sobreMim);

    const tagsHabilidades = renderizarTagsHabilidades(talento.habilidades, null, true);
    const compatibilidadeHtml = renderizarCompatibilidadePainel(talento);
    const experienciasHtml = renderizarExperienciasTalento(talento.experiencias);
    const formacoesHtml = renderizarFormacoesTalento(talento.formacoes);
    const projetosHtml = renderizarProjetosTalento(talento.projetos);

    let curriculoTexto = "Este profissional ainda não enviou um currículo.";
    if (talento.perfil.curriculoUrl) {
        curriculoTexto = "O profissional possui um currículo disponível.";
    }

    let botaoCurriculoHtml = "";
    if (talento.perfil.curriculoUrl) {
        botaoCurriculoHtml = '<button id="botao-visualizar-curriculo-talento" type="button" class="botao-copiar-contato">Visualizar currículo</button>';
    }

    let atributoDesabilitado = "";
    if (!talento.usuario.email) {
        atributoDesabilitado = "disabled";
    }

    return `
        <div class="conteudo-painel-talento">
            <div class="cabecalho-painel-talento">
                <div>
                    <span class="rotulo-talentos">PERFIL PROFISSIONAL</span>
                    <h2>Visão completa</h2>
                </div>
                <button id="botao-fechar-painel-talento" type="button" class="botao-fechar-painel-talento">×</button>
            </div>

            <div class="corpo-painel-talento">
                <div class="perfil-topo-painel">
                    ${foto}
                    <div>
                        <h3>${nome}</h3>
                        <p>${objetivo}</p>
                    </div>
                </div>

                <div class="metadados-painel-talento">
                    <span>${nivel}</span>
                    <span>${modalidade}</span>
                    <span>${localizacao}</span>
                </div>

                <section class="secao-painel-talento">
                    <h4>Sobre</h4>
                    <p>${sobreMim}</p>
                </section>

                <section class="secao-painel-talento">
                    <h4>Habilidades</h4>
                    <div class="tags-talento">${tagsHabilidades}</div>
                </section>

                ${compatibilidadeHtml}

                <section class="secao-painel-talento">
                    <h4>Experiência profissional</h4>
                    ${experienciasHtml}
                </section>

                <section class="secao-painel-talento">
                    <h4>Formação acadêmica</h4>
                    ${formacoesHtml}
                </section>

                <section class="secao-painel-talento">
                    <h4>Projetos</h4>
                    ${projetosHtml}
                </section>

                <section class="secao-painel-talento">
                    <h4>Currículo</h4>
                    <p>${curriculoTexto}</p>
                </section>
            </div>

            <div class="acoes-painel-talento">
                ${botaoCurriculoHtml}
                <button id="botao-copiar-contato-talento" type="button" class="botao-copiar-contato" ${atributoDesabilitado}>
                    Copiar contato
                </button>
            </div>
        </div>
    `;
}


function renderizarCompatibilidadePainel(talento) {
    if (!vagaComparacaoTalentos || !talento.match) {
        return "";
    }

    const tituloVaga = escaparHtmlTalentos(vagaComparacaoTalentos.titulo);
    const percentual = talento.match.percentual;

    let itensHtml = "";

    for (const item of talento.match.requisitos) {
        let nomeHabilidade = "Habilidade";
        if (item.habilidade) {
            nomeHabilidade = item.habilidade.nome;
        }
        nomeHabilidade = escaparHtmlTalentos(nomeHabilidade);

        let sinal = "×";
        let classe = "requisito-faltante";
        let texto = "Não atendido";

        if (item.atendido) {
            sinal = "✓";
            classe = "requisito-atendido";
            texto = "Atendido";
        }

        itensHtml += `
            <div class="item-requisito-painel">
                <strong>${sinal} ${nomeHabilidade}</strong>
                <span class="${classe}">${texto}</span>
            </div>
        `;
    }

    return `
        <section class="secao-painel-talento">
            <h4>Compatibilidade com ${tituloVaga}</h4>

            <div class="linha-compatibilidade-talento">
                <span>Match calculado</span>
                <strong>${percentual}%</strong>
            </div>

            <div class="barra-match-talento">
                <div style="width: ${percentual}%"></div>
            </div>

            <div class="requisitos-painel-talento">
                ${itensHtml}
            </div>
        </section>
    `;
}


function renderizarExperienciasTalento(experiencias) {
    if (experiencias.length === 0) {
        return "<p>Nenhuma experiência profissional cadastrada.</p>";
    }

    const lista = experiencias.slice();
    lista.sort(function (a, b) {
        const dataA = a.dataInicio || "";
        const dataB = b.dataInicio || "";
        return dataB.localeCompare(dataA);
    });

    let html = "";

    for (const experiencia of lista) {
        const cargo = escaparHtmlTalentos(experiencia.cargo);
        const empresa = escaparHtmlTalentos(experiencia.empresa);
        const periodo = formatarPeriodoTalentos(experiencia.dataInicio, experiencia.dataFim, experiencia.atual);

        let descricaoHtml = "";
        if (experiencia.descricao) {
            descricaoHtml = `<p>${escaparHtmlTalentos(experiencia.descricao)}</p>`;
        }

        html += `
            <div class="item-trajetoria-talento">
                <strong>${cargo}</strong>
                <span>${empresa} · ${periodo}</span>
                ${descricaoHtml}
            </div>
        `;
    }

    return html;
}


function renderizarFormacoesTalento(formacoes) {
    if (formacoes.length === 0) {
        return "<p>Nenhuma formação acadêmica cadastrada.</p>";
    }

    let html = "";

    for (const formacao of formacoes) {
        const curso = escaparHtmlTalentos(formacao.curso);
        const instituicao = escaparHtmlTalentos(formacao.instituicao);

        let tipoHtml = "";
        if (formacao.tipoFormacao) {
            tipoHtml = " · " + escaparHtmlTalentos(formacao.tipoFormacao);
        }

        let descricaoHtml = "";
        if (formacao.descricao) {
            descricaoHtml = `<p>${escaparHtmlTalentos(formacao.descricao)}</p>`;
        }

        html += `
            <div class="item-trajetoria-talento">
                <strong>${curso}</strong>
                <span>${instituicao}${tipoHtml}</span>
                ${descricaoHtml}
            </div>
        `;
    }

    return html;
}


function renderizarProjetosTalento(projetos) {
    if (projetos.length === 0) {
        return "<p>Nenhum projeto cadastrado.</p>";
    }

    let html = "";

    for (const projeto of projetos) {
        const nome = escaparHtmlTalentos(projeto.nome);

        let tecnologiasHtml = "";
        if (projeto.tecnologias) {
            tecnologiasHtml = `<span>${escaparHtmlTalentos(projeto.tecnologias)}</span>`;
        }

        let descricaoHtml = "";
        if (projeto.descricao) {
            descricaoHtml = `<p>${escaparHtmlTalentos(projeto.descricao)}</p>`;
        }

        html += `
            <div class="item-trajetoria-talento">
                <strong>${nome}</strong>
                ${tecnologiasHtml}
                ${descricaoHtml}
            </div>
        `;
    }

    return html;
}


function renderizarFotoTalento(talento, grande) {
    let classe = "foto-talento";
    if (grande) {
        classe = "foto-talento-grande";
    }

    const nome = escaparHtmlTalentos(talento.usuario.nome);

    if (talento.perfil.fotoUrl) {
        const url = obterUrlBackendTalentos(talento.perfil.fotoUrl);

        return `
            <div class="${classe}">
                <img src="${url}" alt="Foto de ${nome}">
            </div>
        `;
    }

    const inicial = escaparHtmlTalentos(obterInicialTalentos(talento.usuario.nome));

    return `
        <div class="${classe}">
            ${inicial}
        </div>
    `;
}


// ----- Ações do painel: copiar contato e ver currículo -----

async function copiarContatoTalento(talento) {
    const email = talento.usuario.email;

    if (!email) {
        mostrarMensagemTalentos("Este profissional não possui contato disponível.");
        return;
    }

    try {
        await navigator.clipboard.writeText(email);
        mostrarMensagemTalentos("Contato copiado: " + email);
    } catch (erro) {
        mostrarMensagemTalentos("Contato: " + email);
    }
}


function visualizarCurriculoTalento(talento) {
    if (!talento.perfil.curriculoUrl) {
        mostrarMensagemTalentos("Este profissional não possui currículo disponível.");
        return;
    }

    const url = API_BASE_URL + "/perfis-profissionais/" + talento.perfil.id + "/curriculo";

    window.open(url, "_blank", "noopener,noreferrer");
}


function obterUrlBackendTalentos(caminho) {
    if (caminho.startsWith("http://") || caminho.startsWith("https://")) {
        return caminho;
    }

    let origemBackend = API_BASE_URL;
    if (origemBackend.endsWith("/api")) {
        origemBackend = origemBackend.slice(0, origemBackend.length - 4);
    }

    return origemBackend + caminho;
}


// ----- Funções auxiliares (nível de habilidade, texto, formatação) -----

function obterPesoNivelHabilidade(valor) {
    const nivelNormalizado = normalizarTextoTalentos(valor);

    const niveis = {
        basico: 1,
        intermediario: 2,
        avancado: 3,
        especialista: 4
    };

    if (niveis[nivelNormalizado]) {
        return niveis[nivelNormalizado];
    }

    return 0;
}


function valoresUnicosTalentos(valores) {
    const unicos = [];

    for (const valor of valores) {
        if (!valor) {
            continue;
        }

        if (unicos.indexOf(valor) === -1) {
            unicos.push(valor);
        }
    }

    unicos.sort(function (a, b) {
        return String(a).localeCompare(String(b), "pt-BR");
    });

    return unicos;
}


function normalizarTextoTalentos(valor) {
    let texto = valor || "";
    texto = String(texto);
    texto = texto.normalize("NFD");
    texto = texto.replace(/[\u0300-\u036f]/g, "");
    texto = texto.toLowerCase();
    texto = texto.trim();
    return texto;
}


function formatarNivelExperienciaTalentos(valor) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior"
    };

    if (valores[valor]) {
        return valores[valor];
    }

    return "Nível não informado";
}


function formatarModalidadeTalentos(valor) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto"
    };

    if (valores[valor]) {
        return valores[valor];
    }

    return "Modalidade não informada";
}


function formatarNivelHabilidadeTalentos(valor) {
    const valores = {
        basico: "Básico",
        intermediario: "Intermediário",
        avancado: "Avançado",
        especialista: "Especialista"
    };

    if (valores[valor]) {
        return valores[valor];
    }

    if (valor) {
        return valor;
    }

    return "Não informado";
}


function formatarStatusVagaTalentos(valor) {
    const valores = {
        ativa: "Ativa",
        pausada: "Pausada",
        encerrada: "Encerrada"
    };

    if (valores[valor]) {
        return valores[valor];
    }

    return valor;
}


function formatarPeriodoTalentos(inicio, fim, atual) {
    const inicioFormatado = formatarMesAnoTalentos(inicio);

    let fimFormatado = formatarMesAnoTalentos(fim);
    if (atual) {
        fimFormatado = "Atual";
    }

    if (inicioFormatado && fimFormatado) {
        return inicioFormatado + " — " + fimFormatado;
    }

    if (inicioFormatado) {
        return inicioFormatado;
    }

    if (fimFormatado) {
        return fimFormatado;
    }

    return "Período não informado";
}


function formatarMesAnoTalentos(valor) {
    if (!valor) {
        return "";
    }

    const partes = valor.split("-");

    if (partes.length < 2) {
        return valor;
    }

    return partes[1] + "/" + partes[0];
}


function obterInicialTalentos(nome) {
    let texto = nome || "P";
    texto = String(texto).trim();
    return texto.charAt(0).toUpperCase();
}


function escaparHtmlTalentos(valor) {
    let texto = valor;

    if (texto === null || texto === undefined) {
        texto = "";
    }

    texto = String(texto);
    texto = texto.replaceAll("&", "&amp;");
    texto = texto.replaceAll("<", "&lt;");
    texto = texto.replaceAll(">", "&gt;");
    texto = texto.replaceAll('"', "&quot;");
    texto = texto.replaceAll("'", "&#039;");

    return texto;
}


function mostrarMensagemTalentos(mensagem) {
    const elemento = document.getElementById("mensagem-talentos");

    clearTimeout(temporizadorMensagemTalentos);

    elemento.textContent = mensagem;
    elemento.classList.add("visivel");

    temporizadorMensagemTalentos = setTimeout(function () {
        elemento.classList.remove("visivel");
    }, 3200);
}
