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

    limparMensagem(
        mensagem
    );

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
        botao.textContent =
            "Entrando...";

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
        botao.textContent =
            "Entrar";
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

    limparMensagem(
        mensagem
    );

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

    const campoNomeEmpresa =
        document.getElementById(
            "cadastro-nome-empresa"
        );

    const nomeEmpresa =
        campoNomeEmpresa
            ? campoNomeEmpresa.value.trim()
            : "";

    if (
        senha !==
        confirmarSenha
    ) {
        mostrarMensagem(
            mensagem,
            "As senhas não coincidem.",
            "erro"
        );

        return;
    }

    if (
        tipoConta === "empresa" &&
        !nomeEmpresa
    ) {
        mostrarMensagem(
            mensagem,
            "Informe o nome da empresa.",
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
                        nomeEmpresa:
                            tipoConta ===
                            "empresa"
                                ? nomeEmpresa
                                : null,
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

    const conteinerEmpresa =
        document.getElementById(
            "campo-nome-empresa"
        );

    const campoNomeEmpresa =
        document.getElementById(
            "cadastro-nome-empresa"
        );

    function atualizarCampos() {
        const tipoSelecionado =
            document.querySelector(
                'input[name="tipoConta"]:checked'
            )?.value;

        const empresaSelecionada =
            tipoSelecionado ===
            "empresa";

        if (empresaSelecionada) {
            rotuloNome.textContent =
                "Nome do responsável";

            campoNome.placeholder =
                "Pessoa responsável pela conta";

            conteinerEmpresa.hidden =
                false;

            campoNomeEmpresa.required =
                true;

            return;
        }

        rotuloNome.textContent =
            "Nome completo";

        campoNome.placeholder =
            "";

        conteinerEmpresa.hidden =
            true;

        campoNomeEmpresa.required =
            false;

        campoNomeEmpresa.value =
            "";
    }

    opcoes.forEach(opcao => {
        opcao.addEventListener(
            "change",
            atualizarCampos
        );
    });

    atualizarCampos();
}


function redirecionarAposAutenticacao(
    usuario
) {
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
    elemento.textContent =
        "";

    elemento.className =
        "mensagem-formulario";
}