# Revisão editorial — matriz de propostas (30/10/2026)

**Status: PROPOSTA.** Evidência de copy da tarefa T1.2 do [PLAN.md](../../PLAN.md). Não é plano, lista de tarefas nem registro de status. Nada aqui foi aplicado à aplicação. As páginas internas, inclusive a proposta de Privacidade, recebem copy depois do gate A; Renato revisa essa página no gate B antes da coleta aberta. Checkpoint WIP: `5d1647d` (`wip: pre-claude T1.2`).

Nenhuma proposta aqui é oferta comercial nova, SLA, cobertura humana 24×7, métrica, caso, certificação ou horário de envio. Onde falta fato, a linha traz **[PENDENTE]** e a frase não deve ser aplicada sem resposta.

## Legenda e regras de leitura

| Rótulo | Significado |
|---|---|
| **Atual** | Texto hoje no código, citado de forma curta e literal. |
| **Proposta** | Texto pronto para aplicação posterior. `{x}` é valor dinâmico. |
| **Preservar** | Mantém o texto atual; a decisão e a razão estão registradas. |
| **PROPOSTA** (maiúsculas) | Sem aprovação nem operação real; só vale depois do gate indicado. |
| **[PENDENTE]** | Fato ausente; precisa de resposta de Renato ou do Codex. |

Fontes: `PLAN` (seções 4.1–4.7, decisões D04, D05, D09, D10, D14, D16, D19), `product.md`, `newsletter.md`, `tools.md`, `brand-design.md` (tom) e o código atual em `web/src/`. Tom: técnico, próximo, sem medo, sem jargão não explicado; sem "blindagem" nem "combate a hackers".

Fora do escopo desta matriz (D09): e-mails transacionais, PDFs de relatório e edições existentes. Nenhum deles foi lido ou reescrito. Fórmulas, hipóteses, limites e fontes das ferramentas também permanecem inalterados.

---

## 1. Home (`/`)

Fontes: `features/home/Home.tsx`, `Services.tsx`, `Process.tsx`, `content.ts`.

### 1.1 Hero, princípios, públicos e CTA

| ID | Bloco | Atual | Proposta | Razão | Fonte / pendência |
|---|---|---|---|---|---|
| H-01 | Hero | Eyebrow "Tecnologia para operações críticas"; H1 "Confiabilidade com profundidade."; "Cibersegurança, infraestrutura em nuvem e software para operações críticas."; CTA "Solicitar diagnóstico" | **Preservar** | Composição e texto aprovados na baseline; nenhuma promessa. | AGENTS (hero é referência) |
| H-02 | Princípios | "Nossos princípios" / "Tecnologia que se explica. Presença que permanece." / "Na prática" | **Preservar** o título e o rótulo | Alinhado ao tom da marca. | brand-design |
| H-03 | Princípio "Clareza que traduz" | "Explicamos tecnologia em termos de negócio. Se não ficou claro para quem decide, a gente reescreve." / "Relatórios em linguagem de negócio" | **Preservar** o texto; trocar a ação por "Explicações em linguagem de negócio" | "Relatórios" sugere entrega fixa em todos os serviços; só o Pentest e as ferramentas citam relatório. | PLAN D04 |
| H-04 | Princípio "Presença que ampara" | "Ficamos por perto antes, durante e depois da entrega. Com firmeza e segurança, sem alarmismo." / "Suporte próximo e contínuo" | Texto: "Mantemos a conversa aberta antes, durante e depois da entrega, com firmeza e sem alarmismo." Ação: "Acompanhamento conforme o contrato" | "Depois da entrega" e "contínuo" parecem suporte garantido; suporte, reteste e evolução só existem quando contratados. | PLAN 4.2; **[PENDENTE]** horário de atendimento e canal de suporte |
| H-05 | Princípio "Profundidade que inspira confiança" | "Mostramos com precisão o que existe abaixo da superfície da sua operação, para decisões com base real." / "Visibilidade do que está sob a superfície" | **Preservar** | Alinhado ao manual; sem promessa mensurável. | brand-design |
| H-06 | Para quem lidera | H2 "Operações críticas pedem mais do que tecnologia." e dois parágrafos ("Ambientes regulados, empresas em crescimento…" / "Ajudamos sua equipe a transformar complexidade em decisões confiáveis.") | **Preservar** o H2 e o 1.º parágrafo; 2.º: "Ajudamos sua equipe a transformar complexidade técnica em decisões mais claras." | "Confiáveis" promete um resultado; "mais claras" descreve o trabalho. | — |
| H-07 | Ferramentas (cabeçalho) | "Ferramentas para decidir." / "Recursos práticos para avaliar, priorizar e avançar com mais segurança." / "Resultado inicial sem cadastro." | H2 preservado. Intro: "Simulações e guias para organizar uma decisão. Os resultados dependem do que você informa." Nota: "Resultado na própria página, sem cadastro." | "Mais segurança" é ambíguo; o resultado depende das entradas e fica só na memória. | tools.md; AGENTS (cálculo local) |
| H-08 | Newsletter (cabeçalho) | "Conteúdo" / "Análise em dias úteis." / "Insights práticos sobre segurança, nuvem, software e tecnologia para operações críticas." / "Ver edições anteriores" | H2 e link preservados. Texto: "Análises práticas sobre cibersegurança, nuvem e software, com fontes para aprofundar a leitura. Os envios dependem da publicação de cada edição." | "Insights" é jargão. "Dias úteis" sem ressalva sugere envio diário garantido. | PLAN 4.3 |
| H-09 | CTA final | "Próximo passo" / "Vamos cuidar da sua base." / "Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil após recebimento." | **Preservar** | Copy comercial aprovada (D14 gratuito). | AGENTS (Diagnóstico) |
| H-10 | Rodapé | "A base que sustenta o crescimento!" / links / "© 2026 Root Trust. Todos os direitos reservados." | **Preservar** | Slogan oficial da marca. | Footer |

### 1.2 Serviços na Home

Cabeçalho (Services.tsx): "Nossos serviços" / "Três frentes. Uma base." / "Segurança, infraestrutura e software integrados para ambientes complexos, com foco em resiliência, continuidade e controle." / botão "Conhecer {title}".

