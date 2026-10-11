# Desenvolvimento do frontend Root Trust em Next.js

**Aprovado pelo usuário:** “Aplique o plano”, 10/10/2026. **Estado:** execução. Este arquivo é a fonte única de tarefas e evidências. A aprovação visual da Home é obrigatória antes das páginas internas.

## 1. Problema e objetivo

Converter os 12 exports aprovados do Claude Design em frontend Next.js executável, fiel ao visual, conteúdo e comportamento, corrigindo as lacunas auditadas. Consolidar documentação sem perder contratos. Backend, CMS, e-mail, recebimento real de contatos, relatórios operacionais, hospedagem e deploy ficam para outra etapa.

## 2. Pesquisa e evidências

O repositório contém marca v2, contratos F01–F29, S01–S16 e N01–N11 e auditorias dos exports. No levantamento inicial ainda não havia aplicação npm ou testes; a fundação e a Home agora estão implementadas, com revisão P3.4 pendente. Node observado: 24.13.1; npm: 11.8.0. O runtime DC interpreta templates dinamicamente; sua substituição por JSX integra a migração. Three.js direto produz objetos; Canvas 2D produz hero/moldura/símbolos. A Home original tem `s.href`/`s.title` indevidos em `ETAPAS.map`; preservar original e corrigir somente cópia de comparação.

