# Design do website

## Aceite operacional — 19/10/2026

**Piloto restrito concluído e aceito por Renato.** Diagnóstico, quatro relatórios, newsletter agendada com aprovação humana, publicação/envio, confirmação/cancelamento e backup/restauração foram validados. Renato é responsável pela conferência de cotas e pela guarda/descarte de backups, CSVs, mensagens e contatos nos provedores. Procedimento e limitações em [development.md](development.md#responsabilidade-operacional-e-limites-do-aceite). O [plano arquivado](../plans/integrations-pilot-completed.md#encerramento-e-aceite-final--19102026) preserva as evidências. Este estado prevalece sobre propostas e pendências históricas abaixo. Não há autorização de abertura pública nem alteração das allowlists.


**Atualizado:** 11/10/2026. Os 12 exports aprovados foram movidos intactos para `references/claude-design/` e auditados em 09/10. Eles continuam como referência de visual e conteúdo durante a portabilidade; corrigir as lacunas técnicas sem redesenho. Fonte da Home: [Home.dc.html](../../references/claude-design/Home.dc.html), com moldura/laterais. [Auditoria](../../references/audits/home-export-audit.md) registra execução e lacunas. Produto e decisões estão em [product.md](product.md).

## 1. Autoridade e adaptações aprovadas

A Home substitui A2/Eco, serviços independentes desktop, públicos em quatro linhas e composição clara. Não recuperar árvore, Bonsai, raízes contínuas, portal/personagem ou fotografia.

O [manual](../design/brand-design.md) permanece fonte oficial da marca. A aprovação do export autoriza **nesta Home** estas adaptações, sem mudar regras oficiais de novas peças:

- Fundo UI `#171717`, cards `#1D1D1D` e contornos `#3C3C3C`, combinados à paleta da marca.
- G4 no hero, G3 nas laterais e G2 Abrigo na faixa de público, em vez de uma única família gráfica.
- Cadeado ilustrativo no princípio Presença, além dos objetos técnicos próprios.
- Representações decorativas ASCII. Assinaturas institucionais continuam SVGs prontos; efeitos não comprovam uma checagem real.

Não generalizar adaptações para internas sem decisão. F01 autoriza ferramentas; **N02 autoriza as três páginas de newsletter** e **S02 autoriza as três páginas de serviços** a herdarem a linguagem da Home com efeitos contidos. Isso não reescreve o manual; as composições dos 12 exports aprovados são a baseline atual e foram portadas, preservando adaptações funcionais auditadas. Sinal, selos e “Verificado” não autorizam alegação fictícia de segurança.

## 2. Fundamentos observados

### Temas, cor e tipografia

A entrega aprovada usa **somente o tema escuro** (D03). Não implementar tema claro/automático nesta fase.

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

Baloo 2 para títulos; Archivo para corpo/UI; monoespaçada de sistema para terminal/ASCII. No export, fontes em `_ds/assets/fonts`; na aplicação, cópias locais rastreáveis via `next/font/local`; OFL oficial em `docs/design/assets/fonts`, a preservar na redistribuição.

Medidas vêm do HTML, não da antiga tabela proposta: H1 `clamp(48px,6vw,92px)/1.04`, H2 `clamp(40px,4.4vw,64px)/1.04`, corpo 18px/1.55 e descrição do hero 20px/1.55. Não converter pt do manual diretamente em px.

Moldura máxima 1320px; conteúdo 1200px; padding horizontal `clamp(20px,4vw,60px)`; header 76px. CTAs em cápsula, princípios com abas recortadas, serviços/ferramentas arredondados e divisórias pontilhadas. Preservar essas diferenças.

### Responsividade

- Abaixo de 960px: menu móvel, serviços/processo empilhados e sem ornamentação lateral.
- Abaixo de 900px: ASCII do hero abaixo da mensagem/CTA.
- Abaixo de 560px: CTA sai da barra superior e aparece no menu móvel.
- Ferramentas: quatro/duas/uma coluna conforme espaço.
- Mobile expõe todos os entregáveis/etapas sem depender do pinning.

Chrome testado em 1440×1000 e 390×844, sem overflow horizontal observado. Reflow em 320px e viewports equivalentes a 200%/400%, teclado Chromium e smoke Firefox/WebKit foram verificados. Zoom real, dispositivos físicos e leitor de tela não foram certificados.

## 3. Home por seção

### Cabeçalho e moldura

Assinatura negativa oficial; Serviços → `#servicos`, Ferramentas → `#ferramentas`, Newsletter → `/newsletter` em desktop e mobile, em todas as páginas (D11; o footer e a âncora `#newsletter` da Home permanecem inalterados), CTA → `#contato`. Âncoras da Home e entre rotas usam rolagem por rAF de 350–900 ms, destino adaptativo, offset 96 e interrupção por interação do usuário; reduced-motion e pausa global rolam instantaneamente e não há CSS `scroll-behavior: smooth` global (D14); links de página não recebem transição artificial. Moldura escolhida: linhas, divisórias, cantoneiras e símbolos G3 reativos nas margens. Canvas fixo decorativo sem foco/interceptação, ausente no mobile e recortado nas faixas verdes.

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

Three.js hachurado, rotação, luz pelo ponteiro e arrasto com retorno suave. Prumo/Âncora são alternativas do editor; Iceberg existe no código, mas não é default. Setas levam ao contato. Copy em [conteúdo](product.md).

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

Faixa Verde Raiz, G2 Abrigo grande em Floresta e **Operações críticas pedem mais do que tecnologia.** Texto sobre regulação, crescimento e liderança, acomodado à barra do grafismo. Não recuperar quatro linhas/cards anteriores. No export, asset `assets/g2-abrigo-175b4b.png`; a aplicação utiliza a cópia pública rastreada no catálogo de publicação.

### Ferramentas

**Ferramentas para decidir.** Quatro cards, objetos Three.js, descrição/seta e **Resultado inicial sem cadastro.**

| Ferramenta | Objeto aprovado na Home |
|---|---|
| ROSI | Balança |
| Shadow AI | Olho |
| Dívida técnica | Engrenagem com dentes faltantes |
| Migração para nuvem | Nuvem com seta ascendente |

Hachuras, volume, luz e movimento seguem o export. Na aplicação, os cards levam às quatro rotas de ferramentas; o destino `#contato` do export era provisório. Não inferir fórmula do ícone. Escopo das páginas foi definido via grill-me em F01–F29 no [briefing das ferramentas](tools.md); `temp/Ferramentas` permanece referência não aprovada.

### Newsletter

Símbolo ASCII, **Análise em dias úteis.**, descrição e e-mail. Histórico do export: **Inscrição confirmada. A próxima edição chega no próximo dia útil.** A aplicação substitui esse falso sucesso pelo contrato D10: modo padrão indisponível; demo explícito aceita apenas pedido local, sem confirmação/envio. “Ver edições anteriores” leva ao arquivo real. Operação em [jornadas](product.md).

### Contato e rodapé

Faixa Verde Raiz: **Vamos cuidar da sua base.** Texto/formulário à esquerda, símbolo ASCII à direita. **Conversa inicial gratuita de qualificação. Retorno por ligação ou WhatsApp.** Nome, Empresa e WhatsApp obrigatórios; não acrescentar e-mail/escolha de canal à reprodução por suposição.

Histórico do export: **Diagnóstico solicitado. A gente retorna por ligação ou WhatsApp no próximo dia útil.** Na aplicação, aviso e estados locais não confirmam recebimento; a promessa exige integração real antes da publicação. Rodapé: assinatura, slogan oficial **A base que sustenta o crescimento!**, atalhos, Privacidade e copyright 2026. A rota de privacidade é provisória e descreve honestamente a operação local.

## 4. Preservação técnica

[pillars3d.js](../../references/claude-design/pillars3d.js): geometrias procedurais sem GLB, câmera/luzes → textura → shader de hachuras → canvases visíveis 2D. **Um contexto WebGL compartilhado.** Canvas de apresentação 2D não elimina o 3D da cena original.

O símbolo 3D experimental não está montado no CTA. Hero/moldura/símbolos ativos são Canvas 2D do HTML. Não promover candidatos ou screenshot antigo a elemento aprovado.

Destino: Next.js App Router, React, TypeScript, npm e CSS Modules/tokens. React Three Fiber não foi escolhido. Preservar export; portar componentes sem presumir o interpretador `support.js` como arquitetura da aplicação. Versões CDN observadas não fixam dependências futuras.

## 5. Correções implementadas na portabilidade

- Pausa acessível; redução de movimento reagindo a alterações do sistema.
- Suspensão fora de tela/aba oculta implementada; cobertura de aba realmente oculta limitada pelos skips descritos abaixo.
- Fallback estático para carregamento/falha/perda de WebGL e erro de importação.
- Abas com relação painel/controle e teclado adequado, ou semântica simplificada coerente.
- Terminal anunciando etapa/conteúdo completo, sem anunciar caractere por caractere.
- Menu com foco/fechamento revisados, `lang="pt-BR"`, labels, erros e contraste aferidos.
- Rotas/formulários locais, falhas honestas e privacidade correspondente.
- Descarte de recursos e tratamento de pointer cancel.

A lista acima registra as lacunas históricas corrigidas em código. Contraste/acessibilidade completos não são certificados. Formulários/rotas são locais; recebimento e envio reais continuam fora do escopo.

PillarArt carrega Three/runtime ao entrar no viewport (no mount quando IntersectionObserver não existe), conserva fallback até o primeiro desenho bem-sucedido e descarta inicializações tardias. Pausa SPA, redução dinâmica, suspensão e descarte têm testes; perda de contexto mantém instâncias já montadas em falha, sem impedir novas instâncias futuras. Aba realmente oculta teve dois testes pulados no headless; não declarar essa cobertura real como aprovada. [Evidências finais](../../references/audits/final-qa.md).

## 6. Internas

Sitemap/jornadas preservados onde não substituídos pela Home. **Ferramentas: Home com efeitos contidos**, direção aprovada em 05/10. Herdar linguagem visual, adaptando efeitos à leitura/preenchimento. F18/F21/F25/F29 definem formulário/checklist em uma página e resultado compacto abaixo; substituem etapas de F02. Sem gráficos analíticos ou painel avançado; objetos decorativos permanecem.

Os quatro exports de ferramentas estão em `references/claude-design/`; o [briefing](tools.md) permanece contrato para revisar modelos, estados, fontes e exemplos. A implementação local e os modelos foram revisados e testados; isso não certifica a operação futura. Não copiar hero inteiro/pinning automaticamente ou tratar arquivo gerado como publicação autorizada.

### Newsletter — direção N02 e composição N01/N05–N10

Três internas no mesmo projeto: apresentação/inscrição, arquivo de prévias e prévia individual. [newsletter.md](newsletter.md) contém decisões de produto e estados; [amostras](../../references/editorial/newsletter-editorial-samples.md) fornecem conteúdo demonstrativo. Tema escuro, Baloo 2/Archivo, assinatura negativa pronta, tokens, cabeçalho/moldura/divisórias/botões/rodapé compartilhados.

- **Apresentação:** formulário na abertura e pequeno símbolo ASCII existente, seguidos de amostra, benefícios, curadoria/FAQ; não replicar hero G4 gigante.
- **Arquivo:** destaque compacto e lista cronológica, filtro por pilar, paginação; sem imagens obrigatórias, busca ou métricas sociais.
- **Prévia:** título/data/pilar/Curadoria Root Trust, primeiro parágrafo completo e formulário, com retorno ao arquivo. Coluna proposta próxima de 65 caracteres por linha; não comprimir fonte para acomodar texto.
- **Largura (D13):** na estrutura, título, lista e card do arquivo/prévia usar a largura útil de 1200 px em 1440; parágrafos de leitura ficam em 65ch; grade a partir de 960 px; landing inalterada. Select nativo com `appearance: none`, ícone de 12×8 px com recuo direito de 16 px e padding-right 44 px; forced-colors permanece nativo.
- **Leitura:** margens discretas, sem movimento atrás dos textos; mobile empilhado/filtros quebrando linhas. Conteúdo/controles HTML, sem hover obrigatório.
- **Movimento:** fallback estático, redução dinâmica, pausa se houver animação contínua e suspensão em aba oculta. Sem novo objeto 3D obrigatório, árvore/raízes, fotos ou terminal editorial.

N11 registra estados de pedido, confirmação, erro e cancelamento. Pelo contrato D10, `FORM_MODE=demo` simula localmente somente andamento, pedido aceito aguardando confirmação e erro; não simular confirmação, entrega ou cancelamento sem operação real. Revisar 320px/390px/1440px, zoom/reflow, labels, teclado, foco e feedback. Contraste/acessibilidade/desempenho não estão certificados.

## Páginas de serviços — direção S02

Copy proposta: [copy proposta de Cibersegurança](product.md#conteúdo-proposto--cibersegurança), [Infraestrutura em nuvem](product.md#conteúdo-proposto--infraestrutura-em-nuvem) e [Software](product.md#conteúdo-proposto--software). Tema escuro, moldura/componentes da Home e apenas um objeto existente no hero: chave, servidores ou módulos. Não incluir animação contínua atrás de textos, novos assets obrigatórios ou a longa sequência fixada da Home por suposição.

S01 + S16 definem seis seções: abertura, situações, quatro frentes, método, FAQ e formulário final. Sem seção ou links promocionais para ferramentas. S03 mantém CTA `#contato` local e formulário da Home. Mobile expõe todo o conteúdo em HTML; movimento contido, pausa/redução, teclado e fallback continuam requisitos. Os exports das páginas de serviço são a referência visual/conteúdo aprovada em D02; revisar a implementação e aplicar os achados da auditoria na portabilidade.




### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 (ver [development.md](development.md)):** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.
