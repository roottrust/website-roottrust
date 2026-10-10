# Briefing para Claude Design — Infraestrutura em nuvem

**Data:** 07/10/2026. **Estado:** decisões de negócio/estrutura S01–S03, S09–S12 e S16 aprovadas na entrevista; nova redação e composição abaixo são propostas para revisão. Página ainda não gerada. Referência: [Home aprovada](../../web/Home.dc.html), [contexto](README.md) e [registro S01–S16](references.md#serviços--s01s16-entrevista-de-07102026). A entrevista atual prevalece sobre propostas antigas de serviços.

## Objetivo e decisões

Aprofundar Infraestrutura em nuvem para lideranças/equipes de operações críticas, com **continuidade e otimização de custos igualmente visíveis**. O serviço inclui ambientes locais, em nuvem e híbridos, além de redes corporativas. Migrar para nuvem não é uma conclusão automática.

Rota prevista: `/servicos/infraestrutura-em-nuvem`. Nome sugerido do export: `Servico Infraestrutura em nuvem.dc.html`.

| IDs | Contrato aprovado |
|---|---|
| S01 + S16 | Seis seções; S16 remove ferramentas da estrutura inicial. |
| S02–S03 | Home com efeitos contidos, servidores 3D na abertura e formulário local ao final. |
| S09 | Arquitetura e migração; ambientes escaláveis; backup e continuidade; custos sob controle. |
| S10 | Estabilidade/continuidade e otimização de custos; migração conforme contexto. |
| S11 | Visibilidade de gastos/consumo, recursos ociosos e capacidade ajustada à demanda, considerando continuidade/desempenho. |
| S12 | Exemplos de entrega conforme escopo: arquitetura, ambientes/redes, backup/recuperação e ajustes de custos/capacidade. |

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

**Metadados propostos:** título “Infraestrutura em nuvem — Root Trust”; descrição “Ambientes locais, nuvem, redes, backup e capacidade com atenção à continuidade e aos custos da sua operação.” Não inventar localização, provedores ou certificações.

## Pesquisa e aplicação das referências

| Fonte consultada | Uso nesta proposta | Limite |
|---|---|---|
| [Rackspace — Cloud](https://www.rackspace.com/cloud) | Referência de organização de capacidades cloud/híbridas e conexão entre adoção, engenharia e gestão de custos. | Não copiar plataformas, clientes, modalidades ou disponibilidade da Rackspace. |
| [Cloudflare — Professional Services](https://www.cloudflare.com/professional-services/) | Referência de oferta orientada ao contexto com caminho de contato na própria página. | Não importar provas ou serviços da referência. |
| [FinOps Foundation — Usage Optimization](https://www.finops.org/framework/capabilities/usage-optimization/) | Relaciona uso, ociosidade e ajuste de capacidade a custo/desempenho e necessidades do negócio. | Sustenta o conceito, não certifica a Root Trust nem comprova economia. |

A seleção das seis seções é uma adaptação para o escopo confirmado da Root Trust, não uma regra universal demonstrada pelos sites. A página explica contratação; não precisa reproduzir a biblioteca de recursos, cases ou plataformas dessas empresas.

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
Continue no projeto existente da Root Trust. Crie SOMENTE a página de Infraestrutura em nuvem deste briefing. Preserve a Home, ferramentas, newsletter e qualquer página de serviço já gerada.

Entregue seis seções: abertura/CTA, situações, quatro frentes, método, FAQ e CTA/formulário final. Mantenha os nomes Arquitetura e migração, Ambientes escaláveis, Backup e continuidade, Custos sob controle.

Dê igual importância à estabilidade/continuidade e à otimização de custos. Explicite ambientes locais, em nuvem, híbridos e redes. Mostre visibilidade de gastos/consumo, recursos ociosos e ajuste de capacidade à demanda, considerando desempenho e continuidade. Migração depende do contexto; não prometa economia.

Distribua os exemplos de entrega nas frentes: arquitetura documentada, ambientes/redes configurados, rotinas de backup e testes de recuperação, recomendações/ajustes de custos e capacidade. Mostre que dependem do escopo e contrato.

Herde a Home com efeitos contidos, escuro, Baloo 2/Archivo, assinatura SVG, moldura discreta e componentes existentes. Reutilize servidores 3D hachurados de pillars3d.js na abertura. Não acrescente outro renderizador, provedores, gráficos financeiros, fotografia ou animação contínua atrás de texto.

CTA “Solicitar diagnóstico” leva a #contato local. Formulário Nome, Empresa e WhatsApp obrigatórios; conversa inicial gratuita de qualificação; retorno por ligação ou WhatsApp no próximo dia útil. Demonstre estados com aviso de simulação, sem transmissão/persistência.

Sem seção ou links promocionais de ferramentas, clientes, certificações, percentuais de economia ou SLA inventados. Não chamar a oferta de FinOps formal por causa da fonte pesquisada. Mobile empilhado, conteúdo em HTML, teclado, pausa/redução de movimento e fallback estático.

Se disponíveis, use frontend-design, impeccable e web-design-guidelines; animate e skills Three.js apenas para reutilização e movimento contido. Faça a página completa com os textos propostos para revisão, pronta para exportar com suas dependências locais. Nome sugerido: Servico Infraestrutura em nuvem.dc.html.
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

