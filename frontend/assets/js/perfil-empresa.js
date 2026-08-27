let empresaPaginaPerfil = null;
let vagasEmpresaPaginaPerfil = [];

let temporizadorMensagemEmpresa = null;


async function iniciarPerfilEmpresa(
    usuario
) {
    document.body.classList.add(
        "perfil-empresa-ativo"
    );

    configurarNavegacaoPerfilEmpresa();

    const main =
        document.querySelector(
            "main.pagina-perfil"
        );

    main.innerHTML = `
        <div class="conteudo-centralizado">

            <div
                id="carregando-perfil-empresa"
                class="estado-carregando-empresa"
            >
                Carregando perfil da empresa...
            </div>

            <div
                id="conteudo-perfil-empresa"
                class="oculto"
            ></div>

        </div>
    `;

    try {
        const [
            empresas,
            vagas,
        ] = await Promise.all([
            apiRequest(
                "/empresas"
            ),
            apiRequest(
                "/vagas"
            ),
        ]);

        const empresaPublica =
            empresas.find(
                item =>
                    item.usuarioId ===
                    usuario.id
            );

        if (!empresaPublica) {
            throw new Error(
                "Não foi possível localizar o perfil empresarial desta conta."
            );
        }

        empresaPaginaPerfil =
            await apiRequest(
                `/empresas/${empresaPublica.id}`
            );

        vagasEmpresaPaginaPerfil =
            (vagas || []).filter(
                vaga =>
                    vaga.empresaId ===
                    empresaPaginaPerfil.id
            );

        renderizarPerfilEmpresa();

    } catch (erro) {
        document.getElementById(
            "carregando-perfil-empresa"
        ).innerHTML = `
            <div class="estado-erro-empresa">
                ${
                    escaparHtmlEmpresa(
                        erro.message ||
                        "Não foi possível carregar o perfil da empresa."
                    )
                }
            </div>
        `;
    }
}


function configurarNavegacaoPerfilEmpresa() {
    const navegacao =
        document.querySelector(
            ".navegacao-principal"
        );

    if (!navegacao) {
        return;
    }

    navegacao.innerHTML = `
        <a href="../index.html">
            Dashboard
        </a>

        <a href="../index.html#talentos-empresa">
            Talentos
        </a>

        <a href="./vagas.html">
            Minhas Vagas
        </a>

        <a
            href="./perfil.html"
            class="ativo"
        >
            Perfil
        </a>
    `;
}


