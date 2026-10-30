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

1. **Admissão/capacidade:** contabilizar consumidos e pedidos pendentes com reserva atômica na mesma transação que aceita o pedido, após deduplicação. Duplicata idempotente não reserva de novo; transferência ao consumo e liberação só com estado conhecido, sem dupla cobrança. Confirmações precisam caber na validade de 24h. Tetos locais100/dia UTC/3000mês e marketing1000 não comprovam uso total da conta; ações externas exigem margem e acompanhamento. Sem nova varredura global por submit; paginação/bounds/concor­rência e falta de capacidade recusam honestamente antes de202, sem descartar aceitos.
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

- [ ] Todas as superfícies da matriz 4.3 com tema/feedback/copy corretos, incluindo tabelas/selects/foco.
- [ ] Etapas estruturadas por serviço, sem stages[index] global nas internas; Home mantém cinco etapas.
- [ ] Hero literal e Pentest sem badge/hierarquia superior; catálogo e escopos verdadeiros.
- [ ] Fórmulas/negativos/desconhecidos/cálculo local intactos; nenhum resultado em payload/storage/log/URL.
- [ ] Arquivo/prévia preservam largura/paginação e corpo privado; slug inexistente continua HTTP 404 real.

#### T3.2 [claude:escreve] Alinhar confirmar/cancelar e estados excepcionais — Sonnet

**Depende:** gate A/T2.3. **Arquivos:** páginas/clients confirmar e cancelar + feedback comum.

- [ ] Loading, token inválido/expirado, sucesso e já processado nos dois temas, com foco/ação úteis.
- [ ] Idempotência e transporte seguro de token preservados; sem reativação/envio por navegação indevida.
- [ ] Cancelamento continua acessível se novos envios/inscrições estiverem pausados por capacidade.

#### T3.3 [codex + Renato] Gate B: revisar Privacidade e coleta

**Depende:** T1.2/T3.1. **Bloqueia ativação public.**

- [ ] Fluxos/provedores/finalidades/retenção/cópias e preferência visual reais, sem dizer “nada envia” com API ativa.
- [ ] Canal oficial e responsável operacional; nenhum cargo/dado legal/base presumidos.
- [ ] Marketing/newsletter independentes, sem falsa certificação ou parecer jurídico.
- [ ] Renato revisa explicitamente a página; até lá nenhuma publicação abre destinatários.

### Fase 4 — modo público e integrações

#### T4.1 [claude:escreve] Estender modos e readiness sem bypass — Sonnet

**Depende:** T1.3. Implementação local pode anteceder gate B; ativação não.
**Arquivos:** mode/http/configs, forms/hook/formulários, newsletter source/current, webhook, ToolPage e testes.

- [ ] Public explícito; desconhecido/off fecha; demo não faz rede; piloto conserva allowlists/segment guard.
- [ ] Public mantém todas as defesas/configurações e escopos; nenhum fallthrough pula Turnstile/HMAC.
- [ ] Readiness independente por serviço e cancelamento funcional; só modo/site key expostos.
- [ ] Catálogo real/projeção correta em public, não demonstrações; jobs/webhook/decisões operacionais.
- [ ] Testes de modos/configs/identidades/API/catálogo/ações atualizados com contratos novos, sem apagar proteção anterior.

#### T4.2 [claude:escreve] Controlar capacidade Free e consentimento público — Sonnet

**Depende:** T4.1. **Arquivos:** newsletter-email/broadcast, repository/types quando indispensável, report/limits e testes.

- [ ] Identidades válidas fora da antiga lista aceitas em public; limites IP/identidade e validação intactos.
- [ ] Sem novos pedidos impossíveis por quota nem 202 enganoso; sem upgrade/reset ou descarte de pedidos aceitos.
- [ ] Broadcast somente aos confirmados do segmento exclusivo; cancelado/não confirmado/lead não inscrito não recebem.
- [ ] Capacidade/paginação não presumem máximo de 100 e-mails de piloto; bounds/concorrência e alterações externas tratados honestamente.
- [ ] Validade24h, resultado incerto e reconciliação preservados, sem duploBroadcast.
- [ ] Sem revisão editorial/de design dos e-mails/PDFs/Routine nesta tarefa.

#### T4.3 [codex] Revisar segurança e preparar configuração do rollout

**Depende:** T4.1/T4.2. **Dono:** orquestrador + outro GPT.

