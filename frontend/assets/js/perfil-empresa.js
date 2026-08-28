// ===================================================
// Página de Perfil (conta empresa)
// A estrutura da página fica em perfil.html (estática).
// Este arquivo só carrega os dados da empresa, preenche
// os elementos existentes e cuida do formulário de edição.
// ===================================================


let empresaPaginaPerfil = null;
let vagasEmpresaPaginaPerfil = [];

let temporizadorMensagemEmpresa = null;


async function iniciarPerfilEmpresa(usuario) {
    document.body.classList.add("perfil-empresa-ativo");

    const introducao = document.querySelector(".introducao-perfil");
    if (introducao) {
        introducao.classList.add("oculto");
    }

    configurarNavegacaoPerfilEmpresa();
    registrarEventosPerfilEmpresa();

    document.getElementById("carregando-perfil-empresa").classList.remove("oculto");

    try {
        const empresas = await apiRequest("/empresas");
        const vagas = await apiRequest("/vagas");

        const empresaPublica = encontrarEmpresaPublicaDoUsuario(empresas, usuario.id);

        if (!empresaPublica) {
            throw new Error("Não foi possível localizar o perfil empresarial desta conta.");
        }

        empresaPaginaPerfil = await apiRequest(`/empresas/${empresaPublica.id}`);
        vagasEmpresaPaginaPerfil = filtrarVagasDaEmpresa(vagas || [], empresaPaginaPerfil.id);

        renderizarPerfilEmpresa();

    } catch (erro) {
        let mensagem = erro.message;
        if (!mensagem) {
            mensagem = "Não foi possível carregar o perfil da empresa.";
        }

        document.getElementById("carregando-perfil-empresa").innerHTML = `
            <div class="estado-erro-empresa">${escaparHtmlEmpresa(mensagem)}</div>
        `;
    }
}


function encontrarEmpresaPublicaDoUsuario(empresas, usuarioId) {
    for (const empresa of empresas) {
        if (empresa.usuarioId === usuarioId) {
            return empresa;
        }
    }

    return null;
}


function filtrarVagasDaEmpresa(vagas, empresaId) {
    const resultado = [];

    for (const vaga of vagas) {
        if (vaga.empresaId === empresaId) {
            resultado.push(vaga);
        }
    }

    return resultado;
}


function configurarNavegacaoPerfilEmpresa() {
    const navegacao = document.querySelector(".navegacao-principal");

    if (!navegacao) {
        return;
    }

    navegacao.innerHTML = `
        <a href="../index.html">Dashboard</a>
        <a href="./talentos.html?v=1">Talentos</a>
        <a href="./vagas.html">Minhas Vagas</a>
        <a href="./perfil.html" class="ativo">Perfil</a>
    `;
}


// ---- Renderização ----

function renderizarPerfilEmpresa() {
    document.getElementById("carregando-perfil-empresa").classList.add("oculto");
    document.getElementById("conteudo-perfil-empresa").classList.remove("oculto");

    const vagasAtivas = obterVagasAtivasEmpresa();

    renderizarBannerEmpresa();
    renderizarLogoEmpresa();

    document.getElementById("nome-empresa").textContent = empresaPaginaPerfil.nome;

    let setor = empresaPaginaPerfil.setor;
    if (!setor) {
        setor = "Setor não informado";
    }
    document.getElementById("setor-empresa").textContent = setor;

    let porte = empresaPaginaPerfil.porte;
    if (!porte) {
        porte = "Porte não informado";
    }
    document.getElementById("porte-empresa").textContent = porte;

    let localizacao = empresaPaginaPerfil.localizacao;
    if (!localizacao) {
        localizacao = "Localização não informada";
    }
    if (empresaPaginaPerfil.trabalhoRemoto) {
        localizacao = "100% remoto";
    }
    document.getElementById("localizacao-empresa").textContent = localizacao;

    let apresentacao = "Sua empresa ainda não adicionou uma apresentação. Conte sua história, missão, valores e como é fazer parte da equipe.";
    if (empresaPaginaPerfil.descricao) {
        apresentacao = empresaPaginaPerfil.descricao;
    }
    document.getElementById("texto-apresentacao-empresa").textContent = apresentacao;

    document.getElementById("lista-stack-empresa").innerHTML = renderizarTagsEmpresa(empresaPaginaPerfil.stackTecnologico, "Nenhuma tecnologia informada.");
    document.getElementById("lista-beneficios-empresa").innerHTML = renderizarTagsEmpresa(empresaPaginaPerfil.beneficios, "Nenhum benefício informado.");

    let textoContador = `${vagasAtivas.length} vagas`;
    if (vagasAtivas.length === 1) {
        textoContador = `${vagasAtivas.length} vaga`;
    }
    document.getElementById("contador-vagas-empresa").textContent = textoContador;

    document.getElementById("lista-vagas-empresa").innerHTML = renderizarVagasAtivasEmpresa(vagasAtivas);

    document.getElementById("lista-links-empresa").innerHTML =
        renderizarLinkEmpresa("Site oficial", empresaPaginaPerfil.site) +
        renderizarLinkEmpresa("LinkedIn", empresaPaginaPerfil.linkedin);

    let razaoSocial = empresaPaginaPerfil.razaoSocial;
    if (!razaoSocial) {
        razaoSocial = "Não informada";
    }
    document.getElementById("razao-social-empresa").textContent = razaoSocial;

    document.getElementById("cnpj-empresa").textContent = formatarCnpjEmpresa(empresaPaginaPerfil.cnpj);
}


