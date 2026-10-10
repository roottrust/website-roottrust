# Jornadas e estados do website Root Trust

**Atualizado:** 07/10/2026. **Estado:** Home aprovada, ferramentas exportadas e newsletter N01–N11 pronta para prototipar. Os fluxos distinguem simulação e requisito de produção; modelos/integrações/operação/privacidade dependem de validação. Negócio: [briefing](website-brief.md); redação: [conteúdo](website-content.md); aparência: [design](website-design.md); entrada: [contexto](README.md).

**Origem:** decisões de produto preservadas, aprovação da Home em 04/10/2026, F01–F29 e decisões de newsletter N01–N11 em 07/10. Quatro exports de ferramentas já estão em `web/`, sem auditoria de seus cálculos nesta etapa. [Briefing da newsletter](newsletter-claude-design-brief.md) registra a nova entrevista. Marca oficial: [guia v2](../design/brand-design.md).

## Como interpretar os estados

Em produção, “sucesso” exige confirmação real da operação correspondente. O export aprovado contém handlers que mostram sucesso por alteração de estado local, sem envio: isso documenta aparência e copy aprovadas, não integração pronta. Ao disponibilizar demonstração, identificá-la e não coletar dados reais; não inventar endpoints. Ao integrar, conectar os estados reais antes de exibir as confirmações aprovadas.

Em todas as jornadas: rótulos visíveis; erro junto ao campo e resumo quando necessário; teclado/foco; indicação de andamento; bloqueio de envio duplicado enquanto o pedido está em andamento; preservação de campos após falha; mensagem útil e alternativa. Não depender de cor/hover. Falha da mídia da Home não bloqueia navegação ou CTA.

## Interações ilustrativas da Home

**Hero e moldura:** Cadeia G4, símbolos de newsletter/CTA e laterais G3 são Canvas 2D com ASCII/resposta ao ponteiro. A moldura só aparece no desktop. Não são cenas WebGL nem verificações de segurança executadas.

**Princípios:** três cards com diamante, cadeado e camadas em Three.js. Os objetos têm iluminação reativa, rotação e arrasto com retorno. As setas levam a `#contato`; títulos, explicações e ações continuam em HTML.

**Serviços:** em largura ≥960px e sem movimento reduzido inicial, lista de três opções e painel compartilhado permanecem fixados enquanto o scroll avança Cibersegurança → Infraestrutura em nuvem → Software. Clique desloca o scroll à opção; o objeto hachurado troca por dissolução/recomposição. Mobile apresenta três cards completos. Não há links às páginas próprias nessa seção.

**Processo:** cinco seleções verticais e terminal, também fixados no desktop com avanço pelo scroll/clique. Digitação e `[OK]` são narrativa ilustrativa, sem execução contratual. Mobile expõe as cinco etapas e linhas completas. O código contém avanço por timer fora do modo fixado quando não há seleção manual/redução; não confundir com progresso operacional. Em produção, preservar leitura sem animação/JavaScript e revisar anúncio do terminal para evitar leitura caractere a caractere.

Serviços/processo usam scroll nativo, não bloqueiam eventos de roda; as trilhas acrescentam 4,8 alturas de viewport ao percurso desktop. A comparação sem movimento foi testada com a preferência ativa antes do carregamento; mudança dinâmica ainda não é atendida integralmente.

**Ferramentas:** balança, olho, engrenagem com dentes ausentes e nuvem/seta em Three.js, rotação e luz reativa. Um WebGL compartilhado gera os objetos, que são apresentados em canvases 2D. Todos os cards levam provisoriamente a `#contato`; nenhum calcula resultados. Não há arrasto direto nos ícones das ferramentas.

**Requisitos de produção ainda ausentes:** controle visível de pausa/retomada; redução de movimento completa e resposta à mudança dinâmica; suspensão de trabalho com aba oculta; fallback estático diante de falha/perda de WebGL; revisão de teclado/foco/abas e cancelamento de gestos. O export já limita renderização fora da área visível, mas não atende todos esses requisitos. Claro/automático são decisões históricas não implementadas; somente escuro está presente. Detalhes na [especificação](website-design.md).

