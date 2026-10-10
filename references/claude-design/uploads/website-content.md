# Páginas, navegação e redação do website

**Atualizado:** 05/10/2026. **Estado:** visual, textos e regras da Home do Claude Design aprovados; conteúdo e operação das demais páginas continuam propostas/requisitos futuros. A Home executável é um protótipo sem integrações reais. Este arquivo é a fonte canônica de rotas e copy; negócio está no [briefing](website-brief.md), comportamento nos [fluxos](website-flows.md), aparência na [especificação visual](website-design.md). Consulte o [contexto](README.md) e o [plano](../plans/contexto-website-v2-2026-10-03.md).

**Origem:** confirmações de produto, aprovação de `web/Home.dc.html` em 04/10/2026 e entrevista das ferramentas F01–F29 em 05/10. O export com moldura/laterais prevalece sobre A2 e prompts anteriores. `temp/Ferramentas` é inspiração histórica; o [briefing atual](tools-claude-design-brief.md) rege campos/modelos e detalha propostas de copy/ajuda. Marca oficial: [guia v2](../design/brand-design.md).

## Sitemap e navegação aprovados

| Página | Rota |
|---|---|
| Home | `/` |
| Cibersegurança | `/servicos/ciberseguranca` |
| Infraestrutura em nuvem | `/servicos/infraestrutura-em-nuvem` |
| Software | `/servicos/desenvolvimento-de-software` |
| Ferramentas | `/ferramentas` |
| ROSI | `/ferramentas/rosi` |
| Risco de Shadow AI | `/ferramentas/shadow-ai` |
| Dívida técnica | `/ferramentas/divida-tecnica` |
| Migração para nuvem | `/ferramentas/migracao-para-nuvem` |
| Newsletter | `/newsletter` |
| Arquivo de prévias | `/newsletter/edicoes` |
| Prévia de edição | `/newsletter/edicoes/[slug]` |
| Diagnóstico/contato | `/diagnostico` |
| Privacidade | `/privacidade` |

**Navegação implementada no export:** cabeçalho com assinatura, Serviços → `#servicos`, Ferramentas → `#ferramentas`, Newsletter → `#newsletter` e Solicitar diagnóstico → `#contato`; mobile mantém esses destinos. Rodapé tem Serviços, Ferramentas, Newsletter e Privacidade (`#` provisório). Não há páginas próprias, menu com destinos de serviços, tema ou contatos no cabeçalho/rodapé atual.

**Navegação futura:** manter o sitemap acima como escopo de páginas a desenvolver; não presumir novas telas já aprovadas. O rótulo do serviço no export é **Software**, associado à rota preservada `/servicos/desenvolvimento-de-software`. Contatos oficiais permanecem `contato@roottrust.com.br` e `11 94008-4692`. Não criar redes sociais fictícias. Claro/automático continuam decisões históricas não implementadas, cuja apresentação não deve ser inventada ao portar a Home escura.

As telas de confirmação, falha, cancelamento e reinscrição são estados dos fluxos, com destino técnico dependente do provedor. Não criar rotas de integração ou links de confirmação fictícios. A página 404 possui conteúdo próprio abaixo.

## Home — textos e composição aprovados

Fonte: [Home.dc.html](../../web/Home.dc.html), versão com moldura e laterais reativas, aprovada em 04/10/2026. Este bloco transcreve o export; não é o roteiro anterior A2/Eco. Conteúdo essencial e controles estão em HTML. ASCII e objetos são ilustrações, não resultado de avaliação real.

**Público:** lideranças e equipes de operações críticas. **Ação principal:** solicitar diagnóstico no formulário `#contato` da própria Home. Detalhes técnicos e lacunas em [design](website-design.md) e [fluxos](website-flows.md).

### 1. Hero

**Rótulo:** Tecnologia para operações críticas  
**H1:** Confiabilidade com profundidade.  
**Descrição:** Cibersegurança, infraestrutura em nuvem e software para operações críticas.  
**CTA:** Solicitar diagnóstico → `#contato`.

Texto/CTA à esquerda e Cadeia de confiança G4 em ASCII à direita; no mobile, grafismo abaixo do texto. Não acrescentar o complemento e o link secundário do antigo A2 como se constassem no export.

### 2. Princípios

**Rótulo:** Nossos princípios  
**H2:** Tecnologia que se explica. Presença que permanece.

| Princípio | Descrição | Na prática | Objeto |
|---|---|---|---|
| Clareza que traduz | Explicamos tecnologia em termos de negócio. Se não ficou claro para quem decide, a gente reescreve. | Relatórios em linguagem de negócio | Diamante |
| Presença que ampara | Ficamos por perto antes, durante e depois da entrega. Com firmeza e segurança, sem alarmismo. | Suporte próximo e contínuo | Cadeado |
| Profundidade que inspira confiança | Mostramos com precisão o que existe abaixo da superfície da sua operação, para decisões com base real. | Visibilidade do que está sob a superfície | Camadas |

