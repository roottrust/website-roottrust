# Desenvolvimento do frontend

## Estado vigente — 31/10/2026

O deployment atual `dpl_GymUQNaiV8UiCe6obXrArWJQ9YK3` aponta para `https://website-roottrust.vercel.app`, está READY e usa Next.js 16.4.2/Node 24, `BACKEND_MODE=public`, `FORM_MODE=off`; o modo off apenas desativa a demonstração e readiness public governa os envios reais. Rollout por arquivos, não por commit final. Manifesto publicado SHA-256 `17a2b42323a7f9984f0b94fa81d5666ba074d79f243136c7708e72a87617d9de`; base WIP `9e4b18d` mais alterações locais. Deployment compatível anterior `dpl_EZSNVGuekPfh7saEbwLQPP54WzVt`; rollback não executado.

GETs pós-deploy confirmaram 11 rotas atuais HTTP 200 e duas URLs antigas de serviço HTTP 404 sem redirect, catálogo Firestore real com duas prévias e nenhuma fixture, noindex, ausência de chave de teste e CAPTCHA real reativo ao tema global. Chromium: global light → dark → light; zero pageerror/POST ao app; widget exibiu “Confirme que é humano”, não foi resolvido nem submetido. Renato aprovou o conjunto e a publicação, declarou autorização específica Vercel Hobby, e confirmou fluxos de diagnóstico, relatório ROSI, inscrição fora da antiga allowlist, confirmação, edição e cancelamento. A autorização Vercel foi declarada pelo operador, sem verificação independente de documento contratual.

**Pendente:** ensaio editorial com Routine/Broadcast/inbox/cancelamento não executado por decisão expressa de Renato devido à cota Claude. Não substituir por rotina/API/edição antiga, repetir resultado incerto ou marcar conclusão global. O plano de integrações de 19/10 é histórico; [PLAN.md](../../PLAN.md) continua fonte única ativa e não está arquivado/concluído.

## Histórico operacional — piloto restrito, 19/10/2026

O piloto restrito foi aceito após validar diagnóstico, relatórios, newsletter agendada, confirmação/cancelamento e backup/restauração. Renato responde por acompanhamento de cotas e guarda/descarte de cópias externas. Os detalhes abaixo que descrevem apenas allowlists ou estado restrito são históricos; as decisões atuais de modo public, consentimento, capacidade e cancelamento prevalecem.


## Estado e decisões

### Entrada editorial cloud (T6.2-R3)

Workers de entrada e Discord publicados sob autorização específica em 17/10/2026. Bundles remotos conferidos; secret publish preservado. Em 18/10, cofres e ambiente/Routine configurados; entrada rejeita pedido sem credencial com 401. O primeiro ensaio cloud comprovou criação, regeneração e recusa da revisão2, sem publicação/envio daquela edição. Depois, D2 corrigiu a confirmação do trigger e foi validada; outro ensaio comprovou aprovação → prévia/Broadcast → inbox. Prompt diário e agenda seg–sex08h Brasília foram confirmados pelo operador; primeira ocorrência automática confirmada em19/10, com aprovação humana, prévia publicada e e-mail recebido. Versões, rollback e evidências no PLAN.

CPU real nas amostras do ensaio: entrada 3,166 ms (nova edição) e 2,986 ms (regeneração); Discord 6,703 ms (clique de regeneração). São amostras individuais, abaixo de 10 ms, não ensaio sob carga nem certificação de p95. No primeiro ensaio, o trigger teve efeito externo sem confirmação da resposta pelo Worker. D2 removeu suposições não documentadas de ID/URL e o retorno corrigido foi validado; isso não prova retrospectivamente a causa da primeira ocorrência. Sem retry automático.

`web/workers/newsletter-ingress/` recebe somente `POST /draft` autenticado por Bearer exclusivo e assina os bytes com HMAC `draft` para a API existente. Possui apenas token de entrada, chave draft e origem fixa; nenhum acesso a banco, bot, publish/jobs ou Resend. O proxy Claude injeta a autorização via network secret: a Routine não recebe a chave HMAC em `process.env`. Corpo total limitado a 69.632 bytes, destino fixo sem redirects, timeouts e saída saneada. Timeout pode ocorrer depois da gravação; sem repetição automática ou troca de slug.

O Worker Discord inclui headers oficiais do `/fire`, ID/slug/revisão e confirmação de início distinta do registro de regeneração. ACK imediato e decisão idempotente permanecem; decisão até 20 s, gatilho até 5 s, resposta Discord até 4 s (29 s nominais, sem garantia durável). [Prompt e runbook](../../web/ops/newsletter-routine/README.md) documentam ambiente exclusivo, configuração e fallback manual. Implementação local não configura nem ativa a agenda; evidências e autorização de deploy ficam no PLAN. LinkedIn/Buffer permanecem separados.

