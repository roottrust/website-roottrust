# Extração da nova identidade Root Trust — Markdowns e assets

## 1. Problema e resultado esperado

Preparar um pacote fiel ao novo manual de marca, dentro de `docs/design`, para orientar o desenvolvimento posterior do website.

**Entrega aprovada:** documentação dos sete capítulos do manual, ativos locais reutilizáveis, referências visuais e auditoria de cobertura. Esta etapa não cria páginas, componentes, tokens CSS ou novas decisões de interface.

**Fonte principal:** [Manual de Marca — New](https://www.figma.com/design/fZrFBBmDE3gQK3MHYIqiho/Manual-de-Marca---New?node-id=112-2), acessado **exclusivamente pelo Figwright** durante a execução.

O material anterior permanece em `temp/OldDesign`, como histórico. Suas cores, assets e propostas de website não serão incorporados ao novo pacote.

## 2. Pesquisa realizada e restrições

### Repositório — estado no planejamento

- `docs/design` contém somente `Manual de Marca.fig`.
- `web/` e `api/` estão vazios; não existem testes ou pipelines da aplicação.
- O `PLAN.md` registra a consolidação anterior, concluída.
- O `AGENTS.md` referencia um guia movido e fixa cores da identidade antiga.
- O arquivo `.fig` informa o nome “Manual de Marca - New” e exportação em **02/10/2026**. Será preservado integralmente.

### Figma

A inspeção preliminar, realizada antes da restrição ao Figwright, identificou **37 pranchas**, organizadas em:

1. Estratégia.
2. Marca.
3. Cores.
4. Tipografia.
5. Grafismos.
6. Fotografia.
7. Aplicações.

Também revelou alterações relevantes de símbolo, paleta, slogan e lettering. **Esses resultados serão reconferidos pelo Figwright antes de entrarem na documentação definitiva.**

### Referências técnicas

- O Figma permite exportação SVG com lettering convertido em contornos, evitando dependência da fonte para reproduzir a assinatura. A configuração e o resultado deverão ser conferidos nos exports. [Figma: ExportSettings](https://developers.figma.com/docs/plugins/api/ExportSettings/)
- Contraste será calculado separadamente das regras oficiais: referência de 4,5:1 para texto comum e 3:1 para texto grande. Isso não comprova acessibilidade do futuro website. [W3C: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- Arquivos de fontes somente serão incluídos com origem e licença verificadas; a licença correspondente acompanhará os binários. [Google Fonts: requisitos de licença](https://googlefonts.github.io/gf-guide/license-file.html)

Não há infraestrutura Ford envolvida nem serviço SQL de sessões/tarefas disponível. O histórico desta conversa e os documentos locais sustentam a pesquisa.

## 3. Registro de decisões

| Questão | Decisão confirmada | Consequência |
|---|---|---|
| Entrega desta etapa | Markdowns e assets | Implementação visual e CSS ficam para outra etapa |
| Abrangência | Manual completo | Cobrir os sete capítulos, incluindo regras das aplicações |
| Acesso ao Figma | Somente Figwright | Sem fallback pelo conector oficial ou API alternativa |
| AGENTS.md | Correção limitada às referências de marca | Corrigir caminho e orientação de paleta; preservar demais instruções |
| Local dos novos materiais | `docs/design` | Um pacote independente da documentação antiga |
| Precedência das fontes | Desconsiderar toda identidade antiga | Regras do novo manual prevalecem sobre variáveis e estilos incompatíveis |
| Pacote fornecido | Integrar Root Trust · Branding em `docs/design` | Preservar arquivos originais e aproveitar assinaturas prontas; exportar complementos pelo Figwright |

## 4. Organização e abordagem

### Documentos

| Documento | Responsabilidade |
|---|---|
| `README.md` | Entrada do pacote, fonte, versão, ordem de leitura e limites |
| `brand-design.md` | Diretrizes oficiais consolidadas dos sete capítulos |
| `assets-catalog.md` | Inventário, variantes, usos, fundos, origem e direitos dos assets |
| `extraction-audit.md` | Cobertura das pranchas, divergências, validações e pendências |

Os documentos serão escritos em português, com links locais relativos e links para os nodes de origem.

### Assets

Dentro de `docs/design/assets`, criar somente categorias com arquivos efetivamente obtidos:

```text
logos/
symbols/
graphics/
seals/
photography/
fonts/
references/
palette/
```

- **SVG:** assinaturas, símbolos, grafismos e selos vetoriais.
- **Formato raster original:** imagens usadas como preenchimentos, preservando resolução.
- **PNG:** referências das pranchas, em escala 1.
- **Fontes:** arquivos redistribuíveis, acompanhados de licença e origem.

Usar nomes descritivos em kebab-case, incluindo variante quando necessário, por exemplo `assinatura-horizontal-negativa.svg`. Os nomes finais dependerão das variantes existentes no novo manual.

Cada asset terá node de origem, caminho, formato, dimensões, fundo/transparência, finalidade, restrições e situação dos direitos registrados no catálogo. Arquivos duplicados poderão compartilhar um único asset, mantendo todas as referências de origem.

### Tratamento das informações

Distinguir explicitamente:

- **Regra oficial:** texto, valor ou orientação encontrados no Figma.
- **Observação técnica:** característica constatada em um export.
- **Análise derivada:** contraste calculado ou comparação entre evidências.
- **Pendência:** informação ausente, contraditória ou inacessível.

Não transformar tamanhos editoriais em escala responsiva, proporções cromáticas em layout obrigatório, aplicações em páginas aprovadas ou selos em certificações comerciais.

## 5. Fases e tarefas

### Fase 1 — Validar conexão e inventariar a fonte

#### 1.1 — Confirmar o Figwright e o arquivo conectado

Verificar as ferramentas disponíveis, testar a conexão e confirmar documento e página correspondentes ao URL informado.

**Depende de:** ferramentas Figwright disponíveis.

**Aceite:**

- [x] Conexão Figwright respondendo.
- [x] Documento correto identificado por nome e evidências disponíveis.
- [x] Página `112:2` localizada.
- [x] Nenhum conector alternativo utilizado.

#### 1.2 — Inventariar pranchas e dependências

Listar páginas, pranchas, componentes reutilizados, estilos, variáveis, fontes e imagens relevantes para o manual.

O alvo inicial são as 37 pranchas identificadas preliminarmente. Diferenças serão registradas conforme o estado encontrado no Figwright.

**Depende de:** 1.1.

**Aceite:**

- [x] Todas as pranchas do manual têm ID, nome e capítulo.
- [x] Componentes de outras páginas usados no manual estão identificados.
- [x] Contagens refletem o documento efetivamente acessado.
- [x] Conteúdos externos ao manual não entram automaticamente no escopo.

#### 1.3 — Extrair textos e propriedades

Ler regras e dados por capítulo, em lotes limitados para evitar truncamento. Conferir variáveis, estilos e propriedades aplicadas separadamente dos textos editoriais.

**Depende de:** 1.2.

**Aceite:**

- [x] Cada informação possui origem rastreável.
- [x] Valores numéricos mantêm unidade, contexto e precisão.
- [x] Ausência de variáveis ou estilos não é confundida com falha de acesso.
- [x] Contradições são registradas, sem resolução inventada.

### Fase 2 — Exportar e documentar a marca

#### 2.1 — Exportar os ativos reutilizáveis

Reutilizar os arquivos do pacote de branding fornecido e aprovado pelo usuário. Obter pelo Figwright os complementos necessários e as referências do manual. Preservar proporções, contornos, máscaras, transparências e fundos integrantes do asset.

Não redesenhar assinaturas para contornar limitações de exportação. Composições impossíveis de obter fielmente serão registradas como pendentes.

**Depende de:** 1.3.

**Aceite:**

- [x] Variantes reutilizáveis têm export local ou impedimento documentado.
- [x] Assets não contêm instruções ou elementos acidentais da prancha.
- [x] Assinaturas não dependem de URLs temporários.
- [x] Fundos opacos e versões transparentes estão identificados.

#### 2.2 — Salvar referências, fotografias e fontes

Exportar uma referência de cada prancha; obter imagens originais quando acessíveis; verificar disponibilidade dos arquivos de fontes.

Fontes não extraíveis pelo Figma poderão ser obtidas da distribuição oficial da família identificada, com licença. Isso não autoriza outro método de acesso ao Figma.

**Depende de:** 1.3.

**Aceite:**

- [x] Todas as pranchas possuem referência ou falha registrada.
- [x] Fotografias de exemplo não recebem autorização de publicação presumida.
- [x] Fontes incluídas possuem licença correspondente.
- [x] Placeholders são reconhecidos como placeholders.

#### 2.3 — Redigir guia e catálogo

Consolidar estratégia, linguagem, símbolo, assinaturas, cores, tipografia, quatro grafismos, fotografia e aplicações, conforme a fonte confirmada.

Incluir construção, proteção, redução, usos incorretos, papéis cromáticos, hierarquia e restrições de uso onde existirem.

**Depende de:** 2.1 e 2.2.

**Aceite:**

- [x] Os sete capítulos estão cobertos.
- [x] Regras e assets possuem links de origem.
- [x] O catálogo permite escolher a variante adequada sem consultar a conversa.
- [x] Nenhuma proposta anterior de website aparece como regra do novo manual.

### Fase 3 — Auditar e preparar a passagem para desenvolvimento

#### 3.1 — Conferir exports e cobertura

Comparar visualmente os assets com os nodes de origem. Validar arquivos, dimensões, SVGs, links e correspondência entre inventário e documentação.

**Depende de:** Fase 2.

**Aceite:**

- [x] Nenhum arquivo vazio ou inválido.
- [x] Nenhum link local quebrado.
- [x] Nenhum asset catalogado sem arquivo ou pendência explícita.
- [x] Todas as pranchas têm estado de cobertura.
- [x] Falhas de exportação impedem declarar cobertura integral.

#### 3.2 — Registrar contraste e divergências

Recalcular os pares cromáticos apresentados pelo manual e registrar diferenças entre texto, estilos, variáveis e aparência.

**Depende de:** 2.3.

**Aceite:**

- [x] Cálculos apresentam cores, método e classificação.
- [x] Resultados derivados não são atribuídos ao manual.
- [x] Divergências que exigem decisão são apresentadas via `grill-me`, uma por vez.
- [x] Nenhuma decisão visual é corrigida silenciosamente.

#### 3.3 — Atualizar a entrada do contexto e encerrar

Preparar o README e corrigir no AGENTS.md somente o caminho do guia e a orientação da paleta antiga.

Ao iniciar a execução, preservar uma cópia do plano anterior em `temp/OldDesign` e atualizar o `PLAN.md` com este trabalho e seu progresso. Ao concluir, arquivar o plano em `docs/plans`, fora do pacote de marca.

**Depende de:** 3.1 e 3.2.

**Aceite:**

- [x] Uma nova IA encontra o guia e os assets pelo AGENTS.md.
- [x] Regras não relacionadas à marca permanecem preservadas.
- [x] O `.fig` original e o histórico anterior permanecem intactos.
- [x] Entrega informa cobertura, limitações e itens que exigem aprovação.

## 6. Testes e validação

Esta é uma entrega documental; não será criado framework de testes nem projeto frontend.

Executar uma checagem com biblioteca padrão do Python para:

- Links locais e âncoras Markdown.
- Arquivos existentes e não vazios.
- Estrutura XML dos SVGs e dimensões válidas.
- Dependências externas que impeçam uso local.
- Correspondência entre catálogo, arquivos e pranchas inventariadas.
- SHA-256 do `.fig` antes e depois.

Complementar com inspeção visual dos exports, especialmente assinaturas, traços finos, máscaras, recortes e fundos.

**Limite:** essa validação comprova a integridade do pacote extraído; não comprova renderização, desempenho ou acessibilidade do website futuro.

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Documento conectado incorreto | Confirmar identidade e página antes de salvar dados |
| Respostas truncadas | Consultas por capítulo e subconjunto de nodes |
| Exports com cortes ou fundos indevidos | Conferência visual e registro das propriedades |
| Divergência entre regra escrita e propriedade aplicada | Preservar ambas e consultar via grill-me quando necessário |
| Reutilização indevida da identidade antiga | Pacote novo independente e referências antigas corrigidas |
| Direitos de fotos ou fontes desconhecidos | Classificar situação; não presumir autorização |
| Confundir exemplos de aplicações com website aprovado | Documentar finalidade e limite de cada referência |

## 8. Acompanhamento

| Etapa | Estado |
|---|---|
| Pesquisa local e definição de escopo | Concluída |
| Conexão Figwright | Concluída |
| Fase 1: inventário e extração | Concluída |
| Fase 2: assets e Markdowns | Concluída |
| Fase 3: auditoria e passagem | Concluída |

**Conclusão em 02/10/2026:** pacote concluído em `docs/design`, com os sete capítulos e 37 pranchas cobertos, quatro Markdowns e 290 assets (211 fornecidos e 79 complementos do Figwright). Os 45 SVGs carregaram no navegador sem erros. A checagem confirmou os hashes dos assets, 438 links locais válidos e a preservação do `.fig`. No AGENTS.md, somente as duas orientações de caminho e paleta foram atualizadas; as demais instruções permaneceram intactas. Direitos das imagens e limites não definidos pelo manual estão identificados na auditoria. Este plano foi arquivado em `docs/plans` após a execução.
