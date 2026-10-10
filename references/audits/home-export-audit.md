# Auditoria da Home exportada do Claude Design

**Data:** 04/10/2026. **Escopo:** 122 arquivos de `web/`, código/imagens e execução Chrome. **Aprovação:** `Home.dc.html` com moldura/laterais, visual/textos/regras confirmados. Nenhum código do export foi alterado na auditoria ou atualização documental.

**Nota de inventário — 07/10/2026:** este relatório preserva os testes e contagens daquela auditoria. A variante Home v3 não está mais no diretório atual; quatro exports de ferramentas foram adicionados depois, sem auditoria de seus cálculos nesta etapa. O [contexto](../../docs/web/README.md) registra o estado atual e a [newsletter](../../docs/web/newsletter.md) é a próxima prototipagem. Não interpretar a conclusão histórica sobre entrevista das ferramentas como estado atual.

## Resultado

Protótipo executável Design Components, runtime React e Three.js; não uma aplicação Next.js inicializada. [Design](../../docs/web/design.md), [conteúdo](../../docs/web/product.md) e [jornadas](../../docs/web/product.md) distinguem aprovação e operação. Não há package.json, lockfile, configuração TS/Next, scripts npm ou testes. Backend/CMS/e-mail/hospedagem não escolhidos.

## Inventário

| Grupo | Arquivos | Papel |
|---|---:|---|
| Raiz | 5 | Dois HTML, dois JS e thumbnail |
| `_ds/` | 13 | README, manifest, bundle, aderência, stylesheet, seis CSS de tokens e duas fontes |
| `assets/` | 8 | Assinaturas/símbolo e grafismos |
| `screenshots/` | 42 | Diferentes iterações |
| `uploads/` | 14 | Referências/capturas anotadas |
| `scratch/tw/` | 40 | 35 chunks JS, três WebP e dois SVG da Twenty |
| **Total** | **122** | **9.913.386 bytes; conjunto completo, não payload da Home** |

### Arquivos principais

| Arquivo | Papel |
|---|---|
| [Home.dc.html](../claude-design/Home.dc.html) | 937 linhas; layout/copy/estado, navegação, ASCII e montagem 3D |
| Home v3, arquivo histórico ausente atualmente | 865 linhas na auditoria; mesma Home sem moldura/G3; borda do header surge após scroll |
| [pillars3d.js](../claude-design/pillars3d.js) | 431 linhas; geometrias, shaders, iluminação e interação |
| [support.js](../claude-design/support.js) | 1.911 linhas; interpreta x-dc/templates/DCLogic e monta React |
| `.thumbnail` | Prévia WebP, não evidência de todos os estados atuais |

React/ReactDOM observados: CDN 18.3.1; Three.js: CDN 0.184.0. Babel previsto no runtime, desnecessário ao template atual. Não são escolhas de versão para a futura aplicação. Runtime usa `new Function`; portar resultado sem presumir esse interpretador como arquitetura Next.

### Sistema `_ds`, arquivo por papel

| Arquivo | Resultado |
|---|---|
| `readme.md` | Biblioteca maior que o subconjunto exportado |
| `_ds_manifest.json` | 12 famílias, 29 cards, 118 tokens, duas fontes, zero temas declarados |
| `_ds_bundle.js` | Componentes compilados; namespace não usado diretamente no markup atual |
| `_adherence.oxlintrc.json` | Regras do export; não é pipeline de lint da aplicação |
| `styles.css` | Seis imports |
| `tokens/colors.css` | Paleta v2 e aliases |
| `tokens/typography.css` | Famílias/escala observada |
| `tokens/spacing.css` | Espaçamentos/dimensões/raios |
| `tokens/fonts.css` | Dois font-face locais |
| `tokens/fig-variables.css` | Variáveis legadas explicitamente marcadas |
| `tokens/fig-typography.css` | Comentário, sem estilos publicados |
| `assets/fonts/archivo/archivo-variable.ttf` | TrueType variável |
| `assets/fonts/baloo-2/baloo-2-variable.ttf` | TrueType variável |

12 JSX e 29 cards citados no manifest não vieram como arquivos individuais. Componentes inativos do bundle referenciam imagens ausentes. Isso não impediu execução da Home; não é falha observada da página. OFL permanece em `docs/design/assets/fonts`, a preservar na redistribuição.

### Assets

| Arquivo | Uso |
|---|---|
| `roottrust-horizontal-negativo.svg` | Header/footer; geometria correspondente à assinatura oficial |
| `simbolo-negativo.svg` | Favicon; geometria correspondente ao símbolo oficial |
| `g2-abrigo-175b4b.png` | Faixa Para quem lidera |
| `g2-abrigo.png` | Variante inativa |
| `g1-rocha.svg` | Referência inativa; Eco não é direção atual |
| `g2-abrigo-escuro.svg` | Referência inativa |
| `g3-escuro.svg` | Referência; lateral atual gerada por código |
| `g4-rocha.svg` | Referência; hero atual gerado por código |

