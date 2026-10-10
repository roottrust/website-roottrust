# Newsletter Root Trust — briefing para Claude Design

**Atualizado:** 07/10/2026, após o primeiro export. **Estado:** [Newsletter.dc.html](../../web/Newsletter.dc.html) gerada e aceita como base para continuar. O proprietário solicitou avançar às outras duas páginas: arquivo e prévia individual. N01–N11 permanecem; CMS/envio não estão integrados. Aceitação como base não certifica acessibilidade, desempenho ou operação. Entrada: [contexto web](README.md).

**Próxima ação:** enviar os cinco Markdown atualizados da seção 10 à conversa existente e copiar o **prompt mestre da seção 11**, que agora pede as duas páginas restantes na mesma rodada. Não repetir a geração da apresentação. Os prompts separados da seção 12 servem para ajustes/revisões posteriores.

**Análise estática do export:** apresentação contém inscrição, amostra C01, benefícios, curadoria, FAQ e estados demonstrativos; destinos de arquivo/prévia indisponíveis. Há pausa do ASCII e preferência dinâmica de movimento reduzido. Ainda faltam declaração de idioma, revisão de fallback/foco e suspensão do trabalho da moldura em aba oculta. O export bruto inclui o Markdown completo em web/uploads; separar anexos de contexto do conjunto publicável. Não houve nova execução no navegador nesta análise.

## 1. Objetivo e precedência

Criar três páginas no **mesmo projeto e conversa que gerou a Home e as quatro ferramentas**: apresentação/inscrição, arquivo de prévias e prévia individual. Público: lideranças e equipes de operações críticas; pt-BR; Cibersegurança, Infraestrutura em nuvem e Software. Preparar desktop, mobile e estados sem redesenhar a Home.

Precedência:

1. Decisões N01–N11 e instruções posteriores do proprietário.
2. Este briefing para estrutura/limites; [conteúdo](website-content.md) para copy compartilhada e [jornadas](website-flows.md) para operação.
3. [Home.dc.html](../../web/Home.dc.html), com moldura/laterais, e [design web](website-design.md) para linguagem contida. N02 autoriza essa aplicação nestas internas, sem alterar o manual.
4. [Marca v2](../design/README.md), [guia](../design/brand-design.md) e [catálogo](../design/assets-catalog.md) para identidade/ativos.
5. Referências externas como repertório, não especificações comerciais ou licença de assets.

Os quatro HTML de ferramentas já existem em web; geração não equivale a cálculo auditado ou publicação autorizada. Reutilizar componentes acessíveis sem ampliar esta etapa para reconstruir/auditar essas páginas.

## 2. Decisões da entrevista — 07/10/2026

| ID | Questão | Decisão | Motivo |
|---|---|---|---|
| N01 | Prioridade da landing | Inscrição na abertura; amostra, benefícios, curadoria e FAQ abaixo | Oferta clara |
| N02 | Continuidade visual | Home com efeitos contidos; ASCII na apresentação e decoração discreta na leitura | Coerência e legibilidade |
| N03 | Conteúdo demonstrativo | Amostras identificadas, com fontes reais | Sem inventar publicações |
| N04 | Explicação pública | Seleção, análise e revisão Root Trust, sem mencionar IA/ferramentas | Curadoria; revisão humana interna preservada |
| N05 | Arquivo | Destaque recente e lista cronológica, sem capas obrigatórias | Histórico simples |
| N06 | Descoberta | Filtros por pilar, sem busca | Poucos controles |
| N07 | Navegação do histórico | Paginação; troca de filtro volta à página 1 | Sem scroll infinito |
| N08 | Prévia | Primeiro parágrafo editorial completo da edição | Sem redação pública separada |
| N09 | Assinante existente | Mesmo formulário, sem login/exposição de cadastro | Um caminho de pedido |
| N10 | Após a prévia | Voltar ao arquivo | Sem relacionados/anterior/próxima |
| N11 | Estados | Andamento, confirmação, erro e cancelamento demonstrativos | Revisão da jornada |

N08 substitui a proposta de tópicos, implicação prática e fontes separadas na prévia. Dois parágrafos foram discutidos; **um** foi aprovado.

## 3. Contrato editorial e de acesso