function renderizarPerfilEmpresa() {
    const carregando =
        document.getElementById(
            "carregando-perfil-empresa"
        );

    const conteudo =
        document.getElementById(
            "conteudo-perfil-empresa"
        );

    carregando.classList.add(
        "oculto"
    );

    conteudo.classList.remove(
        "oculto"
    );

    const vagasAtivas =
        vagasEmpresaPaginaPerfil
            .filter(
                vaga =>
                    vaga.status === "ativa"
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.dataPublicacao || 0
                    ) -
                    new Date(
                        a.dataPublicacao || 0
                    )
            );

    conteudo.innerHTML = `
        <section class="hero-perfil-empresa">

            <div class="banner-empresa">

                ${
                    empresaPaginaPerfil.bannerUrl
                        ? `
                            <img
                                src="${obterUrlImagemEmpresa(
                                    empresaPaginaPerfil.bannerUrl
                                )}"
                                alt="Banner da empresa"
                            >
                        `
                        : `
                            <div class="banner-empresa-vazio">

                                <span>
                                    Market Skills
                                </span>

                            </div>
                        `
                }

                <div class="sombra-banner-empresa"></div>

            </div>


            <div class="identidade-empresa">

                <div class="logo-empresa">

                    ${
                        empresaPaginaPerfil.logoUrl
                            ? `
                                <img
                                    src="${obterUrlImagemEmpresa(
                                        empresaPaginaPerfil.logoUrl
                                    )}"
                                    alt="Logo da empresa"
                                >
                            `
                            : `
                                <span>
                                    ${obterInicialEmpresa(
                                        empresaPaginaPerfil.nome
                                    )}
                                </span>
                            `
                    }

                </div>


                <div class="dados-principais-empresa">

                    <span class="rotulo-empresa">
                        Perfil corporativo
                    </span>

                    <h1>
                        ${escaparHtmlEmpresa(
                            empresaPaginaPerfil.nome
                        )}
                    </h1>

                    <div class="metadados-empresa">

                        <span>
                            ${escaparHtmlEmpresa(
                                empresaPaginaPerfil.setor ||
                                "Setor não informado"
                            )}
                        </span>

                        <span>
                            ${escaparHtmlEmpresa(
                                empresaPaginaPerfil.porte ||
                                "Porte não informado"
                            )}
                        </span>

                        <span>
                            ${
                                empresaPaginaPerfil.trabalhoRemoto
                                    ? "100% remoto"
                                    : escaparHtmlEmpresa(
                                        empresaPaginaPerfil.localizacao ||
                                        "Localização não informada"
                                    )
                            }
                        </span>

                    </div>

                </div>


                <div class="acoes-perfil-empresa">

                    <a
                        href="#vagas-abertas-empresa"
                        class="botao-empresa-secundario"
                    >
                        Ver vagas abertas
                    </a>

                    <button
                        id="botao-editar-perfil-empresa"
                        class="botao-empresa-principal"
                        type="button"
                    >
                        Editar perfil
                    </button>

                </div>

            </div>

        </section>


        <div class="grade-perfil-empresa">

            <div class="coluna-principal-empresa">

                <section class="cartao-empresa">

                    <div class="cabecalho-cartao-empresa">

                        <div>

                            <span class="rotulo-empresa">
                                Apresentação e cultura
                            </span>

                            <h2>
                                Sobre a empresa
                            </h2>

                        </div>

                    </div>

                    <p class="texto-apresentacao-empresa">
                        ${
                            empresaPaginaPerfil.descricao
                                ? escaparHtmlEmpresa(
                                    empresaPaginaPerfil.descricao
                                )
                                : (
                                    "Sua empresa ainda não adicionou uma apresentação. " +
                                    "Conte sua história, missão, valores e como é fazer parte da equipe."
                                )
                        }
                    </p>

                </section>


                <section class="cartao-empresa">

                    <div class="cabecalho-cartao-empresa">

                        <div>

                            <span class="rotulo-empresa">
                                Tecnologia
                            </span>

                            <h2>
                                Stack tecnológico
                            </h2>

                        </div>

                    </div>

                    <div class="lista-tags-empresa">

                        ${renderizarTagsEmpresa(
                            empresaPaginaPerfil.stackTecnologico,
                            "Nenhuma tecnologia informada."
                        )}

                    </div>

                </section>


                <section class="cartao-empresa">

                    <div class="cabecalho-cartao-empresa">

                        <div>

                            <span class="rotulo-empresa">
                                Atrativos
                            </span>

                            <h2>
                                Benefícios oferecidos
                            </h2>

                        </div>

                    </div>

                    <div class="lista-tags-empresa">

                        ${renderizarTagsEmpresa(
                            empresaPaginaPerfil.beneficios,
                            "Nenhum benefício informado."
                        )}

                    </div>

                </section>


                <section
                    id="vagas-abertas-empresa"
                    class="cartao-empresa"
                >

                    <div class="cabecalho-cartao-empresa">

                        <div>

                            <span class="rotulo-empresa">
                                Oportunidades
                            </span>

                            <h2>
                                Vagas abertas
                            </h2>

                        </div>

                        <span class="contador-vagas-empresa">
                            ${vagasAtivas.length}
                            ${
                                vagasAtivas.length === 1
                                    ? "vaga"
                                    : "vagas"
                            }
                        </span>

                    </div>

                    <div class="lista-vagas-perfil-empresa">

                        ${renderizarVagasAtivasEmpresa(
                            vagasAtivas
                        )}

                    </div>

                </section>

            </div>


            <aside class="coluna-lateral-empresa">

                <section class="cartao-empresa">

                    <div class="cabecalho-cartao-empresa">

                        <div>

                            <span class="rotulo-empresa">
                                Presença digital
                            </span>

                            <h2>
                                Canais oficiais
                            </h2>

                        </div>

                    </div>

                    <div class="lista-links-empresa">

                        ${renderizarLinkEmpresa(
                            "Site oficial",
                            empresaPaginaPerfil.site
                        )}

                        ${renderizarLinkEmpresa(
                            "LinkedIn",
                            empresaPaginaPerfil.linkedin
                        )}

                    </div>

                </section>


                <section class="cartao-empresa cartao-administrativo-empresa">

                    <div class="cabecalho-cartao-empresa">

                        <div>

                            <span class="rotulo-empresa">
                                Área administrativa
                            </span>

                            <h2>
                                Dados legais
                            </h2>

                        </div>

                        <span class="tag-privado-empresa">
                            Privado
                        </span>

                    </div>

                    <p class="aviso-privacidade-empresa">
                        Estes dados são exibidos apenas para
                        a própria conta da empresa.
                    </p>

                    <div class="lista-dados-legais">

                        <div>

                            <span>
                                Razão Social
                            </span>

                            <strong>
                                ${escaparHtmlEmpresa(
                                    empresaPaginaPerfil.razaoSocial ||
                                    "Não informada"
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                CNPJ
                            </span>

                            <strong>
                                ${formatarCnpjEmpresa(
                                    empresaPaginaPerfil.cnpj
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                <section class="cartao-empresa cartao-status-empresa">

                    <span class="rotulo-empresa">
                        Perfil
                    </span>

                    <h2>
                        Presença no Market Skills
                    </h2>

                    <div class="indicador-status-empresa">

                        <span></span>

                        Perfil empresarial ativo

                    </div>

                    <p>
                        Mantenha as informações institucionais
                        atualizadas para fortalecer a apresentação
                        da empresa aos profissionais.
                    </p>

                </section>

            </aside>

        </div>


        ${criarModalPerfilEmpresa()}
    `;

    registrarEventosPerfilEmpresa();
}