Validação R3 local: lint/tipos, 586 unitários, build e E2E completo com um worker (290 passes, seis skips, sem retries) passaram. A rodada anterior com dois workers teve uma falha por chunk não carregado, com `ERR_NO_BUFFER_SPACE` no Chromium; histórico e trace preservados no PLAN. Workerd isolado conferiu HMAC, rejeição de token/redirect e ACK Discord de 14 ms seguido de um único disparo simulado. Revisão independente sem bloqueantes. Não são medições de CPU Free nem ensaios cloud reais.

Plano aprovado pelo usuário em 10/10/2026. A aplicação está implementada em `web/` com Next.js App Router, React, TypeScript estrito, npm, CSS Modules, tokens CSS e Three.js direto. Não usar runtime DC/CDN, React Three Fiber, Tailwind ou Cache Components. Conteúdo essencial fica em Server Components; componentes cliente ficam restritos a interações/gráficos. Primeiro render determinístico; Baloo 2 e Archivo via `next/font/local`, mantendo as licenças OFL.

**Atualização operacional, 19/10/2026:** fluxo integral da Routine cloud e trigger D2 validados. Operador confirmou a primeira execução automática da agenda seg–sex08h Brasília: geração às08h11, envio ao Discord, aprovação humana, prévia publicada e e-mail recebido. Backup cifrado e restauração isolada de72documentos também verificados. R3.6, B1, T6.2 e T6.3 encerradas com aceite de Renato; cotas e cópias externas sob sua responsabilidade, medição ampliada adiada. Este ensaio não certifica disponibilidade futura nem autoriza publicação aberta.

**Histórico, 17/10/2026:** o plano antigo do frontend foi concluído. Naquele momento a configuração piloto liberava formulários somente para identidades de teste. Ensaios reais de diagnóstico, quatro PDFs e newsletter manual validaram revisão/regeneração/recusa/aprovação, prévia, Broadcast, confirmação/reinscrição, entrega individual e cancelamentos. ACK diferido Discord foi validado sem novo envio ao repetir aprovação. A Routine agendada, backup/restore e confirmação operacional foram concluídos em 19/10. CMS próprio e analytics permanecem fora de escopo. As decisões D01–D10 abaixo documentam a fase original; D03 foi substituída por D15 e o estado atual está no início do documento/PLAN.

### Piloto restrito preparado em código

- **Deploy de 17/10, histórico:** `BACKEND_MODE=pilot`, `FORM_MODE=off` (sem fallback demo) e `JOBS_TRIGGER_CONFIRMED=true`; allowlists e Turnstile protegiam os fluxos de teste. O deployment vigente descrito no topo é public.
- `BACKEND_MODE=pilot` ativa APIs com dependências completas e allowlists; `public` dispensa só a antiga allowlist mantendo defesas/readiness. `BACKEND_MODE=off` ou desconhecido fecha. `FORM_MODE=demo` tem precedência, apenas simula localmente e nunca envia; `FORM_MODE=off` somente desativa demo e não desliga o backend real. Sem readiness, o fluxo real responde indisponível.
- Firestore guarda leads, consentimentos, assinaturas, metadados de edições, revisões privadas, jobs, quotas e replays. Configurar `FIREBASE_SERVICE_ACCOUNT_JSON` somente no cofre de ambiente do servidor; nunca no navegador, Git ou documento. O cliente não acessa Firestore diretamente.
- Resend usa `RESEND_API_KEY`, remetentes verificados, `NEWSLETTER_EMAIL_FROM`, `NEWSLETTER_EMAIL_REPLY_TO`, `NEWSLETTER_SITE_ORIGIN`, `NEWSLETTER_PILOT_ALLOWLIST`, segmento exclusivo (`RESEND_NEWSLETTER_SEGMENT_ID`) e `RESEND_WEBHOOK_SECRET`. A inscrição requer webhook configurado; token de confirmação vale 24 h. O link de cancelamento age após clique explícito e não retira autorização comercial separada. Pedidos repetidos de job morto não afirmam nova entrega; exigem reconciliação operacional. Confirmações têm precedência na fila, inclusive após adiamento por cota; medir esse comportamento com serviços reais no piloto.
- Quota transacional é compartilhada com relatórios; os tetos locais nunca devem exceder o plano Free. Jobs, webhook e Broadcast usam autenticação/assinatura própria. Conteúdo integral fica só em revisões privadas e e-mail; o site mostra metadados, fontes e primeiro parágrafo. Respostas das ferramentas não entram no backend.
- Configuração inicial verificada: contas Free, domínio/remetente, allowlists, segmento vazio exclusivo, Turnstile, Worker/Discord, gatilho HMAC, WAF e canal privado de diagnóstico confirmado. Ensaios humanos dos fluxos principais e confirmação/cancelamentos concluídos; geração agendada com aprovação humana e backup/restauração isolada validados em19/10. Permanecem métricas de quota, medição de retenção ou exceção explícita e procedimentos de retenção de contatos Resend, mensagens Discord e backups. Preflight de leitura não substitui esses ensaios.

