# Desenvolvimento do frontend

## Estado e decisões

Plano aprovado pelo usuário em 10/10/2026. A fundação da aplicação está inicializada em `web/` com Next.js App Router, React, TypeScript estrito, npm, CSS Modules, tokens CSS e Three.js direto. Não usar runtime DC/CDN, React Three Fiber, Tailwind ou Cache Components. Conteúdo essencial fica em Server Components; componentes cliente ficam restritos a interações/gráficos. Primeiro render determinístico; Baloo 2 e Archivo via `next/font/local`, mantendo as licenças OFL.

Backend, banco de dados, CMS, serviço de e-mail, hospedagem e publicação seguem sem escolha. A fase atual não integra envio, persistência, analytics, relatório operacional ou recebimento de contatos. Idempotência e confirmação incerta de uma solicitação ficam como requisitos da futura integração, sem mecanismo escolhido.

| ID | Decisão aprovada |
|---|---|
| D01 | Completar primeiro o frontend; integrações e publicação ficam para outra etapa. |
| D02 | Preservar os 12 exports aprovados, corrigindo bugs e requisitos auditados sem redesenho. |
| D03 | Entregar somente tema escuro. |
| D04 | Aplicação em `web/`; exports preservados em `references/claude-design/`. |
| D05 | Exatamente seis documentos canônicos em `docs/web`; migrar informação única antes de excluir substituídos. |
| D06 | GPT-6.1 Sol · XHigh orquestra e decide; todo desenvolvimento restante usa MCP Claude, Sonnet/Haiku explícitos; Opus somente consulta complexa. Uma escrita por vez; limite global três workers. Fable excluído por indisponibilidade no Pro. |
| D07 | Aprovação humana da Home antes das páginas internas; aceite humano final do conjunto. |
| D08 | `/privacidade` provisória, descrevendo honestamente a operação local. |
| D09 | Formulários ativos com validação completa, preparados para futura integração. |
| D10 | Simulação local de carregamento/sucesso/erro somente com `FORM_MODE=demo` explícito; nenhum envio real. |

## Formulários e segurança de estado

Um adaptador interno único separa a interface da submissão futura. Os campos ficam ativos. Validar no cliente e na futura fronteira de serviço, associar erros aos campos, mover foco quando necessário, impedir envio duplicado, mostrar andamento e preservar os dados em falha. O modo padrão nunca simula sucesso. Em `FORM_MODE=demo`, simular carregamento, pedido aceito aguardando confirmação (sucesso do pedido, não da inscrição) e erro localmente, identificando a demonstração. Não fazer requisições de rede nem persistir os campos.

Diagnóstico exige Nome, Empresa e WhatsApp. A confirmação só em produção pode prometer retorno por ligação ou WhatsApp no próximo dia útil após recebimento real; o estado demo informa que nenhum dado foi enviado. Newsletter usa apenas e-mail; `FORM_MODE=demo` pode simular andamento, pedido aceito aguardando confirmação (sucesso local do pedido, não da inscrição) e erro/retry. Confirmação de endereço, entrega e cancelamento exigem operação real; o demo nunca declara esses estados. Pedido de relatório contém somente contato e ID da ferramenta, nunca respostas ou resultados; newsletter é uma escolha separada.

## Rotas

`/`; `/servicos/ciberseguranca`; `/servicos/infraestrutura-em-nuvem`; `/servicos/desenvolvimento-de-software`; `/ferramentas/rosi`; `/ferramentas/shadow-ai`; `/ferramentas/divida-tecnica`; `/ferramentas/migracao-para-nuvem`; `/newsletter`; `/newsletter/edicoes`; `/newsletter/edicoes/[slug]`; `/privacidade`; 404 nativa. Não criar página Sobre, hub de ferramentas ou diagnóstico dedicado nesta fase.

## Ferramentas e newsletter

Modelos F01–F29 são funções TypeScript puras com entradas verificadas. Respostas só em memória, sem URL, storage, logs, analytics, persistência ou associação a e-mail; limpar ao sair e ao retornar. Editar invalida o resultado. Trocar 12/36 meses exige revisar totais. Desconhecido/vazio não é zero; preservar resultados negativos; tratar denominador zero, parsing pt-BR e overflow explicitamente. Shadow AI não calcula score.

Catálogo da newsletter contém três amostras demonstrativas, metadados, fontes e abertura completa. Arquivo filtra por pilar, pagina dois itens por página somente na demonstração e reinicia na página 1 ao trocar filtro. Prévia expõe apenas o primeiro parágrafo editorial completo, mantendo a edição escolhida no formulário. Pedido geral escolhe a edição mais recente. Slug inválido responde 404. Corpos completos ficam fora de HTML, RSC, JS, source maps e assets públicos; consultar as amostras completas em [`references/editorial`](../../references/editorial/newsletter-editorial-samples.md), material privado de contexto.

## Gráficos e acessibilidade