## Diagnóstico e contato

1. Na Home, CTA e cards das ferramentas levam a `#contato`. `/diagnostico` continua rota futura, sem tela implementada no export.
2. Explicar a **conversa inicial gratuita de qualificação**, com retorno por ligação ou WhatsApp no **próximo dia útil**, agora aprovado. Não é uma auditoria técnica nem promessa de relatório.
3. Coletar **Nome, Empresa e WhatsApp obrigatórios**. Sem e-mail, assunto, mensagem ou seleção de canal no formulário aprovado. Essa aprovação substitui as regras antigas de empresa opcional e escolha de canal.
4. O export valida Nome/Empresa não vazios e WhatsApp com pelo menos dez dígitos; erro “Informe um número com DDD.”. Essa checagem local não valida existência do número. Normalização e validação em fronteiras reais precisam considerar o contrato de atendimento, sem inventar novas regras comerciais.
5. O handler atual apenas define `leadSent`; não há pedido, backend, fila ou recebimento real. Na integração, transmitir somente os dados da solicitação ao atendimento aprovado. Destino, proteção contra abuso, retenção e responsável operacional continuam pendentes; o prazo da copy já está aprovado.
6. Após recebimento real, usar a confirmação aprovada. Em falha, preservar entradas e oferecer e-mail/telefone oficiais. Não exibir recebimento real por alteração de estado local.

| Estado | Comportamento e texto |
|---|---|
| Inicial | Nome, Empresa e WhatsApp obrigatórios; gratuidade e retorno por ligação/WhatsApp. Botão aprovado “Solicitar diagnóstico”. |
| Nome ausente | “Informe seu nome.” |
| Empresa ausente | Texto aprovado “Informe a empresa.” |
| WhatsApp ausente/inválido | Texto aprovado “Informe um número com DDD.” |
| Enviando | “Enviando solicitação…”; não permitir envio repetido. |
| Recebida | Texto aprovado “Diagnóstico solicitado. A gente retorna por ligação ou WhatsApp no próximo dia útil.” Exibido localmente no export; usar em produção somente após recebimento real. |
| Falha | “Não foi possível enviar sua solicitação. Tente novamente ou use outro canal de contato.” Preservar campos; oferecer `contato@roottrust.com.br` e `11 94008-4692`. |
| Integração indisponível | “Este formulário ainda não recebe solicitações. Fale com a Root Trust pelos canais de contato.” No protótipo, acrescentar identificação de demonstração. |

Reenvio após falha não deve criar múltiplas solicitações involuntárias; idempotência e tratamento de confirmação incerta são requisitos da integração futura, sem escolher mecanismo agora.

## Jornada comum das ferramentas

**Atualização F01–F29 e estado em 07/10/2026:** quatro páginas foram geradas no Claude Design e salvas em `web/`. O contrato continua formulário/checklist curto e resultado compacto na mesma página; F18/F21/F25/F29 substituem etapas de F02. Modelos, limites e exemplos estão no [briefing](tools-claude-design-brief.md). A presença dos exports não comprova aderência de cálculos/dados; esta etapa não os auditou.

**Estado da Home analisada:** cards ilustrados encaminham ao contato. O fluxo abaixo é contrato para revisar/portar os exports das ferramentas, não comprovação de cálculo ou envio em produção. Relatórios/envios continuam sem integração. Copy dos cards, como “Avalie sua postura de segurança”, não altera ROSI: simula investimento sob hipóteses F03–F18, sem medir postura de segurança.

1. Visitante conhece objetivo, público, método e limites.
2. Informa entradas escolhidas em F01–F29 e aciona o cálculo/checklist; recebe **resultado inicial sem cadastro**, no navegador. No protótipo, cálculo local real e exemplos fictícios identificados, sem presumir publicação autorizada.
3. O resultado informa premissas, fontes, unidades, interpretação e limites. ROSI/dívida/migração são estimativas condicionais; Shadow AI é orientação qualitativa sem score. Pode editar/recalcular ou limpar. Edição invalida o resultado anterior até nova avaliação.
4. Pode pedir por e-mail um **relatório padrão do tema**, sem personalização baseada nas respostas e sem plano de ação individual.
5. O resultado oferece “Solicitar diagnóstico”. Newsletter é uma escolha independente, não efeito do relatório.

