# AGENTS.md — Root Trust Website

Website institucional Root Trust, em pt-BR, para Cibersegurança, Infraestrutura em nuvem e Software. Leia [docs/web/README.md](docs/web/README.md) e o [pacote da marca](docs/design/README.md) antes de desenvolver.

## Autoridade e leitura

[plano arquivado](docs/plans/integrations-pilot-completed.md) preserva decisões, critérios e evidências do piloto restrito aceito por Renato em 19/10/2026. Esse aceite é histórico e não limita o modo public aprovado depois. O [PLAN.md](PLAN.md) continua sendo a única fonte ativa de tarefas e estados; em 31/10/2026, Renato aprovou a revisão visual/editorial, autorizou a publicação e confirmou o uso específico no plano Vercel Hobby. O rollout mais recente é `dpl_GymUQNaiV8UiCe6obXrArWJQ9YK3`, com `BACKEND_MODE=public` e `FORM_MODE=off`; implantação READY não equivale ao ensaio editorial pendente nem a encerramento global.

Os seis documentos canônicos são:

1. [README](docs/web/README.md): índice, precedência e estado.
2. [Produto](docs/web/product.md): negócio, rotas, conteúdo, jornadas e serviços S01–S16.
3. [Design](docs/web/design.md): composição aprovada, responsividade, movimento e acessibilidade.
4. [Ferramentas](docs/web/tools.md): F01–F29, fórmulas, unidades, estados, fixtures e limites.
5. [Newsletter](docs/web/newsletter.md): N01–N11, páginas, amostras públicas e operação pendente.
6. [Desenvolvimento](docs/web/development.md): stack, arquitetura, comandos, testes, agentes e integrações futuras.

Para alterações visuais, leia também [guia da marca](docs/design/brand-design.md), [catálogo](docs/design/assets-catalog.md) e [auditoria da extração](docs/design/extraction-audit.md). Instruções/aprovações atuais do usuário e decisões D01–D19 prevalecem sobre notas históricas. As 12 exports são a baseline visual/editorial aprovada; preserve os contratos posteriores de temas, rotas e componentes sem redesign adicional. Preserve os rótulos regra oficial, adaptação web, aprovado, proposta, demonstração, histórico e pendente. Aprovação visual não comprova operação ou certificação.

## Estrutura e escopo atual

- `web/`: aplicação Next.js App Router, React, TypeScript estrito, npm, CSS Modules e tokens CSS. Three.js direto, sem React Three Fiber, Tailwind, runtime DC/CDN ou Cache Components. Server Components para conteúdo essencial; fronteiras cliente pequenas e primeiro render determinístico.
- `references/claude-design/`: 12 exports e dependências preservados. `Home.dc.html` original é imutável; `Home.baseline.dc.html` corrige somente referências indevidas a `s` em `ETAPAS.map`, com [registro](references/audits/home-baseline.md).
- `references/audits/`: auditorias e rastreabilidade de migração; `references/editorial/`: edições completas privadas de trabalho.
- `docs/design/` e `docs/design/assets/`: identidade oficial v2, assets originais e licenças preservados.
- `web/src/app/api/` e `web/src/lib/server/`: modos `off`, `demo`, `pilot` e `public`, com guards e readiness por fluxo. `temp/`: histórico; nenhuma limpeza ampla autorizada.

**Histórico (19/10/2026):** o piloto restrito foi aceito após ensaios de diagnóstico, quatro PDFs, newsletter, confirmação/cancelamento, rotina e backup/restauração. As allowlists e o estado escuro daquela data foram substituídos pelas decisões atuais. Renato segue responsável por cotas e cópias externas; medição ampliada de retenção e métricas totais Firestore/Resend não foram comprovadas.

**Estado vigente (31/10/2026):** `BACKEND_MODE=off`/desconhecido fecha; `FORM_MODE=demo` tem precedência, nunca envia; `FORM_MODE=off` só desativa demo e deixa backend/readiness decidir. `pilot` preserva allowlists; `public` dispensa apenas a antiga allowlist. Public exige origem, IP, Turnstile, limites, validação e configuração válida. HMAC/replay autenticam fronteiras internas/jobs/webhooks, não visitantes. Broadcast fica restrito a inscritos confirmados no segmento exclusivo, com aprovação humana e reconciliação fail-closed. Produção em `website-roottrust.vercel.app` usa `BACKEND_MODE=public`, `FORM_MODE=off`, catálogo real e noindex; formulários reais seguem ativos. A autorização específica Vercel Hobby foi declarada por Renato, não verificada independentemente como documento contratual.

