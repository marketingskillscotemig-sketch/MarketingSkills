async function verificarConexaoMarketSkills() {
    const conteinerStatus =
        document.querySelector(
            ".status-dados"
        );

    const textoStatus =
        document.getElementById(
            "status-api"
        );

    if (
        !conteinerStatus ||
        !textoStatus
    ) {
        return;
    }

    try {
        await apiRequest(
            "/health"
        );

        textoStatus.textContent =
            "Market Skills conectado";

        conteinerStatus.classList.add(
            "conectado"
        );

        conteinerStatus.classList.remove(
            "desconectado"
        );

    } catch (erro) {
        console.error(
            "Erro ao verificar a API:",
            erro
        );

        textoStatus.textContent =
            "Não foi possível conectar ao Market Skills";

        conteinerStatus.classList.add(
            "desconectado"
        );

        conteinerStatus.classList.remove(
            "conectado"
        );
    }
}


async function configurarExperienciaHome() {
    try {
        const sessao = await apiRequest(
            "/autenticacao/sessao"
        );

        if (
            sessao.autenticado &&
            sessao.usuario &&
            sessao.usuario.tipoConta ===
                "empresa"
        ) {
            aplicarHomeEmpresa();
            return;
        }

        aplicarHomeEstudante();

    } catch (erro) {
        aplicarHomeEstudante();
    }
}


function aplicarHomeEstudante() {
    document.title =
        "Market Skills";

    const metaDescricao =
        document.getElementById(
            "meta-descricao-home"
        );

    if (metaDescricao) {
        metaDescricao.content =
            "Market Skills - transforme dados do mercado em decisões para sua carreira em tecnologia.";
    }
}


function aplicarHomeEmpresa() {
    document.title =
        "Market Skills | Recrutamento";

    atualizarMetaDescricaoEmpresa();
    atualizarNavegacaoEmpresa();
    atualizarDestaqueEmpresa();
    atualizarPainelTalentosEmpresa();
    atualizarFluxoEmpresa();
    atualizarPropostaEmpresa();
    atualizarChamadaEmpresa();
    atualizarRodapeEmpresa();
}


function atualizarMetaDescricaoEmpresa() {
    const metaDescricao =
        document.getElementById(
            "meta-descricao-home"
        );

    if (!metaDescricao) {
        return;
    }

    metaDescricao.content =
        "Market Skills - publique vagas, encontre talentos compatíveis e tome decisões de contratação com mais dados.";
}


function atualizarNavegacaoEmpresa() {
    const navegacao =
        document.getElementById(
            "navegacao-home"
        );

    if (!navegacao) {
        return;
    }

    navegacao.innerHTML = `
        <a
            href="./index.html"
            class="ativo"
        >
            Dashboard
        </a>

        <a href="#talentos-empresa">
            Talentos
        </a>

        <a href="./pages/vagas.html">
            Minhas Vagas
        </a>

        <a href="./pages/perfil.html">
            Perfil
        </a>
    `;
}


function atualizarDestaqueEmpresa() {
    document.getElementById(
        "rotulo-destaque-home"
    ).textContent =
        "Recrutamento orientado por dados";


    document.getElementById(
        "titulo-destaque-home"
    ).innerHTML = `
        Encontre os talentos
        que podem levar sua
        <span>empresa mais longe.</span>
    `;


    document.getElementById(
        "descricao-destaque-home"
    ).textContent =
        "Publique oportunidades, encontre profissionais alinhados aos requisitos da sua vaga e tome decisões de contratação com mais clareza.";


    document.getElementById(
        "acoes-destaque-home"
    ).innerHTML = `
        <a
            href="./pages/vagas.html"
            class="botao botao-principal botao-grande"
        >
            Publicar nova vaga
        </a>

        <a
            href="#talentos-empresa"
            class="botao botao-escuro botao-grande"
        >
            Buscar talentos
        </a>
    `;
}


