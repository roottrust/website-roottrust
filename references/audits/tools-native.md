# Auditoria P4.3 — interfaces nativas das quatro ferramentas

Checkpoint de partida: `db9e594`; correção focada a partir de `24bb735`. Escrita por Claude (Sonnet); sem commit.

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

- BFcache real não é reproduzível no Playwright Chromium. O teste dispara um `pageshow` com `persisted: true` sintético (simulação): prova que `ToolSession` reinicia ferramenta e relatório e que `persisted: false` não reinicia, mas não prova restauração real do navegador.
- Firefox/WebKit, Lighthouse e comparação visual por seção contra os exports não foram executados nesta etapa.
- Aprovação humana visual das páginas internas continua pendente.
- Requisições `_rsc` de prefetch do Next (GET de navegação) são ignoradas no teste de "nada enviado".
- Ajuda por cenário ROSI restaurada conforme o export (`cenHelp`), sem preencher nenhum valor financeiro. A ajuda do campo de prejuízo agora é neutra (F07), não a do cenário.
- Campo Shadow AI com `evaluateShadowAi` não-ok (`invalid_choice`) agora mostra erro e foca; o caminho é inalcançável pela UI (só rádios válidos) e não tem teste e2e nem de componente.
- E2E: 4 testes ignorados por desenho, iguais aos já existentes: 2 de captura da Home (`home-capture.spec.ts`, exigem `HOME_QA_CAPTURE=1`) e 2 de aba em segundo plano real (`graphics-motion.spec.ts`, ignorados quando o navegador não reporta aba oculta). Nenhum é de ferramentas.

## Correção focada (revisão P4.3)

- Transferência do auxiliar ROSI: o total é serializado com `exactText` (`format.ts`, `maximumSignificantDigits: 21` com agrupamento pt-BR), sem limite de decimais; releitura por `parsePtBR` devolve o mesmo número (unit: 0, 0,001, 0,1+0,2, 1e-21, 1e-200, 1e-308, Number.MIN_VALUE, 1e21, Number.MAX_VALUE; negativos não entram porque o parser os rejeita). Aux 0,001 transfere "0,001"; 0,001 + 0,1 transfere "0,101".
- Auxiliar inválido: erro local em cada campo (`aria-invalid`, `aria-describedby`), foco no primeiro inválido, erro some ao editar o campo, e "Limpar respostas" zera erros e valores.
- Selects de frequência/prazo exibem erro associado quando existir.
- `brl`/`pct`: valor não nulo que arredondaria para zero usa limiar explícito ("< R$ 0,01", "> −R$ 0,01", "< 0,1%", "> −0,1%"); zero exato e −0 permanecem zero; sinal negativo nunca é omitido. Unit em `tests/unit/tools/format.test.ts`.
- Selo da página: texto diferente para `FORM_MODE=demo` (demonstração local, nenhum dado enviado) e modo padrão (envio indisponível); coberto nos testes por rota.
- Migração (F28): os três totais têm ajuda associada por `aria-describedby` (totais do horizonte; operação inclui coexistência e parte local; transição única não contada na operação e não multiplicada; evitar despesa duplicada). Coberto em e2e.

## Restauração visual P4.3 (fidelidade aos 4 exports)

- Composição: hero horizontal com título de acento inline e arte reduzida à direita; formulário e resultados lado a lado (1,2fr/1fr, empilhados abaixo de 960px); campos em pares no desktop, auxiliares/fieldsets/ações em largura total; resultados em cartões (rótulo/nota à esquerda, valor à direita) com placeholders tracejados claros e sem valor real antes do cálculo.
- Método: `details` "Como chegamos a este resultado" dentro da coluna de resultados, entregue por slot SSR (`method-slot.tsx` + `ResultBox`); fórmulas, hipóteses, limites e fontes completas preservados e presentes no HTML.
- Relatório: cartão largo com `ReportForm variant="inline"` (e-mail + botão na mesma linha no desktop, rótulo acessível preservado). CTA conforme o export: seta no botão, sem símbolo ASCII (o export não tem).
- Modelos, `format`, `useToolForm`, `ToolSession`, estado/reset/"Não sei"/foco/horizonte não foram alterados. Cenário ROSI continua `select`. Painel de resultados não é sticky (o export fixa por altura de viewport; não portado).
- Não executado nesta etapa: gates, comparação visual por seção, capturas. Revalidar após a execução do GPT.
