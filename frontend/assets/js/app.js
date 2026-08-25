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


document.addEventListener(
    "DOMContentLoaded",
    verificarConexaoMarketSkills
);