| ID | Bloco | Atual | Proposta | Razão | Fonte / pendência |
|---|---|---|---|---|---|
| H-11 | Intro | "…com foco em resiliência, continuidade e controle." | "Segurança, infraestrutura em nuvem e software que se conectam, para operações com ambientes complexos. O escopo de cada trabalho é definido em conversa." | "Resiliência e continuidade" soam como resultado garantido; o escopo vem do contrato. | PLAN 4.2 |
| H-12 | Cibersegurança — resumo/desc. | "A base que sustenta todo o resto" / "Cuidamos da proteção do que mantém sua operação em funcionamento, com monitoramento próximo e resposta rápida." | Resumo preservado. Desc.: "Avaliamos riscos, organizamos acessos e preparamos a operação para detectar e responder a incidentes, conforme o escopo contratado." | "Resposta rápida" é promessa de prazo sem SLA. | **[PENDENTE]** SLA / tempo de resposta (não afirmar) |
| H-13 | Cibersegurança — entregas | Diagnóstico de riscos / Identidade e acesso / Monitoramento contínuo / Resposta a incidentes | Riscos e testes de segurança (Pentest) / Identidade e acesso / Monitoramento / Resposta a incidentes | Evita confundir com o "Diagnóstico" comercial gratuito e dá nome ao Pentest sem destaque (mesmo peso, ver §2). "Contínuo" implica cobertura permanente. | PLAN D10; FAQ de Cibersegurança |
| H-14 | Infraestrutura — resumo/desc. | "Ambientes estáveis, escaláveis e sob controle" / "Planejamos, migramos e operamos ambientes em nuvem preparados para crescer sem surpresas de custo." | Resumo preservado. Desc.: "Planejamos, migramos e acompanhamos ambientes locais, em nuvem e híbridos, com atenção à capacidade, à recuperação e aos custos." | "Sem surpresas de custo" é promessa; "locais, em nuvem e híbridos" já consta na página do serviço. | product.md (Infraestrutura); sem percentuais de economia |
| H-15 | Infraestrutura — entregas | Arquitetura e migração / Ambientes escaláveis / Backup e continuidade / Custos sob controle | Arquitetura e migração / Capacidade e escala / Backup e continuidade / Visibilidade de custos | "Sob controle" promete resultado; "visibilidade" descreve a entrega. | tools/ serviço |
| H-16 | Software — resumo/desc. | "Sistemas que acompanham o seu negócio" / "Desenvolvemos e evoluímos sistemas sob medida, integrados às ferramentas que sua equipe já usa." | **Preservar** | Sem promessa fora do contrato. | — |
| H-17 | Software — entregas | Sistemas sob medida / Integrações entre ferramentas / Automação de processos / Evolução contínua do código | Sistemas sob medida / Integrações entre ferramentas / Automação de processos / Evolução do sistema | "Contínua" sugere suporte permanente; evolução é definida na contratação. | frentesNote de Software |
| H-18 | Botão | "Conhecer {title}" | **Preservar** | — | — |

### 1.3 Processo geral da Home (5 etapas)

A Home mantém as cinco etapas gerais (PLAN 4.2); cada serviço terá as suas quatro (§§2–4). Cabeçalho (Process.tsx): "Como trabalhamos" / "Da análise à evolução." / "Um processo claro, colaborativo e adaptado a cada realidade." / "As etapas podem variar conforme o escopo do projeto." / anúncio sr-only "Etapa {n} de 5: {title}. {desc}".

| ID | Etapa | Atual | Proposta | Razão |
|---|---|---|---|---|
| H-19 | Cabeçalho | Textos acima | **Preservar**. Complemento à nota: "As etapas podem variar conforme o escopo do projeto. Cada serviço detalha o seu método na própria página." | Esclarece que as 5 etapas são visão geral e não o fluxo de cada pilar (D05). |
| H-20 | 1 Diagnóstico | "Entendemos o contexto e os principais desafios." Terminal: "entregável: mapa de riscos e prioridades" / "[OK] contexto entendido" | **Preservar** descrição e "[OK]". Terminal: "entregável: resumo do contexto e das prioridades" | "Mapa de riscos" é específico de segurança e não vale para nuvem ou software. |
| H-21 | 2 Estratégia | "Definimos o caminho com objetivos claros." / "plano de ação aprovado com você" / "[OK] caminho definido" | **Preservar** | Sem promessa fora do escopo. |
| H-22 | 3 Implementação | "Colocamos o plano em prática." / "acompanhamento semanal com seu time" / "soluções em produção" / "[OK] plano em prática" | Descrição preservada. Terminal: "acompanhamento combinado com seu time" / "mudanças validadas antes de entrar em uso" / "[OK] plano em prática" | "Semanal" e "em produção" afirmam cadência e resultado que o contrato define. A validação consta no PLAN 4.2 (infra e software); em segurança, só o teste autorizado. **[PENDENTE]** confirmar com Renato se há cadência-padrão de acompanhamento. |
| H-23 | 4 Operação | "Acompanhamos e garantimos estabilidade." / "monitoramento e suporte próximo" / "ambiente estável e documentado" / "[OK] estabilidade garantida" | "Acompanhamos o que estiver no escopo contratado." / "monitoramento e suporte conforme contrato" / "registro do que foi feito e decidido" / "[OK] operação acompanhada" | "Garantimos estabilidade" e "[OK] estabilidade garantida" são promessas. Sem SLA, sem downtime zero, sem 24×7 humano. |
| H-24 | 5 Evolução | "Ajustamos e ampliamos conforme novos desafios." / "próximos passos recomendados" / "[OK] base pronta para crescer" | Descrição preservada. Terminal: "[OK] próximos passos definidos" | "Pronta para crescer" é resultado garantido. |

---

## 2. Cibersegurança (`/servicos/ciberseguranca`)

Fontes: `features/services/content.ts` (Cibersegurança), `ServicePage.tsx`; PLAN 4.1, 4.2, D10, D19.

### 2.1 Hero (literal do PLAN 4.1, D19)

| ID | Bloco | Atual | Proposta | Razão | Fonte |
|---|---|---|---|---|---|
| C-01 | H1 | "Pentest e cibersegurança" / "para a sua operação." | **Cibersegurança para proteger o seu negócio.** | Pentest não lidera o hero (D10/D19). | PLAN 4.1 |
| C-02 | Introdução | "Entenda os riscos dos seus sistemas, organize acessos e prepare sua operação para detectar e responder a incidentes. O Pentest ajuda a identificar vulnerabilidades e orientar prioridades com evidências e impacto de negócio." | **Identifique riscos, fortaleça seus sistemas e esteja preparado para enfrentar ameaças digitais. Com soluções de cibersegurança alinhadas à sua operação, ajudamos sua empresa a reduzir vulnerabilidades, proteger seus ativos digitais e elevar sua maturidade em segurança.** | Texto literal aprovado. Quebras de apresentação são permitidas; palavras e pontuação não mudam. Aplicar sem adaptar. | PLAN 4.1 |
| C-03 | Eyebrow, CTA e nota | "Cibersegurança" (label); "Solicitar diagnóstico"; "Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil." | **Preservar** | Copy comercial aprovada. | AGENTS |
| C-04 | Metadata | `metaTitle` "Cibersegurança e Pentest"; description "Pentest, avaliação de riscos, identidade e acesso, monitoramento e resposta a incidentes conforme o contexto da sua operação." | Title: "Cibersegurança para proteger o seu negócio". Description: "Avaliação de riscos, testes de segurança, identidade e acesso, monitoramento e resposta a incidentes, conforme o escopo contratado." | Acompanha o novo H1; Pentest aparece como um item entre os demais. | Template `%s · Root Trust` mantido |

### 2.2 Situações, frentes e equilíbrio do Pentest

