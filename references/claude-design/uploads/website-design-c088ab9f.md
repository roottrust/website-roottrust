# Design do website — Home aprovada no Claude Design

**Atualizado:** 07/10/2026. **Estado:** Home aprovada; ferramentas e newsletter exportadas; S02 autoriza a direção dos três serviços para prototipar. Fonte da Home: [Home.dc.html](../../web/Home.dc.html), com moldura/laterais. [Auditoria](home-export-audit.md) distingue execução e lacunas. Produto: [briefing](website-brief.md); copy: [conteúdo](website-content.md); comportamento: [jornadas](website-flows.md).

## 1. Autoridade e adaptações aprovadas

A Home substitui A2/Eco, serviços independentes desktop, públicos em quatro linhas e composição clara. Não recuperar árvore, Bonsai, raízes contínuas, portal/personagem ou fotografia.

O [manual](../design/brand-design.md) permanece fonte oficial da marca. A aprovação do export autoriza **nesta Home** estas adaptações, sem mudar regras oficiais de novas peças:

- Fundo UI `#171717`, cards `#1D1D1D` e contornos `#3C3C3C`, combinados à paleta da marca.
- G4 no hero, G3 nas laterais e G2 Abrigo na faixa de público, em vez de uma única família gráfica.
- Cadeado ilustrativo no princípio Presença, além dos objetos técnicos próprios.
- Representações decorativas ASCII. Assinaturas institucionais continuam SVGs prontos; efeitos não comprovam uma checagem real.

Não generalizar adaptações para internas sem decisão. F01 autoriza ferramentas; **N02 autoriza as três páginas de newsletter** e **S02 autoriza as três páginas de serviços** a herdarem a linguagem da Home com efeitos contidos. Isso não reescreve o manual; composições específicas das internas permanecem propostas para revisão. Sinal, selos e “Verificado” não autorizam alegação fictícia de segurança.

## 2. Fundamentos observados

### Temas, cor e tipografia

O export implementa **somente escuro**. Claro/automático constam do histórico; confirmar permanência e composição antes de implementar. Não acrescentar seletor à reprodução por suposição.

| Papel | Valor observado |
|---|---|
| Página/cabeçalho | `#171717` |
| Painéis | `#1D1D1D` |
| Contornos de cards | `#3C3C3C` |
| Faixas de público/contato | Verde Raiz `#003428` |
| Texto principal/CTA claro | Superfície `#F5F5F2` |
| Destaques de títulos/estado | Folha, conforme token do export |
| Apoio/luz | Menta/Musgo, conforme token |
| G2 na faixa verde | Floresta `#175B4B` |

Baloo 2 para títulos; Archivo para corpo/UI; monoespaçada de sistema para terminal/ASCII. Fontes locais em `_ds/assets/fonts`; OFL oficial em `docs/design/assets/fonts`, a preservar na redistribuição.

Medidas vêm do HTML, não da antiga tabela proposta: H1 `clamp(48px,6vw,92px)/1.04`, H2 `clamp(40px,4.4vw,64px)/1.04`, corpo 18px/1.55 e descrição do hero 20px/1.55. Não converter pt do manual diretamente em px.

Moldura máxima 1320px; conteúdo 1200px; padding horizontal `clamp(20px,4vw,60px)`; header 76px. CTAs em cápsula, princípios com abas recortadas, serviços/ferramentas arredondados e divisórias pontilhadas. Preservar essas diferenças.

### Responsividade

- Abaixo de 960px: menu móvel, serviços/processo empilhados e sem ornamentação lateral.
- Abaixo de 900px: ASCII do hero abaixo da mensagem/CTA.
- Abaixo de 560px: CTA sai da barra superior e aparece no menu móvel.
- Ferramentas: quatro/duas/uma coluna conforme espaço.
- Mobile expõe todos os entregáveis/etapas sem depender do pinning.

Chrome testado em 1440×1000 e 390×844, sem overflow horizontal observado. 320px, zoom/reflow, teclado e dispositivos reais ainda precisam de revisão.

## 3. Home por seção

### Cabeçalho e moldura

Assinatura negativa oficial; Serviços → `#servicos`, Ferramentas → `#ferramentas`, Newsletter → `#newsletter`, CTA → `#contato`. Moldura escolhida: linhas, divisórias, cantoneiras e símbolos G3 reativos nas margens. Canvas fixo decorativo sem foco/interceptação, ausente no mobile e recortado nas faixas verdes.

### Hero

Rótulo **Tecnologia para operações críticas**. H1 **Confiabilidade com profundidade.**, segunda linha Folha. Descrição **Cibersegurança, infraestrutura em nuvem e software para operações críticas.** CTA **Solicitar diagnóstico**.

