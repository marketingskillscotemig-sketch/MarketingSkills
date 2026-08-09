let usuarios = [];
let perfisProfissionais = [];
let habilidades = [];
let habilidadesDosPerfis = [];

let usuarioSelecionadoId = null;
let usuarioEmEdicaoId = null;
let habilidadeEmEdicaoId = null;

let temporizadorMensagem = null;


document.addEventListener(
    "DOMContentLoaded",
    iniciarPaginaPerfil
);


async function iniciarPaginaPerfil() {
    registrarEventos();

    await carregarDados();
}


function registrarEventos() {
    document
        .getElementById("botao-novo-usuario")
        .addEventListener(
            "click",
            () => abrirModalUsuario()
        );

    document
        .getElementById("botao-primeiro-usuario")
        .addEventListener(
            "click",
            () => abrirModalUsuario()
        );

    document
        .getElementById("botao-editar-usuario")
        .addEventListener(
            "click",
            editarUsuarioSelecionado
        );

    document
        .getElementById("botao-excluir-usuario")
        .addEventListener(
            "click",
            excluirUsuarioSelecionado
        );

    document
        .getElementById("formulario-usuario")
        .addEventListener(
            "submit",
            salvarUsuario
        );

    document
        .getElementById("formulario-perfil")
        .addEventListener(
            "submit",
            salvarPerfilProfissional
        );

    document
        .getElementById("botao-excluir-perfil")
        .addEventListener(
            "click",
            excluirPerfilProfissional
        );

    document
        .getElementById(
            "formulario-adicionar-habilidade"
        )
        .addEventListener(
            "submit",
            adicionarHabilidadeAoPerfil
        );

    document
        .getElementById("lista-habilidades-perfil")
        .addEventListener(
            "click",
            tratarAcaoHabilidadePerfil
        );

    document
        .getElementById("botao-nova-habilidade")
        .addEventListener(
            "click",
            () => abrirModalHabilidade()
        );

    document
        .getElementById("catalogo-habilidades")
        .addEventListener(
            "click",
            tratarAcaoCatalogo
        );

    document
        .getElementById("formulario-habilidade")
        .addEventListener(
            "submit",
            salvarHabilidade
        );

    document
        .querySelectorAll("[data-fechar]")
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => {
                    const modal =
                        document.getElementById(
                            botao.dataset.fechar
                        );

                    modal.close();
                }
            );
        });
}


async function carregarDados() {
    try {
        const [
            dadosUsuarios,
            dadosPerfis,
            dadosHabilidades,
            dadosPerfilHabilidades,
        ] = await Promise.all([
            apiRequest("/usuarios"),
            apiRequest("/perfis-profissionais"),
            apiRequest("/habilidades"),
            apiRequest("/perfil-habilidades"),
        ]);

        usuarios = dadosUsuarios;
        perfisProfissionais = dadosPerfis;
        habilidades = dadosHabilidades;
        habilidadesDosPerfis =
            dadosPerfilHabilidades;

        definirUsuarioSelecionado();

        renderizarPagina();

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            erro.message ||
            "Não foi possível carregar os dados.",
            "erro"
        );
    }
}


function definirUsuarioSelecionado() {
    const idSalvo =
        Number(
            localStorage.getItem(
                "usuarioSelecionadoId"
            )
        );

    if (
        idSalvo &&
        usuarios.some(
            usuario =>
                usuario.id === idSalvo
        )
    ) {
        usuarioSelecionadoId =
            idSalvo;

        return;
    }

    usuarioSelecionadoId =
        usuarios.length
            ? usuarios[0].id
            : null;

    salvarUsuarioSelecionado();
}


function salvarUsuarioSelecionado() {
    if (usuarioSelecionadoId) {
        localStorage.setItem(
            "usuarioSelecionadoId",
            String(usuarioSelecionadoId)
        );
    } else {
        localStorage.removeItem(
            "usuarioSelecionadoId"
        );
    }
}


function renderizarPagina() {
    renderizarUsuarios();

    const estadoVazio =
        document.getElementById(
            "perfil-sem-usuario"
        );

    const conteudo =
        document.getElementById(
            "conteudo-usuario"
        );

    if (!usuarioSelecionadoId) {
        estadoVazio.classList.remove(
            "oculto"
        );

        conteudo.classList.add(
            "oculto"
        );

        return;
    }

    estadoVazio.classList.add(
        "oculto"
    );

    conteudo.classList.remove(
        "oculto"
    );

    renderizarUsuarioSelecionado();
    renderizarPerfilProfissional();
    renderizarHabilidadesPerfil();
    renderizarCatalogoHabilidades();
}


