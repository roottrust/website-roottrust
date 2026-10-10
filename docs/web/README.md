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

Use os rótulos **aprovado**, **proposta**, **demonstração**, **histórico** e **pendente** como definidos em cada documento. Textos de páginas internas marcados como proposta exigem revisão própria. Amostras da newsletter são demonstrativas; apenas metadados e o primeiro parágrafo podem estar no conjunto público. A [matriz de migração](../../references/audits/documentation-migration.md) registra fonte, destino e cobertura de cada material removido.

## Estado técnico

A fundação Next.js está inicializada em `web/`, com scripts npm, lockfile, shell, formulários locais e testes Vitest/Playwright. A Home completa foi portada para JSX/CSS Modules e está em revisão independente visual/técnica P3.4; páginas internas aguardam o aceite humano obrigatório do `PLAN.md`. Comandos em `development.md` e evidências em [frontend-foundation.md](../../references/audits/frontend-foundation.md) e [home-native.md](../../references/audits/home-native.md). Exports e execução local não comprovam operação ou prontidão de produção.