**Dados:** manter respostas somente na memória da página durante a sessão da ferramenta e descartá-las ao encerrar essa sessão. Não persistir em banco, localStorage ou sessionStorage nem enviá-las em relatório, analytics, URL ou inscrição. O e-mail do relatório não deve ser associado às respostas. Este requisito não define prazo de retenção do e-mail: isso depende da revisão de operação/privacidade.

**Estados a estruturar:** início vazio; campos inválidos; resultado; insuficiência; edição com resultado desatualizado; limpar; exemplo fictício separado em ROSI; falha; relatório indisponível e futura operação de envio. Desconhecido não é zero, resultados negativos ficam visíveis. Sem espera artificial. Falha de decoração não bloqueia campos. Trocar horizonte de migração solicita revisão dos totais antes de recalcular.

| Estado | Texto para revisão |
|---|---|
| Preparação | “Esta ferramenta está em preparação para revisão e publicação.” Modelo escolhido não significa aplicação disponível. |
| Demonstração | “Protótipo — cálculos locais; formulários de envio indisponíveis.” Valores demonstrativos fictícios e separados. Se a tela for estática, identificar que não calcula. |
| Campo inválido | Mensagem específica de unidade/formato aprovada no modelo; não usar limites arbitrários. |
| Dados insuficientes | “Não há informações suficientes para produzir este resultado.” Explicar a insuficiência conforme modelo validado. |
| Falha de avaliação | “Não foi possível concluir a avaliação. Revise os dados ou reinicie a ferramenta.” |
| Relatório enviando | “Solicitando relatório…” |
| Relatório aceito | “Pedido de relatório recebido.” Não afirmar entrega na caixa de entrada sem evidência. |
| Falha de relatório | “Não foi possível solicitar o relatório. Tente novamente.” Preservar e-mail; não recalcular nem transmitir respostas. |
| Envio indisponível | “O envio do relatório ainda não está disponível.” |

Relatórios exigem material aprovado, serviço/destino real e finalidade revisada. O pedido de relatório não altera a newsletter, mesmo quando o endereço já é assinante. Duplicidade, limites de reenvio e necessidade de confirmação específica do relatório dependem do serviço futuro; não assumir o mesmo fluxo de confirmação da newsletter.

## Quatro ferramentas: escopo escolhido e liberação

| Experiência | Escopo e entradas escolhidos | Limites / próxima revisão |
|---|---|---|
| ROSI | Um cenário/proteção adicional em 12 meses; cinco entradas, auxiliares, ROSI e equilíbrio quando calculáveis | Perdas/frequência/custo/prazo/redução declarados; hipóteses temporais, zero e desconhecidos. Não mede postura ou todo o programa. |
| Shadow AI | Cinco temas; Sim/Parcialmente/Não/Não sei; orientação curta por tema | Sem pesos/faixas/score; prática declarada não é controle verificado. Revisar redação das ações/perguntas. |
| Dívida técnica | Profissionais, custo médio mensal, tempo em manutenção e parcela atribuída à dívida; custo mensal e projeção de 12 meses | Alocação aproximada de custo de pessoal, não toda a dívida, economia ou custo de quitação. |
| Migração | Três totais comparáveis em 12/36 meses; manter versus operar/transição; diferença monetária e percentual com base positiva | Sem preços automáticos/payback; não pressupor economia. Rever totais ao mudar período e evitar duplicação. |

O briefing histórico em `temp/Ferramentas` contém fórmulas, benchmarks e percentuais não aprovados. O contrato atual é o briefing F01–F29; não reproduzir estatísticas históricas, score ou estimativas automáticas. Fontes sustentam conceitos; adaptações próprias não são modelos certificados.

**Critério para publicar:** composição/copy aprovadas; cálculo/tabela implementados e conferidos com exemplos usual/limite/inválido; fontes, unidades, saídas, limites e mensagens revisados; acessibilidade, dados e revisão técnica/editorial. O briefing permite prototipar cálculo local real, sem liberar publicação ou envios. Relatórios e integrações são dependências separadas.

