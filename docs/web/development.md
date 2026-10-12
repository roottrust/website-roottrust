# Desenvolvimento do frontend

## Estado e decisões

Plano aprovado pelo usuário em 10/10/2026. A aplicação está implementada em `web/` com Next.js App Router, React, TypeScript estrito, npm, CSS Modules, tokens CSS e Three.js direto. Não usar runtime DC/CDN, React Three Fiber, Tailwind ou Cache Components. Conteúdo essencial fica em Server Components; componentes cliente ficam restritos a interações/gráficos. Primeiro render determinístico; Baloo 2 e Archivo via `next/font/local`, mantendo as licenças OFL.

Backend, banco de dados, CMS, serviço de e-mail, hospedagem e publicação seguem sem escolha. A fase atual não integra envio, persistência, analytics, relatório operacional ou recebimento de contatos. Idempotência e confirmação incerta de uma solicitação ficam como requisitos da futura integração, sem mecanismo escolhido.

| ID | Decisão aprovada |
|---|---|
| D01 | Completar primeiro o frontend; integrações e publicação ficam para outra etapa. |
| D02 | Preservar os 12 exports aprovados, corrigindo bugs e requisitos auditados sem redesenho. |
| D03 | Entregar somente tema escuro. |
| D04 | Aplicação em `web/`; exports preservados em `references/claude-design/`. |
| D05 | Exatamente seis documentos canônicos em `docs/web`; migrar informação única antes de excluir substituídos. |
| D06 | GPT-6.1 Sol · XHigh orquestra e decide; código via MCP Claude, Sonnet/Haiku explícitos; GPT executa gates/servidores e, por autorização posterior, a documentação final; Opus somente consulta complexa. Uma escrita por vez; limite global três workers. Fable excluído por indisponibilidade no Pro. |
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

P1.1 plano aprovado e registrado; P1.2 exports preservados com hashes e baseline; P1.3 documentação consolidada; P1.4 instruções/agentes revisados. P2–P5 concluídos tecnicamente: aplicação/assets, gráficos/Home, serviços/ferramentas, newsletter/privacidade/metadata/404. Home aprovada em 10/10 antes das internas. P6 tem QA local documentado e revisão documental concluída; aguarda aceite humano final com ciência dos limites. Não declarar fase futura concluída por preparação parcial.

Os critérios completos de cada tarefa incluem comandos reais de lint/tipos/testes/build, smoke em produção, validação desktop/mobile/teclado, modelos/limites e inspeção de conteúdo público. Há `web/package.json`, lockfile, configuração TypeScript/ESLint, Vitest Node e Playwright. A Home completa é JSX/CSS Modules com conteúdo SSR, interações locais e gráficos integrados; sua revisão independente P3.4 e aprovação humana ocorreram antes das internas. Não chamar o export servido por HTTP de build Next. Evidências e versões em [frontend-foundation.md](../../references/audits/frontend-foundation.md); portabilidade e gates da Home em [home-native.md](../../references/audits/home-native.md).

## Evidências e limites

Execução detalhada por tarefa está no PLAN, seção “Agentes, modelos e operação da ponte Claude”. Sonnet implementa Next/React/CSS, gráficos, modelos, testes e CI; Haiku executa tarefas mecânicas e documentação factual. Revisão Sonnet ocorre em outra sessão, sem garantia de diversidade de modelos; gates e aceite humano permanecem obrigatórios. Opus somente para impasses complexos. GPT mantém plano/decisões, executa gates e servidores, sem desenvolver código do site. Após duas tentativas Haiku sem edição, o usuário autorizou GPT a atualizar somente a documentação final (Opção A, 11/10), mantendo revisão Sonnet independente. Perfis Codex anteriores ficam preservados como histórico. As fases 4 e 5 podem ter dependências independentes, mas as escritas da ponte são serializadas.

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