function obterVagasAtivasEmpresa() {
    const ativas = [];

    for (const vaga of vagasEmpresaPaginaPerfil) {
        if (vaga.status === "ativa") {
            ativas.push(vaga);
        }
    }

    ativas.sort(function (a, b) {
        return new Date(b.dataPublicacao || 0) - new Date(a.dataPublicacao || 0);
    });

    return ativas;
}


function renderizarBannerEmpresa() {
    const imagem = document.getElementById("banner-empresa-imagem");
    const vazio = document.getElementById("banner-empresa-vazio");

    if (empresaPaginaPerfil.bannerUrl) {
        imagem.src = obterUrlImagemEmpresa(empresaPaginaPerfil.bannerUrl);
        imagem.classList.remove("oculto");
        vazio.classList.add("oculto");
    } else {
        imagem.classList.add("oculto");
        imagem.removeAttribute("src");
        vazio.classList.remove("oculto");
    }
}


function renderizarLogoEmpresa() {
    const imagem = document.getElementById("logo-empresa-imagem");
    const inicial = document.getElementById("logo-empresa-inicial");

    inicial.textContent = obterInicialEmpresa(empresaPaginaPerfil.nome);

    if (empresaPaginaPerfil.logoUrl) {
        imagem.src = obterUrlImagemEmpresa(empresaPaginaPerfil.logoUrl);
        imagem.classList.remove("oculto");
        inicial.classList.add("oculto");
    } else {
        imagem.classList.add("oculto");
        imagem.removeAttribute("src");
        inicial.classList.remove("oculto");
    }
}


// ---- Eventos e formulário de edição ----

function registrarEventosPerfilEmpresa() {
    document.getElementById("botao-editar-perfil-empresa").addEventListener("click", abrirModalPerfilEmpresa);
    document.getElementById("botao-fechar-perfil-empresa").addEventListener("click", fecharModalPerfilEmpresa);
    document.getElementById("botao-cancelar-perfil-empresa").addEventListener("click", fecharModalPerfilEmpresa);
    document.getElementById("formulario-perfil-empresa").addEventListener("submit", salvarPerfilEmpresa);
    document.getElementById("empresa-remoto").addEventListener("change", atualizarLocalizacaoEmpresa);
    document.getElementById("empresa-cnpj").addEventListener("input", formatarCnpjAoDigitar);
}


function formatarCnpjAoDigitar(evento) {
    evento.target.value = formatarCnpjDigitado(evento.target.value);
}


function abrirModalPerfilEmpresa() {
    document.getElementById("formulario-perfil-empresa").reset();

    document.getElementById("empresa-nome").value = empresaPaginaPerfil.nome || "";
    document.getElementById("empresa-setor").value = empresaPaginaPerfil.setor || "";
    document.getElementById("empresa-porte").value = empresaPaginaPerfil.porte || "";
    document.getElementById("empresa-localizacao").value = empresaPaginaPerfil.localizacao || "";
    document.getElementById("empresa-remoto").checked = Boolean(empresaPaginaPerfil.trabalhoRemoto);
    document.getElementById("empresa-descricao").value = empresaPaginaPerfil.descricao || "";
    document.getElementById("empresa-site").value = empresaPaginaPerfil.site || "";
    document.getElementById("empresa-linkedin").value = empresaPaginaPerfil.linkedin || "";
    document.getElementById("empresa-stack").value = empresaPaginaPerfil.stackTecnologico || "";
    document.getElementById("empresa-beneficios").value = empresaPaginaPerfil.beneficios || "";
    document.getElementById("empresa-razao-social").value = empresaPaginaPerfil.razaoSocial || "";
    document.getElementById("empresa-cnpj").value = formatarCnpjEmpresa(empresaPaginaPerfil.cnpj, "");

    limparMensagemFormularioEmpresa();
    atualizarLocalizacaoEmpresa();

    document.getElementById("modal-perfil-empresa").showModal();
}


