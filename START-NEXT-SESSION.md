# Prompt para iniciar a implementação do website

Abra uma nova conversa em `E:/Development/RootTrust/RootTrust/website-roottrust` e envie o texto abaixo. Este arquivo é apenas um prompt de entrada, não outro plano nem registro de tarefas.

---

Vamos implementar o PLAN.md aprovado em 30/10/2026. Você, Codex, será o orquestrador, integrador e revisor. O desenvolvimento será dividido com o Claude via MCP `claude-agent` conforme a seção 5 e as tags do plano. A retomada seletiva da ponte foi autorizada; a suspensão antiga não prevalece sobre essa decisão.

## Leitura inicial

Leia de fato, nesta ordem:
1. `AGENTS.md`.
2. `PLAN.md` completo, incluindo decisões D01–D19, mapeamento de agentes e gates.
3. `.claude/context-transfers/7c2f9a10.md`.
4. `docs/web/README.md`, `docs/web/design.md` e `docs/design/README.md`.

Depois, leia somente os arquivos e contratos necessários à tarefa corrente. `docs/design/brand-design.md` e `assets-catalog.md` são as fontes para cores, logos, grafismos e licenças; `docs/web/product.md`, `tools.md`, `newsletter.md` e `development.md` detalham os respectivos contratos. Consulte o plano arquivado apenas para evidência específica, sem recarregar todo o histórico. Não trabalhar em `roottrust-docs` nem usar frontend-slides: esta sessão é sobre o website Next.js.

## Execução e ferramentas

- Comece pela T1.1. Revalide branch, alterações locais e deployment; não suponha que a causa de `unavailable` já foi resolvida. PLAN.md é a única fonte de tarefas e status.
- Descubra as ferramentas MCP `claude-agent`: claude/claude-reply/claude-result/claude-cancel. Faça o preflight somente leitura previsto em T1.1 e confirme o modelo efetivo. Não havia ferramentas da ponte expostas na sessão de planejamento; se continuarem indisponíveis, avise e pergunte antes de substituir executor, instalar conector ou usar CLI/API paga.
- Sonnet (`sonnet`, referência atual 5.5) escreve apenas tarefas marcadas. Haiku (`haiku`, referência 5.5) faz inventários e documentação delimitada. Opus (`opus`, referência 5.5) é consulta excepcional, não etapa obrigatória. Fable excluído. Não inventar esforço MCP nem alterar defaults globais.
- Cwd do Claude é a raiz Git. Antes de escrita: dry-run de staging e inspeção de segredos/gerados, checkpoint WIP local autorizado e hash no plano. Uma escrita por vez, arquivos delimitados e leitura de AGENTS/PLAN/contratos obrigatória; nenhum segredo no prompt ou `.env*` aberto.
- Inclua em todo prompt da ponte a instrução de leitura e o rodapé headless exigidos por AGENTS/PLAN. Proíba efeitos externos, commit/push, instalações e alterações fora do escopo. Consulte resultado a cada 30–60 s até estado terminal; não editar durante escrita Claude. Limite/falha/timeout exige registrar, cancelar/confirmar estado e consultar se bloquear a tarefa; nada de fallback silencioso.
- Revise independentemente o diff do Claude e rode lint/typecheck/unit/build/E2E após cada entrega de escrita da ponte, conforme AGENTS; suíte focada nas iterações Codex não dispensa esses gates. Registre evidências e evite repetir a mesma rodada final sem alteração na árvore. O executor não é seu único revisor. Respeite consultas de revisão da ponte nos gatilhos obrigatórios, sem rodadas redundantes por arquivo.
- Use MCP Vercel para metadados e rollout autorizado, Cloudflare somente se pertinente à integração existente e `gh` CLI para GitHub. Sem leitura de valores secretos, mudanças de billing, DNS ou migração. Confira o plano efetivo/elegibilidade antes do rollout; não presumir exceção Hobby por chamar de demonstração nem contratar automaticamente.

## Skills

Aplique `$react-best-practices` no React/Next e `$web-design-guidelines` na revisão de interface. Use `$animate` quando alterar ciclo de vida/movimento; `$frontend-design` pode auxiliar o acabamento dentro da direção aprovada, sem redesign. Use `$grill-me` para dúvida real ou gate humano e `$write-plan` apenas se uma descoberta exigir mudança material no plano já aprovado. Leia cada SKILL.md antes do primeiro uso; não invoque todas indiscriminadamente. A ausência de uma skill não autoriza fingir que foi aplicada.

## Gates e limites

- Pare no gate A para meu aceite da Home/header/feedback nos dois temas antes de expandir para internas. Gate B exige minha revisão de Privacidade antes de abrir os destinatários. Aprovar o plano não aprova essas entregas futuras.
- Preserve fórmulas, resultados locais e privacidade das ferramentas; não reescreva PDFs, e-mails transacionais ou edições existentes. Mantenha serviços gratuitos com limites honestos, sem cobrança ou teste de esgotamento.
- Não reabra decisões D01–D19 nem a escolha da hospedagem definitiva. Não envie ensaios a inscritos reais; confirme destinatários controlados. Não faça commit final, push ou publicação fora das autorizações do plano.
- Faça uma única pergunta nativa por vez, com recomendação. Não repita no chat. Enquanto pendente, mantenha o turno aberto com espera interrompível de até 60 s; sem comentário nem mensagem final, inclusive vazia. Se não houver espera, informe a limitação antes da pergunta.

Inicie T1.1 com leitura e verificações necessárias; não reconstrua o planejamento nem peça novamente aprovação geral já concedida.
