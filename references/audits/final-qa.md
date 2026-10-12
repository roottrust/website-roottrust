# QA final — frontend local Root Trust

**Atualizado: 11/10/2026 (P9.2).** Implementação e QA locais concluídos tecnicamente; Home aprovada em 10/10. Seções marcadas como **histórico** abaixo descrevem rodadas anteriores (101 unit, 228/227 E2E, quatro skips, LCP 4,8 s) e foram superadas pela seção “Estado atual — P8.3/P9”. Aceite humano final pendente. Sem autorização de commit final, push, PR ou deploy. Operação de backend/CMS/e-mail/analytics fora do escopo.

## Estado atual — P8.3/P9

- **Gates finais P8.3** ([log](final-qa/logs/p8-3-final-gates.log), exit 0, retries 0): lint, typecheck, **107 unitários em 13 arquivos** (101 anteriores + 6 de cobertura de fontes), build e **284 E2E aprovados / 6 skips**. Skips: 2 capturas Home opt-in, 2 de aba realmente oculta em headless e 2 de modifier mobile inaplicável; não são passes.
- **Decisões D11–D16 refletidas:** header Newsletter → `/newsletter` (desktop/mobile; footer e `#newsletter` inalterados); âncoras por rAF 350–900 ms, destino adaptativo, offset 96, aborto por interação, instantâneas em reduced-motion/pausa, sem CSS smooth global; removida somente a frase inicial exata de FormStatus (sem ocultar por CSS nem substituir), demo e feedback pós-tentativa honestos mantidos; select nativo `appearance: none`, chevron direito 16 px, padding-right 44 px, forced-colors nativo; newsletter com estrutura/título/lista/card em 1200 px úteis em 1440, parágrafos 65ch, grade ≥960, landing inalterada.
- **E2E de contato:** `contactClock` instalado antes do goto, controle de 350 ms, duplicidade (2 submits → 1 timer); 10 repetições desktop + 10 mobile passaram, sem retries nem delay em produção.
- **Fontes:** WOFF2 locais das mesmas famílias/versões/pesos, Latin+ (→√≥), Archivo com largura padrão 100, TTF+OFL intactos, teste de cobertura futura, sem rede externa; procedência em `font-optimization.json`. GPT mediu 14 comparações de fontes/pesos 100–900 com delta 0 e rede com 2 WOFF2 locais (`p9-visual-checks.json`), sem overflow em 960/1024 px.
- **Capturas P9:** 44 JPG/22 pares, 11 rotas desktop/mobile, 2 execuções pass sem issues, mais 5 extras (tablets 960/1024 arquivo/prévia e hero Home) em `final-qa/captures`.
- **Integridade** (`p9-integrity.json`): 158 exports, 10 assets/fontes/licenças e 56 contratos sem divergência. **Scan privado** (`p9-private-scan.json`): 430 arquivos, 11 âncoras privadas, 0 ocorrências, recorte limitado.
- **LCP** (Lighthouse 13.5 mobile, 4× CPU, slow 4G, mesmo protocolo, 3 rodadas por rota; baselines `lighthouse-before-p7` e `lighthouse-before-p8-fonts`, resultado `final-after-fonts` + `lighthouse/summary.json`, comparativo `logs/p8-lcp-comparison.json`):

| Rota | LCP antes → depois (ms, mediana) | Intervalo depois | CLS | TBT final (ms) | JS (bytes, inalterado) |
|---|---|---|---:|---:|---:|
| Home | 4875,840 → 2808,533 | 2808,029–2898,5 | 0 | 59,5 | 173328 |
| Cibersegurança | 4800,737 → 2726,4505 | 2716,864–2727,239 | 0 | 459 | 308974 |
| ROSI | 4878,077 → 2873,0245 | 2867,496–2969 | 0 | 453,5 | 316395 |
| Newsletter | 4860 → 2783 | 2719,477–2812 | 0 | 119 | 167217 |

Transferência de fontes 517372 → 75484 B (com headers). Melhoria de 41–43%, **meta ≤2500 ms NÃO atingida**. Variações pequenas de TBT não comprovam causalidade. Em D16 o usuário aprovou a Opção 1: manter o ganho como exceção local e concluir QA/documentação; isso não é publicação nem aceite final visual. Sonnet implementou e revisou em sessões distintas; GPT executou gates e medições.

Riscos mantidos (histórico, sem novo audit): audit dev cinco high / produção zero. CI remoto, hardware físico, zoom real, leitor de tela e INP de campo seguem sem certificação. Sem backend, commit final, push ou deploy.