function criarModalPerfilEmpresa() {
    return `
        <dialog
            id="modal-perfil-empresa"
            class="modal-perfil-empresa"
        >

            <form
                id="formulario-perfil-empresa"
                class="formulario-perfil-empresa"
            >

                <div class="cabecalho-modal-empresa">

                    <div>

                        <span class="rotulo-empresa">
                            Perfil corporativo
                        </span>

                        <h2>
                            Editar perfil da empresa
                        </h2>

                    </div>

                    <button
                        id="botao-fechar-perfil-empresa"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <section class="secao-formulario-empresa">

                    <span class="numero-secao-empresa">
                        01
                    </span>

                    <h3>
                        Identidade da empresa
                    </h3>

                    <div class="grade-formulario-empresa">

                        <label class="campo-empresa">

                            <span>
                                Nome Fantasia
                            </span>

                            <input
                                id="empresa-nome"
                                type="text"
                                maxlength="150"
                                required
                            >

                        </label>


                        <label class="campo-empresa">

                            <span>
                                Setor de atuação
                            </span>

                            <input
                                id="empresa-setor"
                                type="text"
                                maxlength="120"
                                placeholder="Ex.: Tecnologia"
                            >

                        </label>


                        <label class="campo-empresa">

                            <span>
                                Porte da equipe
                            </span>

                            <select id="empresa-porte">

                                <option value="">
                                    Não informado
                                </option>

                                <option value="1 a 10 pessoas">
                                    1 a 10 pessoas
                                </option>

                                <option value="11 a 50 pessoas">
                                    11 a 50 pessoas
                                </option>

                                <option value="51 a 200 pessoas">
                                    51 a 200 pessoas
                                </option>

                                <option value="201 a 500 pessoas">
                                    201 a 500 pessoas
                                </option>

                                <option value="Mais de 500 pessoas">
                                    Mais de 500 pessoas
                                </option>

                            </select>

                        </label>


                        <label class="campo-empresa">

                            <span>
                                Localização principal
                            </span>

                            <input
                                id="empresa-localizacao"
                                type="text"
                                maxlength="150"
                                placeholder="Ex.: Belo Horizonte - MG"
                            >

                        </label>


                        <label class="campo-checkbox-empresa campo-largo-empresa">

                            <input
                                id="empresa-remoto"
                                type="checkbox"
                            >

                            <div>

                                <strong>
                                    Empresa 100% remota
                                </strong>

                                <span>
                                    Use esta opção quando a equipe não possuir
                                    uma localização principal de trabalho.
                                </span>

                            </div>

                        </label>


                        <label class="campo-empresa campo-largo-empresa">

                            <span>
                                Logo da empresa
                            </span>

                            <input
                                id="empresa-logo-arquivo"
                                type="file"
                                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                            >

                            <small>
                                PNG ou JPEG de até 3 MB.
                            </small>

                        </label>


                        <label class="campo-empresa campo-largo-empresa">

                            <span>
                                Imagem de capa
                            </span>

                            <input
                                id="empresa-banner-arquivo"
                                type="file"
                                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                            >

                            <small>
                                PNG ou JPEG de até 5 MB.
                            </small>

                        </label>

                    </div>

                </section>


                <section class="secao-formulario-empresa">

                    <span class="numero-secao-empresa">
                        02
                    </span>

                    <h3>
                        Apresentação e cultura
                    </h3>

                    <label class="campo-empresa">

                        <span>
                            História, missão, valores e cultura
                        </span>

                        <textarea
                            id="empresa-descricao"
                            rows="7"
                            placeholder="Apresente a empresa, sua história, propósito, valores e como é fazer parte da equipe."
                        ></textarea>

                    </label>

                </section>


                <section class="secao-formulario-empresa">

                    <span class="numero-secao-empresa">
                        03
                    </span>

                    <h3>
                        Presença digital
                    </h3>

                    <div class="grade-formulario-empresa">

                        <label class="campo-empresa">

                            <span>
                                Site oficial
                            </span>

                            <input
                                id="empresa-site"
                                type="text"
                                maxlength="255"
                                placeholder="https://..."
                            >

                        </label>


                        <label class="campo-empresa">

                            <span>
                                LinkedIn corporativo
                            </span>

                            <input
                                id="empresa-linkedin"
                                type="text"
                                maxlength="255"
                                placeholder="https://linkedin.com/company/..."
                            >

                        </label>

                    </div>

                </section>


                <section class="secao-formulario-empresa">

                    <span class="numero-secao-empresa">
                        04
                    </span>

                    <h3>
                        Tecnologia e benefícios
                    </h3>

                    <label class="campo-empresa">

                        <span>
                            Stack tecnológico
                        </span>

                        <textarea
                            id="empresa-stack"
                            rows="4"
                            placeholder="Ex.: Python, Flask, JavaScript, MySQL, Docker"
                        ></textarea>

                        <small>
                            Separe os itens por vírgula.
                        </small>

                    </label>


                    <label class="campo-empresa">

                        <span>
                            Benefícios oferecidos
                        </span>

                        <textarea
                            id="empresa-beneficios"
                            rows="4"
                            placeholder="Ex.: Plano de saúde, vale-alimentação, horário flexível"
                        ></textarea>

                        <small>
                            Separe os benefícios por vírgula.
                        </small>

                    </label>

                </section>


                <section class="secao-formulario-empresa secao-administrativa-formulario">

                    <div class="cabecalho-secao-administrativa">

                        <div>

                            <span class="numero-secao-empresa">
                                05
                            </span>

                            <h3>
                                Dados administrativos
                            </h3>

                        </div>

                        <span class="tag-privado-empresa">
                            Privado
                        </span>

                    </div>

                    <p>
                        Estes dados não fazem parte da vitrine
                        pública da empresa.
                    </p>

                    <div class="grade-formulario-empresa">

                        <label class="campo-empresa">

                            <span>
                                Razão Social
                            </span>

                            <input
                                id="empresa-razao-social"
                                type="text"
                                maxlength="180"
                            >

                        </label>


                        <label class="campo-empresa">

                            <span>
                                CNPJ
                            </span>

                            <input
                                id="empresa-cnpj"
                                type="text"
                                maxlength="18"
                                placeholder="00.000.000/0000-00"
                            >

                        </label>

                    </div>

                </section>


                <div
                    id="mensagem-formulario-empresa"
                    class="mensagem-formulario-empresa"
                ></div>


                <div class="acoes-modal-empresa">

                    <button
                        id="botao-cancelar-perfil-empresa"
                        class="botao-empresa-secundario"
                        type="button"
                    >
                        Cancelar
                    </button>

                    <button
                        id="botao-salvar-perfil-empresa"
                        class="botao-empresa-principal"
                        type="submit"
                    >
                        Salvar alterações
                    </button>

                </div>

            </form>

        </dialog>


        <div
            id="mensagem-perfil-empresa"
            class="mensagem-perfil-empresa"
        ></div>
    `;
}


