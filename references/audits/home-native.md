# Home nativa — P3.3

Data: 10/10/2026. Fonte editorial/visual: `references/claude-design/Home.baseline.dc.html`; original e baseline preservados. Estado: implementação pronta para revisão independente P3.4 e aceite humano, sem páginas internas antecipadas.

## Implementação

- `web/src/features/home/Home.tsx`: conteúdo essencial renderizado no servidor; hero, princípios, públicos, ferramentas, newsletter e contato. Serviços e processo são componentes cliente com HTML inicial no servidor. Nove markers `data-sec` preservados, incluindo o símbolo final; `data-band`, `data-hero-copy` e corte da moldura preservados.
- `content.ts`: copy completa dos três princípios, três serviços, cinco etapas e quatro ferramentas transcrita do export; somente rotas reais e descrição financeira ROSI auditada substituem referências incorretas. Nenhum runtime DC, HTML injetado ou dependência CDN.
- `home.module.css`: estilos e dimensões do export em classes semânticas; max-width 1320/1200, clamp de padding, recortes dos princípios, grafismo G2, cartões e espaçamento preservados. Dez kinds aprovados usam `PillarArt`; `HomeCanvas` cobre hero/newsletter/símbolo/moldura.
- `useHomeSequence.ts`: desktop com track de altura medida e distância de 0,6 viewport por item, sticky top limitado pela altura útil e seletores clicáveis. Redução de movimento desativa pin. Mobile mostra os três serviços e as cinco etapas empilhados. Tabs de serviços incluem setas/Home/End, foco e associação ao painel.
- `Terminal.tsx`: digitação decorativa com timer suspenso fora de tela/aba oculta/pausa e limpeza ao desmontar; anúncio agregado de etapa, sem anúncio de cada caractere. Redução de movimento apresenta linhas completas.
- Provider de movimento envolve shell/Home/rodapé; pausa global acessível fixa no canto inferior direito, sem comprimir header mobile. Link da assinatura fecha menu, conforme revisão P2.4.
- Formulários reutilizam o único adaptador local D09/D10, com variantes visuais da Home, validação/foco/guardas preservados. Avisos de indisponibilidade/demonstração substituem os falsos sucessos do export; newsletter não confirma inscrição/entrega. Nenhuma integração/persistência adicionada.

## Verificação local

Comandos em `web/`, executados serialmente para build/start:

- `npm run lint`: passou sem avisos na execução final.
- `npm run typecheck`: passou; build final também concluiu TypeScript.
- `npm test`: 15/15 passaram, incluindo oito contratos de formulários e sete testes gráficos.
- `npm run build`: passou com Next 16.4.0/Turbopack; `/` SSR dinâmica e `/_not-found`, sem rotas internas antecipadas.
- `npm run test:e2e`: 12/12 foundation passaram com a Home completa em 11,2s.
- `npm run test:e2e -- --grep="Home preserves|global pause"`: 4/4 novos checks passaram em 6,1s. Cobrem nove markers, teclado End/tab/painel, anúncio agregado do processo, três serviços/cinco etapas mobile, arquivo/privacidade, pausa e menu/logo em 320px.

Produção local para revisão, mesmo build:

- Demo: `$env:FORM_MODE='demo'; npm run start -- --hostname 127.0.0.1 --port 3100`, sessão de ferramenta `24780`, URL `http://127.0.0.1:3100/`.
- Padrão: `$env:FORM_MODE=''; npm run start -- --hostname 127.0.0.1 --port 3101`, sessão `99229`, URL `http://127.0.0.1:3101/`.

## Limites e próximo gate

P3.4 é revisão independente: comparação por seção com a baseline de 41 PNG, gráficos ativos/pausados/reduzidos, aba oculta/fora de tela, perda de contexto, zoom e teclado. Esses resultados não são inferidos dos testes acima. Servidores permanecem para QA; 3100 também será mantido para revisão humana. Aprovação humana da Home continua obrigatória antes das páginas internas. Nenhum commit/push/PR/deploy feito; residual de dependências permanece em `frontend-foundation.md`.