function atualizarPainelTalentosEmpresa() {
    const painel =
        document.getElementById(
            "painel-exemplo-home"
        );

    if (!painel) {
        return;
    }

    painel.id =
        "talentos-empresa";

    painel.innerHTML = `
        <div class="compatibilidade-topo">

            <div>

                <span class="rotulo-compatibilidade">
                    Exemplo de triagem
                </span>

                <h2>
                    Desenvolvedor Backend
                </h2>

                <p>
                    Veja como profissionais podem ser
                    priorizados de acordo com os requisitos
                    definidos para uma vaga.
                </p>

            </div>

            <div class="icone-analise">
                &lt;/&gt;
            </div>

        </div>


        <div class="compatibilidade-indice">

            <div class="compatibilidade-valor">

                <strong>
                    91%
                </strong>

                <span>
                    melhor compatibilidade
                </span>

            </div>

            <div class="barra-compatibilidade">
                <span style="width: 91%;"></span>
            </div>

        </div>


        <div class="grade-analise">

            <section class="bloco-analise">

                <span class="titulo-analise">
                    Talentos recomendados
                </span>


                <div class="lista-competencias">

                    <div class="competencia competencia-ok">

                        <span class="icone-competencia">
                            91
                        </span>

                        <div>

                            <strong>
                                Ana Souza
                            </strong>

                            <small>
                                Python · Flask · SQL
                            </small>

                        </div>

                    </div>


                    <div class="competencia competencia-ok">

                        <span class="icone-competencia">
                            87
                        </span>

                        <div>

                            <strong>
                                João Pedro
                            </strong>

                            <small>
                                Python · APIs · MySQL
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            <section class="bloco-analise">

                <span class="titulo-analise">
                    Requisitos da vaga
                </span>


                <div class="lista-competencias">

                    <div class="competencia competencia-aprender">

                        <span class="icone-competencia">
                            ✓
                        </span>

                        <div>

                            <strong>
                                Python
                            </strong>

                            <small>
                                Competência obrigatória
                            </small>

                        </div>

                    </div>


                    <div class="competencia competencia-aprender">

                        <span class="icone-competencia">
                            ✓
                        </span>

                        <div>

                            <strong>
                                Flask
                            </strong>

                            <small>
                                Competência desejada
                            </small>

                        </div>

                    </div>

                </div>

            </section>

        </div>


        <div class="compatibilidade-rodape">

            <div class="tags-vaga">
                <span>Júnior</span>
                <span>Remoto</span>
                <span>Backend</span>
            </div>

            <a href="#talentos-empresa">
                Ver talentos →
            </a>

        </div>
    `;
}


function atualizarFluxoEmpresa() {
    document.getElementById(
        "titulo-como-funciona-home"
    ).textContent =
        "Da publicação da vaga aos talentos mais alinhados.";


    document.getElementById(
        "descricao-como-funciona-home"
    ).textContent =
        "Centralize informações da oportunidade, compare competências e torne a busca por profissionais mais objetiva.";


    document.getElementById(
        "fluxo-home"
    ).innerHTML = `
        <article class="etapa-market">

            <div class="numero-etapa">
                01
            </div>

            <div class="icone-etapa">
                +
            </div>

            <h3>
                Publique sua vaga
            </h3>

            <p>
                Cadastre cargo, descrição, modalidade,
                localização e os requisitos necessários
                para a oportunidade.
            </p>

            <a href="./pages/vagas.html">
                Publicar vaga →
            </a>

        </article>


        <article class="etapa-market">

            <div class="numero-etapa">
                02
            </div>

            <div class="icone-etapa">
                ✓
            </div>

            <h3>
                Compare compatibilidade
            </h3>

            <p>
                Utilize requisitos e habilidades para
                identificar quais profissionais possuem
                maior aderência à oportunidade.
            </p>

            <a href="#talentos-empresa">
                Ver exemplo →
            </a>

        </article>


        <article class="etapa-market">

            <div class="numero-etapa">
                03
            </div>

            <div class="icone-etapa">
                ⌕
            </div>

            <h3>
                Explore talentos
            </h3>

            <p>
                Consulte profissionais, competências,
                experiências e informações relevantes
                para sua busca.
            </p>

            <a href="#talentos-empresa">
                Buscar talentos →
            </a>

        </article>


        <article class="etapa-market">

            <div class="numero-etapa">
                04
            </div>

            <div class="icone-etapa">
                ↗
            </div>

            <h3>
                Acompanhe suas vagas
            </h3>

            <p>
                Mantenha suas oportunidades organizadas
                e atualizadas durante todo o processo
                de recrutamento.
            </p>

            <a href="./pages/vagas.html">
                Minhas vagas →
            </a>

        </article>
    `;
}


