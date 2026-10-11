# Auditoria P5.1 — catálogo público da newsletter

**Data:** 10/10/2026 · checkpoint WIP `f3a128ae23b0d02d33e49abee2a2b84f1f75c0ee` (HEAD `wip: pre-claude P5.1 newsletter catalog`; árvore antes da escrita: apenas `PLAN.md` modificado, preexistente) · modelo: claude-haiku-5-5 em sessão headless · escopo: catálogo tipado e testes. **Não há páginas de newsletter**; P5.2 (páginas) e a revisão Sonnet da allowlist continuam pendentes.

## Arquivos
- `web/src/features/newsletter/catalog.ts`: `EDICOES_PUBLICAS` (C01–C03), tipos `EdicaoPublica`/`SegmentoAbertura`/`Pilar`, helpers `sortedEdicoes`, `latestEdicao`, `getEdicaoBySlug`. Sem React, sem I/O, sem dependências novas.
- `web/tests/unit/newsletter/catalog.test.ts`: 8 testes.

## Proveniência
- Fonte única: `references/claude-design/newsletter-edicoes.js`, SHA-256 `482845740d146f5902f6ad48d0add7d34373a383a94401d766da330ca65dccf4`.
- Copiado: `id`, `slug`, `data`, `pilar`, `titulo` e `abertura` (segmentos `t`/`href`) de C01–C03; acrescentado `demo: true`, conforme a decisão de identificar amostras.
- Teste compara por igualdade estrita com a fonte original (`vm`, somente no teste); o teste falharia se a fonte estivesse ausente ou vazia.
- Não lidos: `references/editorial/`, `uploads/`, `.env*`. Nenhum corpo completo, nenhum asset público copiado, nenhuma edição extra no catálogo (fixtures apenas no teste).

## Allowlist validada
- Chaves por edição: exatamente `abertura, data, demo, id, pilar, slug, titulo`.
- Segmentos: apenas `t` (texto não vazio) e `href` opcional, com URL `https:`.
- `id` `C\d{2}`; `slug` kebab-case único; `data` ISO real; `pilar` dentro de `PILARES`; ids e slugs sem repetição.

## Gates (em série, `web/`)
- `npm run lint`: ok, sem erros.
- `npm run typecheck`: ok.
- `npm test`: 11 arquivos, 94 testes ok (8 novos de newsletter).
- `npm run build`: ok. O catálogo não é importado por página, portanto não entra em rota alguma.
- `npm run test:e2e`: 110 passed, 4 skipped (preexistentes).

## Limites
- Datas e textos são demonstrativos (conforme a fonte: "sem publicação real").
- A revisão Sonnet independente da allowlist permanece obrigatória antes de consumo público (P5.1 no PLAN).
- Nada aqui comprova entrega, confirmação de e-mail, acessibilidade ou desempenho de páginas que ainda não existem.
