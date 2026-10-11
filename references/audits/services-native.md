# Auditoria P4.1 — Três serviços nativos

Data: 2026-10-10. Checkpoint: `b69a452`. Executor: `claude-agent` (Sonnet), sessão headless, sem commit/push.

## Arquivos

- `web/src/features/services/content.ts`: dados tipados dos três serviços (conteúdo dos exports `Servico *.dc.html`, conferido com `docs/web/product.md`).
- `web/src/features/services/ServicePage.tsx`: Server Component; 6 seções (hero, situações, 4 frentes + painel, método em 5 etapas + fecho, FAQ nativo `details/summary`, contato `#contato`).
- `web/src/features/services/services.module.css`.
- `web/src/app/servicos/{ciberseguranca,infraestrutura-em-nuvem,desenvolvimento-de-software}/page.tsx`: `force-dynamic`, `resolveFormMode(process.env.FORM_MODE)` no servidor, `metadata` por rota.
- `web/tests/e2e/services.spec.ts`.
- Reutilizados sem alteração: Header/Footer globais, `PillarArt` (`chave`/`servidores`/`modulos`), `ContactForm`, tokens. Nenhum arquivo compartilhado alterado.

## Conteúdo e limites contratuais

- Cibersegurança restaura “Capacidades complementares, conforme escopo contratado” no painel Pentest: Gestão de vulnerabilidades, Red Team (escopo próprio, não sinônimo de Pentest) e Apoio a normas/compliance (sem prometer certificação). Mantidos: autorização/escopo, 3 entregas, “Reteste ... conforme escopo e contrato”, “A conversa gratuita não inclui...”.
- Infraestrutura: sem percentual de economia; 24×7 automático não implica equipe humana.
- Software: integração ≠ automação; suporte/evolução conforme contratação.
- Sem novos pilares, provas, métricas, selos ou ferramentas promocionais.

## Gates (em série, `web/`)

- `npm run lint`: ok. `npm run typecheck`: ok. `npm test`: 15/15. `npm run build`: ok (as 3 rotas dinâmicas).
- `npm run test:e2e` (execução anterior à correção focada): 48 passed, 4 skipped; resultado final na seção seguinte.
- Novos testes: SSR do HTML bruto (H1 e textos contratuais), 6 seções, CTA `#contato`, FAQ por teclado (Enter/Espaço), validação com foco no primeiro campo, sem `pageerror` nem recurso 404, sem overflow a 320px, modo padrão sem sucesso simulado (porta 3101).

## Correção focada (moldura e símbolo)

- Novo `web/src/features/graphics/FrameCanvas.tsx`: reutiliza `HomeAscii.drawFrame`, `createAnimation` e `GraphicsProvider`; sem loop contínuo (gate `animated:false`, um quadro por invalidação via scroll, resize, ResizeObserver, fontes, ponteiro só com animação ativa e viewport ≥960px). Respeita pausa, reduced motion, aba oculta e interseção; falha de Canvas 2D ou `contextlost` oculta o canvas (`data-graphic-status="failed"`) sem erro; dispose remove listeners e libera sprites.
- `ServicePage.tsx`: `FrameCanvas`, `data-frame-cut` nas 4 seções e em div final, `data-band="cta"` na faixa, `SymbolAscii` na segunda coluna do CTA (box `min(100%,520px)`, proporção 566/506, como no export). `HomeCanvas`, `HomeAscii` e compartilhados intactos.
- Testes novos: moldura/símbolo prontos e pixels da moldura (desktop), cortes e faixa, fallback sem Canvas 2D (sem `pageerror`, imagem de fallback visível), pausa global sem rAF contínuo.
- Gates em série: lint, typecheck, unit (15), build e e2e ok: 54 passed, 4 skipped.
- 4 skips = 2 da captura QA da Home (`HOME_QA_CAPTURE`) + 2 da aba real em segundo plano.

## Limites

- A justificativa anterior de que moldura e símbolo não podiam ser reproduzidos por acoplamento ao `HomeCanvas` era incorreta: `SymbolAscii` e `drawFrame` são autônomos; ambos agora estão portados.
- Sem comparação pixel a pixel contra os exports nem aprovação visual humana; capturas não regeneradas.
- O CTA do Header global aponta para `/#contato` (Home), conforme permitido.
- Acessibilidade e desempenho não certificados; Lighthouse não medido.
- Ferramentas/newsletter não iniciadas.