G4 Cadeia ASCII à direita, com revelação, pulsação, fluxo e luz/troca de caracteres perto do ponteiro. **Canvas 2D**, não Three.js. Mobile: arte depois do texto. Preservar área limpa de leitura e reserva de espaço.

### Princípios

**Tecnologia que se explica. Presença que permanece.** Cards com abas, contorno, objeto, explicação e “Na prática”.

| Princípio | Objeto ativo |
|---|---|
| Clareza que traduz | Diamante |
| Presença que ampara | Cadeado |
| Profundidade que inspira confiança | Quatro camadas |

Three.js hachurado, rotação, luz pelo ponteiro e arrasto com retorno suave. Prumo/Âncora são alternativas do editor; Iceberg existe no código, mas não é default. Setas levam ao contato. Copy em [conteúdo](website-content.md).

### Serviços

**Três frentes. Uma base.** Desktop: lista vertical à esquerda e painel compartilhado à direita com objeto, descrição e quatro entregáveis. Scroll seleciona serviço; clique desloca a página ao estado. Troca de objeto por dissolução hachurada.

| Serviço aprovado | Objeto |
|---|---|
| Cibersegurança | Chave |
| Infraestrutura em nuvem | Três servidores |
| Software | Bloco modular de 27 cubos |

Não restaurar três cards independentes desktop. Mobile apresenta os três cards completos. Redução de movimento ativa ao carregar desativa pinning; no desktop o painel continua precisando de seleção utilizável. Texto/entregáveis em HTML.

### Processo

**Da análise à evolução.** Diagnóstico → Estratégia → Implementação → Operação → Evolução. Lista desktop e terminal à direita; scroll/clique alteram etapa e texto digitado. Progresso é ilustrativo, não acompanhamento contratual.

Mobile mostra cinco cards completos. Ressalva: **As etapas podem variar conforme o escopo do projeto.** Existe avanço temporizado em estados sem pinning/sem escolha explícita, quando a redução de movimento está desativada; não descrever toda a lógica como exclusivamente manual.

Serviços/processo acrescentam pistas de `3 × 0,6 × altura da viewport` e `5 × 0,6 × altura da viewport` (4,8 alturas extras). Preservar referência e avaliar conforto, sem bloquear scroll.

### Para quem lidera

Faixa Verde Raiz, G2 Abrigo grande em Floresta e **Operações críticas pedem mais do que tecnologia.** Texto sobre regulação, crescimento e liderança, acomodado à barra do grafismo. Não recuperar quatro linhas/cards anteriores. Asset ativo: `web/assets/g2-abrigo-175b4b.png`.

### Ferramentas

**Ferramentas para decidir.** Quatro cards, objetos Three.js, descrição/seta e **Resultado inicial sem cadastro.**

| Ferramenta | Objeto aprovado na Home |
|---|---|
| ROSI | Balança |
| Shadow AI | Olho |
| Dívida técnica | Engrenagem com dentes faltantes |
| Migração para nuvem | Nuvem com seta ascendente |

Hachuras, volume, luz e movimento seguem o export. Cards hoje apontam a `#contato`: destino provisório, não eliminação das ferramentas futuras. Não inferir fórmula do ícone. Escopo das páginas foi definido via grill-me em F01–F29 no [briefing das ferramentas](tools-claude-design-brief.md); `temp/Ferramentas` permanece referência não aprovada.

### Newsletter

Símbolo ASCII, **Análise em dias úteis.**, descrição e e-mail. Sucesso aprovado: **Inscrição confirmada. A próxima edição chega no próximo dia útil.** Handler apenas altera estado local; não confirma endereço, cadastra ou envia. “Ver edições anteriores” usa `#` e precisa de rota real. Operação em [jornadas](website-flows.md).

### Contato e rodapé

Faixa Verde Raiz: **Vamos cuidar da sua base.** Texto/formulário à esquerda, símbolo ASCII à direita. **Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp.** Nome, Empresa e WhatsApp obrigatórios; não acrescentar e-mail/escolha de canal à reprodução por suposição.

Sucesso aprovado: **Diagnóstico solicitado. A gente retorna por ligação ou WhatsApp no próximo dia útil.** Estado local sem envio; promessa exige operação antes da publicação. Rodapé: assinatura, slogan oficial **A base que sustenta o crescimento!**, atalhos, Privacidade e copyright 2026. Privacidade é placeholder.

## 4. Preservação técnica

[pillars3d.js](../../web/pillars3d.js): geometrias procedurais sem GLB, câmera/luzes → textura → shader de hachuras → canvases visíveis 2D. **Um contexto WebGL compartilhado.** Canvas de apresentação 2D não elimina o 3D da cena original.