function renderizarUsuarios() {
    const conteiner =
        document.getElementById(
            "lista-usuarios"
        );

    if (!usuarios.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhum usuário cadastrado.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        usuarios
            .map(usuario => {
                const selecionado =
                    usuario.id ===
                    usuarioSelecionadoId;

                const inicial =
                    obterInicial(
                        usuario.nome
                    );

                return `
                    <button
                        type="button"
                        class="
                            item-usuario
                            ${
                                selecionado
                                    ? "selecionado"
                                    : ""
                            }
                        "
                        data-usuario-id="${usuario.id}"
                    >
                        <span class="avatar-pequeno">
                            ${inicial}
                        </span>

                        <span class="dados-item-usuario">
                            <strong>
                                ${escaparHtml(usuario.nome)}
                            </strong>

                            <span>
                                ${escaparHtml(usuario.email)}
                            </span>
                        </span>
                    </button>
                `;
            })
            .join("");

    conteiner
        .querySelectorAll(
            "[data-usuario-id]"
        )
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => {
                    usuarioSelecionadoId =
                        Number(
                            botao.dataset.usuarioId
                        );

                    salvarUsuarioSelecionado();

                    renderizarPagina();
                }
            );
        });
}


function renderizarUsuarioSelecionado() {
    const usuario =
        obterUsuarioSelecionado();

    if (!usuario) {
        return;
    }

    document.getElementById(
        "nome-usuario"
    ).textContent =
        usuario.nome;

    document.getElementById(
        "email-usuario"
    ).textContent =
        usuario.email;

    document.getElementById(
        "avatar-usuario"
    ).textContent =
        obterInicial(
            usuario.nome
        );

    const etiqueta =
        document.getElementById(
            "status-usuario"
        );

    etiqueta.textContent =
        formatarStatusUsuario(
            usuario.status
        );

    etiqueta.classList.toggle(
        "inativo",
        usuario.status === "inativo"
    );
}


function renderizarPerfilProfissional() {
    const perfil =
        obterPerfilSelecionado();

    const botaoSalvar =
        document.getElementById(
            "botao-salvar-perfil"
        );

    const botaoExcluir =
        document.getElementById(
            "botao-excluir-perfil"
        );

    const situacao =
        document.getElementById(
            "situacao-perfil-profissional"
        );

    limparFormularioPerfil();

    if (!perfil) {
        situacao.textContent =
            "Não criado";

        botaoSalvar.textContent =
            "Criar perfil profissional";

        botaoExcluir.classList.add(
            "oculto"
        );

        atualizarFormularioHabilidade();

        return;
    }

    situacao.textContent =
        "Perfil criado";

    botaoSalvar.textContent =
        "Salvar alterações";

    botaoExcluir.classList.remove(
        "oculto"
    );

    document.getElementById(
        "nivel-experiencia"
    ).value =
        perfil.nivelExperiencia || "";

    document.getElementById(
        "modalidade-preferida"
    ).value =
        perfil.modalidadePreferida || "";

    document.getElementById(
        "localizacao-preferida"
    ).value =
        perfil.localizacaoPreferida || "";

    document.getElementById(
        "horas-estudo"
    ).value =
        perfil.horasSemanaisEstudo ?? "";

    document.getElementById(
        "pretensao-salarial"
    ).value =
        perfil.pretensaoSalarial ?? "";

    document.getElementById(
        "objetivo-profissional"
    ).value =
        perfil.objetivoProfissional || "";

    atualizarFormularioHabilidade();
}


function limparFormularioPerfil() {
    document.getElementById(
        "nivel-experiencia"
    ).value = "";

    document.getElementById(
        "modalidade-preferida"
    ).value = "";

    document.getElementById(
        "localizacao-preferida"
    ).value = "";

    document.getElementById(
        "horas-estudo"
    ).value = "";

    document.getElementById(
        "pretensao-salarial"
    ).value = "";

    document.getElementById(
        "objetivo-profissional"
    ).value = "";
}