Três cards com recorte em forma de documento e objetos Three.js hachurados. Setas levam a `#contato`, com rótulos “Falar sobre [princípio]”. Camadas é o default atual; Prumo/Âncora são alternativas no editor, sem nova escolha aprovada. Esses títulos são princípios editoriais da Home; não renomeiam os pilares oficiais de marca.

### 3. Serviços

**Rótulo:** Nossos serviços  
**H2:** Três frentes. Uma base.  
**Introdução:** Segurança, infraestrutura e software integrados para ambientes complexos, com foco em resiliência, continuidade e controle.

| Serviço | Resumo | Descrição | Quatro frentes | Objeto |
|---|---|---|---|---|
| Cibersegurança | A base que sustenta todo o resto | Cuidamos da proteção do que mantém sua operação em funcionamento, com monitoramento próximo e resposta rápida. | Diagnóstico de riscos; Identidade e acesso; Monitoramento contínuo; Resposta a incidentes | Chave |
| Infraestrutura em nuvem | Ambientes estáveis, escaláveis e sob controle | Planejamos, migramos e operamos ambientes em nuvem preparados para crescer sem surpresas de custo. | Arquitetura e migração; Ambientes escaláveis; Backup e continuidade; Custos sob controle | Servidores |
| Software | Sistemas que acompanham o seu negócio | Desenvolvemos e evoluímos sistemas sob medida, integrados às ferramentas que sua equipe já usa. | Sistemas sob medida; Integrações entre ferramentas; Automação de processos; Evolução contínua do código | Bloco modular |

No desktop, lista de três seleções e painel compartilhado; scroll mantém a seção fixada e avança o serviço. Clique seleciona a posição correspondente. No mobile, três cards completos empilhados. Não há links para as páginas dos serviços neste bloco do export; suas rotas permanecem previstas no sitemap. Não substituir esta apresentação pelos três cards independentes do plano anterior.

### 4. Processo

**Rótulo:** Como trabalhamos  
**H2:** Da análise à evolução.  
**Introdução:** Um processo claro, colaborativo e adaptado a cada realidade.

| Etapa | Resumo aprovado | Linhas do terminal aprovado |
|---|---|---|
| Diagnóstico | Entendemos o contexto e os principais desafios. | `> iniciando diagnóstico`<br>escuta com liderança e equipe técnica<br>levantamento do ambiente atual<br>entregável: mapa de riscos e prioridades<br>`[OK] contexto entendido` |
| Estratégia | Definimos o caminho com objetivos claros. | `> montando estratégia`<br>objetivos traduzidos em linguagem de negócio<br>prioridades por impacto e esforço<br>entregável: plano de ação aprovado com você<br>`[OK] caminho definido` |
| Implementação | Colocamos o plano em prática. | `> executando plano`<br>entregas em ciclos curtos<br>acompanhamento semanal com seu time<br>entregável: soluções em produção<br>`[OK] plano em prática` |
| Operação | Acompanhamos e garantimos estabilidade. | `> operação assistida`<br>monitoramento e suporte próximo<br>relatórios claros para quem decide<br>entregável: ambiente estável e documentado<br>`[OK] estabilidade garantida` |
| Evolução | Ajustamos e ampliamos conforme novos desafios. | `> revisando a base`<br>novos desafios, novas prioridades<br>ajustes contínuos na solução<br>entregável: próximos passos recomendados<br>`[OK] base pronta para crescer` |

**Ressalva visível:** As etapas podem variar conforme o escopo do projeto.

Desktop: lista vertical e terminal com digitação, seleção por clique/scroll e seção fixada durante o percurso. Mobile: cinco cards com todos os textos. Terminal representa o método; não executa diagnóstico nem comprova a entrega desses itens a um visitante. Conteúdo e regras acima foram aprovados, inclusive as expressões de estabilidade; não ampliá-los para promessa universal de contrato.

### 5. Públicos

**Rótulo:** Para quem lidera  
**H2:** Operações críticas pedem mais do que tecnologia.  
**Texto:** Ambientes regulados, empresas em crescimento e decisões de liderança exigem uma abordagem integrada, com visão técnica e clareza de negócio.  
**Fecho:** Ajudamos sua equipe a transformar complexidade em decisões confiáveis.

Faixa Verde Raiz com G2 Abrigo e texto editorial. Os quatro contextos de público anteriores continuam no briefing como contexto comercial; não são quatro linhas da Home atual.

### 6. Ferramentas

**Rótulo:** Ferramentas  
**H2:** Ferramentas para decidir.  
**Introdução:** Recursos práticos para avaliar, priorizar e avançar com mais segurança.

| Card | Texto aprovado | Objeto Three.js |
|---|---|---|
| ROSI | Avalie sua postura de segurança. | Balança |
| Shadow AI | Identifique e gerencie riscos de uso. | Olho |
| Dívida técnica | Entenda os riscos no seu código e infraestrutura. | Engrenagem com dentes ausentes |
| Migração para nuvem | Analise cenários e oportunidades. | Nuvem com seta |

