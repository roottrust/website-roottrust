# Produto, conteúdo e jornadas

**Atualizado:** 11/10/2026. A Home (export) foi aprovada em 04/10. Os 12 exports aprovados (Home, três serviços, quatro ferramentas, três páginas de newsletter e 404) estão preservados em `references/claude-design/`; a auditoria de 09/10 está em `references/audits/`. F01–F29, S01–S16 e N01–N11 regem suas jornadas. A aprovação dos exports define a referência visual/conteúdo; não comprova cálculo auditado, integração ou operação. Marca oficial: [docs/design](../design/README.md).

## Estado da entrega

Frontend local implementado e validado em 11/10/2026. A Home nativa recebeu aprovação humana em 10/10; o aceite final do conjunto permanece pendente. Gates finais atuais (P8.3, retries 0): lint, typecheck, 107 testes unitários, build de produção e 284 E2E aprovados, com 6 skips explicitados na [auditoria final](../../references/audits/final-qa.md); 101 unit/228 E2E/quatro skips são histórico. Não há integração operacional nem autorização de publicação. Slugs bem formados inexistentes retornam HTTP 404 antes de streaming. Encoding UTF-8 malformado pode retornar 500 no decodificador do Next antes da aplicação; limitação registrada para revisão antes da publicação.

## Público e posicionamento

A Root Trust atende lideranças e equipes de operações críticas. Outros contextos confirmados incluem ambientes regulados, empresas em crescimento sem equipe interna dedicada e lideranças que tratam tecnologia como decisão estratégica. Não são segmentos exclusivos; setores, porte e critérios de compra não estão definidos. A linguagem traduz engenharia para impacto de negócio, com precisão e sem alarmismo.

Abordagens conceituais confirmadas: segurança desde a concepção; visão integrada; soluções sob medida; tradução técnico-executiva; acompanhamento contínuo; priorização por risco; equipes integradas; continuidade e resiliência. Explicam a forma de trabalhar e não prometem ausência de falhas ou resultados universais. Os pilares oficiais da marca (Confiança, Humanização e Tecnologia sob medida) são distintos dos três serviços.

## Contrato comum de serviços

A decisão aprovada S01–S16 estabelece seis seções por serviço: abertura/CTA, situações, quatro frentes, método, FAQ e CTA/formulário final. S16 remove a seção e os links promocionais para ferramentas. S02 autoriza a Home escura com efeitos contidos, moldura e um objeto existente na abertura: chave, servidores ou módulos. S03 exige Nome, Empresa e WhatsApp, conversa inicial gratuita de qualificação e retorno por ligação ou WhatsApp no próximo dia útil. Retorno é promessa futura condicionada a recebimento real; o formulário demo nunca envia dados. Os blocos abaixo rotulados como proposta preservam o histórico editorial; os 12 exports aprovados e os contratos S/F/N orientam a implementação atual, sem criar aprovação comercial para alegações novas.
## Rotas desta entrega

| Página | Rota |
|---|---|
| Home | `/` |
| Cibersegurança | `/servicos/ciberseguranca` |
| Infraestrutura em nuvem | `/servicos/infraestrutura-em-nuvem` |
| Software | `/servicos/desenvolvimento-de-software` |
| ROSI | `/ferramentas/rosi` |
| Shadow AI | `/ferramentas/shadow-ai` |
| Dívida técnica | `/ferramentas/divida-tecnica` |
| Migração para nuvem | `/ferramentas/migracao-para-nuvem` |
| Newsletter | `/newsletter` |
| Arquivo de prévias | `/newsletter/edicoes` |
| Prévia de edição | `/newsletter/edicoes/[slug]` |
| Privacidade provisória | `/privacidade` |
| 404 | Página não encontrada, com resposta HTTP 404 na aplicação |

O hub de ferramentas e a página dedicada de diagnóstico estão adiados e não fazem parte destas rotas. A Home e cada página de serviço oferecem o formulário de contato local `#contato`. A navegação global mantém os destinos aprovados da Home; a portabilidade Next e a revisão técnica local estão concluídas; o aceite humano final segue pendente.

## Home — textos e composição aprovados

Fonte: [Home.dc.html](../../references/claude-design/Home.dc.html), versão com moldura e laterais reativas, aprovada em 04/10/2026. Este bloco transcreve o export; não é o roteiro anterior A2/Eco. Conteúdo essencial e controles estão em HTML. ASCII e objetos são ilustrações, não resultado de avaliação real.

**Público:** lideranças e equipes de operações críticas. **Ação principal:** solicitar diagnóstico no formulário `#contato` da própria Home. Detalhes técnicos e lacunas em [design](design.md) e [fluxos](product.md).

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

No desktop, lista de três seleções e painel compartilhado; scroll mantém a seção fixada e avança o serviço. Clique seleciona a posição correspondente. No mobile, três cards completos empilhados. Não há links para as páginas dos serviços neste bloco do export; suas rotas permanecem previstas no sitemap. Os exports dos três serviços estão preservados para portabilidade; não substituir esta apresentação pelos três cards independentes do estudo histórico.

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

Todos os cards usam `href="#contato"` na Home analisada: destino provisório. Os quatro exports de ferramentas estão em `references/claude-design/`, mas sua navegação/cálculos ainda precisam de revisão; a presença dos arquivos não comprova rotas de produção ou integração. Ícones não calculam; copy/objeto da Home não definem o modelo. O contrato é F01–F29 no [briefing](tools.md). Pausa, fallback e movimento reduzido completo continuam requisitos da portabilidade.

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

**Estado atual:** há exports das três páginas de serviço entre os 12 arquivos preservados e auditados em 09/10. O escopo de negócio é aprovado; copy específica e composição dessas internas continuam propostas para revisão humana.

**Estrutura final S01 + S16:** abertura/CTA → situações em que o serviço ajuda → quatro frentes → como trabalhamos → FAQ → CTA/formulário final. S16 remove ferramentas; não acrescentar seção ou links promocionais para elas. Integração entre pilares pode aparecer no texto sem exigir contratar os três.

**Comum S02–S03:** Home escura com efeitos contidos; objeto existente do serviço no hero; HTML para conteúdo essencial; Nome, Empresa e WhatsApp obrigatórios no formulário local `#contato`. Conversa inicial gratuita de qualificação e retorno por ligação ou WhatsApp no próximo dia útil. Não usar `/diagnostico` como destino nesta fase nem apresentar demonstração como envio real.