Para testes de navegador, instalar o browser correspondente uma vez com `npx playwright install chromium firefox webkit`, executar `npm run build` e depois `npm run test:e2e`. O runner inicia e encerra duas instâncias do mesmo build: porta 3100 com `FORM_MODE=demo`, porta 3101 sem simulação. Não reutiliza servidor existente. Nesta fundação, `force-dynamic` permite resolver o modo exclusivamente no servidor em cada request; parâmetros públicos não controlam a simulação. Para desenvolvimento manual demo, definir `$env:FORM_MODE='demo'` antes de `npm run dev`; retirar a variável restaura o modo indisponível após reiniciar o processo.

Verificar `npm audit` e `npm audit --omit=dev`. Em 11/10/2026, o audit de produção retornou zero advisories; o audit completo retornou cinco high na cadeia de desenvolvimento; a cadeia de desenvolvimento ESLint/fast-glob/micromatch/braces tem GHSA-vfj7-8cjw-p6xm sem patch publicado. Não executar correções `--force` nem declarar ausência de risco. Rechecagem na etapa P6 e antes de qualquer futura publicação, incluindo atualização Next anunciada para 14/10/2026.

## Entrega local verificada em 11/10/2026

Frontend local implementado e validado em 11/10/2026. A Home nativa recebeu aprovação humana em 10/10; o aceite final do conjunto permanece pendente. Gates finais atuais (P8.3, retries 0, `logs/p8-3-final-gates.log`): lint, typecheck, 107 testes unitários em 13 arquivos, build de produção e 284 E2E aprovados, com 6 skips explicitados na [auditoria final](../../references/audits/final-qa.md): 2 capturas Home opt-in, 2 de aba oculta em headless e 2 de modifier mobile inaplicável. Os números 101 unit/228 E2E/quatro skips são histórico. Não há integração operacional nem autorização de publicação.

O E2E de contato instala `contactClock` antes do goto, com controle de 350 ms e checagem de duplicidade (2 submits → 1 timer); 10 repetições desktop + 10 mobile passaram, sem retries nem delay em produção. Fontes: WOFF2 locais Latin+ (→√≥) das mesmas famílias, versões e pesos, TTF+OFL intactos, Archivo com largura padrão 100, teste de cobertura futura e nenhuma rede externa; procedência em `references/audits/font-optimization.json`. D11–D16 estão no PLAN; D16 (Opção 1): manter o ganho de LCP como exceção local e concluir QA/documentação, sem publicação nem aceite final visual.

Versões fixadas: Next 16.4.0, React/React DOM 19.3.0, TypeScript 5.9.3, Three 0.184.0, Vitest 5.0.3, Playwright 1.64.0 e ESLint 9.39.5. Ambiente observado: Node 24.13.1/npm 11.8.0. Scripts de captura/medição, após build e com portas livres: `node scripts/qa-capture.mjs` e `node scripts/lighthouse.mjs`; Lighthouse usa porta 3200 e pacote 13.5.0 efêmero, sem dependência nova no app. Não executar medições junto aos testes.

CI GitHub contém os mesmos gates e browsers, sem deploy; execução remota não realizada. Produção local foi medida (Lighthouse 13.5, mobile, 4× CPU, slow 4G, 3 rodadas por rota): CLS 0 em todas; LCP mediano antes→depois das fontes: Home 4875,8→2808,5 ms (2808,0–2898,5), Cibersegurança 4800,7→2726,5 (2716,9–2727,2), ROSI 4878,1→2873,0 (2867,5–2969), Newsletter 4860→2783 (2719,5–2812). Melhoria de 41–43%; **meta orientativa de 2,5 s NÃO atingida**. TBT final 59,5/459/453,5/119 ms; JS transferido 173328/308974/316395/167217 bytes, inalterado; transferência de fontes 517372→75484 B (com headers). Medições anteriores de LCP 4,80–4,88 s são histórico. Baselines em `lighthouse-before-p7`, `lighthouse-before-p8-fonts`, `final-after-fonts` e `logs/p8-lcp-comparison.json`. São medidas de laboratório, não INP de campo. Revisar desempenho em hardware real, advisories/patches e integrações antes de futura publicação. Não aplicar audit --force que ofereceu downgrade Next.

### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 acima:** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.