## Newsletter: leitura, inscrição e entrega

**Estado observado e aprovado da Home:** campo “Seu e-mail”, botão acessível “Assinar”, descrição “Insights práticos sobre segurança, nuvem, software e tecnologia para operações críticas.” e sucesso “Inscrição confirmada. A próxima edição chega no próximo dia útil.”. O handler testa formato e muda `sent`, sem transmissão/cadastro/confirmação/envio. “Ver edições anteriores” usa `#` e retorna ao topo. A copy aprovada não comprova a operação; a página de arquivo não foi implementada.

**Requisitos futuros preservados:** os itens abaixo descrevem confirmação, entrega histórica e cancelamento definidos anteriormente. Não estão implementados nem foram explicitamente revogados pelo export. Ao integrar, apresentar pedido de confirmação antes do estado final aprovado; conciliar a entrega imediata de edição escolhida/mais recente com os próximos envios em dias úteis. Consentimento e informação de finalidade dependem da revisão operacional/legal, sem presumir checkbox obrigatório.

**Decisões N01–N11 — 07/10/2026:** arquivo e prévias públicos; prévia é somente o primeiro parágrafo editorial completo da edição, preservando links, sem truncamento/resumo separado/tópicos adicionais. Arquivo e amostra reutilizam a abertura. Revisar a própria edição se a abertura não fizer sentido sozinha. O texto integral vai por e-mail e não entra no payload público para ser escondido. Sem login/desbloqueio web. Pauta: tema central ligado aos serviços/operações críticas, análise própria, fontes e links relacionados na completa; **dias úteis**, pt-BR.

Na landing: inscrição, amostra, benefícios, curadoria e FAQ. Arquivo: destaque/lista cronológica, filtro por pilar e paginação; trocar filtro retorna à página 1. Prévia: abertura/formulário e retorno ao arquivo. Comunicação pública enfatiza seleção/análise/revisão Root Trust, sem mencionar IA; processo interno de aprovação humana permanece. [Briefing](newsletter-claude-design-brief.md) e [amostras](newsletter-editorial-samples.md) contêm prompts/anexos.

1. Visitante informa e-mail em área geral ou prévia; interface explica frequência, finalidade e acesso completo.
2. Pedido geral conserva a intenção de receber a edição aprovada mais recente; pedido na prévia conserva a identificação da edição escolhida. Não associar respostas de ferramentas.
3. Solicitar confirmação do endereço pelo serviço aprovado. Não iniciar assinatura/envios completos antes de confirmação.
4. Após confirmação, entregar a edição escolhida ou a mais recente conforme origem; depois, envios em dias úteis.
5. Se a edição não existir/não estiver aprovada ou envio não estiver disponível, explicar o estado sem prometer entrega.
6. Cada e-mail oferece caminho de cancelamento dos próximos envios conforme operação aprovada.

### Estados de inscrição e confirmação

| Estado | Resultado necessário |
|---|---|
| E-mail inválido | “Informe um endereço de e-mail válido.” |
| Pedido em andamento | “Solicitando confirmação…”; bloquear pedido duplicado. |
| Pedido aceito | “Confira seu e-mail para confirmar a inscrição ou o pedido desta edição.” Usar após aceitação real do serviço; não é endereço confirmado ou entrega concluída. |
| Pedido falhou | “Não foi possível solicitar a confirmação. Tente novamente.” Preservar e-mail. |
| Confirmação concluída | “E-mail confirmado.” Explicar a edição a receber somente quando disponível; não equiparar confirmação a entrega. |
| Confirmação inválida/expirada | “Não foi possível confirmar com este link. Solicite uma nova confirmação.” Prazo e destino dependem do provedor. |
| Já inscrito | Mesmo formulário de e-mail (N09), com “Já assina? Você também pode solicitar esta edição aqui.” Não revelar cadastro publicamente ou duplicar inscrição; validação pelo e-mail e reenvios dependem da integração. |
| Sem edição aprovada | “Ainda não há edição disponível para entrega.” Não inventar uma edição. |
| Falha na entrega após confirmação | Manter confirmação real; informar a indisponibilidade e alternativa aprovada. Não pedir nova inscrição como solução automática. |