function renderizarHabilidadesPerfil() {
    const conteiner =
        document.getElementById(
            "lista-habilidades-perfil"
        );

    const contador =
        document.getElementById(
            "quantidade-habilidades-perfil"
        );

    const perfil =
        obterPerfilSelecionado();

    if (!perfil) {
        contador.textContent =
            "0 habilidades";

        conteiner.innerHTML = `
            <div class="estado-vazio">
                Crie primeiro o perfil profissional
                para adicionar habilidades.
            </div>
        `;

        return;
    }

    const associacoes =
        habilidadesDosPerfis.filter(
            item =>
                item.perfilProfissionalId ===
                perfil.id
        );

    contador.textContent =
        `${associacoes.length} ${
            associacoes.length === 1
                ? "habilidade"
                : "habilidades"
        }`;

    if (!associacoes.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma habilidade adicionada ao perfil.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        associacoes
            .map(associacao => {
                const habilidade =
                    habilidades.find(
                        item =>
                            item.id ===
                            associacao.habilidadeId
                    );

                if (!habilidade) {
                    return "";
                }

                return `
                    <div class="item-habilidade-perfil">

                        <div class="dados-habilidade">
                            <strong>
                                ${escaparHtml(habilidade.nome)}
                            </strong>

                            <span>
                                ${formatarCategoria(
                                    habilidade.categoria
                                )}
                            </span>
                        </div>

                        <select
                            class="seletor-nivel"
                            data-nivel-id="${associacao.id}"
                        >
                            ${criarOpcoesNivel(
                                associacao.nivelDominio
                            )}
                        </select>

                        <div class="acoes-habilidade">

                            <button
                                type="button"
                                class="botao-pequeno"
                                data-salvar-nivel="${associacao.id}"
                            >
                                Salvar nível
                            </button>

                            <button
                                type="button"
                                class="botao-pequeno perigo"
                                data-remover-associacao="${associacao.id}"
                            >
                                Remover
                            </button>

                        </div>

                    </div>
                `;
            })
            .join("");
}


function atualizarFormularioHabilidade() {
    const seletor =
        document.getElementById(
            "habilidade-perfil"
        );

    const perfil =
        obterPerfilSelecionado();

    if (!perfil) {
        seletor.innerHTML = `
            <option value="">
                Crie primeiro o perfil profissional
            </option>
        `;

        seletor.disabled = true;

        return;
    }

    seletor.disabled = false;

    const idsJaAssociados =
        new Set(
            habilidadesDosPerfis
                .filter(
                    item =>
                        item.perfilProfissionalId ===
                        perfil.id
                )
                .map(
                    item =>
                        item.habilidadeId
                )
        );

    const disponiveis =
        habilidades.filter(
            habilidade =>
                !idsJaAssociados.has(
                    habilidade.id
                )
        );

    if (!disponiveis.length) {
        seletor.innerHTML = `
            <option value="">
                Nenhuma habilidade disponível
            </option>
        `;

        return;
    }

    seletor.innerHTML = `
        <option value="">
            Selecione uma habilidade
        </option>

        ${disponiveis
            .map(
                habilidade => `
                    <option value="${habilidade.id}">
                        ${escaparHtml(habilidade.nome)}
                    </option>
                `
            )
            .join("")}
    `;
}


function renderizarCatalogoHabilidades() {
    const conteiner =
        document.getElementById(
            "catalogo-habilidades"
        );

    if (!habilidades.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma habilidade cadastrada no catálogo.
            </div>
        `;

        return;
    }

    const ordenadas =
        [...habilidades].sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );

    conteiner.innerHTML =
        ordenadas
            .map(habilidade => `
                <article class="cartao-habilidade">

                    <div class="topo-habilidade">
                        <h3>
                            ${escaparHtml(habilidade.nome)}
                        </h3>
                    </div>

                    <span class="categoria-habilidade">
                        ${formatarCategoria(
                            habilidade.categoria
                        )}
                    </span>

                    <p>
                        ${
                            habilidade.descricao
                                ? escaparHtml(
                                    habilidade.descricao
                                )
                                : "Sem descrição cadastrada."
                        }
                    </p>

                    <div class="acoes-cartao-habilidade">

                        <button
                            type="button"
                            class="botao-pequeno"
                            data-editar-habilidade="${habilidade.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-pequeno perigo"
                            data-excluir-habilidade="${habilidade.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>
            `)
            .join("");
}


async function salvarUsuario(evento) {
    evento.preventDefault();

    const nome =
        document.getElementById(
            "usuario-nome"
        ).value.trim();

    const email =
        document.getElementById(
            "usuario-email"
        ).value.trim();

    const senha =
        document.getElementById(
            "usuario-senha"
        ).value;

    try {
        if (usuarioEmEdicaoId) {
            const dados = {
                nome,
                email,
                status:
                    document.getElementById(
                        "usuario-status"
                    ).value,
            };

            if (senha) {
                dados.senha = senha;
            }

            await apiRequest(
                `/usuarios/${usuarioEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados),
                }
            );

            mostrarMensagem(
                "Usuário atualizado com sucesso.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/usuarios",
                {
                    method: "POST",
                    body: JSON.stringify({
                        nome,
                        email,
                        senha,
                    }),
                }
            );

            mostrarMensagem(
                "Usuário cadastrado com sucesso.",
                "sucesso"
            );
        }

        document
            .getElementById("modal-usuario")
            .close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function abrirModalUsuario(
    usuario = null
) {
    usuarioEmEdicaoId =
        usuario?.id || null;

    const modal =
        document.getElementById(
            "modal-usuario"
        );

    const campoSenha =
        document.getElementById(
            "usuario-senha"
        );

    const campoStatus =
        document.getElementById(
            "campo-status-usuario"
        );

    document.getElementById(
        "titulo-modal-usuario"
    ).textContent =
        usuario
            ? "Editar usuário"
            : "Novo usuário";

    document.getElementById(
        "usuario-nome"
    ).value =
        usuario?.nome || "";

    document.getElementById(
        "usuario-email"
    ).value =
        usuario?.email || "";

    campoSenha.value = "";

    if (usuario) {
        campoSenha.required = false;

        document.getElementById(
            "rotulo-senha"
        ).textContent =
            "Nova senha (opcional)";

        campoStatus.classList.remove(
            "oculto"
        );

        document.getElementById(
            "usuario-status"
        ).value =
            usuario.status;

    } else {
        campoSenha.required = true;

        document.getElementById(
            "rotulo-senha"
        ).textContent =
            "Senha";

        campoStatus.classList.add(
            "oculto"
        );
    }

    modal.showModal();
}