| ID | Bloco | Atual | Proposta | Razão | Fonte |
|---|---|---|---|---|---|
| C-05 | Situações | Título "Conhecer os riscos para decidir o próximo passo." e quatro itens (Validar aplicações e ambientes / Organizar identidades e acessos / Priorizar correções / Preparar detecção e resposta) | **Preservar** | Já equilibrado entre os temas; sem promessa. | — |
| C-06 | Título das frentes | "Proteção conectada ao contexto da operação." | **Preservar** | — | — |
| C-07 | Frente 1 | Título "Diagnóstico de riscos", badge "Destaque · Pentest" e texto "Avaliamos riscos e vulnerabilidades dentro de um escopo definido, com Pentest como frente de destaque. Os achados orientam prioridades técnicas e decisões de negócio." | Título "Riscos e testes de segurança". **Sem badge.** Texto: "Avaliamos riscos e vulnerabilidades dentro de um escopo definido, inclusive com testes de segurança autorizados (Pentest). Os achados orientam prioridades técnicas e decisões de negócio." | Remove o destaque (D10) sem perder a informação. Renomear evita confundir com o "diagnóstico" comercial gratuito. | PLAN D10; FAQ |
| C-08 | Frente 2 | "Identidade e acesso" | **Preservar** título e texto | Mesmo peso. | — |
| C-09 | Frente 3 | "Monitoramento contínuo": "O monitoramento automático pode ser 24×7 conforme contrato; cobertura humana e resposta são definidas separadamente." | Título "Monitoramento". Texto preservado | "Contínuo" no título contradiz a ressalva do corpo. A ressalva (24×7 só conforme contrato, humano separado) é obrigatória. | **[PENDENTE]** cobertura humana 24×7: não afirmar |
| C-10 | Frente 4 | "Resposta a incidentes" | **Preservar** | Mesmo peso. | — |
| C-11 | Painel do Pentest (`detail`) | Rótulo "Destaque · Pentest"; "Teste de segurança autorizado, com escopo definido."; lista "Entregas do Pentest contratado" (relatório técnico com evidências e impacto; resumo executivo; recomendações priorizadas) | Rebaixar a um bloco sem destaque **dentro da frente 1**, com o mesmo estilo dos demais textos. Rótulo "Sobre o Pentest". Preservar título, lista e itens sem alteração | Não se perde nenhuma informação útil. Sem peso visual superior aos outros três. | D10; Codex decide se a implementação usa bloco recolhido ou parágrafo |
| C-12 | Complementos e notas | "Capacidades complementares, conforme escopo contratado": Gestão de vulnerabilidades, Red Team ("não é sinônimo de Pentest"), Apoio a normas e compliance ("não garante certificação"); notas "Reteste após as correções conforme escopo e contrato." e "A conversa gratuita não inclui a execução do Pentest ou esses relatórios." | **Preservar** integralmente, dentro do bloco "Sobre o Pentest" | Ressalvas de escopo e certificação. | FAQ; product.md |
| C-13 | Peso das frentes | Badge, painel e "frente de destaque" | Quatro frentes na mesma ordem e com o mesmo formato; nenhuma recebe badge, escala maior ou CTA superior | Contrato 4.1 (equilíbrio). | PLAN 4.1, D10 |
| C-14 | Escopo e autorização | Presente apenas no painel do Pentest | "Antes de qualquer teste de segurança, definimos escopo e autorização." | Preserva o contrato aprovado sem inventar formato documental obrigatório. | PLAN 4.2 |

### 2.3 Método de 4 etapas (PLAN 4.2, D05)

Substitui `stages` global + 5 passos. Título e descrição próprios por etapa; objetivo, colaboração e saída típica.

| ID | Etapa | Proposta (descrição) | Objetivo / o que você faz / saída típica |
|---|---|---|---|
| C-15 | 1. Entender contexto e definir limites | "Entendemos o negócio, os sistemas e o que está dentro e fora do trabalho. Escopo e autorização vêm antes de qualquer teste." | Objetivo: acordar escopo. Você: informa sistemas, responsáveis e restrições. Saída: escopo e autorização registrados. |
| C-16 | 2. Avaliar riscos e controles | "Analisamos riscos, acessos e controles incluídos no escopo e, quando contratado, executamos testes de segurança." | Objetivo: encontrar o que importa. Você: libera acessos e tira dúvidas. Saída: achados com evidências e impacto de negócio. |
| C-17 | 3. Priorizar e executar ações contratadas | "Ordenamos as correções por impacto e esforço e executamos as ações que estiverem no contrato." | Objetivo: decidir a ordem. Você: valida prioridades e janelas de mudança. Saída: lista priorizada e ações contratadas feitas. |
| C-18 | 4. Acompanhar e revisar prioridades | "Acompanhamos o que estiver contratado e revisamos prioridades quando o contexto muda. Reteste, monitoramento e suporte dependem do contrato." | Objetivo: manter a visão atual. Você: informa mudanças. Saída: revisão de prioridades; reteste só quando contratado. |
| C-19 | Título do método | "Do entendimento do risco" / "às prioridades de ação." | **Preservar** | Continua descrevendo o fluxo. |

Razão geral: cada pilar tem fluxo próprio (D05). Sem prazos, entregáveis fixos nem cadência garantida. **[PENDENTE]** não afirmar duração de etapas.

### 2.4 Fecho, FAQ e CTA

| ID | Bloco | Atual | Proposta | Razão |
|---|---|---|---|---|
| C-20 | Fecho | "Segurança considera as aplicações que movem o negócio e a infraestrutura que as sustenta. Essa visão integrada orienta o trabalho sem exigir a contratação das três frentes." | **Preservar** | Explica a integração sem imposição comercial. |
| C-21 | FAQ (6) | Diagnóstico não inclui Pentest; ambientes; entregas; reteste; monitoramento não é equipe humana 24×7; sem garantia de ausência de incidentes nem certificação | **Preservar** as 6 respostas | Ressalvas obrigatórias do PLAN 4.2. Único ajuste: a pergunta sobre Pentest passa a "Solicitar diagnóstico inclui testes de segurança?" para alinhar com C-07. |
| C-22 | CTA | "Vamos entender as prioridades da sua segurança." / "Conte um pouco sobre sua empresa em uma conversa inicial gratuita de qualificação. A gente retorna por ligação ou WhatsApp no próximo dia útil." | **Preservar** | Copy comercial aprovada. |

---

## 3. Infraestrutura em nuvem (`/servicos/infraestrutura-em-nuvem`)

| ID | Bloco | Atual | Proposta | Razão / fonte |
|---|---|---|---|---|
| I-01 | H1 e intro | "Continuidade e custos sob controle na sua infraestrutura." / "Planejamos e evoluímos ambientes locais, em nuvem e híbridos, conectando capacidade, redes, recuperação e visibilidade de custos às necessidades da sua operação." | H1: "Infraestrutura preparada para a sua operação." Intro preservada. | Proposta editorial D04/D11, a aplicar em T3.1 e revisar no conjunto final. Gate A avalia Home/header/feedback, não H1 das internas. |
| I-02 | Metadata | "Infraestrutura em nuvem" / "Ambientes locais, nuvem, redes, backup e capacidade com atenção à continuidade e aos custos da sua operação." | **Preservar** | Sem promessa. |
| I-03 | Situações | Título "Uma base preparada para o que a operação exige." e quatro itens | **Preservar** | Equilibrado. |
| I-04 | Frentes | Título "Arquitetura, operação e custos considerados em conjunto."; Arquitetura e migração, Ambientes escaláveis, Backup e continuidade, Custos sob controle; nota "As entregas dependem do escopo e do contrato." | Textos preservados. Renomear "Custos sob controle" para "Visibilidade de custos" e manter as linhas "Entender o gasto. / Identificar ociosidade. / Ajustar capacidade." | Coerente com H-15. Sem percentual de economia (product.md). |
| I-05 | Método de 4 etapas | 5 passos atuais (ver abaixo) | Ver tabela a seguir | PLAN 4.2, D05 |
| I-06 | Fecho, FAQ (6) e CTA | "A infraestrutura sustenta aplicações…" / 6 FAQs / "Vamos conversar sobre a base da sua operação." | **Preservar** | Ressalvas já presentes (sem provedores nomeados, sem FinOps, sem economia garantida). |

Método (PLAN 4.2):