| ID | Decisão aprovada |
|---|---|
| D01 | Completar primeiro o frontend; integrações e publicação ficam para outra etapa. |
| D02 | Preservar os 12 exports aprovados, corrigindo bugs e requisitos auditados sem redesenho. |
| D03 | Registro original: entregar somente tema escuro. **Substituído por D15** (claro/escuro com mesma composição); a especificação visual atual não é exclusiva escura. |
| D04 | Aplicação em `web/`; exports preservados em `references/claude-design/`. |
| D05 | Exatamente seis documentos canônicos em `docs/web`; migrar informação única antes de excluir substituídos. |
| D06 | GPT-6.1 Sol · XHigh orquestra e decide; código via MCP Claude, Sonnet/Haiku explícitos; GPT executa gates/servidores e, por autorização posterior, a documentação final; Opus somente consulta complexa. Uma escrita por vez; limite global três workers. Fable excluído por indisponibilidade no Pro. |
| D07 | Aprovação humana da Home antes das páginas internas; aceite humano final do conjunto. |
| D08 | `/privacidade` provisória, descrevendo honestamente a operação local. |
| D09 | Formulários ativos com validação completa, preparados para futura integração. |
| D10 | Simulação local de carregamento/sucesso/erro somente com `FORM_MODE=demo` explícito; nenhum envio real. |

## Formulários e segurança de estado

Um adaptador interno único separa a interface da submissão. Os campos ficam ativos. Validar no cliente e na API, associar erros aos campos, mover foco quando necessário, impedir envio duplicado, mostrar andamento e preservar os dados em falha. Nunca simular sucesso fora do demo. `FORM_MODE=demo` tem precedência e produz apenas andamento, pedido aceito aguardando confirmação e erro locais, sem envio. `FORM_MODE=off` desativa somente o demo; `BACKEND_MODE=pilot` exige allowlist/configuração, e `public` aceita visitantes fora da antiga allowlist com as mesmas defesas e readiness por fluxo. `BACKEND_MODE=off`/desconhecido fecha. Formulários reais permanecem ativos no deployment atual.

Diagnóstico exige Nome, Empresa e WhatsApp. Retorno por ligação ou WhatsApp no próximo dia útil só pode ser comunicado após recebimento aceito. Newsletter usa apenas e-mail; `FORM_MODE=demo` pode simular andamento, pedido aceito aguardando confirmação e erro/retry, sem declarar confirmação, entrega ou cancelamento. Pedido de relatório contém somente contato e ID da ferramenta, nunca respostas ou resultados; newsletter é uma escolha separada.

## Rotas

`/`; `/servicos/ciberseguranca`; `/servicos/infraestrutura`; `/servicos/software`; `/ferramentas/rosi`; `/ferramentas/shadow-ai`; `/ferramentas/divida-tecnica`; `/ferramentas/migracao-para-nuvem`; `/newsletter`; `/newsletter/edicoes`; `/newsletter/edicoes/[slug]`; `/privacidade`; 404 nativa. As URLs antigas `/servicos/infraestrutura-em-nuvem` e `/servicos/desenvolvimento-de-software` respondem 404 sem redirect. O filtro editorial “Infraestrutura em nuvem” permanece. Não criar Sobre, hub de ferramentas ou diagnóstico dedicado.

## Ferramentas e newsletter

Modelos F01–F29 são funções TypeScript puras com entradas verificadas. Respostas só em memória, sem URL, storage, logs, analytics, persistência ou associação a e-mail; limpar ao sair e ao retornar. Editar invalida o resultado. Trocar 12/36 meses exige revisar totais. Desconhecido/vazio não é zero; preservar resultados negativos; tratar denominador zero, parsing pt-BR e overflow explicitamente. Shadow AI não calcula score.

Catálogo local da demonstração contém três amostras; catálogo public usa edições reais (duas prévias confirmadas em GET após deploy), metadados/fontes/primeiro parágrafo, sem indexação. Arquivo filtra por pilar, usa dois itens por página e reinicia na página 1 ao trocar filtro. Prévia expõe somente o primeiro parágrafo editorial completo, mantendo a edição escolhida no formulário. Pedido geral escolhe a edição aprovada mais recente. Slug inválido responde 404. Corpos completos ficam fora de HTML/RSC/JS/maps/assets públicos; corpos em [`references/editorial`](../../references/editorial/newsletter-editorial-samples.md) são privados.

## Tema, header e CAPTCHA — contrato atual

Tema claro/escuro segue `prefers-color-scheme` até a primeira escolha manual; depois o botão sem texto alterna Claro/Escuro. Sol indica claro, Lua escuro; logo com 60px no desktop (≥960), 44px no mobile, barra76 e controles44. A escolha manual persiste; não há opção UI para voltar a Sistema. SSR inicial é determinístico, bootstrap evita flash e storage negado não quebra o seletor.

