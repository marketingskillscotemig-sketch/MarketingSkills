// Animações ao rolar a página inicial.
//
// As seções aparecem suavemente quando entram na tela.
// Se o JavaScript falhar ou o navegador não suportar
// IntersectionObserver, nada é escondido: o conteúdo
// continua visível normalmente.

(function () {
    const SELETORES_SECOES = [
        ".secao-como-funciona",
        ".secao-proposta",
        ".secao-chamada",
    ];

    const reduzirMovimento =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (
        reduzirMovimento ||
        !("IntersectionObserver" in window)
    ) {
        return;
    }

    const secoes = document.querySelectorAll(
        SELETORES_SECOES.join(",")
    );

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visivel");
                    observador.unobserve(entrada.target);
                }
            });
        },
        {
            threshold: 0.15,
        }
    );

    secoes.forEach((secao) => {
        secao.classList.add("revelar");
        observador.observe(secao);
    });
})();