| ID | Etapa | Proposta (descrição) | Objetivo / o que você faz / saída típica |
|---|---|---|---|
| I-07 | 1. Levantar ambientes e dependências | "Mapeamos ambientes, redes, dependências, consumo e necessidades da operação." | Objetivo: ver o que existe. Você: dá acesso a informações e responsáveis. Saída: inventário e dependências. |
| I-08 | 2. Desenhar arquitetura e plano | "Definimos arquitetura, continuidade, capacidade e custos, com um plano por etapas." | Objetivo: escolher o caminho. Você: valida requisitos e prioridades. Saída: arquitetura proposta e plano de execução. |
| I-09 | 3. Implantar ou migrar com validação | "Configuramos ou migramos os ambientes contratados e validamos cada mudança antes de colocá-la em uso." | Objetivo: mudar com controle. Você: aprova janelas e valida resultados. Saída: ambiente validado. **Sem promessa de downtime zero.** |
| I-10 | 4. Acompanhar e otimizar | "Acompanhamos os ambientes incluídos no contrato e ajustamos capacidade e custos quando o contexto muda." | Objetivo: manter o ambiente adequado. Você: informa mudanças de demanda. Saída: ajustes recomendados. Operação e suporte só quando contratados. |
| I-11 | Título do método | "Entender a base" / "para escolher o caminho." | **Preservar** |

---

## 4. Software (`/servicos/desenvolvimento-de-software`)

| ID | Bloco | Atual | Proposta | Razão / fonte |
|---|---|---|---|---|
| S-01 | H1, intro e metadata | "Software sob medida para conectar e evoluir sua operação." / "Criamos aplicações web e mobile, integramos sistemas e automatizamos processos a partir das necessidades do seu negócio, com atenção à segurança e à evolução da solução." / "Software e desenvolvimento sob medida" / "Aplicações web e mobile, integrações, automação de processos e evolução de sistemas conforme as necessidades da sua operação." | **Preservar** | Sem promessa; rótulo "Software" mantido. |
| S-02 | Situações e frentes | Títulos "Quando a operação precisa de sistemas que conversem." e "Construir, conectar e evoluir com contexto."; quatro frentes; conceitos Integração/Automação; nota "As entregas dependem do escopo e do contrato. Suporte e evolução posteriores são definidos na contratação." | **Preservar** | Já condicionado ao contrato. |
| S-03 | Método de 4 etapas | 5 passos atuais | Ver abaixo | PLAN 4.2, D05 |
| S-04 | Fecho, FAQ (6), CTA | "Aplicações dependem da infraestrutura…" / 6 FAQs / "Vamos conversar sobre o próximo passo do seu software." | **Preservar** | — |

| ID | Etapa | Proposta (descrição) | Objetivo / o que você faz / saída típica |
|---|---|---|---|
| S-05 | 1. Entender problema e sistemas | "Entendemos processos, sistemas existentes e as necessidades da equipe." | Objetivo: definir o problema. Você: apresenta processos e acessos. Saída: problema e sistemas descritos. |
| S-06 | 2. Priorizar e planejar a solução | "Definimos prioridades, escopo e uma primeira versão a construir." | Objetivo: decidir o que entra primeiro. Você: valida prioridades. Saída: escopo e plano. |
| S-07 | 3. Desenvolver e validar incrementalmente | "Desenvolvemos aplicações, integrações e automações contratadas em partes, validando cada parte com você." | Objetivo: entregar com feedback. Você: testa e dá retorno. Saída: incrementos validados. |
| S-08 | 4. Colocar em uso e evoluir | "Orientamos a entrada em uso e, quando contratado, acompanhamos e evoluímos a solução." | Objetivo: colocar em operação. Você: aprova a entrada em uso. Saída: solução em uso; suporte e evolução só conforme contrato. |
| S-09 | Título do método | "Do desafio da operação" / "à solução que faz sentido." | **Preservar** |

Para as três páginas, `stages` global e `stageNote` ("As etapas podem variar conforme o escopo do projeto.") deixam de dirigir o método de serviço; a nota fica na Home (H-19) e é replicada em cada serviço na mesma frase.

---

## 5. Ferramentas

Fontes: `features/tools/content.ts`, `ToolPage.tsx`, `tools.md` §256–343. Fórmulas, hipóteses, limites e fontes: **inalterados**.

### 5.1 Páginas

| ID | Ferramenta | Atual (H1 / lead) | Proposta | Razão |
|---|---|---|---|---|
| T-01 | ROSI | "Explore o retorno de uma proteção adicional." / "Simule um cenário nos primeiros 12 meses, com suas estimativas de perdas, custos e redução esperada." Title "ROSI: retorno de uma proteção adicional" | **Preservar** (idênticos à proposta de tools.md) | Não promete economia. |
| T-02 | Shadow AI | "Organize a governança do uso de IA." / "Responda a cinco perguntas para identificar práticas declaradas, lacunas e informações a confirmar." | **Preservar** | Sem score; autodeclarado. |
| T-03 | Dívida técnica | "Estime o custo do tempo atribuído à dívida técnica." / "Relacione equipe, custo e esforço de manutenção. A estimativa não mede o valor total da dívida." | **Preservar** | Ressalva já presente. |
| T-04 | Migração | "Compare os custos de manter ou migrar." / "Informe totais comparáveis de operação e transição. Migrar pode custar mais." | **Preservar** | Resultado negativo explícito. |
| T-05 | Selo de modo | "Protótipo — cálculos locais; …" (três variantes: demo, pilot, indisponível) | Trocar somente "Protótipo" por "Versão de avaliação", preservando a explicação específica de cada modo. Nos modos reais: "Versão de avaliação — cálculos locais; o pedido de relatório envia seu e-mail, a ferramenta escolhida e a opção de contato comercial, sem respostas ou resultados." Demo e indisponível continuam afirmando ausência de envio. | D09/D14 e contrato de dados: consentimento opcional existente é preservado; nenhum modo recebe texto que alegue envio inexistente. |
| T-06 | Método | "Como chegamos a este resultado" / "Hipóteses visíveis." / "Limites." / "Fontes de conceito." / "As fontes sustentam conceitos. Os modelos desta página são escolhas da Root Trust, não modelos certificados por essas instituições." | **Preservar** | Ressalva obrigatória. |
| T-07 | Relatório | "Receba o relatório de {reportTopic}" / "Material padrão sobre o tema, conceitos e próximos passos gerais. Não é personalizado a partir das suas respostas." | **Preservar** | Nome "relatório" definido pelo proprietário. |
| T-08 | CTA | "Quer conversar sobre o seu cenário?" / nota de retorno / "Solicitar diagnóstico" | **Preservar** | — |
| T-09 | Estados do formulário (interface) | ROSI: "Calcular cenário", "Corrija os campos destacados para calcular.", "Não há informações suficientes para produzir este resultado.", "Este resultado depende das estimativas informadas; não representa economia realizada.", "Algum valor é grande demais para calcular. Revise os números informados." Shadow AI: "Ver orientações", "Responda todas as perguntas para ver as orientações.", "Escolha uma resposta.", "Sem nota, pontuação ou classificação de risco. As respostas são autodeclaradas." | **Preservar** | Já seguem os contratos F11–F29; complementos de dívida/migração/campos na seção 5.3. |
| T-10 | Metadata | `metaTitle`/`metaDescription` dos quatro `content.ts` | **Preservar** | Coerentes com os H1. |

### 5.2 Ferramentas na Home (cards)