Cloudflare Turnstile renderiza o tema global efetivo de `html` em qualquer seção, inclusive formulário numa faixa de cor local distinta. O iframe define o tema na criação: ao cruzar o tema global claro/escuro, desmontar/criar widget, invalidar token/feedback solved anterior e exigir nova verificação, preservando campos e fences de geração/callback/cleanup; callback obsoleto não altera estado. Mudança manual sem mudança do tema efetivo não remonta o widget. Não manipular interior do iframe, branding, escala ou recorte.

## Capacidade, consentimento e cancelamento em public

Tetos locais Resend: 100 e-mails transacionais por dia UTC e 3.000 por mês; confirmação/edição individual/relatórios compartilham capacidade, e reservas/tentativas contam. Marketing Free é até 1.000 contatos. Esses limites locais não comprovam uso total compartilhado da conta nem garantem custo zero.

Baseline de marketing é completa e paginada até 100 contatos por chamada e 12 páginas por scan, refresh a cada 4h e validade de 8h, com margem de 50. Geração e sequência protegem a publicação concorrente dos scans; epoch e reservas cercam consentimento/capacidade. Baseline ausente, incompleta, vencida ou sem vaga fecha admissão; a ausência isolada do campo de geração não é uma condição desse guard. Não varrer todos os contatos a cada submit. Cancelamento tem readiness independente de From, quota transacional e Turnstile e registra intenção mesmo com novos envios pausados. Não reativar contatos genericamente. Broadcast exige aprovação humana válida por 24h, consent epoch e segmento exclusivo confirmado, com efeitos incertos sem duplicação. Sem promessa de atomicidade do provedor.

## Gráficos e acessibilidade

Pausar animação durante a sessão SPA; responder dinamicamente a `prefers-reduced-motion`; não animar quando a preferência reduzida estiver ativa, a sessão estiver pausada, a aba oculta ou o elemento fora da área relevante. Pausa/redução deixa apresentação estática. Aba oculta suspende desenho e timers. Em falha/perda de contexto mostrar asset aprovado, sem reconstruir assinatura/logo. Descartar recursos GPU, listeners e loops; impedir inicialização assíncrona após desmontagem.

Conteúdo, rótulos e ações essenciais continuam utilizáveis sem Canvas/WebGL, JavaScript decorativo ou hover. Menu deve operar por teclado/Escape e devolver foco. Seletor de serviços, processo, terminal e abas precisam de navegação/semântica acessíveis. Não declarar acessibilidade certificada.

## Fases e gates

P1.1 plano aprovado e registrado; P1.2 exports preservados com hashes e baseline; P1.3 documentação consolidada; P1.4 instruções/agentes revisados. P2–P5 concluídos tecnicamente: aplicação/assets, gráficos/Home, serviços/ferramentas, newsletter/privacidade/metadata/404. Home aprovada em 10/10 antes das internas. P6 tem QA local documentado e revisão documental concluída; recebeu aceite humano final com ciência dos limites; plano arquivado em `docs/plans/frontend-corrections-completed.md`. Não declarar fase futura concluída por preparação parcial.

Os critérios completos de cada tarefa incluem comandos reais de lint/tipos/testes/build, smoke em produção, validação desktop/mobile/teclado, modelos/limites e inspeção de conteúdo público. Há `web/package.json`, lockfile, configuração TypeScript/ESLint, Vitest Node e Playwright. A Home completa é JSX/CSS Modules com conteúdo SSR, interações locais e gráficos integrados; sua revisão independente P3.4 e aprovação humana ocorreram antes das internas. Não chamar o export servido por HTTP de build Next. Evidências e versões em [frontend-foundation.md](../../references/audits/frontend-foundation.md); portabilidade e gates da Home em [home-native.md](../../references/audits/home-native.md).

## Evidências e limites

Execução detalhada por tarefa está no PLAN. Na fase do frontend, Sonnet implementou Next/React/CSS, gráficos, modelos, testes e CI; Haiku recebeu tarefas delimitadas. Isso é histórico. Após o limite da ponte Claude, o usuário autorizou GPT a concluir o código restante em 13/10/2026; revisão independente e gates permanecem obrigatórios. Opus não foi necessário. As escritas da ponte, quando retomadas, são serializadas.

`claude` usa `cwd` na raiz Git, modelo explícito e leitura por padrão. Escrita exige tag `[claude:escreve]`, escopo delimitado e hash de checkpoint WIP LOCAL autorizado em 10/10/2026, após inspeção de segredos/gerados. Esse checkpoint pode incluir trabalho anterior; não autoriza commit final, push, PR ou deploy. Não editar em paralelo a escrita Claude. Registrar sessão/modelo/hash/gates no PLAN; consultas independentes não têm shell e recebem evidências de testes. Após cada escrita executar lint/typecheck/unit/build/e2e; depois de três arquivos exigir revisão do diff. Não configurar esforço nem alterar defaults globais; a ponte não permite sub-agents headless, e Fable não deve ser chamado. Não fazer fallback silencioso.

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

