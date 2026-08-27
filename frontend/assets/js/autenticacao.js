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
        registrarMascaraCnpj();
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

    const campoRazaoSocial =
        document.getElementById(
            "cadastro-razao-social"
        );

    const campoCnpj =
        document.getElementById(
            "cadastro-cnpj"
        );

    const nomeEmpresa =
        campoNomeEmpresa
            ? campoNomeEmpresa.value.trim()
            : "";

    const razaoSocial =
        campoRazaoSocial
            ? campoRazaoSocial.value.trim()
            : "";

    const cnpj =
        campoCnpj
            ? somenteNumeros(
                campoCnpj.value
            )
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
        tipoConta === "empresa"
    ) {
        if (!nomeEmpresa) {
            mostrarMensagem(
                mensagem,
                "Informe o nome fantasia da empresa.",
                "erro"
            );

            return;
        }

        if (!razaoSocial) {
            mostrarMensagem(
                mensagem,
                "Informe a Razão Social da empresa.",
                "erro"
            );

            return;
        }

        if (
            cnpj.length !== 14
        ) {
            mostrarMensagem(
                mensagem,
                "Informe um CNPJ com 14 dígitos.",
                "erro"
            );

            return;
        }
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

                        razaoSocial:
                            tipoConta ===
                            "empresa"
                                ? razaoSocial
                                : null,

                        cnpj:
                            tipoConta ===
                            "empresa"
                                ? cnpj
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

    const conteinerNomeEmpresa =
        document.getElementById(
            "campo-nome-empresa"
        );

    const conteinerRazaoSocial =
        document.getElementById(
            "campo-razao-social"
        );

    const conteinerCnpj =
        document.getElementById(
            "campo-cnpj"
        );

    const campoNomeEmpresa =
        document.getElementById(
            "cadastro-nome-empresa"
        );

    const campoRazaoSocial =
        document.getElementById(
            "cadastro-razao-social"
        );

    const campoCnpj =
        document.getElementById(
            "cadastro-cnpj"
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

            conteinerNomeEmpresa.hidden =
                false;

            conteinerRazaoSocial.hidden =
                false;

            conteinerCnpj.hidden =
                false;

            campoNomeEmpresa.required =
                true;

            campoRazaoSocial.required =
                true;

            campoCnpj.required =
                true;

            return;
        }

        rotuloNome.textContent =
            "Nome completo";

        campoNome.placeholder =
            "";

        conteinerNomeEmpresa.hidden =
            true;

        conteinerRazaoSocial.hidden =
            true;

        conteinerCnpj.hidden =
            true;

        campoNomeEmpresa.required =
            false;

        campoRazaoSocial.required =
            false;

        campoCnpj.required =
            false;

        campoNomeEmpresa.value =
            "";

        campoRazaoSocial.value =
            "";

        campoCnpj.value =
            "";
    }

    opcoes.forEach(
        opcao => {
            opcao.addEventListener(
                "change",
                atualizarCampos
            );
        }
    );

    atualizarCampos();
}


function registrarMascaraCnpj() {
    const campo =
        document.getElementById(
            "cadastro-cnpj"
        );

    if (!campo) {
        return;
    }

    campo.addEventListener(
        "input",
        () => {
            let valor =
                somenteNumeros(
                    campo.value
                ).slice(
                    0,
                    14
                );

            valor = valor.replace(
                /^(\d{2})(\d)/,
                "$1.$2"
            );

            valor = valor.replace(
                /^(\d{2})\.(\d{3})(\d)/,
                "$1.$2.$3"
            );

            valor = valor.replace(
                /\.(\d{3})(\d)/,
                ".$1/$2"
            );

            valor = valor.replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );

            campo.value =
                valor;
        }
    );
}


function somenteNumeros(
    valor
) {
    return String(
        valor || ""
    ).replace(
        /\D/g,
        ""
    );
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


function limparMensagem(
    elemento
) {
    elemento.textContent =
        "";

    elemento.className =
        "mensagem-formulario";
}