function registrarEventosPerfilEmpresa() {
    document.getElementById(
        "botao-editar-perfil-empresa"
    ).addEventListener(
        "click",
        abrirModalPerfilEmpresa
    );

    document.getElementById(
        "botao-fechar-perfil-empresa"
    ).addEventListener(
        "click",
        fecharModalPerfilEmpresa
    );

    document.getElementById(
        "botao-cancelar-perfil-empresa"
    ).addEventListener(
        "click",
        fecharModalPerfilEmpresa
    );

    document.getElementById(
        "formulario-perfil-empresa"
    ).addEventListener(
        "submit",
        salvarPerfilEmpresa
    );

    document.getElementById(
        "empresa-remoto"
    ).addEventListener(
        "change",
        atualizarLocalizacaoEmpresa
    );

    document.getElementById(
        "empresa-cnpj"
    ).addEventListener(
        "input",
        evento => {
            evento.target.value =
                formatarCnpjDigitado(
                    evento.target.value
                );
        }
    );
}


function abrirModalPerfilEmpresa() {
    document.getElementById(
        "formulario-perfil-empresa"
    ).reset();

    document.getElementById(
        "empresa-nome"
    ).value =
        empresaPaginaPerfil.nome || "";

    document.getElementById(
        "empresa-setor"
    ).value =
        empresaPaginaPerfil.setor || "";

    document.getElementById(
        "empresa-porte"
    ).value =
        empresaPaginaPerfil.porte || "";

    document.getElementById(
        "empresa-localizacao"
    ).value =
        empresaPaginaPerfil.localizacao || "";

    document.getElementById(
        "empresa-remoto"
    ).checked =
        Boolean(
            empresaPaginaPerfil.trabalhoRemoto
        );

    document.getElementById(
        "empresa-descricao"
    ).value =
        empresaPaginaPerfil.descricao || "";

    document.getElementById(
        "empresa-site"
    ).value =
        empresaPaginaPerfil.site || "";

    document.getElementById(
        "empresa-linkedin"
    ).value =
        empresaPaginaPerfil.linkedin || "";

    document.getElementById(
        "empresa-stack"
    ).value =
        empresaPaginaPerfil.stackTecnologico || "";

    document.getElementById(
        "empresa-beneficios"
    ).value =
        empresaPaginaPerfil.beneficios || "";

    document.getElementById(
        "empresa-razao-social"
    ).value =
        empresaPaginaPerfil.razaoSocial || "";

    document.getElementById(
        "empresa-cnpj"
    ).value =
        formatarCnpjEmpresa(
            empresaPaginaPerfil.cnpj,
            ""
        );

    limparMensagemFormularioEmpresa();

    atualizarLocalizacaoEmpresa();

    document.getElementById(
        "modal-perfil-empresa"
    ).showModal();
}


