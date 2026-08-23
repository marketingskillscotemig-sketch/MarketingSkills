document.addEventListener(
    "DOMContentLoaded",
    iniciarAutenticacao
);


function iniciarAutenticacao() {
    const formularioLogin =
        document.getElementById(
            "formulario-login"
        );

    const formularioCadastro =
        document.getElementById(
            "formulario-cadastro"
        );

    if (formularioLogin) {
        formularioLogin.addEventListener(
            "submit",
            realizarLogin
        );
    }

    if (formularioCadastro) {
        formularioCadastro.addEventListener(
            "submit",
            realizarCadastro
        );

        registrarMudancaTipoConta();
    }
}


async function realizarLogin(evento) {
    evento.preventDefault();

    const mensagem =
        document.getElementById(
            "mensagem-login"
        );

    const botao =
        document.getElementById(
            "botao-login"
        );

    limparMensagem(mensagem);

    const email =
        document.getElementById(
            "login-email"
        ).value.trim();

    const senha =
        document.getElementById(
            "login-senha"
        ).value;

    try {
        botao.disabled = true;
        botao.textContent = "Entrando...";

        const resposta =
            await apiRequest(
                "/autenticacao/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        senha,
                    }),
                }
            );

        mostrarMensagem(
            mensagem,
            resposta.mensagem,
            "sucesso"
        );

        setTimeout(
            () => {
                redirecionarAposAutenticacao(
                    resposta.usuario
                );
            },
            500
        );

    } catch (erro) {
        mostrarMensagem(
            mensagem,
            erro.message,
            "erro"
        );

        botao.disabled = false;
        botao.textContent = "Entrar";
    }
}


async function realizarCadastro(evento) {
    evento.preventDefault();

    const mensagem =
        document.getElementById(
            "mensagem-cadastro"
        );

    const botao =
        document.getElementById(
            "botao-cadastro"
        );

    limparMensagem(mensagem);

    const nome =
        document.getElementById(
            "cadastro-nome"
        ).value.trim();

    const email =
        document.getElementById(
            "cadastro-email"
        ).value.trim();

    const senha =
        document.getElementById(
            "cadastro-senha"
        ).value;

    const confirmarSenha =
        document.getElementById(
            "cadastro-confirmar-senha"
        ).value;

    const tipoConta =
        document.querySelector(
            'input[name="tipoConta"]:checked'
        ).value;

    if (senha !== confirmarSenha) {
        mostrarMensagem(
            mensagem,
            "As senhas não coincidem.",
            "erro"
        );

        return;
    }

    try {
        botao.disabled = true;

        botao.textContent =
            "Criando conta...";

        const resposta =
            await apiRequest(
                "/autenticacao/cadastro",
                {
                    method: "POST",

                    body: JSON.stringify({
                        nome,
                        email,
                        senha,
                        tipoConta,
                    }),
                }
            );

        mostrarMensagem(
            mensagem,
            resposta.mensagem,
            "sucesso"
        );

        setTimeout(
            () => {
                redirecionarAposAutenticacao(
                    resposta.usuario
                );
            },
            500
        );

    } catch (erro) {
        mostrarMensagem(
            mensagem,
            erro.message,
            "erro"
        );

        botao.disabled = false;

        botao.textContent =
            "Criar minha conta";
    }
}


function registrarMudancaTipoConta() {
    const opcoes =
        document.querySelectorAll(
            'input[name="tipoConta"]'
        );

    const rotuloNome =
        document.getElementById(
            "rotulo-nome"
        );

    const campoNome =
        document.getElementById(
            "cadastro-nome"
        );

    opcoes.forEach(opcao => {
        opcao.addEventListener(
            "change",
            () => {
                if (
                    opcao.value === "empresa" &&
                    opcao.checked
                ) {
                    rotuloNome.textContent =
                        "Nome do responsável";

                    campoNome.placeholder =
                        "Pessoa responsável pela conta";

                    return;
                }

                if (
                    opcao.value === "estudante" &&
                    opcao.checked
                ) {
                    rotuloNome.textContent =
                        "Nome completo";

                    campoNome.placeholder =
                        "";
                }
            }
        );
    });
}


function redirecionarAposAutenticacao(
    usuario
) {
    /*
     * Por enquanto estudante e empresa
     * retornam à Home.
     *
     * Quando as duas áreas estiverem
     * concluídas, o redirecionamento
     * será separado pelo tipo de conta.
     */

    if (!usuario) {
        window.location.href =
            "../index.html";

        return;
    }

    window.location.href =
        "../index.html";
}


function mostrarMensagem(
    elemento,
    texto,
    tipo
) {
    elemento.textContent =
        texto;

    elemento.className =
        "mensagem-formulario";

    if (tipo === "sucesso") {
        elemento.classList.add(
            "sucesso"
        );
    }
}


function limparMensagem(elemento) {
    elemento.textContent = "";

    elemento.className =
        "mensagem-formulario";
}