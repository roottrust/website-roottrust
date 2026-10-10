# Root Trust — auditoria da extração da nova identidade

**Etapa posterior — 04/10/2026:** a extração permanece concluída com os mesmos originais e limites. A [auditoria do export da Home](../../references/audits/home-export-audit.md) é uma avaliação separada, de código/UI e execução no navegador; não estende os testes de extração abaixo para certificação do website. Visual/textos/regras do export foram aprovados; adaptações específicas estão no [design web](../web/design.md#1-autoridade-e-adaptações-aprovadas).

## Resultado e escopo

**Data:** 02/10/2026. **Fonte principal:** [Manual de Marca — New, página Manual de Marca · Raiz](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-2), versão 2 · 2026. O acesso e os exports do Figma foram feitos exclusivamente pelo **Figwright**, sem editar o documento.

O inventário confirma **37 pranchas, 5.316 nodes, 622 textos e 66 instâncias** na página do manual. Os sete capítulos foram extraídos e documentados no [guia de marca](brand-design.md), e cada prancha possui referência PNG local a escala 1, **1920 × 1080 px**. A tabela abaixo oferece a correspondência entre origem, documento e arquivo.

As páginas **Peças digitais** (`193:68`) e **Logo · Versões e conceitos** (`122:2`) foram consultadas para componentes usados pelo manual, instruções de exportação e regras de produção das peças adotadas. A página **Revisão 02 · Diagnóstico e conceito** (`104:2`) foi identificada no inventário e ficou fora do escopo aprovado. **A cobertura integral declarada é das 37 pranchas do manual**, não de todas as camadas das quatro páginas do arquivo. Conceitos exploratórios não foram promovidos a versões aprovadas.

O usuário confirmou que **todo material antigo deve ser desconsiderado**. O novo manual e os arquivos complementares fornecidos orientam este pacote; estilos e variáveis incompatíveis encontrados no mesmo Figma não definem a nova identidade. Não foram incorporados requisitos anteriores de páginas, animação, árvore ASCII, serviços ou funcionalidades do website.

## Método, origens e integridade

1. Confirmar documento e página pelo Figwright; inventariar pranchas e componentes dependentes.
2. Ler textos, propriedades aplicadas, definições de variáveis e estilos em consultas separadas.
3. Exportar referências, vetores e preenchimentos de imagem, preservando seus limites e fundos.
4. Integrar o pacote **Root Trust · Branding**, fornecido pelo usuário, sem modificar seus arquivos.
5. Consolidar diretrizes e catálogo, diferenciando regra escrita, propriedade aplicada, análise derivada e informação não especificada.
6. Conferir arquivos, hashes, SVGs e renderização; concluir a checagem de links dos documentos.

### Arquivos entregues

| Origem | Quantidade | Tratamento |
|---|---:|---|
| Pacote Root Trust · Branding | 211 | Originais relocados, sem alterar bytes, com correspondência de origem e SHA-256 |
| Figwright: exports nativos | 67 | 40 PNGs de referência e 27 SVGs |
| Figwright: preenchimentos originais de imagem | 12 | JPGs na resolução obtida, sem autorização comercial presumida |
| **Total de assets** | **290** | Inventariados no [catálogo](assets-catalog.md) |

O total inclui **127 PNGs, 88 PDFs, 45 SVGs, 12 JPGs, 11 TTFs, 5 TXTs, 1 CSS e 1 ASE**. O CSS da paleta é um original fornecido como asset; não representa implementação de tokens no frontend.

Os **211 hashes dos arquivos do pacote correspondem à baseline anterior à integração**. Os **290 arquivos** presentes correspondem aos respectivos hashes do inventário, sem divergências nesta auditoria. O conjunto mantém a separação entre arquivos fornecidos e exports do Figwright.

O [arquivo .fig original](<Manual de Marca.fig>) permanece com **15.874.976 bytes**. SHA-256 anterior e posterior:

```text
3a4cb8c99cf0526ea6af1ac110201c583067e1e86e0500dff1d6c5914c7f35eb
```

A fonte `.fig` foi preservada; este trabalho não gera uma duplicação editável do documento Figma.

### Rastreabilidade técnica

Os snapshots e relatórios de execução ficam em `temp/new-brand-extraction`: `document.json`, `texts.json`, `variables.json`, `styles.json`, `pages.json`, `source-audit.json`, `native-assets.json`, `package-baseline.json`, `package-assets.json`, `all-assets.json`, `fonts-report.json` e `browser-check.json`. São evidências da execução; o contexto de uso permanece nos Markdowns e assets de `docs/design`.

O catálogo registra origem, IDs quando aplicáveis, formato, dimensões, fundo/transparência, uso e restrições. Para arquivos do pacote, a origem é **arquivo fornecido**, e não um export novo do Figwright. Arquivos de entrega fornecidos não foram redesenhados para reconstruir assinaturas.

## Cobertura das 37 pranchas

**Estado de todas as linhas:** texto e propriedades pertinentes extraídos; regras documentadas; referência local salva. As pranchas de abertura e encerramento registram identificação e organização; não geram novos requisitos de interface.

| Prancha e origem | Capítulo no guia | Referência PNG | Assets ou informação relevante |
|---|---|---|---|
| [01 Capa · `112:7`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-7) | [Fonte e identificação](brand-design.md#fonte-abrangência-e-leitura) | [PNG](assets/references/01-capa.png) | [Assinatura](assets/logos/horizontal/roottrust-horizontal-positivo.svg) |
| [02 Sumário · `112:35`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-35) | [Fonte e identificação](brand-design.md#fonte-abrangência-e-leitura) | [PNG](assets/references/02-sumario.png) | Organização e uso do manual |
| [03 Capítulo 1 · Estratégia · `112:67`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-67) | [1. Estratégia](brand-design.md#1-estratégia) | [PNG](assets/references/03-capitulo-1-estrategia.png) | Abertura de capítulo |
| [04 Posicionamento · `112:75`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-75) | [1. Estratégia](brand-design.md#1-estratégia) | [PNG](assets/references/04-posicionamento.png) | Posicionamento e slogan |
| [05 Pilares e critérios visuais · `112:92`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-92) | [1. Estratégia](brand-design.md#1-estratégia) | [PNG](assets/references/05-pilares-e-criterios-visuais.png) | Pilares de marca e critérios |
| [06 Sentimentos e palavras · `204:520`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=204-520) | [1. Estratégia](brand-design.md#1-estratégia) | [PNG](assets/references/06-sentimentos-e-palavras.png) | Sentimentos e palavras |
| [07 Tom de voz · `113:90`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=113-90) | [1. Estratégia](brand-design.md#1-estratégia) | [PNG](assets/references/07-tom-de-voz.png) | Tom e exemplos editoriais |
| [08 Capítulo 2 · A marca · `113:116`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=113-116) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/08-capitulo-2-a-marca.png) | Abertura de capítulo |
| [09 Conceito da marca · `204:557`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=204-557) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/09-conceito-da-marca.png) | [Símbolo](assets/symbols/roottrust-simbolo-positivo.svg) |
| [10 Anatomia do símbolo · `113:124`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=113-124) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/10-anatomia-do-simbolo.png) | [Anatomia](assets/symbols/roottrust-simbolo-positivo.svg) |
| [11 Construção e proteção · `113:163`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=113-163) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/11-construcao-e-protecao.png) | [Proteção e redução](assets/symbols/roottrust-simbolo-positivo.svg) |
| [12 Símbolos · `204:578`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=204-578) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/12-simbolos.png) | [Símbolo Rocha](assets/symbols/simbolo-rocha.svg) |
| [13 Assinaturas · `113:184`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=113-184) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/13-assinaturas.png) | [Assinaturas](assets/logos/horizontal/roottrust-horizontal-positivo.svg) |
| [14 Versões de cor · `114:2`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=114-2) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/14-versoes-de-cor.png) | [Sinal contextual](assets/logos/horizontal/roottrust-horizontal-branco-neon.svg) |
| [15 Usos incorretos · `114:41`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=114-41) | [2. A marca](brand-design.md#2-a-marca) | [PNG](assets/references/15-usos-incorretos.png) | Usos incorretos |
| [16 Capítulo 3 · Cores · `114:89`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=114-89) | [3. Cores](brand-design.md#3-cores) | [PNG](assets/references/16-capitulo-3-cores.png) | Abertura de capítulo |
| [17 Paleta principal · `114:385`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=114-385) | [3. Cores](brand-design.md#3-cores) | [PNG](assets/references/17-paleta-principal.png) | [Especificação de cores](assets/palette/roottrust-cores.txt) |
| [18 Paleta de apoio e contraste · `114:410`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=114-410) | [3. Cores](brand-design.md#3-cores) | [PNG](assets/references/18-paleta-de-apoio-e-contraste.png) | [Paleta fornecida](assets/palette/roottrust-cores.css) |
| [19 Capítulo 4 · Tipografia · `116:2`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=116-2) | [4. Tipografia](brand-design.md#4-tipografia) | [PNG](assets/references/19-capitulo-4-tipografia.png) | Abertura de capítulo |
| [20 Famílias tipográficas · `116:95`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=116-95) | [4. Tipografia](brand-design.md#4-tipografia) | [PNG](assets/references/20-familias-tipograficas.png) | [Fontes locais](assets/fonts/baloo-2/baloo-2-variable.ttf) |
| [21 Hierarquia tipográfica · `116:110`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=116-110) | [4. Tipografia](brand-design.md#4-tipografia) | [PNG](assets/references/21-hierarquia-tipografica.png) | [Hierarquia](assets/fonts/package-tipografia-readme.txt) |
| [22 Capítulo 5 · Grafismos · `116:135`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=116-135) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/22-capitulo-5-grafismos.png) | Abertura de capítulo |
| [23 Grafismos · visão geral · `116:153`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=116-153) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/23-grafismos-visao-geral.png) | [Sistema de grafismos](assets/graphics/g1-eco-da-raiz-escuro-figma.svg) |
| [24 Grafismo G1 · Eco da raiz · `117:2`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=117-2) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/24-grafismo-g1-eco-da-raiz.png) | [G1](assets/graphics/g1-eco-da-raiz-escuro-figma.svg) |
| [25 Grafismo G2 · Abrigo · `117:119`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=117-119) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/25-grafismo-g2-abrigo.png) | [G2](assets/graphics/g2-abrigo-escuro-figma.svg) |
| [26 Grafismo G3 · Campo de verificação · `117:164`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=117-164) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/26-grafismo-g3-campo-de-verificacao.png) | [G3](assets/graphics/g3-campo-de-verificacao-claro-figma.svg) |
| [27 Grafismo G4 · Cadeia de confiança · `117:1935`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=117-1935) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/27-grafismo-g4-cadeia-de-confianca.png) | [G4](assets/graphics/g4-cadeia-de-confianca-quente-figma.svg) |
| [28 Regras dos grafismos · `118:2`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=118-2) | [5. Grafismos](brand-design.md#5-grafismos) | [PNG](assets/references/28-regras-dos-grafismos.png) | Combinação e restrições |
| [29 Capítulo 6 · Fotografia · `118:39`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=118-39) | [6. Fotografia](brand-design.md#6-fotografia) | [PNG](assets/references/29-capitulo-6-fotografia.png) | Abertura de capítulo |
| [30 Direção de fotografia · `118:132`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=118-132) | [6. Fotografia](brand-design.md#6-fotografia) | [PNG](assets/references/30-direcao-de-fotografia.png) | [Referência de fotografia](assets/photography/retrato-luz-natural.jpg) |
| [31 Capítulo 7 · Aplicações · `118:155`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=118-155) | [7. Aplicações](brand-design.md#7-aplicações) | [PNG](assets/references/31-capitulo-7-aplicacoes.png) | Abertura de capítulo |
| [32 Papelaria · `119:2`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=119-2) | [7. Aplicações](brand-design.md#7-aplicações) | [PNG](assets/references/32-papelaria.png) | [Assinatura de e-mail](assets/references/aplicacao-assinatura-email.png) |
| [33 LinkedIn e redes · `119:223`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=119-223) | [7. Aplicações](brand-design.md#7-aplicações) | [PNG](assets/references/33-linkedin-e-redes.png) | [Banner pessoal](assets/references/aplicacao-linkedin-banner-pessoal.png) |
| [34 Proposta e apresentação · `119:644`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=119-644) | [7. Aplicações](brand-design.md#7-aplicações) | [PNG](assets/references/34-proposta-e-apresentacao.png) | [Abrigo](assets/graphics/g2-abrigo-escuro-figma.svg) |
| [35 Selo de verificação · `195:421`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=195-421) | [7. Aplicações](brand-design.md#7-aplicações) | [PNG](assets/references/35-selo-de-verificacao.png) | [Selos](assets/seals/selo-horizontal-claro.svg) |
| [36 Mockups · `125:81`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=125-81) | [7. Aplicações](brand-design.md#7-aplicações) | [PNG](assets/references/36-mockups.png) | [Mockups](assets/photography/mockup-estande-evento.jpg) |
| [37 Contracapa · `119:762`](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=119-762) | [Fonte e identificação](brand-design.md#fonte-abrangência-e-leitura) | [PNG](assets/references/37-contracapa.png) | [Assinatura](assets/logos/horizontal/roottrust-horizontal-positivo.svg) |

## Conferências e limites que afetam o uso

### Regras escritas, propriedades e definições antigas

| Constatação | Evidência | Tratamento no pacote |
|---|---|---|
| A coleção tem 15 variáveis de cor, uma modalidade e nomes/valores incompatíveis com o novo manual | Snapshot `variables.json`; pranchas 17–18 | Não usar a coleção como paleta aprovada. A especificação escrita das pranchas e o arquivo de cores fornecido orientam o guia |
| Existem 9 estilos locais de texto, incluindo Display/Logotipo em Bold e Técnico/Mono em Ubuntu Mono | Snapshot `styles.json` | Não promover estilos antigos à hierarquia. A regra do lettering é Baloo 2 SemiBold; o novo manual apresenta apenas Baloo 2 e Archivo |
| Os 622 textos do manual usam Archivo ou Baloo 2 | 525 camadas Archivo e 97 Baloo 2 | Ubuntu Mono não foi incluída como família aprovada pela presença do estilo antigo |
| A hierarquia editorial está escrita em pt, enquanto propriedades do Figma estão em px | Prancha 21, `116:113`, `116:116`, `116:119`, `116:122` | Preservar unidades e contexto; nenhuma conversão automática ou escala responsiva foi definida |
| O corpo tem entrelinha escrita de 155%, mas o exemplo aplicado utiliza 120% | Regra `116:120`; camada `116:119` | Manter a regra editorial de 155% como orientação, registrando 120% como propriedade do exemplo |
| A redução declara 16 px no digital e 8 mm no impresso, sem eixo ou mínimo próprio da assinatura completa | `113:183`; favicon `204:627–628` | Não interpretar 16 px como largura da assinatura completa. O favicon ilustrado tem canvas de 16 px e símbolo interno de aproximadamente 12,96 px |

A ausência de determinados campos de vínculo no snapshot não comprova ausência de vínculos no documento nativo. As decisões são sustentadas pelas regras escritas, propriedades disponíveis e confirmação de precedência do usuário.

### Grafismos: export, desenho completo e nomenclatura

- **G1:** o frame de ondas e o símbolo central são nodes distintos nas demonstrações. O export das ondas não inclui automaticamente o símbolo/lettering vizinho. O pacote fornecido também entrega G1 sem logo; a composição precisa observar a centralização e as regras do guia.
- **Recortes:** miniaturas de G2, G3 e G4 têm contexto de 184 × 184 px e contêm desenhos de aproximadamente 327,11 × 184 px. Os exports nativos preservam os limites do contexto, incluindo recorte. O tamanho da camada não deve ser confundido com o viewBox do arquivo final. Para grafismos completos, usar as versões integrais fornecidas e catalogadas.
- **Fundo:** grafismos exportados podem incluir base opaca como parte da composição, mesmo quando o frame exterior não tem preenchimento. Não presumir transparência a partir do nome ou da propriedade do frame.
- **Nomes antigos:** alguns frames externos do G1/G4 ainda se chamam “digital”, mas rótulos visíveis e filhos identificam a variante **Rocha**. O catálogo usa a variante apresentada no novo manual. G2/G3 preservam a variante Digital somente tela.
- **G1 transparente:** os arquivos fornecidos utilizam opacidade nas ondas, enquanto a regra escrita determina cinco etapas sólidas. Essa característica é registrada no guia como propriedade do asset, sem criar outra regra geral.
- **Uso:** um grafismo por página/peça; tom sobre tom; restrições atrás de texto/fotografia; cadeia diagonal ascendente. Disponibilidade de cor ou arquivo não amplia essas autorizações.

### Sinal, selos e conteúdo das aplicações

O Sinal `#00D63D` é **somente tela**. No logo, círculo Sinal aparece apenas na confirmação positiva de uma checagem de segurança, com **“Verificado” escrito**; versões “neon” seguem a mesma restrição. Não foi convertido em cor principal, CTA geral ou autorização de uso institucional.

Foram extraídas as **seis variantes de selos**, horizontal/compacto/redondo, claro/escuro. O guia mantém largura mínima, proteção, proibições e link obrigatório. A imagem do selo não comprova verificação, certificação ou auditoria. A URL exemplificada não determina uma rota implementada nem um processo operacional do website.

O post demonstrativo com **99,98% de disponibilidade**, os nomes, cargos, telefones, e-mails e domínios das aplicações permanecem **conteúdo de exemplo**. Não foram convertidos em provas, SLA ou contatos públicos aprovados. Da mesma forma, etapas do slide e mockups não estabelecem catálogo de serviços, funcionalidades ou layout de website.

### Fotografias e direitos

Os **12 preenchimentos JPG originais** incluem cinco referências de fotografia e sete mockups. Os nodes com prefixo `[IMAGEM]` possuem preenchimento real; o nome não foi usado para classificá-los como placeholders vazios.

A extração preserva dimensões obtidas e identifica os nodes no catálogo. **Direitos comerciais, autoria, releases e licenças das fotografias não foram comprovados.** Sua presença no manual permite analisá-las como referência, sem autorização automática de publicação. A regra de apoio técnico em menor destaque, nunca como imagem principal de capa, foi mantida.

### Fontes, licenças e origem

O pacote contém arquivos TTF estáticos/variáveis e respectivas licenças **SIL OFL 1.1**. As famílias foram confirmadas nas camadas do novo Figma. Os arquivos não são binários extraídos pelo Figwright; sua origem fica identificada no catálogo.

A distribuição oficial do [Google Fonts](https://github.com/google/fonts/tree/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl) foi consultada na revisão `9710da1eacb3be272583c3224dcb70f9da6eadbb`, com verificação de binários, tabelas TrueType, eixos e arquivos de licença. O relatório registra **Baloo 2 versão 1.700** e **Archivo versão 2.001**; a versão instalada no Figma do designer não é disponibilizada pelo documento e não foi presumida.

- Baloo 2 variável: eixo `wght` 400–800; arquivo e licença presentes.
- Archivo variável: `wght` 100–900 e `wdth` 62–125; o binário tem peso padrão 600. Esse padrão técnico não substitui os pesos de uso prescritos no manual.
- Archivo itálico foi preservado como arquivo fornecido; sua disponibilidade não estabelece novo papel tipográfico na marca.
- Não houve subsetting, conversão para WOFF2 ou instalação das fontes no sistema.

As licenças ficam junto aos arquivos e devem acompanhar a redistribuição. A verificação de origem não transforma o conteúdo de referência em nova regra de interface.

## Contraste: verificação reproduzível

Foram recalculados os HEX escritos na prancha 18 com luminância relativa sRGB. Cada canal normalizado `c` usa `c/12,92` quando `c ≤ 0,04045`, e `((c+0,055)/1,055)^2,4` nos demais casos. A luminância é `0,2126R + 0,7152G + 0,0722B`; a razão é `(Lmaior + 0,05) / (Lmenor + 0,05)`. Não foi aplicada transparência.

| Par | Manual | Cálculo | Resultado da comparação |
|---|---:|---:|---|
| Verde Raiz / Superfície, nos dois sentidos | 12,6:1 | 12,633167:1 | Confere ao arredondar para uma casa |
| Terracota / Verde Raiz | 8,5:1 | 8,494114:1 | Confere |
| Menta / Verde Raiz | 10,7:1 | 10,682157:1 | Confere |
| Musgo / Superfície | 5,4:1 | 5,413694:1 | Confere |
| Verde Raiz / Areia clara | 10,2:1 | 10,193880:1 | Confere |
| Musgo / Areia clara | 4,4:1 | 4,368386:1 | Confere; não atende AA de texto comum |
| Sinal / Superfície | 1,8:1 | 1,799139:1 | Confere; não atende o mínimo de texto |

As oito linhas editoriais correspondem a **sete pares distintos**, porque as duas direções de Verde Raiz/Superfície têm a mesma razão. A conferência é análise derivada, separada da classificação escrita. Referência: [W3C, contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum). Não arredondar uma razão abaixo do limiar para aprová-la. Não há alegação de acessibilidade integral do website.

## Validação executada e checagem final

| Verificação | Estado nesta auditoria |
|---|---|
| Cobertura das 37 pranchas e correspondência com PNGs | Confirmada |
| 211 arquivos fornecidos versus baseline anterior | SHA-256 correspondente em 211/211 |
| 290 assets versus inventário final | Arquivos presentes; SHA-256 correspondente em 290/290 |
| Preservação do `.fig` | SHA-256 anterior/posterior correspondente |
| SVGs carregados em navegador | **45/45**, zero erros, conforme `browser-check.json`, Chrome headless |
| Origem, estrutura TrueType e licenças oficiais de fontes pesquisadas | Registradas em `fonts-report.json` e no catálogo |
| Links locais e âncoras dos quatro Markdowns e arquivos de contexto | **438 links locais válidos**, incluindo âncoras; nenhum arquivo ausente |
| Dimensões, assinaturas de formato, XML e referências externas dos SVGs | **290 assets válidos**, 45 SVGs com XML válido e sem dependências externas; nenhum arquivo vazio |

O carregamento dos SVGs detecta falhas de leitura/renderização, mas não prova sozinho fidelidade visual, escala final ou direitos. A inspeção visual e os registros do guia/catalogação complementam esse resultado.

### Informações não definidas pela fonte

Persistem somente limites explícitos do material: eixo da redução mínima, mínimo próprio da assinatura completa, direitos das fotografias, versão das fontes instalada no Figma e condições operacionais de verificação dos selos. Esses pontos não foram preenchidos por suposição. A documentação permite uso da identidade respeitando suas restrições; decisões de frontend, adaptação responsiva, desempenho, acessibilidade da interface e funcionalidades exigem trabalho posterior.