| ID | Ferramenta | Atual | Proposta | Razão |
|---|---|---|---|---|
| T-11 | ROSI | "Estime o retorno financeiro de um investimento em segurança." | "Simule o retorno de uma proteção adicional com suas próprias estimativas." | Mesmo conteúdo da ferramenta; o texto atual sugere resultado financeiro objetivo. product.md diz "Avalie sua postura de segurança.", que não corresponde à ferramenta. |
| T-12 | Shadow AI | "Identifique e gerencie riscos de uso." | "Organize o que sua equipe declara sobre o uso de IA e o que falta confirmar." | A ferramenta não identifica nem gerencia risco. |
| T-13 | Dívida técnica | "Entenda os riscos no seu código e infraestrutura." | "Estime o custo do tempo de manutenção atribuído à dívida técnica." | A ferramenta não analisa código nem infraestrutura. |
| T-14 | Migração | "Analise cenários e oportunidades." | "Compare o custo de manter ou migrar um ambiente." | "Oportunidades" sugere ganho; migrar pode custar mais. |

---

## 6. Newsletter

Fontes: `features/newsletter/*`, `components/forms/NewsletterForm.tsx`, `newsletter.md`. Sem alterar edições, e-mails ou PDFs (D09).

| ID | Rota / bloco | Atual | Proposta | Razão / fonte |
|---|---|---|---|---|
| N-01 | `/newsletter` — hero | Eyebrow "Newsletter"; H1 "Análise da Root Trust em dias úteis."; lead "Cibersegurança, infraestrutura em nuvem e software para decisões sobre operações críticas. Um tema central por edição, análise própria, implicações práticas e links para as fontes." | H1 e lead **preservados** | A promessa de "dias úteis" é qualificada na FAQ (N-04). |
| N-02 | Landing — apoio | "Se ainda não assina, confirme seu endereço pelo link enviado por e-mail. Depois você recebe a edição mais recente e os próximos envios em dias úteis. Você pode cancelar os próximos envios." | "Depois da confirmação, você recebe a edição mais recente e os próximos envios, quando houver publicação. Você pode cancelar os próximos envios." | "Em dias úteis" sem ressalva sugere envio garantido. |
| N-03 | Landing — benefícios | "Assuntos conectados à sua base tecnológica." / "Análise com implicações práticas e fontes." / "Edição completa na sua caixa de entrada." | **Preservar** | Sem promessas. |
| N-04 | FAQ — frequência | "Com que frequência recebo?" → "Em dias úteis." | "A newsletter é preparada em dias úteis, com um tema central ligado à cibersegurança, à infraestrutura em nuvem ou ao software. Cada edição reúne a análise da Root Trust, impactos práticos e fontes para aprofundar a leitura. Os envios dependem da publicação da edição; não há horário fixo garantido." | Texto literal da proposta do PLAN 4.3. A geração às 08h (Brasília) é rotina interna e não é promessa de entrega nesse horário. |
| N-05 | FAQ — demais | "Posso ler tudo no site?" / "O que recebo ao me inscrever por esta página?" / "Posso pedir uma edição anterior?" / "Como cancelo?" ("Pelo caminho de cancelamento indicado nos e-mails.") | **Preservar** | Contrato de acesso (somente metadados, fontes e primeiro parágrafo públicos). |
| N-06 | Curadoria | "Seleção / Análise / Revisão" ("Texto, fontes e afirmações, antes de publicar cada edição.") e "A Root Trust seleciona assuntos relevantes aos três serviços, analisa o impacto para operações críticas e revisa texto, fontes e afirmações antes de publicar cada edição." | **Preservar** o texto, sem menção a IA ou ao processo interno de revisão humana | Contrato público de AGENTS já definido; não adicionar a alegação "sem IA" nem reabrir essa decisão. |
| N-07 | Edições recentes e vazio | "Edição recente" / "Conheça uma edição." / "Conheça o assunto pela abertura de cada edição. Receba o conteúdo completo por e-mail, após confirmar seu endereço, e os próximos envios em dias úteis."; "Ainda não há edições publicadas."; "Não foi possível carregar as edições agora. Tente novamente em instantes." | Trocar "e os próximos envios em dias úteis" por "e os próximos envios, quando houver publicação". Demais: **preservar** | Consistência com N-02. |
| N-08 | Fecho | "Veja outras edições" / "Conheça os temas anteriores da curadoria." / "Ver prévias anteriores" | **Preservar** | — |
| N-09 | Arquivo | H1 "Prévias das edições."; lead "Conheça os temas da curadoria da Root Trust. Escolha uma prévia e solicite aquela edição completa por e-mail."; "Conhecer a newsletter"; "Edições demonstrativas — conteúdo para avaliação do design."; "Mais recente"; "Filtrar por pilar"; "{n} edição(ões)"; paginação "Anterior / Próxima / Página X de Y"; vazio "Ainda não há edições publicadas." / "Volte para conhecer as próximas prévias."; filtro vazio "Nenhuma edição neste pilar por enquanto." / "Ver todos os pilares" | **Preservar** | Rótulo "demonstrativas" mantém a distinção demonstração/real. Dois itens por página e reinício na página 1 ao filtrar são regras do AGENTS. |
| N-10 | Prévia | "Voltar para todas as edições"; "Fontes"; H2 "Receba esta edição completa."; "Receba esta edição completa e as próximas análises em dias úteis. Se ainda não assina, confirme seu endereço pelo link enviado por e-mail."; "Edição solicitada: {titulo}"; "Você pode cancelar os próximos envios. Newsletter e relatório são escolhas independentes."; "Já assina? Você também pode solicitar esta edição aqui." | Trocar "em dias úteis" por "quando houver publicação". Demais: **preservar** | Mesma razão de N-02. |
| N-11 | Formulário | Rótulo e placeholder "Seu e-mail"; botão "Assinar" ou "Receber esta edição completa"; ajuda "Conteúdo completo por e-mail após confirmação, com próximos envios em dias úteis." (+ "O envio ainda não está disponível nesta versão." quando indisponível) | Ajuda: "Conteúdo completo por e-mail após a confirmação, com próximos envios quando houver publicação." Demais: **preservar** | Consistência com N-02. |
| N-12 | Metadata | Landing: "Newsletter — Root Trust" / "Análise sobre cibersegurança, nuvem e software em dias úteis. Leia prévias públicas e receba as edições completas por e-mail." (noindex); arquivo "Prévias da newsletter — Root Trust"; prévia `{titulo} — Prévia · Root Trust` (noindex) | Descrição da landing: "Análises sobre cibersegurança, nuvem e software preparadas em dias úteis. Leia prévias públicas e receba as edições completas por e-mail." Demais: **preservar** | Mantém "dias úteis" só como preparo, sem horário. Robots permanece `noindex` até a abertura. |

### 6.1 Confirmar e cancelar

Fonte: `app/newsletter/confirmar/ConfirmNewsletter.tsx` e `cancelar/CancelNewsletter.tsx`. O token é lido do hash e removido da URL; isso permanece.

