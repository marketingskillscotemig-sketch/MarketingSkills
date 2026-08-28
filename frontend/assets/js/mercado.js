// ===================================================
// Página de Mercado
// Métricas do topo, habilidades em demanda, insights
// personalizados, tendências de mercado e vagas recentes.
// ===================================================


let usuarioMercado = null;

let vagasMercado = [];
let empresasMercado = [];
let requisitosMercado = [];
let habilidadesMercado = [];
let tendenciasMercado = [];

let perfilMercado = null;
let habilidadesPerfilMercado = [];


document.addEventListener("DOMContentLoaded", iniciarMercado);


async function iniciarMercado() {
    try {
        const sessao = await apiRequest("/autenticacao/sessao");

        if (!sessao.autenticado || !sessao.usuario) {
            window.location.href = "./login.html";
            return;
        }

        usuarioMercado = sessao.usuario;

        const vagas = await apiRequest("/vagas");
        vagasMercado = vagas;

        const empresas = await apiRequest("/empresas");
        empresasMercado = empresas;

        const requisitos = await apiRequest("/requisitos-vaga");
        requisitosMercado = requisitos;

        const habilidades = await apiRequest("/habilidades");
        habilidadesMercado = habilidades;

        const tendencias = await apiRequest("/tendencias-mercado");
        tendenciasMercado = tendencias;

        const perfis = await apiRequest("/perfis-profissionais");

        perfilMercado = null;
        for (const perfil of perfis) {
            if (perfil.usuarioId === usuarioMercado.id) {
                perfilMercado = perfil;
                break;
            }
        }

        const perfisHabilidades = await apiRequest("/perfil-habilidades");

        habilidadesPerfilMercado = [];
        if (perfilMercado) {
            for (const item of perfisHabilidades) {
                if (item.perfilProfissionalId === perfilMercado.id) {
                    habilidadesPerfilMercado.push(item);
                }
            }
        }

        renderizarMercado();

    } catch (erro) {
        console.error("Erro ao carregar Mercado:", erro);
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
    const ativas = [];

    for (const vaga of vagasMercado) {
        if (vaga.status === "ativa") {
            ativas.push(vaga);
        }
    }

    return ativas;
}


function atualizarMetricas() {
    const vagasAtivas = obterVagasAtivas();
    const idsVagasAtivas = obterIds(vagasAtivas);

    const idsHabilidadesDemandadas = [];

    for (const requisito of requisitosMercado) {
        if (idEstaNaLista(idsVagasAtivas, requisito.vagaId)) {
            adicionarSeNovo(idsHabilidadesDemandadas, requisito.habilidadeId);
        }
    }

    const tecnologias = [];

    for (const item of tendenciasMercado) {
        if (item.tecnologia) {
            const tecnologia = item.tecnologia.trim().toLowerCase();

            if (tecnologia) {
                adicionarSeNovo(tecnologias, tecnologia);
            }
        }
    }

    document.getElementById("total-vagas").textContent = vagasAtivas.length;
    document.getElementById("total-habilidades").textContent = idsHabilidadesDemandadas.length;
    document.getElementById("total-empresas").textContent = empresasMercado.length;
    document.getElementById("total-tecnologias").textContent = tecnologias.length;
}


function renderizarDemanda() {
    const conteiner = document.getElementById("lista-habilidades-demanda");

    const vagasAtivas = obterVagasAtivas();
    const idsVagasAtivas = obterIds(vagasAtivas);

    const contagens = [];

    for (const requisito of requisitosMercado) {
        if (idEstaNaLista(idsVagasAtivas, requisito.vagaId)) {
            incrementarContagem(contagens, requisito.habilidadeId);
        }
    }

    const itensRanking = [];

    for (const contagem of contagens) {
        const habilidade = encontrarHabilidadePeloId(contagem.habilidadeId);

        let nome = "Habilidade";
        if (habilidade) {
            nome = habilidade.nome;
        }

        itensRanking.push({ nome: nome, quantidade: contagem.quantidade });
    }

    itensRanking.sort(function (a, b) {
        return b.quantidade - a.quantidade;
    });

    const ranking = itensRanking.slice(0, 5);

    if (ranking.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Ainda não existem requisitos suficientes
                para calcular a demanda.
            </div>
        `;
        return;
    }

    const maiorValor = ranking[0].quantidade;

    let html = "";

    for (const item of ranking) {
        const largura = (item.quantidade / maiorValor) * 100;

        html += `
            <div class="item-demanda">
                <span class="nome-demanda">${escaparHtmlMercado(item.nome)}</span>
                <div class="barra-demanda">
                    <span style="width: ${largura}%"></span>
                </div>
                <span class="valor-demanda">${item.quantidade}</span>
            </div>
        `;
    }

    conteiner.innerHTML = html;
}


function renderizarInsights() {
    const conteiner = document.getElementById("insights-perfil");
    const vagasAtivas = obterVagasAtivas();

    if (!perfilMercado) {
        conteiner.innerHTML = `
            <div class="insight">
                <span class="icone-insight">!</span>
                <div>
                    <strong>Complete seu perfil profissional</strong>
                    <p>Um perfil completo permitirá que o Market Skills ofereça análises mais personalizadas.</p>
                </div>
            </div>

            <div class="insight">
                <span class="icone-insight">↗</span>
                <div>
                    <strong>${vagasAtivas.length} vagas ativas</strong>
                    <p>Explore as oportunidades disponíveis atualmente na plataforma.</p>
                </div>
            </div>
        `;
        return;
    }

    const idsHabilidadesUsuario = [];

    for (const item of habilidadesPerfilMercado) {
        idsHabilidadesUsuario.push(item.habilidadeId);
    }

    const idsVagasAtivas = obterIds(vagasAtivas);

    const contagemDemanda = [];

    for (const requisito of requisitosMercado) {
        if (idEstaNaLista(idsVagasAtivas, requisito.vagaId)) {
            incrementarContagem(contagemDemanda, requisito.habilidadeId);
        }
    }

    let melhorCandidato = null;

    for (const item of contagemDemanda) {
        if (idEstaNaLista(idsHabilidadesUsuario, item.habilidadeId)) {
            continue;
        }

        if (!melhorCandidato || item.quantidade > melhorCandidato.quantidade) {
            melhorCandidato = item;
        }
    }

    let habilidadeRecomendada = null;

    if (melhorCandidato) {
        habilidadeRecomendada = encontrarHabilidadePeloId(melhorCandidato.habilidadeId);
    }

    let html = `
        <div class="insight">
            <span class="icone-insight">✓</span>
            <div>
                <strong>Perfil conectado ao mercado</strong>
                <p>Você possui ${habilidadesPerfilMercado.length} habilidade(s) registrada(s) no seu perfil.</p>
            </div>
        </div>

        <div class="insight">
            <span class="icone-insight">↗</span>
            <div>
                <strong>${vagasAtivas.length} oportunidade(s) ativa(s)</strong>
                <p>Novas vagas podem ser comparadas com suas competências profissionais.</p>
            </div>
        </div>
    `;

    if (habilidadeRecomendada) {
        html += `
            <div class="insight">
                <span class="icone-insight">+</span>
                <div>
                    <strong>Acompanhe: ${escaparHtmlMercado(habilidadeRecomendada.nome)}</strong>
                    <p>Essa habilidade aparece entre as demandas atuais e ainda não está registrada no seu perfil.</p>
                </div>
            </div>
        `;
    }

    conteiner.innerHTML = html;
}


function renderizarTendencias() {
    const conteiner = document.getElementById("lista-tendencias");

    const tendencias = tendenciasMercado.slice();

    tendencias.sort(function (a, b) {
        return Number(b.demanda || 0) - Number(a.demanda || 0);
    });

    const top5 = tendencias.slice(0, 5);

    if (top5.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma tendência de mercado
                disponível no momento.
            </div>
        `;
        return;
    }

    let html = "";

    for (const tendencia of top5) {
        let titulo = tendencia.tecnologia;
        if (!titulo) {
            titulo = tendencia.cargo;
        }
        if (!titulo) {
            titulo = "Tendência";
        }

        let subtitulo = tendencia.cargo;
        if (!subtitulo) {
            subtitulo = "Mercado de tecnologia";
        }

        html += `
            <div class="item-tendencia-mercado">
                <div>
                    <strong>${escaparHtmlMercado(titulo)}</strong>
                    <small>${escaparHtmlMercado(subtitulo)}</small>
                </div>
                <span class="demanda-tendencia">Demanda: ${formatarDemanda(tendencia.demanda)}</span>
            </div>
        `;
    }

    conteiner.innerHTML = html;
}


function renderizarVagasRecentes() {
    const conteiner = document.getElementById("lista-vagas-recentes");

    const vagasAtivas = obterVagasAtivas();

    vagasAtivas.sort(function (a, b) {
        return new Date(b.dataPublicacao || 0) - new Date(a.dataPublicacao || 0);
    });

    const vagas = vagasAtivas.slice(0, 4);

    if (vagas.length === 0) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga ativa disponível agora.
            </div>
        `;
        return;
    }

    let html = "";

    for (const vaga of vagas) {
        const empresa = encontrarEmpresaPeloId(vaga.empresaId);

        let nomeEmpresa = "Empresa";
        if (empresa && empresa.nome) {
            nomeEmpresa = empresa.nome;
        }

        html += `
            <div class="vaga-mercado">
                <div>
                    <strong>${escaparHtmlMercado(vaga.titulo)}</strong>
                    <small>${escaparHtmlMercado(nomeEmpresa)}</small>
                </div>
                <span class="tag-modalidade">${formatarModalidade(vaga.modalidade)}</span>
            </div>
        `;
    }

    conteiner.innerHTML = html;
}


// ----- Funções auxiliares (listas, contagens, buscas) -----

function obterIds(lista) {
    const ids = [];

    for (const item of lista) {
        ids.push(item.id);
    }

    return ids;
}


function idEstaNaLista(lista, id) {
    for (const item of lista) {
        if (item === id) {
            return true;
        }
    }

    return false;
}


function adicionarSeNovo(lista, valor) {
    if (lista.indexOf(valor) === -1) {
        lista.push(valor);
    }
}


function incrementarContagem(contagens, habilidadeId) {
    for (const item of contagens) {
        if (item.habilidadeId === habilidadeId) {
            item.quantidade = item.quantidade + 1;
            return;
        }
    }

    contagens.push({ habilidadeId: habilidadeId, quantidade: 1 });
}


function encontrarHabilidadePeloId(id) {
    for (const habilidade of habilidadesMercado) {
        if (habilidade.id === id) {
            return habilidade;
        }
    }

    return null;
}


function encontrarEmpresaPeloId(id) {
    for (const empresa of empresasMercado) {
        if (empresa.id === id) {
            return empresa;
        }
    }

    return null;
}


// ----- Formatação e mensagens -----

function formatarModalidade(valor) {
    const modalidades = {
        remoto: "Remoto",
        presencial: "Presencial",
        hibrido: "Híbrido",
    };

    if (modalidades[valor]) {
        return modalidades[valor];
    }

    return "Não informada";
}


function formatarDemanda(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(numero);
}


function escaparHtmlMercado(valor) {
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


function mostrarErroMercado() {
    const ids = [
        "lista-habilidades-demanda",
        "insights-perfil",
        "lista-tendencias",
        "lista-vagas-recentes",
    ];

    for (const id of ids) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.innerHTML = `
                <div class="estado-vazio">
                    Não foi possível carregar
                    os dados agora.
                </div>
            `;
        }
    }
}
