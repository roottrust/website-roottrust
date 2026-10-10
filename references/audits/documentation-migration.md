# Matriz de migração da documentação

As 12 páginas exportadas foram movidas intactas para `references/claude-design/`; o inventário confirmou hashes iguais antes e depois. Auditorias e amostras foram preservadas em arquivos de referência. As fontes listadas abaixo foram removidas somente após a cobertura ser conferida.

| Fonte removida | Cobertura canônica / arquivo preservado |
|---|---|
| `docs/web/website-brief.md` | `docs/web/product.md` (posicionamento, públicos, diferenciais e limites); `docs/web/development.md` (decisões técnicas) |
| `docs/web/website-content.md` | `docs/web/product.md` (copy, metadados, rotas e propostas editoriais) |
| `docs/web/website-flows.md` | `docs/web/product.md`, `docs/web/tools.md`, `docs/web/newsletter.md`, `docs/web/development.md` (jornadas, regras e estados) |
| `docs/web/website-design.md` | `docs/web/design.md` (direção aprovada e requisitos visuais); `docs/web/development.md` (requisitos de implementação) |
| `docs/web/references.md` | IDs e proveniência em `docs/web/product.md`, `docs/web/tools.md` e `docs/web/newsletter.md`; histórico em `references/audits/website-research-decisions.md` |
| `docs/web/home-export-audit.md` | `references/audits/home-export-audit.md`; requisitos em `docs/web/design.md` e `docs/web/development.md` |
| `docs/web/export-audit-2026-10-09.md` | `references/audits/export-audit-2026-10-09.md`; contratos em `docs/web/product.md`, `docs/web/tools.md` e `docs/web/newsletter.md` |
| `docs/web/tools-claude-design-brief.md` | `docs/web/tools.md` (F01–F29, modelos, fórmulas, exemplos, copy e limites; sem prompts/skills/anexos) |
| `docs/web/newsletter-claude-design-brief.md` | `docs/web/newsletter.md` (N01–N11, três páginas, acesso, estados e limites; sem prompts/skills/anexos) |
| `docs/web/newsletter-editorial-samples.md` | `references/editorial/newsletter-editorial-samples.md` (amostras completas e notas editoriais) |
| `docs/web/services-cybersecurity-claude-design-brief.md` | `docs/web/product.md#conteúdo-proposto--cibersegurança` (copy proposta, FAQ e limites) |
| `docs/web/services-cloud-infrastructure-claude-design-brief.md` | `docs/web/product.md#conteúdo-proposto--infraestrutura-em-nuvem` (copy proposta, exemplos e limites) |
| `docs/web/services-software-claude-design-brief.md` | `docs/web/product.md#conteúdo-proposto--software` (copy proposta, exemplos e limites) |
| `docs/plans/contexto-website-v2-2026-10-03.md` | Decisões atuais em `docs/web/product.md`, `docs/web/design.md` e `PLAN.md` |
| `docs/plans/newsletter-contexto-2026-10-07.md` | Requisitos atuais em `docs/web/newsletter.md`; amostras completas em `references/editorial/newsletter-editorial-samples.md` |
| `docs/plans/extracao-identidade-root-trust-2026-10-02.md` | Extração concluída: `docs/design/README.md`, `docs/design/assets-catalog.md`, `docs/design/extraction-audit.md` e `AGENTS.md` preservam marca v2, 37 pranchas, 290 assets, originais/licenças e validações técnicas |

## Critérios conferidos

- `docs/web/` contém exatamente seis documentos canônicos: `README.md`, `product.md`, `design.md`, `tools.md`, `newsletter.md` e `development.md`.
- F01–F29, S01–S16 e N01–N11 permanecem rastreáveis nos documentos canônicos; fórmulas, exemplos, copy e limites necessários foram mantidos.
- D09 mantém campos ativos e validação. D10 permite, somente com `FORM_MODE=demo`, simular localmente andamento, pedido aceito aguardando confirmação e erro/retry. O modo não envia nem persiste dados e não declara confirmação, entrega ou cancelamento.
- Os 12 exports movidos são a baseline visual aprovada. Propostas editoriais e pendências continuam identificadas como tais.
- Referências locais apontam para `references/claude-design/`; em `docs/design/` foram alterados somente links Markdown.
- `PLAN.md`, `AGENTS.md`, arquivos de marca e assets não foram removidos; nenhuma limpeza ampla de `temp/` foi feita.
