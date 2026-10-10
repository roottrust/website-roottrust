# AGENTS.md — Root Trust Website

Website institucional Root Trust, em pt-BR, para Cibersegurança, Infraestrutura em nuvem e Software. Leia [docs/web/README.md](docs/web/README.md) e o [pacote da marca](docs/design/README.md) antes de desenvolver.

## Autoridade e leitura

[PLAN.md](PLAN.md) é a fonte única de tarefas, decisões D01–D10, critérios de aceite e evidências durante a execução. Não crie TODO, banco de tarefas ou plano concorrente. Ao concluir e obter aceite final, o orquestrador arquiva o plano conforme o próprio documento.

Os seis documentos canônicos são:

1. [README](docs/web/README.md): índice, precedência e estado.
2. [Produto](docs/web/product.md): negócio, rotas, conteúdo, jornadas e serviços S01–S16.
3. [Design](docs/web/design.md): composição aprovada, responsividade, movimento e acessibilidade.
4. [Ferramentas](docs/web/tools.md): F01–F29, fórmulas, unidades, estados, fixtures e limites.
5. [Newsletter](docs/web/newsletter.md): N01–N11, páginas, amostras públicas e operação pendente.
6. [Desenvolvimento](docs/web/development.md): stack, arquitetura, comandos, testes, agentes e integrações futuras.

Para alterações visuais, leia também [guia da marca](docs/design/brand-design.md), [catálogo](docs/design/assets-catalog.md) e [auditoria da extração](docs/design/extraction-audit.md). Instruções/aprovações atuais do usuário e D01–D10 prevalecem sobre notas históricas dos documentos. Os 12 exports são a baseline visual/editorial aprovada; corrigir bugs, contratos e acessibilidade auditados sem redesenho. Preserve rótulos de regra oficial, adaptação web, aprovado, proposta, demonstração, histórico e pendente. Aprovação visual não comprova operação ou certificação.

## Estrutura e escopo atual

- `web/`: aplicação Next.js App Router, React, TypeScript estrito, npm, CSS Modules e tokens CSS. Three.js direto, sem React Three Fiber, Tailwind, runtime DC/CDN ou Cache Components. Server Components para conteúdo essencial; fronteiras cliente pequenas e primeiro render determinístico.
- `references/claude-design/`: 12 exports e dependências preservados. `Home.dc.html` original é imutável; `Home.baseline.dc.html` corrige somente referências indevidas a `s` em `ETAPAS.map`, com [registro](references/audits/home-baseline.md).
- `references/audits/`: auditorias e rastreabilidade de migração; `references/editorial/`: edições completas privadas de trabalho.
- `docs/design/` e `docs/design/assets/`: identidade oficial v2, assets originais e licenças preservados.
- `api/`: sem integração operacional nesta fase. `temp/`: histórico; nenhuma limpeza ampla autorizada.

Entregar frontend completo e local, somente escuro. Backend, banco, CMS, e-mail, recebimento real, relatórios operacionais, analytics, hospedagem e deploy ficam para outra etapa. Não escolher fornecedores nem implementar tema claro/automático. A aprovação humana da Home é obrigatória antes de iniciar páginas internas; aceite humano final também é obrigatório.

Rotas: `/`; três serviços em `/servicos/ciberseguranca`, `/servicos/infraestrutura-em-nuvem`, `/servicos/desenvolvimento-de-software` (rótulo Software); quatro ferramentas em `/ferramentas/rosi`, `/ferramentas/shadow-ai`, `/ferramentas/divida-tecnica`, `/ferramentas/migracao-para-nuvem`; `/newsletter`; `/newsletter/edicoes`; `/newsletter/edicoes/[slug]`; `/privacidade` provisória e verdadeira; 404 nativa. Sobre, hub de ferramentas e diagnóstico dedicado estão fora desta fase.

## Marca, aparência e conteúdo

Desconsidere identidades anteriores e `temp/OldDesign`. Fonte oficial: Manual de Marca — New, versão 2 · 2026, extraído em 02/10/2026; 37 pranchas e 290 assets. Não alterar originais ou `Manual de Marca.fig`; publicar somente cópias rastreáveis necessárias.

Cores principais: Verde Raiz `#003428`, Superfície `#F5F5F2`, Rocha `#2E2E2E`. Sinal `#00D63D` é somente para tela; círculo Sinal no logo exige verificação positiva e “Verificado” escrito. Não usar assinatura neon genérica. Use assinaturas fornecidas, sem reconstruir logo/símbolo em HTML. Baloo 2 nos títulos, Archivo nos textos, fontes locais e licenças OFL preservadas. Escala editorial em pt não é escala responsiva em px.