function fecharModalPerfilEmpresa() {
    const modal =
        document.getElementById(
            "modal-perfil-empresa"
        );

    if (modal.open) {
        modal.close();
    }
}


function atualizarLocalizacaoEmpresa() {
    const remoto =
        document.getElementById(
            "empresa-remoto"
        ).checked;

    const localizacao =
        document.getElementById(
            "empresa-localizacao"
        );

    localizacao.disabled = remoto;

    if (remoto) {
        localizacao.value = "";
    }
}


async function salvarPerfilEmpresa(
    evento
) {
    evento.preventDefault();

    limparMensagemFormularioEmpresa();

    const arquivoLogo =
        document.getElementById(
            "empresa-logo-arquivo"
        ).files[0] || null;

    const arquivoBanner =
        document.getElementById(
            "empresa-banner-arquivo"
        ).files[0] || null;

    try {
        validarImagemEmpresa(
            arquivoLogo,
            3,
            "A logo"
        );

        validarImagemEmpresa(
            arquivoBanner,
            5,
            "O banner"
        );

        const dados = {
            nome:
                obterTextoEmpresa(
                    "empresa-nome"
                ),

            setor:
                obterTextoEmpresa(
                    "empresa-setor"
                ),

            porte:
                obterTextoEmpresa(
                    "empresa-porte"
                ),

            localizacao:
                document.getElementById(
                    "empresa-remoto"
                ).checked
                    ? ""
                    : obterTextoEmpresa(
                        "empresa-localizacao"
                    ),

            trabalhoRemoto:
                document.getElementById(
                    "empresa-remoto"
                ).checked,

            descricao:
                obterTextoEmpresa(
                    "empresa-descricao"
                ),

            site:
                obterTextoEmpresa(
                    "empresa-site"
                ),

            linkedin:
                obterTextoEmpresa(
                    "empresa-linkedin"
                ),

            stackTecnologico:
                obterTextoEmpresa(
                    "empresa-stack"
                ),

            beneficios:
                obterTextoEmpresa(
                    "empresa-beneficios"
                ),

            razaoSocial:
                obterTextoEmpresa(
                    "empresa-razao-social"
                ),

            cnpj:
                obterTextoEmpresa(
                    "empresa-cnpj"
                ),
        };

        const botao =
            document.getElementById(
                "botao-salvar-perfil-empresa"
            );

        botao.disabled = true;
        botao.textContent =
            "Salvando...";

        try {
            await apiRequest(
                `/empresas/${empresaPaginaPerfil.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        dados
                    ),
                }
            );

            if (arquivoLogo) {
                const formularioLogo =
                    new FormData();

                formularioLogo.append(
                    "logo",
                    arquivoLogo
                );

                await apiRequest(
                    `/empresas/${empresaPaginaPerfil.id}/logo`,
                    {
                        method: "POST",
                        body: formularioLogo,
                    }
                );
            }

            if (arquivoBanner) {
                const formularioBanner =
                    new FormData();

                formularioBanner.append(
                    "banner",
                    arquivoBanner
                );

                await apiRequest(
                    `/empresas/${empresaPaginaPerfil.id}/banner`,
                    {
                        method: "POST",
                        body: formularioBanner,
                    }
                );
            }

            empresaPaginaPerfil =
                await apiRequest(
                    `/empresas/${empresaPaginaPerfil.id}`
                );

            fecharModalPerfilEmpresa();

            renderizarPerfilEmpresa();

            mostrarMensagemPerfilEmpresa(
                "Perfil empresarial atualizado com sucesso.",
                "sucesso"
            );

        } finally {
            const botaoAtual =
                document.getElementById(
                    "botao-salvar-perfil-empresa"
                );

            if (botaoAtual) {
                botaoAtual.disabled =
                    false;

                botaoAtual.textContent =
                    "Salvar alterações";
            }
        }

    } catch (erro) {
        mostrarMensagemFormularioEmpresa(
            erro.message ||
            "Não foi possível atualizar o perfil."
        );
    }
}


function validarImagemEmpresa(
    arquivo,
    limiteMb,
    nomeCampo
) {
    if (!arquivo) {
        return;
    }

    const nome =
        arquivo.name.toLowerCase();

    const extensaoValida =
        nome.endsWith(".png") ||
        nome.endsWith(".jpg") ||
        nome.endsWith(".jpeg");

    const tipoValido =
        arquivo.type === "image/png" ||
        arquivo.type === "image/jpeg";

    if (
        !extensaoValida ||
        !tipoValido
    ) {
        throw new Error(
            `${nomeCampo} deve estar no formato PNG ou JPEG.`
        );
    }

    if (
        arquivo.size >
        limiteMb * 1024 * 1024
    ) {
        throw new Error(
            `${nomeCampo} deve possuir no máximo ${limiteMb} MB.`
        );
    }
}


function renderizarTagsEmpresa(
    valor,
    mensagemVazia
) {
    const itens =
        separarItensEmpresa(
            valor
        );

    if (!itens.length) {
        return `
            <div class="estado-vazio-empresa">
                ${escaparHtmlEmpresa(
                    mensagemVazia
                )}
            </div>
        `;
    }

    return itens
        .map(
            item => `
                <span class="tag-conteudo-empresa">
                    ${escaparHtmlEmpresa(
                        item
                    )}
                </span>
            `
        )
        .join("");
}


function separarItensEmpresa(valor) {
    if (!valor) {
        return [];
    }

    return String(valor)
        .split(
            /[,;\n]+/
        )
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);
}


function renderizarVagasAtivasEmpresa(
    vagas
) {
    if (!vagas.length) {
        return `
            <div class="estado-vazio-empresa">
                A empresa não possui vagas abertas no momento.
            </div>
        `;
    }

    return vagas
        .map(
            vaga => `
                <article class="vaga-perfil-empresa">

                    <div>

                        <span class="status-vaga-empresa">
                            Ativa
                        </span>

                        <h3>
                            ${escaparHtmlEmpresa(
                                vaga.titulo
                            )}
                        </h3>

                        <div class="metadados-vaga-empresa">

                            <span>
                                ${formatarExperienciaEmpresa(
                                    vaga.nivelExperiencia
                                )}
                            </span>

                            <span>
                                ${formatarModalidadeEmpresa(
                                    vaga.modalidade
                                )}
                            </span>

                            <span>
                                ${escaparHtmlEmpresa(
                                    vaga.localizacao ||
                                    "Localização não informada"
                                )}
                            </span>

                        </div>

                    </div>

                    <a
                        href="./vagas.html"
                        class="link-vaga-empresa"
                    >
                        Ver oportunidade
                    </a>

                </article>
            `
        )
        .join("");
}


function renderizarLinkEmpresa(
    rotulo,
    valor
) {
    if (!valor) {
        return `
            <div class="item-link-empresa indisponivel">

                <span>
                    ${rotulo}
                </span>

                <strong>
                    Não informado
                </strong>

            </div>
        `;
    }

    const url =
        normalizarUrlEmpresa(
            valor
        );

    return `
        <a
            class="item-link-empresa"
            href="${escaparHtmlEmpresa(
                url
            )}"
            target="_blank"
            rel="noopener noreferrer"
        >

            <span>
                ${rotulo}
            </span>

            <strong>
                Acessar
            </strong>

        </a>
    `;
}


function obterUrlImagemEmpresa(
    caminho
) {
    if (
        caminho.startsWith("http://") ||
        caminho.startsWith("https://")
    ) {
        return (
            `${caminho}${
                caminho.includes("?")
                    ? "&"
                    : "?"
            }v=${Date.now()}`
        );
    }

    const origemBackend =
        API_BASE_URL.replace(
            /\/api$/,
            ""
        );

    return (
        `${origemBackend}${caminho}` +
        `?v=${Date.now()}`
    );
}


function obterTextoEmpresa(id) {
    return document
        .getElementById(id)
        .value
        .trim();
}


function obterInicialEmpresa(nome) {
    const texto =
        String(
            nome || "E"
        ).trim();

    return (
        texto.charAt(0)
            .toUpperCase() ||
        "E"
    );
}


function normalizarUrlEmpresa(valor) {
    const url =
        String(
            valor || ""
        ).trim();

    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `https://${url}`;
}


function formatarCnpjEmpresa(
    valor,
    vazio = "Não informado"
) {
    const numeros =
        String(
            valor || ""
        ).replace(
            /\D/g,
            ""
        );

    if (numeros.length !== 14) {
        return vazio;
    }

    return (
        `${numeros.slice(0, 2)}.` +
        `${numeros.slice(2, 5)}.` +
        `${numeros.slice(5, 8)}/` +
        `${numeros.slice(8, 12)}-` +
        `${numeros.slice(12, 14)}`
    );
}


function formatarCnpjDigitado(
    valor
) {
    const numeros =
        String(valor)
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                14
            );

    let resultado = numeros;

    if (numeros.length > 2) {
        resultado =
            `${numeros.slice(0, 2)}.` +
            numeros.slice(2);
    }

    if (numeros.length > 5) {
        resultado =
            `${numeros.slice(0, 2)}.` +
            `${numeros.slice(2, 5)}.` +
            numeros.slice(5);
    }

    if (numeros.length > 8) {
        resultado =
            `${numeros.slice(0, 2)}.` +
            `${numeros.slice(2, 5)}.` +
            `${numeros.slice(5, 8)}/` +
            numeros.slice(8);
    }

    if (numeros.length > 12) {
        resultado =
            `${numeros.slice(0, 2)}.` +
            `${numeros.slice(2, 5)}.` +
            `${numeros.slice(5, 8)}/` +
            `${numeros.slice(8, 12)}-` +
            numeros.slice(12);
    }

    return resultado;
}