function fecharModalPerfilEmpresa() {
    const modal = document.getElementById("modal-perfil-empresa");

    if (modal.open) {
        modal.close();
    }
}


function atualizarLocalizacaoEmpresa() {
    const remoto = document.getElementById("empresa-remoto").checked;
    const localizacao = document.getElementById("empresa-localizacao");

    localizacao.disabled = remoto;
    if (remoto) {
        localizacao.value = "";
    }
}


async function salvarPerfilEmpresa(evento) {
    evento.preventDefault();

    limparMensagemFormularioEmpresa();

    const arquivoLogo = document.getElementById("empresa-logo-arquivo").files[0] || null;
    const arquivoBanner = document.getElementById("empresa-banner-arquivo").files[0] || null;

    try {
        validarImagemEmpresa(arquivoLogo, 3, "A logo");
        validarImagemEmpresa(arquivoBanner, 5, "O banner");

        let localizacaoParaSalvar = obterTextoEmpresa("empresa-localizacao");
        if (document.getElementById("empresa-remoto").checked) {
            localizacaoParaSalvar = "";
        }

        const dados = {
            nome: obterTextoEmpresa("empresa-nome"),
            setor: obterTextoEmpresa("empresa-setor"),
            porte: obterTextoEmpresa("empresa-porte"),
            localizacao: localizacaoParaSalvar,
            trabalhoRemoto: document.getElementById("empresa-remoto").checked,
            descricao: obterTextoEmpresa("empresa-descricao"),
            site: obterTextoEmpresa("empresa-site"),
            linkedin: obterTextoEmpresa("empresa-linkedin"),
            stackTecnologico: obterTextoEmpresa("empresa-stack"),
            beneficios: obterTextoEmpresa("empresa-beneficios"),
            razaoSocial: obterTextoEmpresa("empresa-razao-social"),
            cnpj: obterTextoEmpresa("empresa-cnpj"),
        };

        const botao = document.getElementById("botao-salvar-perfil-empresa");
        botao.disabled = true;
        botao.textContent = "Salvando...";

        try {
            await apiRequest(`/empresas/${empresaPaginaPerfil.id}`, {
                method: "PUT",
                body: JSON.stringify(dados),
            });

            if (arquivoLogo) {
                const formularioLogo = new FormData();
                formularioLogo.append("logo", arquivoLogo);

                await apiRequest(`/empresas/${empresaPaginaPerfil.id}/logo`, {
                    method: "POST",
                    body: formularioLogo,
                });
            }

            if (arquivoBanner) {
                const formularioBanner = new FormData();
                formularioBanner.append("banner", arquivoBanner);

                await apiRequest(`/empresas/${empresaPaginaPerfil.id}/banner`, {
                    method: "POST",
                    body: formularioBanner,
                });
            }

            empresaPaginaPerfil = await apiRequest(`/empresas/${empresaPaginaPerfil.id}`);

            fecharModalPerfilEmpresa();
            renderizarPerfilEmpresa();

            mostrarMensagemPerfilEmpresa("Perfil empresarial atualizado com sucesso.", "sucesso");

        } finally {
            const botaoAtual = document.getElementById("botao-salvar-perfil-empresa");
            if (botaoAtual) {
                botaoAtual.disabled = false;
                botaoAtual.textContent = "Salvar alterações";
            }
        }

    } catch (erro) {
        let mensagem = erro.message;
        if (!mensagem) {
            mensagem = "Não foi possível atualizar o perfil.";
        }
        mostrarMensagemFormularioEmpresa(mensagem);
    }
}


function validarImagemEmpresa(arquivo, limiteMb, nomeCampo) {
    if (!arquivo) {
        return;
    }

    const nome = arquivo.name.toLowerCase();
    const extensaoValida = nome.endsWith(".png") || nome.endsWith(".jpg") || nome.endsWith(".jpeg");
    const tipoValido = arquivo.type === "image/png" || arquivo.type === "image/jpeg";

    if (!extensaoValida || !tipoValido) {
        throw new Error(`${nomeCampo} deve estar no formato PNG ou JPEG.`);
    }

    if (arquivo.size > limiteMb * 1024 * 1024) {
        throw new Error(`${nomeCampo} deve possuir no máximo ${limiteMb} MB.`);
    }
}


// ---- Listas dinâmicas (tags, vagas, links) ----

function renderizarTagsEmpresa(valor, mensagemVazia) {
    const itens = separarItensEmpresa(valor);

    if (itens.length === 0) {
        return `<div class="estado-vazio-empresa">${escaparHtmlEmpresa(mensagemVazia)}</div>`;
    }

    let html = "";
    for (const item of itens) {
        html = html + `<span class="tag-conteudo-empresa">${escaparHtmlEmpresa(item)}</span>`;
    }

    return html;
}


