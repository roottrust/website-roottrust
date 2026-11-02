# Website Root Trust — documentação canônica

## Estado vigente — 31/10/2026

Este conjunto descreve o site publicado em `https://website-roottrust.vercel.app`. O deployment vigente é `dpl_GymUQNaiV8UiCe6obXrArWJQ9YK3` (`website-roottrust-2rrat2te4-renato-soares-projects.vercel.app`), READY e associado ao alias principal. Ele usa `BACKEND_MODE=public` e `FORM_MODE=off`: formulários reais seguem a readiness public; `off` só desativa a simulação demo. GETs pós-publicação confirmaram 11 rotas HTTP 200, duas rotas antigas de serviço HTTP 404 sem redirect, catálogo Firestore com duas prévias reais e nenhuma fixture, páginas sem indexação e CAPTCHA Cloudflare em tema global claro → escuro → claro, sem pageerror ou POST ao app. Widget não foi resolvido nem submetido.

Renato aprovou a composição visual e editorial em 31/10/2026, autorizou este rollout e confirmou autorização específica da Vercel para o uso comercial no plano Hobby. A autorização é declaração do operador, não verificação independente de documento contratual. O manifesto publicado tem SHA-256 `17a2b42323a7f9984f0b94fa81d5666ba074d79f243136c7708e72a87617d9de`; a árvore partiu do WIP `9e4b18d` com alterações locais, sem commit final. O deployment anterior compatível é `dpl_EZSNVGuekPfh7saEbwLQPP54WzVt`; rollback não executado.

**Pendente:** o ensaio editorial real da Routine até Broadcast/inbox/cancelamento não foi executado devido à cota Claude, por decisão explícita de Renato. Não usar rotina alternativa, API paga, reenvio ou edição fictícia para inscritos; não declarar o ensaio aprovado nem encerrar o projeto como concluído. O aceite e a publicação não alteram esse estado.

## Ordem de leitura

1. [product.md](product.md) — escopo, rotas, conteúdo aprovado, serviços, formulários e jornadas.
2. [design.md](design.md) — Home aprovada, temas, composição, movimento e acessibilidade.
3. [tools.md](tools.md) — contratos F01–F29, modelos, fórmulas, exemplos e limites.
4. [newsletter.md](newsletter.md) — decisões N01–N11, páginas, amostras públicas, operação e pendências.
5. [development.md](development.md) — stack, modos, arquitetura, operação, gates e evidências.

O pacote oficial da identidade permanece em [`docs/design`](../design/README.md). Os 12 exports aprovados e dependências permanecem em [`references/claude-design`](../../references/claude-design/). Auditorias e rastreabilidade estão em [`references/audits`](../../references/audits/); corpos editoriais completos permanecem privados em [`references/editorial`](../../references/editorial/). Essas referências locais são ignoradas pelo Git e não estarão disponíveis em clones novos. A [matriz de migração](../../references/audits/documentation-migration.md) registra fonte, destino e cobertura dos materiais documentais já migrados; esta atualização não remove outros documentos.

## Precedência

O [PLAN.md](../../PLAN.md) é a única fonte ativa de tarefas e estados. A [matriz editorial de 30/10](revision-editorial-2026-10-30.md) é evidência de proposta da elaboração, fora dos seis canônicos; decisões posteriores do PLAN prevalecem sobre suas rotas e textos antigos. Instruções e aprovações atuais de Renato, decisões D01–D19 e emendas R01–R09 prevalecem sobre notas antigas. O plano de integrações em [`docs/plans/integrations-pilot-completed.md`](../plans/integrations-pilot-completed.md) é histórico e registra o aceite do piloto restrito em 19/10/2026; não rege a publicação pública atual.

O Manual de Marca v2 e seus originais/licenças definem a identidade. Os 12 exports estabelecem a baseline visual/editorial aprovada; decisões posteriores aprovam apenas adaptações web delimitadas. Os contratos F01–F29, S01–S16 e N01–N11 continuam válidos. Preserve distinções entre aprovado, proposta, demonstração, histórico e pendente. Aprovação visual não certifica cálculo, acessibilidade, disponibilidade, conformidade ou operação de provedor.

Corpos completos de edições não podem entrar no conjunto publicável HTML/RSC/JS/maps/assets/uploads. O conjunto público contém metadados, fontes e primeiro parágrafo editorial completo com links. As três amostras locais são demonstrativas e sem indexação; em produção o catálogo atual trouxe duas prévias reais, também sem indexação. Respostas de ferramentas permanecem somente em memória, sem URL, storage, log, analytics, relatório ou associação a e-mail.

