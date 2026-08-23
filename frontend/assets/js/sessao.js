let usuarioAutenticado = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarControleSessao
);


async function iniciarControleSessao() {
    try {
        const resposta =
            await apiRequest(
                "/autenticacao/sessao"
            );

        if (
            !resposta.autenticado ||
            !resposta.usuario
        ) {
            usuarioAutenticado = null;

            if (paginaExigeAutenticacao()) {
                redirecionarParaLogin();

                return;
            }

            renderizarAcoesVisitante();

            return;
        }

        usuarioAutenticado =
            resposta.usuario;

        renderizarMenuUsuario(
            usuarioAutenticado
        );

    } catch (erro) {
        console.error(
            "Erro ao verificar sessão:",
            erro
        );

        if (paginaExigeAutenticacao()) {
            redirecionarParaLogin();

            return;
        }

        renderizarAcoesVisitante();
    }
}


function paginaExigeAutenticacao() {
    return (
        document.body.dataset
            .paginaProtegida === "true"
    );
}


function renderizarAcoesVisitante() {
    const conteiner =
        document.querySelector(
            ".acoes-navegacao"
        );

    if (!conteiner) {
        return;
    }

    const caminhos =
        obterCaminhosNavegacao();

    conteiner.innerHTML = `
        <a
            href="${caminhos.login}"
            class="botao botao-contorno"
        >
            Entrar
        </a>

        <a
            href="${caminhos.cadastro}"
            class="botao botao-principal"
        >
            Criar conta
        </a>
    `;
}


function renderizarMenuUsuario(usuario) {
    const conteiner =
        document.querySelector(
            ".acoes-navegacao"
        );

    if (!conteiner) {
        return;
    }

    const inicial =
        obterInicialUsuario(
            usuario.nome
        );

    const tipoConta =
        formatarTipoConta(
            usuario.tipoConta
        );

    const nome =
        escaparTextoSessao(
            usuario.nome
        );

    const email =
        escaparTextoSessao(
            usuario.email
        );

    conteiner.innerHTML = `
        <div class="controle-conta">

            <button
                id="botao-menu-conta"
                class="botao-conta"
                type="button"
                aria-expanded="false"
            >
                <span class="avatar-conta">
                    ${inicial}
                </span>

                <span class="resumo-conta">
                    <strong>
                        ${nome}
                    </strong>

                    <small>
                        ${tipoConta}
                    </small>
                </span>

                <span class="seta-conta">
                    ▾
                </span>
            </button>


            <div
                id="menu-conta"
                class="menu-conta"
                hidden
            >

                <div class="cabecalho-menu-conta">

                    <span class="avatar-menu-conta">
                        ${inicial}
                    </span>

                    <div>
                        <strong>
                            ${nome}
                        </strong>

                        <span>
                            ${email}
                        </span>

                        <small>
                            ${tipoConta}
                        </small>
                    </div>

                </div>


                <div class="separador-menu"></div>


                ${
                    usuario.tipoConta ===
                    "estudante"
                        ? criarLinkMeuPerfil()
                        : criarLinkAreaEmpresa()
                }


                <button
                    id="botao-trocar-conta"
                    class="item-menu-conta"
                    type="button"
                >
                    Trocar conta
                </button>


                <div class="separador-menu"></div>


                <button
                    id="botao-sair"
                    class="item-menu-conta item-sair"
                    type="button"
                >
                    Sair
                </button>

            </div>

        </div>
    `;

    registrarEventosMenuConta();
}


function criarLinkMeuPerfil() {
    const caminhos =
        obterCaminhosNavegacao();

    return `
        <a
            href="${caminhos.perfil}"
            class="item-menu-conta"
        >
            Meu perfil
        </a>
    `;
}


function criarLinkAreaEmpresa() {
    /*
     * A área empresarial ainda será
     * construída.
     *
     * Por enquanto mantemos o usuário
     * na Home em vez de enviar uma
     * empresa para o perfil do estudante.
     */

    const caminhos =
        obterCaminhosNavegacao();

    return `
        <a
            href="${caminhos.home}"
            class="item-menu-conta"
        >
            Área da empresa
        </a>
    `;
}


function registrarEventosMenuConta() {
    const botaoMenu =
        document.getElementById(
            "botao-menu-conta"
        );

    const menu =
        document.getElementById(
            "menu-conta"
        );

    const botaoTrocar =
        document.getElementById(
            "botao-trocar-conta"
        );

    const botaoSair =
        document.getElementById(
            "botao-sair"
        );

    if (
        !botaoMenu ||
        !menu
    ) {
        return;
    }

    botaoMenu.addEventListener(
        "click",
        evento => {
            evento.stopPropagation();

            const aberto =
                !menu.hidden;

            menu.hidden = aberto;

            botaoMenu.setAttribute(
                "aria-expanded",
                String(!aberto)
            );
        }
    );

    menu.addEventListener(
        "click",
        evento => {
            evento.stopPropagation();
        }
    );

    document.addEventListener(
        "click",
        () => {
            menu.hidden = true;

            botaoMenu.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    );

    if (botaoTrocar) {
        botaoTrocar.addEventListener(
            "click",
            trocarConta
        );
    }

    if (botaoSair) {
        botaoSair.addEventListener(
            "click",
            sairDaConta
        );
    }
}


async function sairDaConta() {
    try {
        await apiRequest(
            "/autenticacao/logout",
            {
                method: "POST",
            }
        );

        usuarioAutenticado = null;

        const caminhos =
            obterCaminhosNavegacao();

        window.location.href =
            caminhos.home;

    } catch (erro) {
        console.error(
            "Erro ao sair:",
            erro
        );
    }
}


async function trocarConta() {
    try {
        await apiRequest(
            "/autenticacao/logout",
            {
                method: "POST",
            }
        );

        usuarioAutenticado = null;

        const caminhos =
            obterCaminhosNavegacao();

        window.location.href =
            caminhos.login;

    } catch (erro) {
        console.error(
            "Erro ao trocar conta:",
            erro
        );
    }
}


function redirecionarParaLogin() {
    const caminhos =
        obterCaminhosNavegacao();

    window.location.replace(
        caminhos.login
    );
}


function obterCaminhosNavegacao() {
    const estaEmPaginas =
        window.location.pathname
            .includes("/pages/");

    if (estaEmPaginas) {
        return {
            home: "../index.html",
            login: "./login.html",
            cadastro: "./cadastro.html",
            perfil: "./perfil.html",
        };
    }

    return {
        home: "./index.html",
        login: "./pages/login.html",
        cadastro:
            "./pages/cadastro.html",
        perfil: "./pages/perfil.html",
    };
}


function obterInicialUsuario(nome) {
    if (!nome) {
        return "U";
    }

    return nome
        .trim()
        .charAt(0)
        .toUpperCase();
}


function formatarTipoConta(tipoConta) {
    if (tipoConta === "empresa") {
        return "Empresa";
    }

    return "Estudante";
}


function escaparTextoSessao(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}