function separarItensEmpresa(valor) {
    if (!valor) {
        return [];
    }

    const partes = String(valor).split(/[,;\n]+/);
    const itens = [];

    for (const parte of partes) {
        const texto = parte.trim();
        if (texto) {
            itens.push(texto);
        }
    }

    return itens;
}


function renderizarVagasAtivasEmpresa(vagas) {
    if (vagas.length === 0) {
        return `<div class="estado-vazio-empresa">A empresa não possui vagas abertas no momento.</div>`;
    }

    let html = "";
    for (const vaga of vagas) {
        html = html + criarHtmlVagaEmpresa(vaga);
    }

    return html;
}


function criarHtmlVagaEmpresa(vaga) {
    let localizacao = vaga.localizacao;
    if (!localizacao) {
        localizacao = "Localização não informada";
    }

    return `
        <article class="vaga-perfil-empresa">
            <div>
                <span class="status-vaga-empresa">Ativa</span>
                <h3>${escaparHtmlEmpresa(vaga.titulo)}</h3>

                <div class="metadados-vaga-empresa">
                    <span>${formatarExperienciaEmpresa(vaga.nivelExperiencia)}</span>
                    <span>${formatarModalidadeEmpresa(vaga.modalidade)}</span>
                    <span>${escaparHtmlEmpresa(localizacao)}</span>
                </div>
            </div>

            <a href="./vagas.html" class="link-vaga-empresa">Ver oportunidade</a>
        </article>
    `;
}


function renderizarLinkEmpresa(rotulo, valor) {
    if (!valor) {
        return `
            <div class="item-link-empresa indisponivel">
                <span>${rotulo}</span>
                <strong>Não informado</strong>
            </div>
        `;
    }

    const url = normalizarUrlEmpresa(valor);

    return `
        <a class="item-link-empresa" href="${escaparHtmlEmpresa(url)}" target="_blank" rel="noopener noreferrer">
            <span>${rotulo}</span>
            <strong>Acessar</strong>
        </a>
    `;
}


// ---- Utilidades ----

function obterUrlImagemEmpresa(caminho) {
    if (caminho.startsWith("http://") || caminho.startsWith("https://")) {
        let separador = "?";
        if (caminho.includes("?")) {
            separador = "&";
        }
        return `${caminho}${separador}v=${Date.now()}`;
    }

    const origemBackend = API_BASE_URL.replace(/\/api$/, "");
    return `${origemBackend}${caminho}?v=${Date.now()}`;
}


function obterTextoEmpresa(id) {
    return document.getElementById(id).value.trim();
}


function obterInicialEmpresa(nome) {
    const texto = String(nome || "E").trim();
    const inicial = texto.charAt(0).toUpperCase();

    if (!inicial) {
        return "E";
    }

    return inicial;
}


function normalizarUrlEmpresa(valor) {
    const url = String(valor || "").trim();

    if (!url) {
        return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `https://${url}`;
}


function formatarCnpjEmpresa(valor, vazio) {
    if (vazio === undefined) {
        vazio = "Não informado";
    }

    const numeros = String(valor || "").replace(/\D/g, "");

    if (numeros.length !== 14) {
        return vazio;
    }

    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
}


function formatarCnpjDigitado(valor) {
    const numeros = String(valor).replace(/\D/g, "").slice(0, 14);

    let resultado = numeros;

    if (numeros.length > 2) {
        resultado = `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
    }

    if (numeros.length > 5) {
        resultado = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
    }

    if (numeros.length > 8) {
        resultado = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
    }

    if (numeros.length > 12) {
        resultado = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
    }

    return resultado;
}


function formatarModalidadeEmpresa(valor) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return valores[valor] || "Não informada";
}


function formatarExperienciaEmpresa(valor) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return valores[valor] || "Não informado";
}


function escaparHtmlEmpresa(valor) {
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


function mostrarMensagemFormularioEmpresa(mensagem) {
    const elemento = document.getElementById("mensagem-formulario-empresa");

    elemento.textContent = mensagem;
    elemento.className = "mensagem-formulario-empresa erro";
}


function limparMensagemFormularioEmpresa() {
    const elemento = document.getElementById("mensagem-formulario-empresa");

    elemento.textContent = "";
    elemento.className = "mensagem-formulario-empresa";
}


function mostrarMensagemPerfilEmpresa(mensagem, tipo) {
    const elemento = document.getElementById("mensagem-perfil-empresa");

    clearTimeout(temporizadorMensagemEmpresa);

    elemento.textContent = mensagem;
    elemento.className = `mensagem-perfil-empresa ${tipo} visivel`;

    temporizadorMensagemEmpresa = setTimeout(function () {
        elemento.className = "mensagem-perfil-empresa";
    }, 3500);
}