Uma inscrição originada em prévia preserva a edição escolhida. N09 define o mesmo formulário para novos/existentes e validação do pedido pelo e-mail, sem login ou exposição cadastral. Não enviar uma edição arbitrariamente só porque um endereço foi digitado. Token, limites/reenvios, duplicidade e tratamento de endereço alterado aguardam contrato real do serviço, sem inventar endpoints ou fornecedor.

**N11 — protótipo:** oferecer estados por controles de revisão identificados no mesmo conjunto, sem páginas editoriais adicionais, coleta/transmissão/persistência de dados reais ou links de confirmação operacionais. Exemplos usam `leitor@example.com`. Estados incluem confirmação inválida/expirada, falha de entrega e cancelamento. A visualização local não afirma inscrição/entrega real.

### Cancelamento e reinscrição

O caminho de cancelamento precisa permitir interromper os próximos envios e comunicar sucesso somente após confirmação real. Textos para revisão:

| Estado | Mensagem |
|---|---|
| Em andamento | “Cancelando inscrição…” |
| Confirmado | “Inscrição cancelada. Você não receberá os próximos envios desta newsletter.” |
| Falha | “Não foi possível concluir o cancelamento. Tente novamente.” |
| Link inválido | “Não foi possível cancelar com este link. Use o caminho de cancelamento disponível em um e-mail da newsletter.” |
| Já cancelado | “Esta inscrição já está cancelada. Você não receberá os próximos envios desta newsletter.” |

Exibir esses estados conforme confirmação real do serviço, sem revelar situação de um endereço a partir de consulta pública não autorizada. O tratamento de link inválido precisa de alternativa operacional validada antes de ativar o cancelamento.

Cancelar não altera o pedido de relatório nem autoriza apagar outros dados; exclusão/retenção são assuntos da revisão de privacidade. Reinscrição exige uma nova escolha explícita do visitante e confirmação conforme processo aprovado. Não reativar assinatura automaticamente por visita à prévia ou pedido de relatório. Tokens, validade de link, mecanismos de atualização e tratamento de falhas dependem do provedor, sem especificar infraestrutura nova.

## Fluxo editorial e integrações futuras

A IA prepara pesquisa/rascunho; uma pessoa revisa fontes/texto/afirmações e aprova cada edição e seu recorte público. N04 mantém essa regra interna, mas a explicação pública trata apenas da curadoria Root Trust. A mesma pesquisa pode orientar LinkedIn com redação própria. CMS externo apoiará uma edição completa e derivação da abertura pública, sem uma segunda prévia escrita separadamente. Não foi escolhido fornecedor nem mecanismo de extração; não publicar rascunhos automaticamente. Pub/sub é possibilidade posterior.

Antes de ativar: escolher CMS e envio; responsável editorial e operação em dias úteis; primeira edição aprovada; versões pública/completa; tratamento de inscrição já confirmada, edição histórica, reenvio, falhas/cancelamento; finalidades, retenção e revisão legal. A página de privacidade depende desses fatos. Nenhum contrato de API, fornecedor, endpoint, base legal ou prazo está autorizado por este documento.

## Verificação das jornadas

No protótipo: percorrer desktop/mobile, teclado/foco, origem de CTA, campos aprovados de diagnóstico, mensagens de todos os estados e separação relatório/newsletter. Simulações devem ser visivelmente identificadas e não transmitir dados. Testar navegação sem mídia e falhas sem perder conteúdo.

Na integração futura: validar recebimento real do diagnóstico; distinguir pedido aceito e entrega; confirmar endereço antes dos envios; preservar edição escolhida; impedir duplicidade involuntária; testar cancelamento/reinscrição; comprovar que respostas das ferramentas não saem do navegador nem são persistidas. Cálculos seguem os modelos escolhidos em F01–F29 e precisam de verificação com exemplos usual/limite/erro na implementação. Concluir documentação não substitui esses testes nem autoriza o lançamento.