function editarUsuarioSelecionado() {
    const usuario =
        obterUsuarioSelecionado();

    if (usuario) {
        abrirModalUsuario(usuario);
    }
}


async function excluirUsuarioSelecionado() {
    const usuario =
        obterUsuarioSelecionado();

    if (!usuario) {
        return;
    }

    const confirmar =
        window.confirm(
            `Excluir o usuário "${usuario.nome}"? ` +
            "Os dados vinculados a ele também poderão ser removidos."
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/usuarios/${usuario.id}`,
            {
                method: "DELETE",
            }
        );

        usuarioSelecionadoId = null;

        salvarUsuarioSelecionado();

        mostrarMensagem(
            "Usuário excluído com sucesso.",
            "sucesso"
        );

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function salvarPerfilProfissional(
    evento
) {
    evento.preventDefault();

    if (!usuarioSelecionadoId) {
        return;
    }

    const perfil =
        obterPerfilSelecionado();

    const dados =
        obterDadosFormularioPerfil();

    try {
        if (perfil) {
            if (
                Object.keys(dados).length === 0
            ) {
                mostrarMensagem(
                    "Preencha ao menos um campo do perfil.",
                    "erro"
                );

                return;
            }

            await apiRequest(
                `/perfis-profissionais/${perfil.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados),
                }
            );

            mostrarMensagem(
                "Perfil profissional atualizado.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/perfis-profissionais",
                {
                    method: "POST",
                    body: JSON.stringify({
                        usuarioId:
                            usuarioSelecionadoId,
                        ...dados,
                    }),
                }
            );

            mostrarMensagem(
                "Perfil profissional criado.",
                "sucesso"
            );
        }

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function obterDadosFormularioPerfil() {
    const dados = {};

    const nivel =
        document.getElementById(
            "nivel-experiencia"
        ).value;

    const modalidade =
        document.getElementById(
            "modalidade-preferida"
        ).value;

    const localizacao =
        document.getElementById(
            "localizacao-preferida"
        ).value.trim();

    const horas =
        document.getElementById(
            "horas-estudo"
        ).value;

    const salario =
        document.getElementById(
            "pretensao-salarial"
        ).value;

    const objetivo =
        document.getElementById(
            "objetivo-profissional"
        ).value.trim();

    if (nivel) {
        dados.nivelExperiencia =
            nivel;
    }

    if (modalidade) {
        dados.modalidadePreferida =
            modalidade;
    }

    if (localizacao) {
        dados.localizacaoPreferida =
            localizacao;
    }

    if (horas !== "") {
        dados.horasSemanaisEstudo =
            Number(horas);
    }

    if (salario !== "") {
        dados.pretensaoSalarial =
            Number(salario);
    }

    if (objetivo) {
        dados.objetivoProfissional =
            objetivo;
    }

    return dados;
}