## Gates e evidências — histórico (11/10, antes de P8.3)

GPT executou lint, typecheck, **101 unitários em 12 arquivos**, build de produção e **228 E2E aprovados / quatro skips** após a última alteração de código. Sonnet implementou e revisou em sessões distintas; não foi o único verificador de seu trabalho.

- [Log E2E](final-qa/logs/final-e2e.log): Chromium desktop/mobile completo, Firefox/WebKit smoke. Quatro skips: duas capturas Home opt-in e dois testes de aba realmente oculta, indisponível nessa execução headless. Não são passes.
- [Log de capturas](final-qa/logs/final-captures.log) e [capturas](final-qa/captures/): 44 JPG, 22 pares nativo/export, 11 rotas desktop/mobile, duas execuções de captura aprovadas. Métricas sem page errors, overflow, timeout, falha gráfica ou request falho do export.
- [Medições Lighthouse](final-qa/lighthouse/summary.json) e [log](final-qa/logs/lighthouse.log): 12 rodadas, três por rota. Relatórios brutos na mesma pasta.
- [Audit produção](final-qa/logs/audit-production.json): zero advisories. [Audit completo](final-qa/logs/audit-all.json): cinco high na cadeia de desenvolvimento ESLint/fast-glob/micromatch/braces (GHSA-vfj7-8cjw-p6xm). Não aplicado --force, que ofereceu downgrade Next.
- Integridade conferida pelo GPT: 158 arquivos de export e oito cópias públicas/fontes/licenças sem divergência de hash. Scan de 230 arquivos src/public/build e 11 trechos de corpos editoriais privados: zero ocorrências nesse recorte; não prova ausência universal de vazamento.

**Histórico, superado pelos gates P8.3:** após a atualização documental, lint/tipos/101 unit/build passaram novamente. E2E completo: **227 passes, quatro skips, uma falha** ao observar o botão transitório “Enviando…” do contato. Repetição isolada: **3/3 passaram**, sem alteração de código ou testes. Causa não comprovada; instabilidade registrada, sem declarar nova rodada completa verde. [Log completo](final-qa/logs/final-delivery-gates.log) e [rechecagem isolada](final-qa/logs/final-contact-recheck.log). Registros em [PLAN.md](../../PLAN.md). CI está configurado sem deploy; execução remota não realizada, pois não houve push autorizado.

## Comandos reproduzíveis

Em web/, Node 24.13.1/npm 11.8.0:

~~~powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
node scripts/qa-capture.mjs
node scripts/lighthouse.mjs
~~~

Instalar navegadores uma vez: npx playwright install chromium firefox webkit. E2E usa portas 3100/3101; Lighthouse usa 3200. Verificar portas livres e não executar medições junto aos testes. Captura define QA_CAPTURE=1; captura não faz parte do gate comum. Lighthouse 13.5.0 efêmero não é dependência do app nem execução offline fixada.

## Medições de laboratório — histórico (antes da otimização de fontes; atuais na seção “Estado atual”)

Windows 10.0.26200, Ryzen 7 5800X (16 CPUs lógicas), 11,9 GiB, Node 24.13.1, Chromium Playwright 1248. Lighthouse 13.5.0 em build Next de produção, loopback, FORM_MODE ausente, emulação móvel padrão com CPU 4× e slow 4G. Sem testes/capturas concorrentes.

| Rota | LCP mediano (ms) | CLS | TBT mediano (ms) | JS transferido (bytes / KiB) |
|---|---:|---:|---:|---:|
| Home | 4876,8 | 0 | 114 | 172501 / 168,5 |
| Cibersegurança | 4800,5 | 0 | 452,5 | 308149 / 300,9 |
| ROSI | 4875,2 | 0 | 452,5 | 315566 / 308,2 |
| Newsletter | 4860 | 0 | 112 | 166400 / 162,5 |

LCP variou aproximadamente 4800–4935 ms e TBT 107–602,5 ms entre rodadas. **Meta orientativa LCP ≤2,5 s não atingida em nenhuma rota.** CLS ≤0,1 atendido neste laboratório. Decisão técnica do GPT, sujeita ao aceite humano final (P6.3): preservar visual/stack aprovados e registrar desvio para otimização/medição em hardware antes da publicação futura. TBT não certifica INP de campo; não há certificação de desempenho/acessibilidade.

## Fidelidade e correções verificadas

GPT inspecionou amostras nativo/export de serviços, ferramentas, newsletter e 404, desktop/mobile. A revisão visual é amostral, sem igualdade pixel a pixel ou aceite humano final implícito.

