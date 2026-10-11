# Auditoria P4.2 — modelos puros das ferramentas

**Data:** 10/10/2026 · checkpoint WIP `8cbd155dd870ff14dc13b90a6ef7bf7c4856010c` · escopo: apenas modelos e testes. **Não há UI**; P4.3 (interfaces) e P4.4 (revisão) continuam pendentes.

## Arquivos
- `web/src/features/tools/models/`: `numbers.ts` (parser pt-BR, validação, aritmética segura), `rosi.ts`, `shadow-ai.ts`, `tech-debt.ts`, `cloud-migration.ts`, `index.ts`. Sem React, sem estado, sem I/O, sem dependências novas.
- `web/tests/unit/tools/*.test.ts`: 45 testes (fixtures de `docs/web/tools.md` e limites).

## Convenções
- `Input = number | null | undefined`: `undefined` = vazio, `null` = "Não sei", `0` = zero declarado. Vazio e desconhecido são sempre "ausentes" (nunca zero) e aparecem em `missing`/`missingInputs` com `state`.
- Percentuais em unidades 0–100. Resultados: `Calc` = `value | missing | undefined(reason) | overflow`; funções devolvem `{ ok:false, errors[] }` para entradas inválidas (negativo, não finito, percentual fora da faixa, não inteiro, escolha inválida).
- `parsePtBR(texto, { percent?, integer? })`: `.` somente como milhar em grupos de 3 (sem zeros à esquerda), `,` decimal; aceita `R$` e `%`; rejeita `0.5`, `1.23`, `1e5`, negativos (incl. `−`), `Infinity`/`NaN`, estouro (`Number` infinito) e percentual > 100.
- `mul/div/add` tratam resultado infinito e underflow para 0 de operandos não nulos como `overflow`; ordem das operações evita estouro intermediário evitável (ex.: percentual migração = `(A−M)/A × 100`).

## Contratos cobertos
- **ROSI:** indicadores parciais por dependência; equilíbrio com redução desconhecida; prazo ≥ 12 ⇒ benefício 0 (mesmo com redução desconhecida), equilíbrio indefinido `no_active_period`; custo 0 ⇒ ROSI `zero_cost`; perda de referência 0 ⇒ `zero_reference_loss`; limiar > 100% sem truncar (`breakevenExceedsLimit`); custo não escalado pelo prazo; auxiliares de 4 itens só somam completos (zero conta) e substituem o total direto; incompleto nunca substitui (`sources.*.auxIncomplete`). `FREQUENCY_OPTIONS` = opções editoriais; sem defaults financeiros.
- **Shadow AI:** cinco perguntas, quatro respostas, sem pré-seleção; incompleto devolve `pending`; sem score/risco; "Não sei" ⇒ `to-confirm`, nunca "Não".
- **Dívida técnica:** `D = N×K×m×q`, anual `12×D`; N inteiro positivo (decisão de interface do contrato; 0 ⇒ `not_positive`); `zeroDeclared` para ressalva.
- **Migração:** `M = O+T`, diferença com sinal, percentual só com `A > 0` (`zero_base`); `changeHorizon`/`confirmTotals` + `totalsHorizon` ⇒ `review-required` sem recalcular nem triplicar únicos.

## Decisões/limitações a registrar
- Auxiliar completo "substitui" o direto automaticamente no modelo; a ação explícita de transferir (F15/F16) é responsabilidade da UI (P4.3) ao fornecer `aux`.
- Textos de ajuda/copy fora dos modelos, exceto perguntas/ações do Shadow AI (propostas editoriais do contrato).
- Sem prova de correção além dos testes; revisão independente P4.4 pendente. Nada aqui certifica operação ou UI.

## Gates (em série, `web/`)
`npm run lint` ok · `npm run typecheck` ok · `npm test` 9 arquivos/60 testes ok · `npm run build` ok · `npm run test:e2e` 54 passed, 4 skipped (aba de fundo real, preexistentes). Correção durante a execução: percentual de migração calculava `100×diff` antes de dividir (estouro evitável); trocado por `(diff/A)×100`.
