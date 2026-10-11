# Auditoria P5.3 — Privacidade, metadata e 404

Checkpoint WIP `cd5f154ec121c926b42034995b2c92d970ead814`. Gates em série: lint, typecheck, unit (101), build, e2e (148 passed, 4 skipped).

## Alterações
- `Home.tsx`: `<a href="/newsletter/edicoes">` → `Link` com `prefetch={false}` (corrige lint; sem mudança visual).
- `app/privacidade`: página provisória e verdadeira (sem envio/persistência/analytics, ferramentas só em memória, contato comercial separado). Não inventa CNPJ, encarregado, base legal, prazos, cookies ou fornecedores; declara que não é política válida.
- `app/not-found.tsx` + `not-found-art.tsx`: 404 nativa conforme `404.dc.html` (H1, texto, ASCII "4✓4" em Canvas com pausa/reduced-motion/visibilidade/dispose). Saídas: Voltar à Home, Conhecer os serviços, Solicitar diagnóstico. O botão "voltar" do export (history.back) foi trocado por link à Home.
- Metadata: Home recebeu título/descrição do product.md; páginas de newsletter usam `title.absolute` para evitar sufixo duplicado do template. noindex herdado do layout; sem canonical/host.
- Testes: `tests/e2e/public-routes.spec.ts`.

## P5.3 moldura 404
- Checkpoint WIP `9d625ef06be246749439b0df30041ee1b381279b`. `app/not-found.tsx` agora tem `data-graphics-root`, o `FrameCanvas` existente e `<div data-frame-cut="1" />` ao final (corte inferior, mesmo padrão das demais rotas); HTTP 404, metadata, copy, links, layout e arte inalterados. Sem JS a moldura não aparece e o conteúdo essencial permanece.
- Teste `404 page` em `public-routes.spec.ts` verifica moldura `aria-hidden` e `ready`, além de título e retorno à Home. Removidas as regras CSS `.placeholders` sem uso em `tools.module.css`. Gates executados pelo GPT após o retorno (não executados aqui).

## Limitação
- Slug com percent-encoding malformado (`/newsletter/edicoes/%E0%A4%A`) responde 500 do framework (fora de `/privacidade` e raiz, que dão 404). Não corrigido: exigiria proxy/middleware fora do escopo.

## P5.4 correção
- Descrição de `/newsletter/edicoes` agora marca o arquivo como demonstrativo; descrição de `/newsletter/edicoes/[slug]` deriva da abertura pública. Título e noindex inalterados. O caso de percent-encoding malformado segue como risco conhecido do framework, sem middleware.