## Operação publicada e limites

- `BACKEND_MODE=off` e modos desconhecidos fecham; `FORM_MODE=demo` tem precedência, é local e nunca envia; `FORM_MODE=off` apenas desativa o fallback demo e deixa `BACKEND_MODE` e readiness decidirem. `pilot` conserva allowlists; `public` remove somente a antiga allowlist e mantém origem, IP, Turnstile, rate limits, validação e prontidão por fluxo. HMAC/replay autenticam fronteiras internas/jobs/webhooks, não visitantes.
- A produção atual é `BACKEND_MODE=public` + `FORM_MODE=off`, portanto os formulários reais continuam ativos e usam readiness/defesas public. Catálogo real e rotas públicas estão acessíveis; nenhum sucesso local fictício é apresentado.
- Capacidade local do Resend: 100 e-mails transacionais/dia UTC e 3.000/mês, compartilhados com reservas e tentativas; marketing até 1.000 contatos na conta Free. Baseline paginada até 100 por chamada atualiza a cada 4 horas e vence em 8 horas, com margem de 50, fencing por geração/epoch e fail-closed. Esses limites não garantem cotas globais nem custo zero. Cancelamento é independente de remetente, cota e Turnstile; Broadcast requer aprovação humana válida por 24 horas, consent epoch e reconciliação sem duplicar efeitos incertos.
- Renato responde pelo acompanhamento das cotas e guarda/descarte das cópias externas (backups, CSVs, mensagens e contatos nos provedores). A limpeza Firestore não alcança cópias exportadas. Não existe prazo universal aprovado para cópias externas; não inferir prazo legal, identidade jurídica ou base legal ausentes da página de Privacidade.
- Em 31/10, Renato confirmou os fluxos de diagnóstico, relatório ROSI, inscrição fora da antiga allowlist, confirmação, edição e cancelamento. Os quatro PDFs foram recebidos e validados no piloto restrito de 17–19/10; o rollout atual não repetiu esse ensaio. O teste editorial com Routine/Broadcast permanece pendente. Não reenviar edições antigas nem acionar contatos fora do grupo controlado.
- A autorização específica do plano Vercel Hobby foi declarada por Renato; não foi confirmada por documento independente. Hospedagem futura, migração, DNS, billing, Workers, analytics, CMS e indexação continuam fora do escopo.

O rollout não alterou PDFs, e-mails transacionais, edições existentes, marca oficial, originais ou licenças. O alias foi conferido; nenhum rollback foi executado.

## Histórico preservado

O piloto restrito de 19/10/2026 validou diagnóstico, quatro relatórios, newsletter manual e agendada, revisão/aprovação humana, publicação e envio, confirmação/reinscrição/cancelamento e backup/restauração de 72 documentos/16 coleções. O operador confirmou a primeira execução agendada, aprovação no Discord, prévia publicada e e-mail recebido em 19/10. Esse histórico não substitui o novo ensaio editorial público pendente.

As métricas antigas de frontend e integração (107/284+6 skips em 11/10; 495/290+6 skips em 13/10; 517/290+6 skips em 17/10) são históricas. Gates de 31/10 para a árvore integrada: 720 testes unitários e 438 E2E com 14 skips antes dos últimos ajustes; depois da correção global do CAPTCHA, lint, typecheck, 720 unitários, build e 4 E2E dedicados passaram. A suíte E2E completa não foi repetida após essa última alteração; não alegar os 438 como gate final da árvore publicada. Skips não são passes. A revisão independente não executou testes.

Spotcheck laboratorial de 31/10: Home LCP entre 2.565 e 3.089,5 ms e ROSI entre 2.879,5 e 3.802 ms em duas amostras por rota; TBT e LCP tiveram variância alta. A meta orientativa de 2,5 s não foi atingida. São medições de laboratório, sem evidência de INP de campo, hardware físico, certificação WCAG ou operação contínua. Evidências e limitações por tarefa permanecem no PLAN e nas auditorias locais.

### Referências locais

Por decisão do usuário, `references/` não é versionado. Capturas comparativas exigem restaurar exports locais. Fixtures necessárias aos testes unitários estão em `web/tests/fixtures/`.