| ID | Estado | Atual | Proposta | Razão / pendência |
|---|---|---|---|---|
| N-13 | Confirmar — pronto | "Confirme seu endereço para receber a edição completa e os próximos envios em dias úteis." | "Confirme seu endereço para receber a edição completa e os próximos envios, quando houver publicação." | Consistência (N-02). |
| N-14 | Confirmar — enviando | "Confirmando seu endereço…" | **Preservar** | — |
| N-15 | Confirmar — sucesso | "Endereço confirmado. Se houver uma edição disponível, o envio foi colocado na fila; a entrega ainda depende do provedor de e-mail." | **Preservar** | Não promete entrega. |
| N-16 | Confirmar — edição indisponível | "Endereço confirmado. A edição escolhida não está disponível para envio; você receberá as próximas edições." | "Endereço confirmado. A edição escolhida não está disponível para envio; você receberá as próximas edições publicadas." | "Receberá" é condicional à publicação. |
| N-17 | Confirmar — link expirado, usado ou inválido | 410 "Este link expirou. Solicite um novo na página da newsletter."; 409 "Este link já foi usado ou substituído. Se necessário, solicite outro na página da newsletter."; sem token "O link não contém um token válido. Solicite outro na página da newsletter." | Uma mensagem única para 409/410: "Este link não pode mais ser usado. Solicite outro na página da newsletter." Sem token: **preservar** | Não revela se o link expirou, foi usado ou substituído (menos pistas sobre o estado da inscrição). Decisão a validar: o ganho de especificidade das mensagens atuais é pequeno. |
| N-18 | Confirmar — falha | "Não foi possível confirmar agora. Tente novamente mais tarde ou solicite outro link." | **Preservar**; botão "Tentar novamente" e link "Voltar à newsletter" também | — |
| N-19 | Cancelar — pronto e sucesso | "Cancele os próximos envios da newsletter. Relatórios e eventual autorização comercial são independentes." / "Os próximos envios da newsletter foram cancelados. Isso não altera uma autorização separada para contato comercial ou relatórios." | **Preservar** | Esclarece a independência. |
| N-20 | Cancelar — link inválido | "Este link não é mais válido. Responda ao e-mail da newsletter para pedir ajuda." | "Este link não é mais válido. Para pedir ajuda, escreva para contato@roottrust.com.br." | Não há confirmação de que o e-mail da newsletter aceite respostas; o contato oficial está confirmado (D16). **[PENDENTE]** confirmar se existe reply-to monitorado; sem confirmação, usar a proposta. |
| N-21 | Cancelar — falha | "Não foi possível cancelar agora. Tente novamente ou responda ao e-mail da newsletter." | "Não foi possível cancelar agora. Tente novamente ou escreva para contato@roottrust.com.br." | Mesma razão de N-20. |
| N-22 | Metadata | "Confirmar newsletter — Root Trust" / "Cancelar newsletter — Root Trust", `noindex` | **Preservar** | — |

---

## 7. Formulários e estados de feedback (PLAN 4.4)

Fonte: `components/forms/FormStatus.tsx`, `ContactForm.tsx`, `ReportForm.tsx`, `lib/forms.ts`. Regras: sem toast, modal, polling nem retry automático; dados preservados após falha; feedback em região `role="status"`.

### 7.1 Orientação e validação

| ID | Bloco | Atual | Proposta | Razão |
|---|---|---|---|---|
| F-01 | Diagnóstico — campos | Nome ("Como podemos te chamar"), Empresa ("Nome da empresa"), WhatsApp ("(00) 00000-0000"); botão "Solicitar diagnóstico" / "Enviando solicitação…" | **Preservar** | Campos e botão aprovados; sem e-mail ou canal. |
| F-02 | Canais | "Fale com a Root Trust: contato@roottrust.com.br ou 11 94008-4692." | **Preservar** | Contatos confirmados. **[PENDENTE]** horário de atendimento (não afirmar). |
| F-03 | Mensagens de campo | "Informe seu nome." / "Informe a empresa." / "Informe um número com DDD." / "Informe um endereço de e-mail válido." | **Preservar**; manter associação ao campo e foco no primeiro inválido | Já cumprem o contrato. |
| F-04 | Relatório — orientação | "Seu e-mail"; "Este pedido não inscreve você na newsletter. Suas respostas nunca são associadas ao e-mail." | **Preservar** | Independência newsletter/relatório. |
| F-05 | Relatório — checkbox comercial | "Também quero receber comunicações comerciais da Root Trust neste e-mail (opcional; o relatório chega mesmo sem marcar)." | Preservar a opção existente, desmarcada e independente da newsletter. Texto: "Também quero receber comunicações comerciais da Root Trust neste e-mail (opcional; posso pedir o relatório sem marcar)." | Não criar nem remover funcionalidade por interpretação da proibição de marketing obrigatório. `ReportForm`, `forms.ts` e API já aceitam `commercialConsent`; o pedido não garante entrega. Incluir essa finalidade na Privacidade. |

### 7.2 Estados

| ID | Estado | Atual | Proposta | Razão / pendência |
|---|---|---|---|---|
| F-06 | Inicial | Sem painel | **Preservar** | D12: sem frase inicial. |
| F-07 | Inválido — contato | "Confira os campos: algum dado não foi aceito. Seus dados foram mantidos, tente novamente." | "Confira os campos indicados. Seus dados foram mantidos." | O erro fica ao lado do campo (associado) com foco; o resumo não repete. |
| F-08 | Inválido — relatório | "Confira o e-mail: ele não foi aceito. Tente novamente." | "Confira o e-mail indicado e tente novamente." | Consistente com o erro de campo. |
| F-09 | Inválido — newsletter | "Confira o endereço de e-mail e tente novamente." | **Preservar** | — |
| F-10 | Enviando | "Enviando solicitação…" / "Solicitando relatório…" / "Solicitando confirmação…" | **Preservar** | — |
| F-11 | Diagnóstico aceito | "Solicitação recebida (protocolo {ref}). Retornaremos por ligação ou WhatsApp no próximo dia útil." | **Preservar** | Em pilot/public, somente após persistência aceita e acompanhamento operacional atestado. Não detalhar horários/feriados sem fatos. Demo mantém texto local explícito. |
| F-12 | Newsletter aceita (neutra) | "Pedido registrado. Se necessário, enviaremos um link de confirmação; para endereços já confirmados, uma edição disponível pode seguir para a fila. Confira também a caixa de spam. A entrega não é garantida." | "Pedido registrado. Confira seu e-mail e a caixa de spam para as próximas orientações. O pedido não confirma a inscrição nem a entrega." | Mensagem fixa para todos os endereços; o texto atual também era fixo e não constituía enumeração por si só. A proposta simplifica a próxima ação sem prometer envio. |
| F-13 | Relatório aceito | "Pedido registrado. O relatório será enviado por e-mail em seguida; se não chegar, confira a caixa de spam ou use os canais de contato. A entrega não é garantida." | "Pedido registrado. O relatório deve chegar por e-mail; se não chegar, confira a caixa de spam ou use os canais de contato. A entrega não é garantida." | "Em seguida" sugere prazo. |
| F-14 | CAPTCHA — contato / relatório | "Não foi possível validar a verificação de segurança. Conclua-a novamente e envie de novo." | **Preservar** | — |
| F-15 | CAPTCHA — newsletter | "Conclua novamente a verificação de segurança." | "Não foi possível validar a verificação de segurança. Conclua-a novamente e envie de novo." | Alinha as três mensagens. |
| F-16 | 429 | "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente; seus dados foram mantidos." (newsletter: "…Aguarde e tente novamente.") | Com `retryAfter`: "Muitas tentativas em pouco tempo. Tente novamente em {n} segundos; seus dados foram mantidos." (≥60 s: "em {m} minutos", arredondando para cima). Sem `retryAfter`: texto atual. | Unidade confirmada por Codex: `http.ts` serializa `retryAfterSec` de `limits.ts`, em segundos. Aceitar só número finito positivo e arredondar para cima; sem retry automático. |
| F-17 | Origem proibida | Contato: "Esta página não está autorizada a enviar a solicitação. Recarregue a página ou use os canais de contato; seus dados foram mantidos." Relatório/newsletter: variantes curtas | **Preservar** | Já orientam o próximo passo. Alinhar relatório e newsletter para incluir "seus dados foram mantidos" quando houver dados preservados. |
| F-18 | Configuração, cota, rede ou 5xx | "O recebimento está indisponível no momento. Seus dados foram mantidos; tente mais tarde ou use os canais de contato." / "Não foi possível enviar a solicitação. …" / relatório e newsletter equivalentes | **Preservar** | Não expõe causa interna. Sem sucesso simulado. |
| F-19 | Modo demo | "Demonstração local — nenhum dado é enviado ou guardado."; aceito: "Demonstração: solicitação aceita localmente. Nenhum dado foi enviado." (contato) / "Demonstração: pedido aceito aguardando confirmação. Nenhum dado foi enviado." (newsletter) / "Demonstração: pedido de relatório aceito localmente. Nenhum dado foi enviado." (relatório); erro e indisponível com "Nenhum dado foi enviado."; controle "Resultado da demonstração" | **Preservar** | D12: a frase inicial do FormStatus continua removida; só aviso do modo demo e feedback pós-tentativa. |
| F-20 | `noscript` | "Ative JavaScript para enviar a solicitação, ou use os canais de contato." / "Ative JavaScript para validar este formulário local, ou use os canais de contato." | **Preservar** | — |
| F-21 | Confirmação e cancelamento | Ver N-13 a N-21 | — | — |

