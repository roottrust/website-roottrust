# Newsletter Root Trust

**Atualizado:** 10/10/2026. Os três exports aprovados seguem N01–N11 e foram auditados em 09/10. Preservar o visual/conteúdo exportado na portabilidade. Tema escuro aprovado; CMS e envio não estão integrados. Entrada: [README](README.md).

**Estado dos exports:** apresentação, arquivo e prévia estão preservados entre os 12 exports em `references/claude-design/`. A auditoria de 09/10 registra a análise estática e suas limitações. O Markdown editorial completo permanece em `references/editorial/`, fora do conteúdo publicável.

## 1. Objetivo e precedência

Portar e revisar as três páginas exportadas: apresentação/inscrição, arquivo de prévias e prévia individual. Público: lideranças e equipes de operações críticas; pt-BR; Cibersegurança, Infraestrutura em nuvem e Software. Preservar a Home e as ferramentas.

Precedência:

1. Decisões N01–N11 e instruções posteriores do proprietário.
2. Este briefing para estrutura/limites; [conteúdo](product.md) para copy compartilhada e [jornadas](product.md) para operação.
3. [Home.dc.html](../../references/claude-design/Home.dc.html), com moldura/laterais, e [design web](design.md) para linguagem contida. N02 autoriza essa aplicação nestas internas, sem alterar o manual.
4. [Marca v2](../design/README.md), [guia](../design/brand-design.md) e [catálogo](../design/assets-catalog.md) para identidade/ativos.
5. Referências externas como repertório, não especificações comerciais ou licença de assets.

Os quatro exports aprovados de ferramentas estão em `references/claude-design/`; a aprovação visual não equivale a cálculo auditado ou publicação autorizada. Reutilizar seus componentes na portabilidade e tratar os achados da auditoria sem redesenho.

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
| N11 | Estados da jornada | Andamento e erro; pedido aceito no modo demo. Confirmação e cancelamento pertencem à operação futura (D10). | Revisão da jornada sem sucesso operacional fictício |

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

**Rota:** /newsletter. **Copy proposta:** [conteúdo](product.md#newsletter--newsletter).

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

## 7. Formulário e estados

Um padrão com intenção geral ou edição escolhida. Rótulo visível, teclado/foco, validação de e-mail, erro associado e feedback compreensível; não depender só de cor. Referências: [W3C labels](https://www.w3.org/WAI/tutorials/forms/labels/) e [notificações](https://www.w3.org/WAI/tutorials/forms/notifications/).

| Estado | Copy proposta / comportamento |
|---|---|
| Inicial | Promessa corresponde à origem geral/edição |
| Inválido | **Informe um endereço de e-mail válido.** Preservar entrada |
| Andamento | **Solicitando confirmação…** Bloquear repetição pendente |
| Pedido aceito | **Confira seu e-mail para confirmar a inscrição ou o pedido desta edição.** Não afirmar assinatura/entrega |
| Confirmado (futuro) | **E-mail confirmado.** Somente após confirmação real; não simular |
| Falha | **Não foi possível solicitar a confirmação. Tente novamente.** Preservar entrada |
| Link inválido/expirado | **Não foi possível confirmar com este link. Solicite uma nova confirmação.** Sem inventar validade/token |
| Sem edição | **Ainda não há edição disponível para entrega.** Não substituir pedido silenciosamente |
| Falha de entrega (futuro) | Endereço segue confirmado; falha real ao iniciar entrega, sem pedir nova inscrição |
| Cancelando (futuro) | **Cancelando inscrição…** Somente durante operação real |
| Cancelado (futuro) | **Inscrição cancelada. Você não receberá os próximos envios desta newsletter.** Após confirmação real do cancelamento |
| Já cancelado (futuro) | **Esta inscrição já está cancelada.** Somente em fluxo autorizado |
| Falha ao cancelar (futuro) | **Não foi possível concluir o cancelamento. Tente novamente.** |
| Link de cancelamento inválido (futuro) | Orientar usar cancelamento em e-mail recebido; alternativa real é pendência operacional |

No modo `FORM_MODE=demo`, somente andamento, pedido aceito aguardando confirmação e erro/retry são simulados. Os estados Confirmado, Entregue e Cancelado abaixo são requisitos de operação futura, não opções locais de demonstração. Não enviar ou persistir e-mails nem usar dados pessoais reais.

Na operação futura: novos leitores confirmam antes de assinatura/envio; assinantes pedem a edição pelo mesmo formulário. Não revelar situação cadastral publicamente nem enviar edições arbitrariamente só porque um endereço foi digitado. Validar pedido pelo e-mail; tokens, reenvios, duplicidade e limites aguardam serviço futuro. Não reativar cancelados por visita/pedido; reinscrição exige escolha explícita e confirmação. Cancelar newsletter não cancela relatório ou promete apagar outros dados.

A copy de sucesso da Home **Inscrição confirmada. A próxima edição chega no próximo dia útil.** é registro aprovado do export. Não usar essa mensagem como sucesso do formulário demo: ela requer confirmação e envio operacionais, ainda inexistentes.

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

## Critérios de revisão e pendências de produção

- Três páginas em pt-BR/tema escuro; landing, arquivo e prévia com composição e estados definidos acima.
- Arquivo com filtros, paginação e ordem decrescente; a prévia repete exatamente uma abertura editorial completa.
- Pedido geral ou da edição escolhida permanece no mesmo formulário para leitores novos ou existentes.
- Todos os estados demo são identificados e locais, sem rede ou persistência; pedido, confirmação e entrega são estados distintos.
- Revisar desktop, mobile, 320 px, zoom, teclado, foco, labels, fallback e movimento antes de aceite.
- CMS e envio, verificação do pedido histórico, duplicidade/reenvio, confirmação/cancelamento, finalidade/retenção/privacidade, responsável editorial em dias úteis, aprovação de cada edição, acessibilidade, desempenho e implantação ainda dependem de decisão/operação real.

Fornecedor, endpoint/API e integrações não foram escolhidos. Esta documentação não comprova entrega de e-mail ou certificação.