- Um tema central por edição, relevante aos serviços/operações críticas; análise própria, implicações práticas, fontes e links relacionados na versão completa.
- Envios em **dias úteis**, pt-BR. Não inventar horário, tempo de leitura, assinantes ou prazo garantido de chegada.
- Internamente, IA pesquisa/redige rascunho; **uma pessoa aprova cada edição**, fontes e recorte público. LinkedIn pode compartilhar pesquisa, com redação própria.
- Publicamente: **Curadoria Root Trust**. Não inventar autor, retrato, equipe nominal, depoimento ou certificação; não mencionar IA na explicação pública.
- Site: prévia aberta. E-mail: completa após confirmação. Sem login, desbloqueio no site, paywall, desfoque ou texto integral escondido.
- Pedido geral: iniciar entrega da edição aprovada mais recente após confirmação. Pedido em prévia: daquela edição; depois, próximos envios em dias úteis. Confirmar não comprova recebimento.
- Newsletter independente dos relatórios; não anexar respostas/resultados de ferramentas à inscrição.
- CMS externo/envio/privacidade ainda serão definidos. Pub/sub e painel próprio não entram nesta rodada.

### Uma edição, um recorte público

A prévia é o **primeiro parágrafo substantivo do corpo editorial**, inteiro, preservando links/formatação compatíveis. Título, saudação, preheader, aviso, assinatura e rodapé não contam. Não truncar por caracteres ou criar resumo diferente.

A abertura deve explicar assunto/contexto/relevância sem depender de trecho oculto. Se ficar fraca, revisar a abertura da **própria edição completa**. A revisão humana inclui o recorte; reutilização reduz escrita duplicada, não elimina revisão.

Arquivo e amostra da landing usam o mesmo parágrafo. Não exigir outra lista pública de fontes: links na abertura permanecem clicáveis; fontes completas acompanham o e-mail. Não incluir conteúdo completo em HTML, JSON, bundle, atributos ou payload público para escondê-lo. O Markdown completo é anexo editorial, não asset publicável.

## 4. Página A — apresentação/inscrição