`npm run build` usa webpack (`next build --webpack`): o host de build da Hostinger não tem GLIBC 2.29, o SWC nativo não carrega e o Turbopack exige bindings nativos; o painel não permite alterar o comando de build. `npm run build:turbopack` mantém o build Turbopack para uso local. Os gates e o E2E validam o build webpack, o mesmo publicado.

Para testes de navegador, instalar o browser correspondente uma vez com `npx playwright install chromium firefox webkit`, executar `npm run build` e depois `npm run test:e2e`. O runner inicia e encerra duas instâncias do mesmo build: porta 3100 com `FORM_MODE=demo`, porta 3101 sem simulação. Não reutiliza servidor existente. Nesta fundação, `force-dynamic` permite resolver o modo exclusivamente no servidor em cada request; parâmetros públicos não controlam a simulação. Para desenvolvimento manual demo, definir `$env:FORM_MODE='demo'` antes de `npm run dev`; retirar a variável restaura o modo indisponível após reiniciar o processo.

Verificar `npm audit` e `npm audit --omit=dev`. Medição histórica de 11/10/2026 (não é audit atual): o audit de produção retornou zero advisories; o audit completo retornou cinco high na cadeia de desenvolvimento; a cadeia de desenvolvimento ESLint/fast-glob/micromatch/braces tem GHSA-vfj7-8cjw-p6xm sem patch publicado. Não executar correções `--force` nem declarar ausência de risco. Rechecagem antes de cada publicação. No preflight de 17/10/2026, advisories oficiais de 14/10 exigiram atualizar Next para 16.4.2 (correções em 16.4.1) e alinhar React/React DOM a 19.3.1; npm audit de produção sozinho havia retornado zero na versão antiga. Evidências e gates desta atualização no PLAN.md.

## Histórico do piloto: leads, consentimento comercial e retenção

No piloto restrito, relatórios aceitavam somente e-mails de `NEWSLETTER_PILOT_ALLOWLIST` e diagnóstico somente números de `DIAGNOSTIC_PILOT_ALLOWLIST` (CSV de móveis brasileiros canônicos com 11 dígitos, sem +55/formatação). Ambas as listas eram obrigatórias, com no máximo 100 entradas; vazias/inválidas fechavam a disponibilidade. A API normalizava antes da comparação e retornava 403 genérico para externos sem banco/Turnstile; jobs revalidavam antes de rede/PDF/cota. Listas ficavam no servidor e nunca eram serializadas para o navegador. Remover uma identidade também impedia jobs pendentes dessa identidade. O modo `pilot` mantém allowlists; o modo `public` foi autorizado e publicado em 31/10, preservando as demais defesas e readiness por fluxo.