- [ ] Revisão de todos os callers public/pilot/consentimento sem P1/P2 conhecido.
- [ ] Checklist só nomes/estados: Firebase, Turnstile, origem/IP, remetentes/Reply-To, webhook, keys internas/jobs/segmento; não abrir `.env*` nem pedir chaves no chat.
- [ ] Canal privado/atendimento do diagnóstico e destinatários do ensaio confirmados; sem expor cadastro em chat/log.
- [ ] GateB registrado e rollback pensado por fluxo; não promover snapshot antigo cegamente.

### Fase 5 — validação, publicação e encerramento

#### T5.1 [codex] Gates e matriz consolidada

**Depende:** Fases3/4 e gates A/B. **Dono:** QA/orquestrador; builds serializados.

- [ ] lint, typecheck, unit, build e E2E existentes; registrar passes/skips/falhas/retries reais.
- [ ] Matriz da seção 7 com copy, contraste/overflow, modos, gráficos e privacidade; capturas estáveis por seção.
- [ ] Fakes/interceptações para efeitos externos, sem colocar público num segmento de teste.
- [ ] Spotcheck de regressão de desempenho, sem novo projeto de LCP ou benchmark de 400 filhos.
- [ ] Revalidar advisories oficiais; patches necessários localizados e gates pertinentes, sem audit fix force/upgrade amplo automático.

#### T5.2 [codex + Renato] Publicar na Vercel de demonstração

**Depende:** T5.1, gates e configuração/segmento conferidos. Publicação solicitada nesta entrevista; execução após aprovação do plano.

- [ ] Gate de elegibilidade: conferir o plano efetivo e as condições do destino solicitado. Hobby sem autorização aplicável do provedor não deve ser tratado como destino elegível para abertura comercial. Se houver incompatibilidade, registrar o bloqueio de rollout e consultar Renato nesse momento, sem migrar/contratar ou alterar D06 automaticamente.
- [ ] Confirmar conta/projeto/team/rootDirectory web, árvore validada e config build/runtime; destino solicitado website-roottrust.vercel.app.
- [ ] Registrar ID/URL/commit/modo/data e versão apta a rollback; nenhum segredo no registro.
- [ ] GET pósdeploy confirma modo real, catálogo e alias corretos; READY sozinho não basta.
- [ ] Sem migração/DNS/billing/indexação ou deploy de Workers inalterados.
- [ ] Se depender de commit/push e não houver autorização corrente, pedir uma aprovação concreta, não reutilizar a de 27/10.

#### T5.3 [codex + Renato] Ensaio controlado e aceite final

**Depende:** T5.2. Efeitos reais somente com destinatários controlados e assentimento do operador.

- [ ] Diagnóstico chega ao canal, relatório ao destinatário autorizado e inscrição/confirm/cancel funcionam. Reusar evidência dos quatro PDFs se conteúdo/mapeamento não mudaram; não reenviar todos por hábito.
- [ ] Teste editorial usa segmento controlado/isolado e aprovação humana, nunca edição fictícia para inscritos reais. Não reenviar edições antigas.
- [ ] Aceitação fora da antiga allowlist comprovada por testes seguros e ensaio humano consentido; CAPTCHA não é contornado.
- [ ] Resultado incerto interrompe só o fluxo necessário, preserva pedidos e impede reenvio cego; sem reset de limites/banco.
- [ ] Renato aceita resultado visual/editorial/operacional; limitações claras, sem testes opcionais adicionais depois de evidência suficiente.

#### T5.4 [claude:escreve] Atualizar contexto — Haiku; Codex revisa e arquiva

**Depende:** T5.3. **Arquivos:** seis canônicos, AGENTS e plano, onde pertinente.

- [ ] Estado public/temas/métodos/feedback/deploy coerente; antigas regras de escuro exclusivo/piloto atualizadas, assets originais intactos.
- [ ] Evidências, limitações Free e hospedagem futura fora de escopo registradas.
- [ ] Revisão independente final, links/diff-check e nenhuma credencial/cache/build/backup no versionamento.
- [ ] Arquivar PLAN somente após critérios/aceite; sem encerramento por tokens e sem commit/push não autorizado.

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
| Fase3/gate B | T3.1 iniciada e interrompida por cota | Sonnet sem entrega/código; reset indicado18h10, retomada depende da consulta a Renato. Gate B pendente. |
| Fase4 | Não iniciada | Public, capacidade e elegibilidade testados. |
| Fase5 | Não iniciada | Gates, deployment, ensaio, aceite e arquivo. |

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