Pausar animação durante a sessão SPA; responder dinamicamente a `prefers-reduced-motion`; não animar quando a preferência reduzida estiver ativa, a sessão estiver pausada, a aba oculta ou o elemento fora da área relevante. Pausa/redução deixa apresentação estática. Aba oculta suspende desenho e timers. Em falha/perda de contexto mostrar asset aprovado, sem reconstruir assinatura/logo. Descartar recursos GPU, listeners e loops; impedir inicialização assíncrona após desmontagem.

Conteúdo, rótulos e ações essenciais continuam utilizáveis sem Canvas/WebGL, JavaScript decorativo ou hover. Menu deve operar por teclado/Escape e devolver foco. Seletor de serviços, processo, terminal e abas precisam de navegação/semântica acessíveis. Não declarar acessibilidade certificada.

## Fases e gates

P1.1 plano aprovado e registrado; P1.2 exports preservados com hashes e baseline; P1.3 documentação consolidada; P1.4 instruções/agentes revisados. P2 inicializa aplicação e publica cópias rastreáveis de assets. P3 porta gráficos e Home; **a aprovação humana da Home bloqueia páginas internas**. P4 implementa serviços e ferramentas. P5 implementa newsletter, privacidade, metadata e 404. P6 executa CI/QA e apresenta aceite final. Não declarar fase futura concluída por preparação parcial.

Os critérios completos de cada tarefa incluem comandos reais de lint/tipos/testes/build, smoke em produção, validação desktop/mobile/teclado, modelos/limites e inspeção de conteúdo público. Há `web/package.json`, lockfile, configuração TypeScript/ESLint, Vitest Node e Playwright. A Home completa é JSX/CSS Modules com conteúdo SSR, interações locais e gráficos integrados; sua revisão independente P3.4 e aprovação humana continuam pendentes, sem páginas internas antecipadas. Não chamar o export servido por HTTP de build Next. Evidências e versões em [frontend-foundation.md](../../references/audits/frontend-foundation.md); portabilidade e gates da Home em [home-native.md](../../references/audits/home-native.md).

## Evidências e limites

Execução detalhada por tarefa está no PLAN, seção “Agentes, modelos e operação da ponte Claude”. Sonnet implementa Next/React/CSS, gráficos, modelos, testes e CI; Haiku executa tarefas mecânicas e documentação factual. Revisão Sonnet ocorre em outra sessão, sem garantia de diversidade de modelos; gates e aceite humano permanecem obrigatórios. Opus somente para impasses complexos. GPT mantém plano/decisões e pode executar gates determinísticos, sem desenvolver o código. Perfis Codex anteriores ficam preservados como histórico. As fases 4 e 5 podem ter dependências independentes, mas as escritas da ponte são serializadas.

`claude` usa `cwd` na raiz Git, modelo explícito e leitura por padrão. Escrita exige tag `[claude:escreve]`, escopo delimitado e hash de checkpoint WIP LOCAL autorizado em 10/10/2026, após inspeção de segredos/gerados. Esse checkpoint pode incluir trabalho anterior; não autoriza commit final, push, PR ou deploy. Não editar em paralelo a escrita Claude. Registrar sessão/modelo/hash/gates no PLAN; consultas independentes não têm shell e recebem evidências de testes. Após cada escrita executar lint/typecheck/unit/build/e2e; depois de três arquivos exigir revisão do diff. A ponte não expõe esforço e não permite sub-agents headless; Fable não deve ser chamado. Não alterar configuração global ou fazer fallback silencioso.

Auditorias dos exports em [`references/audits`](../../references/audits/). Baseline técnica observada: runtime próprio do Claude Design/React, Three.js direto para objetos e Canvas 2D para hero/moldura/símbolos. Node 24.13.1 e npm 11.8.0 foram observados no planejamento; revalidar compatibilidade, versões e advisories na instalação. As versões pesquisadas não fixam dependências. Sem banco SQL paralelo, cópia concorrente de plano ou segredo em arquivos versionados. Sem commit, push, PR ou deploy sem autorização explícita.






## Comandos da fundação

Executar em `web/`, com Node 24 (ver `package.json`):

```powershell
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Para testes de navegador, instalar o browser correspondente uma vez com `npx playwright install chromium`, executar `npm run build` e depois `npm run test:e2e`. O runner inicia e encerra duas instâncias do mesmo build: porta 3100 com `FORM_MODE=demo`, porta 3101 sem simulação. Não reutiliza servidor existente. Nesta fundação, `force-dynamic` permite resolver o modo exclusivamente no servidor em cada request; parâmetros públicos não controlam a simulação. Para desenvolvimento manual demo, definir `$env:FORM_MODE='demo'` antes de `npm run dev`; retirar a variável restaura o modo indisponível após reiniciar o processo.

Verificar `npm audit` e `npm audit --omit=dev`. Em 10/10/2026, produção não apresentou advisories; a cadeia de desenvolvimento ESLint/fast-glob/micromatch/braces tem GHSA-vfj7-8cjw-p6xm sem patch publicado. Não executar correções `--force` nem declarar ausência de risco. Rechecagem na etapa P6 e antes de qualquer futura publicação, incluindo atualização Next anunciada para 14/10/2026.