O símbolo 3D experimental não está montado no CTA. Hero/moldura/símbolos ativos são Canvas 2D do HTML. Não promover candidatos ou screenshot antigo a elemento aprovado.

Destino: Next.js App Router, React, TypeScript, npm e CSS Modules/tokens. React Three Fiber não foi escolhido. Preservar export; portar componentes sem presumir o interpretador `support.js` como arquitetura da aplicação. Versões CDN observadas não fixam dependências futuras.

## 5. Requisitos ainda não implementados

- Pausa acessível; redução de movimento reagindo a alterações do sistema.
- Preservar limitação fora de tela e completar suspensão em aba oculta; medir antes de impor budgets.
- Fallback estático para carregamento/falha/perda de WebGL e erro de importação.
- Abas com relação painel/controle e teclado adequado, ou semântica simplificada coerente.
- Terminal anunciando etapa/conteúdo completo, sem anunciar caractere por caractere.
- Menu com foco/fechamento revisados, `lang="pt-BR"`, labels, erros e contraste aferidos.
- Rotas/formulários reais, falhas honestas e privacidade correspondente.
- Descarte de recursos e tratamento de pointer cancel.

Completar esses pontos não exige nova proposta visual. Aprovação e execução sem erros não certificam acessibilidade, desempenho ou entrega.

## 6. Internas

Sitemap/jornadas preservados onde não substituídos pela Home. **Ferramentas: Home com efeitos contidos**, direção aprovada em 05/10. Herdar linguagem visual, adaptando efeitos à leitura/preenchimento. F18/F21/F25/F29 definem formulário/checklist em uma página e resultado compacto abaixo; substituem etapas de F02. Sem gráficos ou painel avançado.

Quatro exports de ferramentas estão em `web/`; o [briefing](tools-claude-design-brief.md) permanece contrato para revisar modelos, estados, fontes e exemplos. Esta preparação de newsletter não auditou sua implementação/cálculos. Não copiar hero inteiro/pinning automaticamente ou tratar arquivo gerado como publicação autorizada.

### Newsletter — direção N02 e composição N01/N05–N10

Três internas no mesmo projeto: apresentação/inscrição, arquivo de prévias e prévia individual. [Briefing](newsletter-claude-design-brief.md) contém prompts/anexos; [amostras](newsletter-editorial-samples.md) fornecem conteúdo demonstrativo. Tema escuro, Baloo 2/Archivo, assinatura negativa pronta, tokens, cabeçalho/moldura/divisórias/botões/rodapé compartilhados.

- **Apresentação:** formulário na abertura e pequeno símbolo ASCII existente, seguidos de amostra, benefícios, curadoria/FAQ; não replicar hero G4 gigante.
- **Arquivo:** destaque compacto e lista cronológica, filtro por pilar, paginação; sem imagens obrigatórias, busca ou métricas sociais.
- **Prévia:** título/data/pilar/Curadoria Root Trust, primeiro parágrafo completo e formulário, com retorno ao arquivo. Coluna proposta próxima de 65 caracteres por linha; não comprimir fonte para acomodar texto.
- **Leitura:** margens discretas, sem movimento atrás dos textos; mobile empilhado/filtros quebrando linhas. Conteúdo/controles HTML, sem hover obrigatório.
- **Movimento:** fallback estático, redução dinâmica, pausa se houver animação contínua e suspensão em aba oculta. Sem novo objeto 3D obrigatório, árvore/raízes, fotos ou terminal editorial.

Desenhar estados de pedido/confirmação/erro/cancelamento em área demonstrativa identificada (N11); isso não cria outras páginas editoriais ou serviço operacional. Revisar 320px/390px/1440px, zoom/reflow, labels, teclado, foco e feedback. Contraste/acessibilidade/desempenho não estão certificados. A aprovação desta direção não é aprovação prévia da composição/copy geradas.

## Páginas de serviços — direção S02

Briefings: [Cibersegurança](services-cybersecurity-claude-design-brief.md), [Infraestrutura em nuvem](services-cloud-infrastructure-claude-design-brief.md) e [Software](services-software-claude-design-brief.md). Tema escuro, moldura/componentes da Home e apenas um objeto existente no hero: chave, servidores ou módulos. Não incluir animação contínua atrás de textos, novos assets obrigatórios ou a longa sequência fixada da Home por suposição.

S01 + S16 definem seis seções: abertura, situações, quatro frentes, método, FAQ e formulário final. Sem seção ou links promocionais para ferramentas. S03 mantém CTA `#contato` local e formulário da Home. Mobile expõe todo o conteúdo em HTML; movimento contido, pausa/redução, teclado e fallback continuam requisitos. Redação, arranjo específico e implementação dos briefings aguardam revisão no Claude Design; não foram testados como páginas prontas.
