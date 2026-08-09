function formatarNumero(valor) {
    return new Intl.NumberFormat(
        "pt-BR"
    ).format(valor);
}


function formatarMoeda(valor) {
    if (
        valor === null ||
        valor === undefined ||
        Number.isNaN(Number(valor))
    ) {
        return "Não informado";
    }

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
        }
    ).format(Number(valor));
}


function obterNomeEmpresa(
    empresaId,
    empresas
) {
    const empresa = empresas.find(
        item => item.id === empresaId
    );

    return empresa
        ? empresa.nome
        : "Empresa não identificada";
}


function obterSalarioVaga(vaga) {
    const minimo = vaga.salarioMinimo;
    const maximo = vaga.salarioMaximo;

    if (
        minimo !== null &&
        maximo !== null
    ) {
        return `${formatarMoeda(minimo)} - ${formatarMoeda(maximo)}`;
    }

    if (minimo !== null) {
        return `A partir de ${formatarMoeda(minimo)}`;
    }

    if (maximo !== null) {
        return `Até ${formatarMoeda(maximo)}`;
    }

    return "Salário não informado";
}


function renderizarTecnologias(tendencias) {
    const conteiner =
        document.getElementById(
            "lista-tecnologias"
        );

    if (!tendencias.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma tendência cadastrada ainda.
            </div>
        `;

        return;
    }

    const agrupadas = new Map();

    tendencias.forEach(tendencia => {
        const tecnologia =
            tendencia.tecnologia?.trim();

        if (!tecnologia) {
            return;
        }

        const chave =
            tecnologia.toLowerCase();

        const demanda =
            Number(tendencia.demanda) || 0;

        const existente =
            agrupadas.get(chave);

        if (
            !existente ||
            demanda > existente.demanda
        ) {
            agrupadas.set(
                chave,
                {
                    tecnologia,
                    demanda,
                }
            );
        }
    });

    const tecnologias = [
        ...agrupadas.values()
    ]
        .sort(
            (a, b) =>
                b.demanda -
                a.demanda
        )
        .slice(0, 5);

    if (!tecnologias.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma tecnologia disponível.
            </div>
        `;

        return;
    }

    const maiorDemanda =
        Math.max(
            ...tecnologias.map(
                item => item.demanda
            ),
            1
        );

    conteiner.innerHTML =
        tecnologias
            .map(item => {
                const largura =
                    (
                        item.demanda /
                        maiorDemanda
                    ) * 100;

                return `
                    <div class="linha-tecnologia">

                        <span class="nome-tecnologia">
                            ${item.tecnologia}
                        </span>

                        <div class="barra-tecnologia">
                            <span
                                style="width: ${largura}%"
                            ></span>
                        </div>

                        <span class="demanda-tecnologia">
                            ${formatarNumero(
                                item.demanda
                            )}
                        </span>

                    </div>
                `;
            })
            .join("");
}


function renderizarVagas(
    vagas,
    empresas
) {
    const conteiner =
        document.getElementById(
            "vagas-recentes"
        );

    const recentes = vagas
        .filter(
            vaga =>
                vaga.status === "ativa"
        )
        .sort(
            (a, b) =>
                new Date(
                    b.dataPublicacao
                ) -
                new Date(
                    a.dataPublicacao
                )
        )
        .slice(0, 4);

    if (!recentes.length) {
        conteiner.innerHTML = `
            <div class="estado-vazio">
                Nenhuma vaga ativa cadastrada.
            </div>
        `;

        return;
    }

    conteiner.innerHTML =
        recentes
            .map(vaga => {
                const empresa =
                    obterNomeEmpresa(
                        vaga.empresaId,
                        empresas
                    );

                return `
                    <div class="item-vaga">

                        <div class="icone-vaga">
                            &lt;/&gt;
                        </div>

                        <div class="informacoes-vaga">

                            <strong>
                                ${vaga.titulo}
                            </strong>

                            <span>
                                ${empresa}
                                ·
                                ${
                                    vaga.modalidade ||
                                    "Modalidade não informada"
                                }
                            </span>

                        </div>

                        <div class="salario-vaga">
                            ${obterSalarioVaga(vaga)}
                        </div>

                    </div>
                `;
            })
            .join("");
}


function atualizarMediaSalarial(
    tendencias
) {
    const elemento =
        document.getElementById(
            "media-salarial"
        );

    const salarios = tendencias
        .map(
            item =>
                Number(
                    item.mediaSalarial
                )
        )
        .filter(
            valor =>
                Number.isFinite(valor) &&
                valor >= 0
        );

    if (!salarios.length) {
        elemento.textContent =
            "Sem dados";

        return;
    }

    const total =
        salarios.reduce(
            (soma, valor) =>
                soma + valor,
            0
        );

    const media =
        total / salarios.length;

    elemento.textContent =
        formatarMoeda(media);
}


async function carregarPainelMercado() {
    const conteinerStatus =
        document.querySelector(
            ".status-dados"
        );

    const textoStatus =
        document.getElementById(
            "status-api"
        );

    try {
        await apiRequest("/health");

        const [
            vagas,
            habilidades,
            tendencias,
            empresas,
        ] = await Promise.all([
            apiRequest("/vagas"),
            apiRequest("/habilidades"),
            apiRequest(
                "/tendencias-mercado"
            ),
            apiRequest("/empresas"),
        ]);

        const vagasAtivas =
            vagas.filter(
                vaga =>
                    vaga.status ===
                    "ativa"
            );

        const tecnologiasUnicas =
            new Set(
                tendencias
                    .map(
                        item =>
                            item.tecnologia
                                ?.trim()
                                .toLowerCase()
                    )
                    .filter(Boolean)
            );

        document.getElementById(
            "metrica-vagas"
        ).textContent =
            formatarNumero(
                vagasAtivas.length
            );

        document.getElementById(
            "metrica-habilidades"
        ).textContent =
            formatarNumero(
                habilidades.length
            );

        document.getElementById(
            "metrica-tecnologias"
        ).textContent =
            formatarNumero(
                tecnologiasUnicas.size
            );

        renderizarTecnologias(
            tendencias
        );

        renderizarVagas(
            vagas,
            empresas
        );

        atualizarMediaSalarial(
            tendencias
        );

        textoStatus.textContent =
            "Dados atualizados pela API do Market Skills";

        conteinerStatus.classList.add(
            "conectado"
        );

        conteinerStatus.classList.remove(
            "desconectado"
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar os dados:",
            erro
        );

        textoStatus.textContent =
            "Não foi possível acessar os dados agora";

        conteinerStatus.classList.add(
            "desconectado"
        );

        conteinerStatus.classList.remove(
            "conectado"
        );

        document.getElementById(
            "metrica-vagas"
        ).textContent = "—";

        document.getElementById(
            "metrica-habilidades"
        ).textContent = "—";

        document.getElementById(
            "metrica-tecnologias"
        ).textContent = "—";

        document.getElementById(
            "media-salarial"
        ).textContent = "—";

        document.getElementById(
            "lista-tecnologias"
        ).innerHTML = `
            <div class="estado-vazio">
                Dados indisponíveis.
            </div>
        `;

        document.getElementById(
            "vagas-recentes"
        ).innerHTML = `
            <div class="estado-vazio">
                Dados indisponíveis.
            </div>
        `;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    carregarPainelMercado
);