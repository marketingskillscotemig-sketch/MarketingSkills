const API_BASE_URL = "http://127.0.0.1:5000/api";


async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
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

    if (!response.ok) {
        const message =
            data?.erro ||
            `Erro na requisição: ${response.status}`;

        throw new Error(message);
    }

    return data;
}