Tema: botão sem texto “Tema”, Sol representa claro e Lua escuro; o site segue o sistema até a primeira escolha manual e depois alterna entre claro/escuro. CAPTCHA acompanha sempre o tema global do `html`, inclusive em faixa verde; ao mudar o tema efetivo, recria, invalida o token anterior e exige nova verificação, preservando campos e cercas de callback/cleanup. Não manipular o iframe interno ou ocultar, cortar ou escalar seu branding.

Rotas atuais: `/`; serviços `/servicos/ciberseguranca`, `/servicos/infraestrutura`, `/servicos/software`; ferramentas `/ferramentas/rosi`, `/ferramentas/shadow-ai`, `/ferramentas/divida-tecnica`, `/ferramentas/migracao-para-nuvem`; `/newsletter`; `/newsletter/edicoes`; `/newsletter/edicoes/[slug]`; `/privacidade`; 404 nativa. As antigas rotas de Infraestrutura em nuvem e Desenvolvimento de software retornam 404 sem redirect. “Infraestrutura em nuvem” continua categoria editorial da newsletter. Sobre, hub de ferramentas e diagnóstico dedicado estão fora do escopo.

## Marca, aparência e conteúdo

Desconsidere identidades anteriores e `temp/OldDesign`. Fonte oficial: Manual de Marca — New, versão 2 · 2026, extraído em 02/10/2026; 37 pranchas e 290 assets. Não alterar originais ou `Manual de Marca.fig`; publicar somente cópias rastreáveis necessárias.

Cores principais: Verde Raiz `#003428`, Superfície `#F5F5F2`, Rocha `#2E2E2E`. Sinal `#00D63D` é somente para tela; círculo Sinal no logo exige verificação positiva e “Verificado” escrito. Não usar assinatura neon genérica. Use assinaturas fornecidas, sem reconstruir logo/símbolo em HTML. Baloo 2 nos títulos, Archivo nos textos, fontes locais e licenças OFL preservadas. Escala editorial em pt não é escala responsiva em px.

Grafismos integrais para novas composições; `*-figma.svg` são recortes de referência. A Home possui exceção delimitada G4/G3/G2 e ASCII; não aplicar retroativamente a regra oficial de um grafismo por peça para remover a composição aprovada. Hero “Confiabilidade com profundidade.”, moldura reativa, princípios diamante/cadeado/camadas, serviços chave/servidores/módulos, processo vertical/terminal, públicos G2 Abrigo e ferramentas balança/olho/engrenagem/nuvem-seta permanecem referências. Mobile empilha serviços/processo. Não recuperar árvore/Bonsai/raízes contínuas, hero A2/Eco ou fotografia como direção atual.

Tom técnico, próximo, sem medo, jargão sem explicação ou promessa genérica. Não inventar métricas, benchmarks, provas comerciais, contatos ou selos verificados. Imagens extraídas são referências; direitos e selos exigem confirmação antes de futura publicação.

## Formulários, dados e gráficos

Campos ativos e validação completa; adaptador interno único. Sem configuração, nunca produzir sucesso simulado. `FORM_MODE=demo` ativa explicitamente carregamento, pedido aceito aguardando confirmação e erro locais; nenhum dado é enviado. `FORM_MODE=off` desativa apenas demo; `BACKEND_MODE=off` ou desconhecido fecha os fluxos reais, enquanto `public` e `pilot` exigem defesas e configuração válidas com semânticas próprias. A frase inicial de FormStatus não aparece; permanecem o aviso de demo e o feedback pós-tentativa. Pedido aceito não significa confirmação/entrega. Diagnóstico exige Nome, Empresa e WhatsApp; relatório envia só contato e ID da ferramenta, nunca respostas/resultados; newsletter é independente. Não adicionar analytics.

Diagnóstico: Nome, Empresa e WhatsApp obrigatórios, sem e-mail/escolha de canal. Preservar copy aprovada de retorno por ligação ou WhatsApp no próximo dia útil, mas confirmar recebimento real apenas quando houver integração. Foco/erros associados, guarda contra duplicidade e preservação após falha são obrigatórios. Newsletter: pedido aceito não significa endereço confirmado nem entrega. Relatório: somente contato e ID da ferramenta, nunca respostas/resultados; newsletter é independente.

Ferramentas: cálculo local em modelos TS puros conforme F01–F29; ROSI/equilíbrio, Shadow AI sem score, dívida técnica e migração 12/36 meses. Vazio/desconhecido não são zero; resultados negativos e razões indefinidas permanecem explícitos; tratar overflow. Editar invalida resultado e mudar horizonte exige revisão, sem triplicar custos únicos. Respostas ficam somente na memória e são descartadas ao sair/retornar: nunca storage, URL, logs, analytics, relatório ou associação ao e-mail.