Grafismos integrais para novas composições; `*-figma.svg` são recortes de referência. A Home possui exceção delimitada G4/G3/G2 e ASCII; não aplicar retroativamente a regra oficial de um grafismo por peça para remover a composição aprovada. Hero “Confiabilidade com profundidade.”, moldura reativa, princípios diamante/cadeado/camadas, serviços chave/servidores/módulos, processo vertical/terminal, públicos G2 Abrigo e ferramentas balança/olho/engrenagem/nuvem-seta permanecem referências. Mobile empilha serviços/processo. Não recuperar árvore/Bonsai/raízes contínuas, hero A2/Eco ou fotografia como direção atual.

Tom técnico, próximo, sem medo, jargão sem explicação ou promessa genérica. Não inventar métricas, benchmarks, provas comerciais, contatos ou selos verificados. Imagens extraídas são referências; direitos e selos exigem confirmação antes de futura publicação.

## Formulários, dados e gráficos

Campos ativos e validação completa; adaptador interno único para futura integração. Sem configuração, nunca produzir sucesso simulado. `FORM_MODE=demo` ativa explicitamente carregamento, pedido aceito aguardando confirmação e erro locais; sucesso do pedido não é confirmação da inscrição ou recebimento. Aviso informa “nenhum dado foi enviado”. Confirmação de endereço, entrega ou cancelamento exigem operação real. Não criar endpoint, persistência ou analytics.

Diagnóstico: Nome, Empresa e WhatsApp obrigatórios, sem e-mail/escolha de canal. Preservar copy aprovada de retorno por ligação ou WhatsApp no próximo dia útil, mas confirmar recebimento real apenas quando houver integração. Foco/erros associados, guarda contra duplicidade e preservação após falha são obrigatórios. Newsletter: pedido aceito não significa endereço confirmado nem entrega. Relatório: somente contato e ID da ferramenta, nunca respostas/resultados; newsletter é independente.

Ferramentas: cálculo local em modelos TS puros conforme F01–F29; ROSI/equilíbrio, Shadow AI sem score, dívida técnica e migração 12/36 meses. Vazio/desconhecido não são zero; resultados negativos e razões indefinidas permanecem explícitos; tratar overflow. Editar invalida resultado e mudar horizonte exige revisão, sem triplicar custos únicos. Respostas ficam somente na memória e são descartadas ao sair/retornar: nunca storage, URL, logs, analytics, relatório ou associação ao e-mail.

Newsletter: apenas metadados, fontes e primeiro parágrafo editorial completo com links no conjunto público. Corpos completos nunca em HTML/RSC/JS/maps/assets/uploads publicáveis, nem escondidos por CSS. Preserve edição escolhida; pedido geral escolhe mais recente aprovada; filtro reinicia página 1 e arquivo usa dois itens por página. Sem login, exposição cadastral ou reativação silenciosa; comunicação pública enfatiza curadoria Root Trust sem IA e revisão humana permanece interna. Demos sem indexação; slug inválido retorna HTTP 404 antes de streaming.

Pausa global acessível na sessão SPA, redução dinâmica, suspensão real em aba oculta e fora de tela, fallback estático e descarte de GPU/listeners/loops. Inicializações tardias não ressuscitam componentes desmontados. Conteúdo essencial e CTA funcionam sem gráficos; teclado, menu/Escape/foco, seletores e anúncio agregado do terminal devem atender os contratos auditados.

## Agentes e propriedade

Decisão atual D06: GPT-6.1 Sol · XHigh faz orquestração, manutenção do PLAN, verificação de evidências e decisões complexas; desenvolvimento restante é executado pelo MCP `claude-agent`. Sonnet implementa código, gráficos, modelos, testes e CI; Haiku executa inventário, cópias e documentação delimitada. Sonnet revisa em sessão independente; Opus é consulta pontual para impasses complexos. Fable excluído: indisponível no plano Pro do usuário. Perfis em [.codex/agents](.codex/agents/) permanecem históricos, sem uso como executores futuros. Limite local de três workers inclui Claude; uma escrita Claude por vez, sem edição concorrente e com revisão após estado terminal.

Use tags `[codex]`, `[claude:consulta]` e `[claude:escreve]` do PLAN. Modelo Claude explícito; a ponte não expõe parâmetro de esforço. Registrar modelo efetivo, sessionId e resultado. `writable: true` somente em passo de escrita descrito no PLAN. Antes dele: verificar raiz Git, `git add -A --dry-run`, segredos/gerados e checkpoint WIP LOCAL autorizado pelo usuário em 10/10/2026 (inclui árvore suja preexistente após inspeção; não autoriza commit final/push/PR). Hash registrado antes da chamada; falha bloqueia escrita. Procedimento completo e rodapé obrigatório em PLAN, seção “Agentes, modelos e operação da ponte Claude”.