**Texto de jornada:** Resultado inicial sem cadastro.

Todos os cards usam `href="#contato"` no export: destino provisório, sem ferramenta implementada. As rotas previstas serão conectadas quando as páginas forem desenvolvidas. Os ícones não calculam; copy/objeto da Home não definem o modelo. Escopo/modelos agora foram escolhidos em F01–F29 no [briefing das ferramentas](tools-claude-design-brief.md), sem promover o histórico a especificação. Pausa, fallback e movimento reduzido completo são requisitos ainda não atendidos pelo export.

### 7. Newsletter

**Rótulo:** Conteúdo  
**H2:** Análise em dias úteis.  
**Descrição:** Insights práticos sobre segurança, nuvem, software e tecnologia para operações críticas.  
**Campo:** Seu e-mail. **Nome acessível do botão:** Assinar.  
**Link:** Ver edições anteriores → `#` no export; `/newsletter/edicoes` continua destino previsto.  
**Sucesso aprovado:** Inscrição confirmada. A próxima edição chega no próximo dia útil.

Símbolo ASCII à esquerda e composição editorial com formulário. O handler valida e-mail e mostra sucesso local; não confirma endereço, cadastra ou envia edição. O arquivo de edições não existe no export. Os requisitos de operação, confirmação e entrega histórica permanecem nos fluxos futuros; implementar estados intermediários reais antes de usar o sucesso aprovado em produção. Não acrescentar uma notícia fictícia nem substituir o design atual pelo antigo Eco.

### 8. CTA final

**Rótulo:** Próximo passo  
**H2:** Vamos cuidar da sua base.  
**Descrição:** Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp.  
**Campos obrigatórios:** Nome; Empresa; WhatsApp.  
**Placeholders:** Como podemos te chamar; Nome da empresa; (00) 00000-0000.  
**Botão:** Solicitar diagnóstico.  
**Erros:** Informe seu nome. / Informe a empresa. / Informe um número com DDD.  
**Sucesso aprovado:** Diagnóstico solicitado. A gente retorna por ligação ou WhatsApp no próximo dia útil.

Formulário à esquerda, símbolo ASCII à direita e fundo Verde Raiz. Sem campo de e-mail, assunto, mensagem ou seleção de canal. O handler apenas valida e altera estado local; não encaminha solicitação. O prazo aprovado precisa ser cumprido pela operação futura.

### 9. Rodapé

Assinatura negativa, slogan **“A base que sustenta o crescimento!”**, links Serviços/Ferramentas/Newsletter e Privacidade, copyright **“© 2026 Root Trust. Todos os direitos reservados.”**. Privacidade usa `#` provisório. Não há controle de tema nem contatos exibidos neste rodapé; os contatos oficiais permanecem disponíveis como requisitos para os demais fluxos.

## Serviços — páginas completas

**Estado:** páginas não exportadas; redação abaixo é proposta complementar recuperada, a reconciliar com o catálogo aprovado da Home antes de gerar telas. Não substituir a Home para acomodar esta proposta.

