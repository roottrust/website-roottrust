# Website Root Trust — documentação canônica

## Aceite operacional — 19/10/2026

**Piloto restrito concluído e aceito por Renato.** Diagnóstico, quatro relatórios, newsletter agendada com aprovação humana, publicação/envio, confirmação/cancelamento e backup/restauração foram validados. Renato é responsável pela conferência de cotas e pela guarda/descarte de backups, CSVs, mensagens e contatos nos provedores. Procedimento e limitações em [development.md](development.md#responsabilidade-operacional-e-limites-do-aceite). O [plano arquivado](../plans/integrations-pilot-completed.md#encerramento-e-aceite-final--19102026) preserva as evidências. Este estado prevalece sobre propostas e pendências históricas abaixo. Não há autorização de abertura pública nem alteração das allowlists.


Documentação consolidada do produto e do frontend. O plano concluído e suas evidências estão no [arquivo de integrações](../plans/integrations-pilot-completed.md); arquitetura e contratos técnicos estão em [development.md](development.md).

**Automação editorial T6.2-R3, 18/10/2026:** Workers/ambiente/Routine configurados; criação, regeneração, recusa e fluxo integral de aprovação → prévia pública → Broadcast → recebimento pelo usuário foram ensaiados. Confirmação do trigger corrigida e validada (D2). [Prompt diário](../../web/ops/newsletter-routine/prompt.md) restaurado e agenda seg–sex08h Brasília confirmados pelo operador; primeira ocorrência automática confirmada em19/10, com aprovação humana, prévia publicada e e-mail recebido. [Guia](../../web/ops/newsletter-routine/README.md) e evidências no PLAN. R3.6/T6.2/T6.3 concluídas para o piloto restrito, com aceite de Renato em19/10/2026.

## Ordem de leitura

1. [product.md](product.md) — escopo, rotas, conteúdo aprovado, serviços, formulários e jornadas.
2. [design.md](design.md) — Home aprovada, linguagem visual, movimento e requisitos de acessibilidade.
3. [tools.md](tools.md) — contrato completo F01–F29, modelos, fórmulas, exemplos e limites.
4. [newsletter.md](newsletter.md) — decisões N01–N11, páginas, estados e operação pendente.
5. [development.md](development.md) — stack, arquitetura, formulários, operação do piloto e critérios de aceite.

O pacote oficial da identidade permanece em [`docs/design`](../design/README.md). Exports do Claude Design ficam em [`references/claude-design`](../../references/claude-design/); auditorias e amostras editoriais completas ficam em [`references/audits`](../../references/audits/) e [`references/editorial`](../../references/editorial/).

## Precedência e estado

O manual v2 e seus assets definem a marca. A aprovação de `Home.dc.html` em 04/10/2026 define visual, textos e regras da Home; adaptações web delimitadas em `design.md` não reescrevem nem ampliam o manual. Contratos F01–F29, S01–S16 e N01–N11 definem escopo. Aprovação de direção não comprova implementação, cálculo auditado, integração ou serviço operacional.

Use os rótulos **aprovado**, **proposta**, **demonstração**, **histórico** e **pendente** como definidos em cada documento. Os exports aprovados são a baseline editorial/visual atual; blocos históricos de copy proposta servem de contexto quando compatíveis com eles. O aceite final da implementação permanece separado. Amostras da newsletter são demonstrativas; apenas metadados e o primeiro parágrafo podem estar no conjunto público. A [matriz de migração](../../references/audits/documentation-migration.md) registra fonte, destino e cobertura de cada material removido.

## Estado técnico

O frontend recebeu aceite humano; seus resultados de 11/10/2026 (107 unitários, 284 E2E e 6 skips) são histórico da fase local, assim como o LCP mediano de 2,73–2,87 s. A integração local passou lint, tipos, 495 unitários, build e 290 E2E/6 skips em 13/10/2026. O [plano arquivado](../plans/integrations-pilot-completed.md) registra a integração concluída. Há implementação de piloto em `web/` para Firestore, Resend, Discord, newsletter e relatórios. As contas estão configuradas e os fluxos principais foram ensaiados com identidades de teste; a geração editorial agendada com aprovação humana foi validada em19/10/2026; o piloto restrito recebeu aceite final de Renato em19/10/2026. Em 17/10/2026, o isolamento por identidade passou lint, tipos, 517 unitários, build e 290 E2E/6 skips. Deploy autorizado em `https://website-roottrust.vercel.app` agora usa piloto real restrito: diagnóstico aceita somente o WhatsApp oficial de teste, relatórios/newsletter somente os três e-mails permitidos e Turnstile continua obrigatório. Agendador ativo e duas chamadas HMAC/Firestore200 comprovadas; diagnóstico, quatro PDFs, revisão/publicação/envios da newsletter e confirmação/cancelamentos receberam verificação humana e de estados dos provedores. A correção do ACK diferido passou lint, tipos, 522 unitários, build e 290 E2E/6 skips. Backup/restauração reais de72documentos/16coleções verificados em19/10; Renato assumiu conferência de cotas e cópias externas; medição ampliada de retenção adiada por decisão expressa. Detalhes no plano arquivado. Não há autorização de publicação aberta.

As seis páginas desta documentação são o contexto canônico. Resultados detalhados, capturas e limites estão na auditoria final; decisões e evidências desta entrega permanecem no plano arquivado.

### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 acima:** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.

### Referências locais

Por decisão do usuário, `references/` não é versionado. Os links para essa pasta são recursos locais e não estarão disponíveis em clones novos. As duas fontes necessárias aos testes unitários estão preservadas em `web/tests/fixtures/`; capturas comparativas exigem restaurar os exports locais.