Todo prompt inclui “Leia AGENTS.md, PLAN.md e os documentos que o passo citar antes de agir.” e o rodapé “Sessão headless: AskUserQuestion e sub-agents indisponíveis. Se faltar contexto, liste as dúvidas na resposta e pare. Não faça commit, push nem instale nada. Responda em pt-BR.” Delimitar arquivos e proibir efeitos colaterais em MCPs externos. Ferramentas expostas: `mcp__claude_agent__claude`, `mcp__claude_agent__claude_reply`, `mcp__claude_agent__claude_result`, `mcp__claude_agent__claude_cancel`; nomes curtos no protocolo apontam para essas ferramentas. Consultar resultado a cada 30–60 s; falha/timeout exige cancelamento, registro e aviso, sem repetição silenciosa. A ponte headless não usa sub-agents. Consulta é leitura, sem shell; não alegar testes executados pelo revisor.

Delegue com contexto restrito e dono único. Instalações/dependências/lockfile/builds são serializados. Depois de escrita: diff contra WIP e gates lint/typecheck/unit/build/e2e; GPT pode executar comandos determinísticos da verificação, sem implementar. Revisão do diff obrigatória após três ou mais arquivos e crítica antes de fechar plano não trivial, agrupadas com gates existentes. Revisor diferente do implementador: outra sessão/agente pode usar Sonnet, sem garantia de diversidade de modelos; gates e aceite humano permanecem obrigatórios. Correção Haiku escala a Sonnet; impasse persistente Sonnet consulta Opus e GPT decide. Sem fallback silencioso, alteração de configurações globais, métricas inventadas de economia ou segredos.

## Regras inegociáveis (válidas mesmo sem config global do agente)

Estas regras replicam o comportamento esperado de qualquer agente de IA neste repo — importante porque nem todo colaborador terá a mesma configuração global de CLAUDE.md/Codex.

1. **Nunca** faça `git commit`, `git push`, crie PR ou delete branches sem aprovação explícita do usuário na conversa. Apresente antes um resumo das alterações.
2. **Nunca** invente ou assuma informação técnica. Se não souber, pesquise (docs oficiais, código do repo) antes de responder ou implementar.
3. **Nunca** exponha, logue ou commite segredos, tokens, senhas ou API keys. Use variáveis de ambiente (`.env`, nunca hardcoded).
4. **Nunca** ignore exceções/erros silenciosamente — trate-os explicitamente.
5. **Nunca** remova testes existentes ou funcionalidades já implementadas em nome de "limpeza" ou refatoração não solicitada.
6. **Nunca** assuma decisões de arquitetura ou escolha de tecnologia sem confirmar com o time — pergunte antes de decidir.
7. Toda interação com GitHub deve usar o `gh` CLI (`gh pr`, `gh issue`, `gh api`, etc.) em vez de acessar a API diretamente via curl/fetch, quando disponível.
8. Antes de propor um commit: rode `git diff --stat`, confirme que arquivos gerados automaticamente (build, specs, swagger) não estão sendo incluídos, e que nenhum segredo está exposto.
9. Priorize código limpo e legível sobre soluções "espertas"; trate todos os erros explicitamente; use tipagem forte na linguagem escolhida assim que o stack for definido.

## Padrão de commits e branches

```
feat/<descrição-curta>     # Nova funcionalidade
fix/<descrição-curta>      # Correção de bug
chore/<descrição-curta>    # Manutenção, dependências
```

```
<tipo>(<escopo>): <descrição curta em inglês>

[corpo opcional com detalhes]
```
Tipos válidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.

## Build, testes e validação

A fundação Next está inicializada em `web/`, com lockfile, fontes locais, shell e formulários locais. Use os scripts reais de `web/package.json`, documentados em `docs/web/development.md`: dev/build/start/typecheck/lint/test/test:e2e. A Home completa está em revisão independente P3.4 e as internas aguardam aceite humano no PLAN; servir exports por HTTP não é build Next. Evidências em `references/audits/frontend-foundation.md`.

Vitest Node verifica modelos/parsers/fixtures; Playwright verifica build/start de produção. Gates incluem lint, typecheck, unit, build, e2e; Chromium desktop/mobile, Firefox/WebKit smoke, 320px/zoom/teclado. Comparar visual por seção com fontes/viewport/estado estáveis; CSS animations disabled não congela Canvas. Não alegar acessibilidade/desempenho certificados. Registrar medições Lighthouse e limitações; TBT de laboratório não certifica INP de campo.

Revalidar registry, peers, advisories e Node no bootstrap; versões de CDN/exports não fixam dependências. Há atualização de segurança Next anunciada para 14/10/2026; desenvolvimento local não autoriza publicação, que exige nova revisão de patches e integrações.

## Segurança

- Não hardcode credenciais em nenhum arquivo versionado.
- Bancos de dados locais: preferir Docker Compose a instalação direta, assim que houver backend.
- Validar entradas em fronteiras do sistema (API pública, formulários do site) assim que existirem.
