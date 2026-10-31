# Revisão do website Root Trust — temas, conteúdo, feedback e formulários

**Data:** 30/10/2026. **Estado:** APROVADO por Renato em 30/10/2026 para implementação na nova conversa. Revisão independente concluída. **Não iniciar código nesta conversa; gates visuais/Privacidade permanecem separados.**

Este é o plano ativo e a fonte única de tarefas. O [plano anterior](docs/plans/integrations-pilot-completed.md) permanece histórico; o handoff apenas orienta a próxima conversa. Não criar SQL todos, cópia de tarefas ou plano concorrente. As decisões atuais substituem as restrições históricas de tema escuro exclusivo, piloto como único modo real e Pentest com destaque visual superior. Marca, fórmulas, sigilo dos resultados e proteções continuam válidos.

## 1. Problema e resultado esperado

O site aprovado precisa de conteúdo mais completo, métodos próprios por serviço, marca maior no header, feedback integrado ao design e temas claro/escuro em todas as rotas. Os envios reais foram comprovados no piloto, mas o domínio de demonstração hoje apresenta formulários indisponíveis.

A entrega inclui a versão integrada para avaliação dos sócios e a capacidade técnica de atender visitantes fora da antiga allowlist. O destino solicitado para publicação é a Vercel; a ativação pública depende da revisão de Privacidade e da elegibilidade efetiva do destino/plano, sem presumir uma exceção por chamar a versão de demonstração. O usuário já possui hospedagem definitiva; identificar ou migrar esse destino não faz parte desta etapa. Não contratar Vercel Pro nem prometer operação gratuita ilimitada.

### Incluído

- Diagnosticar a indisponibilidade atual e acrescentar modo público explícito, preservando piloto, desligado e demonstração.
- Diagnóstico, quatro relatórios, inscrição/confirmação/cancelamento, catálogo real e Broadcast a confirmados após aprovação humana.
- Dois temas, sistema inicial, escolha persistida, adaptação dos gráficos e assinaturas oficiais, marca maior e feedback compartilhado.
- Revisar todos os textos públicos, aplicar hero exato de Cibersegurança e métodos por serviço; atualizar Privacidade.
- Aceite visual intermediário, revisão de coleta, testes proporcionais, deploy Vercel e ensaio controlado.

### Fora do escopo

Hospedagem definitiva/DNS; contratação ou cobrança; analytics; CMS; novas páginas comerciais; novas ferramentas/fórmulas; revisão de PDFs, e-mails transacionais e edições editoriais existentes; mudança de prompt/agenda da Routine; notificação Discord dos relatórios já adiada; testes de carga/esgotamento e benchmark de retenção com 400 filhos dispensado; apresentações em roottrust-docs; identidade anterior/árvore/Bonsai/Eco.

## 2. Pesquisa e estado verificado

### Histórico e ambiente

- Piloto aceito em 19/10: diagnóstico, quatro PDFs, newsletter manual e agendada, confirmação/cancelamento e backup/restauração ensaiados. Renato assumiu cotas e cópias externas; custo zero não foi certificado.
- Commit/push anterior: `32c19e3209a2d252340f1dbd3da9750d3c3f56b1`; árvore limpa no início desta entrevista.
- Fontes locais: conversa, seis canônicos, manual/catálogo e plano arquivado. Não foi consultado banco de sessões SQL nem SATE/Ford, que não se aplicam.
- Next 16.4.2, React 19.3.1, TS estrito, CSS Modules e Three.js direto são a baseline observada; revalidar advisories antes de publicar.
- Vitest/Playwright e `.github/workflows/frontend.yml` já existem. Não criar outro framework de testes.

### Como testávamos e por que há outro endereço

Consulta Vercel somente leitura em 30/10 confirmou:

| Papel | Deployment e endereço | Observação |
|---|---|---|
| Atual | `dpl_APgc8DdZUo44L4uW8QpwKrSyGYqa` / `website-roottrust-9ph9fblpy-renato-soares-projects.vercel.app` | READY, main/commit 32c19e3; recebe o alias `website-roottrust.vercel.app`. |
| Ensaiado | `dpl_6p67GD8ghvyD8qrP99yNboXNb74H` / `website-roottrust-8irmn7e8k-renato-soares-projects.vercel.app` | READY; usado na ativação controlada anterior. |
| Projeto | `prj_bW0BNojgUfQlnOYO0tnJalWks7Gp` | Team `team_KP1Pur4lHLz87HTFfcOGhUfh`; reconferir antes de escrita. |

Os testes reais anteriores usavam **o mesmo alias principal**, então promovido ao deployment piloto. O hostname imutável antigo explica o outro endereço lembrado; sua existência não comprova que hoje esteja acessível/configurado.

GET de `/`, `/newsletter` e `/ferramentas/rosi` no alias principal retornou 200 com configuração pública `mode: unavailable`, sem `pilot`. Não houve POST, envio, consulta de credenciais ou leitura de `.env*`. **Causa não comprovada:** a troca de deployment é fato; escopo de variáveis, valores inválidos e overrides são hipóteses. Não restaurar alias nem ativar backend durante o planejamento.

### Achados do código

- `web/src/lib/server/mode.ts`: apenas off/demo/pilot; valor desconhecido cai em off.
- `http.ts`, configs de diagnóstico/relatório/newsletter/Broadcast e webhook têm guards de piloto; allowlists não são apenas configuração no painel.
- `features/newsletter/current.ts` e `source.ts` usam demonstrações quando o modo não é pilot. Public incompleto pode mostrar fixtures em vez de edições reais.
- `forms.ts`, `useLocalSubmission.ts`, `FormStatus.tsx`, três formulários e `ToolPage.tsx` também distinguem pilot. O transporte lê `retryAfter`, mas o hook não conserva toda essa informação.
- Feedback atual é um parágrafo com classe status/role status; falta estrutura visual por estado e ação contextual.
- FAQ em `features/newsletter/LandingPage.tsx`: “Com que frequência recebo?” → “Em dias úteis.”
- `features/services/content.ts` já tem descrições específicas, mas cinco títulos `stages` globais; `ServicePage.tsx` combina `stages[index]` com descrições por serviço.
- Header declara 158×34 px; conferir CSS, viewBox e área útil antes de ampliar sem distorção.
- `tokens.css` fixa dark; CSS Modules, Canvas2D e uniforms Three contêm cores literais. Apenas mudar o fundo não adapta o site.
- Branding v2 possui assinatura positiva e negativa. Não herdar a antiga suposição de que falta logo para fundo claro.
- Privacidade ainda descreve piloto/provisório, incompatível com coleta aberta sem revisão.

### Fontes oficiais consultadas em 30/10