---

## 8. 404 e metadata global

| ID | Bloco | Atual | Proposta | Razão |
|---|---|---|---|---|
| E-01 | 404 | "Página não encontrada — Root Trust" / "O endereço solicitado não foi encontrado." / "Erro 404" / "Página não encontrada." / "O endereço pode estar incorreto ou a página pode não estar disponível." / ações "Voltar à Home", "Conhecer os serviços", "Solicitar diagnóstico" | **Preservar** | Claro, sem culpa nem jargão. |
| E-02 | Layout | Título padrão "Root Trust · A base que sustenta o crescimento"; template "%s · Root Trust"; description "Cibersegurança, infraestrutura em nuvem e software para operações críticas."; `noindex`; skip link "Pular para o conteúdo" | **Preservar** | `noindex` permanece até autorização de abertura pública. |
| E-03 | Home — metadata | "Root Trust — Confiabilidade com profundidade" / "Cibersegurança, infraestrutura em nuvem e desenvolvimento de software para operações críticas. Conheça a Root Trust e solicite uma conversa inicial." | **Preservar** | — |

---

## 9. Privacidade (`/privacidade`)

**Status: PROPOSTA para revisão no gate B (T3.3). Não é parecer jurídico nem comprova a operação.** O texto abaixo descreve a operação pública futura. A versão atual do código descreve o piloto restrito e permanece em vigor até a aprovação do gate B e a ativação.

Fatos já registrados: formulários com Turnstile; dados operacionais no Firestore; e-mail pelo Resend; avisos privados no Discord; leads sem interação e registros locais de newsletter cancelada entram na rotina de exclusão após seis meses, em lotes e sem prazo instantâneo garantido; prazo de exclusão nos serviços externos indefinido; ferramentas só em memória; sem analytics; contato oficial `contato@roottrust.com.br` e telefone 11 94008-4692; Renato é o responsável operacional (D16).

### 9.1 Metadata e cabeçalho

| ID | Bloco | Atual | Proposta | Razão |
|---|---|---|---|---|
| P-01 | Metadata | "Privacidade — Root Trust" / "Informações provisórias sobre o uso de dados no piloto do website." (`noindex`) | Título preservado. Descrição: "Como a Root Trust trata os dados enviados pelos formulários e usados no website." Mantém `noindex` até a abertura | Reflete a operação futura sem apresentá-la como definitiva. |
| P-02 | H1 e lead | "Privacidade e uso de dados." / "Como os dados são tratados nesta versão de avaliação." | H1 preservado. Lead: "Quais dados coletamos, para quê, por quanto tempo e como falar com a gente." | Mais direto para quem decide. |
| P-03 | Aviso de estado | "Informações provisórias para o piloto restrito. A política de privacidade completa ainda exige revisão antes de publicação aberta." | Enquanto o gate B não for aprovado: **preservar**. Após aprovação: remover o aviso e inserir "Atualizado em {data}. [PENDENTE data]" | Não declarar revisão concluída antes de acontecer. |

### 9.2 Seções

| ID | Seção | Atual | Proposta | Fonte / pendência |
|---|---|---|---|---|
| P-04 | Quem opera | Não existe (só "O que ainda não está definido") | "A Root Trust opera este website. O responsável operacional é Renato. Para dúvidas sobre seus dados, escreva para contato@roottrust.com.br." | D16. **[PENDENTE]** razão social, CNPJ e endereço: não preencher. **[PENDENTE]** nome completo e permissão para exibir o nome. Não nomear encarregado sem validação. |
| P-05 | Dados e finalidades | "O que esta versão faz": diagnóstico (Nome, Empresa, WhatsApp), newsletter (e-mail), relatório (e-mail, ID da ferramenta e, se marcado, consentimento comercial) | "Diagnóstico: usamos Nome, Empresa e WhatsApp para retornar por ligação ou WhatsApp. Newsletter: usamos seu e-mail para confirmar a inscrição, enviar a edição escolhida e as próximas edições publicadas. Relatório: usamos seu e-mail e a ferramenta escolhida para enviar o relatório padrão; suas respostas e resultados nunca acompanham o pedido. Se você marcar a opção de contato comercial, registramos essa autorização separadamente. Pedir o relatório não inscreve você na newsletter." | Preserva F-05 e as finalidades existentes. Base legal por finalidade não será inventada; revisão factual no gate B. |
| P-06 | Serviços que participam | "Firestore… Resend… Discord" | Lista: verificação de segurança (Turnstile), banco de dados (Firestore), e-mail (Resend), aviso interno do diagnóstico e da revisão editorial (Discord), hospedagem do site e das rotinas. | **[PENDENTE]** lista final de operadores, localização e transferência internacional: confirmar com Renato; não afirmar país ou garantias contratuais. |
| P-07 | Retenção | "Leads sem interação e registros locais de newsletter cancelada são apagados após seis meses. O prazo de exclusão de dados nos serviços externos ainda precisa ser definido…" | "Leads sem interação e registros locais de newsletter cancelada entram na rotina de exclusão após seis meses. A limpeza é feita em lotes. Cópias de segurança, mensagens e registros nos serviços externos exigem descarte próprio, sob responsabilidade operacional de Renato; ainda não há prazo numérico universal definido para essas cópias." | Rotina local e responsabilidade/exceção já registradas em development.md. Não inventar prazo nem prometer exclusão instantânea; Renato revisa o limite no gate B. |
| P-08 | Ferramentas | "As respostas e os resultados das ferramentas ficam apenas na memória do navegador…" | **Preservar** | Contrato exato do AGENTS. |
| P-09 | Preferência visual | Não existe | **PROPOSTA para aplicação junto do recurso de tema:** "Se você escolher um tema visual, a preferência fica guardada no seu navegador para lembrar a escolha. Ela não é enviada à Root Trust nem associada a formulários." | Contrato T1.3: localStorage guarda apenas `system`, `light` ou `dark`, se o navegador permitir; sem novo cookie. Descrever o que T2.1 realmente implementar e conferir no gate B. A escolha visual local não depende da ativação de coleta public. |
| P-10 | Cookies e analytics | "O website não usa analytics nesta fase." / "uso de cookies, se houver" | "O website não usa analytics. **[PENDENTE inventário]** de cookies e armazenamento técnico (incluindo os do Turnstile) antes de afirmar 'sem cookies'." | Sem banner de cookies por suposição (PLAN 4.7). |
| P-11 | Seus direitos | "Este é um canal comercial; não foi definido como canal de direitos de titulares." | "Para pedir acesso, correção ou exclusão dos seus dados, escreva para contato@roottrust.com.br." **[PENDENTE]** prazo de resposta e confirmação de que a caixa é monitorada para esse fim. | D16 (contato oficial). Sem listar artigos da lei nem prazo. |
| P-12 | Contato comercial | "contato@roottrust.com.br ou 11 94008-4692." | **Preservar** o e-mail e o telefone; unificar com P-04 e P-11 | Contatos confirmados. |
| P-13 | O que ainda não está definido | "Antes da publicação aberta, esta página precisa de revisão jurídica e operacional…" | Manter somente enquanto o gate B estiver pendente; depois, remover | Evita publicar aviso interno. |
| P-14 | Variante não piloto | "Os formulários estão indisponíveis ou em demonstração local; pedidos demonstrativos não enviam nem guardam dados." / "A interface de demonstração não confirma inscrição, entrega ou recebimento real." | **Preservar** | Rótulo demonstração mantido. |

