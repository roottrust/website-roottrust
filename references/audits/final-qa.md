# QA final: escopo, comandos e limites

Estado: preparação. Nenhum gate, captura ou medição foi executado por esta nota; resultados entram aqui somente depois da execução pelo GPT.

## Comandos (a partir de `web/`, após `npm run build`)

- Gate: `npm run test:e2e` (a captura fica fora do gate; `qa-capture.spec.ts` só entra com `QA_CAPTURE=1`).
- Captura: `node scripts/qa-capture.mjs` (Chromium desktop e mobile; define `QA_CAPTURE=1`). Saída em `references/audits/final-qa/captures`.
- Lighthouse 13.5.0 efêmero: `node scripts/lighthouse.mjs` (3 rodadas por Home, serviço, ferramenta, newsletter). Saída em `references/audits/final-qa/lighthouse`.

## O que cada evidência é

- Captura: rota nativa versus export aprovado, mesmo viewport, DPR 1, movimento reduzido, fontes carregadas. A página é percorrida de ponta a ponta antes da foto; `metrics.json` registra, por gráfico, `status` (`ready` = renderizado; `failed` + fallback = fallback estático, não é render), tempo esgotado e viewport/UA. Não é igualdade pixel a pixel. Gráficos reais do export (e fundos externos) podem divergir.
- Reflow 640x512 e 320x256 CSS px: equivalente geométrico de 200%/400% de zoom, **não** zoom real do navegador. Verifica `scrollWidth`, e conteúdo de `main`/`footer` fora do viewport ou cortado por ancestral com `overflow: hidden/clip`; contêineres com rolagem intencional são ignorados.
- Teclado (Chromium): ordem de Tab finita, sem foco oculto, e o foco precisa mudar `outline`/`box-shadow` (indicador não decorativo). Indicador desenhado em elemento pai (`:focus-within`) seria reportado como falha para triagem manual.
- Firefox/WebKit: smoke. No WebKit do Windows o link “Pular” recebe foco programático; isso **não** verifica a ordem real de Tab.
- Pausa/descarte de gráficos: conta chamadas 2D (`clearRect`, `drawImage`, `fillRect`, `fillText`, `strokeText`, `fill`, `stroke`) por canvas, com controle > 0 antes da pausa. Não conta desenhos WebGL nem OffscreenCanvas; o descarte WebGL é verificado por `isContextLost()`.
- Prefetch `_rsc` cancelado na navegação (`ERR_ABORTED`, `NS_BINDING_ABORTED`, `cancelled`) é tolerado; qualquer outra falha de rede/console/página reprova.
- Lighthouse: laboratório, emulação móvel, loopback, TBT de laboratório não certifica INP de campo. Não é certificação de desempenho nem de acessibilidade.
- CI remoto não executado até push autorizado.

## P3.1 carga adiada de PillarArt

- `PillarArt` agora importa `pillar-runtime`/Three só quando o elemento entra no viewport (IntersectionObserver; sem observer, carrega no mount). Gates de movimento, pausa, reduced motion, aba oculta, fallback, perda de contexto e dispose mantidos; guarda `cancelled` evita montagem após desmontagem.
- Teste fora de tela (`graphics-motion.spec.ts`) ajustado: antes da rolagem os pilares ficam `loading` e nenhum contexto WebGL novo é criado; depois da rolagem ficam `ready` e a contagem de contextos aumenta. Teste de perda de contexto passa a exigir `failed` presente e nenhum `ready` (pilares nunca visíveis permanecem `loading` com fallback).
- Medições (LCP/TBT/JS) pendentes: GPT executa após os gates; não declarar ganho sem medir.

## P3.1 primeiro quadro de PillarArt (correção)

- `mountPillar` recebe `onFirstFrame`, chamado uma única vez após o primeiro `drawImage` bem-sucedido; `dispose`/falha zeram o callback. `PillarArt` não marca `ready` no mount: fallback e `data-graphic-status="loading"` permanecem até o primeiro desenho (guarda `cancelled` evita setState após desmontagem).
- Testes (`graphics-motion.spec.ts`): `visitPillars` percorre cada pilar renderizado e exige `ready` com fallback ausente e canvas pintado (ou `failed` no caso sem WebGL); `expectViewportPillarsReady` espera todos os pilares no viewport. Suspensão (pausa, aba oculta, reduced motion, fora de tela) e `semWebGL` só medem depois de visitar todos; linhas fora de tela só contam se `status === ready` (pilar nunca montado não é medido como suspenso). Checagens de fallback visível limitadas a pilares; o teste `contextlost` da Home verifica apenas `main > img` da Home.
- Perda de contexto WebGL: escopo preciso = pilares já montados (`ready`) antes da perda permanecem `failed` após reduced motion e pausa/retomada. Pilares ainda não montados podem obter renderer novo e não são asseridos. Nenhuma asserção removida; testes não foram executados por esta sessão (GPT roda os gates).