async function excluirPerfilProfissional() {
    const perfil =
        obterPerfilSelecionado();

    if (!perfil) {
        return;
    }

    const confirmar =
        window.confirm(
            "Excluir este perfil profissional? " +
            "As habilidades associadas ao perfil também serão removidas."
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/perfis-profissionais/${perfil.id}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagem(
            "Perfil profissional excluído.",
            "sucesso"
        );

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function adicionarHabilidadeAoPerfil(
    evento
) {
    evento.preventDefault();

    const perfil =
        obterPerfilSelecionado();

    if (!perfil) {
        mostrarMensagem(
            "Crie primeiro o perfil profissional.",
            "erro"
        );

        return;
    }

    const habilidadeId =
        Number(
            document.getElementById(
                "habilidade-perfil"
            ).value
        );

    const nivelDominio =
        document.getElementById(
            "nivel-dominio"
        ).value;

    if (!habilidadeId) {
        mostrarMensagem(
            "Selecione uma habilidade.",
            "erro"
        );

        return;
    }

    try {
        await apiRequest(
            "/perfil-habilidades",
            {
                method: "POST",
                body: JSON.stringify({
                    perfilProfissionalId:
                        perfil.id,
                    habilidadeId,
                    nivelDominio,
                }),
            }
        );

        mostrarMensagem(
            "Habilidade adicionada ao perfil.",
            "sucesso"
        );

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function tratarAcaoHabilidadePerfil(
    evento
) {
    const botaoSalvar =
        evento.target.closest(
            "[data-salvar-nivel]"
        );

    const botaoRemover =
        evento.target.closest(
            "[data-remover-associacao]"
        );

    if (botaoSalvar) {
        const associacaoId =
            Number(
                botaoSalvar.dataset
                    .salvarNivel
            );

        const seletor =
            document.querySelector(
                `[data-nivel-id="${associacaoId}"]`
            );

        try {
            await apiRequest(
                `/perfil-habilidades/${associacaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        nivelDominio:
                            seletor.value,
                    }),
                }
            );

            mostrarMensagem(
                "Nível de domínio atualizado.",
                "sucesso"
            );

            await carregarDados();

        } catch (erro) {
            mostrarMensagem(
                erro.message,
                "erro"
            );
        }

        return;
    }

    if (botaoRemover) {
        const associacaoId =
            Number(
                botaoRemover.dataset
                    .removerAssociacao
            );

        try {
            await apiRequest(
                `/perfil-habilidades/${associacaoId}`,
                {
                    method: "DELETE",
                }
            );

            mostrarMensagem(
                "Habilidade removida do perfil.",
                "sucesso"
            );

            await carregarDados();

        } catch (erro) {
            mostrarMensagem(
                erro.message,
                "erro"
            );
        }
    }
}


function tratarAcaoCatalogo(
    evento
) {
    const botaoEditar =
        evento.target.closest(
            "[data-editar-habilidade]"
        );

    const botaoExcluir =
        evento.target.closest(
            "[data-excluir-habilidade]"
        );

    if (botaoEditar) {
        const habilidadeId =
            Number(
                botaoEditar.dataset
                    .editarHabilidade
            );

        const habilidade =
            habilidades.find(
                item =>
                    item.id === habilidadeId
            );

        if (habilidade) {
            abrirModalHabilidade(
                habilidade
            );
        }

        return;
    }

    if (botaoExcluir) {
        const habilidadeId =
            Number(
                botaoExcluir.dataset
                    .excluirHabilidade
            );

        excluirHabilidade(
            habilidadeId
        );
    }
}


function abrirModalHabilidade(
    habilidade = null
) {
    habilidadeEmEdicaoId =
        habilidade?.id || null;

    document.getElementById(
        "titulo-modal-habilidade"
    ).textContent =
        habilidade
            ? "Editar habilidade"
            : "Nova habilidade";

    document.getElementById(
        "habilidade-nome"
    ).value =
        habilidade?.nome || "";

    document.getElementById(
        "habilidade-categoria"
    ).value =
        habilidade?.categoria ||
        "linguagem";

    document.getElementById(
        "habilidade-descricao"
    ).value =
        habilidade?.descricao || "";

    document
        .getElementById(
            "modal-habilidade"
        )
        .showModal();
}


async function salvarHabilidade(
    evento
) {
    evento.preventDefault();

    const dados = {
        nome:
            document.getElementById(
                "habilidade-nome"
            ).value.trim(),

        categoria:
            document.getElementById(
                "habilidade-categoria"
            ).value,

        descricao:
            document.getElementById(
                "habilidade-descricao"
            ).value.trim(),
    };

    try {
        if (habilidadeEmEdicaoId) {
            await apiRequest(
                `/habilidades/${habilidadeEmEdicaoId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados),
                }
            );

            mostrarMensagem(
                "Habilidade atualizada.",
                "sucesso"
            );

        } else {
            await apiRequest(
                "/habilidades",
                {
                    method: "POST",
                    body: JSON.stringify(dados),
                }
            );

            mostrarMensagem(
                "Habilidade cadastrada.",
                "sucesso"
            );
        }

        document
            .getElementById(
                "modal-habilidade"
            )
            .close();

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function excluirHabilidade(
    habilidadeId
) {
    const habilidade =
        habilidades.find(
            item =>
                item.id === habilidadeId
        );

    if (!habilidade) {
        return;
    }

    const confirmar =
        window.confirm(
            `Excluir a habilidade "${habilidade.nome}"?`
        );

    if (!confirmar) {
        return;
    }

    try {
        await apiRequest(
            `/habilidades/${habilidadeId}`,
            {
                method: "DELETE",
            }
        );

        mostrarMensagem(
            "Habilidade excluída.",
            "sucesso"
        );

        await carregarDados();

    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function obterUsuarioSelecionado() {
    return usuarios.find(
        usuario =>
            usuario.id ===
            usuarioSelecionadoId
    ) || null;
}


function obterPerfilSelecionado() {
    return perfisProfissionais.find(
        perfil =>
            perfil.usuarioId ===
            usuarioSelecionadoId
    ) || null;
}


function obterInicial(nome) {
    if (!nome) {
        return "U";
    }

    return nome
        .trim()
        .charAt(0)
        .toUpperCase();
}


function formatarStatusUsuario(
    status
) {
    return status === "inativo"
        ? "Inativo"
        : "Ativo";
}


function formatarCategoria(
    categoria
) {
    const nomes = {
        linguagem: "Linguagem",
        framework: "Framework",
        banco_dados: "Banco de dados",
        ferramenta: "Ferramenta",
        conceito: "Conceito",
        outra: "Outra",
    };

    return nomes[categoria] ||
        categoria ||
        "Não informada";
}


function criarOpcoesNivel(
    nivelAtual
) {
    const niveis = [
        ["basico", "Básico"],
        ["intermediario", "Intermediário"],
        ["avancado", "Avançado"],
    ];

    return niveis
        .map(
            ([valor, nome]) => `
                <option
                    value="${valor}"
                    ${
                        valor === nivelAtual
                            ? "selected"
                            : ""
                    }
                >
                    ${nome}
                </option>
            `
        )
        .join("");
}


function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarMensagem(
    texto,
    tipo
) {
    const elemento =
        document.getElementById(
            "mensagem-sistema"
        );

    clearTimeout(
        temporizadorMensagem
    );

    elemento.textContent =
        texto;

    elemento.className =
        `mensagem-sistema visivel ${tipo}`;

    temporizadorMensagem =
        setTimeout(
            () => {
                elemento.className =
                    "mensagem-sistema";
            },
            3500
        );
}