- **Agendador ativo no piloto restrito (17/10/2026):** [`web/workers/jobs-scheduler`](../../web/workers/jobs-scheduler/README.md) faz POST HMAC de escopo `jobs` a cada cinco minutos (288 invocações/dia), sem endpoint HTTP público. Instalações novas devem iniciar com `JOBS_ENABLED=false`; na ativação de 17/10 estava `true`, com duas chamadas HMAC200 e renovação/limpeza de nonce no Firestore. Naquele deployment restrito, `JOBS_TRIGGER_CONFIRMED=true` e somente identidades piloto podiam solicitar envios após Turnstile; em public, a antiga allowlist não se aplica. `INTERNAL_KEY_JOBS` é Secret exclusivo, compartilhado somente com a API. Não segue redirects nem repete a chamada na mesma execução. Primeira amostra ativa:2,131ms CPU/1subrequest/0errors, unidade confirmada no schema Cloudflare; não comprova comportamento sob carga. Ensaios do piloto foram concluídos em 19/10; o novo ensaio editorial público segue pendente. HTTP200 do processador não comprova entrega de todos os jobs nem uso total das cotas.
- **Origem:** cada lead guarda `origins` (`diagnostico`, `relatorio:<ferramenta>`) e um evento por interação em `lead_events`. Leads são por identidade (WhatsApp ou e-mail) e nunca são mesclados; respostas/resultados de ferramentas não são aceitos nem gravados.
- **Consentimento comercial:** só o booleano `commercialConsent: true` do pedido de relatório concede, registrando data e origem (`commercialConsentAt`, `commercialConsentOrigin`). Ausência, texto (`"true"`) ou qualquer pedido de diagnóstico nunca concede nem revoga; a solicitação de diagnóstico não é autorização de marketing. A UI do checkbox é de T3.2.
- **Retirada:** não há endpoint público, pois o site não comprova a posse do e-mail. Canal manual: a pessoa escreve para `contato@roottrust.com.br` (ou responde a um e-mail enviado pela Root Trust) a partir do endereço cadastrado; a equipe confere que o pedido veio dele e executa localmente `withdrawCommercialConsent(store, DATA_ID_SECRET, email, new Date())` (`web/src/lib/server/repository.ts`), que exige as credenciais do servidor. Resultado: `commercialConsent=false`, data de retirada e evento `consentimento:retirada`; idempotente e sem prorrogar a retenção. Cancelar a newsletter não revoga este consentimento e vice-versa. O comando CLI `withdraw-consent` já está implementado e descrito abaixo.
- **Retenção:** o processador de jobs (`POST /api/internal/jobs/process`) também remove, em lotes limitados (10 leads por chamada, até 200 eventos e 200 diagnósticos por lead), leads cuja última interação tem seis meses ou mais (meses de calendário em UTC), junto com **todos** os seus eventos, diagnósticos e jobs de notificação, independentemente da data de cada filho: a inatividade do lead é a prova de obsolescência (ex.: retirada de consentimento há 1 mês em lead sem interação há 7 meses é apagada junto). Filhos são apagados antes do lead; cada página de filhos relê o lead na mesma transação e aborta se ele foi tocado depois (corrida), preservando tudo. Se a exclusão falhar, o lote ou o orçamento de tempo acabar, o lead permanece e a próxima chamada retoma. A resposta traz `leadPurge` (`leads`, `records`, `partial`, `failed`, `deferred`) e `deadlineReached`; `failed` > 0 ou `deferred`/`partial` recorrentes exigem investigação. Logs trazem só códigos curtos, sem IDs nem dados de contato.
- **Orçamento de tempo do processador (`maxDuration` 60 s):** jobs só iniciam enquanto o próximo handler (20 s) cabe até 35 s (`JOBS_BUDGET_MS`); de 35 s a 52 s (`MAINTENANCE_DEADLINE_MS`) a janela é reservada para retenção e limpeza de contadores, portanto jobs nunca a consomem. A retenção roda antes da limpeza de contadores; nenhum passo novo começa após 52 s (sobram ~8 s para o passo em andamento) e o que ficou é reportado (`deferred`, `partial`, `deadlineReached`, log `jobs_maintenance_deadline`) e retomado na chamada seguinte. **Gate T6.2:** os valores 35/52 s são estimativas sem medição; medir com Firestore real a latência por transação, a duração de um lead com 200+200 filhos e o custo mínimo por chamada (≥1 leitura da consulta de leads), e ajustar lotes, frequência do agendador e prazos. Não há medição real deste cenário. Em19/10/2026, o operador determinou adiar o ensaio e priorizar a entrega do piloto restrito; não é bloqueante desse encerramento nem evidência de capacidade sob carga.
- **Limites:** mensagens já postadas no canal Discord de diagnóstico não são apagadas pelo código (não guardamos o ID da mensagem); a limpeza é manual no canal. A rotina de jobs já remove em lotes assinaturas canceladas há seis meses e seus registros de entrega, apagando a assinatura após limpar os filhos. Confirmação pendente, sincronização de contato não resolvida ou tentativa de entrega iniciada sem envio confirmado impedem essa remoção. Assinaturas confirmadas ativas não estão abrangidas por essa regra. Cópias exportadas (CSV/backup, T2.3) não são alcançadas pela limpeza.

## Comandos operacionais locais: CSV, retirada e backup (T2.3)

Código em `web/scripts/ops/`, nunca importado pelo site nem exposto por rota. Execute em `web/` (Node 24, sem dependência nova): `node --import ./scripts/ops/register.mjs scripts/ops/cli.ts <comando>`. Credenciais: `FIREBASE_SERVICE_ACCOUNT_JSON` ou credenciais padrão do Google (somente leitura basta para exportar e fazer backup), sempre por variável de ambiente, nunca em arquivo versionado. As mensagens do comando não imprimem e-mails, nomes nem conteúdo de documentos.

| Comando | O que faz | Variáveis |
|---|---|---|
| `export-commercial --out web/ops-data/comercial.csv` | CSV só de leads com e-mail e `commercialConsent === true` atual (colunas: e-mail, nome, empresa, data e origem do consentimento). Sem WhatsApp. Pedido sem checkbox, consentimento retirado ou texto `"true"` ficam de fora. | credenciais |
| `export-diagnostics --out web/ops-data/diagnosticos.csv` | CSV separado dos pedidos de diagnóstico (ID, nome, empresa, WhatsApp, datas). É atendimento, não base de marketing; não cruzar com o CSV comercial. | credenciais |
| `withdraw-consent pessoa@exemplo.com` | Chama `withdrawCommercialConsent` (ver Retirada acima); imprime só `withdrawn`, `no_consent`, `not_found` ou `invalid_email`. | `DATA_ID_SECRET`, credenciais |
| `backup --out web/ops-data/AAAA-MM-DD.rtbk` | Backup cifrado de todas as coleções. | `BACKUP_PASSPHRASE`, credenciais |
| `restore --in web/ops-data/AAAA-MM-DD.rtbk` | Restaura **somente** em emulador Firestore local. | `BACKUP_PASSPHRASE`, `FIRESTORE_EMULATOR_HOST=localhost:PORTA` |