Newsletter: apenas metadados, fontes e primeiro parágrafo editorial completo com links no conjunto público. Corpos completos nunca em HTML/RSC/JS/maps/assets/uploads publicáveis, nem escondidos por CSS. Preserve edição escolhida; pedido geral escolhe mais recente aprovada; filtro reinicia página 1 e arquivo usa dois itens por página. Sem login, exposição cadastral ou reativação silenciosa; comunicação pública enfatiza curadoria Root Trust sem IA e revisão humana permanece interna. Demos sem indexação; slug inválido retorna HTTP 404 antes de streaming.

Navegação (D11/D14): o item Newsletter do header leva a `/newsletter` em desktop e mobile; o link do footer e `#newsletter` da Home ficam inalterados. Âncoras da Home e entre rotas rolam por rAF (350–900 ms, destino adaptativo, offset 96, interrupção por interação do usuário); reduced-motion e pausa global rolam instantaneamente; não há CSS `scroll-behavior: smooth` global. Newsletter (D13): estrutura/título/lista/card usam 1200 px úteis em 1440, parágrafos ficam em 65ch, grade em ≥960 px; landing inalterada. Select nativo com `appearance: none`, ícone de 12×8 px com recuo direito de 16 px e padding-right 44 px; forced-colors permanece nativo. Fontes locais: WOFF2 Latin+ (→√≥) das mesmas famílias/versões/pesos, TTF+OFL intactos, Archivo com largura padrão 100, teste de cobertura futura, sem rede externa; procedência em [font-optimization.json](references/audits/font-optimization.json). Nenhum aviso FormStatus inicial padrão é exibido; só o feedback pós-tentativa e o aviso do modo demo.

Pausa global acessível na sessão SPA, redução dinâmica, suspensão real em aba oculta e fora de tela, fallback estático e descarte de GPU/listeners/loops. Inicializações tardias não ressuscitam componentes desmontados. Conteúdo essencial e CTA funcionam sem gráficos; teclado, menu/Escape/foco, seletores e anúncio agregado do terminal devem atender os contratos auditados.

## Execução atual e propriedade

GPT orquestra, decide e executa gates. Renato autorizou retomar seletivamente a ponte Claude em 30/10; em 31/10, a cota Claude motivou exceção explícita para concluir tarefas com GPT por função. T6.7 usa GPT Luna nesta documentação, sem chamada Claude/Haiku nem alegação de equivalência exata. Revisão independente e gates conforme PLAN. O rollout Vercel acima foi autorizado e executado; novas publicações/ativações exigem autorização própria. `.env*` permanece fora do escopo; nenhum commit final, push ou PR foi autorizado.

### Perfis Codex preservados como histórico

Histórico D06: GPT-6.1 Sol · XHigh orquestrava e o MCP `claude-agent` executava desenvolvimento. A autorização posterior permite GPT concluir tarefas delimitadas; a exceção T4.2 autorizou conclusão após a cota Claude. Perfis em [.codex/agents](.codex/agents/) permanecem históricos e não substituem o PLAN.

Use tags `[codex]`, `[claude:consulta]` e `[claude:escreve]` do PLAN. Modelo Claude explícito conforme o plano; não configurar esforço nem alterar defaults globais. Registrar modelo efetivo, sessionId e resultado. `writable: true` somente em passo de escrita descrito no PLAN. Antes dele: verificar raiz Git, `git add -A --dry-run`, segredos/gerados e checkpoint WIP LOCAL autorizado pelo usuário em 10/10/2026 (inclui árvore suja preexistente após inspeção; não autoriza commit final/push/PR). Hash registrado antes da chamada; falha bloqueia escrita. Procedimento completo e rodapé obrigatório em PLAN, seção “Agentes, modelos e operação da ponte Claude”.

Todo prompt inclui “Leia AGENTS.md, PLAN.md e os documentos que o passo citar antes de agir.” e o rodapé “Sessão headless: AskUserQuestion e sub-agents indisponíveis. Se faltar contexto, liste as dúvidas na resposta e pare. Não faça commit, push nem instale nada. Responda em pt-BR.” Delimitar arquivos e proibir efeitos colaterais em MCPs externos. Ferramentas expostas: `mcp__claude_agent__claude`, `mcp__claude_agent__claude_reply`, `mcp__claude_agent__claude_result`, `mcp__claude_agent__claude_cancel`; nomes curtos no protocolo apontam para essas ferramentas. Consultar resultado a cada 30–60 s; falha/timeout exige cancelamento, registro e aviso, sem repetição silenciosa. A ponte headless não usa sub-agents. Consulta é leitura, sem shell; não alegar testes executados pelo revisor.

