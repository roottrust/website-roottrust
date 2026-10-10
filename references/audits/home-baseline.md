# Baseline de comparação da Home

Data: 10/10/2026. Tarefa: P1.2 de `PLAN.md`.

Original preservado: [Home.dc.html](../claude-design/Home.dc.html). Cópia: [Home.baseline.dc.html](../claude-design/Home.baseline.dc.html). A cópia compartilha as dependências relativas existentes; nenhuma árvore de assets foi duplicada.

Correção única: remover `href: s.href` e `aria: 'Abrir a página de ' + s.title` de `ETAPAS.map((e, i) => ...)`, onde `s` não existe. `SERVICOS.map((s, i) => ...)` permanece intacto. Nenhuma mudança visual/editorial adicional.

| Arquivo | SHA-256 | Bytes |
|---|---|---:|
| Original | `d91ae2f627599dbd1eff65258e23707498f34c513f6366b1de7dbcd2e498747f` | 85444 |
| Baseline | `c9abf810c3a55739c9c2c0c694327a73dddfd98cda851e94ec0c9ae4c124d77f` | 85391 |

Verificação estática: uma ocorrência exata substituída; original conferido byte a byte após escrita; `SERVICOS.map` preservado.

```diff
--- Home.dc.html
+++ Home.baseline.dc.html
@@ -894 +894 @@
-    const etapas = this.ETAPAS.map((e, i) => { const a = st.step === i; return { href: s.href, aria: 'Abrir a página de ' + s.title, bar: a ? (pinOn ? Math.max(0.04, st.comoFrac) : 1) : 0, n: e.n, title: e.title, desc: e.desc, cur: a ? 'step' : undefined, nColor: a ? 'var(--rt-folha)' : '#9DB3A8', tColor: a ? 'var(--rt-superficie)' : '#9DB3A8', arrow: a ? 'var(--rt-folha)' : 'transparent', onClick: () => this.pickStep(i) }; });
+    const etapas = this.ETAPAS.map((e, i) => { const a = st.step === i; return { bar: a ? (pinOn ? Math.max(0.04, st.comoFrac) : 1) : 0, n: e.n, title: e.title, desc: e.desc, cur: a ? 'step' : undefined, nColor: a ? 'var(--rt-folha)' : '#9DB3A8', tColor: a ? 'var(--rt-superficie)' : '#9DB3A8', arrow: a ? 'var(--rt-folha)' : 'transparent', onClick: () => this.pickStep(i) }; });
```

Execução em navegador em 10/10/2026: Chromium headless via Playwright previamente disponível no cache local, servidor HTTP efêmero em `127.0.0.1`, viewport 1440×1000. Página carregada até `networkidle`; H1 “Confiabilidade com profundidade.” presente; dez canvases montados; zero eventos `pageerror`, incluindo ausência do erro conhecido `Home.renderVals`. Browser e servidor encerrados após a verificação. Não houve instalação. Esta verificação confirma a execução inicial da baseline; não certifica acessibilidade, desempenho nem todos os estados. A aprovação humana da Home permanece necessária antes das páginas internas.



## Ambiente e comando de execução

- Node.js executou script de inspeção recebido pela entrada padrão: here-string PowerShell `@' … '@ | node -`; nenhum script de teste foi adicionado ao export.
- Módulo reutilizado sem instalação: `C:/Users/renat/AppData/Local/npm-cache/_npx/2c10347c988d3245/node_modules/playwright` (caminho específico desta máquina, não dependência da aplicação).
- Script: servidor `node:http` estático com raiz `references/claude-design`; `chromium.launch({ headless: true })`; `browser.newPage({ viewport: { width: 1440, height: 1000 } })`; `page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })`; espera pelo texto do hero; coleta de `pageerror`, H1 e quantidade de canvases; `browser.close()` e `server.close()` em `finally`.
- Resultado: título `Root Trust · A base que sustenta o crescimento`, H1 aprovado, dez canvases, `pageErrors: []`.
- Não foram capturados screenshots nesta checagem; comparação visual desktop/mobile permanece na etapa de QA prevista no plano.