**Rota:** /newsletter. **Copy proposta:** [conteúdo](website-content.md#newsletter--newsletter).

Ordem:

1. Cabeçalho compartilhado, assinatura negativa pronta.
2. H1 **Análise da Root Trust em dias úteis.**, descrição dos temas, formulário e ASCII contido.
3. **Conheça uma edição.** Título/data/pilar da mais recente, abertura e **Ler prévia**; amostra identificada.
4. **Conteúdo para decisões sobre a sua operação.** Três benefícios: assuntos conectados aos serviços; análise prática com fontes; conteúdo completo na caixa de entrada.
5. **Como a curadoria é preparada.** Seleção → análise → revisão Root Trust, em HTML estático, sem terminal fictício.
6. FAQ: frequência, texto completo, primeira edição recebida, edição antiga, cancelamento.
7. Acesso ao arquivo e rodapé compartilhado.

Formulário: rótulo **Seu e-mail**; botão **Receber edições completas**. Apoio: **Confirme seu endereço para receber a edição mais recente e os próximos envios em dias úteis. Você pode cancelar os próximos envios.**

Somente e-mail. Sem nome/empresa/telefone/interesses ou checkbox obrigatório presumido. Não repetir formulário em cada seção ou abrir modal de saída. Benefício é conteúdo completo e conveniência, sem bônus ou exclusividade inventados.

## 5. Página B — arquivo

**Rota:** /newsletter/edicoes. **H1:** **Prévias das edições.**

- Cabeçalho, introdução curta e **Conhecer a newsletter**.
- Destaque compacto da edição mais recente **do filtro ativo**; sem capa obrigatória.
- Filtros **Todos**, **Cibersegurança**, **Infraestrutura em nuvem**, **Software**; um pilar principal por edição.
- Lista em data decrescente: título, data, pilar, abertura editorial e **Ler prévia**.
- Destaque pode repetir a edição na lista; não exclui item da contagem ou muda ordem. Sem redação adicional.
- **Anterior**, página atual/total e **Próxima**, com extremos indisponíveis; mudar filtro volta à página 1.
- Sem busca, scroll infinito, métricas sociais ou taxonomia adicional.

As três amostras permitem **duas entradas por página apenas na demonstração**: página 1 com dois itens, página 2 com um; filtros por pilar com uma entrada. Tamanho de produção não está fixado. Estados vazios/erro são selecionáveis na revisão, sem criar artigos de preenchimento.

Copy: **Ainda não há edições publicadas.**; **Nenhuma edição neste pilar por enquanto.** com **Ver todos os pilares**; **Não foi possível carregar as edições. Tente novamente.** Não tratar erro como arquivo vazio.

## 6. Página C — prévia individual

**Rota:** /newsletter/edicoes/[slug].

1. Cabeçalho.
2. Título, data, pilar e **Curadoria Root Trust**; amostra com rótulo demonstrativo.
3. Um parágrafo editorial completo em coluna de leitura.
4. **Receba esta edição completa.** Formulário de e-mail.
5. **Voltar para todas as edições** → arquivo.
6. Rodapé.

Copy: **Receba esta edição completa e as próximas análises em dias úteis. Confirme seu endereço pelo e-mail que enviaremos.** Botão **Receber esta edição completa**. Ajuda **Já assina? Você também pode solicitar esta edição aqui.**

Sem pontos extras, segunda prévia, fotos, relacionados, comentários ou anterior/próxima. Slug inexistente usa 404. Mudança do formulário não perde título/edição escolhida.

## 7. Formulário e estados de demonstração

Um padrão com intenção geral ou edição escolhida. Rótulo visível, teclado/foco, validação de e-mail, erro associado e feedback compreensível; não depender só de cor. Referências: [W3C labels](https://www.w3.org/WAI/tutorials/forms/labels/) e [notificações](https://www.w3.org/WAI/tutorials/forms/notifications/).

| Estado | Copy proposta / comportamento |
|---|---|
| Inicial | Promessa corresponde à origem geral/edição |
| Inválido | **Informe um endereço de e-mail válido.** Preservar entrada |
| Andamento | **Solicitando confirmação…** Bloquear repetição pendente |
| Pedido aceito | **Confira seu e-mail para confirmar a inscrição ou o pedido desta edição.** Não afirmar assinatura/entrega |
| Confirmado | **E-mail confirmado.** Explicar edição a receber, sem garantir chegada |
| Falha | **Não foi possível solicitar a confirmação. Tente novamente.** Preservar entrada |
| Link inválido/expirado | **Não foi possível confirmar com este link. Solicite uma nova confirmação.** Sem inventar validade/token |
| Sem edição | **Ainda não há edição disponível para entrega.** Não substituir pedido silenciosamente |
| Falha de entrega | Endereço segue confirmado; explicar falha ao iniciar entrega, sem pedir nova inscrição |
| Cancelando | **Cancelando inscrição…** |
| Cancelado | **Inscrição cancelada. Você não receberá os próximos envios desta newsletter.** |
| Já cancelado | **Esta inscrição já está cancelada.** Somente em fluxo autorizado |
| Falha ao cancelar | **Não foi possível concluir o cancelamento. Tente novamente.** |
| Link de cancelamento inválido | Orientar usar cancelamento em e-mail recebido; alternativa real é pendência operacional |

Variações em área de revisão identificada, sem novas páginas editoriais. Trocar estados localmente por controles demonstrativos; **sem rede/persistência de e-mails** ou confirmação real. Usar leitor@example.com nos exemplos. Não iniciar simulação com dados pessoais reais.

Na operação futura: novos leitores confirmam antes de assinatura/envio; assinantes pedem a edição pelo mesmo formulário. Não revelar situação cadastral publicamente nem enviar edições arbitrariamente só porque um endereço foi digitado. Validar pedido pelo e-mail; tokens, reenvios, duplicidade e limites aguardam serviço futuro. Não reativar cancelados por visita/pedido; reinscrição exige escolha explícita e confirmação. Cancelar newsletter não cancela relatório ou promete apagar outros dados.

A copy de sucesso da Home **Inscrição confirmada. A próxima edição chega no próximo dia útil.** permanece registro aprovado do export, não estado de simples aceitação do pedido nas novas páginas. Conciliar na integração futura; não redesenhar a Home agora.

## 8. Visual e acessibilidade

- **Escuro**; Baloo 2/Archivo, SVG negativo pronto, fundo #171717, painel #1D1D1D, contorno #3C3C3C, Superfície #F5F5F2 e acentos oficiais do export. Sem tema claro inventado.
- Reutilizar cabeçalho/moldura/cantoneiras/botões/divisórias/rodapé. N02 autoriza decoração contida; não replicar hero G4 gigante.
- ASCII existente pequeno na landing; arquivo/prévia com margens discretas, sem movimento atrás da leitura. Newsletter não exige Three.js novo.
- Coluna de leitura proposta próxima de 65 caracteres por linha; corpo/entrelinha confortáveis, largura responsiva sem encolher fonte.
- Mobile empilhado, filtros quebrando linhas, sem ornamentação lateral invasiva ou hover obrigatório. Rever 320px, 390px, desktop 1440px e zoom/reflow.
- HTML essencial, lang pt-BR, headings coerentes, foco, labels, erro associado e feedback acessível, sem anúncio de animação caractere a caractere.
- Fallback estático, redução de movimento inclusive dinâmica, pausa em animação contínua e suspensão em aba oculta. Falha decorativa não bloqueia conteúdo.
- Sem árvore/Bonsai/raízes, fotos obrigatórias, selo fictício, LIVE ou marca antiga. Não reconstruir logo com texto.

Composição/contraste serão revisados no protótipo. Não declarar acessibilidade ou desempenho certificados.

## 9. Pesquisa e limites

Consulta web da entrevista em 07/10/2026. Documentação do Claude/fontes editoriais reconferidas na preparação. Extração textual não prova responsividade, execução de formulário ou conversão.

| Fonte | Contribuição / aplicação | Limite |
|---|---|---|
| [Stripe Dev Digest](https://go.stripe.global/dev-digest) | Benefício, temas e edições recentes | Não copiar identidade/formulário |
| [Snyk](https://snyk.io/newsletter/) | Benefícios/cancelamento | Não copiar mascote |
| [Thoughtworks Perspectives](https://www.thoughtworks.com/perspectives) | Publicação para decisores e histórico | Frequência/formato distintos; sem importar provas |
| [GitHub Insider](https://github.com/newsletter/past-issues) | Arquivo com datas/resumos | Sem alcance comercial alheio |
| [The Overflow](https://stackoverflow.blog/newsletter/) | Apresentação e histórico | Acesso público deles não muda acesso Root |
| [PostHog](https://newsletter.posthog.com/archive) | Título/data/autoria no arquivo | Sem imagens/métricas sociais obrigatórias |
| [W3C formulários](https://www.w3.org/WAI/tutorials/forms/) | Campos, estrutura e feedback | Depende da implementação |
| [Mailchimp double opt-in](https://mailchimp.com/help/about-double-opt-in/) | Pedido e confirmação distintos | Não seleciona fornecedor |
| [Ghost previews](https://ghost.org/help/public-previews/) | Prévia pública com acesso de membros | Não copiar login/desbloqueio web |
| [Ghost excerpt](https://docs.ghost.org/themes/helpers/data/excerpt) | Recorte textual | Não comprova extração nativa do primeiro parágrafo |
| [Claude criação/exportação](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) | Contexto, revisão e exportação | Conferir interface; export ZIP não prova upload universal |
| [Claude design system](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design) | Marca/componentes/exemplos como contexto | Reutilizar sistema existente |

**Firecrawl:** tentativas de search/scrape na pesquisa anterior retornaram **HTTP 402 / créditos insuficientes**. Nenhum conteúdo foi coletado por ele. Não atribuir as observações a Firecrawl nem alegar auditoria visual/formulário testado; não repetir sem mudança de crédito.

## 10. Anexos e skills

### Enviar agora — cinco Markdown

Este briefing, [amostras](newsletter-editorial-samples.md), [conteúdo](website-content.md), [jornadas](website-flows.md) e [design](website-design.md). Informar que substituem versões antigas sobre newsletter. Caminhos citados não anexam arquivos.

### Reutilizar; enviar somente faltantes

| Material | Papel |
|---|---|
| [Home.dc.html](../../web/Home.dc.html) e dependências relativas | Referência com moldura |
| [Newsletter.dc.html](../../web/Newsletter.dc.html) | Apresentação aceita como base; reutilizar componentes e conectar apenas os dois destinos previstos |
| [support.js](../../web/support.js), [pillars3d.js](../../web/pillars3d.js), web/_ds e web/assets | Recuperar dependências necessárias, sem exigir 3D novo |
| Quatro HTML web/Ferramenta … .dc.html | Continuidade das internas geradas, sem auditoria dos cálculos |
| [Guia](../design/brand-design.md)/[catálogo](../design/assets-catalog.md) | Regras/variantes; não reenviar 290 assets |
| [Assinatura horizontal negativa](../design/assets/logos/horizontal/roottrust-horizontal-negativo.svg) | Logo pronto |
| [Baloo 2](../design/assets/fonts/baloo-2/baloo-2-variable.ttf), [Archivo](../design/assets/fonts/archivo/archivo-variable.ttf), [OFL Baloo](../design/assets/fonts/baloo-2/OFL.txt)/[OFL Archivo](../design/assets/fonts/archivo/OFL.txt) | Fontes/licenças |
| Captura atual, se necessária | Recuperar referência visual, não substituir código |

Não anexar temp/Ferramentas por padrão: foi inspiração das ferramentas, com identidade antiga. Conferir formatos aceitos na interface; não presumir importação universal de pasta/ZIP.

Skills instaladas a citar **quando acessíveis e relevantes**:

- **frontend-design:** composição/continuidade.
- **impeccable:** hierarquia, legibilidade e estados.
- **web-design-guidelines:** navegação, foco, labels e responsividade.
- **animate:** microinterações, pausa e movimento reduzido.
- **react-best-practices:** somente se usar React.
- **threejs-fundamentals, threejs-geometry, threejs-materials, threejs-shaders, threejs-animation, threejs-interaction:** somente para dependências/objetos existentes realmente necessários.

Informar skills efetivamente lidas. Citação não instala skill, não obriga bibliotecas ou altera escopo; React Three Fiber não foi escolhido.

## 11. Prompt mestre — arquivo e prévia, próxima entrega

~~~text
A apresentação da newsletter já foi gerada como Newsletter.dc.html e foi aceita como base para continuarmos. Preserve sua composição e a Home/ferramentas existentes. Nesta rodada, crie AS DUAS páginas restantes: arquivo de edições e prévia individual. Comece pelo arquivo e gere a prévia em seguida; não encerre a entrega com apenas uma delas.

Continue na mesma conversa e projeto. Leia o briefing atualizado newsletter-claude-design-brief.md, newsletter-editorial-samples.md e as versões atuais de website-content.md, website-flows.md e website-design.md. N01–N11 continuam o contrato. Liste materiais/componentes efetivamente acessíveis; recupere somente dependências faltantes. Os caminhos locais citados não são anexos automáticos.

Base visual: Newsletter.dc.html e Home.dc.html com moldura, tema escuro, Baloo 2/Archivo, assinatura SVG negativa, tokens, cabeçalho/botões/divisórias/rodapé existentes. Arquivo e prévia precisam de decoração discreta e nenhuma animação atrás dos textos. Não recrie o hero ASCII grande ou adicione objetos 3D, fotos obrigatórias, árvore/raízes, marca antiga, métricas sociais ou provas comerciais.

Skills relevantes se instaladas/acessíveis: frontend-design para composição, impeccable para refinamento, web-design-guidelines para navegação/foco/labels e animate para microinterações. react-best-practices somente se React. Informe apenas skills consultadas; não adicionar biblioteca ou outro design system por obrigação.

1. ARQUIVO — rota futura /newsletter/edicoes.
H1 Prévias das edições. Introdução curta e link Conhecer a newsletter para a apresentação existente. Destaque compacto da mais recente do filtro ativo; lista por data decrescente. Filtros Todos, Cibersegurança, Infraestrutura em nuvem e Software. Cada item contém título, data demonstrativa, pilar principal, primeiro parágrafo editorial completo e Ler prévia. Sem busca/capas obrigatórias. O destaque pode repetir a edição na lista e não muda a contagem.
Use C01/C02/C03 das amostras. Duas entradas por página somente no protótipo, Anterior/Próxima/página atual, extremos indisponíveis; mudar filtro volta à primeira página. Filtros e paginação devem funcionar localmente, sem serviço externo. Inclua estados vazio, filtro vazio e falha, claramente selecionáveis para revisão, sem inventar outras edições.

2. PRÉVIA — rota futura /newsletter/edicoes/[slug].
Um template com as três amostras, escolhido pela navegação do arquivo. Título/data/pilar/Curadoria Root Trust e rótulo Edição demonstrativa — conteúdo para avaliação do design. Exiba SOMENTE o primeiro parágrafo editorial completo, exatamente como está nas amostras, com seus links. Não gerar outro resumo, dois parágrafos, tópicos extras, relacionados ou anterior/próxima.
Após o texto: Receba esta edição completa; campo Seu e-mail; botão Receber esta edição completa. Explique conteúdo completo por e-mail após confirmação e próximos envios em dias úteis. Ajuda Já assina? Você também pode solicitar esta edição aqui. Voltar para todas as edições retorna ao arquivo. Slug inexistente usa 404 no protótipo se o formato permitir.
Um formulário atende novos/existentes; preservar edição escolhida nos estados locais. Reutilize o padrão demonstrativo de Newsletter.dc.html para inválido, andamento, pedido aceito aguardando confirmação, confirmado distinto de entrega, erro/retry, link inválido e cancelamento. Use leitor@example.com; nenhum e-mail deve sair do navegador ou ser persistido. Não revelar cadastro nem reativar cancelados automaticamente. Não criar login, paywall, CMS/API ou serviço de envio.

Navegação local: conecte na apresentação existente apenas Ler prévia da C01 e Ver prévias anteriores aos novos destinos, preservando layout/textos. Conecte arquivo → três prévias → arquivo e Conhecer a newsletter → Newsletter.dc.html. Esta autorização não inclui redesign, mudança de formulários da apresentação, Home ou ferramentas. O formato do export não precisa implementar rotas Next, mas deve permitir percorrer as telas sem links silenciosos ao topo.

O Markdown editorial completo é contexto privado de trabalho, não conteúdo do protótipo público. Gere um conjunto público apenas com metadados e aberturas C01–C03; não incluir as edições completas em HTML, JSON, bundle, atributos, assets ou uploads publicáveis. Os uploads de contexto podem vir no export bruto do Claude; identifique-os separadamente para exclusão do pacote a publicar, sem apagar os originais de trabalho. Não esconder texto completo com CSS. Comunicação pública fala da curadoria Root Trust, sem IA; revisão humana interna permanece.

Conteúdo essencial em HTML, lang pt-BR, foco/labels/erros, teclado e layout mobile empilhado. Rever 320px/390px/1440px e zoom/reflow. Se houver decoração animada: fallback estático, redução dinâmica, pausa e suspensão real em aba oculta; não reproduzir o intervalo de desenho da moldura em document.hidden. Menus/painel de revisão com fechamento por Escape e gestão de foco. Não declarar certificação.

Entregue arquivo E prévia, ambos desktop/mobile e estados, com nomes identificáveis no export. Informe o que foi alterado na navegação da apresentação, simulações/limitações e dependências locais/licenças. Não apresentar o export como aplicação Next pronta, newsletter operacional ou publicação autorizada.
~~~

## 12. Prompts de continuação

Para a próxima geração, usar a seção 11, que pede **ambas** as páginas. Os prompts isolados abaixo servem para ajustes por página e revisão/exportação; não substituem o pedido conjunto atual.

### Após aprovação da apresentação — arquivo

~~~text
A apresentação está aprovada. Continue neste projeto com /newsletter/edicoes conforme N05–N07. Preserve Home, ferramentas e apresentação. Use as três amostras demonstrativas, destaque recente do filtro ativo e lista em data decrescente, sem excluir o destaque da contagem. Resumo é o primeiro parágrafo editorial.

Filtros Todos/Cibersegurança/Infraestrutura em nuvem/Software, sem busca/capas obrigatórias. Duas entradas por página somente na demonstração; anterior/próxima/página atual e voltar à página 1 ao mudar filtro. Estados vazio/filtro vazio/erro por controles de revisão, sem artigos inventados para preencher telas. Filtros/paginação locais funcionais quando o formato permitir. Prévia ainda não gerada é destino previsto identificado, sem apontar ao topo. Revise desktop/mobile/teclado, margens discretas e leitura sem fundo animado. Entregue só arquivo para revisão.
~~~

### Após aprovação do arquivo — prévia

~~~text
O arquivo está aprovado. Crie /newsletter/edicoes/[slug], conforme N08–N11, no mesmo projeto. As três amostras usam um template: título/data/pilar/Curadoria Root Trust, rótulo demonstrativo, primeiro parágrafo completo, formulário Receber esta edição completa, ajuda para assinantes, Voltar para todas as edições e rodapé. Sem relacionados/anterior/próxima, pontos extras ou conteúdo integral escondido no código.

Mudança do formulário preserva título/slug/edição solicitada. Um formulário atende novos/existentes; simule confirmação/erro/retry/cancelamento sem rede/persistência. Sem exposição de cadastro ou reativação silenciosa. Conecte localmente apresentação → arquivo → prévias e retorno; edição inexistente usa 404 quando o formato permitir. Links reais/CMS/envio pendentes. Preserve Home/ferramentas. Entregue desktop/mobile/estados para revisão.
~~~

### Após aprovação do conjunto — exportação

~~~text
As três páginas estão aprovadas visualmente. Confira navegação, filtros/paginação, igualdade das prévias com a abertura editorial, rótulos demonstrativos, teclado/foco/labels/mobile e redução de movimento. Verifique ausência do texto completo no payload público: páginas contêm só metadados e primeiro parágrafo.

Preserve Home/ferramentas; não alterar Home para conectar links nesta rodada. Registre destinos para integração posterior. Exporte no formato disponível que preserve código, dependências locais, assets/licenças. Liste verificações, limitações e integrações ausentes. Não apresentar como Next pronto, envio operacional ou lançamento autorizado.
~~~

## 13. Passo a passo no Claude Design

1. Abra **a conversa existente** que gerou Home, ferramentas e Newsletter.dc.html. A apresentação já foi aceita como base; não pedir sua geração novamente.
2. Reanexe os cinco Markdown atualizados da seção 10, informando que substituem versões anteriores sobre newsletter. Reutilize marca, código e assets ainda acessíveis; recupere só faltantes.
3. Cole **o prompt mestre atualizado da seção 11**, pedindo arquivo **e** prévia nesta rodada, em sequência. Não usar o prompt inicial antigo que limitava a entrega à apresentação.
4. Ao receber as duas páginas, revise o arquivo: filtros/ordem/paginação/vazios/erro e layout desktop/mobile. Use o prompt específico da seção 12 se precisar de ajustes.
5. Revise o template de prévia nas três amostras: um parágrafo, pedido da edição escolhida, estados e retorno ao arquivo; conferir teclado/foco e mobile.
6. Percorra apresentação → arquivo → três prévias → arquivo. Na apresentação, autorizar somente conexão de “Ler prévia” e “Ver prévias anteriores”, preservando composição/textos/formulário. Home e ferramentas continuam preservadas.
7. Após aprovar as duas composições, cole o prompt de **exportação** da seção 12. Baixe o formato disponível que preserve dependências; documentação oficial lista ZIP/HTML standalone, sem garantir todos os formatos na sua interface. Não publicar.
8. Salve exports/dependências em web e traga para análise antes da portabilidade/integração. Mantenha uploads editoriais completos como contexto de trabalho, excluídos do conjunto publicável; não alterar/apagar os originais de marca.

## 14. Checklist e dependências de produção

- [ ] Três páginas, pt-BR/escuro e componentes/assinaturas existentes.
- [ ] Landing com inscrição/amostra/benefícios/curadoria/FAQ, sem IA na copy pública.
- [ ] Arquivo com filtros, paginação e ordem decrescente.
- [ ] Prévia idêntica à abertura; nenhum conteúdo integral no payload público.
- [ ] Pedido geral/edição preservado; mesmo formulário para novos/existentes.
- [ ] Simulações rotuladas sem rede/persistência de e-mails.
- [ ] Pedido, confirmação e entrega distintos; sem exposição cadastral/reativação.
- [ ] Desktop/mobile/320px/zoom/teclado/foco/labels/fallback/movimento revisados.
- [ ] Código/assets/licenças exportáveis; Home/ferramentas preservadas.

Produção depende de responsável editorial em dias úteis, aprovação dos textos, CMS/envio, pedido histórico seguro/duplicidade, confirmação/cancelamento, retenção/finalidades/privacidade, acessibilidade/desempenho e implantação. Fornecedor, endpoint/API e integrações continuam sem escolha. Esta documentação não comprova operação ou certificação.
