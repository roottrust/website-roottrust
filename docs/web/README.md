# Website Root Trust — documentação canônica

Documentação consolidada do produto e do frontend. O plano aprovado e o estado das tarefas estão em [PLAN.md](../../PLAN.md); arquitetura e contratos técnicos estão em [development.md](development.md).

## Ordem de leitura

1. [product.md](product.md) — escopo, rotas, conteúdo aprovado, serviços, formulários e jornadas.
2. [design.md](design.md) — Home aprovada, linguagem visual, movimento e requisitos de acessibilidade.
3. [tools.md](tools.md) — contrato completo F01–F29, modelos, fórmulas, exemplos e limites.
4. [newsletter.md](newsletter.md) — decisões N01–N11, páginas, estados e operação pendente.
5. [development.md](development.md) — stack, arquitetura, formulários demo, fases e critérios de aceite.

O pacote oficial da identidade permanece em [`docs/design`](../design/README.md). Exports do Claude Design ficam em [`references/claude-design`](../../references/claude-design/); auditorias e amostras editoriais completas ficam em [`references/audits`](../../references/audits/) e [`references/editorial`](../../references/editorial/).

## Precedência e estado

O manual v2 e seus assets definem a marca. A aprovação de `Home.dc.html` em 04/10/2026 define visual, textos e regras da Home; adaptações web delimitadas em `design.md` não reescrevem nem ampliam o manual. Contratos F01–F29, S01–S16 e N01–N11 definem escopo. Aprovação de direção não comprova implementação, cálculo auditado, integração ou serviço operacional.

Use os rótulos **aprovado**, **proposta**, **demonstração**, **histórico** e **pendente** como definidos em cada documento. Os exports aprovados são a baseline editorial/visual atual; blocos históricos de copy proposta servem de contexto quando compatíveis com eles. O aceite final da implementação permanece separado. Amostras da newsletter são demonstrativas; apenas metadados e o primeiro parágrafo podem estar no conjunto público. A [matriz de migração](../../references/audits/documentation-migration.md) registra fonte, destino e cobertura de cada material removido.

## Estado técnico

Frontend local implementado e validado em 11/10/2026. A Home nativa recebeu aprovação humana em 10/10; o aceite final do conjunto permanece pendente. Gates finais atuais (P8.3, retries 0): lint, typecheck, 107 testes unitários em 13 arquivos, build de produção e 284 E2E aprovados, com 6 skips explicitados na [auditoria final](../../references/audits/final-qa.md). LCP mediano de laboratório 2,73–2,87 s (melhoria de 41–43%), CLS 0; a meta orientativa de 2,5 s não foi atingida e o ganho foi mantido como exceção local aprovada (D16), sem ser publicação nem aceite final visual. Não há integração operacional nem autorização de publicação. Os números 101 unit/228 E2E/quatro skips/LCP 4,8 s são histórico.

As seis páginas desta documentação são o contexto canônico. Resultados detalhados, capturas e limites estão na auditoria final; tarefas e decisões continuam exclusivamente no PLAN.

### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 acima:** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.