---

## 10. Limites factuais e decisões resolvidas na revisão

Horários, feriados, SLA, cobertura humana, cadência de acompanhamento e formato de autorização não serão afirmados além do contrato aprovado. A ausência desses fatos não cria nova pergunta nem impede os textos delimitados acima. Não há métricas, casos ou certificações comerciais comprovados para acrescentar.

Razão social, CNPJ, endereço, encarregado formal, bases legais e prazos legais não serão preenchidos por inferência. No gate B, perguntar apenas se um fato ausente for indispensável para a página concreta. O operador já assumiu cotas e descarte externo sem prazo universal; a proposta preserva essa verdade. Localização de provedores, cookies técnicos e qualquer promessa sobre resposta de caixa postal exigem evidência específica antes de ser afirmados; não se presume inexistência de cookies.

Revisão integradora Codex: `retryAfter` em segundos confirmado no código; consentimento comercial opcional preservado; não mencionar IA; proposta I-01 mantida para T3.1; "Versão de avaliação" adotada como rótulo proposto; preferência visual conforme contrato T1.3. N-20/N-21 usam o contato oficial e dispensam presumir reply-to monitorado. Cabeçalhos/partes compartilhadas e as duas ferramentas omitidas na primeira entrega foram lidos por Codex e cobertos na seção complementar abaixo. Nenhuma proposta altera fórmulas ou edições.

### 10.1 Complemento de cobertura após revisão Codex

| ID | Rota/bloco e texto atual | Proposta / razão / fonte |
|---|---|---|
| H-25 | Header: "Serviços", "Ferramentas", "Newsletter", "Solicitar diagnóstico", "Abrir menu"/"Fechar menu", nomes "Navegação principal"/"Navegação móvel" e "Root Trust — página inicial" | Preservar rótulos e destinos. T2.1 acrescenta seletor "Tema" com "Sistema", "Claro", "Escuro"; controle de pausa mantém "Pausar animações"/"Retomar animações". Nenhuma troca de tema muda navegação ou foco. Fonte: Header/GraphicsProvider e D02/D07/D18. |
| T-15 | Dívida técnica: "Profissionais na equipe" (pessoas), "Custo médio mensal por profissional" (R$/mês), "Tempo total dedicado à manutenção" (%), "Parcela dessa manutenção atribuída à dívida técnica" (%); "Estimar custo", "Custo mensal estimado", "Projeção de 12 meses" | Preservar rótulos/unidades e a nota "Mantendo equipe, custo e percentuais informados." São as entradas/saídas do contrato, não medição do valor total da dívida. Fonte: TechDebtTool/F25. |
| T-16 | Dívida: "Algum valor foi declarado como zero. Isso não prova ausência de dívida técnica."; "Valide a alocação e identifique itens concretos de dívida. Esta estimativa não mede o valor total da dívida nem é economia garantida."; faltas/overflow | Preservar os avisos completos. Vazio/desconhecido não viram zero; não apagar ressalvas para encurtar copy. Fonte: TechDebtTool/F25. |
| T-17 | Migração: "Horizonte da comparação", "12 meses"/"36 meses", "Confirmar totais para {h} meses"; aviso "Os totais abaixo foram informados para {anterior} meses e não são convertidos nem multiplicados. Revise cada valor para {h} meses e confirme." | Preservar a revisão explícita e a mensagem completa. Fonte: MigrationTool/F29; nunca triplicar transição única. |
| T-18 | Migração: "Manter o ambiente atual em {h} meses", "Operar o cenário com migração em {h} meses", "Transição adicional (não incluída na operação)" e ajudas de totais/coexistência/custos únicos | Preservar textos/unidades R$ e ajuda completa sobre evitar dupla contagem. Botão "Comparar custos" e métricas "Manter o ambiente atual", "Migrar e operar (operação + transição)", "Diferença estimada" preservados. Fonte: MigrationTool/F29. |
| T-19 | Migração: "Migrar e operar custa {valor} a menos/a mais nas premissas informadas"; "Totais iguais nas premissas informadas"; "Comparação percentual indisponível: o custo de manter informado é zero."; "Percentual grande demais para calcular."; "Comparação aritmética dos totais informados; não é economia realizada nem recomendação." | Preservar todos os estados, negativos, razão indefinida e limites. Faltas/overflow mantêm mensagens compartilhadas. Fonte: MigrationTool/F29. |
| T-20 | Campos/resultado compartilhado: "Não sei", "Limpar respostas", "Preencha os campos e calcule para ver o resultado. Nada é enviado ou guardado.", "As respostas mudaram depois do último cálculo. O resultado anterior foi descartado: calcule de novo." | Preservar. O texto se refere ao cálculo local; o pedido de relatório é ação separada. Parser mantém suas mensagens específicas. Fonte: fields.tsx/F01–F29. |
| N-23 | NewsletterParts: "Edição demonstrativa — conteúdo para avaliação do design.", "Curadoria Root Trust", "Ler prévia: {título}", data e pilar | Preservar metadados/rótulos e abertura editorial completa com links. Não reescrever a abertura nem expor o corpo. Fonte: NewsletterParts/AGENTS/N05–N10. |
| F-22 | Verificação: "Conclua a verificação de segurança para liberar o envio.", "Verificação de segurança concluída. Você já pode enviar a solicitação.", estados de carregamento/expiração/timeout/falha e "Tentar novamente" | Preservar orientação e estados de challenge-state.ts; falha pede nova verificação, sem retry de POST automático. Não confundir essa verificação com selo institucional. Fonte: TurnstileWidget/PLAN4.4. |

---

## 11. Rastreio dos critérios da T1.2

| Critério (PLAN T1.2) | Onde está |
|---|---|
| Matriz 4.3 com antes/proposta/razão/fonte | §§1–9 (Home, 3 serviços, ferramentas, newsletter, confirmar/cancelar, formulários, 404/metadata, Privacidade) |
| Hero exato, métodos por pilar e Home geral, equilíbrio de Cibersegurança | C-01, C-02 (hero literal), C-15 a C-18, I-07 a I-10, S-05 a S-08 (4 etapas), H-19 a H-24 (5 etapas), C-07 a C-13 (equilíbrio, Pentest preservado) |
| FAQ, metadata, estados e Privacidade sem tocar e-mails, PDFs ou edições | C-21, N-04, N-12, §7, §9; D09 respeitada |
| Sem métricas, casos, certificações, horário de envio ou 24×7 humano | Cabeçalho, H-12, H-23, C-09, N-04, §10 |
