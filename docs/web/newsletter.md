# Newsletter Root Trust

## Aceite operacional — 19/10/2026

**Piloto restrito concluído e aceito por Renato.** Diagnóstico, quatro relatórios, newsletter agendada com aprovação humana, publicação/envio, confirmação/cancelamento e backup/restauração foram validados. Renato é responsável pela conferência de cotas e pela guarda/descarte de backups, CSVs, mensagens e contatos nos provedores. Procedimento e limitações em [development.md](development.md#responsabilidade-operacional-e-limites-do-aceite). O [plano arquivado](../plans/integrations-pilot-completed.md#encerramento-e-aceite-final--19102026) preserva as evidências. Este estado prevalece sobre propostas e pendências históricas abaixo. Não há autorização de abertura pública nem alteração das allowlists.


**Complemento cloud T6.2-R3, 18/10/2026:** [prompt diário da Routine](../../web/ops/newsletter-routine/prompt.md) e [guia operacional](../../web/ops/newsletter-routine/README.md) implementam os contratos abaixo. Criação cloud, regeneração com mesmo ID/slug, recusa e aprovação de outra edição seguida de prévia/Broadcast/recebimento pelo usuário foram comprovados. Confirmação do trigger corrigida e ensaiada (D2). Prompt diário e agenda seg–sex08h Brasília salvos conforme confirmação do operador; primeira ocorrência automática confirmada em19/10, com aprovação humana, prévia publicada e e-mail recebido. Claude só pesquisa/redige rascunho; uma pessoa decide cada revisão. Sem pauta verificável, não há edição fictícia nem alerta Discord adicional. Network secret fica no proxy, sem HMAC no Claude; LinkedIn separado. Operação/aceite restantes no PLAN; validação técnica não aprova fatos editoriais.

**Histórico de ensaios manuais, 17/10/2026:** ensaio manual restrito validou rascunho e revisão no Discord, regeneração, recusa, aprovação, prévia pública, Broadcast e entrega individual completos, confirmação/reinscrição e cancelamento tanto pelo Resend quanto pelo site. Usuário conferiu os e-mails; webhook e sincronização de cancelamentos foram verificados no banco. ACK diferido atualiza o resultado sem depender de resposta API em 2,2 s; repetição de aprovação não criou novo envio. A rotina agendada ainda não foi configurada; cenários restantes e aceite completo continuam no [PLAN.md](../plans/integrations-pilot-completed.md). Não há CMS próprio ou abertura pública. Entrada: [README](README.md).

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
- Histórico N01–N11: CMS externo e envio estavam pendentes. No piloto atual, Resend e Discord foram escolhidos no PLAN; pub/sub e painel próprio continuam fora do escopo.

### Uma edição, um recorte público

A prévia é o **primeiro parágrafo substantivo do corpo editorial**, inteiro, preservando links/formatação compatíveis. Título, saudação, preheader, aviso, assinatura e rodapé não contam. Não truncar por caracteres ou criar resumo diferente.

A abertura deve explicar assunto/contexto/relevância sem depender de trecho oculto. Se ficar fraca, revisar a abertura da **própria edição completa**. A revisão humana inclui o recorte; reutilização reduz escrita duplicada, não elimina revisão.

Arquivo e amostra da landing usam o mesmo parágrafo. Não exigir outra lista pública de fontes: links na abertura permanecem clicáveis; fontes completas acompanham o e-mail. Não incluir conteúdo completo em HTML, JSON, bundle, atributos ou payload público para escondê-lo. O Markdown completo é anexo editorial, não asset publicável.

## Estado implementado

As três rotas estão implementadas em Next, com três amostras demonstrativas sem indexação, arquivo com dois itens por página e filtro que reinicia na página 1. Histórico: o formulário exibia o aviso inicial de nenhum envio; por D12 a frase inicial exata de FormStatus foi removida (sem ocultar por CSS nem substituir), mantendo o aviso do modo demo e o feedback pós-tentativa honestos. O formulário preserva edição escolhida, ou seleciona a mais recente na origem geral. Metadata individual deriva somente da abertura pública, com corte de até 160 caracteres sem quebrar palavras.

Layout (D13): título, lista e card do arquivo usam 1200 px úteis em 1440, parágrafos de leitura em 65ch, grade a partir de 960 px e landing inalterada. O item Newsletter do header leva a `/newsletter` (D11). Aberturas e fontes são públicas; corpos completos permanecem fora da distribuição pública. Scan GPT atual (P9) de 430 arquivos e 11 âncoras privadas encontrou zero ocorrências, dentro desse recorte limitado (histórico: 230 arquivos). Slug inexistente bem formado retorna 404; UTF-8 malformado pode resultar em 500 antes da aplicação. [QA final](../../references/audits/final-qa.md). Confirmação, entrega e cancelamento foram ensaiados no piloto de17/10; CMS próprio não integra o escopo. Nenhum estado demo comprova essas operações.

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

As três amostras permitem **duas entradas por página apenas na demonstração**: página 1 com dois itens, página 2 com um; filtros por pilar com uma entrada. Tamanho de produção não está fixado. Na aplicação, catálogo estático local e estados vazios são cobertos por fixtures. O seletor de erro de catálogo pertencia à revisão do export; falha de rede do catálogo depende de futura integração, sem simulador adicional nesta entrega.

Referência editorial de vazio geral: **Ainda não há edições publicadas.**; **Nenhuma edição neste pilar por enquanto.** com **Ver todos os pilares**; **Não foi possível carregar as edições. Tente novamente.** Não tratar erro como arquivo vazio.

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

No piloto implementado: novos leitores confirmam por token único de 24 h antes de receber; assinantes já confirmados podem pedir a edição pelo mesmo formulário, com resposta pública idêntica. Ações repetidas têm limite e idempotência; jobs mortos exigem reconciliação. Cancelados só voltam após novo pedido e confirmação explícita. Cancelar newsletter não cancela relatório, autorização comercial separada ou outros dados. A operação real e os prazos de provedores ainda dependem de T6.2.

A copy de sucesso da Home **Inscrição confirmada. A próxima edição chega no próximo dia útil.** é registro aprovado do export. Não usar essa mensagem como sucesso do formulário demo: ela requer confirmação e envio operacionais, validados somente no piloto restrito; o pedido de inscrição isolado não os comprova.

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




### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 (ver [development.md](development.md)):** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.


### Execução agendada comprovada — 19/10/2026

O operador confirmou início automático da Routine pela agenda, envio ao Discord, aprovação humana, publicação da prévia no website e recebimento do e-mail da edição `newsletter-2026-10-19`. A geração foi registrada às08h11 de Brasília; estados de notificação, publicação e Broadcast foram conferidos separadamente. R3.6 concluída, sem aprovação ou publicação autônoma pela Routine. Métricas, retenção, cópias externas e aceite global do piloto permanecem no PLAN; este ensaio não comprova disponibilidade contínua.