Fontes: [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [hidratação](https://nextjs.org/docs/messages/react-hydration-error), [instalação](https://nextjs.org/docs/app/getting-started/installation), [suporte](https://nextjs.org/support-policy), [React effects](https://react.dev/reference/react/useEffect), [Three cleanup](https://threejs.org/manual/pages/cleanup.html), [Vitest](https://nextjs.org/docs/app/guides/testing/vitest), [Playwright](https://nextjs.org/docs/app/guides/testing/playwright), [snapshots](https://playwright.dev/docs/test-snapshots), [Web Vitals](https://web.dev/articles/vitals), [agentes](https://learn.chatgpt.com/docs/agent-configuration/subagents).

A pesquisa observou Next 16.4.0/React 19.3, Three 0.184.0, Vitest 5.0.3 e Playwright 1.64.0. Revalidar registry, compatibilidade e advisories na instalação: versões pesquisadas não substituem a verificação. TypeScript 5.9.3 evita incompatibilidade observada entre TS 7 e parser ESLint. Firecrawl retornou falta de créditos; documentação oficial foi pesquisada pela web, sem alegar consulta Firecrawl bem-sucedida.

## 3. Decisões aprovadas

| ID | Decisão |
|---|---|
| D01 | Frontend completo primeiro; integrações e publicação adiadas. |
| D02 | Preservar 12 exports aprovados; corrigir bugs, contratos e acessibilidade auditados, sem redesenho. |
| D03 | Somente tema escuro nesta entrega. |
| D04 | Aplicação em `web/`; exports preservados em `references/claude-design/`. |
| D05 | Exatamente seis documentos canônicos em `docs/web`; excluir substituídos após migrar informação única. Preservar marca/assets. |
| D06 | GPT-6.1 Sol XHigh orquestra, mantém PLAN e decide escopo/arquitetura; todo desenvolvimento restante ocorre pelo MCP `claude-agent`, com Sonnet ou Haiku explícitos. Opus somente consulta complexa. Uma escrita ativa por vez; revisor independente. Atualizado pelo usuário em 10/10/2026; Fable excluído por indisponibilidade no plano Pro. |
| D07 | Aprovação humana da Home antes das internas; aceite humano final do conjunto. |
| D08 | `/privacidade` temporária, descrevendo honestamente a operação local. |
| D09 | Campos ativos, validação completa, preparados para futura integração. |
| D10 | Simulação local identificada de carregamento/sucesso/erro em modo demo/testes; nenhum envio real. |

## 4. Arquitetura, contratos e propriedade

Next App Router, React, TypeScript estrito, npm, CSS Modules e tokens CSS; Three.js direto. Sem R3F, Tailwind, runtime DC/CDN ou Cache Components. Conteúdo essencial em Server Components; fronteiras cliente pequenas para interação/gráficos. Primeiro render determinístico. Baloo 2 e Archivo via `next/font/local`, preservando OFL. Dependências e builds têm um único proprietário.

```text
PLAN.md
AGENTS.md
.codex/config.toml
.codex/agents/
.claude/settings.json
docs/design/
docs/web/{README,product,design,tools,newsletter,development}.md
references/{claude-design,audits,editorial}/
web/{src/app,src/components,src/features,src/lib,src/styles,public,tests}/
web/{package.json,package-lock.json}
.github/workflows/
```

### Rotas

`/`; `/servicos/ciberseguranca`; `/servicos/infraestrutura-em-nuvem`; `/servicos/desenvolvimento-de-software` (rótulo Software); `/ferramentas/rosi`; `/ferramentas/shadow-ai`; `/ferramentas/divida-tecnica`; `/ferramentas/migracao-para-nuvem`; `/newsletter`; `/newsletter/edicoes`; `/newsletter/edicoes/[slug]`; `/privacidade`; 404 nativa. Sem Sobre, hub de ferramentas ou diagnóstico dedicado.

### Formulários

`FORM_MODE=demo` ativa explicitamente simulação local em ambiente de revisão/testes. Sem configuração, nunca produzir sucesso simulado. Campos permanecem ativos, com validação, foco/erros associados, guarda contra envio duplicado e preservação após erro. Adaptador interno único separa UI da submissão futura. Diagnóstico exige Nome, Empresa e WhatsApp. Aviso junto ao formulário e confirmação informa “nenhum dado foi enviado”. Newsletter aceita solicitação de confirmação, sem declarar inscrição confirmada/endereço verificado/e-mail entregue. Relatório recebe contato e ID da ferramenta, nunca respostas/resultados. Nenhum endpoint operacional, persistência ou analytics nesta fase.

### Ferramentas, newsletter e gráficos

Modelos puros TS preservam F01–F29. Estado local descartado ao sair e limpo no retorno; sem URL/storage/logs/associação ao e-mail. Edição invalida resultado; troca 12/36 meses exige revisão, sem multiplicação automática. Shadow AI sem score. Vazio/desconhecido não são zero; preservar resultados negativos; tratar denominador zero e overflow explicitamente.

Newsletter: três amostras públicas, metadados/fontes/primeiro parágrafo completo; arquivo com dois itens por página e filtro reiniciando página 1. Preservar edição escolhida; inscrição geral escolhe mais recente. Slug inválido retorna HTTP 404 antes de streaming. Corpos completos ficam fora de HTML/RSC/JS/maps/assets; demos sem indexação.

Pausa global acessível durante a sessão SPA; redução de movimento dinâmica. Animar somente quando não reduzido, não pausado, aba visível e elemento relevante. Pausa/redução mantêm apresentação estática. Aba oculta suspende desenho e timers. Fallback usa asset aprovado sem reconstruir logo. Descarte explícito de GPU/listeners/loops e guarda contra inicialização assíncrona após desmontagem.

### Consolidação documental

`README`: índice/estado; `product`: brief/conteúdo/fluxos/serviços; `design`: visual/componentes/responsivo/movimento/a11y; `tools`: F01–F29/modelos/fixtures; `newsletter`: N01–N11/limites públicos; `development`: arquitetura/comandos/testes/agentes/integrações pendentes. Audits → `references/audits`; edições completas → `references/editorial`. Manter rastreabilidade F/S/N e distinção aprovado/proposta/demo/pendência/histórico. Excluir briefings/prompts/planos antigos após conferir cobertura. Atualizar links de AGENTS e marca sem reescrever o manual. Nenhuma limpeza ampla de `temp`.

### Agentes, modelos e operação da ponte Claude

Distribuição atual substitui Luna/Sol como executores futuros; nomes nas evidências concluídas permanecem históricos. Os perfis em `.codex/agents/` ficam preservados, sem uso para implementação nesta etapa. Não alterar modelos/permissões globais ou a assinatura do usuário.

| Responsabilidade | Modelo / permissão | Motivo |
|---|---|---|
| Orquestração, PLAN, despacho, critérios e decisões | GPT-6.1 Sol XHigh; `[codex]` | Coordenação e validação de evidências; não implementa código do site. |
| Inventário, cópias com hash, catálogo por allowlist, documentação factual | `haiku`; `[claude:escreve]` | Trabalho delimitado e verificável, sem criar regras de negócio. |
| Next/React, CSS, gráficos, modelos, testes, CI e correções | `sonnet`; `[claude:escreve]` | Trabalho com dependências, estado, matemática e lifecycle. |
| Revisão funcional, visual, matemática, privacidade e acessibilidade | `sonnet`; `[claude:consulta]`, sessão independente | Verificar contratos e diff com contexto suficiente, sem autorrevisão como aceite. |
| Impasse arquitetural/matemático ou falha crítica persistente | `opus`; `[claude:consulta]`, condicional | Segunda opinião pontual; GPT decide e Sonnet implementa. |

**Capacidade verificada em 10/10/2026:** o schema MCP aceita os aliases `haiku`, `sonnet`, `opus` e `fable`; **Fable é proibido neste plano**, pois o usuário não tem acesso no Pro. O schema não permite IDs arbitrários, `opusplan`, ajuste de esforço ou orçamento de tokens. Não inventar parâmetros low/high/XHigh para Claude. Modelos observados nesta conversa: Haiku `claude-haiku-4-5-20251001` e Sonnet `claude-sonnet-5`; registrar o `model` efetivo de cada chamada. Opus ainda não foi chamado; sua resolução/autorização local permanece não verificada. Alias aceito no schema não comprova acesso. Não gastar rodadas apenas para testar modelos; validar na primeira tarefa útil. Modelo inesperado: interromper antes de continuar a tarefa, registrar e informar; nunca fazer fallback silencioso.

Servidor denominado `claude-agent` nas instruções do usuário; ferramentas reais expostas neste ambiente: `mcp__claude_agent__claude`, `mcp__claude_agent__claude_reply`, `mcp__claude_agent__claude_result` e `mcp__claude_agent__claude_cancel`. Os nomes curtos `claude-reply`/`claude-result`/`claude-cancel` neste protocolo se referem a essas ferramentas; não são servidores adicionais.

**Atualização solicitada pelo usuário — versões atuais:** em 10/10/2026, a documentação oficial de configuração lista Sonnet 5.5, Haiku 5.5 e Opus 5.5; a CLI instalada é 2.1.296, acima dos mínimos publicados (2.1.284 / 2.1.293 / 2.1.280, respectivamente). Como a ponte só aceita aliases e anteriormente resolveu modelos mais antigos, `.claude/settings.json` define apenas os mapeamentos de família `ANTHROPIC_DEFAULT_*_MODEL` para `claude-sonnet-5-5`, `claude-haiku-5-5` e `claude-opus-5-5`, restritos a este projeto. Sem alterar permissões/configurações globais ou instalar/atualizar ferramentas. Esta configuração expressa o modelo solicitado, não comprova acesso: confirmar `model` efetivo no início de cada sessão; rejeição ou versão divergente exige cancelamento/registro e consulta ao usuário, sem fallback. Revalidar versões oficiais e acesso ao retomar outra fase, evitando manter pins antigos por inércia. Fable continua excluído.

Fontes oficiais: [configuração e resolução de aliases](https://code.claude.com/docs/en/model-config), [Sonnet](https://www.anthropic.com/claude/sonnet), [Haiku](https://www.anthropic.com/claude/haiku), [Opus](https://www.anthropic.com/claude/opus). A escolha acima é uma avaliação para este repositório; descrições comerciais e preço por token de API não estimam a cota Pro. A ponte informa `contextTokens`, não gasto total nem saldo do plano.

#### Protocolo obrigatório por tarefa

1. `[codex]` confirmar raiz com `git rev-parse --show-toplevel`, verificar dependência/estado e atribuir dono/arquivos. Nenhuma página interna antes do aceite P3.4. Preservar árvore suja e evidências existentes; não refazer P1/P2.
2. Antes de cada `[claude:escreve]`: executar `git add -A --dry-run` e inspecionar arquivos para segredos/gerados, sem imprimir conteúdo sensível. Se houver suspeita, parar e informar. Aplicar exclusões já previstas para builds/caches; não descartar trabalho anterior.
3. Criar ponto de restauração LOCAL: `git add -A` e `git commit -m "wip: pre-claude <passo>"` (`--allow-empty` se necessário). Exceção autorizada pelo usuário em 10/10/2026 inclui a árvore suja preexistente, após inspeção. Falha bloqueia escrita; registrar hash neste PLAN antes da chamada. Commit final, push, PR e deploy continuam exigindo autorização específica.
4. Abrir sessão nova `claude` com `cwd` na raiz e `model` explícito. `writable: true` somente em tarefa `[claude:escreve]` escrita aqui; omitir em consulta. Prompt curto: ID, objetivo, arquivos permitidos/proibidos, contratos, testes e formato da evidência. Sempre incluir: “Leia AGENTS.md, PLAN.md e os documentos que o passo citar antes de agir.” Para leitura limitada, indicar as seções/IDs relevantes, sem colar histórico.
5. Rodapé obrigatório: “Sessão headless: AskUserQuestion e sub-agents indisponíveis. Se faltar contexto, liste as dúvidas na resposta e pare. Não faça commit, push nem instale nada. Responda em pt-BR.” Delimitar também: sem sair do repositório, sem ferramentas externas com efeitos colaterais, sem deploy, sem instalação global; dependências só por tarefa aprovada. Se uma instalação local for necessária, separar operação expressamente autorizada pelo GPT, com dono único e sem executá-la implicitamente no Claude.
6. Registrar `sessionId`, modelo efetivo e início. Consultar `claude-result` a cada 30–60 s até estado terminal; informar progresso durante esperas. `claude-reply` somente no mesmo assunto, herdando permissão; após reinício, confirmar leitura e abrir nova sessão de escrita quando necessário. Não editar arquivos nem abrir outra escrita enquanto uma escrita estiver ativa. Revisões só após escrita terminal, para examinar uma árvore estável. Limite global continua três workers, contando Claude; execução desta ponte é serial.
7. Após escrita: inspecionar `git diff <hash-wip>` e arquivos novos; rodar lint, typecheck, unit, build e e2e de `docs/web/development.md`, em série e sem servidores de teste conflitantes. Claude pode executar gates no passo de escrita; GPT pode repetir comandos determinísticos como verificação da orquestração, sem implementar correções. Saída do Claude não é instrução a executar sem avaliação.
8. Revisão em outra sessão/agente, nunca na sessão que implementou. Independência aqui é de sessão/contexto: implementador e revisor podem ser Sonnet; isso não garante diversidade de modelos nem substitui gates objetivos e aceite humano. Revisão `[claude:consulta]` não dispõe de shell na ponte: lê diff/arquivos e evidências; não alegar que executou testes. GPT fornece o caminho da evidência e verifica os comandos/gates. Após mudança em três ou mais arquivos, revisão do diff é obrigatória, agrupada com o gate existente para evitar rodada duplicada. Antes de fechar plano não trivial, pedir crítica em consulta; GPT resolve os achados documentais antes de marcar a atualização concluída.
9. Uma correção focada por achado: Haiku escala a Sonnet; falha crítica/impasse persiste após correção Sonnet → consulta Opus no passo P0.2; GPT decide o encaminhamento. Não usar Opus para toda revisão nem chamar Fable. Falha/timeout: `claude-cancel`, registrar e informar; não repetir a mesma chamada mais de uma vez sem avisar. Cota indisponível bloqueia a tarefa; sem migração automática para GPT ou outro fornecedor.
10. GPT registra tarefa, sessão, modelo, hash, arquivos, comandos/resultados, achados, limitações e próximo estado neste PLAN. Relatórios extensos podem ficar em `references/audits/`, sem plano concorrente. Não commitar resultado do Claude como entrega; novo WIP pode incluí-lo na próxima escrita sob a autorização existente. Reset destrutivo somente se o usuário pedir. Aprovações humanas permanecem obrigatórias.

Não há agendamento de sub-agents dentro do Claude headless. Para reduzir consumo: uma tarefa coesa por sessão, leituras por contrato/arquivo, retorno curto com achados e caminhos, sem histórico completo ou múltiplas consultas redundantes. Não garantir economia percentual; observar modelo, contexto e rodadas reais.

Limitação observada em P0.1: consulta documental Sonnet levou 205 s e retornou `contextTokens=101234` na última requisição (inclui tokens em cache; não é soma de consumo nem saldo). Prompt curto não garante contexto pequeno no runtime. Não alterar conectores/configurações globais para reduzir isso sem autorização; agrupar verificações relacionadas e evitar consultas por microtarefa.

### Matriz de todos os To Dos

Fases concluídas não serão reexecutadas nem terão autoria histórica reatribuída. As tags abaixo definem a execução restante e futuras correções pertinentes.

| To Do | Executor / tag | Revisor e contexto mínimo |
|---|---|---|
| P0.1 Atualizar distribuição e instruções | GPT `[codex]` | Sonnet consulta; PLAN, AGENTS e development. |
| P0.2 Impasse complexo, somente quando acionado | Opus `[claude:consulta]` | GPT decide; achado reproduzível, contrato e alternativas. Sem escrita. |
| P0.3 Versões atuais e piloto | GPT `[codex]`; Sonnet `[claude:consulta]` em P3.4-P | Configuração local de aliases; validar modelo efetivo e aguardar decisão do usuário após uma tarefa. |
| P0.4 Bloqueio de arquivos .env* | GPT `[codex]`, por determinação do usuário | Preservar arquivos locais; excluir todos do versionamento, sem exceção para template. Nenhum Claude nesta correção. |
| P1.1 Registro do plano (concluído) | GPT `[codex]` | Preservar evidências. |
| P1.2 Inventário/assets (concluído) | Histórico; correções Haiku `[claude:escreve]` | Sonnet consulta; inventário, hashes e baseline. |
| P1.3 Consolidação documental (concluído) | Histórico; correções Haiku `[claude:escreve]` | Sonnet consulta; matriz F/S/N/D, sem reinterpretar contratos. |
| P1.4 Instruções/agentes (concluído) | Histórico; migração atual em P0.1 | Perfis Codex preservados; sem reconfiguração global. |
| P2.1 Bootstrap (concluído) | Histórico; correções Sonnet `[claude:escreve]` | Sonnet independente; development e fundação. |
| P2.2 Assets (concluído) | Histórico; correções Haiku `[claude:escreve]` | Sonnet; catálogo, allowlist e hashes. |
| P2.3 Shell/componentes (concluído) | Histórico; correções Sonnet `[claude:escreve]` | Sonnet; design, D09–D10 e testes afetados. |
| P2.4 Testes/formulários (concluído) | Histórico; correções Sonnet `[claude:escreve]` | Sonnet; adaptador, validação e provas dos gates. |
| P3.1 Gráficos em revisão | Sonnet `[claude:escreve]`, se houver correção | Sonnet independente em P3.4; lifecycle, GPU, shaders e baseline. |
| P3.2 Movimento em revisão | Sonnet `[claude:escreve]`, se houver correção | Sonnet em P3.4; pausa/redução/suspensão/fallback. |
| P3.3 Home em revisão | Sonnet `[claude:escreve]`, se houver correção | Sonnet em P3.4; design/product, Home e testes. |
| P3.4 Revisão e aceite Home | Sonnet `[claude:consulta]`; GPT/usuário `[codex]` | Sessão independente; comparação visual, gates e achados. Correções retornam P3.1–P3.3; usuário aprova. |
| P3.4-P Piloto: movimento/lifecycle | Sonnet `[claude:consulta]`; GPT verifica evidências `[codex]` | Uma tarefa de revisão estática, sem corrigir código ou concluir P3.4. Resultado apresentado antes de continuar. |
| P3.4-T Testes de movimento/fallback e evidência visual | Sonnet `[claude:escreve]` | Sonnet independente depois da escrita; testes reais Chromium, falhas reproduzíveis e comparação estática com baseline. Sem mudar direção visual. |
| P4.1 Três serviços | Sonnet `[claude:escreve]` | Sonnet P4.4; product S01–S16, exports e componentes existentes. Conteúdo contratual exclui Haiku como dono. |
| P4.2 Modelos puros | Sonnet `[claude:escreve]` | Sonnet P4.4; tools F01–F29, fixtures e unidades. Matemática não delegada ao Haiku. |
| P4.3 Quatro interfaces | Sonnet `[claude:escreve]` | Sonnet P4.4; modelos, estado local, formulários e exports. |
| P4.4 Revisão S/F | Sonnet `[claude:consulta]` | Sessão independente das implementações; gates e contratos. Correções retornam ao dono P4.1–P4.3. |
| P5.1 Catálogo público | Haiku `[claude:escreve]` | Sonnet antes de consumo público; newsletter N01–N11, allowlist e aberturas permitidas. |
| P5.2 Três páginas newsletter | Sonnet `[claude:escreve]` | Sonnet P5.4; newsletter, catálogo revisado, filtros/edição escolhida. |
| P5.3 Privacidade/metadata/404 | Sonnet `[claude:escreve]` | Sonnet P5.4; development/product, HTTP 404, noindex e privacidade real. |
| P5.4 Revisão pública | Sonnet `[claude:consulta]` | Sessão independente; HTML/RSC/JS/maps/assets e evidências de inspeção. |
| P6.1 CI local | Sonnet `[claude:escreve]` | Sonnet independente; scripts, lockfile, Node e workflow sem deploy. |
| P6.2 QA integral | Sonnet `[claude:consulta]`; GPT executa gates `[codex]` | Revisor distinto; artefatos de browser, visual, matemática e medições. Novos testes/correções via dono de escrita original. |
| P6.3 Aceite/entrega | GPT + usuário `[codex]` | Haiku escreve apenas documentos/evidências em P6.3-D; Sonnet revisa diff. |
| P6.3-D Documentação final | Haiku `[claude:escreve]` | Após P6.2, antes do aceite final: seis docs/evidências, sem código nem alteração de escopo. GPT arquiva PLAN somente após aceite. |

## 5. Fases, tarefas e Acceptance Criteria

### Fase 0 — Troca de executores, sem reiniciar desenvolvimento

#### P0.1 Atualizar plano e instruções — [codex]
Dependência: solicitação atual do usuário. Dono GPT; alterações limitadas a PLAN, AGENTS e development.
- [x] Modelos por tarefa definidos, Fable excluído e limitações reais da ponte registradas.
- [x] Preservar tarefas concluídas, contratos, dependências e aprovação humana da Home.
- [x] Crítica independente Sonnet em somente leitura e revisão dos três documentos; GPT resolveu os quatro achados documentais após o retorno.
- [x] Modelo efetivo e sessionId da crítica registrados; nenhum código do site alterado.

#### P0.2 Consultoria complexa condicional — [claude:consulta] Opus
Dependência: impasse documentado após uma correção Sonnet, ou decisão arquitetural complexa levantada pelo GPT.
- [ ] Quando acionado: registrar problema, alternativas, sessão/modelo e recomendação; GPT decide sem ampliar escopo implicitamente.
Não é bloqueador obrigatório: permanecer “não acionado” quando não houver impasse; sem chamada só para testar disponibilidade.

#### P0.3 Atualizar versões e validar uma tarefa — [codex]
Dependência: solicitação do usuário para modelos atuais e um piloto antes da continuação completa.
- [x] Fonte oficial e CLI local verificadas; mapeamento de família restrito a `.claude/settings.json`, sem Fable/permissões novas.
- [x] Modelo efetivo Sonnet 5.5 confirmado pelo MCP na tarefa piloto; Haiku/Opus 5.5 ainda sem chamada.
- [x] Resultado, limites e próximos passos registrados em `references/audits/claude-home-motion-pilot.md`.
- [x] Usuário validou piloto: “Pela minha análise tudo correu bem. Siga com o resto das outras tasks.” (10/10/2026). Isso não aprova visualmente a Home.

#### P0.4 Resolver arquivos .env* mantendo o bloqueio — [codex]
Dependência: instrução do usuário “Mantenha esse bloqueio por agora, resolva essas questões relacionadas a .env* com os modelos do GPT”. Esta correção é exclusiva do GPT; não autoriza Claude a ler/editar esses arquivos.
- [x] Confirmado: nenhum `.env*` já versionado; único template identificado é `web/.env.example`, sem dependência/referência obrigatória no código ou docs.
- [x] `.gitignore` usa `.env*`, sem exceção. Template preservado no disco, ignorado por Git; nenhum conteúdo/configuração local removido ou enviado ao Claude.
- [x] Oito verificações de ignore passaram; arquivo normal da aplicação continua versionável. Template preservado; nenhum `.env*` já rastreado. Dry-run: 243 entradas, zero caminhos sensíveis/gerados detectados; busca de padrões de chaves/tokens sem correspondências.
- [x] Resultado registrado; regra de parada mantida caso um arquivo sensível volte a aparecer no checkpoint. Git ignore controla versionamento, não é sandbox de acesso; Claude continua fora do escopo `.env*`.

### Fase 1 — Referências e documentação

#### P1.1 Registrar plano e estado — orquestrador
Dependência: aprovação do usuário. Registrar plano aprovado e alterações anteriores.
- [x] Decisões, tarefas, dependências e critérios persistidos.
- [x] Estado Git anterior identificado; nenhuma alteração preexistente descartada.

#### P1.2 Preservar exports e baseline — Luna Low; correção técnica Sol Medium
Dependência: P1.1. Mover exports com inventário e criar cópia de comparação.
- [x] Doze HTML e dependências preservados com hashes antes/depois e caminhos relativos funcionais.
- [x] Home original intacta; cópia de comparação corrige somente `s` indefinido, com diff registrado.
- [x] Cópia executa sem erro `Home.renderVals` conhecido.

#### P1.3 Consolidar seis documentos — Luna High
Dependência: P1.2. Migrar contratos e eliminar redundâncias.
- [x] Exatamente seis docs; F/S/N, copy, fluxos e auditorias com origem/destino verificáveis.
- [x] Exclusões somente após cobertura de requisitos únicos; links válidos, inclusive marca.

#### P1.4 Configurar agentes e revisar contexto — Sol Medium; revisor Sol High
Dependência: P1.3. Atualizar instruções/propriedade e verificar consolidação.
- [x] Perfis explícitos, máximo três workers, AGENTS atualizado e regras de autorização preservadas.
- [x] Revisão independente sem perda de contratos ou conflito de autoridade.

### Fase 2 — Fundação Next

#### P2.1 Bootstrap — Sol Medium integrador
Dependência: P1.4. Inicializar aplicação mínima na stack aprovada.
- [x] Compatibilidade/advisories/Node verificados; lockfile, TS estrito e ESLint presentes.
- [x] Scripts reais dev/build/start/typecheck/lint; sem sobrescrever instruções ou adicionar tecnologias não aprovadas.

#### P2.2 Assets — Luna Low e integrador
Dependência: P2.1. Publicar apenas cópias necessárias com proveniência.
- [x] Fontes/assinaturas/grafismos corretos locais, OFL incluídas e allowlist pública registrada.
- [x] Sem uploads privados, identidade antiga ou alteração de assets originais.

#### P2.3 Shell e componentes — Sol Medium
Dependência: P2.2. Estrutura SSR, navegação e fundamentos de interface.
- [x] Destinos corretos; menu teclado/Escape/devolução de foco.
- [x] Campos semânticos com labels/tipos/autocomplete/erros; 320px sem overflow.

#### P2.4 Testes e formulários demo — Sol Medium + QA
Dependência: P2.3. Vitest Node e Playwright contra produção; contrato D09–D10.
- [x] Scripts e smoke executáveis com build/start de produção.
- [x] Validação/loading/sucesso/erro explícitos, sem rede/persistência; sem configuração não há falso sucesso.
- [x] Configuração local e testes documentados.

### Fase 3 — Gráficos e Home

#### P3.1 Portar gráficos — [claude:escreve] Sonnet, somente correções restantes
Dependência: P2.4. Preservar formas, materiais e shaders em lifecycle React.
- [ ] Sem canvas/listeners/loops duplicados na montagem/desmontagem.
- [ ] GPU/recursos compartilhados descartados; import/fontes tardios não ressuscitam componente.
- [ ] Falha de inicialização/perda de contexto exibem fallback.

#### P3.2 Movimento acessível — [claude:escreve] Sonnet, somente correções restantes
Dependência: P3.1. Completar pausa e suspensão dinâmica.
- [ ] Pausa visível, redução dinâmica, suspensão de aba oculta/elemento fora de tela.
- [ ] Conteúdo/CTA utilizáveis sem gráficos; estado estático legível.

#### P3.3 Home nativa — [claude:escreve] Sonnet, somente correções restantes
Dependência: P3.2. Portar todas as seções e corrigir auditoria.
- [ ] Desktop/mobile fiéis; seletor/processo/terminal acessíveis por teclado.
- [x] Links de serviços/ferramentas/arquivo corretos; formulário D09–D10.
- [x] ROSI descrito como simulador financeiro, sem runtime DC ou erro de hidratação.

#### P3.4 Validar Home e obter aceite — [claude:consulta] Sonnet independente; [codex] GPT + usuário
Dependência: P3.3.
- [x] Build/lint/tipos/testes; capturas por seção e inspeção amostral desktop/mobile, diferenças e limites em `references/audits/home-qa.md`.
- [ ] Desktop/mobile/teclado/pausa/redução/fallback verificados.
- [x] **Usuário aprovou Home: “Sim, aprovo a home”, 10/10/2026. P4/P5 liberados.**

#### P3.4-P Piloto de revisão movimento/lifecycle — [claude:consulta] Sonnet
Dependência: P0.3 (versões verificadas/configuração solicitada) e implementação P3.1–P3.3 existente. Esta tarefa é um recorte de P3.4, não substitui comparação visual, QA integral ou aceite humano. Nenhuma escrita Claude; nenhum checkpoint WIP necessário.
- [x] Revisar GraphicsProvider, animation, HomeCanvas, PillarArt, SymbolAscii, pillar-runtime, Terminal e testes relacionados: pausa, redução dinâmica, aba oculta, interseção, inicialização tardia e descarte.
- [x] Achados com caminho/linha, mecanismo e gravidade; separar fatos do código de hipóteses e cobertura ausente. Nenhum teste de browser declarado executado pelo revisor.
- [x] GPT confrontou achados e corrigiu afirmação incorreta sobre cobertura: recursos/context-loss já têm testes. Lint/typecheck/unit/build/e2e passaram; nenhuma correção de código nesta rodada.
- [x] Relatório salvo em `references/audits/claude-home-motion-pilot.md`; sequência bloqueada até validação do usuário.
- [x] Usuário validou resultado do piloto em 10/10/2026; isso não equivale ao aceite visual da Home.

#### P3.4-T Completar QA de movimento/fallback e evidências visuais — [claude:escreve] Sonnet
Dependência: piloto aprovado; P3.1–P3.3 implementados. Dono Sonnet; arquivos permitidos: `web/tests/e2e/`, `web/tests/unit/graphics/`, correções mínimas reproduzíveis em `web/src/features/graphics/` e evidência em `references/audits/home-qa.md`/`references/audits/home-qa/`. Sem modificar PLAN, marca, exports, formulários, dependências ou páginas internas. Não ler/editar `.env*`.
- [x] Adicionar regressões úteis de redução dinâmica, pausa, fallback de inicialização/perda de contexto e suspensão; distinguir simulações de visibilidade de testes reais de aba.
- [x] Corrigir somente bugs reproduzidos nos gráficos, preservando composição e controles; nenhum bug de produção confirmado, sem alteração em web/src.
- [x] Executar lint/typecheck/unit/build/e2e em série; 45 capturas desktop/mobile, limites/diferenças documentados. Sem comparação pixel a pixel.
- [x] Revisão Sonnet independente aprovada após correção do servidor de capturas.
- [x] Aceite humano da Home obtido em 10/10/2026; P4/P5 liberados.

### Fase 4 — Serviços e ferramentas (após aceite da Home)

#### P4.1 Três serviços — [claude:escreve] Sonnet
Dependência: P3.4. Portar três rotas, seis seções, quatro frentes.
- [x] Restaurar vulnerabilidades/Red Team/compliance; preservar limites contratuais de Pentest/reteste/suporte.
- [x] Sem novos pilares, provas ou promessas; componentes/formulários/gráficos comuns; moldura e símbolo CTA restaurados após revisão.

#### P4.2 Modelos puros — [claude:escreve] Sonnet
Dependência: P3.4. Extrair modelos F e fixtures independentes.
- [x] Vazio/desconhecido/zero diferenciados, divisão zero/não finitos tratados; Shadow sem score.
- [x] 69 testes unitários passando, confirmados GPT; revisão independente Sonnet e Opus no impasse de precisão concluídas. Limite IEEE754 documentado.

#### P4.3 Quatro interfaces — [claude:escreve] Sonnet
Dependência: P4.2. Entradas/resultados compactos e revisão.
- [x] Calcular/editar/limpar; horizonte invalida; sair/retornar limpa respostas (pageshow persistido testado por simulação, BFcache real não certificado).
- [x] Nenhuma resposta em URL/storage/logs/submissão; relatório e newsletter independentes.

#### P4.4 Revisão — [claude:consulta] Sonnet independente
Dependências: P4.1 e P4.3.
- [x] Contratos S/F, fixtures independentes e jornadas conferidos; três revisões focadas após escrita, sem bug bloqueador restante.
- [x] Nenhum envio/persistência de respostas; revisão de código e testes locais, limites em tools-native.md.

### Fase 5 — Newsletter e rotas (após aceite da Home; independente da fase 4 até P5.2, execução Claude serial)

#### P5.1 Catálogo público — [claude:escreve] Haiku
Dependência: P3.4.
- [x] Slugs/datas/pilares/fontes/abertura e links preservados; nenhum corpo completo.
- [x] Edições extras somente em fixtures de teste.
- [x] Revisão Sonnet independente23c26e7b-8401-4935-99c6-5c41a3de4b7d aprovou allowlist; GPT confirmou94unit e hashfonte.

#### P5.2 Três páginas — [claude:escreve] Sonnet
Dependência: P5.1.
- [x] Apresentação completa; filtro reinicia paginação, dois itens/página.
- [x] Prévia/retorno/edição escolhida corretos; demos identificadas; aceito não significa confirmado.

#### P5.3 Privacidade, metadata e 404 — [claude:escreve] Sonnet
Dependências: P4.3 e P5.2.
- [x] Privacidade provisória verdadeira; títulos/descrições; HTTP 404 real para URLs válidas inexistentes; saída para Home. Codificação malformada: risco framework registrado.
- [x] Sem links vazios; demos sem indexação.

#### P5.4 Revisão pública — [claude:consulta] Sonnet independente
Dependência: P5.3.
- [x] Jornadas N verificadas; catálogo por allowlist, imports/build sem referências privadas; inspeção complementar em QA.
- [x] Aviso de indisponibilidade antes do submit inclusive support personalizado; nenhum estado alega inscrição/envio operacional.

### Fase 6 — Validação final

#### P6.1 CI GitHub — [claude:escreve] Sonnet
Dependências: P4.4 e P5.4.
- [ ] npm ci/lint/typecheck/unit/build/e2e, Node consistente, falhas vermelhas, sem segredo/deploy.
- [ ] Equivalente local validado; CI remota só declarada após push autorizado e execução real.

#### P6.2 QA integral — [claude:consulta] Sonnet independente; [codex] gates determinísticos
Dependência: P6.1.
- [ ] Chromium desktop/mobile completo, Firefox/WebKit smoke; 320px/zoom/foco/teclado/erros.
- [ ] Sem runtime/hidratação/recursos órfãos; desempenho medido com ambiente/limites e desvios resolvidos ou explicitamente decididos.

#### P6.3 Aceite e entrega — [codex] GPT + usuário
Dependência: P6.2.
- [ ] Usuário aprova conjunto; docs registram comandos/versões/limites e futuras integrações.
- [ ] Todas tarefas com evidência; somente após aceite final arquivar PLAN em docs/plans.
- [ ] Nenhum commit/push/PR/deploy sem autorização específica.

#### P6.3-D Documentação da entrega — [claude:escreve] Haiku
Dependência: P6.2; concluir antes do aceite final P6.3. Limitar a documentação e evidências, sem alterar produto ou implementação.
- [ ] Comandos/versões/limites reais atualizados; nenhum gate não executado declarado como sucesso.
- [ ] Diff revisado por Sonnet em sessão independente; GPT registra resultado e pede aceite final.

## 6. Testes e validação

Vitest Node para lógica real; Playwright com `next build`/`next start`. Chromium 1440×1000 e 390×844, Firefox/WebKit smoke; 320px e zoom 200%. Rotas diretas/cliente, HTTP404, console/hidratação, formulários, descarte de estado, filtros e ausência de rede/storage. Gráficos: redução inicial/dinâmica, pausa, aba oculta, fora de tela, desmontagem tardia e perda de contexto.

Fixtures: ROSI 200mil × 0,5 × 60% × 9/12 = benefício45mil; custo30mil → líquido15mil, ROSI50%, equilíbrio40%. Custo zero → retorno indefinido; mitigação desconhecida → somente equilíbrio; atraso12 → benefíciozero e ROSI−100% com custo positivo; preservar equilíbrio>100%. Dívida: 8×10000×0,4×0,25 = 8000/mês, 96000/ano. Migração120mil versus90mil+20mil → diferença10mil/8,33%; basezero sem percentual; horizonte requer revisão. Shadow incompleto bloqueado, sem score. Parser pt-BR, vazio/desconhecido/zero, limites, subtotal incompleto e overflow.

Visual: viewport/DPR/fontes/scroll/ponteiro fixos; captura estática ou máscara somente do desenho dinâmico, com inspeção ativa. Desativar CSS não congela Canvas. Comparação por seção, sem exigir igualdade pixel a pixel entre runtimes. Lighthouse local em Home/serviço/ferramenta/newsletter: três rodadas e mediana; LCP/CLS/TBT/tamanho JS e ambiente. Metas orientativas LCP≤2,5s/CLS≤0,1; não certificar INP com TBT nem desempenho real sem campo.

## 7. Riscos e mitigação

Perda documental → matriz de cobertura e revisão antes de excluir. Home quebrada → original imutável e baseline corrigida mínima. Vazamento editorial → allowlist e inspeção de build. Recursos gráficos órfãos → lifecycle/ownership/testes. Falso envio → demo explícita, sem sucesso por default. Conflitos → dono único/instalações serializadas. Dependências → rechecagem de advisories/lockfile. Divergência visual → aceite Home e conjunto. Aparelhos físicos e operações reais não são certificados por testes locais.

**Bootstrap, 10/10:** `npm audit` identificou cinco ocorrências high propagadas por um advisory de `braces <=3.0.3` na cadeia de desenvolvimento ESLint/fast-glob/micromatch. O integrador verificou ausência de patch publicado naquele momento; não aplicar downgrade forçado do Next. Registrar ID, cadeia e resultado `--omit=dev` na auditoria da fundação. Desenvolvimento local continua no escopo aprovado; reavaliar lockfile/advisories antes da publicação futura.

## 8. Progresso e evidências

Estados: pendente, em execução, em revisão, aguardando usuário, concluído. Não marcar fases futuras concluídas por preparação parcial.

| Tarefa | Estado | Evidência / responsável |
|---|---|---|
| P0.1 | Concluído | PLAN/AGENTS/development alinhados. Crítica Sonnet independente concluída: sem conflito factual grave; quatro ajustes resolvidos pelo GPT (independência de sessão, Fase 5 serial, nomes completos MCP, fechamento pós-crítica). 26 IDs únicos com referência na matriz/evidências; nenhuma mudança no código do site. |
| P0.2 | Não acionado | Opus apenas para impasse complexo; sem sessão aberta. |
| P0.3 | Concluído | CLI 2.1.296; mapeamentos locais 5.5. Sonnet 5.5 efetivo confirmado; Haiku/Opus sem teste. Usuário validou piloto e autorizou continuidade em 10/10/2026. |
| P0.4 | Concluído | GPT manteve bloqueio, removeu exceção `.env.example` e usou ignore `.env*`. Oito verificações passaram; template local preservado, zero `.env*` rastreados; dry-run 243 entradas sem caminhos sensíveis/gerados detectados. Sem chamada Claude, staging real ou commit nesta correção. |
| P1.1 | Concluído | PLAN persistido; git status anterior: AGENTS e quatro docs/design alterados, três planos antigos e docs/web/web pendentes; nada descartado. |
| P1.2 | Concluído | 158 arquivos / 11.176.670 bytes / 12 HTML preservados, hashes iguais em references/audits/export-inventory.json. Baseline com correção única de 53 bytes; Chromium 1440×1000, H1 renderizado, dez canvas e zero pageerror; relatório home-baseline.md. |
| P1.3 | Concluído | Seis docs; 13 fontes substituídas e três planos removidos após cobertura. Matriz em references/audits/documentation-migration.md; marca/assets preservados. |
| P1.4 | Concluído | review_frontend_plan (Sol High) confirmou contratos F/S/N/D, nove regras, 158 hashes; 572 links/âncoras em 18 docs sem erro. D06 atualizado para Sol XHigh por instrução do usuário. |
| P2.1 | Concluído | Next 16.4 / React 19.3 / TS 5.9.3, lockfile e scripts reais; build/lint/typecheck passaram. Audit em references/audits/frontend-foundation.md. |
| P2.2 | Concluído | Quatro assets necessários + duas fontes/duas OFL; oito cópias com hashes iguais. Allowlist/proveniência em references/audits/public-assets.json. |
| P2.3 | Concluído | Shell/formulários e menu desktop/mobile; conflito de especificidade no CTA mobile corrigido, teste 320px menu/erros sem overflow (2/2). Home completa será revalidada. |
| P2.4 | Concluído | Validadores corrigidos após revisão: Vitest 8/8, build final e e2e afetados 6/6; 320px 2/2. Revisor confirmou Enter sem JS não envia dados/não altera URL e guardas de duplicidade/desmontagem. Correção menor de fechar menu pelo logo será integrada à P3.3. |
| P3.1–P3.2 | Em revisão | Canvas/Three e movimento implementados. Revisão independente corrigiu atuação após dispose; sete testes gráficos passaram, incluindo perda de contexto/troca/descarte com uma geometria criada e descartada, sem recriação. Verificação real no navegador integra P3.4. |
| P3.3 | Em revisão | Home completa integrada; lint/type/build passaram, Vitest 15/15, foundation e2e 12/12 e Home 4/4. Produção demo em http://127.0.0.1:3100/; padrão em :3101/. |
| P3.4 | Concluído | Usuário: “Sim, aprovo a home”, 10/10/2026. Revisão Sonnet independente e gates concluídos; P4/P5 liberados. Lacunas navegador real/SPA e QA integral permanecem obrigatórias em P6. |
| P3.4-P | Concluído | Consulta Sonnet 5.5 concluída; parecer conferido, cobertura corrigida pelo GPT. Lint/typecheck/build e 15 unitários/16 e2e passaram. Usuário validou piloto em 10/10/2026. Sem aceite visual P3.4. |
| P3.4-T | Concluído | Dois testes, relatório/45 capturas; sem alteração web/src. Gates originais confirmados GPT: 15 unitários/32 E2E. Correção focada: gates Sonnet 15 unitários/34 E2E+4 skips; novo teste HTTP confirmado GPT 2/2. Revisão independente e aceite Home concluídos. |
| P4.1 | Concluído | Sessão d9fac3af-1e3e-4e4d-b414-0980b0744b55: três serviços SSR,15unit/54E2E+4skip e lint/type/build; revisão 0981b385-3269-47ef-a462-980021713fee aprovou lifecycle/contratos/composição após correção (301s escritor,22s revisor). Revisor não releu testes/audit no follow-up; rechecagem integral em P4.4. |
| P4.2 | Concluído | cd309153-1f7a-40de-bad1-00a0a9dcf69c Sonnet5.5, correção final104s:69unit/54E2E+4skip,lint/type/build. GPT confirmou69unit. RevisorOpus2aa28270-6bc2-4c09-aac8-2aba6b74cead follow-up17s aprovou4EPS e regressões; limiteIEEE754 registrado em tools-models.md. |
| P4.3–P4.4 | Concluído | Quatro interfaces,82→86unit/108→110E2E+4skip e lint/type/build. GPT86unit/54E2E ferramentas confirmados. Escritorbed215fd follow-ups300s/132s, revisor ea77d follow-ups37s/11s aprovou fechamento. F28/serialização/aux/foco/sinais corrigidos; revisões independentes e limites em tools-native.md. |
| P5.1 | Concluído | Haiku5.5 sessão6c1f3a8e-2f47-40c6-909a-3faeb5af3932 succeeded187s:94unit/110E2E+4skip lint/type/build. Sonnet5.5 revisão23c26e7b-8401-4935-99c6-5c41a3de4b7d succeeded18s aprovou. GPT94unit/hash confirmados. |
| P5.2–P5.4 | Concluído | P5.3 gates GPT101unit/148E2E+4skip; correção19ebf5fb Sonnet5.5 succeeded254s mesmos gates; revisor independente aaa7c823 follow-up32s aprovou. Limites em newsletter-native/public-routes. |
| P6.1–P6.3 | Pendente | — |
| P6.3-D | Pendente | Documentação Haiku após QA; revisão Sonnet antes do aceite. |

### Registro de sessões da ponte

**Pré-checagem de retomada (10/10/2026):** antes da primeira escrita Claude, `git add -A --dry-run` listou 244 entradas e acionou a regra de parada por `web/.env.example`. Leitura local sem expor valores confirmou que o template contém somente `FORM_MODE` no formato aprovado; não é credencial. A regra fornecida pelo usuário menciona `.env*`, sem exceção explícita para esse template. Nenhum WIP/staging real ou sessão de escrita foi iniciado. Naquele momento a execução parou para decisão, registrada abaixo; não afrouxar a detecção de arquivos com credenciais.

**Decisão posterior:** usuário recusou exceção e determinou tratamento `.env*` exclusivamente pelo GPT (P0.4). Preservar o bloqueio; todos esses arquivos ficam fora do checkpoint, inclusive templates. Nenhuma ferramenta Claude foi chamada para essa correção.

**Validação P0.4:** `.gitignore` agora ignora `.env*` em qualquer profundidade, sem exceções. Oito nomes representativos foram verificados com `git check-ignore --no-index`; `web/package.json` continua fora do ignore e o template local permanece no disco. Zero `.env*` rastreados. Novo dry-run listou 243 entradas, sem arquivos sensíveis ou saídas geradas detectados; busca de padrões de chaves privadas/tokens sem correspondências. Isso não é prova universal de ausência de segredos nem restrição de acesso do processo Claude: futuras chamadas continuam proibidas de ler/editar `.env*` por escopo, e a pré-checagem permanece obrigatória antes de cada escrita. Nenhuma escrita Claude foi iniciada nesta rodada.

Cada escrita exige linha com hash WIP antes da chamada. Consultas usam “não aplicável”. Atualizar ao terminar, sem criar controle paralelo.

| Tarefa / tipo | Alias / modelo efetivo | sessionId | Hash WIP | Estado / evidência |
|---|---|---|---|---|
| P3.4-T testes/QA / escrita | sonnet / claude-sonnet-5-5 | 7b343f20-f2db-42c4-8644-7fc5dbb3ca0a | c4dd2f7971992239523a3611a1391b3cbeeb4dfe | succeeded; 618 s; compactedThisTurn=true; última entrada85533 tokens incluindo cache. Dois testes novos, relatório,45 JPGs+2JSONs. Nenhuma alteração de produção. Sem push/commit final; revisão independente a seguir. |
| P0.1 crítica e diff / consulta | sonnet / claude-sonnet-5 | 6a09bc16-d705-4ec6-a062-4f4f8de1dd90 | Não aplicável | succeeded; 205 s; última entrada 101234 tokens incluindo cache. Aprovação condicionada aos ajustes 1–2, aplicados; sugestões 3–4 também resolvidas. Sem shell/testes pelo revisor. |
| P3.4-P piloto / consulta | sonnet / claude-sonnet-5-5 | 11ffc75e-ec74-4196-8377-c11c669a2e2d | Não aplicável | succeeded; 100 s; última entrada 91925 tokens incluindo cache. Quatro observações menores, sem bug crítico comprovado; afirmação de cobertura corrigida na conferência. 15 unitários/16 E2E e demais gates passaram pelo GPT. Aguardando validação do usuário. |
| P3.4-P revisão dos três arquivos / follow-up mesma tarefa | sonnet / claude-sonnet-5-5 | 11ffc75e-ec74-4196-8377-c11c669a2e2d | Não aplicável | succeeded; 16 s; última entrada 106090 tokens incluindo cache. Configuração, registro e relatório aprovados sem correções factuais obrigatórias; retratação de cobertura reconhecida. 28 IDs únicos e JSON verificados pelo GPT. |

SQL/session-store não disponíveis nesta sessão: este PLAN é o registro único, sem banco artificial ou cópia concorrente.

**P5.2 resultado/P5.3 início:** escritord29cba37-d561-40d0-8435-cb3b8815f814 Sonnet5.5 succeeded425s,101unit/136E2E+4skip,type/build; lintfalhou por linkHomepreexistenteagora detectado(nova rota). Não é bloqueio comercial: P5.3 autoriza correção mínima `<a>`→`Link` naHome, sem mudança visual, alémprivacidade/404/metadata/testes. CheckpointWIP `cd5f154ec121c926b42034995b2c92d970ead814`, pré-checagem sem segredos/gerados; revisãoP5.4 cobrirá P5.2/P5.3 juntos após escrita.

**P5.2 início:** checkpointWIP `8be2c0359e83347ec5608cf6ba7b0716d92c8063`; sem segredos/gerados. Dono Sonnet rotas/newsletter,features/newsletter (catálogo preservado), extensão mínima NewsletterForm para destino/copy aprovados, testes e audit/newsletter-native.md. Reusar gráficos existentes, semcorposcompletos/env/deps/export/marca/Home. P5.3 privacidade/404 final será tarefa seguinte.

**P5.1 início:** checkpointWIP `f3a128ae23b0d02d33e49abee2a2b84f1f75c0ee`, sem sensíveis/gerados. Dono Haiku catálogo público tipado features/newsletter/catalog.ts,unit/newsletter/catalog.test.ts,audit/newsletter-catalog.md. Fonte exclusiva pública references/claude-design/newsletter-edicoes.js, sem ler/copiar corpos completos/editorial/uploads. ModeloHaiku5.5/acesso confirmar primeira tarefa útil, semfallback.

**P4.3 fechamento:** correção escritorbed215fd succeeded300s,82unit/108E2E+4skip; GPT confirmou82unit/54E2E ferramentas. Revisorea77d succeeded37s aprovou F11/F15/F16/F24/F27/F29 e services.spec/audit; F28 ajuda de cobertura ausente. GPT encontrou exactText com maximumFractionDigits100 convertendo1e-200em0. Última correção delimitada mesmosarquivos (format/MigrationTool/testes/audit), checkpoint `b4d0fbccc66c772d2fb4806cb8b460f9c8d02b6a`; usar dígitos significativos em serialização e testar subnormal/limites IEEE754. Não alterar modelos.

**P4.3 início:** checkpoint WIP `db9e594804df19cbb2b535b1e61873db05c32b18`, pré-checagem sem segredos/gerados. Dono Sonnet interfaces/dados/CSS features/tools (modelos já aprovados, correção mínima somente se bug demonstrado), quatro rotas ferramentas, ReportForm local e testes/evidências correspondentes. Reutilizar FrameCanvas/PillarArt/adaptador. Sem dependências/env/exports/marca/Home/serviços/PLAN.

**P4.3/P4.4 correção focada:** escritorbed215fd-28cd-431e-9d51-aefa679d16e9 Sonnet5.5 succeeded670s,69unit/100E2E+4skip. Revisorea77d631-7d51-42ae-9d13-74c5a42fe1a5 succeeded66s encontrou transferênciaaux arredondada, erroShadow silencioso e selo de formulário impreciso. GPT acrescentou validação/foco dos auxiliares, sinais pequenos e teste sintético pageshow; restaurar ajuda cenários export. Mesmo dono, checkpointWIP `24bb735fa014de5bcf240893cc9ea0e73d6dfbeb`. Revisor não conferiu fórmulas/exports/serviçostests nesta rodada; rechecagem específica pendente antes de concluir P4.4.

**P4.2 ajuste indicado P0.2:** checkpoint WIP `606582b6a9e416c90c4ed9d9086f817c66f7f81f`, escopo já aprovado modelos/testes/audit. Follow-up mesmo dono Sonnet, revisão final agrupada P4.4; nenhuma entrada real armazenada.

**P4.2 início:** checkpoint WIP `8cbd155dd870ff14dc13b90a6ef7bf7c4856010c`; pré-checagem sem segredos/gerados. Dono Sonnet para modelos/parsers TS puros em features/tools/models, testes unit/tools e audit/tools-models.md; interfaces ficam P4.3. Sem alterações de dependências/env/export/marca/Home.

**P4.2 correção:** escritor cd309153-1f7a-40de-bad1-00a0a9dcf69c succeeded380s Sonnet5.5,60unit/54E2E+4skip; GPT60unit confirmados. Revisor43ed22e9-ef64-400a-b214-d987e633d2b9 succeeded82s Sonnet5.5 aprovou fórmulas com bug de cancelamento decimal em diferença/líquido. Checkpoint antes da correção focada `f87694651b1d070e50a6c35ebbeafa1c21f2285c`; preservar diferenças reais subcentavo, normalizar somente resíduos de precisão flutuante e testar igualdade/inegualdade/overflow. Revisão nova após correção.

**P0.2 acionado por impasse matemático P4.2:** follow-up Sonnet escritor succeeded170s (69unit/54E2E+4skip), helper16EPS zera diferenças reais (1 em1e15). Revisor43ed succeeded16s aprovou por plausibilidade de uso; GPT discorda: ausência de teto arbitrário é contrato e1 nessa escala é representável (ULP~0,125). Também corrigir parecer: PLAN seção6 possui fixtures numéricas. Consulta Opus somente leitura para menor solução defensável, sem aceitar perda silenciosa ou instalar biblioteca. Model efetivo/acesso devem ser verificados; falha interrompe fluxo para usuário.

**Decisão P0.2:** Opus5.5 efetivo confirmado, sessão2aa28270-6bc2-4c09-aac8-2aba6b74cead succeeded101s. Recomendou limite4EPS para cadeias atuais, em vez16; GPT aceita menor correção com testes1em1e15 e documentação explícita da precisão IEEE754, sem garantir aritmética decimal exata nem preservação universal de diferenças. Valor efetivamente representável pode cair na tolerância: declarar limite, não chamá-lo irrepresentável. Sem teto monetário, nova dependência ou alteração de produto. Checkpoint da próxima escrita registrado abaixo antes da chamada.

**P4.1 início:** aceite Home recebido. Dono Sonnet; escopo três páginas de serviço, componentes/dados/CSS em features/services, rotas servicos e testes correspondentes; reutilizar gráficos/formulários. Checkpoint WIP `b69a452c9179d84f5a65ccd35ee23ff7dd3afee6`; pré-checagem sem arquivo sensível/gerado, servidor manual encerrado para liberar gates. Sem alteração de exports/marca/dependências/env/Home.

**P4.1 revisão/correção:** escritor d9fac3af-1e3e-4e4d-b414-0980b0744b55, Sonnet5.5 succeeded518s;15unit/48E2E+4skip e lint/type/build. GPT confirmou14/14 serviços. Revisor 0981b385-3269-47ef-a462-980021713fee, Sonnet5.5 succeeded50s, contratos aprovados mas faltam símbolo CTA e moldura dos exports. Correção do mesmo dono autorizada também em novo graphics/FrameCanvas.tsx, reutilizando HomeAscii.drawFrame e lifecycle existente, sem alterar composição Home; atualizar serviços/CSS/testes/audit. Checkpoint WIP antes do follow-up: `7aef9c899aad5c70d5b95d5822d96f8a8f3c4967`. Revisão após correção obrigatória.

**Revisão humana local:** Home demo disponível em `http://127.0.0.1:3100/`, processo exec 80151, HTTP 200 confirmado pelo GPT. Formulários não enviam dados. Encerrar esse servidor antes de executar novamente os E2E (porta exclusiva do runner). A disponibilidade depende da sessão local continuar ativa.

**P3.4-T revisão e correção focada:** consulta independente `a430cb46-0458-4b36-b688-86ab2af716e2`, Sonnet 5.5, succeeded (81 s), aprovou com limites e apontou tratamento de URL/contenção/cleanup no servidor de capturas. GPT repetiu lint/typecheck/unit/build/e2e: 15 unitários e 32 E2E passaram, 4 skips explícitos. Checkpoint local antes da correção: `e67d2dbc25889ae506244e39e53b370b4e7ce6d7`; follow-up de escrita restrito aos testes de captura e relatório, sem produção. Aceite humano Home permanece pendente.

**Conclusão técnica da correção:** follow-up escritor `7b343f20-f2db-42c4-8644-7fc5dbb3ca0a`, Sonnet 5.5, succeeded (94 s), no checkpoint e67d2db; lint/typecheck/unit/build/e2e passaram (15 unitários, 34 E2E, 4 skips). Follow-up revisor independente `a430cb46-0458-4b36-b688-86ab2af716e2`, Sonnet 5.5, succeeded (13 s): aprovado sem bug novo. GPT conferiu diff e executou o teste HTTP afetado, 2/2. Capturas não regeneradas; novos campos de requestfailed não existem nas métricas antigas. Sem alteração de produção, push ou commit final; apenas checkpoints WIP locais autorizados. Inspeção visual GPT amostral incluiu hero desktop/baseline/mobile, pilares, serviços, processo, ferramentas mobile, newsletter desktop/baseline e CTA desktop/mobile. P3.4 aguarda aceite humano obrigatório D07.

## Pausa solicitada pelo usuário — 10/10/2026

Execução pausada até novo “ok” explícito, por limite informado de Claude (5%) e GPT (20%). Não iniciar novas sessões, desenvolvimento ou verificações durante a pausa.

- A tentativa de cancelar a sessão P5.3 `1867aaf5-13c0-45f7-bb15-395cb4e11b61` encontrou a tarefa já encerrada: `succeeded`, Sonnet 5.5, 374 s, checkpoint WIP `cd5f154ec121c926b42034995b2c92d970ead814`. Nenhuma nova chamada de implementação foi aberta.
- O escritor relata privacidade provisória, 404, metadata e correção do Link da Home implementados; lint/typecheck/build, 101 unitários e 148 E2E passaram, com 4 skips. Estes resultados finais ainda não foram repetidos nem revisados independentemente pelo orquestrador.
- Limitação relatada: slug com percent-encoding malformado retorna 500 do Next; URLs inválidas comuns retornam 404. Avaliar na retomada, sem assumir necessária a solução sugerida pelo escritor.
- Retomada: conferir diff e auditoria `references/audits/public-routes.md`; concluir validação P5.3 e revisão independente P5.4 (incluindo P5.2); depois executar P6 conforme critérios de aceite. Preservar a árvore atual e o aceite humano já concedido à Home. Aceite final continua pendente.

## Retomada autorizada — 11/10/2026

Usuário: “Ok para retomar o PLAN.md por completo até finaliza-lo”. Revoga a pausa anterior. P5.3 terminou antes da pausa; gates repetidos pelo GPT em andamento. P5.4 revisão independente Sonnet 5.5, sessão `aaa7c823-5b7c-418b-9d1c-9272cdda5be8`, somente leitura, em execução. Sem nova implementação enquanto revisamos esta entrega. Permanecem autorização apenas para checkpoints locais e necessidade de aceite humano final.

**P5.4 revisão inicial:** Sonnet5.5 `aaa7c823-5b7c-418b-9d1c-9272cdda5be8` succeeded127s, aprovou com ressalvas. Correção focada P5.2/P5.3 [claude:escreve] Sonnet: aviso prévio de indisponibilidade em NewsletterForm inclusive quando support personalizado, metadata prévia usando abertura pública, rótulo demonstrativo no arquivo e copy vazia exata; testes e auditorias correspondentes. Não criar estado de falha de rede fictício para catálogo local estático: ausência/filtro vazio já têm fixtures unitárias. GPT conferiu FrameCanvas event-driven, somente moldura lateral, sem fundo contínuo de leitura. Busca em src/static/server newsletter não encontrou referências/editorial, newsletter-editorial, fonte de catálogo de referência ou imports Markdown; public contém só quatro assets aprovados. Inspeção complementar de respostas públicas integra QA.

**Limite decidido pelo orquestrador:** percent-encoding UTF-8 inválido não é um slug válido inexistente; falha no decodificador do framework antes da página. Preservar HTTP404 para slugs bem formados inexistentes. Registrar caso malformado como risco conhecido de Next para revisão antes de publicação; não adicionar camada de roteamento nesta entrega local somente para mascarar falha do framework. Não tratar 500 como sucesso do gate404.

**P5.4 correção início:** checkpoint WIP ed2dd456990606029c1b65ad130635452d3bff7b; pré-checagem sem sensíveis/gerados. GPT confirmou gates P5.3: lint/typecheck/build,101unit/148E2E+4skip.


#### P6.2-T Preparação e execução de QA — [claude:escreve] Sonnet

Extensão executável de P6.1/P6.2, sem mudança de produto. Dono único: `.github/workflows/frontend.yml`, `web/playwright.config.ts`, novos testes de QA/captura e scripts de medição em `web/scripts/`, auditoria `references/audits/final-qa*`. Preservar todos testes existentes. CI Node24.13.1 npmci/lint/types/unit/build/E2E, sem deploy/segredos, browsers smoke distintos e Chromium completo. Cobrir SPA pausa/descarte de gráficos, 200% zoom/teclado/320px, runtime/errors e rotas representativas Firefox/WebKit. Capturas de serviço/ferramenta/newsletter/404 comparadas com exports em servidor local read-only, fontes/viewport/movimento estáveis, sem igualdade pixel-a-pixel. Medição Lighthouse13.5.0 efêmera autorizada via npmexec/npx (não dependência do app), três rodadas por Home/serviço/ferramenta/newsletter, mediana LCP/CLS/TBT/bytesJS, relatórios locais rastreáveis. Firefox/WebKit já instalados pelo GPT, Chromium existente. Não instalar outras dependências sem decisão. Novos testes/correções próprios revisados em P6.2 independente. Não mascarar falhas como skips. Entrega final inclui limitações reais, não certificação. Ambiente remoto CI não executado até push autorizado.

**P5.4 fechamento:** escritor19ebf5fb-c3bf-468d-8a6f-7cbdbed5d92a Sonnet5.5 succeeded254s,101unit/148E2E+4skip lint/type/build. Revisor aaa7c823-5b7c-418b-9d1c-9272cdda5be8 follow-up32s aprovou. Metadata corte/HTMLescape têm limites para futuro conteúdo, sem efeito no catálogo fixo atual. Copy vazia longa prevalece conforme product; sincronizar newsletter na documentação final. Rechecagem audit GPT: produção0, desenvolvimento5high na cadeia braces, correção forçada oferece downgrade Next, não aplicada. Lighthouse registry13.5.0; browsers Firefox157/WebKit27.2 instalados localmente pelo GPT para gates previstos.

**P6.1/P6.2-T início:** checkpoint WIP 6240b5fa7edc65352cb239076f25fad77aaaf8e8, pré-checagem sem sensíveis/gerados. Escopo CI/testes/scripts/evidências acima, Sonnet5.5 solicitado. Sem alterar código de produto nesta tarefa.

## Interrupção técnica da ponte — 11/10/2026

P6.1/P6.2-T sessão `e0432692-9f5a-4272-ba95-a643169dbd7d`, Sonnet5.5, cancelada pelo GPT após944s, último contexto164993 e sem novo retorno por vários minutos. Nenhuma nova escrita iniciada. Conforme solicitação anterior do usuário para consultar diante de problemas de utilização do Claude, continuidade aguardando decisão.

Trabalho preservado: workflow, config Playwright, qa-smoke/qa-spa/qa-capture/qa-shared, scripts Lighthouse/captura e44 capturas internas. Não marcar P6 concluído. Logs `.qa-e2e.log` e `.qa-e2e2.log` temporários na raiz, ainda sem integrar à auditoria. Uma rodada smoke registra62passes/12falhas WebKit: expectativa de foco no primeiro Tab (toBeFocused do skiplink); investigar comportamento de teclado WebKit antes de classificar bug da aplicação. Reexecução completa encontrou porta3100 ocupada. Servidor residual conhecido da tarefa PID9136 encerrado pelo GPT após confirmar porta, tipo e início na janela da sessão; não encerrar processos alheios. Lighthouse ainda sem resultados gerados.

Inspeção visual GPT encontrou divergências bloqueadoras de fidelidade em serviços: frentes4colunas em vez de2×2, FAQ sem composição em2colunas, painel detalhe sem disposição do export e copy de seção diferente. Corrigir via dono P4.1 Sonnet, preservando restaurações contratuais S/F e sem redesenho. Depois regenerar capturas. Reflow por viewport não certifica zoom real: rotular evidência com precisão. Próximos passos recomendados: GPT executa comandos QA/Lighthouse e gerencia servidores, Claude fica em tarefas pequenas de escrita/revisão; isso preserva D06 (GPT não desenvolve código). Apenas após validação concluir P6.2, documentação Haiku e aceite humano final.

## Continuidade de QA aprovada — 11/10/2026

Usuário escolheu Opção1: GPT executa gates/medições e controla servidores; Claude somente escritas e revisões pequenas. Atualiza o protocolo de execução restante: Claude não inicia servidores/builds/testes demorados; retorna a escrita concluída e GPT roda gates após sessão terminal. D06 permanece: GPT não desenvolve código do site. Sonnet corrige fidelidade P4.1 (services/ServicePage.tsx,services.module.css,content.ts somente copy export), testes serviços e auditoria correspondente. Restaurar composição export (frentes2×2, situações numeradas sem cards fechados, FAQduascolunas, detalheduascolunas, hierarquia/tipografia/copy) preservando conteúdos contratuais recuperados e acessibilidade. Não alterar Home/stack/formulários/modelos. Depois revisão independente junto P6.2. Capturas anteriores são evidência do desvio, regenerar após correção. QA WebKit: versão atual qa-smoke já trata foco programático do link no WebKit; isso verifica foco programático e NÃO ordem Tab real, registrar limite sem alegar cobertura inexistente. Reflow640/320CSSpx é equivalente geométrico, NÃO zoom real do browser. Aprovação final segue pendente.

**P4.1 correção visual:** checkpoint WIP dd4064562607d4584b47772cca1ce3812ccdfdad, pré-checagem57arquivos sem caminhos sensíveis. Evidências anteriores preservadas no checkpoint; proprietário Sonnet somente serviços/testes/auditoria, sem executar gates.

**P4.1 visual gates:** escritor e9e11a66-f1da-4fe1-a7eb-507368f200e5 Sonnet5.5 succeeded157s, sem gates próprios. GPT lint/typecheck/101unit/build e230E2E+4skips passou, Chromiumdesktop/mobile+Firefox/WebKit smoke. Exec77293. Nova revisão20aba837-fa07-4cae-bdfe-9d2341164525 Sonnet5.5 succeeded143s: composição serviços conferida parcialmente; revisão QA encontrou captura executando indevidamente no gate, falta de inicialização dos gráficos inferiores nas capturas, quotingWindowsLighthouse e rótulos zoom/foco imprecisos. Correção focada P6.2-T [claude:escreve] Sonnet: config/testesqa/scripts apenas. Isolar captura explicitamente QA_CAPTURE=1; percorrer página esperando gráficos em tela e registrar estados; corrigir spawnWindows sem shell interpolado; rotularreflow sem zoomreal, detectar corte de conteúdo relevante, foco com ring real, suportar abortos normais de prefetch Firefox/WebKit sem ocultar outros erros. Nenhum gate pode alegar zoombrowserreal/TabWebKit não medido. GPT confirmou actionsv7 oficiais via gh api releases/latest. CI remoto não rodado. Executar medições somente após correção terminal. Fidelidade ferramentas e newsletter reaberta para restauração de composição, mantendo contratos.

**P6.2-T correção:** checkpoint1714393e929eaf4675ce6e1eca9da76e82a735ab,28arquivos esperados sem caminhos sensíveis. Sonnet escreve somente QA/scripts/config; GPT executará os gates.

**P6.2-T gates corrigidos:** escritor b9d24011-b91e-4d35-897c-d9dede8ae039 Sonnet5.5 succeeded111s; GPT lint/types/101unit/build passou; E2E224passes/4skips/4falhas, todas reflow detectam botão Home “Conhecer Infraestrutura em nuvem” cortado [40,336] em320px. Não afrouxar detector. Lighthouse script executado pelo GPT exec82231:12rodadas,medianas LCPHome5476ms/serviço5400/ferramenta5535/newsletter4860; CLS0; TBT237/355/350/112ms; JS300,9/295,4/302,7/157KiB. Valores são baseline antes dos ajustes restantes, meta orientativaLCP2,5s não atingida, laboratório móvel4×CPU/slow4G. Scripts fecharam servidor3200. Resultados em final-qa/lighthouse/summary.json, logs/lighthouse.log. Não declarar desempenho aprovado sem tratar/registrar desvio final.

**Correção visual P5.2 — [claude:escreve] Sonnet:** restaurar composição3exportsnewsletter em features/newsletter(LandingPage/ArchivePage/PreviewPage/NewsletterParts/CSS), somente variantevisual NewsletterForm/forms.module.css se preciso, testesnewsletter/layout. Preservar catálogo, SSR/filtros/allowlist/edição escolhida/avisos e regras N01–N11. Hero títuloacento, formuláriodesktopemlinha, ediçãorecenteem2colunas, benefíciosnumerados, curadoria/FAQeCTAconformeexports. GPT também autoriza correção mínima de home.module.css secondaryCta para largura320px sem cortar, com regressão QA existente. Sem redesenhar Home ou alterarmodelos/contratos. Sonnet não executa gates, GPT assume.

**P5.2 correção visual início:** checkpoint400eef1c296bb524562038f1f71514d3b3a49e41,23arquivos previstos sem sensíveis. Regenerar capturas após gates; não usar capturas antigas como aprovação.

**P5.2 fidelidade concluída tecnicamente:** escritor18cfa4a0-2eaa-4d3e-bd19-6abb7cfece9d Sonnet5.5 succeeded228s, sem gates; GPT lint/types/101unit/build/228E2E+4skips passou (exec57102, logs/newsletter-fidelity-e2e.log). CTAHome320px não é mais cortado. Revisor20aba837 follow-up55s não encontrou bug novo; revisão estática parcial e limitações registradas. GPT já conferiu que qa-shared instrumenta7métodos2D, corrigindo referência desatualizada do parecer a3métodos. Capturas regenerar depois da última alteração visual.

**P4.3 restauração visual — [claude:escreve] Sonnet:** preservar integralmente modelos e contratos F, restaurar composição4exportsFerramenta: hero horizontal com acentoinline e artecompactaàdireita, formulário/resultadosladoalado, paresdeentradasdesktop/painéisarredondados/resultadosplaceholder, método expansível acessível, relatóriocomo cardlargura/forminline, CTAconformeexport sem adicionarsímbolo onde nãoexiste. Arquivos features/tools exceto models/format/useToolForm/ToolSession, ReportForm/forms.module.css,4rotas ferramentas só slotprops se necessário, testes/audittools-native. Não redesenhar nem remover estados/ajudas/limites para fazer coincidir export incompleto.

**P3.1 desempenho focado — [claude:escreve] Sonnet:** mesmo dono integração permite PillarArt.tsx e testesgraphics-motion/qa-spa para postergar import/runtimeThree até o elemento entrar em tela. Hoje todos importam no mount mesmo longe da tela; preservar primeiroframeestático/pausa/reduced/hidden/dispose e bloqueio de montagem tardia. Sem biblioteca, timers arbitrários ou mudar hero/cena. GatesGPT e medições finais após escrita. Metas de laboratório orientativas, diferença final será explicitada sem certificação.

**P4.3/P3.1 correção início:** checkpoint9800e60105884f8a7960179c75df5c3903b8e2dc,12arquivos previstos sem sensíveis. Escopo delimitado acima; Sonnet escreve, GPT gates.

**P4.3/P3.1 gates e revisão:** escritor d6c23c6a-6122-4e49-bbf1-eef9ab21bf74 Sonnet5.5 succeeded181s. GPT npmci/lint/types/101unit/build passou; E2E223passes/4skips/5falhas: expectativas antigas exigiam carregar gráficos fora da tela, incompatíveis com lazy init. Revisão independente0be30398-5fe7-4c1b-874b-44fcd9eec335 Sonnet5.5 succeeded92s encontrou janela sem fallback antes do primeiro draw e testes com controle insuficiente. Correção focada P3.1/P6.2-T [claude:escreve] Sonnet: PillarArt.tsx, pillar-runtime.ts (callback first frame), graphics-motion.spec.ts e audit final-qa. Manter fallback até primeiro desenho real; não marcar ready no mount. Testar todos os pilares visíveis prontos/pintados, visitar cada pilar antes de testar suspensão/semWebGL, verificar somente fallback Home no teste contextlostHome. Perda de contexto congela instâncias montadas, novas instâncias ainda não montadas podem obter renderer novo; testar e nomear alcance com precisão. Sem remover asserts, sem medir offscreen nunca montado como suspensão. Sem rootMargin adicional, sem alterar fórmulas ou layouts. GPT roda gates após terminal.

**P3.1 primeiro quadro início:** checkpoint69fb8f1, pré-checagem12arquivos sem sensíveis/gerados. Dono Sonnet, escopo acima, sem comandos QA.

**P3.1 correção e revisão:** escritor641608f4-2b81-45dd-96e5-665c1123da3a Sonnet5.5 succeeded109s; callback firstFrame após drawImage, limpo no dispose, fallback preservado até render. Revisorindependente0be30398 follow-up46s aprovou sem bloqueador; testes visitam instâncias renderizadas antes de medir suspensão, contexto perdido não ressuscita instâncias já montadas. GPT lint/types/101unit/build passou; E2E em execução. Rechecagem hash158exports/8cópias=0divergências. ScanGPT230arquivos src/public/static/serverapp com11trechos privados (90caracteres iniciais dos parágrafos posteriores à abertura),0ocorrências. Scan inicial amplo incluía prévias seguintes por erro de delimitação, corrigido para limitar cada edição antes da próxima seção C; não foi vazamento. Audit final logs audit-production.json=0advisories, audit-all.json mantém5high desenvolvimento; não aplicar force/downgrade. Esses scans são evidência complementar, não prova universal de confidencialidade ou segurança.

**P3.1 gates finalização:** GPT lint/types/101unit/build passou;226E2Epass/4skip/2falhas apenas teste contextlostHome: após falha ele exige canvas visível, mas HomeCanvas corretamente esconde seus canvas e mostra fallback. Com lazy init não há outro canvas fora de tela carregado para satisfazer seletor global. Correção mínima P6.2-T [claude:escreve] Sonnet, somente graphics-motion.spec.ts: afirmar canvas Home anexado E oculto apóscontextlost, remover helper visibleCanvases se ficar sem uso. Preservar asserts fallback/título; não alterar produção. GPT repetir gates, depois capturas/medição.

**P6.2-T assert início:** checkpoint21b022b3c9234e6bfb407c1893a3f3ee29eba24f,8arquivos previstos sem sensíveis/gerados. Sonnet apenas teste Home fallback, sem gates próprios.

**P6.2 gates aprovados:** escritor ef983328-334c-4135-8e47-8caf1003e625 Sonnet5.5 succeeded13s corrigiu somente assert Home anexado/oculto. GPT exec79331 lint/types/101unit/build e228E2E+4skips passou, logfinal-e2e.log. Chromiumdesktop/mobilecompleto eFirefox/WebKit smoke. Nenhum teste falho restante. Capturas finais iniciadas pelo GPT com QA_CAPTURE1; Lighthouse depois, sem contaminar medição com testes paralelos. Quatro skips conhecidos não são passes (aba real e capturas Home opt-in). Modelos/contratos preservados.

**P6.2 inspeção visual GPT:** captura74786 passou2/2,44JPG atualizados. Inspecionados serviço Ciberdesktopnative/export/mobile, ROSIdesktopnative/export e newsletterlandingdesktopnative/export. Composição geral restaurada, diferenças legítimas: demoControls/avisos, conteúdo Srecuperado, arte estática vs exportanimado. Achados concretos restantes, P4.1/P4.3 [claude:escreve] Sonnet: (1) services.h2 max-width760 aplicado indevidamente em frentes/processo, export não restringe esses títulos; manter largura aprovada por seção, sem mudarfontes; (2) ToolPage ol usa svc.crumbs que não reseta list-style/margin/padding: breadcrumb numerado colado, dar estilo próprio semântico; (3) ROSI lossaux interrompe par perda/frequência, costaux interrompe par custo/prazo: agrupar pares e colocar auxiliar abaixo do par, preservando customfields/DOM/foco/ajudas; (4) estado inicial ResultBox traz3barras semidentificação em todasferramentas: restaurar rótulos/descrições conhecidos com travessão SEM valores calculados, nunca métricas/score emShadowAI. Escopo somente services CSS/Title sepreciso, tools ToolPage/fields/RosiTool/TechDebtTool/MigrationTool/ShadowAiTool/toolsCSS, testesafetados e audits services/tools/finalQA. Preservar selectcenario e estados desconhecidos como adaptação funcional registrada; sem modelos/novasfórmulas/dependências/produçãooperacional. Revisorindependente e gatesGPT após escrita. Estas correções não ampliam produto.

**P4.1/P4.3 detalhes início:** checkpointe67872d40128521f7e281581746732caeb71ca24, pré-checagem sem sensíveis/gerados, capturas de evidência intencionais. Sonnet escreve escopo acima, GPT gates depois.

**P4.1/P4.3 detalhes concluídos:** escritor779d6b83-b74d-4384-acde-0499dc9fcdfd Sonnet5.5 succeeded72s,12arquivosincluindoPLANregistro. ParesROSImovidos sem fórmulas; iniciaiscomrótulos/travessãosemvalor, Shadowtemas semscore. GatesGPT após complemento P5.3 abaixo. Capturas newsletterarquivo/prévia/404desktopnative/export e arquivopréviamobile também inspecionadas: composição preservada, demoControls elevam alturas; prévias completaspúblicaspermitidas, sem corposprivados.

**P5.3 fidelidade404 — [claude:escreve] Sonnet:** inspeção mostra moldura do export404 ausente na página nativa. Correção mínima em web/src/app/not-found.tsx: reutilizar FrameCanvas já existente, data-graphics-root e corte inferior, sem alterar HTTP404/metadata/links/art. Teste focado em public-routes.spec.ts garante moldura pronta e título/retorno em404; preservar semJS. Dono pode remover CSS .placeholders agora semuso emtoolsCSS, nenhuma outra limpeza. Auditoria public-routes registra complemento. GPT executará gates agrupados de ambas escritas, Sonnetindependente revisará. Não executar comandos QA/servidores.