function formatarModalidadeEmpresa(
    valor
) {
    const valores = {
        presencial: "Presencial",
        hibrido: "Híbrido",
        remoto: "Remoto",
    };

    return (
        valores[valor] ||
        "Não informada"
    );
}


function formatarExperienciaEmpresa(
    valor
) {
    const valores = {
        iniciante: "Iniciante",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
    };

    return (
        valores[valor] ||
        "Não informado"
    );
}


function escaparHtmlEmpresa(valor) {
    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function mostrarMensagemFormularioEmpresa(
    mensagem
) {
    const elemento =
        document.getElementById(
            "mensagem-formulario-empresa"
        );

    elemento.textContent =
        mensagem;

    elemento.className =
        "mensagem-formulario-empresa erro";
}


function limparMensagemFormularioEmpresa() {
    const elemento =
        document.getElementById(
            "mensagem-formulario-empresa"
        );

    elemento.textContent =
        "";

    elemento.className =
        "mensagem-formulario-empresa";
}


function mostrarMensagemPerfilEmpresa(
    mensagem,
    tipo
) {
    const elemento =
        document.getElementById(
            "mensagem-perfil-empresa"
        );

    clearTimeout(
        temporizadorMensagemEmpresa
    );

    elemento.textContent =
        mensagem;

    elemento.className =
        `mensagem-perfil-empresa ${tipo} visivel`;

    temporizadorMensagemEmpresa =
        setTimeout(
            () => {
                elemento.className =
                    "mensagem-perfil-empresa";
            },
            3500
        );
}