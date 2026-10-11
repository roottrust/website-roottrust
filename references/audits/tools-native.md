# Auditoria P4.3 — interfaces nativas das quatro ferramentas

Checkpoint de partida: `db9e594`. Escrita por Claude (Sonnet); sem commit.

## Entregue

- Rotas `/ferramentas/{rosi,shadow-ai,divida-tecnica,migracao-para-nuvem}`: server-only, `force-dynamic`, metadata própria, modo via `resolveFormMode`.
- `ToolPage` (Server Component): hero com `PillarArt` (balanca/olho/engrenagem/nuvem), método, fontes e CTA `/#contato` renderizados no servidor; ferramenta e relatório em ilhas cliente.
- Modelos puros reutilizados sem alteração. UI em `RosiTool`, `ShadowAiTool`, `TechDebtTool`, `MigrationTool` + `fields.tsx`/`useToolForm.ts`.
- `ReportForm`: somente e-mail + `toolId` pelo adaptador único; independente da newsletter (sem consentimento automático).

## Contratos verificados (tests/e2e/tools.spec.ts, desktop e mobile)

- Fixtures: ROSI 100%/R$ 30.000/30%; dívida R$ 6.000 e R$ 72.000; migração R$ 6.000 a mais, 5%, base zero sem percentual.
- Toda edição descarta o resultado e mostra aviso; "Limpar" zera campos, auxiliares, erros e resultado.
- "Não sei" nunca vira zero (ROSI sem redução mostra só o equilíbrio; dívida sem custo é "insuficiente").
- Auxiliar ROSI: incompleto não altera o campo principal; completo substitui só por ação explícita. O auxiliar nunca é enviado ao modelo.
- Exemplo ROSI é fictício, separado, e não preenche dados.
- Migração: trocar 12↔36 invalida o resultado, exige "Confirmar totais"; totais nunca são multiplicados.
- Shadow AI: 20 rádios sem pré-seleção, pendentes sinalizadas com foco, sem score.
- Respostas só em memória: sem storage/cookie, sem requisição não-GET/fetch/XHR, sem query/hash; SPA, histórico e reload não recuperam; `ToolSession` reinicia em `pageshow` persistido (BFcache).
- Modo padrão (porta 3101) nunca declara recebimento; modo demo declara "aceito localmente".
- 320px sem overflow horizontal; sem `pageerror` nem 404.

## Limites / não verificado

- BFcache real não é reproduzível no Playwright Chromium; coberto apenas pelo handler `pageshow` (revisão de código).
- Firefox/WebKit, Lighthouse e comparação visual por seção contra os exports não foram executados nesta etapa.
- Aprovação humana visual das páginas internas continua pendente.
- Requisições `_rsc` de prefetch do Next (GET de navegação) são ignoradas no teste de "nada enviado".
- Texto de ajuda do cenário ROSI é genérico (um só); os textos por cenário do export não foram replicados.