**E-mail em argv.** `withdraw-consent E-MAIL` recebe o endereço como argumento: ele fica no histórico do shell e na lista de processos do sistema enquanto o comando roda. Limpe a entrada do histórico depois (ou use sessão restrita); a CLI nunca imprime o e-mail.

**CSV.** UTF-8 com BOM, CRLF, todos os campos entre aspas (RFC 4180). Em todas as células, inclusive cabeçalho, caracteres de controle viram espaço e valores que começam (após espaços) com `=`, `+`, `-` ou `@` recebem `'` na frente, para planilhas não executarem fórmulas. Limite de 50.000 linhas. O CSV contém dados pessoais em texto legível: use, entregue pelo canal acordado e apague.

**Onde gravar.** `--out` nunca sobrescreve arquivo existente (cria com modo 0600; no Windows o modo é ignorado, proteja a pasta) e é recusado se ficar dentro do repositório, exceto em `web/ops-data/` (criar a pasta antes; ignorada pelo Git junto com `*.rtbk`). Preferir um caminho fora do repositório. O diretório pai precisa existir (o comando não cria pastas; falha com mensagem se não existir) e é resolvido com `realpath` antes de gravar, então symlink/junction que leve para dentro do repositório é recusado; a checagem é por segmentos de caminho (`..x` dentro do repo conta como dentro). Antes de qualquer commit, `git status` não deve listar CSV nem `.rtbk`.

**Backup.** AES-256-GCM autenticado (`node:crypto`), chave derivada por scrypt (N=2^17, r=8, p=1; na leitura só se aceita N de 2^14 a 2^18, o máximo que cabe em `maxmem` de 512 MiB) da senha, com salt e nonce aleatórios novos por arquivo; o cabeçalho (versão, parâmetros KDF, salt, nonce) é autenticado. O arquivo não tem nome de coleção, campo nem valor em claro; o texto claro existe só em memória, nunca em arquivo temporário. Senha errada, byte alterado, truncamento e dado extra falham com a mesma mensagem, sem restaurar nada. Limites: senha de pelo menos 16 caracteres (use gerenciador de senhas; perdê-la perde o backup, não há recuperação), 128 MiB de conteúdo (o backup falha em vez de truncar) e apenas valores JSON nos documentos (o modelo atual usa strings ISO; `Timestamp`/`GeoPoint`/bytes fazem o backup falhar). Guarde a senha separada do arquivo. O backup é uma fotografia sem consistência transacional entre coleções (leitura paginada de 500) e não segue a retenção de seis meses: apagar um lead não o remove de backups já feitos, então defina e cumpra prazo de descarte dos arquivos.

**Restore.** Recusa sem `FIRESTORE_EMULATOR_HOST` apontando para `localhost`, `127.0.0.1` ou `[::1]`, antes de ler o arquivo ou abrir qualquer conexão; usa app com projeto `demo-roottrust-restore`, sem credencial explícita e roteado ao emulador por `FIRESTORE_EMULATOR_HOST` (validado como loopback), portanto não alcança o projeto do piloto. Ordem: decifrar, validar o arquivo inteiro (formato, coleções, IDs, duplicatas, contagens do rodapé), exigir todas as coleções vazias no destino e só então gravar em lotes de até 500 documentos, sem sobrescrever. Os lotes não são atômicos entre si: se uma gravação falhar no meio, descarte o emulador e repita. Ensaio sugerido: `firebase emulators:start --only firestore --project demo-roottrust-restore` (CLI do Firebase, instalada pelo operador; este projeto não a instala) e, em outro terminal, `FIRESTORE_EMULATOR_HOST=localhost:8080 BACKUP_PASSPHRASE=… node --import ./scripts/ops/register.mjs scripts/ops/cli.ts restore --in …`.

**Backup/restauração verificados, 19/10/2026.** Backup real cifrado de72documentos/16coleções criado; tamanho e SHA-256 conferidos. No emulador oficial Google,501fixtures validaram múltiplos lotes, paginação/startAfter e atomicidade de batch.create. Depois, o backup real foi restaurado em demo-roottrust-restore/127.0.0.1:8789: conteúdo integral comparado em memória, contagens72/16 conferidas também pelo assistente, paginação3 e recusa de destino não vazio/senha incorreta/arquivo adulterado/host remoto aprovadas. Nenhuma escrita no banco real, senha ou dado pessoal exposto. Container/rede de teste descartados após conferência; backup cifrado permanece privado. É prova de recuperação deste arquivo e modeloJSON, não de PITR/consistência transacional ou recuperação de tipos futuros. Evidências no PLAN. Retirada de consentimento continua manual e não remove contatos de CSVs ou backups já gerados; responsabilidade e descarte dessas cópias ainda precisam ser definidos. Demais critérios operacionais deT6.2 permanecem pendentes.

