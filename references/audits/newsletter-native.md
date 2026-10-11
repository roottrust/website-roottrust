# Auditoria — newsletter nativa (P5.2)

Checkpoint base: `8be2c0359e83347ec5608cf6ba7b0716d92c8063`. Fontes: `docs/web/newsletter.md` (N01–N11), `docs/web/product.md`, catálogo P5.1 (`web/src/features/newsletter/catalog.ts`, inalterado).

## Entrega

- Rotas (todas `force-dynamic`, `robots: noindex, nofollow`): `/newsletter`, `/newsletter/edicoes`, `/newsletter/edicoes/[slug]`.
- Arquivo: filtros e paginação por links (`?pilar=`, `?pagina=`), resolvidos no servidor sem JS; parâmetros inválidos caem em "Todos"/página 1 e página acima do total é limitada. Lógica pura em `features/newsletter/archive.ts`.
- Prévia: um parágrafo, com os segmentos/links do catálogo (fonte única); formulário recebe `editionSlug` da edição aberta.
- `NewsletterForm`: extensão mínima com props opcionais `cta`, `support`, `help`. Sem as props o comportamento da Home é idêntico.
- Gráficos: `FrameCanvas` nas três páginas; `SymbolAscii` só na landing. Sem Three.js novo.
- Slug inválido: `notFound()` em `generateMetadata` e na página, sem `loading.tsx`/Suspense — HTTP 404 verificado em produção.

## Limites e rótulos

- Todas as edições exibem "Edição demonstrativa — conteúdo para avaliação do design."; datas demonstrativas.
- Pedido aceito (somente `FORM_MODE=demo`) é "aguardando confirmação"; nunca confirmação, entrega ou assinatura. Sem `FORM_MODE`: "O envio ainda não está disponível. Nenhum dado foi enviado."
- Sem login, dados cadastrais, relacionados, anterior/próxima edição, busca ou métricas. Copy pública sem menção a IA.
- Nenhum corpo completo, editorial ou upload lido ou publicado; só metadados e abertura do catálogo.
- Sem rede/persistência: o teste confere que não há requisições não-GET, hosts externos ou storage.

## Gates (série)

| Gate | Resultado |
|---|---|
| typecheck | passou |
| unit | 12 arquivos / 101 testes passaram (15 de newsletter) |
| build | passou; as três rotas aparecem como dinâmicas |
| e2e completo | 136 passaram, 4 puladas preexistentes; 26 novos em `newsletter.spec.ts` (desktop e mobile) |
| lint | **1 erro fora do escopo**: `web/src/features/home/Home.tsx:111` usa `<a href="/newsletter/edicoes">` e `@next/next/no-html-link-for-pages` só passou a acusá-lo agora que a rota existe. Correção de uma linha: trocar por `<Link href="/newsletter/edicoes" prefetch={false}>` (o e2e `home.spec.ts:27` verifica só o `href`). Não alterado, por ser da Home. |

## Limites desta verificação

Nenhuma comparação visual com os exports foi feita (sem screenshots) e não há alegação de acessibilidade ou desempenho certificados. O 320px verifica apenas ausência de overflow horizontal. Revisão humana de composição, contraste e zoom continua pendente.

## P5.4 correção (checkpoint `ed2dd456990606029c1b65ad130635452d3bff7b`)

- `NewsletterForm`: o aviso "O envio ainda não está disponível nesta versão." agora é sempre visível, inclusive com `support` personalizado (landing e prévia); sem `support`, o texto da Home é idêntico ao anterior.
- Metadata do arquivo: descrição passa a identificar o arquivo como demonstrativo e declarar que nenhum envio está disponível. Título preservado.
- Metadata da prévia: descrição derivada da abertura pública do catálogo (até 160 caracteres, corte em palavra com "…"); nenhum trecho além da abertura.
- Estado vazio do arquivo mantido como em `product.md` ("Ainda não há edições publicadas. Volte para conhecer as próximas prévias."); `newsletter.md` cita só a primeira frase — divergência documental registrada, não alterada. Estado de falha não criado: o catálogo é estático.
- Testes: `newsletter.spec.ts` (descrição da prévia derivada da abertura, aviso visível) e `public-routes.spec.ts` (descrição do arquivo).