function atualizarPropostaEmpresa() {
    const secao =
        document.getElementById(
            "secao-proposta-home"
        );

    if (secao) {
        secao.id =
            "talentos-e-requisitos";
    }


    document.getElementById(
        "rotulo-proposta-home"
    ).textContent =
        "Mais do que publicar vagas";


    document.getElementById(
        "titulo-proposta-home"
    ).textContent =
        "Transforme requisitos em uma busca mais precisa.";


    document.getElementById(
        "descricao-proposta-home"
    ).textContent =
        "O Market Skills conecta o que sua empresa procura às competências profissionais cadastradas, ajudando a reduzir uma triagem baseada apenas em currículos.";


    document.getElementById(
        "dados-proposta-home"
    ).innerHTML = `
        <div class="item-proposta">

            <span>
                Vaga
            </span>

            <strong>
                O perfil que você procura
            </strong>

        </div>


        <div class="seta-proposta">
            +
        </div>


        <div class="item-proposta">

            <span>
                Talentos
            </span>

            <strong>
                Competências profissionais
            </strong>

        </div>


        <div class="seta-proposta">
            =
        </div>


        <div class="item-proposta item-proposta-destaque">

            <span>
                Compatibilidade
            </span>

            <strong>
                Triagem mais objetiva
            </strong>

        </div>
    `;
}


function atualizarChamadaEmpresa() {
    document.getElementById(
        "rotulo-chamada-home"
    ).textContent =
        "Comece pela próxima oportunidade";


    document.getElementById(
        "titulo-chamada-home"
    ).textContent =
        "Acelere suas contratações em tecnologia.";


    document.getElementById(
        "descricao-chamada-home"
    ).textContent =
        "Cadastre uma oportunidade e comece a estruturar sua busca pelos profissionais mais alinhados à necessidade da empresa.";


    document.getElementById(
        "acoes-chamada-home"
    ).innerHTML = `
        <a
            href="./pages/vagas.html"
            class="botao botao-principal botao-grande"
        >
            Anunciar uma vaga agora
        </a>

        <a
            href="#talentos-empresa"
            class="botao botao-escuro botao-grande"
        >
            Buscar talentos
        </a>
    `;
}


function atualizarRodapeEmpresa() {
    document.getElementById(
        "descricao-rodape-home"
    ).textContent =
        "Vagas, talentos e dados profissionais reunidos para apoiar decisões de recrutamento mais claras.";


    document.getElementById(
        "links-plataforma-home"
    ).innerHTML = `
        <a href="./index.html">
            Dashboard
        </a>

        <a href="#talentos-empresa">
            Talentos
        </a>

        <a href="./pages/vagas.html">
            Minhas vagas
        </a>

        <a href="./pages/perfil.html">
            Perfil
        </a>
    `;
}


async function iniciarHome() {
    await Promise.all([
        verificarConexaoMarketSkills(),
        configurarExperienciaHome(),
    ]);
}


document.addEventListener(
    "DOMContentLoaded",
    iniciarHome
);