## Entrega local verificada em 11/10/2026

Frontend local validado em 11/10/2026, com aceite humano posterior. Gates P8.3 e P9.2 (107 unitários/284 E2E/6 skips) são históricos e constam na [auditoria final](../../references/audits/final-qa.md). O plano arquivado registra os gates da integração e os ensaios reais concluídos até19/10, incluindo entregas e execução agendada confirmadas pelo usuário. Historicamente, em 17–19/10, só deploy/ativação restrita estavam autorizados. A publicação em modo public foi autorizada e executada em 31/10, conforme o estado vigente no início deste documento.

O E2E de contato usa a API `page.clock`, instalada antes do goto, com controle de 350 ms e checagem de duplicidade (2 submits → 1 timer); 10 repetições desktop + 10 mobile passaram, sem retries e sem alterar o atraso de 350 ms da produção. Fontes: WOFF2 locais Latin+ (→√≥) das mesmas famílias, versões e pesos, TTF+OFL intactos, Archivo com largura padrão 100, teste de cobertura futura e nenhuma rede externa; procedência em [font-optimization.json](../../references/audits/font-optimization.json). D11–D16 estão no PLAN; D16 (Opção 1): manter o ganho de LCP como exceção local e concluir QA/documentação, sem publicação nem aceite final visual.

Versões fixadas: Next 16.4.2, React/React DOM 19.3.1, TypeScript 5.9.3, Three 0.184.0, Vitest 5.0.3, Playwright 1.64.0 e ESLint 9.39.5. Ambiente observado: Node 24.13.1/npm 11.8.0. Scripts de captura/medição, após build e com portas livres: `node scripts/qa-capture.mjs` e `node scripts/lighthouse.mjs`; Lighthouse usa porta 3200 e pacote 13.5.0 efêmero, sem dependência nova no app. Não executar medições junto aos testes.

CI GitHub contém os mesmos gates e browsers, sem deploy; execução remota não realizada. Produção local foi medida (Lighthouse 13.5, mobile, 4× CPU, slow 4G, 3 rodadas por rota): CLS 0 em todas; LCP mediano antes→depois das fontes: Home 4875,8→2808,5 ms (2808,0–2898,5), Cibersegurança 4800,7→2726,5 (2716,9–2727,2), ROSI 4878,1→2873,0 (2867,5–2969), Newsletter 4860→2783 (2719,5–2812). Melhoria de 41–43%; **meta orientativa de 2,5 s NÃO atingida**. TBT final 59,5/459/453,5/119 ms; JS transferido 173328/308974/316395/167217 bytes, inalterado; transferência de fontes 517372→75484 B (com headers). Medições anteriores de LCP 4,80–4,88 s são histórico. Dados: baselines [before-p7](../../references/audits/final-qa/lighthouse-before-p7/summary.json) e [before-p8-fonts](../../references/audits/final-qa/lighthouse-before-p8-fonts/summary.json), resultado [after-fonts](../../references/audits/final-qa/lighthouse-after-fonts/summary.json) e [comparativo](../../references/audits/final-qa/logs/p8-lcp-comparison.json). São medidas de laboratório, não INP de campo. Revisar desempenho em hardware real, advisories/patches e integrações antes de futura publicação. Não aplicar audit --force que ofereceu downgrade Next.

### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 acima:** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.


## Responsabilidade operacional e limites do aceite

Renato assumiu em19/10/2026 a conferência das cotas e a guarda/descarte de cópias externas. O piloto restrito recebeu seu aceite final; [encerramento e evidências](../plans/integrations-pilot-completed.md#encerramento-e-aceite-final--19102026).

- Conferir os painéis de uso e entregas de Firestore, Resend, Cloudflare e Vercel; investigar falhas e pausar processamento/envios quando necessário. As cotas são compartilhadas com outros usos das contas. Não habilitar faturamento automaticamente.
- Preservar backup cifrado e senha separada, acesso mínimo e backup manual semanal/antes de migrações. Registrar finalidade, local e descarte previsto de cada cópia; CSV deve ser apagado após uso. Renato responde também pelas mensagens Discord e contatos nos provedores. Não foi aprovado um prazo numérico universal para essas cópias; a limpeza automática Firestore não as alcança.
- Uso Firestore via Monitoring não pôde ser consultado (403); uso total Resend não foi conferido pelo agente. Medição de retenção com200+200filhos adiada pelo usuário. Não há certificação de custo zero ou capacidade sob carga.
- Notificação Discord dos relatórios é melhoria futura adiada. Entrega dos quatro PDFs foi comprovada.
- O modo `pilot` mantém allowlists; o modo `public` foi autorizado e publicado em 31/10, preservando as demais defesas e readiness por fluxo. Hospedagem definitiva/migração segue fora do escopo. Não há commit final ou push autorizado; este texto não substitui autorização própria para novo deploy.