- Serviços: frentes 2×2, situações numeradas abertas, detalhe em duas colunas, método e FAQ restaurados; conteúdos contratuais preservados.
- Newsletter: landing com amostra/benefícios/curadoria/FAQ, arquivo editorial e destaque antes dos filtros, prévia em coluna de leitura. Histórico: o formulário avisava ausência de envio desde o início; por D12 a frase inicial exata de FormStatus foi removida, mantendo o aviso demo e o feedback pós-tentativa. Metadata só usa abertura pública.
- Ferramentas: pares de campos e auxiliares ROSI, breadcrumb, rótulos antes do cálculo sem números fictícios, gutters mobile e objetos contidos. Seletor de cenário, estados desconhecidos/personalizados, ajudas, método em acordeão e resultado não fixado são adaptações funcionais documentadas; podem alterar altura/posição do export.
- 404 recebeu moldura e arte, com retorno à Home. Privacidade é provisória e verdadeira. Slugs bem formados inexistentes retornam HTTP 404 antes de streaming. Encoding UTF-8 malformado pode gerar 500 no Next antes da aplicação; revisar antes de publicação.

## Movimento, privacidade e limites dos testes

PillarArt importa Three/runtime ao entrar no viewport (no mount quando IntersectionObserver não existe). Fallback permanece até primeiro drawImage bem-sucedido; callback é único, descartado em dispose/falha e protegido contra montagem tardia. Pausa SPA, redução dinâmica, suspensão fora de tela e descarte foram testados. Context loss mantém instâncias montadas em falha; futuras instâncias ainda não montadas podem obter novo renderer.

Contagem de desenho observa sete métodos Canvas 2D: clearRect, drawImage, fillRect, fillText, strokeText, fill e stroke, com controle positivo antes da pausa. Não mede desenhos WebGL/OffscreenCanvas; descarte WebGL é verificado por isContextLost(). Suspensão real em aba oculta teve skips; testes sintéticos de visibilitychange passaram.

Reflow 640×512 e 320×256 CSS px representa geometria de zoom 200%/400%, **não zoom real do browser**. Detector verifica overflow e corte de conteúdo main/footer por ancestrais, exceto scrollers intencionais. Chromium verifica Tab finito e indicador de foco; no WebKit Windows o skip link recebe foco programático, sem comprovar ordem real de Tab. Linux CI não executado. Sem dispositivos físicos, leitor de tela ou INP de campo. Restauração de sessão é testada com pageshow sintético, sem certificação de BFCache real.

Abortos normais de prefetch RSC na navegação são tolerados; demais falhas de página/console/rede reprovam. Capturas usam DPR 1, fontes carregadas, movimento reduzido e percorrem a página antes da foto. CSS sem animação não congela Canvas. Relatórios só são gravados após captura integral bem-sucedida; ambas as execuções finais passaram.

Formulários padrão não simulam sucesso; FORM_MODE=demo aceita apenas pedido local e informa que nada foi enviado. Não confirma inscrição, endereço, entrega ou recebimento. Respostas das ferramentas ficam em memória, sem armazenamento/associação ao e-mail. Precisão IEEE 754 é limitada, inclusive tratamento de cancelamento de quatro EPSILON; não prometer contabilidade decimal exata.

## Revisão e entrega

Revisão técnica independente Sonnet 5.5: sessão f62830cd-91f7-4033-be5f-d90f9549a91a, com follow-up sobre gutters, sem bloqueador concreto no escopo lido. Revisão estática parcial, sem execução de gates/modelos/exports completos; não ampliar conclusão. Revisões de primeiro quadro e QA constam no PLAN. GPT executou gates e inspeção visual complementar.

Usuário autorizou GPT a finalizar oito documentos após Haiku retornar sem edições e ser cancelado; revisão documental Sonnet 5.5 concluída em sessão independente 601114c3-8761-457b-a872-a5152f4dd99c (43 s): sem bloqueador, quatro correções factuais aplicadas pelo GPT. Revisão somente do diff e conferências pontuais de versão; logs/métricas/hashes foram verificados pelo GPT, não pelo revisor. Nenhum código alterado nessa atualização. PLAN mantém tarefas/aceite como fonte única; só arquivar após aceite humano final.

Scripts encerraram servidores das medições normais. Sinais externos/timeouts podem atrasar cleanup de processos filhos; porta fixa exige checagem prévia. Não foram simuladas todas essas interrupções. Revisar patches/advisories, hardware, desempenho, políticas e integrações antes de publicação, incluindo atualização Next anunciada para 14/10/2026.