| Fonte | Consequência |
|---|---|
| [Vercel env](https://vercel.com/docs/environment-variables) | Conferir escopo e novo deployment; não presumir alteração retroativa de build nem expor valores. |
| [Vercel Hobby](https://vercel.com/docs/plans/hobby) / [Fair Use](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage) | Hobby é pessoal/não comercial; publicidade de serviços está nos exemplos de uso comercial. Não há exceção documentada por nomear a versão como demonstração. Plano efetivo atual não foi comprovado pela consulta de metadados. |
| [Resend quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits) / [pricing](https://resend.com/pricing) | Free transacional: 100/dia UTC e 3.000/mês; marketing até 1.000 contatos. Broadcast não consome quota transacional; uso é compartilhado na conta. |
| [WAI status](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) / [notificações](https://www.w3.org/WAI/tutorials/forms/notifications/) | Erros associados aos campos, anúncios programáticos e foco deliberado, sem depender só de cor. |
| [WCAG contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Texto comum 4,5:1 e grande 3:1; não alegar certificação por uma checagem de cores. |
| [MDN preferência](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) / [color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) | Coordenar preferência SO, seleção manual e controles nativos. |
| [Next checklist](https://nextjs.org/docs/app/guides/production-checklist) | Preservar SSR, fontes locais e limites cliente; revalidar segurança antes de deploy. |

Não foi usado Firecrawl nesta entrevista. Não atribuir novas chamadas a pesquisa histórica. Sondagem de HTML não é ensaio de API ou auditoria dos provedores.

## 3. Decisões validadas via grill-me

| ID | Tema | Decisão e consequência |
|---|---|---|
| D01 | Acesso | Formulários para visitantes, com as proteções existentes; não remover guardas do piloto. |
| D02 | Tema | Claro/escuro em todas as páginas; sistema inicial e escolha preservada. |
| D03 | Feedback | Erros junto dos campos + painel no formulário; sem toast/modal padrão. |
| D04 | Copy | Revisar todos os textos públicos do site. |
| D05 | Método | Fluxo próprio por pilar; Home mantém o processo geral. |
| D06 | Hospedagem | Já existe destino futuro; publicar na Vercel para mostrar aos sócios, migração/contratação depois. |
| D07 | Shell | Header/footer acompanham tema com assinatura oficial adequada. |
| D08 | Marca | Ampliar assinatura horizontal completa; alvo inicial 25–30% desktop, validar mobile. |
| D09 | Limite editorial | Apenas site; PDFs, e-mails transacionais e edições existentes não serão reescritos. |
| D10 | Cibersegurança | Todas as frentes com o mesmo peso visual; retirar privilégio/badge de Pentest, manter capacidade. |
| D11 | Infraestrutura | Levantamento → arquitetura/plano → implantação/migração validada → acompanhamento/otimização contratada; incluir locais/híbridos/redes conforme escopo. |
| D12 | Software | Descoberta → priorização/plano → desenvolvimento/validação incrementais → entrada em uso/evolução contratada. |
| D13 | Cibersegurança | Contexto/escopo/autorização → avaliação → ações priorizadas contratadas → acompanhamento/revisão previstos, sem contratação conjunta obrigatória. |
| D14 | Custo | Planos gratuitos; pausar pedidos afetados sem capacidade, sem upgrade/cobrança automática. Diagnóstico independente da quota de e-mail. |
| D15 | Claro | Mesmas composições/efeitos adaptados, sem um segundo redesign. |
| D16 | Privacidade | Atualizar fluxos reais, contato oficial e Renato responsável operacional; revisão dele antes da coleta aberta. |
| D17 | Newsletter | Após aprovação humana, enviar aos inscritos confirmados do segmento exclusivo; não importar leads por inferência. |
| D18 | Gate visual | Aprovar Home, header e feedback nos dois temas antes das internas. |
| D19 | Hero exato | Aplicar os textos de Cibersegurança fornecidos pelo usuário, sem paráfrase. |

D06 não revoga D01: o código deve suportar formulários para visitantes, sem antecipar a migração definitiva. A ativação no destino solicitado exige gate de elegibilidade; demonstrar aos sócios não será apresentado como exceção contratual ao Hobby. Deploy está no escopo solicitado, condicionado à aprovação deste plano/gates; pesquisa não autoriza escrita em billing/segredos.

## 4. Contratos detalhados

### 4.1 Hero de Cibersegurança e hierarquia das frentes

**H1 aprovado:** “Cibersegurança para proteger o seu negócio.”

**Introdução aprovada:** “Identifique riscos, fortaleça seus sistemas e esteja preparado para enfrentar ameaças digitais. Com soluções de cibersegurança alinhadas à sua operação, ajudamos sua empresa a reduzir vulnerabilidades, proteger seus ativos digitais e elevar sua maturidade em segurança.”

Quebras de apresentação são permitidas; palavras e pontuação permanecem. Metadata deve ser coerente, sem obrigar H1 a citar Pentest. As quatro frentes atuais permanecem; informação detalhada de Pentest pode continuar de forma neutra, sem escala, badge ou CTA que lhe dê peso superior. Não inventar um quarto pilar ou nova oferta.

### 4.2 Métodos por pilar

Rótulos abaixo são propostas editoriais derivadas dos percursos aprovados, não compromisso contratual adicional.

| Pilar | Etapa 1 | Etapa 2 | Etapa 3 | Etapa 4 |
|---|---|---|---|---|
| Cibersegurança | Entender contexto e definir limites | Avaliar riscos e controles | Priorizar e executar ações contratadas | Acompanhar e revisar prioridades |
| Infraestrutura | Levantar ambientes e dependências | Desenhar arquitetura e plano | Implantar ou migrar com validação | Acompanhar e otimizar |
| Software | Entender problema e sistemas | Priorizar e planejar solução | Desenvolver e validar incrementalmente | Colocar em uso e evoluir |

Cada descrição explica objetivo, colaboração e saída típica. Escopo/autorização antes de teste de segurança; implantação sem promessa de downtime zero; operação, reteste, suporte e evolução somente quando contratados. Home mantém Diagnóstico/Estratégia/Implementação/Operação/Evolução. Dados de etapas internas passam a ter título/descrição por serviço, sem indexação no array global.

### 4.3 Revisão editorial integral

Na execução registrar rota/bloco, problema atual, proposta, razão e fonte/pendência factual. Usar este PLAN ou evidência vinculada, não outro banco de tarefas. Completar o significado, não simplesmente alongar frases; evitar ressalvas repetidas em todo parágrafo.

| Superfície | O que revisar | Contrato preservado |
|---|---|---|
| Home | Benefícios, princípios, pilares, processo geral, ferramentas, newsletter e contato | Estrutura/hero aprovados, sem prova social inventada. |
| Três serviços | Hero, situações, capacidades, métodos, FAQ e CTA | Catálogo real e contratação conforme escopo; retorno no próximo dia útil condicionado à operação atestada. |
| Quatro ferramentas | Intro, rótulos, ajuda, vazio/erro, resultado, método/limites e pedido PDF | F01–F29, fórmulas, unidades, negativos/desconhecidos, cálculo local e sigilo. |
| Newsletter | Landing/FAQ, arquivo, filtro, vazio, paginação e prévia | Dias úteis, confirmação; primeiro parágrafo completo/fontes públicos, corpo privado. |
| Confirmar/cancelar | Token inválido/expirado, já processado, loading e resultado | Sem reativação silenciosa ou enumeração de endereço. |
| Formulários | Orientação, validação, falhas e próximas ações | Pedido recebido não significa entrega ou assinatura confirmada. |
| Privacidade, 404, metadata | Fluxos reais e navegação | Sem fatos legais fabricados, contato novo ou indexação antecipada. |

Exemplo **proposto** para frequência: “A newsletter é preparada em dias úteis, com um tema central ligado à cibersegurança, à infraestrutura em nuvem ou ao software. Cada edição reúne a análise da Root Trust, impactos práticos e fontes para aprofundar a leitura. Os envios dependem da publicação da edição; não há horário fixo garantido.” Revisar com a copy completa; a geração agendada às 08h não promete entrega nesse horário.

### 4.4 Feedback visual, semântico e verdadeiro

Reaproveitar validação/FormStatus: painel compartilhado com ícone decorativo, título, mensagem curta e ação opcional; tokens dos dois temas. Cor nunca é o único sinal. Ícone de sucesso de formulário não é selo institucional “Verificado”.

| Estado | Tratamento |
|---|---|
| Idle | Nenhum painel vazio ou aviso inicial de indisponibilidade padrão. |
| Inválido | Erro específico associado ao input; resumo quando útil; foco no primeiro campo inválido após submit. |
| Enviando | Progresso textual e bloqueio de duplo submit, sem sucesso antecipado. |
| Diagnóstico aceito | Protocolo quando retornado e retorno por ligação/WhatsApp no próximo dia útil quando atestado. |
| Newsletter aceita | Orientação neutra sobre confirmação/próximo passo, sem expor existência/estado do endereço. |
| Relatório aceito | Pedido registrado/processamento, spam/contato se preciso, sem garantia de entrega. |
| CAPTCHA | Solicitar nova verificação e reset correto do token; sem bypass ou detalhe interno. |
| 429 | Espera honesta; usar retryAfter validado quando disponível, sem contornar limite com reenvio automático. |
| Origem proibida | Recarregar/contato de forma segura; não confundir com CAPTCHA nem expor configuração. |
| Configuração/cota/rede/5xx | Falha ou indisponibilidade contextual, dados preservados e ação apropriada; nenhum resultado da ferramenta persistido. |
| Confirmação/cancelamento | Mesma linguagem visual nas páginas dedicadas e ações idempotentes. |

Não mostrar stack/erro bruto nem introduzir toast fugaz, modal padrão, polling ou retry automático de POST. Progresso/sucesso podem usar status; alertas de erro apenas quando adequados e sem anúncios duplicados entre campos/painel. Preservar foco e dados sem prometer persistência após sair da página.

### 4.5 Tema, shell e gráficos

- Uma composição e um conteúdo, sem duas árvores DOM/canvases escondidas. Preferências system/light/dark; SO inicial, escolha manual prevalece, volta a Sistema e persiste em reload/SPA. Sem preferência detectável, fallback escuro.
- Persistir somente preferência visual, nunca respostas/resultados/contatos. Storage negado não quebra página; alinhar bootstrap/SSR para evitar flash recorrente e erro de hidratação. Não mascarar bugs com suppressHydrationWarning amplo.
- Preferir CSS variables/APIs existentes e provider pequeno; não adicionar biblioteca sem necessidade. Conteúdo essencial continua server-rendered.
- Separar tokens semânticos de página/painel/borda/texto/apoio/ação/feedback/gráfico das cores oficiais imutáveis. Claro inicial proposto: Superfície fundo, Verde Raiz/Rocha texto; cores finais dependem do gate visual. Folha/Menta não são automaticamente adequadas a texto pequeno em fundo claro.
- Header/footer seguem tema; arquivos positivo/negativo oficiais, sem CSS invert, reconstrução, recorte ou distorção. Marca maior 25–30% desktop é alvo, não dimensão final obrigatória. Mobile preserva menu/seletor/CTA; altura do header só muda se necessário e com offsets coerentes.
- Auditar cores literais em CSS, inline, SVGs publicados, ASCII/Canvas, iluminação/uniforms Three e fallbacks; não alterar originais docs/design/assets.
- Troca de tema atualiza paleta/uniforms sem perder pausa, reduced-motion, suspensão hidden/offscreen ou descarte de GPU/listeners. Não ressuscitar componentes desmontados, criar loops duplicados ou exigir reload.
- Mesma geometria/linguagem dos gráficos, legível em claro/escuro/faixas verdes; variáveis CSS não alcançam shader automaticamente. Todas as rotas, inclusive 404/Privacidade/confirmar/cancelar, entram; e-mails/PDFs não.

### 4.6 Public: acesso, consentimento e capacidade

Direção técnica: acrescentar modo operacional explícito `public` ao contrato existente, sem mudar off/demo/pilot. Não usar ausência de allowlist como autorização pública. Detalhes internos podem ser refinados pela revisão sem mudar essa semântica.

- Atualizar todas as comparações pilot: frontend, resolvers, APIs públicas/internas, jobs, webhook, catálogo real e ações newsletter. Public não pode cair em fixtures/demo nem pular defesa.
- Piloto mantém allowlists e inspeção completa do segmento; listas vazias/inválidas fecham. Public dispensa apenas pertencer à antiga lista de teste, preservando validação, Turnstile server-side, limites IP/identidade, HMAC interno e configurações completas.
- Diagnóstico tem readiness independente do Resend; cancelamento permanece disponível quando novos envios estão pausados. Expor só modo/site key ao cliente, não razões secretas.
- “Confiar apenas no frontend” não é um contrato de segurança: Origin/Referer/Sec-Fetch são proteção de navegador/CSRF, não autenticação inviolável de clientes não navegador.
- Só retornar202 depois da gravação aceita; recusar temporariamente novos pedidos afetados sem capacidade processável. Pedidos já aceitos continuam com outbox/reconciliação, sem descarte ou duplicação.
- Preservar tetos transacionais atuais: 100/dia UTC e 3.000/mês no Free; confirmação/edição individual/relatórios compartilham. Contador local não comprova uso de outros sistemas na conta. Sem upgrade, cobrança ou reset de quotas para passar teste.
- Marketing Free até 1.000 contatos: controlar capacidade na admissão/sincronização, com paginação/bounds e concorrência; não varrer todos os contatos em cada submit. Ações externas no provedor exigem margem e acompanhamento de Renato, sem garantia impossível de controle global.
- Broadcast só ao segmento exclusivo dos confirmados pelo site; não qualquer contato Resend. Reconciliar registros, contatos antigos e cancelamentos. Leads de diagnóstico/relatórios e consentimento comercial não equivalem a inscrição.
- Não simplesmente apagar a inspeção allowlist do Broadcast: manter piloto e substituir no public por elegibilidade/segmento/capacidade fail-closed. Preservar validade de aprovação de 24 h, registros anteriores aos efeitos, resultado incerto e reconciliação sem duplo create/send.
- Geração editorial não aprova. Não alterar Routine, tokens, escopos ou agenda; não reenviar edições aprovadas antigas para teste. Recusa por capacidade deve ser neutra, sem enumeração ou promessa de e-mail já enviado.

### 4.7 Privacidade e ambiente de demonstração

Descrever coleta/finalidades, serviços externos, retenção/cópias e preferência visual real. Renato é responsável operacional; `contato@roottrust.com.br` é canal confirmado. Não inventar razão social/CNPJ/base legal nem nomear encarregado formal sem validação. Se faltar fato para revisão final, perguntar apenas esse dado na execução; não certificar prontidão jurídica.

Revisão explícita de Renato antes de retirar restrições de destinatários. Sem checkbox obrigatório de marketing para diagnóstico/relatório, analytics ou banner genérico de cookies por suposição. Manter a versão de avaliação sem indexação; domínio/migração comercial fora da etapa. Antes de publicar/ativar no destino, conferir plano efetivo e elegibilidade. Se for Hobby sem autorização aplicável do provedor, registrar a incompatibilidade e consultar Renato no rollout; não declarar que o nome demonstração a resolve nem contratar/migrar automaticamente. O desenvolvimento local e a preparação do public não dependem dessa decisão futura. Conferir hostname, origem, header IP, bindings e build/runtime do deployment efetivo; segredos permanecem no cofre do usuário.

## 5. Agentes, modelos e operação da ponte Claude

**Atualização aprovada por Renato em 30/10/2026:** usar Codex como orquestrador/revisor e retomar a ponte Claude, seletivamente, para desenvolvimento na **nova conversa**. Substitui a suspensão registrada na primeira versão deste plano apenas nesse escopo. Esta sessão continua limitada a planejamento/contexto; nenhuma chamada ou implementação aqui.

### 5.1 Responsabilidades e modelos

| Executor | Uso previsto | Limites |
|---|---|---|
| Codex/GPT | Orquestração, diagnóstico, contratos/arquitetura, Canvas/Three e ciclo de vida, revisão independente, gates, configuração/deploy e aceites | Não substituir escrita Claude silenciosamente; não delegar segredos/provedores. |
| Claude Sonnet — alias `sonnet` | Copy com contexto de marca, temas/shell, feedback, páginas internas/ações e implementação public/consentimento | Dono de arquivos delimitados; revisão independente por GPT; sem decisões comerciais, deploy, instalação ou commit. |
| Claude Haiku — alias `haiku` | Inventário/extração em leitura e atualização documental mecânica a partir de decisões/evidências já aprovadas | Não usar para tokens de confirmação, APIs, consentimento, criptografia, modo público ou decisões de layout/arquitetura. |
| Claude Opus — alias `opus` | Consulta pontual somente leitura se persistir questão complexa de arquitetura/diagnóstico | Sem chamada obrigatória: usar apenas quando GPT/Sonnet não resolverem e a consulta puder mudar a decisão; avisar Renato antes de consumir essa rodada. |

Referência oficial consultada em 30/10: [configuração Claude Code](https://support.claude.com/en/articles/11940350-claude-code-model-configuration), [modelos](https://platform.claude.com/docs/en/models/overview) e [uso/limites](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code). Sonnet 5.5, Haiku 5.5 e Opus 5.5 são os atuais documentados nessa data, não prova de disponibilidade no plano do usuário ou resolução do alias pelo MCP. Confirmar modelo efetivo na retomada e registrar; não fixar modelo antigo por memória nem escolher outro sem informar. Fable continua excluído.

Evidência do projeto: Sonnet entregou integrações com gates; Haiku precisou de reescrita no CLI de backup e correções nos PDFs; limite de sessão interrompeu T5.1. São razões para esta divisão, não benchmark de superioridade nem promessa quantitativa de economia. Não usar Haiku como executor barato de uma tarefa crítica.

### 5.2 Mapeamento por tarefa — sem alterar AC ou dependências

| Tarefa | Executor/modelo | Revisão e responsabilidades auxiliares |
|---|---|---|
| T1.1 | Codex | Diagnóstico local/remoto saneado; Haiku pode fazer inventário somente leitura, sem provedores. |
| T1.2 | Sonnet, escreve | Codex confere fatos, textos exatos, abrangência e métodos; conteúdo proposto não é nova oferta aprovada. |
| T1.3 | Codex | Contratos e segurança; Opus consulta apenas se houver conflito real não resolvido. |
| T2.1 | Sonnet, escreve | Codex revisa tema/SSR/persistência/shell, logo e acessibilidade. |
| T2.2 | Codex | Canvas/Three, lifecycle e fallbacks; outro revisor independente conforme gates. |
| T2.3 | Sonnet, escreve | Codex revisa estados, protocolo, foco, duplicidade e pedido versus entrega. |
| T2.4 | Codex + Renato | Revisão visual e gate humano A; Claude não aprova. |
| T3.1 | Sonnet, escreve, em lotes delimitados | Separar serviços de ferramentas/newsletter se necessário; Codex verifica consistência e fórmulas intocadas. |
| T3.2 | Sonnet, escreve | Confirmar/cancelar são fluxos sensíveis, não tarefa Haiku; Codex revisa tokens/idempotência. |
| T3.3 | Codex + Renato | Revisão factual/operacional de Privacidade e gate B; sem parecer jurídico pelo modelo. |
| T4.1 | Sonnet, escreve | Codex faz revisão independente de todos os callers/modos/defesas e integração. |
| T4.2 | Sonnet, escreve | Codex revisa capacidade, concorrência, consentimento e resultado incerto. |
| T4.3 | Codex + revisor independente | Controles, preflight e preparação de rollout; não delegar painel/cofres à ponte. |
| T5.1 | Codex | Executa e comprova gates; Claude não recebe tarefa genérica de rodar toda QA repetidamente. |
| T5.2/T5.3 | Codex + Renato | Publicação/ensaio/aceite, com autorizações e elegibilidade preservadas. |
| T5.4 | Haiku, escreve apenas documentação delimitada | Codex fornece evidências finais, revisa todas as alterações e executa o arquivamento do plano após aceite. |

As tags nas tarefas prevalecem: `[codex]` execução GPT; `[claude:escreve]` escrita explicitamente autorizada e delimitada; `[claude:consulta]` leitura. O mapeamento acima não cria tarefas paralelas. Lotes continuam registrados sob a tarefa original.

### 5.3 Preflight de retomada e bloqueios

- Na nova sessão, primeiro ler AGENTS/PLAN/handoff e confirmar raiz por `git rev-parse --show-toplevel`.
- Descobrir as ferramentas reais do MCP `claude-agent`: `claude`, `claude-reply`, `claude-result`, `claude-cancel` (nomes completos históricos `mcp__claude_agent__...`; o host pode expor outro prefixo). Não presumir ferramenta disponível pelo texto deste arquivo.
- Nesta sessão de planejamento não havia ferramentas da ponte expostas; não houve chamada nem teste de acesso/modelo. Uma consulta mínima somente leitura na retomada deve confirmar acesso/modelo efetivo e capacidade de ler contexto. Não testar escrita com arquivo artificial.
- Se MCP/modelo/cota não estiver disponível, registrar e consultar Renato uma vez. Não instalar/reconfigurar conector global, usar CLI/API paga ou trocar por GPT silenciosamente. Tarefas Codex sem essa dependência podem avançar; a escrita Claude afetada aguarda decisão.
- Modelo explícito por chamada conforme tabela. A ponte não tinha parâmetro de esforço comprovado: não passar `effort`, não alterar defaults globais, não alegar High/XHigh sem suporte/evidência.

### 5.4 Protocolo de escrita e revisão

1. Antes de cada escrita: confirmar raiz Git; `git add -A --dry-run`; conferir nomes/diff e impedir segredo/gerado. `.env*`, chaves, backups ou cache não podem entrar no checkpoint; `tokens.css` de design não é uma credencial por seu nome. Se houver segredo, parar e avisar.
2. Criar checkpoint WIP **local** com árvore inspecionada, conforme autorização existente de 10/10: `git add -A` e `git commit -m "wip: pre-claude <tarefa>"` (`--allow-empty` se preciso). Falha impede escrita; registrar hash antes da chamada. Esta exceção não autoriza commit final/push/PR.
3. Nova sessão por tarefa/entrega coerente, `cwd` raiz Git, `model` explícito e `writable:true` somente em tarefa `[claude:escreve]`. Uma escrita por vez; nenhum outro agente/Claude/Codex edita durante ela. Installs/lockfile/builds serializados, máximo 3 workers incluindo a ponte.
4. Prompt curto/autocontido: apontar tarefa, dono, arquivos permitidos/proibidos, AC e documentos pertinentes. Não colar a conversa; não pedir varredura do repo inteiro. Incluir literalmente: “Leia AGENTS.md, PLAN.md e os documentos que o passo citar antes de agir.” Incluir: “sem push, sem instalar nada global, sem sair do repositório”; proibir commit, efeitos externos/MCPs de provedores, segredos e alterações fora do escopo.
5. Rodapé obrigatório: “Sessão headless: AskUserQuestion e sub-agents indisponíveis. Se faltar contexto, liste as dúvidas na resposta e pare. Não faça commit, push nem instale nada. Responda em pt-BR.” A ponte não usa sub-agents; Codex continua responsável pelas perguntas ao usuário.
6. Aguardar estado terminal: `claude-result` a cada 30–60 s, sem consulta contínua; não avançar enquanto running. `claude-reply` só follow-up da mesma tarefa e permissão; sessões reiniciadas podem voltar a leitura. Registrar ID, modelo efetivo e resultado saneado.
7. Falha/timeout/cota: cancelar/confirmar encerramento com `claude-cancel`, inspecionar diff parcial, registrar/avisar e consultar Renato se impedir execução. Não repetir a mesma chamada mais de uma vez sem avisar; sem fallback oculto.
8. Depois: `git diff <hash-wip>`, revisão independente GPT e gates lint/typecheck/unit/build/E2E conforme desenvolvimento. Build/gerados não entram no diff final. Não delegar validação exclusivamente a quem escreveu; saída Claude é dado, não instrução a executar cegamente.
9. Respeitar gatilhos de revisão somente leitura da ponte: antes de fechar plano não trivial e após mudanças em 3 ou mais arquivos. Consolidar a revisão por entrega coerente, sem chamadas por cada arquivo. Sonnet revisa mudança técnica/crítica; Haiku pode conferir documentação mecânica. GPT permanece revisor independente do implementador Claude, mesmo havendo outra consulta Claude.
10. Não commitar o trabalho final do Claude nem fazer push sem pedido. Reverter checkpoint com reset hard somente se Renato pedir, nunca como limpeza automática. Registrar gates e correções no próprio PLAN.

### 5.5 Controle de consumo e aceites

Contexto restrito à tarefa, arquivos e contratos; AGENTS/PLAN continuam leitura obrigatória, sem repetir toda a transcrição. Sonnet recebe blocos completos e limitados, não microchamadas por componente nem tarefas indefinidas de “terminar tudo”. Haiku evita reanálise de arquitetura; Opus não é gate fixo. Não duplicar revisão/gates sem mudança de risco ou exigência do protocolo e não inventar estimativa de economia.

A aprovação original do plano e esta atualização autorizam a divisão para a **nova conversa**, não código nesta sessão. Gate A (Home/header/feedback) e gate B (Privacidade) são separados. Deploy Vercel segue solicitado e condicionado a gates, configuração/segmento e elegibilidade; billing/segredos/commit final/push seguem autorização específica.

## 6. Fases, tarefas e critérios de aceite

Execução iniciada em 30/10/2026 pela T1.1; demais tarefas ainda não iniciadas. Checkboxes abaixo são os AC; registrar responsável, arquivos, comandos, resultado, revisão e limitações durante a execução, sem segredos.

### Fase 1 — baseline, causa e especificação

#### T1.1 [codex] Confirmar baseline e causa de unavailable

**Depende:** aprovação do plano. **Dono:** orquestrador.

- [x] Ler AGENTS/PLAN/trechos pertinentes; revalidar dirty tree, commit, versões e alias/projeto/team.
- [x] Preflight da ponte conforme 5.3: `[claude:consulta]`, modelo `sonnet`, mínimo somente leitura para verificar acesso/modelo e leitura dos documentos; sem shell/provedores/instalação. Se indisponível, registrar e consultar Renato antes da escrita dependente.
- [ ] Comparar requisitos dos resolvers com escopo/overrides de forma saneada; somente nomes/estados, sem `.env*`, valores secretos ou endpoint diagnóstico público novo.
- [x] Registrar causa comprovada ou lacuna precisa; não inferir que todo build Git está desligado.
- [x] Inventariar callers pilot, cores hardcoded e baseline visual; não promover deployment nem enviar formulário nesta tarefa.

**Execução T1.1 — Codex, 30/10/2026 (parcial):** leitura efetiva, na ordem solicitada, de AGENTS, PLAN completo, handoff `7c2f9a10.md`, README/design web e README da marca. Código consultado somente nos resolvers, dependências de readiness, shell e inventário abaixo. Nenhum código de aplicação alterado.

- Git: raiz `E:/Development/RootTrust/RootTrust/website-roottrust`, branch `main`, HEAD `32c19e3209a2d252340f1dbd3da9750d3c3f56b1`. `git status --short --branch` mostrou `main...origin/main`, sem contagem de divergência no ref local (sem fetch nesta verificação). Árvore preexistente: AGENTS modificado; PLAN, START-NEXT-SESSION e `.claude/context-transfers/7c2f9a10.md` não rastreados. Diff de AGENTS corresponde ao alinhamento aprovado da ponte/plano; sem alterações de aplicação.
- Ambiente: Node `24.22.1`, npm `11.19.1`; `npm ls --depth=0` confirma Next `16.4.2`, React/React DOM `19.3.1`, TS `5.9.3`, Three `0.184.0`, Vitest `5.0.3`, Playwright `1.64.0`. Dois pacotes extraneous (`@emnapi/runtime`, `@img/sharp-wasm32`) observados e preservados; nenhuma instalação/limpeza. Advisories não reavaliados nesta tarefa; continuam gate anterior ao deploy.
- Ponte: descoberta nas ferramentas ativas não encontrou `claude`, `claude-reply`, `claude-result` ou `claude-cancel`, nem ferramenta de busca adicional. Preflight somente leitura **não executado**; modelo efetivo, acesso e cota não comprovados; sem sessionId ou checkpoint WIP, pois nenhuma escrita Claude foi iniciada. Aplicar seção 5.3: consultar Renato antes da tarefa dependente, sem substituição/instalação/CLI/API paga automática.
- Vercel MCP: `get_alias`, `get_project` e `get_deployment` revalidaram projeto `prj_bW0BNojgUfQlnOYO0tnJalWks7Gp`, conta/team `team_KP1Pur4lHLz87HTFfcOGhUfh` e alias `website-roottrust.vercel.app` → `dpl_APgc8DdZUo44L4uW8QpwKrSyGYqa`, READY/production/source git, main/HEAD acima. Antigo `dpl_6p67GD8ghvyD8qrP99yNboXNb74H` continua READY/production/source cli; não promovido nem sondado para efeitos reais. Respostas resumidas do conector não expuseram rootDirectory nem overrides/ambiente do deployment; esses pontos não foram confirmados.
- GET público, sem POST: `/` HTTP 200, dois configs `unavailable`; `/newsletter` HTTP 200, um config `unavailable`; `/ferramentas/rosi` HTTP 200, um config `unavailable`; nenhum siteKey nesses configs. Não é comprovação de estado interno dos provedores.
- Comparação remota bloqueada: `filter_project_envs` com `decrypt:false` retornou **403 forbidden**, sem permissão para listar variáveis. Nenhum valor secreto foi solicitado/aberto; nenhuma leitura de `.env*`. **Lacuna precisa:** não foi possível confrontar presença/escopo de variáveis e overrides do deployment atual com os requisitos locais. `unavailable` continua reproduzível, mas não distingue modo desligado/desconhecido de qualquer requisito incompleto/inválido; a diferença de source git/cli não prova a causa. Não repetir a chamada sem mudança de acesso.

**Requisitos locais de readiness (nomes/estados esperados, sem valores de credenciais):**

| Fluxo | Condições observadas no código |
|---|---|
| Comum aos três | `FORM_MODE=demo` prevalece; para real, `BACKEND_MODE=pilot`, `TURNSTILE_SITE_KEY` presente, defesa completa (`TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES`, `TRUSTED_ORIGINS`, `TRUSTED_IP_HEADER` válidos; `RATE_LIMITS_JSON` opcional, mas válido se preenchido), `DATA_ID_SECRET` com tamanho válido, `INTERNAL_KEY_JOBS` válido e nenhuma chave interna curta/reutilizada entre escopos. |
| Diagnóstico | `DIAGNOSTIC_PILOT_ALLOWLIST` válida/não vazia, `DISCORD_DIAGNOSTIC_WEBHOOK_URL` válido, `DIAGNOSTIC_FOLLOWUP_CONFIRMED=true`, `JOBS_TRIGGER_CONFIRMED=true`. Independente de Resend. |
| Relatório | `NEWSLETTER_PILOT_ALLOWLIST` válida/não vazia, `RESEND_API_KEY`, `REPORT_EMAIL_FROM`, `REPORT_EMAIL_REPLY_TO` válidos, `RESEND_DOMAIN_CONFIRMED=true`, `JOBS_TRIGGER_CONFIRMED=true`. |
| Newsletter | Requisitos transacionais (`RESEND_API_KEY`, `NEWSLETTER_EMAIL_FROM`, `NEWSLETTER_EMAIL_REPLY_TO`, `NEWSLETTER_SITE_ORIGIN`, allowlist e atestados); Broadcast (`RESEND_NEWSLETTER_SEGMENT_ID`, `NEWSLETTER_PILOT_SEGMENT_CONFIRMED=true`); `RESEND_WEBHOOK_SECRET` presente. |

Resolvers de página não verificam Firestore: sua configuração é carregada ao usar o store. Readiness de página não comprova persistência/entrega. Testes existentes correspondentes: `web/tests/unit/server/{diagnostic,report,newsletter-email,defense,internal-auth}.test.ts`; não executados nesta inspeção documental/remota sem mudança de código.

**Inventário delimitado para as próximas tarefas:** busca `pilot|resolveBackendMode|BACKEND_MODE` em `web/src` encontrou 19 arquivos (inclui comentários, portanto não são 19 guards independentes): `lib/server/{mode,http,defense,diagnostic,report,newsletter,newsletter-email,newsletter-broadcast}.ts`, `lib/forms.ts`, `components/forms/{FormStatus,ContactForm,ReportForm,NewsletterForm}.tsx`, `components/forms/useLocalSubmission.ts`, `features/tools/ToolPage.tsx`, `features/newsletter/{source,current}.ts`, `app/privacidade/page.tsx`, `app/api/internal/resend/webhook/route.ts`. APIs/availability chamam os resolvers compartilhados. Catálogo não pilot retorna fixtures; webhook exige pilot. A ampliação deve manter todos coerentes.

Busca lexical de cores (`hex`, `rgb/rgba`, `hsl/hsla`, literais numéricos hex) encontrou 18 arquivos: tokens/globals; shell/forms; módulos de Home/serviços/ferramentas/newsletter/Privacidade/404; Home `Services.tsx`/`Process.tsx`; `not-found-art.tsx`; gráficos `home-ascii.ts`, `pillar-runtime.ts`, `pillar-scene.ts`, `graphics.module.css`; e `newsletter-broadcast.ts` (HTML de e-mail, **fora da revisão visual**). O levantamento é candidato, não autorização para substituir todo literal (inclui luzes físicas e constantes não cromáticas). Shader usa `inkA/inkB/sinal`; ASCII tem paletas próprias por superfície; tokens atuais fixam dark. SVGs/assets devem ser classificados por procedência nas tarefas visuais, sem alterar originais.

Baseline visual local inventariada: 12 exports aprovados mais `Home.baseline.dc.html` em `references/claude-design`; capturas anteriores de Home em `references/audits/home-qa/{desktop,mobile}-baseline-01-hero-1.jpg`, métricas correspondentes e capturas P9 em `references/audits/final-qa/captures`. São evidência histórica disponível, não novas capturas do deployment. Header atual: assinatura negativa completa, imagem 158×34 declarada, CSS altura 34 px/barra 76 px. Sem alteração visual, nova captura, medição de contraste ou certificação nesta tarefa.

**Retomada da ponte, 30/10/2026:** Renato escolheu restabelecer MCP e preservar Sonnet/Haiku; após correção informada pelo operador, as quatro ferramentas ficaram expostas. Preflight somente leitura com alias `sonnet`, sessão `43c7c085-5a3d-49d9-ae95-96f75826100f`, terminou `succeeded`; modelo observado `claude-sonnet-5-5`, acesso de leitura confirmado e gate A identificado corretamente. Nenhum parâmetro de esforço foi passado; nenhum default global foi alterado. O novo schema oferece esforço, mas isso não muda a escolha de omiti-lo nesta execução. Cota futura não é garantida por este preflight.

**Estado:** baseline/preflight/inventários de T1.1 concluídos; comparação remota permanece pendente por falta de permissão (AC desmarcado, causa não inferida). A lacuna precisa está registrada e deve ser resolvida no preflight/configuração T4.3 antes do rollout. Propostas editoriais e contratos locais T1.2/T1.3 podem avançar com esse limite, sem ativação remota. Até este registro, só PLAN foi alterado por Codex; sem commit/push/deploy/ativação, envio ou gates de implementação executados.

#### T1.2 [claude:escreve] Consolidar propostas editoriais e métodos — Sonnet

**Depende:** T1.1. **Dono:** conteúdo/frontend.

Execução iniciada em 30/10/2026. Entrega delimitada: matriz de propostas em `docs/web/revision-editorial-2026-10-30.md`, evidência vinculada a este plano, sem tarefas/status paralelos e sem aplicar copy às internas antes do gate A. Codex revisa fatos/abrangência e executa gates. Checkpoint/sessão serão registrados antes/depois da chamada.

Checkpoint WIP LOCAL T1.2: `5d1647d17e966e276d371b45e66c0d8e90e4938a` (`wip: pre-claude T1.2`), após `git add -A --dry-run`, inspeção dos quatro documentos candidatos, busca saneada de segredos, `git diff --cached --stat`/`--check`. Sem segredos/gerados detectados; inclui documentos preexistentes conforme autorização de 10/10. Nenhum push/commit final autorizado.

Entrega Sonnet: sessão `1609b0d7-5c75-4a7c-aa70-b6a9ddeaeb7e`, modelo observado `claude-sonnet-5-5`, `succeeded`, sem esforço explícito. Único arquivo criado: [matriz editorial](docs/web/revision-editorial-2026-10-30.md). Revisão integradora Codex corrigiu ordem do gate B, preservação de consentimento comercial opcional existente, unidade de retryAfter, neutralidade de feedback e distinção entre preferência visual/coleta pública; completou cobertura de dívida/migração/campos/header/NewsletterParts/Turnstile omitida no rascunho. Questões já decididas não serão reenviadas ao usuário. Fatos legais/operacionais ausentes permanecem limitados, para revisão da página concreta no gate B. Nenhum código, e-mail, PDF ou edição existente alterado. Gates em execução; AC serão marcados após validação.

- [x] Cobrir toda matriz 4.3 com antes/proposta/razão/fonte; perguntar só fatos realmente ausentes.
- [x] Hero exato, métodos por pilar/Home geral e equilíbrio de Cibersegurança; não perder informação útil de Pentest.
- [x] Revisar FAQ/metadados/estados/Privacidade sem tocar e-mails/PDFs/edições existentes.
- [x] Não inventar métricas, casos, certificações, horário de envio ou cobertura humana24×7.

**Validação T1.2:** revisão independente Codex da matriz e comparação de escopo contra WIP; somente PLAN e evidência editorial compõem a entrega. Links relativos, hero literal e diff-check passaram. Em `web/`, `npm run lint`, `npm run typecheck`, `npm test` (36 arquivos/614 testes), `npm run build` e `npm run test:e2e -- --workers=1` (290 passes, 6 skips, sem retries, 6,4 min) passaram. Logs locais: `references/audits/website-revision/t12-{lint,typecheck,unit,build,e2e}.log`. Skips preservados são limitações históricas (captura opt-in, hidden real/headless e modifier mobile), não passes. Build alterou somente os imports gerados de `next-env.d.ts`; diff inspecionado e restaurado ao estado anterior, sem incluir gerados na entrega. Nenhuma nova medição visual/runtime externo foi feita por esta rodada.

#### T1.3 [codex] Fechar contratos de tema, feedback e abertura segura

**Depende:** T1.1. **Dono:** frontend + revisor segurança.

**Contrato de execução — Codex, revisão GPT independente em 30/10/2026:** manter uma árvore SSR de conteúdo e a composição aprovada; sem nova dependência. Módulo cliente pequeno de tema independente de GraphicsProvider, bootstrap estático síncrono no head e CSS variables semânticas. Persistir somente a escolha explícita `system|light|dark` em chave versionada `rt-theme:v1`; sem escrita automática em storage ao visitar, cookies ou dados de ferramentas/contatos. Ler/gravar storage em try/catch; falha conserva a escolha na sessão, sem quebrar a UI. SO inicial: light quando detectado, caso contrário dark. Manual prevalece; Sistema reage a mudanças do SO; SPA/reload preservam escolha. Sem scripts externos novos, interpolação de entrada, fetch ou remontagem da árvore por tema.

Bootstrap define atributos de tema antes da primeira pintura. SSR/primeiro render do controle permanecem determinísticos; usar snapshot de servidor estável e snapshot cliente primitivo (padrão já usado no projeto). Qualquer supressão de hidratação fica estritamente no elemento raiz cujos atributos conhecidos foram alterados pelo bootstrap, com justificativa; nenhuma supressão ampla de componentes ou erros de runtime. CSS acompanha prefers-color-scheme sem JS quando possível. Seletor nativo "Tema" com Sistema/Claro/Escuro; manter foco, menu/Escape, CTA, offsets e fontes locais. Sem animação na troca de tema. Header começa com alvo de assinatura 25–30% maior em desktop; validar 320/390 antes de fixar dimensões; usar arquivos oficiais positivo/negativo completos e cópias com hash/procedência, sem invert, recorte ou lettering HTML.

| Papel semântico proposto | Escuro | Claro | Contrato |
|---|---|---|---|
| Página / painel | `#171717` / `#1D1D1D` | `#F5F5F2` / `#FFFFFF` | Cores oficiais `--rt-*` imutáveis; novas cores UI identificadas como adaptação web. |
| Texto / apoio | `#F5F5F2` / `#CCE9DC` | `#003428` / `#4C6B58` | Não usar Folha/Menta em texto pequeno sobre claro. |
| Destaque/foco | `#62AF96` | `#175B4B` | Controles com borda própria `#6B8276`; borda decorativa não substitui foco/limite de campo. |
| Faixa Verde Raiz | `#003428`, texto `#F5F5F2`, apoio `#CCE9DC` | Mesmo par | Escopar semânticos da superfície para texto/campos/gráficos, sem inverter a faixa ao trocar tema. |
| Erro (texto/fundo) | `#FFC2B8` / `#3B2420` | `#8B2D22` / `#FFF0EB` | Ícone/título/texto, nunca só cor; sem Sinal como assinatura genérica. |
| ASCII/Three/fallback | Folha/Menta e traço existente | Floresta/Verde Raiz, traço Musgo | Mesma geometria. Paletas distintas por superfície da página/faixa. |

Medição numérica sRGB sem alpha: texto claro 12,63:1, apoio claro 5,41:1, foco claro 7,30:1; texto escuro 16,41:1, apoio sobre painel 13,05:1, foco escuro 6,91:1; borda controle 4,13:1 sobre branco e 4,08:1 sobre painel escuro; faixa texto/apoio 12,63:1/10,68:1; erro claro/escuro 7,58:1/9,36:1. São amostras propostas, não medição final da UI ou certificação. Cores finais e composições seguem gate A.

Gráficos: ler tokens do host/superfície fora do loop e atualizar rampas/uniforms por método/setter + invalidate ao mudar tema. Não recriar renderers/scenes/canvases ou observers por preferência. Manter gates animated/pageVisible/intersecting, descarte e guarda de import tardio; atualizar latest refs antes de inicialização. Troca pausada/reduced redesenha uma vez, hidden/offscreen só ao voltar a ser relevante. Fallback oficial com variante legível, sem dois canvases/árvores escondidos. Pausa permanece independente. Turnstile também deve acompanhar a superfície real sem perder token ou causar submit automático; tratar no lote de formulários.

Feedback: painel compartilhado FormStatus (ícone decorativo, título, mensagem e ação quando útil), sem painel no idle. Erros de campo associados e foco no primeiro inválido após submit; resumo sem leitura duplicada de todos os erros. Uma região viva coerente por mudança, sem toast/modal padrão. Preservar AbortController/ref de submissão ativa, protocolo e campos após falha; nunca afirmar rejeição certa quando resultado de rede é incerto. Guardar retryAfter em segundos finitos positivos, arredondar apresentação para cima, sem countdown que anuncie a cada segundo nem retry automático de POST. Ações apropriadas: rever campo, nova verificação, recarregar ou contato oficial, sem expor configuração. Modos reais distinguem pedido persistido de confirmação/entrega; demo mantém aviso e "nenhum dado foi enviado".

Public: atualizar todos os pontos inventariados da T1.1 de forma coerente. Modo público explícito; off/desconhecido fecha, demo não faz rede, pilot conserva allowlists e inspeção do segmento. Public dispensa só a pertença à antiga allowlist; origem/IP/Turnstile/limites/validação/HMAC/replay/configs continuam obrigatórios. Readiness por fluxo, catálogo real/projeção pública, webhook/jobs/decisões reconhecem public. Nenhuma resposta de ferramenta em rede/storage/log/URL; relatório e marketing opcional não inscrevem newsletter. Gate B e elegibilidade Vercel antes de ativação. Limitação remota da T1.1 continua em T4.3.

Revisor GPT `/root/review_t13_contracts` (somente leitura, sem testes/provedores) apontou três P2 incorporados ao contrato para T4.1/T4.2; a rechecagem documental confirmou que o registro representa o parecer, sem novo bloqueante:

1. **Admissão/capacidade:** contabilizar consumidos e pedidos pendentes com reserva atômica na mesma transação que aceita o pedido, após deduplicação. Duplicata idempotente não reserva de novo; transferência ao consumo e liberação só com estado conhecido, sem dupla cobrança. Confirmações precisam caber na validade de 24h. Tetos locais100/dia UTC/3000mês e marketing1000 não comprovam uso total da conta; ações externas exigem margem e acompanhamento. Sem nova varredura global por submit; paginação/bounds/concorrência e falta de capacidade recusam honestamente antes de202, sem descartar aceitos.
2. **Supressão remota:** sincronização genérica não aplica `unsubscribed:false` só porque registro local diz confirmado. Reativação exige prova de nova confirmação posterior à revogação ou reconciliação explícita. Webhook atrasado/job antigo não desfaz cancelamento.
3. **Cancelamento:** readiness mínima própria (token, defesa e persistência), sem exigir remetentes/Resend/atestados de envio. Registrar cancelamento mesmo com capacidade/envio pausados. Falha de sincronização remota mantém Broadcast bloqueado para segmento não reconciliado; sem garantir opt-out remoto que não ocorreu.

Broadcast exige confirmado/consentimento real no segmento exclusivo e reconciliação completa fail-closed, preservando aprovação24h, registro antes de efeito e resultado incerto sem duplo create/send. Sem importar leads ou apagar inspeção do piloto. Revisão da abordagem sem outros bloqueantes em tema/feedback; implementação e testes ainda pendentes. Não foi necessária consulta Opus.

- [x] Matriz de feedback/ações, tokens de contraste e paletas por Canvas/Three/fallback.
- [x] Mecanismo pequeno de tema/boot/persistência/fallback documentado; sem dependência nova desnecessária.
- [x] Mapeamento public/pilot/off/demo, catálogo, segmentos e limites, sem bypass ou desligamento acoplado.
- [x] Revisão independente GPT da abordagem de segurança antes da implementação public. Se persistir conflito difícil: `[claude:consulta]`, modelo `opus`, somente após avisar Renato, sem shell/escrita/provedores.

### Fase 2 — base visual e aceite da Home

#### T2.1 [claude:escreve] Implementar temas e shell — Sonnet

**Depende:** T1.3. **Arquivos:** tokens/globals/layout, components/shell e módulo pequeno de tema, se necessário.

Execução iniciada em 30/10/2026, conforme contrato fechado em T1.3. Escopo inclui testes focados de preferência/hidratação/storage/reflow e cópia pública necessária da assinatura positiva oficial. Originais intactos; Codex confere proveniência, diff e gates. Home/gráficos ficam em T2.2, feedback/formulários em T2.3 e internas bloqueadas pelo gate A.

Checkpoint WIP LOCAL T2.1: `66dc1afa2141238b1a5da46f51a1ab40d1920fb6` (`wip: pre-claude T2.1`). Raiz/dry-run, inspeção dos dois documentos candidatos, varredura saneada de segredos e diff staged/check passaram; nenhum gerado incluído. Sem push/commit final.

Entrega Sonnet T2.1: sessão `6dc5bcf7-b914-48cc-ab43-4c3aa0e7ca76`, `succeeded`, modelo observado `claude-sonnet-5-5`, sem esforço explícito. Módulo de seleção/boot em `components/theme`, tokens semânticos separados dos oficiais, globals/layout, header/footer por CSS com uma assinatura cada e E2E dirigido. Assinatura positiva copiada byte a byte; SHA256 `3592e374932e1f9b9170ef72903ccf00bb1b06d026680cff96bfdc2241e4e615`, conforme original/catálogo. Assinatura negativa pública preservada: hash `c13e7a9d…`, origem no export aprovado com geometria oficial, já registrada em `references/audits/public-assets.json`; não é divergência nova. Barra76/offset96 preservados; logo desktop43px de altura (+26% sobre34), mobile34, proporção1156.5/344.5 sem recorte. Assinaturas como background SVG pronto com nome acessível, sem reconstrução ou DOM escondido duplicado.

Revisão independente Codex + consulta obrigatória da ponte `943fedb8-2c6d-4b95-bc74-129ea9703f54` (`sonnet` observado5.5, leitura, `succeeded`). Ponte apontou P2 de primeira interação pré-hidratação mascarada por retry do teste e risco estimado de largura entre breakpoints (não medido). Codex já corrigiu prontidão do seletor via snapshot determinístico e teste de uma única escolha com JS atrasado; removeu replay de `selectOption` e combinou seed/instrumentação de storage num único initScript para evitar ordem indefinida. Seletor mantém seta12×8/right16/padding-right44 e hit target44px; gap ajustado em≤380. Novo teste mede controles em560/600/768/959/960/1099/1100. Risco estimado só será fechado após execução, não tratado como falha comprovada. Transições de cor da Home e assinatura/paleta dos gráficos ficam em T2.2; legendas/campos de formulários em T2.3; internas seguem gate A. Contraste/forced-colors visual não certificados.

Gates T2.1 em execução: lint/typecheck e614 unitários passaram; build e E2E ainda aguardam conclusão. Nenhum efeito externo/configuração/deploy. Preferência system usa CSS no SO; observação do tema resolvido para Canvas/Three será integrada por Codex em T2.2, sem acoplar seleção ao estado de pausa nem remontar gráficos.

Atualização de validação: build passou; lint/typecheck reexecutados após reforçar os testes e passaram. E2E focado `theme.spec.ts --workers=1`:40 passes/zero retries (20,2s). E2E completo em execução. Follow-up somente leitura da revisão `943fedb8-2c6d-4b95-bc74-129ea9703f54` confirmou os dois P2 tratados no código/testes; não alegou executar testes. P3 a incorporar no lote seguinte: aguardar seletor habilitado no teste de Tab e verificar margem interna do header a320 (estimativa não substitui medição). Nenhum novo bloqueante; transições de cor da Home ainda são parte de T2.2.

- [x] SO inicial, claro/escuro/Sistema preservados; storage bloqueado, reload e SPA sem quebra/flash recorrente/hidratação inválida.
- [x] Header/footer/assinaturas por tema; marca maior proporcional, sem clipping a 320 px ou disputa com menu/seletor/CTA.
- [x] Teclado, Escape, foco, âncoras/offset real, fontes locais e pausa gráfica independentes da preferência.

**T2.1 concluída tecnicamente:** lint, typecheck,614 unitários, build e E2E completo330 passes/6 skips/zero retries (6,6min) passaram. Logs `references/audits/website-revision/t21-{lint,typecheck,unit,build,e2e}.log`, mais40 testes focados no log `t21-theme-focused.log`. Gerado `next-env.d.ts` inspecionado e restaurado, sem alteração intencional. Revisões e limitações acima; aceite visual permanece exclusivamente no gate A após T2.2/T2.3.

#### T2.2 [codex] Adaptar Home e gráficos

**Depende:** T2.1. **Arquivos:** features/home, features/graphics e cópias públicas necessárias.

Execução Codex iniciada em30/10/2026. Integrar paletas e setters de gráficos, sem novos loops/contextos e sem nova animação de tema. Integrar também as propostas da Home consolidadas pelo Sonnet emT1.2, preservando hero, hierarquia, cinco etapas e conteúdo idêntico entre temas; é a Home apresentada no gate A. Nenhuma interna será portada nesta tarefa. Revisão da abordagem T1.3 continua válida; implementação receberá revisão independente e consulta de diff da ponte.

Implementação T2.2: tokens de Home e faixas por superfície; observação única do tema resolvido em GraphicsProvider (MutationObserver/MQL com descarte), setters de uniforms e atlas sem nova cena/contexto/canvas/loop. ASCII mantém rampa aprovada nas faixas verdes e adapta a página; repaint só no scheduler, suspenso quando hidden/offscreen. Fallbacks usam cópia positiva oficial do símbolo (`04fded626cb110ae4efaeb182b6c895a187819d1fb9c87b350c16d4f3e4c6715`) e negativa preservada por token. Símbolos/logotipos não foram reconstruídos. CopyHome integrada da matriz T1.2, hero e5etapas preservados. Transições de cor/hover foram tornadas instantâneas para a mudança de tema; transições aprovadas de opacity/transform nos painéis continuam, assim como movimento/arrasto/scroll. Sem animação nova (gate animate: ação de preferência/teclado, indicação de estado instantânea).

Revisões T2.2: GPT `/root/review_t13_contracts` examinou diff/callers somente leitura, sem P1/P2 encontrado. Consulta obrigatória Sonnet5.5 somente leitura `ccd3ba0b-22f7-4cff-a371-0a31d29fd541` terminou `succeeded`, apontando P2 visual de dupla conversão de cores no ramo claro, P2 de estado intermediário das internas e P3 de transições/cobertura. Codex corrigiu só o ramo claro do shader cru com `setStyle(..., LinearSRGBColorSpace)`, mantendo conversão do escuro aprovado; conforme [Color Three.js](https://threejs.org/docs/pages/Color.html). Internas continuam incompletas em claro por gate A/T3.1, limitação intencional registrada, sem publicação. Paleta ASCII inválida agora falha no callback protegido e mostra fallback em vez de ignorar NaN. P3 de Tab/margem320 incorporados aos testes. Limite: simulação de hidden não prova aba real/hardware.

Evidências parciais: lint/typecheck/614 unitários/build passaram. Quatro E2E novos de troca manual/SO com pausa, identidade de canvas/contexto e hidden simulado passaram (10,6s). Regressão focada Home/gráficos/SPA/serviços/navegação/tema:142 passes,4 skips,zero retries (4,2min) antes da correção de cor. Após correção: lint/typecheck/unit/build passaram; E2E dirigido de paleta/fallback em execução e captura visual ainda pendente. Logs `references/audits/website-revision/t22-*`; diff saneado para revisão em `t22-review.diff`. Não atribuir testes aos revisores nem declarar gate A cumprido.

**T2.2 concluída tecnicamente:** E2E pós-correção12 passes/zero skips/zero retries (23,8s), incluindo tema/fallback e paleta inválida; follow-up da consulta `ccd3ba0b-22f7-4cff-a371-0a31d29fd541` terminou `succeeded`, sem P1/P2 novo, confirmou ramo claro e paridade do escuro. P3 de validação de hi/ring incluído no guard; typecheck e lint focado após esse ajuste. Últimos build/614 unitários precedem apenas esse reforço defensivo e serão renovados nos gates obrigatórios de T2.3. Capturas locais sem pageerrors em `references/audits/website-revision/t22-visual/`: hero claro e princípios claro/escuro, com fontes prontas, pausa/reduced-motion. Codex inspecionou hero/princípios claros, sem clipping de conteúdo ou perda de legibilidade. Contraste calculado das cores aplicadas: texto claro12,63:1, apoio5,41:1, foco7,30:1; texto escuro16,41:1, apoio no painel13,05:1, foco6,91:1; apoio/faixa verde10,68:1 e foco5,32:1. Não certifica WCAG, hardware ou aceite visual; apresentação completa dos dois temas fica no gate A.

- [x] Mesma composição/conteúdo, processo geral e efeitos nos dois temas.
- [x] ASCII/moldura/3D/grafismos e fallbacks legíveis em superfícies claras/escuras/verdes.
- [x] Troca de tema preserva pausa/reduced-motion, suspensão e descarte, sem duplicar loops/canvases/GPU.
- [x] Assets rastreáveis, originais intactos e contraste/foco medidos na amostra.

#### T2.3 [claude:escreve] Implementar feedback compartilhado — Sonnet

**Depende:** T1.2/T1.3/T2.1. **Arquivos:** FormStatus, forms.module.css, useLocalSubmission, forms.ts e formulários.

Preflight T2.3 em30/10: raiz Git conferida, dry-run29 arquivos e inspeção de segredos/gerados sem achados; `next-env.d.ts` gerado restaurado antes do staging. Checkpoint WIP LOCAL autorizado `84cdee118c847eef8e4ba3489975fb517e9f964b` (`wip: pre-claude T2.3`), sem push. Hash registrado antes da chamada. Sonnet escreve somente formulários/adapter e testes delimitados; sem internas, provedores, emails/PDFs, instalação ou efeitos externos. Gates completos e revisão independente depois da entrega.

Entrega `da05edbf-e720-41a4-8119-5c3b56da2fab`, modelo observado `claude-sonnet-5-5`, `succeeded`: painel/ações sem avisos ociosos, campos semânticos, retryAfter preservado, resultado incerto neutro e consentimento comercial sem promessa de entrega. Sonnet executou lint/typecheck e34 unitários focados, sem build/E2E. Integração Codex corrigiu região viva persistente (sem caixa/gap idle), CAPTCHA sempre compacto e superfície fixada sem reset por tema, chevron SVG12×8 e foco na superfície do widget. Revisor GPT `/root/review_t13_contracts` apontou P2: limites do cliente divergentes da API e borda do contato1,33:1. Codex alinhou limites120/160/32 e email254 nos helpers compartilhados, mensagem400 genérica e borda Folha4,10:1. Sem P1/P2 adicional reportado; nenhuma escrita do revisor.

Gates Codex após integração: lint/typecheck,37 arquivos/629 unitários e build passaram. Novo E2E dirigido teve4 passes e4 falhas no seletor do teste (nome do botão muda durante envio); seletor corrigido para botão submit estável sem alterar produção, atraso350ms ou guarda de duplicidade. Suíte E2E completa em execução; não declarar rodada verde antes do término. Consulta obrigatória da ponte `f129e4b0-8c0c-4ef3-b62e-2595a805468e` somente leitura em execução, patch saneado `references/audits/website-revision/t23-review.diff`. Logs `t23-*`; nenhuma submissão externa, instalação ou publicação. Internas aguardam gate A/T3.1; leitor real e CAPTCHA real ainda não certificados.

Revisão da ponte terminou `succeeded` e identificou P1 real introduzido pela substituição CSS integradora Codex: perda acidental da regra base dos campos. Corrigido restaurando dimensões/borda/padding/cores/placeholder; E2E agora exige cores reais da faixa, além de contraste, evitando falso positivo por estilo nativo. P2 de anúncios concorrentes no reset pós-submit corrigido silenciando apenas `ready` após reset, preservando statusId e demais estados. E2E em curso foi interrompido, sem declarar passe; lint/typecheck/629 unitários/build repetidos na árvore corrigida passaram. Follow-up da mesma consulta terminou `succeeded`, confirmou P1/P2 resolvidos, sem execução de testes pelo revisor. P3 residual: anúncio do CAPTCHA solved ao reativar aria-live pode variar por leitor; botão habilita e descrição permanece acessível, leitor físico não verificado. Nova rodada E2E completa iniciada após correções, sem retries.

Rodada seguinte terminou343 passes/6 skips/1 falha em teste antigo Home: seletor global aria-live/atomic encontrou também os novos formulários. Corrigido somente o seletor para o anúncio Etapa; a rodada posterior foi interrompida por descoberta visual legítima, sem declarar passe. Captura+revisão GPT confirmaram labels verdes invisíveis na faixa verde no tema claro: faltava recalcular `color` no escopo que muda `--text`. Corrigidos `.form` e faixas da Home com `color:var(--text)`, teste exige cor real do label igual à do input; nova checagem pontual da consulta `f129e4b0-8c0c-4ef3-b62e-2595a805468e` terminou `succeeded`, sem regressão identificada. Lint/typecheck/629 unitários/build passaram novamente. Capturas finais1440/390 nos dois temas sem pageerrors/POST/overflow; feedback do contato refeito recortando o próprio formulário para não incluir sobreposição do header fixo. Inspeção Codex confirmou labels/campos/painel legíveis. Nova rodada E2E completa em execução sobre essa árvore, sem retries; logs finais `t23-e2e-final.log`. Nenhuma repetição foi declarada verde nem usada como aceite humano.

**T2.3 concluída tecnicamente:** lint, typecheck,37 arquivos/629 unitários, build e E2E completo344 passes/6 skips/zero retries (6,4min) na árvore corrigida. Evidências `references/audits/website-revision/t23-{lint,typecheck,unit,build}.log` e `t23-e2e-final.log`; rodadas anteriores com falha/interrupção preservadas como histórico acima. Revisões Codex, GPT independente e ponte Sonnet concluídas; P1/P2 encontrados tratados. Nenhuma nova dependência, alteração de fórmula, email/PDF/edição ou efeito em provedor. Gerado next-env inspecionado e restaurado após gates; nenhum commit final/push/deploy. Aceite visual permanece no gate A.

- [x] Painel/erros/actions conforme 4.4 nos dois temas; nenhum aviso/painel inicial padrão vazio.
- [x] Preservar protocolo, dados após falha, dupla submissão, retryAfter necessário e pedido≠entrega.
- [x] Demo explicitamente demo; nenhum erro cru, enumeração ou anúncio duplicado.
- [x] Testes focados dos estados e contratos alterados, sem envio externo.

#### T2.4 [codex + Renato] Gate A: aprovar Home, header e feedback

**Depende:** T2.1–T2.3. **Bloqueia páginas internas.**

Material local de revisão em `references/audits/website-revision/gate-a/index.html`, servido somente em `http://127.0.0.1:3102/`; Home interativa demo em `http://127.0.0.1:3100/`. Quatro capturas completas1440/390 claro/escuro,32 capturas de seção,4 exemplos de formulário e amostras estáticas do componente real para oito estados dos três fluxos. Dados/protocolo fictícios, nenhum POST/API; fontes prontas, pausa/reduced para estabilidade. `capture-results.json`: zero pageerrors/POST/overflow nos quatro cenários; links locais válidos. Codex inspecionou amostra de hero mobile, princípios, serviços, newsletter e contato; GPT independente inspecionou seis capturas e confirmou a correção visual final dos rótulos. Sem outro bloqueante concreto; capturas por elemento podem recortar o header, as quatro capturas completas e a Home interativa são a referência do shell. Leitor real/hardware/CAPTCHA real não certificados; P3 de anúncio solved permanece documentado. Material apresentado para aceite de Renato; gate A ainda pendente, internas bloqueadas.

**Aceite explícito de Renato em30/10/2026:** resposta nativa “Aprovar o gate A e avançar (recomendado).” Home/header/feedback nos dois temas aceitos para avanço às internas. Gate B, elegibilidade do destino, ativação de destinatários e publicação seguem independentes; nenhum commit final/push/PR autorizado.

- [x] Apresentar Home inteira desktop/mobile claro/escuro e estados de feedback com fakes seguros.
- [x] Registrar aceite explícito ou ajustes; aprovação antiga do escuro/silêncio não substituem esse gate.
- [x] Revisão independente do diff visual/contratos, sem redesign ou novas rodadas sem motivo.

### Fase 3 — internas e conteúdo final

#### T3.1 [claude:escreve] Aplicar temas e revisão editorial às internas — Sonnet

**Depende:** gate A/T1.2. **Arquivos:** serviços/ferramentas/newsletter/privacidade/404 e estilos.

Início T3.1 em30/10 após aceite explícito gate A. Dry-run16 arquivos, inspeção de segredos/gerados e diff-check sem achados; checkpoint WIP LOCAL autorizado `c8d3d93b1bd65a97c1aabe3f916ac3eb3b7cc123` (`wip: pre-claude T3.1`), sem push, hash registrado antes da chamada. Sonnet limitado a componentes/content/estilos das internas e testes associados, sem Home/shell/gráficos/modelos/catálogo editorial/APIs/emails/PDFs/configs. Privacidade será preparada para gate B com estado provisório verdadeiro, sem inventar identificação/base legal/prazo de cópias externas. Sem efeitos externos ou publicação. Gates completos e revisões independentes após entrega.

**Bloqueio de cota T3.1:** sessão de escrita `ba8b44c4-5b9a-4f72-bc8c-71edcca2ae7a`, inicialização observou `claude-sonnet-5-5`; terminou `failed` em30/10/2026 18h02m55s Brasília (80s), sem entrega e sem alteração de código. Resultado terminal sintético informa limite de sessão com reset indicado às18h10 America/Sao_Paulo; stderr inclui avisos unrecognized_model do título auxiliar/sdk, não prova modelo alternativo executando a tarefa. `claude-cancel` chamado e confirmou estado terminal `failed`, sem sessão de escrita ativa. `git status/diff c8d3d93`: somente registro PLAN alterado, fonte intacta. Renato será consultado conforme protocolo antes de retomar; sem fallback Codex/CLI/API paga ou alteração de defaults. T3.1 não concluída; nenhum novo gate alegado sem entrega.

Renato respondeu “Aguardar a renovação e retomar com Sonnet (recomendado)” e informou “Sessão do Claude renovada”. Retomada autorizada às18h31 Brasília: raiz/main/HEAD `c8d3d93` e árvore revalidados, somente PLAN alterado; dry-run/diff-check sem gerados ou segredos. Mesmo assunto T3.1, mesmos limites; novo checkpoint local do registro antes de continuar a sessão da ponte. Nenhum fallback ou mudança global.

Checkpoint da retomada `2237d4f650ec6667ac71aa66cbd5302c2b7dc244` (`wip: pre-claude T3.1 resume`), hash registrado antes de `claude-reply` da mesma tarefa. WIP anterior continua referência de código idêntico; nenhum arquivo de aplicação mudou na interrupção.

Entrega retomada da mesma sessão `ba8b44c4-5b9a-4f72-bc8c-71edcca2ae7a`: `succeeded`, modelo observado `claude-sonnet-5-5`,527s. Sonnet implementou content/ServicePage/estilos de serviços, CSS/ToolPage, CSS/copy newsletter/metadata, Privacidade e404;636 unitários/tipos/lint focado executados por ele, sem build/E2E. Codex revisou o diff e integrou scopes button/graphic da faixa verde, forced-colors/SO do seletor, H1 no helper QA, testes de tema mobile/manual e Privacidade revisável também em demo com descrição condicionada. Incluiu uso de IP na segurança e distinguiu exclusão leads6meses inatividade de assinaturas canceladas6meses cancelamento, em lotes, sem promessa para confirmados ativos/cópias externas. Fatos confirmados por GPT independente em leitura de server/types/defense/retention/jobs/http/development; revisão final da fonte por esse GPT falhou por limite de uso (sem parecer final alegado, sem upgrade ou troca silenciosa). Codex permanece revisor independente do executor; consulta de diff da ponte aberta em `3c165c77-5982-4a31-bd1b-64568c34bf68`.

Gates Codex após integração: lint/typecheck,38 arquivos/636 unitários e build passaram. E2E focado de temas/serviços em execução, antes da rodada completa obrigatória. Patch saneado `references/audits/website-revision/t31-review.diff`, logs `t31-*`. Sem efeitos externos/envios/instalação/deploy; Home/shell/gráficos/modelos/edições intactos. Ainda não marcar T3.1 concluída nem gateB aprovado.

Validação/revisão integradora T3.1:48 E2E focados passaram (37,6s) nos dois projetos. Capturas locais de sete rotas em1440/390 claro/escuro:28 completas+8recortes Cyber, status esperados200/404, zero pageerrors/POST/overflow; amostras de frentes/método claros e prévia mobile escura inspecionadas por Codex, sem bloqueante visual concreto. GPT independente retomou revisão após a janela de cota, examinou o patch real e concluiu sem P1/P2, somente leitura. Consulta Sonnet `3c165c77-5982-4a31-bd1b-64568c34bf68` inicial foi limitada à fonte porque a geração do diff falhou temporariamente por encoding; arquivo UTF8 corrigido e confirmado antes do follow-up. No follow-up `succeeded`, ponte confirmou leitura do diff real e ausência de P1/P2. Foram tratados pontos concretos: Privacidade usa availability dos três fluxos, condiciona processadores/retenção a envios habilitados e ajusta concordância; teste torna selects obrigatórios, mede foco e forced-colors em Sistema. Após esses ajustes: lint/typecheck/636unit/build e20 E2E de temas finais passaram (20,6s); capturas de Privacidade serão atualizadas isoladamente. Fontes das demais capturas não mudaram, sem recaptura redundante. Foco na borda externa foi amostrado, leitor/hardware real não certificados. Rodada E2E completa ainda pendente de término.

Capturas finais de Privacidade atualizadas nos quatro cenários,200/zero erros/POST/overflow. Primeira rodada E2E completa teve364 passes/6 skips/2 falhas: única expectativa antiga do título de Cibersegurança em public-routes.spec.ts, repetida desktop/mobile. Corrigida para o título aprovado, sem mudar produção nem afrouxar asserção; busca das antigas strings nos testes/src não encontrou outra expectativa desatualizada. Lint/typecheck passaram após ajuste de teste. Rodada completa final em execução; não alegar passe antes do término. Evidência atual `t31-e2e-final.log`, anterior `t31-e2e.log` preservada.

**T3.1 concluída tecnicamente:** lint/typecheck,38 arquivos/636 unitários, build e E2E completo366 passes/6 skips/zero retries (6,9min). Logs `t31-{lint,typecheck,unit,build}.log` e `t31-e2e-final.log`; rodada anterior com expectativa antiga preservada. Gates/revisões/contraste/capturas descritos acima; sem P1/P2 conhecido. `next-env.d.ts` gerado inspecionado e restaurado antes do próximo WIP. Nenhum commit final/push/deploy. A Privacidade continua provisória até gate B e ativação continua bloqueada.

- [x] Todas as superfícies da matriz 4.3 com tema/feedback/copy corretos, incluindo tabelas/selects/foco.
- [x] Etapas estruturadas por serviço, sem stages[index] global nas internas; Home mantém cinco etapas.
- [x] Hero literal e Pentest sem badge/hierarquia superior; catálogo e escopos verdadeiros.
- [x] Fórmulas/negativos/desconhecidos/cálculo local intactos; nenhum resultado em payload/storage/log/URL.
- [x] Arquivo/prévia preservam largura/paginação e corpo privado; slug inexistente continua HTTP 404 real.

#### T3.2 [claude:escreve] Alinhar confirmar/cancelar e estados excepcionais — Sonnet

**Depende:** gate A/T2.3. **Arquivos:** páginas/clients confirmar e cancelar + feedback comum.

Preflight T3.2 em31/10/2026: raiz Git/main conferidos, dry-run20 arquivos e inspeção de segredos/gerados/diff-check sem achados; next-env gerado restaurado. Checkpoint WIP LOCAL autorizado `ebda4d8a87ed602709c30e570a6de5ef3a12c320` (`wip: pre-claude T3.2`), hash registrado antes da chamada. Sonnet limitado às ações cliente/páginas, apresentação compartilhada do feedback e helpers/testes necessários. APIs/criptografia/config/provedores/emails/PDFs/catálogo/modelos intactos; sem novo modo public ou efeitos externos. Contrato inclui captura/limpeza segura do fragmento, POST só por ação, guarda imediata de duplicidade, abort/descarte e classificação correta de400/403/409/410/429/503/5xx/rede, com preservação do token quando o resultado não for inválido/consumido. Gates completos e revisão independente após entrega.

Entrega Sonnet `5f1115ce-f895-45d4-adf6-5b066c30cb0d`, modelo observado `claude-sonnet-5-5`, `succeeded` (360s). Implementou adapter puro, hook compartilhado com ref/abort/hashchange, NewsletterAction e wrappers, extração de FeedbackPanel preservando DOM/idle, CSS de pilha e testes. Sonnet executou649 unitários/tipos/lint, sem build/E2E. Integração Codex neutralizou409/410 sem inferir inscrição ativa, corrigiu mensagem incerta que prometia link usado também no cancelamento (API replay retorna200), adicionou ajuda noscript e títulos absolutos, e tornou espera de payload no teste determinística/abort esperado explícito. Dois servidores E2E e prévia manual agora fixam BACKEND_MODE=off localmente, sem alterar defaults/provedores remotos. APIs/cripto/conteúdos/PDFs intactos.

Revisões: GPT independente confirmou contratos HTTP/idempotência no servidor e depois o patch T3.2, sem P1/P2. Consulta obrigatória Sonnet somente leitura `8c441640-d12d-461b-bde3-05492b5635a5` leu diff real `references/audits/website-revision/t32-review.diff` e terminou `succeeded`, sem P1/P2; não executou gates. P3 conhecidos: fetch não tem timeout novo (pré-existente); histórico de hashchange pode criar entrada duplicada,403 retém token em memória sem retry, leitor real não certificado. Readiness mínima independente do cancelamento segue naT4, não inferir resolvida só pela UI.

Gates integradores: lint/typecheck,39 arquivos/650 unitários e build passaram;72 E2E focados de ações/feedback/foundation passaram (44,6s), sem skips/retries. Capturas das ações com APIs interceptadas em execução; E2E completo obrigatório ainda pendente. Logs `t32-*`. Nenhum destinatário real ou provedor acionado; gate B permanece pendente.

Capturas T3.2 concluídas:32 imagens (duas ações×pronto/indisponível/concluído/link inutilizável×desktop/mobile×claro/escuro), `references/audits/website-revision/gate-a/gate-b/`. Oito cenários, cada um com três POSTs interceptados previstos, zero pageerrors/overflow/token visível em DOM ou URL; arquivo `capture-results.json`. Codex inspecionou cancelamento mobile claro indisponível e confirmação desktop escura concluída, sem bloqueantes de legibilidade/layout. Nenhum provedor acionado. E2E completo está em execução; backend local explicitamente off nos dois servidores de teste. Fontes permanecem estáveis após gates de lint/typecheck/unit/build; testes não foram pulados nem tiveram retries acrescentados.

**T3.2 concluída tecnicamente:** lint/typecheck,39 arquivos/650 unitários, build e E2E completo414 passes/6 skips/zero retries (7,2min). Logs `t32-{lint,typecheck,unit,build,e2e}.log`; fonte da aplicação não mudou depois do build, apenas esperas de teste e env local off foram explicitados e lint/tipos/E2E revalidados. Revisões Codex/GPT/ponte e capturas concluídas sem P1/P2. GPT fez ainda revisão visual de quatro capturas (duas ações,409 e Privacidade), sem bloqueantes, sem certificar jurídico/operação real. Entrada de cancelamento no cliente não depende de quota/readiness de novos envios; desacoplamento mínimo da configuração do servidor e reconciliação continuam contratos T4, sem alegar teste real de esgotamento. Next-env gerado inspecionado/restaurado; nenhum commit final/push/deploy.

- [x] Loading, token inválido/expirado, sucesso e já processado nos dois temas, com foco/ação úteis.
- [x] Idempotência e transporte seguro de token preservados; sem reativação/envio por navegação indevida.
- [x] Cancelamento continua acessível se novos envios/inscrições estiverem pausados por capacidade.

#### T3.3 [codex + Renato] Gate B: revisar Privacidade e coleta

**Depende:** T1.2/T3.1. **Bloqueia ativação public.**

Material para revisão em `http://127.0.0.1:3100/privacidade` e galeria local `http://127.0.0.1:3102/gate-b/`, com quatro capturas de Privacidade e amostras de ações com APIs interceptadas. Preview serve FORM_MODE=demo/BACKEND_MODE=off, sem coleta operacional. Texto explicita dados/finalidades, IP/Turnstile, Firestore/Resend/Discord/hospedagem, memória das ferramentas, preferência visual, consentimentos independentes, duas rotinas locais de seis meses e cópias externas sob responsabilidade de Renato sem prazo universal. Permanece provisório e declara pendências de identificação jurídica/bases legais/prazos de atendimento/países/política de cópias externas; nenhum dado legal fabricado ou parecer jurídico. Revisões técnicas/visuais não substituem o aceite explícito de Renato. Gate B pendente, nenhuma ativação autorizada pelo silêncio.

**Aceite explícito de Renato em31/10/2026:** “Aprovar o texto e registrar os limites (recomendado)”. Aprovação do texto operacional com as pendências descritas, sem transformá-la em parecer jurídico nem preencher dados legais por inferência. Limites de cópias externas, identificação/bases/prazos/países permanecem explícitos; a aprovação não os resolve ficticiamente. Gate B cumprido para prosseguir, enquanto abertura e rollout continuam dependentes das fases4/5 e elegibilidade do destino. Nenhum destinatário, provedor, billing ou deployment alterado neste aceite.

- [x] Fluxos/provedores/finalidades/retenção/cópias e preferência visual reais, sem dizer “nada envia” com API ativa.
- [x] Canal oficial e responsável operacional; nenhum cargo/dado legal/base presumidos.
- [x] Marketing/newsletter independentes, sem falsa certificação ou parecer jurídico.
- [x] Renato revisa explicitamente a página; até lá nenhuma publicação abre destinatários.

### Fase 4 — modo público e integrações

#### T4.1 [claude:escreve] Estender modos e readiness sem bypass — Sonnet

**Depende:** T1.3. Implementação local pode anteceder gate B; ativação não.
**Arquivos:** mode/http/configs, forms/hook/formulários, newsletter source/current, webhook, ToolPage e testes.

Início em31/10/2026 após gate B. Preflight raiz/main, dry-run13 arquivos, inspeção de segredos/gerados e diff-check sem achados. Checkpoint WIP LOCAL autorizado `33b573f9e0b8d3109d4d7106aa4950eb4eff7fe6` (`wip: pre-claude T4.1`), hash registrado antes da chamada. Revisão independente GPT mapeou todos os guardas HTTP/configs/jobs/webhook/catálogo/cliente: public não pode cair fora do bloco de defesas; cancelamento exige origem/segredo/prova/armazenamento, não remetente/cota. Como estado intermediário local, Broadcast e sincronização public que possa reativar contato ficam bloqueados antes de efeitos, preservando jobs para T4.2; admissão de e-mails externos não será alegada operacional antes dos controles de capacidade. Não introduzir flag global de bypass. Gate B não preenche pendências legais; qualquer copy dependente do modo deve preservar esses limites. Sem ativação, deployment ou destinatários externos. Sonnet escreve escopo delimitado; Codex revisa e roda todos os gates após entrega.

Entrega Sonnet `55ca8399-9ea3-4ed3-b46f-3fb177657683`, modelo observado `claude-sonnet-5-5`, `succeeded`,616s. Implementou public explícito, defesa operacional comum, diagnóstico público sem Resend, catálogo real/projeção, cliente real/CAPTCHA, jobs/editorial/webhook autenticados; novos e-mails public seguem503 e readiness indisponível atéT4.2. Handlers Broadcast/contact-sync public têm hold antes do provedor. Codex corrigiu cancelamento para carregar origens independentemente de Turnstile/remetente, modo desconhecido injetado para fechar antes do corpo e fila mista para adiar tipos suspensos em vez de excluí-los da consulta limitada. Teste três Broadcasts anteriores+diagnóstico produz4 claims/3 adiamentos/1 conclusão, zero mortes e sem gastar tentativas nos suspensos. GPT independente encontrou esse P2 de fila e confirmou correção sem bloqueantes residuais; não executou gates.

Consulta obrigatória Sonnet somente leitura `e8197746-ce36-4417-9714-50ee03079adf`, `succeeded`,181s, modelo5.5. Nenhum bypass/P1; apontou comoP2 cancelamento local sem sync e linguagem residual piloto. Triagem Codex: a independência do cancelamento também no piloto é mudança intencional deT1.3/T4.1, não alegar “piloto inteiro inalterado”; ausência de Broadcast não prova opt-out remoto e já possui teste explícito sem sync. Reconciliação pendente e bloqueio de segmento são obrigaçõesT4.2, não resolvidas por essa entrega. Ajuste das frases dependentes do modo/contato operacional deve acompanhar a abertura dos e-mails emT4.2, mantendo as pendências do gateB sem inventar papel jurídico. Frases condicionais “quando habilitados” continuam verdadeiras; nenhuma versão public está ativada. Backlog adiado pode elevar latência; validade24h não foi estendida e jobs incertos não autorizam reenvio. Teste de webhook com tag inválida também já existe e preserva assinatura/correlação.

Gates locais integrados em execução: lint/typecheck e42 arquivos/695 unitários passaram; build passou sem mudança posterior na aplicação (só teste editorial public acrescentado). Esse teste preserva HMAC/escopo/replay/prova Discord e aprovação idempotente; sua primeira expectativa incorreta403 para prova ausente foi corrigida para400 conforme parser existente, sem mudar API. E2E completo em execução, sem resultado final alegado; logs `t41-{lint,typecheck,test,build,e2e}.log`. Sem segredos, efeitos externos, instalações ou publicação.

**T4.1 concluída tecnicamente como etapa intermediária local:** lint/typecheck,42 arquivos/695 unitários, build e E2E completo414 passes/6 skips/zero retries (7,1min). Os seis skips continuam sendo os opt-in/limitações já registrados, não passes. Next-env gerado inspecionado/restaurado. Nenhuma fonte da aplicação mudou depois do build; só o teste editorial public foi acrescentado e lint/tipos/unit revalidados. Revisões independentes e consulta da ponte registradas acima; capacidade/consentimento e revisão das frases public permanecemT4.2, elegibilidade/configT4.3. Não equivale a public apto para rollout.

- [x] Public explícito; desconhecido/off fecha; demo não faz rede; piloto conserva allowlists/segment guard.
- [x] Public mantém todas as defesas/configurações e escopos; nenhum fallthrough pula Turnstile/HMAC.
- [x] Readiness independente por serviço e cancelamento funcional; só modo/site key expostos.
- [x] Catálogo real/projeção correta em public, não demonstrações; jobs/webhook/decisões operacionais.
- [x] Testes de modos/configs/identidades/API/catálogo/ações atualizados com contratos novos, sem apagar proteção anterior.

#### T4.2 [claude:escreve] Controlar capacidade Free e consentimento público — Sonnet

**Depende:** T4.1. **Arquivos:** newsletter-email/broadcast, repository/types quando indispensável, report/limits e testes.

Preparação Codex em31/10: revisão independente GPT dos arquivos estáveis repository/types/store/jobs definiu riscos concretos de reserva após dedup, retorno Denied sem rollback, confirmação substituída em voo, mudança de bucket UTC e limpeza de confirmação/counter com reserva ou resultado incerto. Contador local zero não comprova ocupação da conta; baseline remoto completo/inconclusivo deve fechar admissão de marketing, sem varredura por submit. Cancelamento grava pendência de reconciliação mesmo sem config de Broadcast; não devolve vaga remota presumida. Documentação oficial Resend revalidada em31/10: [paginação](https://resend.com/docs/api-reference/pagination) por limit/after/has_more e máximo100 por página; [update-contact](https://resend.com/docs/api-reference/contacts/update-contact) define unsubscribed global. SDK instalado contém esses contratos em `resend/dist/index.d.mts`; sem atualização de dependência. Tetos locais do plano permanecem100/dia UTC/3000mês e marketing1000, sem teste real de esgotamento ou garantia de total da conta.

InícioT4.2: preflight24 arquivos inspecionados sem achados de segredo/gerado; raiz/main e diff-check conferidos. Checkpoint WIP LOCAL autorizado `ea5955a5fd5b4bd1a15c3215862ca4d8842455ae` (`wip: pre-claude T4.2`), hash registrado antes da chamada. Sonnet dono único do backend/callers/readiness e testes delimitados; alterações somente locais, provedores simulados. Nenhum segredo, instalação, ativação ou efeito real autorizado nesta escrita.

**InterrupçãoT4.2 em31/10:** sessão `8f5c7e2e-f585-4e3b-b335-7357daf34608`, modelo observado `claude-sonnet-5-5`, `timed_out` após1800s (11:59:47–12:29:47UTC). Cancelamento solicitado/confirmado e estado terminal reconferido; nenhuma execução de escrita concorrente. Diff parcial preservado: capacity.ts, reservas/repository/types/limits, e-mails/relatórios/Broadcast/webhook/jobs/HTTP e testes. Última saída mencionava falhas de report.test; inspeção posterior Codex comprovou tipos e706 unitários passando,42 arquivos (`t42-partial-{typecheck,unit}.log`), sem alegar lint/build/E2E ou tarefa concluída. Não houve mensagem de limite de cota; timeout de runtime não é tratado como autorização de trocar executor. Renato foi avisado; continuação delimitada do mesmo assunto/modelo pode prosseguir dentro da autorização vigente, sem repetir o prompt amplo nem fallback. Gates completos permanecem obrigatórios ao fechar a entrega coerente.

Revisão independente GPT da árvore parcial apontouP2: uma revogação local antiga não prova a cronologia da supressão remota atual; refresh antigo pode substituir baseline novo; cancelamento entre inspeção e stamp de Broadcast não é cercado por versão de consentimento. Codex também identificou reserva herdada de períodoUTC antigo sem rechecagem de capacidade atual, has_more ausente interpretado como fim de listagem e possível editionQueued verdadeiro diante de job deduplicado morto/concluído. Retomada deve fechar esses casos com fakes controlados e completar testes de capacidade/paginação/UTC/expiração/consentimento, além de copy por modo; sem replanejarD01–D19 ou inventar garantia de atomicidade externa.

Retomada da mesma sessão/assunto em31/10, após aviso e análise: dry-run14 arquivos, inspeção de segredo/gerados/diff-check sem achados; checkpoint WIP LOCAL autorizado `a487102bdeeeae37c8877987af9fb8ad443a9d5c` (`wip: pre-claude T4.2 resume`), hash registrado antes da continuação. Base de revisão do conjuntoT4.2 continua `ea5955a5fd5b4bd1a15c3215862ca4d8842455ae`; o novo WIP preserva a implementação parcial. Sem repetição silenciosa do prompt amplo, mudança de modelo/esforço/defaults ou efeitos externos. Continuação delimitada aos bloqueantes concretos e cobertura faltante, com os mesmos arquivos autorizados. Novo timeout/falha impeditiva exige encerrar/registrar e consultar Renato.

**Limite impeditivo da retomada:** mesmo sessionId `8f5c7e2e-f585-4e3b-b335-7357daf34608`, turno12:34:59–12:45:54UTC/655s, `failed`. Saída explícita: limite da sessão com renovação às13h30 America/Sao_Paulo. Durante a execução, modelo observadoSonnet5.5; evento final retornoumodelo`<synthetic>` e api_error/unrecognized_model no stderr, não evidência de troca de executor. `claude-cancel` chamado e estadofailedterminal reconfirmado. Sem repetição, esforço/defaults alterados, conector/CLI/API paga ou fallback. Renato avisado; próxima escrita depende da decisão solicitada para continuação conforme5.3/5.4.

Árvore posterior ao limite continua parcial: tipos e706 unitários/42 arquivos passaram novamente (`t42-limit-{typecheck,unit}.log`), mas os novos cenários de regressão pedidos não foram entregues; sem lint/build/E2E/revisão final alegados. Retomada alterou parser/fencing da medição, política de supressão global, cercas de consentimento no Broadcast, reservas herdadas e resultado deduplicado, ainda exigindo leitura final e testes dirigidos. CopyPrivacidadepublic segue pendente. Nenhum envio, ativação ou deployment. Cadência de baseline/localholders deve também ser revisada pelo orçamento de leituras: implementação parcial de10min consultaIDs e relê cada titular, estimativa estática~2N por refresh (950×2×144=273600/dia, antes de outros fluxos), acima das50mil leituras/dia Free [oficiais](https://firebase.google.com/docs/firestore/quotas). Não é medição/carga/esgotamento real; ajustar consulta/cadência com limite honesto antes de abrir, sem contratar ou alegar garantia de cota global.

**Exceção explícita de Renato em31/10/2026:** resposta “Opção2. Utilize modelos como GPT6.1 Terra / modelos de mais baixo custo que sejam ‘iguais’ aos modelos do Claude mas no GPT para finalizar essas tarefas”. Autoriza Codex a concluirT4.2 com executor GPT, sem aguardar cota ou usarCLI/API paga doClaude. Implementação restante delegada a `gpt-6.1-terra`; Codex integra, executa gates e mantém revisão por outroGPT independente. Consultas de ponte indisponíveis desta entrega serão cobertas e identificadas como revisõesGPT nesta exceção, sem alegar revisãoClaude executada nem equivalência exata de modelos/preços. Tarefas restantes do mapeamento podem usarGPT por função conforme instrução atual de Renato; não mudaD01–D19, gates humanos/segurança, limites de publicação ou autorização de commit final/push. Uma escrita por vez e arquivos delimitados; Claude estáterminal/inativo. Sem alteração de defaults globais.

Entrega nativa `/root/t42_terra_finish`, modelo solicitado/configurado `gpt-6.1-terra`, concluída com revisão Codex e GPT `/root/review_t13_contracts`. NenhumMCPClaude apóslimite. Fechou supressão global sem updatefalse genérico, bloqueio/adiamento da edição individual com syncpendente, nova confirmação para contato bloqueado, geração e sequência de baseline, cercas de versão de consentimento e aprovação no stamp, transferência de reserva entrebucketsUTC e dedupdead/done honesto. Cancelamento persiste marker/outbox independente de sender/quota; reconciliação manual continua necessária para supressão global cuja cronologia o provedor não comprova. Nova confirmação local não apaga essa supressão e a entrega continua adiada sem consumir tentativa; envio já autorizado/emtrânsito não é atomicamente cancelável retroativamente. Nenhum email/PDF/edição/modeloferramenta/Routine/Worker reescrito.

Baseline foi calibrado para refresh4h, validade8h, snapshotlatest único por titular, seq+generation e margem50. Estimativa estática em950 titulares/seisrefreshes:~5700leituras/dia nessa rotina, antes dasdemaisoperações e sem provar cota global. Snapshotausente/parcial/stalefechaadmissão; lista decontatos usa paginação/validação/bounds, não varredura a cada submit. Conta/alteraçõesexternas seguem acompanhamento deRenato, sem promessa decustozero ou autotroca de plano. CopyPrivacy por modo foi ajustada sem remover pendências jurídicas/retencão/cópias do gateB; responsáveloperacional das cópias e canal oficial permanecem explícitos.

Revisão GPT final do código/novos testes fechou os trêsP2 anteriores, sem P1/P2 residual no escopo, somenteleitura. Codex revisou quotas/admission/callers e integrou teste de recuperaçãopor diaUTC real emvezde zerar contador fake. Novasprovas de última unidade report/confirmação concorrentes, tokenpreservado semquota+consumouma vez, última vaga marketing concorrente, paginação120contatos/malformed/cursorrepetido, scanantigo vsnovo/reservaemvoo, reservaUTC com mêscheio, supressãoSDK/nenhumupdatefalse/entregaadiada, cancelamentoentreinspeçãoestamp e dedupdead/done. Não alegar exaustividade, carga/provedores reais ou ausência de risco. Lint/typecheck,45arquivos/718unitários e build passaram; E2Ecompleto emexecução, logs `t42-{lint,typecheck,test,build,e2e}.log`. Fonte daaplicação não mudou depois dobuild; só fixture deteste mudou e lint/tipos/unit foram revalidados. T4.2 não concluída pelo contadorunit enquanto E2E não encerrar.

**T4.2 concluída tecnicamente em31/10:** lint/typecheck,45arquivos/718unitários, build e E2Ecompleto414passes/6skips/zero retries (7,6min), sem provedores reais. Next-env gerado foi inspecionado/restaurado; nenhuma alteração posterior de fonte daaplicação. RevisõesCodex/GPTindependente e exceçãoTerra registradas; nenhumcommitfinal/push/PR/deploy. Serviços públicos só poderão ser ativados apósconfiguração/elegibilidade/ensaio previstos.

- [x] Identidades válidas fora da antiga lista aceitas em public; limites IP/identidade e validação intactos.
- [x] Sem novos pedidos impossíveis por quota nem 202 enganoso; sem upgrade/reset ou descarte de pedidos aceitos.
- [x] Broadcast somente aos confirmados do segmento exclusivo; cancelado/não confirmado/lead não inscrito não recebem.
- [x] Capacidade/paginação não presumem máximo de 100 e-mails de piloto; bounds/concorrência e alterações externas tratados honestamente.
- [x] Validade24h, resultado incerto e reconciliação preservados, sem duploBroadcast.
- [x] Sem revisão editorial/de design dos e-mails/PDFs/Routine nesta tarefa.

#### T4.3 [codex] Revisar segurança e preparar configuração do rollout

**Depende:** T4.1/T4.2. **Dono:** orquestrador + outro GPT.

Preflight remoto somente leitura antecipado duranteT4.2,31/10: MCP confirmou projeto/team e alias no mesmo `dpl_APgc8DdZUo44L4uW8QpwKrSyGYqa`, READY, Git main/`32c19e3209a2d252340f1dbd3da9750d3c3f56b1`. GET Home/newsletter/ROSI200 continuammodeunavailable, semsiteKey; causa não determinada. `get_git_deployment_context` confirmou plano **hobby**. [Fair Use oficial](https://vercel.com/docs/limits/fair-use-guidelines), revalidada31/10, inclui publicidade de serviços no uso comercial: bloqueio de elegibilidade do rollout a consultar no gate previsto, sem contratação/migração automática ou reabertura da hospedagem definitiva durante desenvolvimento.

MCP não expõerootDirectory no resumo; negativa403 anterior de metadados de env não foi repetida sem mudança de permissão. Fallback somente leitura na CLI54.15.1 falhou: inspect não conseguiu criar configuração global por permissão; envls executado emweb não encontrou vínculo. Semvercel link, instalação/update, override de permissão ou download/leitura de.env/valores. RootDirectory e nomes/estados de configuração permanecem não comprovados; nenhum efeito remoto. Aplicada skill vercel:deployments-cicd para inspeção, sem release.

Checklist de configuração preparado semvalores: `BACKEND_MODE` literalpublic e `FORM_MODE` fora dedemo; Firebase via`FIREBASE_SERVICE_ACCOUNT_JSON` ouADCválido; `TURNSTILE_SITE_KEY`/secret/hostnames, `TRUSTED_ORIGINS`/IPheader reais eIDsecret; chavesjobs/draft/publish separadas válidas; webhookprivado diagnóstico e followup/trigger atestados; ResendAPI/from/replyto/origin/domínio/segmento exclusivo ewebhook assinados. Os nomes estão nasregrasT1.1, mas allowlistscontinuamobrigatóriasapenasnopilot. Atestado legado`NEWSLETTER_PILOT_SEGMENT_CONFIRMED` ainda é requerido pelo loaderpublic; seu nome não prova elegibilidade/consentimento: guardas de segmento+confirmação+sync permanecem obrigatórias. Sómodo/siteKey vão ao cliente. Presença/escopo/overrides/rootDirectory remotos continuam não comprovados, nãoinferir causa deunavailable. Canal privado/atendimento e destinatários controlados para NOVOensaio continuam pendentes de confirmaçãooperador; nenhum cadastrolido/divulgado.

Rollback por fluxo preparado, semexecutar: não promover snapshot antigo semsuportepublic/cancelamento. Um deploycompatível da mesmaárvore com atestado`JOBS_TRIGGER_CONFIRMED` retirado fecha novos pedidos/handlers deenvio, preservando outbox e manutenção autenticada; manterBACKEND_MODEpublic, origens/IDsecret/Firebase e configuração mínimadowebhook conserva cancelamento e opt-out. Nãoapagarconfigderemetente/API/webhookpara“pausar” semavaliarseudesacoplamento; offglobal podeinterrompercancelamento. Env é parte dodeployment: esse procedimentoprecisade versão/configcompatívelconferida, não éumrollbackrealvalidado. Nenhumlimitecontadordados/aprovação24hfoiresetado, nenhumcanceladoreativadoouenvioincertorepetido.

- [x] Revisão de todos os callers public/pilot/consentimento sem P1/P2 conhecido.
- [x] Checklist só nomes/estados: Firebase, Turnstile, origem/IP, remetentes/Reply-To, webhook, keys internas/jobs/segmento; não abrir `.env*` nem pedir chaves no chat. CLI confirmou presença/Production; resolvers public e catálogo real comprovaram readiness de formato/atestados/Firestore, não entrega nosprovedores.
- [x] Canal privado/atendimento do diagnóstico e destinatários do ensaio confirmados; sem expor cadastro em chat/log. Confirmação explícita31/10 antes do rolloutT5.2.
- [x] GateB registrado e rollback pensado por fluxo; não promover snapshot antigo cegamente.

### Fase 5 — validação, publicação e encerramento

#### T5.1 [codex] Gates e matriz consolidada

**Depende:** Fases3/4 e gates A/B. **Dono:** QA/orquestrador; builds serializados.

Rechecagem de segurança antecipada31/10 (antes do fechamentoT4.2; sem alteração de dependências): auditprod6moderate,0high/critical; completo21moderate/1high/0critical. Advisoriesglob`GHSA-3g3m-2fjr-6pw4` e minimatch`GHSA-g3hv-75wg-m249` publicados30/10, consultados via ghCLI; patches14.0.2/11.0.1. Cadeia transitiva Firestore/google-gax/rimraf mantém versões legadas; não foi identificado caminho explorável de visitante para globbing/AbortSignal/padrões no código/libraries examinados por Codex e GPT independente, mas os pacotes permanecem instalados e isso não certifica segurança. Não usaroverride major cego ouauditfixforce (sugestões automáticas de downgrade de lint rejeitadas). Zod4.6.5 é dev viaeslint-plugin-react-hooks, patch mínimo4.6.6/latest4.6.7 compatível comfaixa existente; atualizar só resolução transitiva após terminar escritaClaude e revisarlock/gates, sem dependência direta nova. Parsers de API próprios/limitados não usamZod; revisor não executou testes/audit. Avisos consultados porghCLI, incluindo `GHSA-mrhx-c7xc-m3w5`.

[Atualização oficial Next de14/10](https://nextjs.org/blog/nextjs-security-update-october-14-2026) corrigida desde16.4.1 (instalado16.4.2). [Aviso de27/10](https://nextjs.org/blog/upcoming-nextjs-security-release-november-2026) anuncia sete moderadas para03/11, ainda sem patches/advisories publicados nesta verificação; não inventar correção antecipada. Revalidar se o rollout ocorrer após essa data.

Patch localizado Codex em31/10, apósexecutorTerra encerrar: `npm update zod --ignore-scripts --no-audit --no-fund` atualizou sóresoluçãotransitiva4.6.5→4.6.7 no lockfile (package.json intacto, semdependênciadiretanova). Npm também removeu2pacotesextraneous preexistentes; nenhum outro pacote versionado foi atualizado e build/unit passaram. Auditposterior completo21moderate/0high/0critical; produção6moderate/0high/0critical. Não házeroaviso geral: glob/minimatch e propagação declarada permanecem, sem caminho de entrada público identificado nasbibliotecas/validação/scripts examinados por doisGPTs; isso não é certificação. As revisões GitHub usaramghCLI. Nenhumaexecuçãoauditfixforce/downgrade/override major.

T5.1 consolidada em31/10: reutiliza a rodada finalT4.2 da mesmaárvore (718unit/414E2E/6skips), semnovaexecuçãocompleta idêntica. Matriz temática/contraste/reflow/SPA/gráficos/copy/privacidade e capturasT2/T3 permanecem; backendpublic/quotas/consentimento/catálogo/cancelamento cobertosporfakes/unit, sem provedor/CAPTCHA/inbox reais. Limites de leitor/hardware/CI/INP mantidos, semcertificação. LogsT42 e capturasanterioresestáveisemreferences/audits/website-revision; fonte públicaeditorial continua projeção semcorpos/respostasferramentas.

SpotchecksLighthouse13.5cached, Chrome156, buildprodução localoff, mobile/CPU4x/slow4Gsimulados/escuro, duas amostras porrota. HomeLCP3213,6/3154,5ms, TBT274,5/151ms, JS180509bytes; ROSILCP2971/2980ms, TBT537/483ms, JS316893bytes; CLS0emambas. Relatórios`t51-lighthouse-{home,rosi}[-2].json` e summary. Baselinesanteriores eram mediana de3rodadas:HomeLCP2808,5/TBT59,5/JS173328 eROSILCP2873,0/TBT453,5/JS316395. Homeapresenta piora laboratorial~12–14%LCP/JS+4,1%, TBTvariável; ROSI~3–4%LCP. Amostragemcurta não comprova INPdecampo/nemausênciaderegressão; meta2,5scontinua NÃOatingida. Repetiçãoseletivafoimotivada porTBT da primeiraamostra, não uma nova rodada de gates. D16 e limites de desempenho permanecem explícitos noaceitefinal, semabrirprojetodeLCP/benchmark de400filhos.

- [x] lint, typecheck, unit, build e E2E existentes; registrar passes/skips/falhas/retries reais.
- [x] Matriz da seção 7 com copy, contraste/overflow, modos, gráficos e privacidade; capturas estáveis por seção.
- [x] Fakes/interceptações para efeitos externos, sem colocar público num segmento de teste.
- [x] Spotcheck de regressão de desempenho, sem novo projeto de LCP ou benchmark de 400 filhos.
- [x] Revalidar advisories oficiais; patches necessários localizados e gates pertinentes, sem audit fix force/upgrade amplo automático.

#### T5.2 [codex + Renato] Publicar na Vercel de demonstração

**Depende:** T5.1, gates e configuração/segmento conferidos. Publicação solicitada nesta entrevista; execução após aprovação do plano.

Gate de elegibilidade revalidado porMCPem31/10 apósQA: teamatualcontinua **hobby**, projetoalvo vinculado. A incompatibilidade prevista no plano é concreta, não resolvida pelo nome“demonstração”; consulta aRenato antes de qualquerrollout. Semautorizaçãoaplicáveldoprovedor/planoelegível não executar abertura comercial. Config/rootDirectory/destinatários também continuam pendentes; nenhumdeploy foi tentado, contrato/billing/DNS/Worker/índice alterado. Entrega local reviewableemhttp://127.0.0.1:3100 (BACKEND_MODEoff, FORM_MODEvazio), semcoleta real. Sem commitfinal/push/PR autorizado.

**Resposta explícita de Renato em31/10 ao gate de elegibilidade:** “Já tenho autorização específica da Vercel para este uso no Hobby.” PlanoHobby permanece confirmado; requisito de autorização aplicável é atendido com base nessa declaração específica do operador, sem alegar documento/provedor verificado independentemente porMCP. Não é exceção inferida por serdemonstração. Gate liberado para continuar preparação do rollout, mantendo configuração/segmento/destinatários e demais condições; nenhum billing/contratação/migração ou commitfinal/push autorizado por essa resposta.

Preparação de fonteT5.2: MCPexpõe upload_file/create_deployment com arquivos e projectSettings, permitindo preparar publicação da árvore local validada sem pressuporcommitfinal/push. Manifesto localignoradode242arquivosweb/4327805bytes, SHA256`f34099fb7e23c4192c9410309a0114482e1557776c4c74e87d7adfdcbedde452` em`t52-source-manifest.json`; caminhosinspecionados sem.env/chaves/gerados/symlinks. FontsTTF/licenças/PDFsoriginaisdoapp permanecemintactos, não foramreescritos; references/segredos/cachesnão fazemparte. Nenhumupload/deployexecutado ainda.

Para resolver a negativa de acesso aosmetadados, `authorize_team_access` retornou`requires_user_action`: integração solicita autorização deacesso aotime naVercel porlink deusoúnico/10min. Link/nonce não gravados narepo. Não repetir envlist403 sem essa mudança deautorização; após confirmaçãooperador, consultar somente`decrypt:false` e filtrar nomes/escopos/estados, jamais valores. Não é autorização de billing/DNS, instalação deconector ou mudançadeconfigglobal.

**Revalidação após autorização de Renato, 31/10:** o MCP continuou retornando403 em envlist e também no upsert de modos; nenhuma correção por reautenticação foi presumida. Fallback mapeado na CLI54.15.1 funcionou usando somente IDs não secretos de projeto/time restritos ao processo, credenciais próprias da CLI e scope explícito. `project inspect` confirmou Root Directory `web`, Next.js e Node24.x; `env ls production` mostrou31 variáveis, todas `Encrypted`, apenas nomes/tipo/escopo. Firebase, Turnstile, origens/IP, chaves internas, diagnóstico e Resend estão presentes em Production; FORM_MODE não constava. Nenhum valor secreto ou arquivo.env foi lido, nenhum vínculo/configglobal foi criado. Presença não comprova validade dos provedores, atestados ou causa do unavailable.

Preparação autorizada dos modos do próximo deployment: MCP403 registrado; CLI `env add ... production --force --no-sensitive --yes`, valores públicos via stdin, confirmou `BACKEND_MODE=public` e `FORM_MODE=off` no projeto/time exatos. Nenhuma outra variável alterada. Conforme documentação oficial de environment variables da Vercel, mudanças se aplicam somente a novos deployments, não aos anteriores. Alias atual ainda não foi publicado/substituído. Manifesto de242 arquivos foi reconferido: SHA256 preservado, inspeção limitada de padrões de segredo sem ocorrências; não equivale a certificação de segurança. Sem upload/deploy/ensaio real até este registro.

**Confirmação operacional de Renato em31/10:** resposta nativa “Confirmo as condições; avançar ao deployment (recomendado).” Confirmou canal de diagnóstico privado, atendimento/agendador ativos, segmento somente de inscrições confirmadas e ensaio exclusivamente com contatos sob seu controle, incluindo um fora da antiga allowlist. Autoriza avançar ao deployment público previsto; não autoriza teste editorial a inscritos reais, reenvio de edições antigas, bypass de CAPTCHA, billing/DNS ou commitfinal/push/PR. Identidades e valores secretos não foram pedidos nem registrados. Condições humanasT4.3 satisfeitas; validade técnica dos provedores será aferida sem presumir sucesso.

Rollout MCP iniciado em31/10 às11h00 deBrasília: primeira criação respondeu `missing_files`, sem deployment; após upload_file dos242 arquivos com SHA1/tamanho e reconferência integral do manifesto, create_deployment criou `dpl_4anQq2EmbfFem4o6KcavwCGf2C2G`, URL `website-roottrust-8tf0wx35f-renato-soares-projects.vercel.app`, targetproduction/rootweb/Node24/Next. Fonte é árvore local suja validada sobreWIP`a487102bdeeeae37c8877987af9fb8ad443a9d5c`, identificada pelo manifestoSHA256 acima, não commitfinal. Metadados retornados pelo conector resumem meta vazio, portanto não alegar que rótulos de fonte foram persistidos pelo provedor. Build emandamento, compilação Next16.4.2 concluída; alias/readiness/catálogo/ensaio ainda não comprovados. Sem push/PR/billing/DNS/Workers.

**T5.2 publicado em31/10 às11h01 deBrasília:** MCP confirmouREADY e alias exato `website-roottrust.vercel.app` → `dpl_4anQq2EmbfFem4o6KcavwCGf2C2G`, semaliasError; build Next16.4.2 completo em29s, configuração padrão2cores/8GB, semturbo. GETs doalias: Home/Newsletter/ROSI200 com props `mode:public` e siteKey pública; arquivo200 mostra edições reais27/10 e26/10; Privacidade/confirmar/cancelar200; slug bem formado inexistente404. Todos semindexação. Fonte do catálogo Firestore funcionou; não foi usada amostra demo. Disponibilidade pública nova comprovada nesses GETs, sem atribuir causa exata ao unavailable antigo. Readiness valida formato/atestados, não entrega nosprovedores.

Smoke remoto Chromium desktop1440 emSistema claro/escuro: Home, Newsletter, ROSI eprévia real27/10, oitoGETs200, semoverflow/pageerror/POSTaoapp; oito capturas e resumo`t52-browser-summary.json`. `data-theme` ausente éesperado emSistema (mediaquery); capturasHome nosdoistemas eNewsletterclara inspecionadas. Turnstile real renderizou, semresolução/bypass ouenvioautomático. LogsMCP debuild encerrado; aviso npmcache-dir nãobloqueante. Evidências`t52-get-summary.json`, GETsHTML/capturas permanecemignoradas locais. Rollback compatível agora pode partir desteID+manifesto, conforme procedimento porfluxoT4.3; não foi executado. EnsaiohumanoT5.3 pendente, semalegar inbox/Discord/consentimento real por esses GETs.

- [x] Gate de elegibilidade: conferir o plano efetivo e as condições do destino solicitado. Hobby sem autorização aplicável do provedor não deve ser tratado como destino elegível para abertura comercial. Se houver incompatibilidade, registrar o bloqueio de rollout e consultar Renato nesse momento, sem migrar/contratar ou alterar D06 automaticamente.
- [x] Confirmar conta/projeto/team/rootDirectory web, árvore validada e config build/runtime; destino solicitado website-roottrust.vercel.app.
- [x] Registrar ID/URL/commit/modo/data e versão apta a rollback; nenhum segredo no registro. ID+manifesto atuais identificam fonte compatível; reversão porfluxo não foi ensaiada.
- [x] GET pósdeploy confirma modo real, catálogo e alias corretos; READY sozinho não basta.
- [x] Sem migração/DNS/billing/indexação ou deploy de Workers inalterados.
- [x] Se depender de commit/push e não houver autorização corrente, pedir uma aprovação concreta, não reutilizar a de 27/10. Não necessário: deploy MCP porarquivos, sem commitfinal/push/PR.

#### T5.3 [codex + Renato] Ensaio controlado e aceite final

**Depende:** T5.2. Efeitos reais somente com destinatários controlados e assentimento do operador.

**Ensaio emandamento31/10:** Renato informou estar realizando o ensaio; ainda não forneceu resultado final. Consulta MCP de runtime logs do deployment novo não retornou registros nos critérios consultados; ausência de logs não comprova agendador parado nem sucesso. Não pedir novamente autorização geral nem repetir envios automaticamente.

##### T5.3a [codex] Refinamento solicitado durante o ensaio — GPT/Terra executa, Codex integra/revisa

Renato pediu substituir o seletor deTema doheader porSol/Lua e ajustar a apresentaçãoTurnstile, com amostra `Cloudflare.png` naraiz (referência do usuário, não asset publicável). Escolha explícita recebida: “Alternar diretamente entre Claro e Escuro; seguir o sistema apenas até a primeira escolha manual.” Esta instrução atual substitui somente o contrato anterior de retorno explícito aSistema noheader; visita inicial/SO, persistência da preferência, SPA, storage negado, SSR determinístico e acessibilidade permanecem. Sol mostra temaClaro atual, Lua mostraEscuro atual; botão acessível44px, teclado/foco/nome comestado/ação, sem menu novo ou animação decorativa.

Cloudflare oficial oferece compact150×140, normal300×65 e flexible100%/mínimo300×65. Preparar flexible ewrapper100% comgrafismo originalintacto; fallbackcompact onde não couber300px, sem cortar/escalar/ocultar iframe ou branding. Inspecionar resize/reflow e, se troca de tamanho exigir recriar widget, invalidar tokenantigo honestamente e preservar campos, sem widget/listener duplicado ou callback tardio. Tema da superfície existente permanece preso ao widgetvivo; trocar tema geral não deve invalidar token por estética. Sem mudança de sitekey/secret/provedor/Worker ou bypass.

Escopo: componentesThemeSelect/themeCSS eTurnstileWidget/formsCSS, callers/testes de tema/CAPTCHA e documentação mínima pertinente; não alterar cálculo, backend, PDFs/e-mails/edições. Implementação delegadaGPTTerra na exceção31/10; uma escrita porvez, Codex+GPT independente revisam. Gates focados duranteiteração e rodada integrada pertinente antes de redeploy. Manter deployment4anQq2E durante ensaio; novo rollout desse refinamento só após coordenar término doensaio atual. Sem commitfinal/push/PR. Critérios abaixo continuam pendentes.

- [x] Ícone reflete temaefetivo e alterna/persisteClaroEscuro; SO seguido atéescolhamanual, sem seletorSistema.
- [x] Turnstile flexível/moldura100% emlargurascompatíveis e fallbacksemoverflow320px; callbacks/tokens/descarte preservados, emtestescomprovedorsimulado.
- [x] Revisão independente, gates/capturas e evidências locais; novo manifesto preparado. Novo ID/deployment aguarda término coordenado doensaioatual.

Entrega localT5.3a porGPTTerra, integradaCodex31/10: botãoSol/Lua acessível,44px, segueSO antesmanual, guardaClaroEscuro emSPA/storage existente; ícones respondem porCSSsemflash, sem animaçãonova. WrapperTurnstile100% egridspan nasvariantesinline, flexible quandoáreaútil≥300px/compactemmenores, ResizeObserver sónafronteira, superfícietemapresa ao widget. Crossing invalida token/preserva campos; geração descarta callbackstardios ecleanupremove widget/observer. ReviewerGPT apontouP2 de crossings coalescidos que voltam aomesmosize semremount; Codex reutilizou revisão`attempt` paraforçar montagemmesmonessecaso, comteste de duasnotificaçõessíncronas. Rechecagemindependente semP1/P2residual, somenteleitura. Privacidade agora descrevebotão2temas/seguirsistemaantesmanual, semnovosfatoslegais oumudançasdefinalidades.

Gatesapósintegração: lint/typecheck e45arquivos/718unit passaram; buildprodução passou (`t53a-build.log`). Configdedicada`tests/turnstile.config.ts` usa sóvaloresfictícios, APIs/HTTPSdobrowserabortados eFirebaseJSON`{}` explícito rejeitado sincronicamente porcertantesADC/Firestore (assertNodepassou), evitandoherdarcredenciaisnocatálogoSSR. `npx --no-install playwright test --config tests/turnstile.config.ts`:3passes/0skips/0retries emHome, Newsletterinline eROSIinline (3,9s), incluindolarguratotal, resize320, callbackantigo, crossingcoalescido, campos e tematokenspreservados. Avisocatálogoindisponívelnessefakeéintencional. Gateprincipaldemo registra casosfakecomoskips, cobertosàpartepor essecomandoproduçãolocal, nãopassessimulados. E2Eintegrado completo emandamento; nenhumredeploy. Next-env geradoinspecionado/restaurado, semfontedeappalteradadepoisbuild.

**T5.3a localconcluída:** E2Eintegrado final414passes/12skips/0retries (7,5min, `t53a-e2e.log`):6skips históricos +6execuções dos3cenáriosfake emprojetosdemo desktop/mobile; os3cenáriosforamexecutadosepassaram no servidorproduçãofictício dedicado, inclusive resize320. Não somar skipscomopasses nemalegarprovedorrealdessa cobertura. Quatrocapturasheader1440/390ClaroEscuro (`t53a-header-*`) confirmambotão44×44/íconeestado/nomeação, semoverflow; desktopclaro/mobileescuroinspecionados. Previewprodução localoff emhttp://127.0.0.1:3100, semcoleta, sessão18634. Nenhumcódigofonte alteradoapósbuild.

Pacoterefino:244arquivos/4337016bytes, manifesto`t53a-source-manifest.json` SHA256`e3ff06772d4089e0a128c9c95420df446146573faab85d12416bb07b281ffb74`, hashes reconferidos e padrões limitadosdesegredosemocorrências. Onze arquivos novos/alterados já enviados ao cache de fontesMCPVercel; nenhumcreate_deployment dessemanifestoexecutado, alias4anQq2Epreservado duranteensaio. `web/AGENTS.md` geradopornextdev foiconferido contra generate-agent-files.js e removido isoladamente (somente blocogerado, semconteúdodousuário), foradomanifesto. GuiaServer/ClientlocalNext16.4.2 consultado; não seguir sugestãogerada decommitcontraautorização. Cloudflare.png permaneceu referência privada/local, nãoassetpublicável. Sem dependênciasnovas, .envlido, Workers/DNS/billing/commitfinal/push/PR. Próximo: receber resultadohumanodoensaioatual, coordenar eventualredeploydorefino econtinuidadeT5.3, sóentãoT5.4/aceitefinal.

**Coordenação e autorização explícita31/10:** Renato respondeu “O Ensaio terminou. Remova o texto Tema ao lado do Botão de Tema e publique”. Confirma fimdoensaio eautoriza rolloutdorefino, masnão declararesultadosdeentrega/confirm/cancel/editorial comopasses. TextoTema removidodoDOMvisível, aria-label/foco/44px/lógica intactos; CSSredundante removido etesteexigeausência eumsóíconevisível. RevisorGPTindependente sembloqueante. Apósessaexclusãovisualmínima: lint/typecheck/build (`t53a-final-build.log`) e40E2Etema desktop/mobile passaram20,7s/zero skips/retries (`t53a-final-theme.log`). Rodadafull414E2E/12skips e718unit imediatamenteanteriores continua evidênciadaárvoreantesdaexclusãodotexto, semalegarnovafullidentica; impactocobertopelos40cenáriosafetados. Nenhumbackend/cálculo/widgetmudoudepoisdagranderodada.

Manifestofinaldorefino244arquivos/4336817bytes, `t53a-final-source-manifest.json` SHA256`e564ce4a31af31a7e22bbaf2c8cb5126bba9a96ded02671d1e7c3efc469a56b0`;3arquivosderótulo/testecomnovosSHA1enviadosaoMCP. Próxima criaçãoautorizadausaessafontevalidada, semcommitfinal/push. Semnovasmudançasdeenv/provedor/DNS/billing/Workers. Resultadooperacionalcompletodotestehumano eaceitefinalT5.3continuamapendente de relato, semperguntarreaprovaçãogeral.

**Refino publicado porMCP31/10 às11h36 deBrasília:** `dpl_EZSNVGuekPfh7saEbwLQPP54WzVt`, URL `website-roottrust-3jzbj14sh-renato-soares-projects.vercel.app`, READY/production/semaliasError, build12s. Aliaswebsite-roottrust.vercel.app confirmado nesseID. Fonte é244arquivos/manifestofinalacima sobreWIPa487102+árvoresuja, não commitfinal; rollbackcompatível4anQq2E éversãoimediatamenteanterior, comBACKENDpublic/offFORM. Envseprovedoresnãoalteradosno refino.

Verificação pósdeploy: Home/Newsletter/ROSI/arquivo200, modospublic, catálogoFirestorereal e noindexpreservados. ChromiumrealNewsletter1440Claro/Escuro,390Claro e320Escuro: textoTema ausente, nomeacessívelestado/ação, sempageerror/overflow/POSTaoapp. WidgetoficialCloudflare medido542×65desktop e324×65mobile390, molduras568/350pxiguaisàlarguradoform;320usa150×140compactdentrodemoldura280px, semcorte. Oito capturasheader/card e`t53a-published-summary.json`; desktopclaroheader/CAPTCHAescuro e390claroinspecionados. Semresolver/interagir/enviarCAPTCHAouformulários, nenhumenvioe-mailacionadopeloagente. T5.3a entreguepublicada; resultadoshumanosdoensaio/editorial/aceitefinal eT5.4permanecempendentes, nãoencerrarplano.

- [x] Diagnóstico chega ao canal, relatório ao destinatário autorizado e inscrição/confirm/cancel funcionam. Renato confirmou explicitamente31/10: “Todos esses fluxos funcionaram”, emresposta àchecagemdecanalprivado/PDFROSI/e-mailforaallowlist/confirmação/edição/cancelamento. Evidênciaoperador, semdadospessoais/tokens registrados. Conteúdo/mapeamento dosquatroPDFsinalterados; não reenviadososdemais.
- [ ] Teste editorial usa segmento controlado/isolado e aprovação humana, nunca edição fictícia para inscritos reais. Não reenviar edições antigas.

Isolamentoeditorialconfirmadoexplicitamente31/10: Renato respondeu“Sim, todos são controlados; podemos ensaiar o fluxo editorial.” Autoriza único ensaio nofluxoexistente, semnovarecepçãorealforadogrupocontrolado. FerramentasdescobertasincluemCloudflareAPI/documentação eponteClaudeAgentlocal, masnão acionamentoRoutinecloud/Discord sobidentidadehumana. Não ler tokens/cofres nem improvisar APIpaga/alteraçãoagendaparaacionar. Caminho operacionaldoREADME`web/ops/newsletter-routine/README.md`: operador usaRoutineexistente RunNow umavez (ou revisa rascunhoatualinédito jáexistente), depoisdecisãohumanaDiscord; semduplicarslug/repetirdisparoincerto/reescreverpromptouedições. Resultadoeditorialefinalaindapendentes, semalegartesteexecutado.

**Adiamento explícito de Renato31/10:** “Não consigo executar a Routine pois estamos com o Limite de5horas doClaude esgotado. Siga com os proximos passos e deixe esse como pendente”. Ensaioeditorialreal NÃO executado/nãopassou; permanecependente, semesperaautomática, disparoalternativo, APIpaga, troca deRoutine/prompt/agenda oureenvio. Autoriza avançar à documentaçãoT5.4 apesar dessa dependência parcial, registrando limite e evidênciasjáconcluídas. Não equivale aaceitefinalglobal nemautorizaarquivarPLAN comoplenamenteconcluído. Quando retomar, conferir isolamento/estado atual antes de acionamentoúnico; não inferir resetdecota porrelógio.
- [x] Aceitação fora da antiga allowlist comprovada por testes seguros e ensaio humano consentido; CAPTCHA não é contornado. Confirmaçãooperadorexplícita31/10, além dosunitáriospublic.
- [ ] Resultado incerto interrompe só o fluxo necessário, preserva pedidos e impede reenvio cego; sem reset de limites/banco.
- [ ] Renato aceita resultado visual/editorial/operacional; limitações claras, sem testes opcionais adicionais depois de evidência suficiente.

#### T5.3b [codex] Correção de reatividade do tema do CAPTCHA, solicitada durante T5.4

Renato observou que o widget/moldura conservavam o primeirotema após alternância doheader e pediu correção. Instruçãoatual substitui a exceçãopinned deT5.3a: widget acompanha otemaefetivo da superfície doformulário, inclusive mudançasSOenquantoSistema, mantendo faixaslocaisexplicitamenteescuras. Cloudflare configura theme na criação; recriar apenasquando temalocalefetivo mudar, invalidar token/feedbacksolved anterior e preservar campos. MudançaSOcompreferênciamanualsemalterarsuperfícienãorecria. Lercolor-scheme dosform/ancestraisexternosaomoldurapinned paraevitarautoaprisionamentodotema; semmanipulariframeinterno/branding. Preservarsize300/fallback/observerdescarte/callbacksgeneration/coalescênciacorrigidos.

Escopodelimitado: TurnstileWidget e testesfakesdiretos (configsomentesenecessária), sembackend/provedores/Routine/env/ícones. TerraGPTimplementa, Codex+GPTindependentesrevisam eCodexexecutagatespertinentesantesrolloutnoescopodacorreçãopedida. DocumentaçãoGPTLuna temporariamenteinterrompida, paraumaescritaporvez, retomarácomcontratoatual. EnsaioeditorialrealcontinuaadiadoexplicitamenteporcotaClaude; nãofoireaberto. Nenhumcommitfinal/push/PR.

- [ ] Tema manual/SO reativo, campospreservados/tokennovoobrigatório, callbackantigorejeitado eframes/listenerssemduplicação.
- [ ] Teste fake de troca/resizecoalescido/desmontagem, revisãoindependente e gatesrelevantes; correçãopublicada everificada.

**T5.3b concluída localmente antes dos novos ajustes da Home:** Terra alterou somente `TurnstileWidget.tsx` e seu teste dedicado. O widget lê `color-scheme` do formulário externo à moldura, acompanha atributos de tema e mudanças do SO, invalida token e geração apenas quando a superfície efetiva muda, e descarta observers/listeners/callbacks antigos. Faixas com esquema de cor próprio continuam coerentes. Revisor GPT independente não encontrou P1/P2; não executou testes. Codex executou lint, typecheck, 45 arquivos/718 unitários, build (`t53b-build.log`) e quatro E2E dedicados de produção com provedor simulado: 4 passes/0 skips/0 retries, 5,2 s (`t53b-turnstile.log`). Incluem três layouts, tema manual/SO, preferência manual prevalecente, superfície local, resize coalescido e callback após desmontagem. Nenhuma publicação: o gate local solicitado por Renato continua obrigatório. Próximo passo agora é T5.3c, conforme ordem dele.

**Nova instrução de Renato31/10 enquanto T5.3b é validada:** concluir primeiro a reatividade do CAPTCHA; depois aumentar novamente a assinatura horizontal noheader e inserir copy literal naHome. EmNossosServiços, abaixo de“Três frentes. Uma base.”: “Segurança, infraestrutura em nuvem e software que se conectam, para operações com ambientes complexos. O escopo de cada trabalho é definido em conversa.” EmComoTrabalhamos, inserir“Um processo claro, colaborativo e adaptado a cada realidade.” Antesdonovodeploy, iniciarappLOCAL eentregarlinkparaOK explícitodeRenato. Este gate localatualimpedenovapublicação inclusive doconjuntocomT5.3b atéresposta, semreutilizarpublicaçãoanterior. Usargrill-mesomentesefaltardecisãoreal; não repetiraprovaçãogeral.

#### T5.3c [codex] Assinatura e textos da Home, com aceite local antes de novo deploy

Pedido literal registrado em T5.3b. Ampliar o SVG horizontal oficial no header, preservando proporção e variantes por tema. Ponto inicial de revisão: 54 px de altura em desktop e 40 px em mobile, mantendo barra de 76 px, controles de 44 px e ausência de colisões nos breakpoints/320 px. Inserir os dois parágrafos pedidos sob os respectivos títulos das seções Nossos Serviços e Como Trabalhamos; não parafrasear, redesenhar a Home ou alterar os métodos/cálculos.

Terra implementa CSS do shell e componentes/estilos de Services/Process e testes diretamente afetados. Codex integra e executa gates dirigidos, revisão independente e capturas claras/escuras desktop/mobile. Uma escrita por vez; documentação permanece interrompida. Subir aplicação local e entregar link revisável, com CAPTCHA em ambiente de teste seguro quando necessário. **Aguardar OK explícito de Renato antes de qualquer novo deployment na Vercel**. A autorização anterior não substitui este gate.

- [ ] Assinatura ampliada sem deformação, colisão ou overflow; textos literais visíveis no local solicitado.
- [ ] Gates/revisão/capturas e link local disponíveis, incluindo reatividade do CAPTCHA já corrigida.
- [ ] OK local de Renato recebido antes do rollout; nenhum commit final/push/PR.

#### T5.4 [claude:escreve] Atualizar contexto — Haiku; Codex revisa e arquiva

**Depende:** T5.3; exceção explícita31/10 permite documentação comensaioeditorialreal pendente porcotaClaude, semarquivarconclusãoglobal. **Arquivos:** seis canônicos, AGENTS e plano, onde pertinente. ExecutorGPTLuna porfunção documental naexceçãodeexecuçãoGPTjáautorizada, semalegarequivalênciaexata ouchamadaHaiku.

- [ ] Estado public/temas/métodos/feedback/deploy coerente; antigas regras de escuro exclusivo/piloto atualizadas, assets originais intactos.
- [ ] Evidências, limitações Free e hospedagem futura fora de escopo registradas.
- [ ] Revisão independente final, links/diff-check e nenhuma credencial/cache/build/backup no versionamento.
- [ ] Arquivar PLAN somente após critérios/aceite; sem encerramento por tokens e sem commit/push não autorizado.

### Fase 6 — emenda aprovada: Home, serviços, ferramentas e gate local

**Aprovação:** Renato respondeu “Implement the plan.” após a proposta completa e entrevista grill-me de 31/10/2026. Esta emenda integra o único PLAN ativo, preservando o histórico e os estados anteriores. Não há autorização de nova publicação antes do OK local específico.

**Pesquisa e crítica:** código, seis contratos canônicos, testes existentes e GET da Cibersegurança publicada conferidos. “Destaque · Pentest” já não é renderizado; hoje há “Sobre o Pentest” no primeiro card. Os parágrafos da Home já existem lateralmente. O fechamento removível e a ressalva de escopo compartilham wrapper. Revisor GPT independente examinou a especificação e não encontrou P1/P2; reforçou preservar a ressalva e restringir a atualização de URLs aos links ativos, sem reescrever edições/PDFs/e-mails/histórico.

#### Decisões da emenda

| ID | Decisão explícita |
|---|---|
| R01 | Logo do header com 60 px de altura desktop (≥960) e 44 px mobile, SVG/proporção oficial, barra76/controles44 preservados. Footer não muda. |
| R02 | Home: os dois parágrafos literais já existentes ficam abaixo dos H2 de Serviços e Como trabalhamos, sem duplicar ou alterar ferramentas. |
| R03 | Pentest em painel neutro sempre visível após as quatro frentes, dentro de #frentes, mantendo seis seções da página e ID pentest. Contexto/escopo à esquerda, entregas à direita, três capacidades em faixa inferior, ressalvas no rodapé; mobile empilhado. Remover o expansível do primeiro card, sem rótulo Destaque. |
| R04 | /servicos/infraestrutura-em-nuvem → /servicos/infraestrutura; nome do serviço também passa a Infraestrutura em cards, breadcrumb e metadados pertinentes. Preservar atuação física/local, nuvem e híbrida, sem inventar capacidades. |
| R05 | /servicos/desenvolvimento-de-software → /servicos/software. As duas URLs antigas retornam HTTP404, SEM redirects ou aliases, por escolha de Renato. Atualizar todos os links ativos. |
| R06 | Remover actionNote literal do hero dos três serviços e os três parágrafos closing indicados, com seu border-top. Manter CTA/formulário, quatro etapas e Pill “As etapas podem variar conforme o escopo do projeto.” Demais explicações de atendimento/qualificação em FAQ/formulário permanecem. |
| R07 | Aviso das quatro ferramentas limitado a min(100%,560px), alinhado à esquerda, texto completo e verdadeiro por modo, incluindo padding/borda. |
| R08 | 3D das quatro ferramentas: até400×360 desktop≥960,320×288 tablet721–959,240×218 mobile≤720; máximo100% da largura disponível. Desktop à direita em coluna400; tablet/mobile empilhado. Runtime/câmera/geometria/cálculos permanecem existentes. |
| R09 | Uma única prévia local com TODO o conjunto, inclusive CAPTCHA reativo; entregar link ativo e aguardar OK explícito antes de QUALQUER novo deploy. |

Texto literal de Serviços: “Segurança, infraestrutura em nuvem e software que se conectam, para operações com ambientes complexos. O escopo de cada trabalho é definido em conversa.” Texto literal de Como trabalhamos: “Um processo claro, colaborativo e adaptado a cada realidade.” Remover do hero somente a frase exata “Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.” Os três closing pedidos são removidos da renderização/dados atuais; conservar ressalva de escopo e espaçamento funcional.

**Compatibilidade e limites:** novas URLs e nome do serviço são a interface pública alterada. Nenhuma API, fórmula, ID de ferramenta, PDF, e-mail, edição existente, consentimento, quota, Routine/agenda, Worker, billing/DNS, analytics ou indexação será alterado. Links antigos em materiais imutáveis podem retornar404: consequência da decisão R05, não autorização de reescrita. D01–D19 permanecem com as substituições locais explícitas desta emenda, sem reabrir decisões gerais.

#### T6.1 [codex] Consolidar baseline e executor

**Depende:** aprovação da emenda (recebida). Dono Codex.

- [x] Incorporar decisões e critérios neste PLAN; proposta aprovada e crítica independente registradas.
- [x] Revalidar raiz/branch/diff, preservar T5.3b já validada localmente e eventuais alterações documentais parciais. Raiz confirmada/main; docsLuna interrompida sem alterações nos sete documentos, nenhuma porta3100/3101/3187 ativa. Diff anterior preservado.
- [x] T5.3c é absorvida por T6.2, com tamanho atualizado60/44; não executar os dois passos separadamente. T5.4 permanece interrompida até estabilizar a interface e passa a T6.7.
- [x] Preflight somente leitura da ponte/modelo/cota; sessão47f6979d-b49a-4725-857a-30777ac28d72 terminou succeeded/13s com modelo observado claude-sonnet-5-5, leitura e gate local reconhecidos. Nenhum shell/MCPexterno/escrita nessa consulta, sem esforço/defaults alterados. Isso comprova a chamada atual, não cota futura ilimitada.

Inspeção pré-escrita T6.2: git add-A dry-run, diff/check e padrões limitados de segredo sem ocorrências; nenhum caminho.env/chave/credenciais/cache/build gerado para staging. ImagemCloudflare.png é a amostra já inspecionada de interface sem dado pessoal, referência local e não asset da aplicação. WIP LOCAL autorizado preservará a árvore suja existente, sem commitfinal/push. Inventário distinguiu filtro newsletter `infraestrutura-em-nuvem` de URL de serviço: NÃO substituir chave/pilar/editorial por busca global; escopo desta emenda são as URLs de serviços e seus nomes visíveis pertinentes.

#### T6.2 [claude:escreve] Pacote integrado de frontend, rotas e testes — Sonnet; GPT Terra na exceção

**Depende:** T6.1. Uma escrita por vez. Ordem: Home/header → serviços/Pentest → rotas/nomes → ferramentas → testes afetados.

**Escopo permitido:** shell.module.css; home.module.css, Services/Process e home/content; services/ServicePage, content e services.module.css; páginas de serviços (novas infraestrutura/software, remoção das duas antigas, ciberseguranca se necessário); tools/ToolPage e tools.module.css; testes e2e services/home/theme/internal-themes/public-routes/qa-shared/qa-capture/graphics-motion e referências ativas necessárias identificadas emT6.1. Proibir escrita fora da lista delimitada no prompt. Não reverter CAPTCHA reativo já entregue. Sem backend/modelos/deps/lockfile/env/docs/PLAN/brand/assets/provedores/efeitos externos.

- [ ] R01–R09 implementadas sem deformação, colisões, duplicação de copy ou alteração de contratos preservados.
- [ ] Painel Pentest conserva entregas, Red Team distinto, reteste/contratação e ausência de garantia de certificação; nenhuma alegação nova.
- [ ] Remoções reais de DOM/conteúdo, sem ocultar textos por CSS; Pill de escopo mantido.
- [ ] Páginas novas e links atuais coerentes; antigas removidas sem redirect, com404 nativa.
- [ ] Avisos e 3D consistentes em todas as quatro ferramentas; gráficos e conteúdo essenciais conservados.
- [ ] Testes relevantes atualizados, sem apagar cobertura existente para tolerar regressões.

**Protocolo Claude:** aplicar integralmente seção5/AGENTS: dry-run segredos/gerados, WIP LOCAL autorizado e hash antes da chamada, modelsonnet observado, prompt AGENTS/PLAN/contratos e rodapé headless, nenhum esforço/defaultglobal alterado, sem MCPexterno/commit/push/install. Poll30–60s, estado terminal, cancelar/registrar falhas; nenhuma edição concorrente. GPTs usam a exceção explícita, não são alegados Claude.

#### T6.3 [codex + revisão independente] Integrar e validar

**Depende:** entrega terminal deT6.2.

- [ ] Diff examinado contra baseline/WIP, incluindo callers e testes; revisor independente não é apenas o executor.
- [ ] Após escrita Claude: lint/typecheck/unit/build/E2E obrigatórios. Iterações GPT podem ser focadas, com rodada integrada final pertinente; resultados reais registrados, sem contagens históricas apresentadas como novas.
- [ ] Novas rotas200/antigas404 em acesso direto, sem links ativos antigos; SSR, head hierarchy, CTA/formulário e ressalvas preservados.
- [ ] Home: texto único abaixo de cada H2 medido no layout; logo60/44 e controles44 sem colisões nos breakpoints320/390/559/560/959/960/1100/1440.
- [ ] Ferramentas: aviso≤560/fullavailable, arte responsiva, pausa/reduced-motion/fallback/SPA; modelos/respostas sem rede/storage/log/URL.
- [ ] CAPTCHA reativo e resize/desmontagem/callbacks cobertos pelos quatro testes fakes de produção isolados.
- [ ] Capturas claro/escuro com fontes e Canvas estabilizados; Chromium principal e Firefox/WebKit smoke sem multiplicação desnecessária. Spotcheck comparável Home/ROSI, com regressões e limites registrados.

#### T6.4 [codex] Disponibilizar prévia local completa

**Depende:** T6.3.

- [ ] Build de produção rodando em127.0.0.1:3100 (ou endereço concreto informado se porta ocupada), com todas as alterações.
- [ ] Config local sem credenciais/coleta/provedores reais. Para mostrar CAPTCHA e aviso público, processo local com chaves oficiais de teste Cloudflare e FirebaseJSON{} inválido que falha antes deADC/Store; destinos fictícios, sem sucesso/entrega real alegados. Nunca .envpull ou chavesdeteste emVercel.
- [ ] Link ativo e natureza da prévia informados; revisão pode conferir todos os estados/rotas sem enviar dados pessoais.

#### T6.5 [codex + Renato] Gate humano local

**Depende:** T6.4.

- [ ] OK explícito do conjunto recebido e associado à árvore apresentada.
- [ ] Ajustes solicitados revalidados nos trechos afetados; não publicar outra versão por inferência.

#### T6.6 [codex] Rollout da árvore aprovada

**Depende:** T6.5; BLOQUEADO até esse OK.

- [ ] Revalidar destino/plano/config e advisories; preservar autorização Hobby específica já declarada se nada mudou, sem pedir novamente.
- [ ] MCPVercel publica fonte aprovada com manifesto/hash, sem commitfinal/push/PR; metadata/alias/ID/versão compatível anterior registrados.
- [ ] GETs confirmam novasURLs200/antigas404, modospublic/offFORM, catálogo real/noindex e widget reativo no site, sem envio de teste a inscritos reais.

#### T6.7 [codex/GPT Luna] Retomar documentação

**Depende:** estabilização e rollout. Absorve T5.4; sete documentos canônicos/AGENTS, sem plano concorrente. Haiku apenas se designado/ponte disponível, não etapa adicional obrigatória.

- [ ] Estado, nomes/rotas, layout, CAPTCHA reativo, evidências/deploy e limites coerentes; históricos rotulados, assets e contratos preservados.

#### T6.8 [codex + revisão independente] Conferir docs e árvore

**Depende:** T6.7.

- [ ] Links/diff/arquivos gerados/rastreabilidade verificados; nenhum segredo, cache, build ou referência privada incluído indevidamente.

#### T6.9 [codex] Registrar entrega e pendências

**Depende:** T6.8.

- [ ] Aceite local, publicação e verificações registrados com limites; ensaio editorial real permanece PENDENTE por decisão deRenato, sem disparo alternativo nem arquivamento como plenamente concluído.

**Acompanhamento da emenda:** T6.1 em andamento; T6.2–T6.9 pendentes. T5.3b concluída localmente, sem publicação; T5.3c absorvida; documentação interrompida. Nenhum commitfinal/push/PR autorizado. Quando houver escrita Claude documental, os cinco gates obrigatórios continuam aplicáveis.

## 7. Testes e matriz de validação

Testar contratos novos/alterados com o framework existente. Durante iterações Codex, usar suíte focada. **Após cada entrega de escrita Claude, os gates lint/typecheck/unit/build/E2E de AGENTS são obrigatórios e não são dispensados pela otimização desta seção.** No conjunto integrado, o gate final pode reutilizar a última rodada completa da mesma árvore, desde que nenhuma alteração posterior invalide sua cobertura; não repetir uma rodada idêntica sem necessidade. Repetir somente para corrigir falha/risco introduzido. Se código mudar após gate, revalidar impacto e registrar a limitação, sem alegar gate recente inexistente. Não apagar cenários ou tolerar bugs nos testes.

Em `web/`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. E2E build/start produção; dependências/browser só quando necessários e autorizados. Histórico de 614 unitários/290 E2E + 6 skips não é promessa do novo total. CI/lockfile preservados.

| Área | Cobertura dirigida |
|---|---|
| Modo/readiness | off/demo/pilot/public/desconhecido; config incompleta; independência por serviço; catálogo real. |
| Defesa | Origem/Turnstile inválidos, rate limits IP/identidade, entradas inválidas, HMAC/replay, ausência de bypass público. |
| Consentimento | Não confirmado/cancelado não recebe; relatório não inscreve; segmento errado/incompleto bloqueia; resultado incerto não duplica. |
| Quotas | Limites locais/marketing, concorrência, provedor429, diagnóstico independente; sem esgotamento real ou cobrança. |
| Feedback | Estados 4.4, dados após falha, dupla submissão, retryAfter, anúncio/foco; nenhum aviso inicial padrão. |
| Tema | SO claro/escuro, manual sobre SO, voltar a Sistema, reload/SPA, storage negado, bootstrap, hidratação/flash, foco/select nativo. |
| Gráficos | Hero/cards/faixas/fallback nos dois temas; pausa antes/depois, reduced-motion, hidden/offscreen/unmount, loops/GPU únicos. |
| Copy | Hero literal, métodos de 4 etapas específicos e 5 gerais na Home, Cibersegurança sem privilégio visual de Pentest, newsletter sem horário/entrega garantidos. |
| Dados privados | Corpo newsletter ausente do conjunto público; ferramentas sem respostas/resultados em rede/storage/log/URL. |

Rotas: Home; três serviços; quatro ferramentas; newsletter; arquivo; prévia válida; confirmar; cancelar; privacidade; 404. Smoke claro/escuro por rota; capturas detalhadas Home/serviço/ferramenta/newsletter/ações/feedback representativos. Desktop 1440, mobile 390, reflow 320 e smoke tablet 960/1024 nos layouts afetados. Chromium principal e Firefox/WebKit smoke conforme risco; não multiplicar toda combinação em todos os browsers.

Contraste alvo 4,5:1 para texto e 3:1 para texto grande; medir cores reais e foco/controles, não apenas paleta oficial. Sem certificado WCAG, desempenho de campo ou carga por inferência. LCP anterior de aproximadamente 2,8 s foi aceito como limite local: verificar regressão material, não reabrir a meta como projeto novo. Conteúdo/CTA funcionam sem GPU/animação.

### Pronto global

- [ ] D01–D19 refletidas ou exceção explícita; sem mudança silenciosa de requisito.
- [ ] Gates A/B, revisão independente e aceite final registrados.
- [ ] Alias mostra a árvore validada, modos/fluxos reais e feedback verdadeiro, não sucesso simulado.
- [ ] Consentimento, cotas e sigilo preservados por design; limitações reais sem certificação inventada.
- [ ] Nenhum outro projeto/hospedagem/billing/segredo/email/PDF/edição alterado fora do escopo.

## 8. Riscos e rollback

| Risco | Mitigação |
|---|---|
| Destino solicitado incompatível com plano efetivo | Verificar elegibilidade antes do rollout; não inventar exceção de demonstração, contratar ou migrar automaticamente. Desenvolvimento local continua. |
| Public cair em demo/pular segurança | Inventário de callers e testes por modo, webhook/catálogo incluídos. |
| Env/override de deployment divergente | Readiness saneada, coerência build/runtime e GET após promoção. |
| Quotas/abuso com novos visitantes | WAF/Turnstile/limites/capacidade, recusa honesta e painel por Renato; sem garantia de custo zero. |
| Segmento contaminado/cancelado incluído | Confirmação real/segment guard/reconciliação e ensaio isolado. |
| Coleta antes da política | GateB e modo restrito/off até revisão, sem abertura por ausência de config. |
| Claro destruir identidade/legibilidade | Tokens/shaders/fallbacks e gate da Home antes de internas. |
| Flash/recursos gráficos duplicados | Bootstrap pequeno, testes storage/SPA/motion e ciclo de vida preservado. |
| Copy virar promessa não comprovada | Fontes, antes/depois e limites contratuais claros. |
| Push mover alias antes de pronto | Tratar Gitdeployment e modos de forma deliberada; push não significa autorização de abertura. |

Rollback de interface usa versão compatível/conferida, não snapshot antigo presumido seguro. Para coleta/envio, preferir pausa do fluxo afetado; off global pode interromper processador/cancelamento e exige avaliar consequência. Preservar pedidos aceitos e opt-out; não apagar banco, reenviar atrasados ou reativar contatos. Workers mantêm origem; mudança excepcional de bindings/código exige verificar integração e autorização específica.

## 9. Dependências reais da próxima execução

- Causa exata de unavailable ainda não determinada; não pedir segredos para resolvê-la.
- Copy completa será produzida em T1.2; fatos legais faltantes exigem pergunta pontual, não preenchimento fictício.
- Plano aprovado não significa tema claro aprovado: gate A é separado.
- Privacidade precisa de revisão de Renato: gate B antes do public.
- Ensaio real deve ser isolado se já houver público no segmento; não mandar teste a assinantes reais.
- Hospedagem definitiva, migração e indexação comercial estão fora. Não reabrir seleção de provedor durante desenvolvimento; no rollout, eventual incompatibilidade de elegibilidade é uma dependência explícita a esclarecer com Renato.

## 10. Progresso

| Marco | Estado | Evidência |
|---|---|---|
| Pesquisa/entrevista | Concluídas | Fontes, GET/metadados Vercel e D01–D19. |
| Revisão independente do plano | Concluída, com correção | GPT /root/review_website_revision_plan apontou P1 de elegibilidade Vercel: removida suposição de exceção por demonstração e incluído gate antes do rollout. Rechecagem concluiu que o P1 foi resolvido, sem outras contradições grandes. |
| Aprovação do plano | Aprovada em 30/10/2026 | Renato escolheu “Aprovar o plano; implementar na nova conversa”. Não iniciar nesta sessão. |
| Fase1 | Local concluída; comparação remota pendente | T1.2/T1.3 concluídas; preflight Sonnet5.5 passou. Lacuna Vercel403 em T1.1 deve ser resolvida em T4.3 antes do rollout. |
| Fase2/gate A | Concluída e aceita em30/10/2026 | Renato aprovou o gate A e o avanço às internas;629 unitários e344 E2E/6 skips. |
| Fase3/gate B | Concluída; gate B aceito em31/10/2026 com limites |650 unitários/build e414 E2E/6 skips; Renato aprovou o texto operacional e registro das pendências. |
| Fase4 | T4.1/T4.2 concluídas localmente; T4.3 conferida para rollout |718unit/414E2E/6skips; revisão independente, configporpresença/readiness, confirmaçãooperador e elegibilidade registradas; entrega real continuaT5.3. |
| Fase5 | T5.1/T5.2/T5.3a concluídas; T5.3 parcial, docsT5.4 autorizadas |DeploymentMCPEZSNVG noalias solicitado, public/off/catálogo/ícones/CAPTCHA reais conferidos; fluxosformuláriosconfirmadosporRenato. Ensaioeditorialreal adiadoexplicitamenteporcotaClaude; docsavançam, aceitefinal/arquivo pendentes. |

Registrar por tarefa: responsável, arquivos, comandos/resultados, revisão e limitações; nunca segredos, lista de contatos ou corpos editoriais privados. Estado remoto citado é 30/10/2026 e deve ser revalidado antes de atuar.

### Revisão independente do planejamento — 30/10/2026

Revisor GPT somente leitura examinou sequência, guards, catálogo, webhook, outbox e consentimento. Apontou incompatibilidade potencial do rollout em Hobby, cuja regra inclui publicidade de serviços como uso comercial; a revisão não comprovou o plano efetivo atual. O documento agora separa desenvolvimento/capacidade pública do gate de elegibilidade do destino. Sem exceção presumida, contratação/migração automática ou nova consulta sobre provedor durante o desenvolvimento. Gate A/B e aprovação do plano continuam pendentes; nenhuma implementação ou configuração remota foi feita.

**Rechecagem final:** o revisor GPT confirmou a correção do gate de elegibilidade e o alinhamento do handoff, sem outros problemas grandes identificados. Checagem local: 19 decisões, 17 tarefas em cinco fases, links relativos dos novos documentos válidos e diff-check aprovado. Nenhum código, configuração, teste de runtime, envio, deploy ou commit nesta etapa. Aprovação humana deste plano recebida em 30/10/2026, limitada à execução na nova conversa.

### Aprovação de Renato — 30/10/2026

Resposta nativa: “Aprovar o plano; implementar na nova conversa (recomendado)”. Próxima sessão pode iniciar T1.1 depois da leitura do contexto, com gates A/B e regras de autorização deste plano preservados. Nenhuma implementação nesta sessão; todas as tarefas continuam não iniciadas.

### Atualização de execução aprovada — Claude seletivo, 30/10/2026

Renato pediu aplicar a divisão proposta Codex/Sonnet/Haiku, com Opus apenas em consulta excepcional. Seção5 e tags foram atualizadas; conteúdo, critérios, ordem e gates do produto não mudaram. AGENTS/handoff foram sincronizados para não manter suspensão contraditória. Nenhuma chamada Claude ou escrita de código nesta sessão; descoberta de ferramentas da ponte não encontrou funções expostas, portanto o acesso/modelo efetivo exige preflight na nova conversa. Revisão documental independente GPT desta emenda não implica teste da ponte. Nenhuma implantação, commit ou push realizado.

**Revisão da emenda Claude:** GPT /root/review_website_revision_plan apontou P2 de frequência dos gates. A seção 7 foi corrigida: testes focados durante iterações Codex não dispensam os gates obrigatórios após escrita Claude; a rodada final pode reaproveitar evidência da mesma árvore sem alteração. Nenhum teste da ponte ou do runtime executado nesta atualização.

Rechecagem independente da emenda: P2 resolvido; protocolo e prompt alinhados. Validação local dos quatro documentos: 17 tarefas preservadas, links relativos válidos e diff-check aprovado. Ponte e runtime não testados nesta sessão.