| Página e conteúdo proposto abaixo | Quatro frentes da Home | Destaque confirmado |
|---|---|---|
| [Cibersegurança](product.md#conteúdo-proposto--cibersegurança) | Diagnóstico de riscos; Identidade e acesso; Monitoramento contínuo; Resposta a incidentes | Pentest em web, APIs, redes, infraestrutura e mobile. Relatório técnico/evidências/impacto, resumo executivo e recomendações priorizadas. Reteste conforme contrato. |
| [Infraestrutura em nuvem](product.md#conteúdo-proposto--infraestrutura-em-nuvem) | Arquitetura e migração; Ambientes escaláveis; Backup e continuidade; Custos sob controle | Continuidade e custos; ambientes locais/nuvem/híbridos e redes. Consumo/ociosidade/capacidade; arquitetura, configuração, backup/testes e ajustes conforme escopo. |
| [Software](product.md#conteúdo-proposto--software) | Sistemas sob medida; Integrações entre ferramentas; Automação de processos; Evolução contínua do código | Aplicações web/mobile, conexão e automação; legados no catálogo. Aplicações/integrações/testes/documentação/orientações conforme escopo; suporte posterior contratual. |

Chave, servidores e módulos continuam ilustrações, não provas de operação. Não converter capacidades complementares em novos pilares. Não inventar pacotes universais, métricas, SLA, certificações ou propriedade intelectual. Os textos por seção, FAQ e metadados propostos para as três páginas estão consolidados abaixo.

## Hub e quatro ferramentas

### Proposta histórica para um hub de ferramentas (adiado)

**Adiado nesta fase.** Copy abaixo preservada como proposta histórica; a seção da Home atende à descoberta das quatro ferramentas.

**H1:** Ferramentas para explorar sua base tecnológica.  
**Descrição:** Recursos para organizar perguntas sobre segurança, software e infraestrutura. Conheça as premissas, os limites e o tema de cada experiência antes de interpretar um resultado.  
**H2:** Escolha o tema da sua decisão. Use os quatro cards da Home, acrescentando a relação com o contexto: ROSI → investimento em segurança; Shadow AI → uso e governança de IA; dívida técnica → manutenção e evolução; migração → cenários de infraestrutura.  
**H2:** Como funciona. “Responda à ferramenta, consulte o resumo sem cadastro e, se desejar, peça o relatório padrão do tema por e-mail.” Escopo/modelos escolhidos em F01–F29; publicação exige implementação/revisão, e envio exige serviço real. No protótipo, cálculo local disponível e envio indisponível identificado.  
**H2:** Como usamos os dados. “As respostas são utilizadas no navegador para produzir o resultado e descartadas após a sessão. Elas não são associadas ao e-mail informado para receber o relatório. A inscrição na newsletter é uma escolha separada.”  
**CTA secundário:** Quer conversar sobre o seu cenário? Solicitar diagnóstico.

### Copy específica das ferramentas — proposta para revisão

Escopo/modelos escolhidos em F01–F29. Todas usam formulário/checklist em uma página e resultado compacto abaixo; etapas de F02 foram substituídas. Copy/composição específica segue proposta para revisão humana. As perguntas, ajudas, ações e exemplos completos estão no [contrato das ferramentas](tools.md); essa especificação rege o modelo e não altera a copy aprovada da Home.

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

**Direção aprovada N01–N04; copy proposta para revisão.** Formulário na abertura, amostra recente, benefícios, curadoria, FAQ e rodapé. Anexos e sequência no [briefing da newsletter](newsletter.md).

**H1:** Análise da Root Trust em dias úteis.  
**Descrição:** Cibersegurança, infraestrutura em nuvem e software para decisões sobre operações críticas. Um tema central por edição, análise própria, implicações práticas e links para as fontes.  
**H2:** Leia uma prévia. Receba a edição completa.  
**Texto:** Conheça o assunto pela abertura de cada edição. Receba o conteúdo completo por e-mail, após confirmar seu endereço, e os próximos envios em dias úteis.  
**Formulário na abertura:** rótulo “Seu e-mail”; botão “Receber edições completas”; nota “Confirme seu endereço para receber a edição mais recente e os próximos envios em dias úteis. Você pode cancelar os próximos envios.” Link “Ver prévias anteriores”.  
**H2 da amostra:** Conheça uma edição. Título/data/pilar da mais recente, primeiro parágrafo editorial completo e “Ler prévia”.  
**H2 dos benefícios:** Conteúdo para decisões sobre a sua operação. “Assuntos conectados à sua base tecnológica.”; “Análise com implicações práticas e fontes.”; “Edição completa na sua caixa de entrada.”  
**H2:** Como a curadoria é preparada. “A Root Trust seleciona assuntos relevantes aos três serviços, analisa o impacto para operações críticas e revisa texto, fontes e afirmações antes de publicar cada edição.” Seleção → análise → revisão.

**FAQ:** “Com que frequência recebo?” — “Em dias úteis.” “Posso ler tudo no site?” — “O site apresenta o primeiro parágrafo de cada edição. O conteúdo completo é enviado por e-mail após confirmação do endereço.” “O que recebo ao me inscrever por esta página?” — “A edição aprovada mais recente, quando disponível, e os próximos envios.” “Posso pedir uma edição anterior?” — “Sim. Abra a prévia desejada e solicite aquela edição pelo formulário. Quem já assina também pode usar esse caminho.” “Como cancelo?” — “Pelo caminho de cancelamento indicado nos e-mails.”

A copy descreve a operação futura, não um serviço disponível. No protótipo, identificar simulação e não transmitir dados. Internamente IA apoia o rascunho e há aprovação humana de cada edição; não mencionar IA na explicação pública, conforme N04.

### Arquivo — /newsletter/edicoes

**H1:** Prévias das edições.  
**Descrição:** Conheça os temas da curadoria da Root Trust. Escolha uma prévia e solicite aquela edição completa por e-mail.  
**Estrutura N05–N07:** destaque recente do filtro ativo e lista cronológica decrescente. O destaque pode repetir a edição na lista. Filtros “Todos”, “Cibersegurança”, “Infraestrutura em nuvem” e “Software”; sem busca/capas obrigatórias. Paginação “Anterior”/página atual/“Próxima”; mudar filtro volta à primeira página.  
**Itens:** data, título, pilar principal, primeiro parágrafo editorial completo e “Ler prévia”. Em produção vêm de edições aprovadas. No protótipo, usar as [amostras](../../references/editorial/newsletter-editorial-samples.md) com rótulo “Edição demonstrativa — conteúdo para avaliação do design.” Datas demonstrativas não afirmam publicação real.  
**Vazio:** “Ainda não há edições publicadas. Volte para conhecer as próximas prévias.”  
**Filtro vazio:** “Nenhuma edição neste pilar por enquanto.” Ação “Ver todos os pilares”.  
**Falha:** “Não foi possível carregar as edições. Tente novamente.” Não tratar erro como vazio.  
**CTA:** Conhecer a newsletter → `/newsletter`.

### Prévia — /newsletter/edicoes/[slug]

**H1:** título da edição. Data/pilar principal e “Curadoria Root Trust”. **N08:** mostrar apenas o primeiro parágrafo editorial completo da versão por e-mail, com seus links, sem truncamento/resumo separado/tópicos extras. Saudação, título e preheader não contam. A abertura deve explicar contexto e relevância; quando insuficiente, revisar a abertura da própria edição completa. Amostras explicitamente demonstrativas.  
**H2:** Receba esta edição completa.  
**Texto:** Receba esta edição completa e as próximas análises em dias úteis. Confirme seu endereço pelo e-mail que enviaremos.  
**Campo:** Seu e-mail. **Ação:** Receber esta edição completa.  
**Ajuda N09:** Já assina? Você também pode solicitar esta edição aqui.  
**Nota:** Você pode cancelar os próximos envios. Newsletter e relatório são escolhas independentes.  
**Navegação N10:** Voltar para todas as edições → `/newsletter/edicoes`. Sem relacionados/anterior/próxima. Edição inexistente usa 404. Em produção, título/texto dependem de aprovação humana. Conteúdo completo não entra no payload público apenas para ser escondido.

### Modelos de e-mail e relatório

Os modelos abaixo são copy para revisão. Variáveis representam dados reais aprovados; sem integração, estados são simulação identificada e nenhuma mensagem é enviada.

- **Confirmação da newsletter:** assunto “Confirme seu e-mail para receber a newsletter da Root Trust”. Corpo “Você solicitou as edições completas da Root Trust em dias úteis. Confirme seu endereço para começar a receber.” Botão “Confirmar meu e-mail”. Complemento “Se você não fez este pedido, ignore esta mensagem.” Não inserir prazo de validade sem decisão do provedor.
- **Entrega de edição:** assunto igual ao título aprovado. Corpo: tema/contexto → análise própria → implicação prática → fontes → links relacionados. A edição completa deve existir e ter revisão humana. Rodapé: “Você recebe este e-mail porque confirmou sua inscrição na newsletter da Root Trust.” Ação de cancelamento e informação legal dependem da operação aprovada.
- **Entrega de relatório:** assunto “Seu relatório de [tema] — Root Trust”. Corpo “Aqui está o relatório padrão de [tema] que você solicitou. O material apresenta conceitos e próximos passos gerais; não foi personalizado a partir das suas respostas.” Ação “Acessar relatório”, somente se material e destino reais estiverem disponíveis. Complemento “Quer conversar sobre seu cenário? Solicitar diagnóstico.” Sem inscrição automática na newsletter.
- **Conteúdo do relatório padrão por tema:** introdução específica da ferramenta → conceitos → método validado explicado → premissas e limites → próximos passos gerais → fontes → convite ao diagnóstico. Fórmulas, faixas, exemplos e texto do material dependem de validação própria; este esquema não permite gerar um relatório técnico definitivo.

## Formulário de diagnóstico (sem página dedicada)

**Página dedicada adiada.** S03 mantém o formulário na Home e em cada serviço; a copy abaixo é referência futura, não pedido para gerar outra página.

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
**Demais estados:** copy de campo inválido, envio, cancelamento e confirmação em [fluxos](product.md).

| Página | Título para busca | Descrição para busca proposta |
|---|---|---|
| Home | Root Trust — Confiabilidade com profundidade | Cibersegurança, infraestrutura em nuvem e desenvolvimento de software para operações críticas. Conheça a Root Trust e solicite uma conversa inicial. |
| Cibersegurança | Cibersegurança e Pentest — Root Trust | Pentest, avaliação de riscos, identidade e acesso, monitoramento e resposta a incidentes conforme o contexto da sua operação. |
| Infraestrutura | Infraestrutura em nuvem — Root Trust | Ambientes locais, nuvem, redes, backup e capacidade com atenção à continuidade e aos custos da sua operação. |
| Software | Software e desenvolvimento sob medida — Root Trust | Aplicações web e mobile, integrações, automação de processos e evolução de sistemas conforme as necessidades da sua operação. |
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

Registrar responsável/data de aceite da portabilidade por página antes da publicação. Conferir oferta, CTA/destino, FAQ, metadados, estados e ativos; nenhum caso, métrica, SLA ou certificado fictício. Copy em desktop/mobile é equivalente; ASCII e objetos não substituem texto essencial. A Home foi aprovada em 04/10/2026 e os 12 exports atuais são a baseline visual aprovada (D02); páginas internas ainda precisam de revisão e aceite da portabilidade, sem reabrir a aprovação dos exports. O [plano](development.md#fases-e-gates) separa conclusão da documentação e liberações futuras: validar modelo de ferramenta, integração, operação e jurídico continua necessário mesmo após o frontend estar prototipado.


---

## Registro aprovado S01–S16, entrevista de 07/10/2026

O proprietário confirmou três páginas distintas, com aprofundamento do catálogo da Home. Os textos detalhados, marcados como propostas editoriais, são: [Cibersegurança](product.md#conteúdo-proposto--cibersegurança), [Infraestrutura em nuvem](product.md#conteúdo-proposto--infraestrutura-em-nuvem) e [Software](product.md#conteúdo-proposto--software). Negócio/estrutura aprovados; nova copy, composição e exports ainda exigem revisão.

| ID | Decisão | Estado |
|---|---|---|
| S01 | Base comum com sete seções: abertura e CTA; situações em que o serviço ajuda; frentes de atuação; como trabalhamos; ferramentas relacionadas; FAQ; CTA final. Textos e exemplos específicos por serviço. | Estrutura inicial; seção de ferramentas substituída por S16 |
| S02 | Herdar a Home com efeitos contidos: escuro, tipografia, moldura e componentes existentes. Um objeto 3D já associado ao serviço na abertura: chave para Cibersegurança, servidores para Infraestrutura em nuvem, módulos para Software. Interação sutil e leitura prioritária nas demais seções, sem animação contínua atrás dos textos. | Aprovado na entrevista |
| S03 | Reutilizar no final de cada página de serviço o formulário da Home: Nome, Empresa e WhatsApp obrigatórios. CTA da abertura leva ao formulário na própria página. Conversa inicial gratuita de qualificação e retorno por ligação ou WhatsApp no próximo dia útil; sem página de diagnóstico dedicada nesta fase. | Aprovado na entrevista |
| S04 | Manter quatro blocos da Home: diagnóstico de riscos; identidade e acesso; monitoramento contínuo; resposta a incidentes. Aprofundar capacidades complementares confirmadas nos detalhes: Pentest/Red Team, gestão de vulnerabilidades e apoio à adequação a normas/compliance, conforme escopo contratado. | Aprovado na entrevista |
| S05 | Priorizar riscos, organizar acessos e preparar detecção/resposta, com Pentest em destaque por ser um dos pontos mais fortes da Root Trust. Não relegar Pentest somente aos detalhes. Manter a estrutura de quatro frentes aprovada em S04. | Aprovado na entrevista |
| S06 | Aplicações web, APIs, redes, infraestrutura e aplicações mobile. | Aprovado na entrevista |
| S07 | O Pentest contratado pode ser apresentado com relatório técnico incluindo evidências e impacto dos achados, resumo executivo e recomendações priorizadas de correção. A conversa gratuita do CTA permanece somente qualificação. | Aprovado na entrevista |
| S08 | Reteste após correções conforme escopo e contrato; não apresentar como incluído universalmente. | Aprovado na entrevista |
| S09 | Manter quatro blocos da Home: arquitetura e migração; ambientes escaláveis; backup e continuidade; custos sob controle. Detalhar atuação confirmada em ambientes locais, nuvem, híbridos, redes corporativas e monitoramento/suporte conforme contrato. | Aprovado na entrevista |
| S10 | Combinar estabilidade e continuidade da operação com destaque à otimização de custos. Relacionar capacidade, redes, recuperação e custos; migração conforme contexto, sem pressupor necessidade ou economia garantida. | Aprovado na entrevista |
| S11 | Detalhar visibilidade dos gastos e consumo, identificação de recursos ociosos e ajuste de capacidade à demanda, considerando continuidade e desempenho. Capacidades conforme escopo contratado, sem percentual de economia prometido. | Aprovado na entrevista |
| S12 | Apresentar exemplos conforme escopo: arquitetura documentada; ambientes e redes configurados; rotinas de backup e testes de recuperação; recomendações e ajustes de custos/capacidade. Não prometer todos os exemplos em toda contratação. | Aprovado na entrevista |
| S13 | Manter quatro blocos da Home: sistemas sob medida; integrações entre ferramentas; automação de processos; evolução contínua do código. Detalhar aplicações web/mobile, modernização de legados e suporte conforme contrato dentro desses blocos. | Aprovado na entrevista |
| S14 | Combinar conexão entre sistemas, automação de processos e evolução da operação com destaque à criação de aplicações web e mobile sob medida. Modernização de legados permanece no catálogo, sem dominar a mensagem. | Aprovado na entrevista |
| S15 | Apresentar exemplos conforme escopo: aplicações web/mobile funcionais; integrações e automações implementadas; testes; documentação técnica; orientações de operação. Suporte e evolução posteriores conforme contrato; não prometer todos os itens em toda contratação. | Aprovado na entrevista |
| S16 | Retirar os links e a seção de ferramentas das páginas de serviços. Foco na contratação dos três pilares de atuação: Cibersegurança, Infraestrutura em nuvem e Software. Substitui a seção de ferramentas de S01; estrutura final com seis seções: abertura/CTA; situações em que o serviço ajuda; frentes de atuação; como trabalhamos; FAQ; CTA/formulário final. Ferramentas já existentes permanecem no website e não são novos serviços. | Aprovado na entrevista |

**Resultado final:** seis seções; nenhum novo pilar e nenhuma seção/link promocional de ferramentas nas páginas de serviços. O item Ferramentas da navegação global permanece. Hub de ferramentas e diagnóstico dedicado adiados; formulário local em cada serviço.

### Pesquisa das páginas de serviços

Pesquisa web em páginas oficiais, consultadas em 07/10/2026. Sites de empresas servem como referências de organização, não comprovação de conversão ou requisito universal. O escopo da Root Trust vem das confirmações acima.

| Fonte | Contribuição | Limite |
|---|---|---|
| [Cloudflare — Professional Services](https://www.cloudflare.com/professional-services/) | Oferta, formas de atuação e contato na página. | Sem copiar clientes, números, serviços ou resultados. |
| [Rackspace — Cloud](https://www.rackspace.com/cloud) | Organização de capacidades e relação entre ambientes, migração, engenharia e custos. | Sem importar plataformas, certificações ou disponibilidade. |
| [Thoughtworks — Software Engineering](https://www.thoughtworks.com/what-we-do/software-engineering) | Necessidades, capacidades e contato como sequência editorial. | Sem copiar cases, métricas ou posicionamento centrado em IA. |
| [OWASP WSTG — Reporting](https://wstg.owasp.org/v4.2/5-Reporting/) | Resumo executivo e achados técnicos com impacto/orientação de correção. | Sugestões para relatórios web; não certifica a empresa nem cobre sozinho todos os alvos aprovados. |
| [FinOps Foundation — Usage Optimization](https://www.finops.org/framework/capabilities/usage-optimization/) | Uso/ociosidade/capacidade relacionados a custo, desempenho e negócio. | Não comprova economia ou oferta formal de FinOps da Root Trust. |
| [Claude Design — guia oficial](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) | Contexto, referências, revisão e exportação. | Não presumir formatos de importação/exportação indisponíveis na interface do usuário. |

Não houve coleta Firecrawl nesta pesquisa de serviços. Tentativas sem conteúdo utilizável (IBM/Accenture/Mandiant e página específica de migração Rackspace) não fundamentaram os briefings. Referências pesquisadas são para orientar design/editoria; não devem virar prova comercial na página pública.



---

## Regras compartilhadas das páginas de serviços

## Design e interações

**Direção aprovada S02:** Home com efeitos contidos, tema escuro, moldura, tipografia e componentes existentes. Um objeto do serviço na abertura; não repetir cenas por toda a página. O posicionamento e os textos novos abaixo são propostas para revisão visual.

- Reutilizar fundo `#171717`, painéis `#1D1D1D`, contornos `#3C3C3C`, Verde Raiz `#003428` e Superfície `#F5F5F2`. Folha/Menta apenas nos papéis já observados. Baloo 2 nos títulos; Archivo no corpo/UI; assinatura negativa SVG pronta.
- Referência de largura: moldura 1320px, conteúdo 1200px, padding `clamp(20px,4vw,60px)`. Ajustar quebras para o conteúdo da interna; não transpor o tamanho do H1 sem avaliar leitura.
- Proposta: abertura com texto e objeto, situações em lista, quatro frentes em grade 2×2, método em cinco itens HTML, FAQ e formulário final Verde Raiz. Não copiar a longa sequência fixada da Home para a interna.
- No mobile, objeto depois da mensagem/CTA; quatro frentes e método empilhados. Ocultar ornamentação lateral quando faltar espaço. Nenhuma informação depende de gesto, arrasto ou hover.
- Reutilizar a moldura G3 de forma discreta; não acrescentar G4 ASCII, G2, fotografia, árvore/Bonsai, novos efeitos ou outra família gráfica por obrigação. A adaptação web não modifica o manual oficial.
- Luz/parallax sutis são decorativos. Se houver movimento automático prolongado, oferecer pausa/retomada visível. Respeitar mudança dinâmica de `prefers-reduced-motion`; nessa preferência, manter o objeto estático e remover movimento não essencial.
- Suspender animação em aba oculta e fora da área visível. Falha de WebGL deve mostrar alternativa local estática, preservar espaço e manter texto/CTA acessíveis.
- HTML semântico, um H1, H2 por seção, rótulos visíveis, foco perceptível, teclado, contraste e leitura a 320px/zoom. FAQ pode usar `details/summary`; canvas decorativo fora da árvore acessível. Não anunciar cada quadro ou afirmar conformidade certificada.

A portabilidade aprovada é para Next.js App Router, React, TypeScript, npm e CSS Modules/tokens, usando Three.js direto conforme `development.md`. Os exports são referência visual/técnica e não definem a arquitetura final; React Three Fiber não foi escolhido.

## Formulário, estados e contatos

**Contrato aprovado S03:** no final desta página, `id="contato"`; CTA principal “Solicitar diagnóstico” aponta para `#contato`. Reutilizar o formulário da Home, com **Nome, Empresa e WhatsApp obrigatórios**. Não adicionar e-mail, mensagem, assunto ou escolha de canal.

Oferta visível: **conversa inicial gratuita de qualificação**; retorno por ligação ou WhatsApp no **próximo dia útil**. A gratuidade não se estende aos serviços técnicos. A página dedicada `/diagnostico` está adiada nesta fase.

| Estado | Texto/comportamento |
|---|---|
| Inicial | Campos vazios com rótulos persistentes; botão “Solicitar diagnóstico”. |
| Nome ausente | “Informe seu nome.” |
| Empresa ausente | “Informe a empresa.” |
| WhatsApp ausente/inválido | “Informe um número com DDD.”; validar formato sem afirmar existência do número. |
| Em andamento | “Enviando solicitação…”; bloquear duplicidade. No protótipo, identificar simulação. |
| Recebida | “Diagnóstico solicitado. A gente retorna por ligação ou WhatsApp no próximo dia útil.” Em produção, somente após recebimento real. |
| Falha | “Não foi possível enviar sua solicitação. Tente novamente ou use outro canal de contato.” Preservar campos. |
| Sem integração | “Este formulário ainda não recebe solicitações. Fale com a Root Trust pelos canais de contato.” |

D12: o aviso inicial exato de FormStatus foi removido do site (sem ocultar por CSS nem substituir); o aviso do modo demo e o feedback pós-tentativa honestos permanecem. O protótipo demonstra os estados localmente com aviso **“Demonstração — nenhum dado é enviado.”** Usar dados fictícios e controles de revisão identificados; não transmitir ou persistir entradas nem simular uma operação real sem aviso. Focar o primeiro campo inválido e anunciar o resultado de forma acessível.

Canais confirmados: `contato@roottrust.com.br` e `11 94008-4692` (`+55 11 94008-4692`). Integração, responsável, proteção contra abuso, retenção e privacidade continuam pendentes. Não inventar endpoint, política jurídica ou checkbox obrigatório.

## Navegação e conteúdo compartilhado

Proposta de breadcrumb: Home → serviço atual. Cabeçalho/rodapé reutilizam a Home, com links resolvidos para o contexto da interna: Serviços → Home `#servicos`; Ferramentas → Home `#ferramentas`; Newsletter → `/newsletter` no header, em desktop e mobile, em todas as páginas (D11; footer e `#newsletter` da Home inalterados); diagnóstico → formulário local. Logo volta à Home.

**S16:** não incluir seção, cards, CTA secundário ou links promocionais para ferramentas no conteúdo desta página. O item global Ferramentas permanece na navegação do website. A Root Trust tem somente os três pilares de atuação já confirmados. O hub `/ferramentas` e o diagnóstico dedicado estão adiados.

Em export HTML, conectar arquivos existentes com caminhos relativos; em futura aplicação, usar as rotas do [sitemap](product.md). Não fingir que rotas Next já funcionam. Privacidade deve apontar para uma página real quando existir; no protótipo, identificar a indisponibilidade em vez de retornar ao topo.

Não incluir clientes, métricas, cases, depoimentos, preços, prazos de entrega ou certificações sem aprovação. A seção Situações usa **contextos ilustrativos**, não histórias de clientes. A relação entre segurança, infraestrutura e software pode aparecer no texto; não obriga contratar os três.

**Metadados propostos:** título “Cibersegurança e Pentest — Root Trust”; descrição “Pentest, avaliação de riscos, identidade e acesso, monitoramento e resposta a incidentes conforme o contexto da sua operação.” Sem números, canonical ou dados estruturados inventados.

---

## Conteúdo proposto — Cibersegurança

## Conteúdo da página — seis seções

### 1. Abertura e CTA

**Rótulo:** Cibersegurança  
**H1 proposto:** Pentest e cibersegurança para a sua operação.  
**Descrição:** Entenda os riscos dos seus sistemas, organize acessos e prepare sua operação para detectar e responder a incidentes. O Pentest ajuda a identificar vulnerabilidades e orientar prioridades com evidências e impacto de negócio.  
**CTA:** Solicitar diagnóstico → `#contato`.  
**Apoio:** Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.

Objeto: **chave hachurada**, reutilizando `mountPillar(el, 'chave', opts)` do export. Ilustração de acesso/controle, sem “escudo invencível”, selo de segurança ou status Verificado. Pentest aparece em HTML na primeira tela; o objeto não precisa explicar todas as capacidades sozinho.

### 2. Situações em que o serviço ajuda

**H2 proposto:** Conhecer os riscos para decidir o próximo passo.

Contextos ilustrativos em quatro itens breves:

- **Validar aplicações e ambientes:** entender vulnerabilidades antes de mudanças relevantes ou dentro de uma avaliação planejada.
- **Organizar identidades e acessos:** revisar quem acessa o quê e quais controles precisam de atenção.
- **Priorizar correções:** relacionar achados ao contexto, em vez de tratar uma lista técnica como plano de ação.
- **Preparar detecção e resposta:** esclarecer sinais acompanhados, responsabilidades e condições de atendimento.

Não representar incidentes reais, contadores de ataques, resultado de avaliação do visitante ou provas da Root Trust.

### 3. Frentes de atuação

**H2:** Proteção conectada ao contexto da operação.

Exatamente quatro blocos principais, preservando o catálogo aprovado:

| Frente | Redação proposta |
|---|---|
| **Diagnóstico de riscos** | Avaliamos riscos e vulnerabilidades dentro de um escopo definido, com Pentest como frente de destaque. Os achados orientam prioridades técnicas e decisões de negócio. |
| **Identidade e acesso** | Apoiamos a organização de identidades, permissões e controles de acesso considerando aplicações, infraestrutura e responsabilidades da operação. |
| **Monitoramento contínuo** | Acompanhamos sinais relevantes nos ambientes contratados. O monitoramento automático pode ser 24×7 conforme contrato; cobertura humana e resposta são definidas separadamente. |
| **Resposta a incidentes** | Apoiamos o tratamento de incidentes conforme o escopo acordado e as condições da operação, conectando análise, prioridades e ações necessárias. |

**Detalhamento de Pentest dentro de Diagnóstico de riscos**, com espaço e hierarquia visíveis, não um quinto serviço:

> Pentest é um teste de segurança autorizado, com escopo definido. Avaliamos aplicações web, APIs, redes, infraestrutura e aplicações mobile, com objetivos e limites acordados antes da execução.

**Entregas do Pentest contratado:**

1. Relatório técnico com evidências e impacto dos achados.
2. Resumo executivo para apoiar decisões.
3. Recomendações priorizadas de correção.

**Nota visível:** Reteste após as correções conforme escopo e contrato. A conversa gratuita não inclui a execução do Pentest ou esses relatórios.

Gestão de vulnerabilidades complementa diagnóstico/priorização. Red Team é capacidade complementar com objetivo e escopo próprios; não usar como sinônimo automático de Pentest. Apoio a normas/compliance pode atravessar avaliação e controles, conforme contratação; não prometer certificação. Não acrescentar metodologias, ferramentas, classes de teste, alvos ou frequências não confirmados.

### 4. Como trabalhamos

**H2 proposto:** Do entendimento do risco às prioridades de ação.

Proposta de cinco itens HTML curtos, sem terminal operacional fictício:

| Etapa | Texto proposto para a interna |
|---|---|
| Diagnóstico | Entendemos o contexto e definimos o que será avaliado. |
| Estratégia | Relacionamos riscos, objetivos e prioridades ao escopo. |
| Implementação | Executamos o trabalho técnico e as ações contratadas. |
| Operação | Acompanhamos os controles e ambientes incluídos na contratação. |
| Evolução | Revisitamos prioridades conforme mudanças e novos desafios. |

**Ressalva:** As etapas podem variar conforme o escopo do projeto. Não dizer que uma contratação de Pentest inclui automaticamente operação contínua.

Fecho editorial proposto: “Segurança considera as aplicações que movem o negócio e a infraestrutura que as sustenta. Essa visão integrada orienta o trabalho sem exigir a contratação das três frentes.”

### 5. Perguntas frequentes

**Solicitar diagnóstico já inclui um Pentest?**  
Não. O primeiro passo é uma conversa gratuita de qualificação. O Pentest é um serviço técnico com escopo, autorização e contratação definidos.

**Quais ambientes podem ser avaliados?**  
Aplicações web, APIs, redes, infraestrutura e aplicações mobile. Os alvos e limites são acordados para cada trabalho.

**O que recebemos de um Pentest?**  
Relatório técnico com evidências e impacto dos achados, resumo executivo e recomendações priorizadas de correção.

**O reteste está incluído?**  
Sua realização após as correções depende do escopo e do contrato.

**Monitoramento contínuo significa equipe humana 24×7?**  
O monitoramento automático 24×7 está disponível conforme contrato. Cobertura humana e condições de resposta são definidas separadamente.

**O serviço garante ausência de incidentes ou certificação?**  
O trabalho apoia a identificação de riscos e a melhoria de controles. Não elimina todos os riscos nem garante certificação.

### 6. CTA e formulário final

**H2 proposto:** Vamos entender as prioridades da sua segurança.  
**Texto:** Conte um pouco sobre sua empresa em uma conversa inicial gratuita de qualificação. A gente retorna por ligação ou WhatsApp no próximo dia útil.  
**Formulário:** Nome, Empresa, WhatsApp; botão Solicitar diagnóstico. Ver estados e limites abaixo.

## Pesquisa — Cibersegurança

## Pesquisa e aplicação das referências

| Fonte consultada | Uso nesta proposta | Limite |
|---|---|---|
| [Cloudflare — Professional Services](https://www.cloudflare.com/professional-services/) | Referência de explicação da oferta, modalidades de atuação e contato na própria página. | Não importar clientes, resultados, catálogo ou alcance da Cloudflare. |
| [OWASP WSTG v4.2 — Reporting](https://wstg.owasp.org/v4.2/5-Reporting/) | Sustenta a distinção entre resumo executivo e achados técnicos, com impacto e orientação de correção. | Guia sugere uma estrutura, não certifica a Root Trust; aplica-se a testes web e não fundamenta sozinho todos os alvos S06. |

A pesquisa orienta a organização; o catálogo e as entregas da Root Trust vêm da entrevista. A prioridade de Pentest foi confirmada pelo proprietário, não inferida da referência. Não publicar evidências, achados ou dados confidenciais de testes como decoração.

---

## Conteúdo proposto — Infraestrutura em nuvem

## Conteúdo da página — seis seções

### 1. Abertura e CTA

**Rótulo:** Infraestrutura em nuvem  
**H1 proposto:** Continuidade e custos sob controle na sua infraestrutura.  
**Descrição:** Planejamos e evoluímos ambientes locais, em nuvem e híbridos, conectando capacidade, redes, recuperação e visibilidade de custos às necessidades da sua operação.  
**CTA:** Solicitar diagnóstico → `#contato`.  
**Apoio:** Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.

Objeto: **servidores hachurados**, reutilizando `mountPillar(el, 'servidores', opts)`. Mostrar infraestrutura organizada com acabamento da Home, sem mapas globais, consoles de fornecedores, métricas de disponibilidade ou consumo fictícios.

### 2. Situações em que o serviço ajuda

**H2 proposto:** Uma base preparada para o que a operação exige.

Quatro contextos ilustrativos:

- **Capacidade que precisa acompanhar a demanda:** revisar recursos e dependências quando o uso dos sistemas muda.
- **Ambientes e redes desconectados:** organizar a relação entre infraestrutura local, nuvem e conectividade.
- **Recuperação pouco clara:** verificar como backups, procedimentos e testes apoiam a retomada do trabalho.
- **Gastos difíceis de explicar:** relacionar consumo e capacidade ao que a operação realmente utiliza.

Dar aos custos espaço equivalente ao da continuidade. Não introduzir números de economia, falhas reais de clientes, SLA ou um cenário que obrigue migrar.

### 3. Frentes de atuação

**H2:** Arquitetura, operação e custos considerados em conjunto.

Exatamente quatro blocos principais, preservando o catálogo aprovado:

| Frente | Redação proposta |
|---|---|
| **Arquitetura e migração** | Entendemos dependências e requisitos para planejar a arquitetura e, quando fizer sentido, a migração. A atuação contempla ambientes locais, em nuvem, híbridos e redes corporativas. |
| **Ambientes escaláveis** | Relacionamos capacidade à demanda e às condições da solução, considerando desempenho e continuidade. Monitoramento e suporte acompanham os ambientes conforme contrato. |
| **Backup e continuidade** | Organizamos rotinas de backup e procedimentos de recuperação conforme o escopo, com testes para verificar o caminho de retomada acordado. |
| **Custos sob controle** | Tornamos gastos e consumo mais claros, identificamos recursos ociosos e recomendamos ajustes de capacidade à demanda sem ignorar desempenho e continuidade. |

**Detalhe visível de custos:** “Entender o gasto, identificar ociosidade e ajustar capacidade.” Pode aparecer em três linhas dentro da quarta frente, sem virar nova seção ou uma calculadora.

**Exemplos de entrega, aninhados nas frentes correspondentes:**

- Arquitetura documentada.
- Ambientes e redes configurados.
- Rotinas de backup e testes de recuperação.
- Recomendações e ajustes de custos/capacidade.

**Ressalva visível:** As entregas dependem do escopo e do contrato. Não apresentar todos os exemplos como pacote fixo.

Não nomear provedores, parcerias, certificações ou uma oferta formal de FinOps sem confirmação. Otimização de custos não garante percentual de economia; uma decisão pode priorizar continuidade ou desempenho. A definição de disponibilidade e cobertura de suporte pertence ao contrato.

### 4. Como trabalhamos

**H2 proposto:** Entender a base para escolher o caminho.

Proposta de cinco itens HTML:

| Etapa | Texto proposto para a interna |
|---|---|
| Diagnóstico | Entendemos ambientes, dependências, consumo e necessidades da operação. |
| Estratégia | Definimos prioridades de arquitetura, continuidade, capacidade e custos. |
| Implementação | Configuramos os ambientes e executamos as mudanças contratadas. |
| Operação | Acompanhamos os ambientes incluídos no contrato. |
| Evolução | Revisitamos capacidade, custos e necessidades conforme o contexto muda. |

**Ressalva:** As etapas podem variar conforme o escopo do projeto. Não assumir atendimento permanente em todo projeto.

Fecho editorial proposto: “A infraestrutura sustenta aplicações e precisa considerar os controles de segurança. As decisões conectam essas dependências sem exigir contratar os três serviços.”

### 5. Perguntas frequentes

**O serviço atende ambientes locais e híbridos?**  
Sim. Inclui ambientes locais, em nuvem, híbridos e redes corporativas conforme o escopo contratado.

**Toda contratação exige migrar para nuvem?**  
Não. O contexto, as dependências, os custos e as necessidades da operação orientam a escolha.

**Como a Root Trust trabalha os custos?**  
Com visibilidade de gastos e consumo, identificação de recursos ociosos e ajustes de capacidade à demanda, considerando desempenho e continuidade.

**Existe uma economia mínima garantida?**  
Não há percentual de economia prometido. Os ajustes dependem do ambiente, do objetivo e das condições da contratação.

**O trabalho inclui backup e teste de recuperação?**  
Esses são exemplos de entrega disponíveis conforme escopo e contrato. A rotina e os testes precisam corresponder às necessidades acordadas.

**Qual é a disponibilidade e a cobertura de suporte?**  
Disponibilidade, suporte e condições de atendimento são definidos no contrato. Monitoramento automático 24×7, quando contratado, não implica equipe humana disponível 24×7.

### 6. CTA e formulário final

**H2 proposto:** Vamos conversar sobre a base da sua operação.  
**Texto:** Uma conversa inicial gratuita para entender seus ambientes, suas prioridades de continuidade e seus desafios de custos. Retorno por ligação ou WhatsApp no próximo dia útil.  
**Formulário:** Nome, Empresa, WhatsApp; botão Solicitar diagnóstico. Ver estados e limites abaixo.

## Pesquisa — Infraestrutura em nuvem

## Pesquisa e aplicação das referências

| Fonte consultada | Uso nesta proposta | Limite |
|---|---|---|
| [Rackspace — Cloud](https://www.rackspace.com/cloud) | Referência de organização de capacidades cloud/híbridas e conexão entre adoção, engenharia e gestão de custos. | Não copiar plataformas, clientes, modalidades ou disponibilidade da Rackspace. |
| [Cloudflare — Professional Services](https://www.cloudflare.com/professional-services/) | Referência de oferta orientada ao contexto com caminho de contato na própria página. | Não importar provas ou serviços da referência. |
| [FinOps Foundation — Usage Optimization](https://www.finops.org/framework/capabilities/usage-optimization/) | Relaciona uso, ociosidade e ajuste de capacidade a custo/desempenho e necessidades do negócio. | Sustenta o conceito, não certifica a Root Trust nem comprova economia. |

A seleção das seis seções é uma adaptação para o escopo confirmado da Root Trust, não uma regra universal demonstrada pelos sites. A página explica contratação; não precisa reproduzir a biblioteca de recursos, cases ou plataformas dessas empresas.

---

## Conteúdo proposto — Software

## Conteúdo da página — seis seções

### 1. Abertura e CTA

**Rótulo:** Software  
**H1 proposto:** Software sob medida para conectar e evoluir sua operação.  
**Descrição:** Criamos aplicações web e mobile, integramos sistemas e automatizamos processos a partir das necessidades do seu negócio, com atenção à segurança e à evolução da solução.  
**CTA:** Solicitar diagnóstico → `#contato`.  
**Apoio:** Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp no próximo dia útil.

Objeto: **módulos hachurados**, reutilizando `mountPillar(el, 'modulos', opts)`. Representa partes de um sistema que se conectam; não é um painel SaaS que a Root Trust vende nem uma demonstração de aplicação já entregue.

### 2. Situações em que o serviço ajuda

**H2 proposto:** Quando a operação precisa de sistemas que conversem.

Quatro contextos ilustrativos:

- **Uma aplicação precisa sair do papel:** desenvolver uma solução web/mobile para necessidades específicas.
- **Informações circulam entre sistemas desconectados:** integrar ferramentas e reduzir etapas de transferência manual.
- **Processos repetitivos consomem atenção:** avaliar automações que apoiem o trabalho da equipe.
- **A base existente limita a evolução:** revisar código, dependências e necessidades de modernização.

Não prometer percentuais de produtividade, número de integrações ou um prazo de entrega. Nenhum contexto representa cliente ou resultado comprovado.

### 3. Frentes de atuação

**H2:** Construir, conectar e evoluir com contexto.

Exatamente quatro blocos principais, preservando o catálogo aprovado:

| Frente | Redação proposta |
|---|---|
| **Sistemas sob medida** | Desenvolvemos aplicações web e mobile alinhadas aos processos e necessidades definidos no projeto. |
| **Integrações entre ferramentas** | Conectamos sistemas e informações para apoiar o fluxo da operação e as dependências entre soluções. |
| **Automação de processos** | Implementamos fluxos para atividades repetitivas conforme os objetivos e limites acordados com a equipe. |
| **Evolução contínua do código** | Evoluímos a base existente e avaliamos modernização de legados. Suporte e evolução contínua dependem da contratação. |

Distinguir integração, que conecta sistemas/dados, de automação, que organiza a execução de um fluxo. Não afirmar que toda automação elimina intervenção humana ou que toda integração é viável sem acesso e escopo.

**Exemplos de entrega, dentro das frentes correspondentes:**

- Aplicações web/mobile funcionais.
- Integrações e automações implementadas.
- Testes.
- Documentação técnica.
- Orientações de operação.

**Ressalva visível:** As entregas dependem do escopo e do contrato. Suporte e evolução posteriores são definidos na contratação.

Não apresentar todos os itens como pacote universal. Não inventar stack de projetos de clientes, propriedade intelectual, transferência de código, licenças, integração com fornecedores específicos, aplicações de exemplo “já entregues” ou prazos fixos. A stack do website não determina a tecnologia de todo serviço de Software.

### 4. Como trabalhamos

**H2 proposto:** Do desafio da operação à solução que faz sentido.

Proposta de cinco itens HTML:

| Etapa | Texto proposto para a interna |
|---|---|
| Diagnóstico | Entendemos processos, sistemas existentes e necessidades da equipe. |
| Estratégia | Definimos prioridades e o escopo da solução. |
| Implementação | Desenvolvemos aplicações, integrações e automações contratadas. |
| Operação | Orientamos a operação e acompanhamos o que estiver no contrato. |
| Evolução | Ajustamos a solução e a base existente conforme novas necessidades. |

**Ressalva:** As etapas podem variar conforme o escopo do projeto. Acompanhamento posterior não está automaticamente incluído em toda entrega.

Fecho editorial proposto: “Aplicações dependem da infraestrutura em que operam e dos controles que protegem seus dados. Consideramos essas conexões desde a concepção, sem exigir a contratação dos três serviços.”

### 5. Perguntas frequentes

**Vocês criam aplicações web e mobile?**  
Sim. As necessidades, a tecnologia e as entregas são definidas no escopo do projeto.

**Vocês integram sistemas que já usamos?**  
Sim, essa é uma frente de atuação. As possibilidades dependem dos sistemas envolvidos, acessos, restrições e objetivos acordados.

**Automação é a mesma coisa que integração?**  
Integração conecta sistemas e informações. Automação organiza a execução de um fluxo. Uma solução pode combinar as duas conforme a necessidade.

**É preciso substituir um sistema legado inteiro?**  
Não necessariamente. O contexto, as dependências e as prioridades orientam o caminho de modernização.

**O projeto pode incluir testes e documentação?**  
Testes, documentação técnica e orientações de operação são exemplos de entrega conforme escopo e contrato.

**Há suporte e evolução depois da entrega?**  
Sim, conforme contratação. Cobertura, condições e continuidade do acompanhamento são definidas no contrato.

### 6. CTA e formulário final

**H2 proposto:** Vamos conversar sobre o próximo passo do seu software.  
**Texto:** Uma conversa inicial gratuita para entender a aplicação, integração ou processo que sua operação precisa evoluir. Retorno por ligação ou WhatsApp no próximo dia útil.  
**Formulário:** Nome, Empresa, WhatsApp; botão Solicitar diagnóstico. Ver estados e limites abaixo.

## Pesquisa — Software

## Pesquisa e aplicação das referências

| Fonte consultada | Uso nesta proposta | Limite |
|---|---|---|
| [Thoughtworks — Software Engineering](https://www.thoughtworks.com/what-we-do/software-engineering) | Referência de abertura orientada a necessidades, organização de capacidades e caminho de contato. | Não importar catálogo, posicionamento centrado em IA, cases ou métricas da Thoughtworks. |
| [Cloudflare — Professional Services](https://www.cloudflare.com/professional-services/) | Referência de explicação da atuação e contato na própria página. | Oferta e comprovações pertencem à Cloudflare. |

A pesquisa apoia a organização editorial. As quatro frentes e os exemplos de entrega foram confirmados pelo proprietário; não derivam de copiar um catálogo de outra empresa. O conteúdo deve aprofundar a Home, sem repetir seus cards como uma página inteira.





### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 (ver Estado da entrega):** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.
