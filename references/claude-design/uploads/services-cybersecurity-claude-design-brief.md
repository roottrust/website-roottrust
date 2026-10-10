# Briefing para Claude Design — Cibersegurança

**Data:** 07/10/2026. **Estado:** decisões de negócio/estrutura S01–S08 e S16 aprovadas na entrevista; nova redação e composição abaixo são propostas para revisão. Página ainda não gerada. Referência: [Home aprovada](../../web/Home.dc.html), [contexto](README.md) e [registro S01–S16](references.md#serviços--s01s16-entrevista-de-07102026). A entrevista atual prevalece sobre propostas antigas de serviços.

## Objetivo e decisões

Aprofundar Cibersegurança para lideranças/equipes de operações críticas, demonstrando capacidade e encaminhando à conversa de qualificação. **Pentest deve ter destaque**, junto à priorização de riscos, organização de acessos e preparação de detecção/resposta.

Rota prevista: `/servicos/ciberseguranca`. Nome sugerido do export: `Servico Ciberseguranca.dc.html`. Não criar uma página separada de Pentest nesta entrega.

| IDs | Contrato aprovado |
|---|---|
| S01 + S16 | Seis seções; S16 remove ferramentas da estrutura inicial. |
| S02–S03 | Home com efeitos contidos, chave 3D na abertura e formulário local ao final. |
| S04–S05 | Quatro frentes da Home; Pentest forte na mensagem e dentro de Diagnóstico de riscos. |
| S06 | Pentest em aplicações web, APIs, redes, infraestrutura e aplicações mobile. |
| S07 | Relatório técnico com evidências/impacto; resumo executivo; recomendações priorizadas. |
| S08 | Reteste após correções conforme escopo e contrato. |

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

O projeto de destino é Next.js App Router, React, TypeScript, npm e CSS Modules/tokens. Esta entrega é um **protótipo Claude Design**, não a inicialização da aplicação. Reutilizar o runtime e Three.js direto existentes; React Three Fiber não foi escolhido. Não instalar bibliotecas, escolher backend ou fixar versões por conta própria.

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

O protótipo demonstra os estados localmente com aviso **“Demonstração — nenhum dado é enviado.”** Usar dados fictícios e controles de revisão identificados; não transmitir ou persistir entradas nem simular uma operação real sem aviso. Focar o primeiro campo inválido e anunciar o resultado de forma acessível.

Canais confirmados: `contato@roottrust.com.br` e `11 94008-4692` (`+55 11 94008-4692`). Integração, responsável, proteção contra abuso, retenção e privacidade continuam pendentes. Não inventar endpoint, política jurídica ou checkbox obrigatório.

## Navegação e conteúdo compartilhado

Proposta de breadcrumb: Home → serviço atual. Cabeçalho/rodapé reutilizam a Home, com links resolvidos para o contexto da interna: Serviços → Home `#servicos`; Ferramentas → Home `#ferramentas`; Newsletter → apresentação existente; diagnóstico → formulário local. Logo volta à Home.

**S16:** não incluir seção, cards, CTA secundário ou links promocionais para ferramentas no conteúdo desta página. O item global Ferramentas permanece na navegação do website. A Root Trust tem somente os três pilares de atuação já confirmados. O hub `/ferramentas` e o diagnóstico dedicado estão adiados.

Em export HTML, conectar arquivos existentes com caminhos relativos; em futura aplicação, usar as rotas do [sitemap](website-content.md). Não fingir que rotas Next já funcionam. Privacidade deve apontar para uma página real quando existir; no protótipo, identificar a indisponibilidade em vez de retornar ao topo.

Não incluir clientes, métricas, cases, depoimentos, preços, prazos de entrega ou certificações sem aprovação. A seção Situações usa **contextos ilustrativos**, não histórias de clientes. A relação entre segurança, infraestrutura e software pode aparecer no texto; não obriga contratar os três.

**Metadados propostos:** título “Cibersegurança e Pentest — Root Trust”; descrição “Pentest, avaliação de riscos, identidade e acesso, monitoramento e resposta a incidentes conforme o contexto da sua operação.” Sem números, canonical ou dados estruturados inventados.

## Pesquisa e aplicação das referências

| Fonte consultada | Uso nesta proposta | Limite |
|---|---|---|
| [Cloudflare — Professional Services](https://www.cloudflare.com/professional-services/) | Referência de explicação da oferta, modalidades de atuação e contato na própria página. | Não importar clientes, resultados, catálogo ou alcance da Cloudflare. |
| [OWASP WSTG v4.2 — Reporting](https://wstg.owasp.org/v4.2/5-Reporting/) | Sustenta a distinção entre resumo executivo e achados técnicos, com impacto e orientação de correção. | Guia sugere uma estrutura, não certifica a Root Trust; aplica-se a testes web e não fundamenta sozinho todos os alvos S06. |

A pesquisa orienta a organização; o catálogo e as entregas da Root Trust vêm da entrevista. A prioridade de Pentest foi confirmada pelo proprietário, não inferida da referência. Não publicar evidências, achados ou dados confidenciais de testes como decoração.

## Anexos e skills para o Claude Design

Na **mesma conversa/projeto** que gerou a Home e as internas:

1. Anexar este briefing atualizado. Se forem enviados os três, instruir a geração de **uma página por rodada**.
2. Manter disponíveis [Home.dc.html](../../web/Home.dc.html) e [pillars3d.js](../../web/pillars3d.js). Eles regem componentes e objetos, não apenas uma imagem de referência. Se o contexto se perdeu, reenviar ambos e [support.js](../../web/support.js).
3. Anexar o [guia v2](../design/brand-design.md) e [design do website](website-design.md); usar o [catálogo](../design/assets-catalog.md) para variantes. Não importar o histórico visual de `temp/`.
4. Se os ativos ainda não estiverem no projeto: [assinatura negativa](../../web/assets/roottrust-horizontal-negativo.svg), [G3](../../web/assets/g3-escuro.svg), [Baloo 2](../design/assets/fonts/baloo-2/baloo-2-variable.ttf), [Archivo](../design/assets/fonts/archivo/archivo-variable.ttf) e suas licenças [Baloo](../design/assets/fonts/baloo-2/OFL.txt)/[Archivo](../design/assets/fonts/archivo/OFL.txt). Preservar também `_ds` e arquivos referenciados pelo export. Usar o mecanismo de anexo disponível; não presumir importação automática de uma pasta.

Se disponíveis no ambiente, citar **frontend-design** para composição e **impeccable** para revisão; **animate** apenas para movimento contido; **threejs-fundamentals**, **threejs-materials**, **threejs-shaders** e **threejs-interaction** para reutilizar o objeto existente. Aplicar **web-design-guidelines** na revisão. Para a portabilidade futura React/Next, **react-best-practices**. A citação não instala skills nem autoriza refazer o objeto ou adicionar dependências.

A orientação oficial recomenda explicar objetivo, público, conteúdo e layout, anexar referências e revisar antes de exportar. Reusar este projeto é nossa escolha para preservar a linguagem já construída. [Claude Design — guia oficial](https://support.claude.com/en/articles/14604416-get-started-with-claude-design).

## Prompt para esta rodada

```text
Continue neste mesmo projeto da Root Trust. Crie SOMENTE a página de Cibersegurança descrita neste briefing. Preserve a Home, as quatro ferramentas e as três páginas de newsletter.

Use este briefing como contrato: seis seções, quatro frentes com os nomes da Home, Pentest em destaque na abertura e detalhado dentro de Diagnóstico de riscos. Não crie um quinto serviço nem página adicional. Inclua aplicações web, APIs, redes, infraestrutura e mobile; relatório técnico com evidências/impacto, resumo executivo e recomendações priorizadas; reteste conforme escopo e contrato.

A conversa gratuita é apenas qualificação. O CTA da abertura e do cabeçalho leva ao formulário local #contato. Nome, Empresa e WhatsApp são obrigatórios; retorno por ligação ou WhatsApp no próximo dia útil. Mostre estados demonstrativos identificados, sem transmissão/persistência.

Herde a Home com efeitos contidos: escuro, Baloo 2/Archivo, assinatura SVG, moldura discreta, painéis e CTA existentes. Reutilize a chave 3D hachurada de pillars3d.js no hero; não reconstrua a identidade ou acrescente outra biblioteca. Fora do hero, priorize HTML e leitura. Mobile empilhado, teclado, pausa/redução de movimento e fallback estático.

Não inclua seção ou links promocionais de ferramentas no conteúdo. Não invente métricas, cases, certificações, SLA, reteste universal ou equipe humana 24x7. Use apenas as fontes/ativos indicados.

Se disponíveis, aplique frontend-design, impeccable e web-design-guidelines; animate e skills Three.js somente para o objeto e interações contidas. Use os textos propostos para uma primeira versão e identifique decisões que exigirem revisão, sem ampliar o escopo.

Entregue a página completa com todas as seções e estados, pronta para revisar em desktop/mobile e exportar com suas dependências locais. Nome sugerido: Servico Ciberseguranca.dc.html. Não entregue apenas um hero.
```

## Revisão e entrega

- [ ] Seis seções de conteúdo, quatro frentes com os nomes da Home e nenhum novo pilar.
- [ ] Oferta, escopo e ressalvas deste briefing presentes; exemplos de entregas não viraram pacote universal.
- [ ] Home, ferramentas e newsletter preservadas; sem seção promocional de ferramentas na interna.
- [ ] Formulário local com os três campos obrigatórios, prazo aprovado e demonstração identificada.
- [ ] Desktop/mobile com conteúdo equivalente; teclado, pausa/redução de movimento e fallback revisáveis.
- [ ] Novo texto/composição marcados para aprovação; sem prova, serviço operacional ou certificação inventados.
- [ ] Export completo com dependências e ativos locais, sem links locais quebrados; fontes e OFL preservadas.

Após revisar a página, exportar no formato que o Claude Design disponibilizar e salvar o conjunto em `web/`. Conferir funcionamento e conteúdo antes de portar para Next.js. Backend/envios/privacidade, aprovação editorial/visual e avaliação de acessibilidade/desempenho são etapas posteriores; presença do HTML não comprova conclusão.
