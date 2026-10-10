# QA de gráficos e Home — P3.4-T

Data: 10/10/2026. Checkpoint WIP: `c4dd2f7971992239523a3611a1391b3cbeeb4dfe`. Modelo efetivo: `claude-sonnet-5-5`. Execução [claude:escreve]. Não é aceite humano nem conclusão de P3.4; a revisão independente do diff e o aceite da Home continuam pendentes.

## Arquivos

- `web/tests/e2e/graphics-motion.spec.ts` (novo): 9 testes por projeto Chromium (desktop 1440x1000, mobile 390x844).
- `web/tests/e2e/home-capture.spec.ts` (novo): captura de evidência, ativa só com `HOME_QA_CAPTURE=1`; sem a variável, os 2 testes são pulados.
- `references/audits/home-qa/`: 45 JPGs + `desktop-metrics.json` + `mobile-metrics.json`.
- Nenhum arquivo de `web/src/` foi alterado: nenhum bug de produção foi comprovado.

## Instrumentação

`addInitScript` do Playwright, antes do load, apenas nos testes. Envolve `getContext` para (a) contar `clearRect`/`drawImage`/`fillRect` por canvas 2D, (b) bloquear WebGL (`noWebgl`) ou (c) capturar contextos WebGL para acionar `WEBGL_lose_context`. Nenhuma API de debug no código de produção.

## Contratos verificados no navegador

| Contrato | Resultado |
|---|---|
| `prefers-reduced-motion` no load | pinta quadro estático, sem animar |
| Redução dinâmica após o load | desenho para, pixels permanecem, retoma ao desativar |
| Pausa global | congela e retoma |
| Fora de tela | canvas fora da viewport não desenha; volta ao rolar |
| WebGL indisponível no load | todas as artes `failed`, fallback visível, conteúdo utilizável, sem `pageerror` |
| Perda de contexto WebGL real | todas `failed`, sem desenho, sem ressurreição após redução/pausa |
| `contextlost` do canvas 2D da Home (simulado) | `img[data-graphic-fallback]` visível |

## Aba oculta

- Simulação: `document.hidden`/`visibilityState` sobrescritos e `visibilitychange` disparado; rotulada como simulação no teste. Prova o contrato do código (provider), não o comportamento do navegador.
- Aba real em background: teste existe, mas é pulado quando `visibilityState` não é `hidden` (headless). Nesta rodada foi pulado; **não verificado** em navegador real.

## PillarArt — falha síncrona seguida de `setStatus('ready')`

Hipótese não reproduzida. Leitura de `PillarArt.tsx`/`pillar-runtime.ts`: não há caminho de callback síncrono de falha; falhas só chegam por `throw`/rejeição, tratadas no `.catch`. O teste de WebGL indisponível confirma `failed` em todas as artes. Sem correção.

## Gates (PowerShell, em `web/`, em série)

| Comando | Resultado |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm run test` | exit 0; 15/15 (Vitest) |
| `npm run build` | exit 0 |
| `npm run test:e2e` | exit 0; 32 passaram, 4 pulados (2 captura + 2 aba real, por projeto) |

Portas 3100/3101 sem servidor ativo ao final (apenas TIME_WAIT). `NO_COLOR`/`FORCE_COLOR` gera aviso sem relação com falha. Erros intermediários de tipo/seletor durante a escrita dos testes foram corrigidos no próprio teste.

## Capturas

`references/audits/home-qa/{desktop,mobile}-{native,baseline}-NN-seção-N.jpg`: 9 seções (hero, pilares, servicos, como, lidera, ferramentas, newsletter, cta, ctasym), topo de cada uma, mais um segundo quadro se a seção excede 1,5× a altura da viewport. Condições: JPG q72, `deviceScaleFactor` 1, `reducedMotion: reduce`, `document.fonts.ready` + 1,2 s, rolagem + 450 ms por quadro. Contagem: desktop 9 native + 9 baseline; mobile 14 native + 13 baseline (45 no total, conferido por listagem).

## Comparação com `Home.baseline.dc.html` (limitada)

Baseline servida por servidor node efêmero somente leitura em `127.0.0.1`; arquivo não alterado. Medições (`*-metrics.json`):

| Viewport | Origem | Altura doc. | Overflow X | Canvases | pageerrors |
|---|---|---|---|---|---|
| Desktop | native | 6853 | não | 13 | 0 |
| Desktop | baseline | 6384 | não | 10 | 0 |
| Mobile | native | 12517 | não | 13 | 0 |
| Mobile | baseline | 11980 | não | 12 | 0 |

Alturas de hero, pilares, serviços, como, lidera, ferramentas e ctasym são idênticas à baseline em ambos os viewports. Diferem newsletter (desktop 660 vs 424; mobile 874 vs 611) e cta (desktop 1083 vs 851; mobile 1437 vs 1163). Atribuição: conteúdo autorizado adicional (aviso demo e seletor de formulário) — inferência a partir do conteúdo, não medida por diff de pixels.

## Limites

- Sem diff de pixels: a comparação é por alturas de seção e inspeção das capturas, que ainda exigem leitura humana.
- Canvas animado não é determinístico; capturas usam movimento reduzido (quadro estático), logo não validam animação.
- Somente Chromium; Firefox/WebKit, zoom, Lighthouse/desempenho e aba em background real ficam para P6/aceite.
- Nenhuma alegação de acessibilidade ou desempenho certificados.
- Propostas opcionais do terminal e do scroll permanecem inalteradas.