Delegue com contexto restrito e dono único. Instalações/dependências/lockfile/builds são serializados. Depois de escrita: diff contra WIP e gates lint/typecheck/unit/build/e2e. Revisão independente do diff é obrigatória após três ou mais arquivos e antes de fechar plano não trivial; gates e aceite humano permanecem obrigatórios. O procedimento da ponte vale na retomada seletiva aprovada; execução só nas tarefas marcadas do PLAN. Sem fallback silencioso, alteração de configurações globais, métricas inventadas de economia ou segredos.

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

A aplicação Next está em `web/`, com lockfile e fontes locais. Use os scripts de `web/package.json`, documentados em `docs/web/development.md`: dev/build/start/typecheck/lint/test/test:e2e. Os gates locais da integração em 13/10/2026 passaram: lint, tipos, 495 unitários, build e 290 E2E/6 skips; ensaios reais dos fluxos principais foram concluídos em17/10, automação editorial validada e piloto restrito aceito em19/10/2026. Os gates do frontend de 11/10/2026 (107 unitários/284 E2E/6 skips) são histórico. Contas criadas; piloto restrito aceito em19/10/2026. Servir exports por HTTP não é build Next. Evidências anteriores em `references/audits/frontend-foundation.md`.

E2E de contato usa a API `page.clock`, instalada antes do goto, com controle de 350 ms e checagem de duplicidade (2 submits → 1 timer); 10 repetições desktop + 10 mobile passaram, sem retries e sem alterar o atraso de 350 ms da produção.

Vitest Node verifica modelos/parsers/fixtures; Playwright verifica build/start de produção. Gates incluem lint, typecheck, unit, build, e2e; Chromium desktop/mobile, Firefox/WebKit smoke, 320px/zoom/teclado. Comparar visual por seção com fontes/viewport/estado estáveis; CSS animations disabled não congela Canvas. Não alegar acessibilidade/desempenho certificados. Registrar medições Lighthouse e limitações; TBT de laboratório não certifica INP de campo.

Revalidar registry, peers, advisories e Node no bootstrap; versões de CDN/exports não fixam dependências. Preflight de 17/10/2026 atualizou Next/eslint-config-next para 16.4.2 e React/React DOM para 19.3.1 após advisories oficiais de 14/10, não sinalizados pelo npm audit de produção na versão antiga. Revalidar advisories do fornecedor antes de cada deploy; desenvolvimento local não autoriza publicação ou ativação das integrações.

## Segurança

- Não hardcode credenciais em nenhum arquivo versionado.
- Bancos de dados locais: preferir Docker Compose a instalação direta, assim que houver backend.
- Validar entradas em fronteiras do sistema (API pública, formulários do site) assim que existirem.

## Limites da entrega local

Ver [QA final](references/audits/final-qa.md). Capturas P9 históricas: 44 JPG/22 pares, 11 rotas desktop/mobile, duas execuções sem issues e cinco extras. Spotcheck laboratorial de 31/10: Home LCP 2.565–3.089,5 ms e ROSI 2.879,5–3.802 ms, duas amostras por rota e variância alta; a meta orientativa de 2,5 s não foi atingida. As medições anteriores de LCP (Home 2.808,5 ms; Cibersegurança 2.726,5; ROSI 2.873; Newsletter 2.783) são históricas e não descrevem o deployment atual. Nenhuma medição certifica INP de campo, hardware físico, acessibilidade ou operação contínua. Skips não são passes; a suíte E2E completa não foi repetida depois da correção global final do CAPTCHA. Audit produção zero/dev cinco high é medição histórica de 11/10, não audit atual. Slug bem formado inexistente é 404; UTF-8 malformado pode gerar 500 no Next.

### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 acima (não é estado atual):** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.

## Encerramento e referências locais

O piloto restrito de 19/10 está arquivado como histórico; o [PLAN.md](PLAN.md) ativo continua aberto, com o ensaio editorial público pendente e sem aceite final global. Em 31/10, Renato aprovou o conjunto visual e o deployment público; fluxos de diagnóstico, PDFs, inscrição/confirmação/edição/cancelamento foram confirmados. Por decisão do usuário, `references/` permanece local e ignorado pelo Git; capturas comparativas exigem restaurá-la em clones novos. Fixtures unitárias estão em `web/tests/fixtures/`. Nenhum commit final, push ou PR foi autorizado.
