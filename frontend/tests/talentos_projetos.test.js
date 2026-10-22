// Testes dos projetos exibidos na tela de Talentos.
// Usa só módulos nativos do Node (sem dependências):
//
//     node --test frontend/tests/talentos_projetos.test.js
//
// As funções testadas são lidas do próprio talentos.js.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const ARQUIVO = path.join(__dirname, "..", "assets", "js", "talentos.js");
const FONTE = fs.readFileSync(ARQUIVO, "utf8");

function extrairFuncao(nome) {
    const inicio = FONTE.indexOf(`function ${nome}(`);
    assert.notEqual(inicio, -1, `função ${nome} não encontrada`);

    let profundidade = 0;
    for (let i = FONTE.indexOf("{", inicio); i < FONTE.length; i++) {
        if (FONTE[i] === "{") {
            profundidade++;
        } else if (FONTE[i] === "}") {
            profundidade--;
            if (profundidade === 0) {
                return FONTE.slice(inicio, i + 1);
            }
        }
    }
    throw new Error(`fim da função ${nome} não encontrado`);
}

const contexto = { URL };
vm.createContext(contexto);
vm.runInContext(
    [
        "renderizarProjetosTalento",
        "obterLinkSeguroTalentos",
        "escaparHtmlTalentos",
    ].map(extrairFuncao).join("\n"),
    contexto
);

function renderizar(projeto) {
    return contexto.renderizarProjetosTalento([
        { nome: "Projeto", tecnologias: null, descricao: null, link: null, ...projeto },
    ]);
}

function links(html) {
    return html.match(/<a\b[^>]*>/g) || [];
}


test("link http e https vira link seguro em nova aba", () => {
    for (const url of ["https://github.com/ana/app", "http://exemplo.com/demo"]) {
        const html = renderizar({ link: url });
        const tags = links(html);

        assert.equal(tags.length, 1);
        assert.match(tags[0], /href="[^"]+"/);
        assert.ok(tags[0].includes(`href="${url}"`));
        assert.ok(tags[0].includes('target="_blank"'));
        assert.ok(tags[0].includes('rel="noopener noreferrer"'));
        assert.ok(html.includes(">Abrir projeto</a>"));
    }
});


test("link com caracteres especiais é escapado no atributo", () => {
    const html = renderizar({ link: 'https://exemplo.com/?q="x"&a=<b>' });
    const tag = links(html)[0];

    assert.ok(!tag.includes('"x"'));
    assert.ok(!tag.includes("<b>"));
    assert.ok(tag.includes("&amp;"));
});


test("projeto sem link continua sendo exibido, sem <a>", () => {
    for (const link of [null, undefined, "", "   "]) {
        const html = renderizar({ nome: "Sem link", descricao: "Descrição", link });

        assert.equal(links(html).length, 0);
        assert.ok(html.includes("<strong>Sem link</strong>"));
        assert.ok(html.includes("<p>Descrição</p>"));
    }
});


test("protocolos inválidos não geram link", () => {
    const invalidos = [
        "javascript:alert(1)",
        "JavaScript:alert(1)",
        " javascript:alert(1)",
        "java\tscript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "vbscript:msgbox(1)",
        "file:///etc/passwd",
        "ftp://exemplo.com",
        "//exemplo.com/sem-protocolo",
        "/caminho/relativo",
        "exemplo.com",
        "https://",
        12345,
    ];

    for (const link of invalidos) {
        const html = renderizar({ link });
        assert.equal(links(html).length, 0, `gerou link para ${link}`);
        assert.ok(!/javascript:|vbscript:|data:/i.test(html), `protocolo apareceu no HTML: ${link}`);
    }
});


test("nome, tecnologias e descrição continuam escapados", () => {
    const ataque = '"><img src=x onerror=alert(1)><script>alert(1)</script>';
    const html = renderizar({ nome: ataque, tecnologias: ataque, descricao: ataque, link: "https://ok.com" });

    assert.ok(!html.includes("<img"));
    assert.ok(!html.includes("<script"));
    // Nenhuma tag real do HTML gerado pode ter atributo de evento.
    const tags = html.match(/<[a-z][^>]*>/gi) || [];
    assert.ok(tags.every((tag) => !/\son[a-z]+=/i.test(tag)));
    assert.equal(links(html).length, 1);
});


test("lista vazia mantém a mensagem original", () => {
    assert.equal(contexto.renderizarProjetosTalento([]), "<p>Nenhum projeto cadastrado.</p>");
});