**Estrutura editorial das três páginas:** hero → quando é útil → quatro frentes → método → conexão com os demais pilares → ferramenta relacionada → FAQ → CTA. Redação para revisão, sem definir preços, entregáveis ou SLA. Em cada bloco de método, reutilizar a tabela das cinco etapas de [Home — Processo](#4-processo), incluindo a ressalva visível e os mesmos textos. A integração dos pilares não obriga contratar os três.

### Cibersegurança

**H1:** Cibersegurança conectada à sua operação.  
**Descrição:** Entenda riscos, organize prioridades e fortaleça os controles que apoiam a continuidade do negócio. Atuamos com uma visão integrada de infraestrutura, software e segurança.  
**CTA:** Solicitar diagnóstico → `/diagnostico`.

**H2: Quando a segurança precisa de uma visão do conjunto**  
Operações críticas, requisitos de controle e mudanças na tecnologia pedem clareza sobre os riscos. A cibersegurança é útil quando sua organização precisa avaliar vulnerabilidades, priorizar controles ou organizar monitoramento e resposta dentro de um escopo definido.

**H2: Frentes de atuação**

- **Pentest e Red Team:** avaliar a segurança por meio de testes e exercícios cujo objetivo, autorização e limites são definidos no escopo.
- **Gestão de vulnerabilidades:** identificar e priorizar vulnerabilidades considerando o contexto e os riscos da operação.
- **Monitoramento e resposta a incidentes:** acompanhar sinais relevantes e apoiar o tratamento de incidentes conforme a operação contratada.
- **Normas e compliance:** apoiar a adequação aos requisitos e controles aplicáveis ao contexto da organização.

**H2: Do risco à prioridade**  
A segurança deve participar das escolhas desde a concepção. Relacionamos necessidades técnicas ao impacto no negócio para orientar o que precisa de atenção primeiro.

**Nota editorial do método:** inserir aqui as cinco etapas e a ressalva do bloco compartilhado de Processo; não acrescentar entregáveis ou prazos.

**H2: Segurança, infraestrutura e software conectados**  
Os controles precisam considerar os ambientes e as aplicações que fazem a operação funcionar. Uma visão integrada relaciona a proteção aos caminhos de infraestrutura e às decisões de desenvolvimento.  
**Links:** Conhecer Infraestrutura em nuvem → `/servicos/infraestrutura-em-nuvem`; Conhecer Software → `/servicos/desenvolvimento-de-software`.

**H2: Explore as premissas antes de decidir**  
Conheça o tema de ROSI para entender quais informações sustentam uma avaliação de retorno do investimento em segurança.  
**Link:** Conhecer ROSI → `/ferramentas/rosi`.  
O uso de IA fora dos controles definidos também envolve proteção e governança, em conexão com o software.  
**Link complementar:** Conhecer Risco de Shadow AI → `/ferramentas/shadow-ai`.  
**Nota editorial:** usar “Conhecer” enquanto os modelos estiverem em validação; não anunciar resultado disponível. Shadow AI é transversal a segurança e software, não exclusivo deste pilar.

**H2: Perguntas frequentes**

**O primeiro contato já é um teste de segurança?**  
Não. “Solicitar diagnóstico” inicia uma conversa gratuita de qualificação. Uma avaliação técnica exige definição de escopo e autorização.

**Existe monitoramento 24×7?**  
O monitoramento automático contínuo está disponível conforme contrato. Disponibilidade de equipe e condições de resposta são definidas separadamente no escopo contratado.

**A Root Trust garante certificação ou ausência de incidentes?**  
A atuação apoia controles e adequação aos requisitos aplicáveis. Objetivos e limites são definidos no escopo; a avaliação não elimina todos os riscos nem garante uma certificação.

**CTA final:** Entenda quais prioridades fazem sentido para o seu contexto. Solicitar diagnóstico → `/diagnostico`.

### Infraestrutura em nuvem

**H1:** Uma base integrada para sua infraestrutura.  
**Descrição:** Conecte ambientes locais, nuvem, redes e operação com uma visão de capacidade, continuidade e evolução. O caminho parte das necessidades do seu negócio e das condições de cada ambiente.  
**CTA:** Solicitar diagnóstico → `/diagnostico`.

**H2: Quando a base precisa acompanhar a operação**  
Crescimento, dependências entre sistemas e mudanças de capacidade exigem olhar para a infraestrutura como um conjunto. Essa frente é útil quando sua organização precisa organizar ambientes locais e nuvem, revisar conectividade ou estruturar o acompanhamento da operação.

**H2: Frentes de atuação**

- **Ambientes locais, em nuvem e híbridos:** organizar a infraestrutura considerando sistemas, dependências e necessidades de operação.
- **Redes corporativas de alta disponibilidade:** trabalhar a conectividade e a arquitetura conforme os requisitos acordados.
- **Monitoramento e suporte contínuo:** acompanhar e apoiar os ambientes incluídos na operação contratada.
- **Escalabilidade sob demanda:** planejar ajustes de capacidade conforme a necessidade e as condições da solução.

**H2: Continuidade começa pela base**  
Entendemos o cenário para relacionar capacidade, dependências e prioridades do negócio. As escolhas de infraestrutura consideram a operação atual e o caminho de evolução.

**Nota editorial do método:** inserir aqui as cinco etapas e a ressalva do bloco compartilhado de Processo; não acrescentar entregáveis ou prazos.

**H2: Uma base para aplicações e proteção**  
A infraestrutura sustenta os sistemas e fluxos do negócio. Sua evolução precisa considerar tanto as necessidades do software quanto os controles de cibersegurança, com visão das dependências entre as três frentes.  
**Links:** Conhecer Software → `/servicos/desenvolvimento-de-software`; Conhecer Cibersegurança → `/servicos/ciberseguranca`.

**H2: Organize as premissas de uma migração**  
Antes de comparar cenários, é preciso considerar custos, dependências e condições de operação. Conheça os temas que orientam uma avaliação inicial de migração para nuvem.  
**Link:** Conhecer Migração para nuvem → `/ferramentas/migracao-para-nuvem`.  
**Nota editorial:** não prometer economia ou cálculo disponível enquanto o modelo não estiver validado.

**H2: Perguntas frequentes**

**O serviço inclui ambientes locais?**  
Sim. A atuação cobre ambientes locais, em nuvem, híbridos e redes corporativas.

**Migrar para a nuvem é sempre o objetivo?**  
A avaliação do cenário e das necessidades orienta as opções. Custos, dependências e condições de operação precisam ser considerados antes de escolher o caminho.

**Qual é a disponibilidade ou o prazo de atendimento?**  
Disponibilidade, cobertura e prazos de atendimento são definidos conforme o escopo e as condições do contrato.

**CTA final:** Converse sobre a base que sua operação precisa. Solicitar diagnóstico → `/diagnostico`.

### Software — desenvolvimento de software

**H1:** Software para conectar e evoluir sua operação.  
**Descrição:** Aplicações, integrações e modernização de sistemas alinhadas aos desafios do negócio, com segurança desde a concepção e atenção à evolução.  
**CTA:** Solicitar diagnóstico → `/diagnostico`.

**H2: Quando sistemas e processos precisam evoluir**  
Novas necessidades, processos desconectados e limitações em sistemas existentes podem exigir mudanças no software. Essa frente é útil para desenvolver aplicações, integrar a operação ou avaliar como modernizar uma base já em uso.

**H2: Frentes de atuação**

- **Aplicações web e mobile:** desenvolver soluções para os processos e necessidades definidos no projeto.
- **Integrações e automação:** conectar sistemas e organizar fluxos que apoiam a operação.
- **Modernização de legados:** avaliar e evoluir sistemas existentes conforme prioridades e restrições.
- **Suporte e evolução contínua:** acompanhar e aprimorar soluções dentro do escopo contratado.

**H2: Evoluir sem perder o contexto**  
Relacionamos as necessidades do negócio às dependências e limitações técnicas. O trabalho considera a base existente e as prioridades acordadas para orientar a evolução.

**Nota editorial do método:** inserir aqui as cinco etapas e a ressalva do bloco compartilhado de Processo; não acrescentar entregáveis ou prazos.

**H2: Software apoiado por infraestrutura e segurança**  
Aplicações dependem dos ambientes em que operam e dos controles que protegem seus dados e fluxos. Por isso, desenvolvimento, infraestrutura e cibersegurança precisam conversar desde a concepção e durante a evolução.  
**Links:** Conhecer Infraestrutura em nuvem → `/servicos/infraestrutura-em-nuvem`; Conhecer Cibersegurança → `/servicos/ciberseguranca`.

**H2: Entenda as premissas da evolução**  
Conheça o tema de dívida técnica para distinguir manutenção, limitações e custos atribuíveis à evolução do software.  
**Link:** Conhecer Dívida técnica → `/ferramentas/divida-tecnica`.  
A governança de IA também atravessa software e cibersegurança quando o uso acontece fora dos controles da organização.  
**Link complementar:** Conhecer Risco de Shadow AI → `/ferramentas/shadow-ai`.  
**Nota editorial:** não anunciar cálculo ou avaliação disponível sem modelo validado. Shadow AI é transversal, sem destino exclusivo em um serviço.

**H2: Perguntas frequentes**

**Vocês desenvolvem aplicações web e mobile?**  
Sim. Desenvolvemos aplicações web e mobile conforme as necessidades do projeto. Tecnologia e entregáveis são definidos no escopo.

**Um sistema legado precisa ser substituído por inteiro?**  
A avaliação do cenário orienta as opções de modernização, considerando dependências, restrições e prioridades do negócio.

**O projeto inclui acompanhamento depois da entrega?**  
Suporte e evolução estão disponíveis conforme contratação. As condições de acompanhamento são definidas no escopo.

**CTA final:** Vamos conversar sobre o próximo passo do seu software. Solicitar diagnóstico → `/diagnostico`.

## Hub e quatro ferramentas

### Hub — /ferramentas

**H1:** Ferramentas para explorar sua base tecnológica.  
**Descrição:** Recursos para organizar perguntas sobre segurança, software e infraestrutura. Conheça as premissas, os limites e o tema de cada experiência antes de interpretar um resultado.  
**H2:** Escolha o tema da sua decisão. Use os quatro cards da Home, acrescentando a relação com o contexto: ROSI → investimento em segurança; Shadow AI → uso e governança de IA; dívida técnica → manutenção e evolução; migração → cenários de infraestrutura.  
**H2:** Como funciona. “Responda à ferramenta, consulte o resumo sem cadastro e, se desejar, peça o relatório padrão do tema por e-mail.” Escopo/modelos escolhidos em F01–F29; publicação exige implementação/revisão, e envio exige serviço real. No protótipo, cálculo local disponível e envio indisponível identificado.  
**H2:** Como usamos os dados. “As respostas são utilizadas no navegador para produzir o resultado e descartadas após a sessão. Elas não são associadas ao e-mail informado para receber o relatório. A inscrição na newsletter é uma escolha separada.”  
**CTA secundário:** Quer conversar sobre o seu cenário? Solicitar diagnóstico.

### Copy específica das ferramentas — proposta para revisão

Escopo/modelos escolhidos em F01–F29. Todas usam formulário/checklist em uma página e resultado compacto abaixo; etapas de F02 foram substituídas. Redação e composição ainda exigem aprovação própria no protótipo. As perguntas/ajudas/ações e exemplos completos estão no [briefing para Claude Design](tools-claude-design-brief.md); essa especificação rege o modelo e não altera a copy aprovada da Home.

| Rota | H1 | Introdução | Pergunta que orienta a experiência |
|---|---|---|---|
| ROSI | Explore o retorno de uma proteção adicional. | Simule um cenário nos primeiros 12 meses, com suas estimativas de perdas, custos e redução esperada. | Qual retorno ou redução necessária estas hipóteses indicam? |
| Shadow AI | Organize a governança do uso de IA. | Responda a cinco perguntas para identificar práticas declaradas, lacunas e informações a confirmar. | O que foi declarado e o que precisa ser melhorado ou confirmado? |
| Dívida técnica | Estime o custo do tempo atribuído à dívida técnica. | Relacione equipe, custo e esforço de manutenção. A estimativa não mede o valor total da dívida. | Qual parcela aproximada do custo de pessoal é alocada a esse esforço? |
| Migração para nuvem | Compare os custos de manter ou migrar. | Informe totais comparáveis de operação e transição. Migrar pode custar mais. | Qual diferença os totais comparáveis informados indicam? |

**Seções propostas:** introdução curta com ícone contido → formulário/checklist → resultado aberto → método/limites acessíveis → relatório padrão opcional → diagnóstico. Método e auxiliares recolhidos por padrão, com limites essenciais junto ao resultado. HTML para conteúdo/controles; mobile empilhado. Não exigir leitura longa ou cadastro antes de usar.

| Ferramenta | Campos escolhidos | Resultado |
|---|---|---|
| ROSI | Cenário + prejuízo, frequência, custo adicional de 12 meses, prazo até efetividade, redução esperada/Não sei; auxiliares opcionais | ROSI/benefício líquido e equilíbrio quando calculáveis, sob hipóteses explícitas; desconhecidos sem preenchimento automático |
| Shadow AI | Cinco temas com Sim/Parcialmente/Não/Não sei: regras, visibilidade, dados, fornecedores, orientação | Lista compacta de prática declarada/ação/confirmação, sem score ou faixa de risco |
| Dívida técnica | Profissionais, custo médio mensal, tempo em manutenção, parcela da manutenção atribuída à dívida | Custo mensal aproximado e projeção de 12 meses com premissas constantes; não economia ou valor total da dívida |
| Migração | Horizonte 12/36 meses, padrão 12; totais para manter, operar cenário migrado e transição adicional | Totais comparados, diferença em moeda e percentual com base positiva; sem payback ou promessa de economia |

**Protótipo:** “Protótipo — cálculos locais; formulários de envio indisponíveis.” Usar cálculos/regras reais locais conforme briefing, entradas inicialmente vazias e exemplos financeiros fictícios separados. Se um estado for somente estático, identificá-lo como interface sem cálculo. Não usar números fixos como resultado das respostas nem anunciar publicação/integração prontas. Propostas monetárias em R$/pt-BR aguardam revisão.

**Relatório padrão:** título “Receba o relatório de [tema]”; descrição “Um material padrão sobre o tema, seus conceitos e próximos passos gerais. Não é personalizado a partir das suas respostas.” Campo “Seu e-mail”; ação “Receber relatório”. Nota: “Este pedido não inscreve você na newsletter.” O nome [tema] vem da ferramenta, não de dados do visitante.

**FAQ comum:** “Preciso me cadastrar para ver o resultado?” — “Não. A jornada prevista mostra o resumo antes de qualquer pedido de e-mail.” “O relatório é personalizado?” — “Não. É um relatório padrão do tema.” “Esta ferramenta substitui uma avaliação técnica?” — “Não. Resultados dependem de dados e premissas e não substituem avaliação do contexto.” Sem modelo liberado, contextualizar as respostas como jornada prevista.

## Newsletter e arquivo

### Newsletter — /newsletter

**H1:** Análise da Root Trust em dias úteis.  
**Descrição:** Cibersegurança, infraestrutura em nuvem e software para decisões sobre operações críticas. Um tema central por edição, análise própria, implicações práticas e links para as fontes.  
**H2:** Leia uma prévia. Receba a edição completa.  
**Texto:** As prévias públicas ajudam você a conhecer a curadoria. A inscrição entrega o conteúdo completo por e-mail, após confirmação do endereço, e os próximos envios em dias úteis.  
**H2:** Como a curadoria é preparada. A IA apoia pesquisa e rascunho. Uma pessoa revisa texto, fontes e afirmações antes de aprovar cada edição.  
**H2:** Receba as edições completas. Campo “Seu e-mail”; botão “Receber edições completas”; nota “Confirme seu endereço para começar. A inscrição é independente dos relatórios das ferramentas. Você pode cancelar os próximos envios.” Link “Ver prévias anteriores”.

**FAQ:** “Com que frequência recebo?” — “Em dias úteis.” “Posso ler tudo no site?” — “O site publica prévias substanciais. O texto completo é enviado por e-mail.” “O que recebo ao me inscrever por esta página?” — “Após confirmar o endereço, a edição aprovada mais recente, quando disponível, e os próximos envios.” “Como cancelo?” — “Pelo caminho de cancelamento indicado nos e-mails, quando o serviço de envio estiver operacional.”

### Arquivo — /newsletter/edicoes

**H1:** Prévias das edições.  
**Descrição:** Conheça os temas, a análise e as fontes da curadoria da Root Trust. Escolha uma prévia para receber aquela edição completa por e-mail.  
**Cards:** data de publicação, título, pilar relacionado, resumo público e “Ler prévia”. Os valores vêm de edições aprovadas; não criar histórias/data fictícias.  
**Vazio:** “Ainda não há edições publicadas. Volte para conhecer as próximas prévias.”  
**CTA:** Conhecer a newsletter → `/newsletter`.

### Prévia — /newsletter/edicoes/[slug]

**H1:** título da edição aprovada. Exibir data e pilar, contexto do tema, principais pontos, implicação prática e links para as fontes. A prévia tem valor próprio e não consiste só em um título bloqueado.  
**H2:** Receba esta edição completa.  
**Texto:** Confirme seu e-mail para receber esta edição completa e os próximos envios em dias úteis.  
**Campo:** Seu e-mail. **Ação:** Receber esta edição completa.  
**Nota:** Você pode cancelar os próximos envios. O pedido de relatório de uma ferramenta não faz esta inscrição.  
**Links:** Voltar às prévias; Conhecer a newsletter. Edição inexistente usa 404. Título e texto editorial são dados aprovados pelo revisor humano, não copy para completar automaticamente.

### Modelos de e-mail e relatório

Os modelos abaixo são copy para revisão. Variáveis representam dados reais aprovados; sem integração, estados são simulação identificada e nenhuma mensagem é enviada.

- **Confirmação da newsletter:** assunto “Confirme seu e-mail para receber a newsletter da Root Trust”. Corpo “Você solicitou as edições completas da Root Trust em dias úteis. Confirme seu endereço para começar a receber.” Botão “Confirmar meu e-mail”. Complemento “Se você não fez este pedido, ignore esta mensagem.” Não inserir prazo de validade sem decisão do provedor.
- **Entrega de edição:** assunto igual ao título aprovado. Corpo: tema/contexto → análise própria → implicação prática → fontes → links relacionados. A edição completa deve existir e ter revisão humana. Rodapé: “Você recebe este e-mail porque confirmou sua inscrição na newsletter da Root Trust.” Ação de cancelamento e informação legal dependem da operação aprovada.
- **Entrega de relatório:** assunto “Seu relatório de [tema] — Root Trust”. Corpo “Aqui está o relatório padrão de [tema] que você solicitou. O material apresenta conceitos e próximos passos gerais; não foi personalizado a partir das suas respostas.” Ação “Acessar relatório”, somente se material e destino reais estiverem disponíveis. Complemento “Quer conversar sobre seu cenário? Solicitar diagnóstico.” Sem inscrição automática na newsletter.
- **Conteúdo do relatório padrão por tema:** introdução específica da ferramenta → conceitos → método validado explicado → premissas e limites → próximos passos gerais → fontes → convite ao diagnóstico. Fórmulas, faixas, exemplos e texto do material dependem de validação própria; este esquema não permite gerar um relatório técnico definitivo.

## Diagnóstico — /diagnostico

Rota prevista, ainda não exportada. O formulário aprovado da Home é a base das regras comerciais desta jornada; a apresentação da página dedicada permanece proposta.

**H1 proposto:** Vamos conversar sobre a sua operação.  
**Descrição proposta:** Solicite uma conversa inicial gratuita de qualificação. Entendemos seu contexto para identificar o próximo passo; essa etapa não promete auditoria técnica nem relatório.  
**Campos aprovados:** Nome, Empresa e WhatsApp, todos obrigatórios. Sem seleção de canal ou e-mail adicional por padrão.  
**Ação:** Solicitar diagnóstico.  
**Sucesso aprovado, após recebimento real:** Diagnóstico solicitado. A gente retorna por ligação ou WhatsApp no próximo dia útil.  
**Finalidade proposta:** Usaremos os dados informados para atender à sua solicitação por ligação ou WhatsApp. Consulte a Privacidade. Revisão de finalidade/retenção continua necessária; não inventar base legal ou consentimento obrigatório.  
**Falha proposta:** Não foi possível enviar sua solicitação. Tente novamente ou fale com a Root Trust por outro canal. Preservar campos e oferecer contatos oficiais.  
**FAQ proposta:** “A primeira conversa é gratuita?” — “Sim, a conversa inicial de qualificação não tem cobrança.” “Já recebo uma auditoria?” — “Não. Uma avaliação técnica tem escopo definido separadamente.” “Por qual canal recebo retorno?” — “Ligação ou WhatsApp, no próximo dia útil.”

A simulação local do export não é recebimento real. Envio, atendimento, proteção contra abuso e privacidade precisam estar operacionais para cumprir a mensagem aprovada.

## Privacidade — /privacidade

**H1:** Privacidade e uso de dados. **Introdução para protótipo:** “Este espaço apresentará como a Root Trust trata os dados nas jornadas do website.” **Estado:** “Conteúdo de privacidade em preparação para revisão.” A página não é uma política válida para lançamento enquanto informações legais/operacionais faltarem.

Estrutura editorial: identificação do responsável/controlador → finalidades por diagnóstico, relatório e newsletter → dados envolvidos → operadores/terceiros → retenção → direitos e atendimento → segurança e contato → atualização da política. Diagnóstico usa os campos aprovados; relatório usa e-mail sem respostas da ferramenta; newsletter exige finalidade separada. Não inventar CNPJ, encarregado, base legal, prazo, fornecedor, cookie ou fluxo de exclusão. `contato@roottrust.com.br` é canal oficial comercial, não deve ser automaticamente anunciado como encarregado ou canal de direitos sem validação. Nenhum banner de cookies ou texto de consentimento é exigido sem avaliar a tecnologia real.

## Estados de suporte e metadados

**404:** H1 “Página não encontrada.” Texto “O endereço pode estar incorreto ou a página pode não estar disponível.” Ações “Voltar à Home” e “Conhecer os serviços” (menu ou links das três páginas).  
**Erro de carregamento:** “Não foi possível carregar este conteúdo. Tente novamente.”  
**Sem integração:** “Demonstração do formulário. Nenhum dado será enviado.”  
**Demais estados:** copy de campo inválido, envio, cancelamento e confirmação em [fluxos](website-flows.md).

| Página | Título para busca | Descrição para busca proposta |
|---|---|---|
| Home | Root Trust — Confiabilidade com profundidade | Cibersegurança, infraestrutura em nuvem e desenvolvimento de software para operações críticas. Conheça a Root Trust e solicite uma conversa inicial. |
| Cibersegurança | Cibersegurança — Root Trust | Conheça as frentes de cibersegurança da Root Trust: testes, vulnerabilidades, monitoramento e compliance conforme o contexto e o escopo. |
| Infraestrutura | Infraestrutura em nuvem — Root Trust | Ambientes locais, em nuvem e híbridos, redes e operação. Conheça a atuação da Root Trust e converse sobre sua infraestrutura. |
| Software | Desenvolvimento de software — Root Trust | Aplicações web e mobile, integrações, modernização de legados e evolução de software. Conheça a atuação da Root Trust. |
| Hub | Ferramentas — Root Trust | Explore os temas de ROSI, Shadow AI, dívida técnica e migração para nuvem, com atenção a métodos, premissas e limites. |
| ROSI | ROSI e investimento em segurança — Root Trust | Conheça as premissas de uma estimativa de retorno de investimento em segurança e os limites de uma avaliação inicial. |
| Shadow AI | Risco de Shadow AI — Root Trust | Explore cinco temas de governança do uso de IA, com práticas declaradas, lacunas e informações a confirmar, sem score de risco. |
| Dívida técnica | Dívida técnica — Root Trust | Explore a relação entre manutenção, dívida técnica e evolução de software, considerando premissas e limites de estimativa. |
| Migração | Migração para nuvem — Root Trust | Conheça as premissas necessárias para comparar custos e cenários de uma migração para nuvem, sem promessas de economia. |
| Newsletter | Newsletter — Root Trust | Análise sobre cibersegurança, nuvem e software em dias úteis. Leia prévias públicas e receba as edições completas por e-mail. |
| Arquivo | Prévias da newsletter — Root Trust | Navegue pelas prévias aprovadas da newsletter da Root Trust e conheça temas, análises e fontes. |
| Prévia | Título aprovado da edição + “— Root Trust” | Resumo público aprovado da edição; não usar trecho exclusivo enviado por e-mail como descrição. |
| Diagnóstico | Solicitar diagnóstico — Root Trust | Solicite uma conversa inicial gratuita de qualificação sobre sua operação. Retorno por ligação ou WhatsApp no próximo dia útil. |
| Privacidade | Privacidade — Root Trust | Informações sobre o uso de dados nas jornadas do website, disponíveis após revisão da política. |
| 404 | Página não encontrada — Root Trust | O endereço solicitado não foi encontrado. |

Metadados são redação para revisão, sem domínio/canonical, imagem social, datas, FAQ estruturado ou autor inventados. Conteúdo de prévias deriva de edição aprovada. Experiências demonstrativas, relatórios provisórios e privacidade incompleta ficam identificados no protótipo e não podem parecer serviços publicados.

## Revisão editorial e passagem

Registrar responsável/data de aprovação por página antes de publicação. Conferir oferta, CTA/destino, FAQ, metadados, estados e ativos; nenhum caso, métrica, SLA ou certificado fictício. Copy em desktop/mobile é equivalente; ASCII e objetos não substituem texto essencial. A aprovação da Home em 04/10/2026 já contempla seus textos/regras; as demais páginas exigem aprovação própria. O [plano](../plans/contexto-website-v2-2026-10-03.md) separa conclusão da documentação e liberações futuras: validar modelo de ferramenta, integração, operação e jurídico continua necessário mesmo após o frontend estar prototipado.
