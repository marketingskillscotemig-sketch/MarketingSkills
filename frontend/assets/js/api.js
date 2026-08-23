const API_BASE_URL =
    "http://127.0.0.1:5000/api";


let tokenCsrf = null;


const METODOS_COM_CSRF =
    new Set([
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
    ]);


async function obterTokenCsrf() {
    if (tokenCsrf) {
        return tokenCsrf;
    }

    const response = await fetch(
        `${API_BASE_URL}/autenticacao/csrf`,
        {
            method: "GET",

            credentials: "include",

            headers: {
                "Accept":
                    "application/json",
            },
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (
        !response.ok ||
        !data?.csrfToken
    ) {
        throw new Error(
            "Não foi possível iniciar "
            + "a proteção da requisição."
        );
    }

    tokenCsrf = data.csrfToken;

    return tokenCsrf;
}


async function apiRequest(
    endpoint,
    options = {}
) {
    const metodo = (
        options.method || "GET"
    ).toUpperCase();

    const headers = new Headers(
        options.headers || {}
    );

    headers.set(
        "Accept",
        "application/json"
    );

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    if (
        METODOS_COM_CSRF.has(
            metodo
        )
    ) {
        const csrfToken =
            await obterTokenCsrf();

        headers.set(
            "X-CSRFToken",
            csrfToken
        );
    }

    const config = {
        ...options,

        method: metodo,

        credentials: "include",

        headers,
    };

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        config
    );

    if (response.status === 204) {
        return null;
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (data?.csrfToken) {
        tokenCsrf =
            data.csrfToken;
    }

    if (!response.ok) {
        if (
            data?.codigo ===
            "csrf_invalido"
        ) {
            tokenCsrf = null;
        }

        const message =
            data?.erro ||
            `Erro na requisição: ${
                response.status
            }`;

        throw new Error(message);
    }

    if (
        endpoint ===
        "/autenticacao/logout"
    ) {
        tokenCsrf = null;
    }

    return data;
}