42 screenshots e 14 uploads inspecionados: misturam layouts antigos, candidatos, Twenty/Cloudflare e composições anteriores. Nenhum upload é dependência ativa. `scratch/tw` não é importado: a03/a12 mostram shader em plano, a28/a34 carregamento/modelo 3D. Não transportar chunks compilados como módulos autônomos.

## 3D versus Canvas

**3D real:** princípios, serviços e ferramentas. Geometrias procedurais sem GLB → perspectiva/luzes → textura → shader hachurado → canvas visível 2D. **Um WebGL2 compartilhado**, confirmado em execução.

**Canvas 2D:** G4 ASCII do hero, moldura/G3 e símbolos newsletter/CTA. Sprites, ruído, luz/pulsação e resposta ao ponteiro; desenho limitado à janela com margem na navegação normal.

Prumo/Âncora e construtor Iceberg existem; default de Profundidade é Camadas. Símbolo 3D não está montado no CTA. Biblioteca disponível não equivale a elemento ativo.

## Verificações executadas

| Verificação | Evidência |
|---|---|
| Ambos HTML em Chrome 1440×1000 | Renderizam sem exceções JS observadas |
| Ambos HTML em Chrome 390×844 | Sem overflow horizontal observado |
| Fontes/arquivos locais ativos | Carregados e referências presentes |
| Sintaxe | 38 arquivos JS e dois scripts internos sem erro no node --check |
| SVG | Seis XML válidos; assinaturas comparadas à geometria oficial |
| Altura da Home | 10.925px desktop, 11.788px mobile nas condições testadas |
| Movimento reduzido | Alteração dinâmica não atualiza pinning integralmente; reload com reduce reduz altura desktop para 6.316px |
| Formulários sintéticos | Estado local, sem envio operacional |

Capturas em TEMP do sistema, não versionadas como aprovação adicional; processos de auditoria encerrados. Sem instalação de dependências, publicação ou dados reais.

Impeccable: 20 avisos estáticos (16 nos HTML, quatro só nos chunks Twenty), oito no DOM. Caixa alta curta, padding estrutural e clipping podem ser falsos positivos; placeholders/ritmo precisam de avaliação. Nenhuma nova execução nesta atualização documental.

## Lacunas de produção

| Área | Atual | Requisito |
|---|---|---|
| Formulários | Somente setState | Recebimento/inscrição reais antes do sucesso; falhas, abuso e retenção |
| Navegação | Ferramentas → contato; arquivo/privacidade → # | Rotas/conteúdo reais |
| Tema | Somente escuro | Reconfirmar claro/automático na nova direção |
| Movimento | Sem pausa; reduce na montagem | Pausa e preferência dinâmica |
| Render | Gating fora de tela; intervalo renderiza em aba oculta | Preservar gating e suspender trabalho oculto |
| WebGL | Falha deixa área vazia | Imagem alternativa e perda/restauração tratadas |
| Semântica | Abas incompletas, terminal aria-live por caracteres | Relações/teclado e anúncio agregado |
| Documento/menu | Sem lang; foco/Escape a revisar | pt-BR e navegação acessível |
| Gestos/recursos | Cancelamento incompleto | pointercancel e descarte previsíveis |

Sem medição FPS/Core Web Vitals, aparelho físico ou avaliação completa com leitor de tela. Execução sem erros não certifica desempenho, segurança, acessibilidade ou direitos dos materiais históricos.

## Consolidação documental — 05/10/2026

AGENTS e os documentos web foram alinhados ao export aprovado; quatro documentos de marca receberam somente notas de integração e dois planos receberam avisos de contexto histórico. A revisão independente por sub-agents confirmou precedência, copy, objetos, inventários e separação entre operação atual e requisitos futuros, sem correções obrigatórias restantes.

Conferência automatizada: **15 documentos e 545 links locais/âncoras**, sem destino ausente; fences balanceadas; git diff --check sem erro. Os **290 assets oficiais** conferem com os hashes da extração e o Figma mantém SHA-256 `3a4cb8c99cf0526ea6af1ac110201c583067e1e86e0500dff1d6c5914c7f35eb`. Não houve alteração de código, assets, commit ou publicação.

O briefing das ferramentas está em entrevista, sem fórmulas novas aprovadas ou prompt final. Atualizações posteriores registrarão as decisões explícitas do proprietário antes de entrega ao Claude Design.


