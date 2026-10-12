# Correções de navegação, formulários, newsletter, E2E e LCP — plano de implementação

**Estado: execução aprovada pelo usuário (Aplique o plano), 11/10/2026.** Este PLAN.md continua sendo a única fonte de tarefas. O plano anterior e suas evidências permanecem ao final como histórico; a aprovação anterior não autoriza a implementação destas novas tarefas. Nenhum código foi alterado ao preparar este plano.

## 1. Problema e objetivo

A revisão humana identificou cinco problemas de navegação/apresentação não resolvidos na entrega: saltos ao acessar âncoras pelo header, aviso inicial indesejado nos formulários, indicadores dos selects sem recuo, Newsletter com destino errado e conteúdo da newsletter preso à esquerda. Somam-se um E2E instável e LCP acima da meta orientativa. Corrigir os cinco pontos, estabilizar o teste sem enfraquecê-lo e melhorar o carregamento preservando marca, conteúdo, efeitos e contratos aprovados.

Não inclui backend, integração de formulários, CMS, e-mail, persistência, analytics, dependências novas, deploy ou redesenho. Modelos F01–F29, serviços S01–S16 e newsletter N01–N11 permanecem. Mudanças atuais do usuário prevalecem sobre notas anteriores referentes ao aviso inicial, links do header e largura da newsletter.

## 2. Pesquisa e evidências

### Histórico e documentação

Fontes: conversa atual, histórico preservado abaixo, AGENTS.md, seis documentos docs/web, exports imutáveis em references/claude-design e references/audits/final-qa.md. Não há ferramenta de session-store SQL disponível; não foi inventada consulta ao banco. Não criar cópia de sessão, plano concorrente ou SQL TODO: instrução específica do repositório exige apenas este PLAN.md. SATE/Ford não se aplica.

Home nativa aprovada em 10/10. QA anterior: lint/tipos/101 unit/build/228 E2E, quatro skips. Última rechecagem documental: 227 E2E passes, quatro skips e uma falha no teste de contato; o mesmo teste passou 3/3 isoladamente sem mudanças. Logs final-delivery-gates.log e final-contact-recheck.log preservados. Isso não comprova nova execução completa verde.

### Código e exports

- **Navegação:** Header.tsx compartilha links desktop/mobile para /#servicos, /#ferramentas e /#newsletter; CTA vai a /#contato. globals.css tem scroll-padding/scroll-margin de 96px e override reduced-motion, mas não ativa scroll-behavior:smooth. Verificar soma dos offsets, altura efetiva do header e comportamento entre rotas, sem apenas adicionar CSS e presumir resolução.
- **Referência Claude Design:** Home.dc.html usa âncoras locais; possui animação própria scrollToItem para seleções de serviços/processo, com redução de movimento. A busca estática não encontrou regra global smooth nos arquivos locais inspecionados. Portanto a transição do header relatada pelo usuário precisa de comparação executada com a baseline, não deve ser descrita como implementação literal já localizada. Não alterar exports, runtime ou usar scrollToItem de pinning indiscriminadamente para navegação.
- **Formulários:** FormStatus.tsx concentra a frase exata solicitada para remoção. NewsletterForm tem apoio separado sobre indisponibilidade; avisos de demonstração, respostas pós-tentativa, validação e privacidade não são a frase solicitada. Remover o aviso inicial exato em todos os formulários sem substituí-lo por paráfrase equivalente nesse mesmo espaço. Não criar sucesso fictício.
- **Selects:** tools.module.css aplica padding 12px 16px sem tratar appearance/indicador nativo; forms.module.css também estiliza selects de demonstração. Distinguir setas de select das setas de input numérico; inventariar todos os controles realmente presentes antes da correção.
- **Newsletter:** heroText limita a abertura a 620px; reading limita artigo/card a 720px alinhados à esquerda. inner/wrap definem a moldura 1200/1320px. ArchivePage e PreviewPage usam essas classes; lista já ocupa seu contêiner. Medir DOM/CSS antes de alterar classes compartilhadas para não afetar a landing.
- **E2E:** foundation.spec.ts:40 procura o botão Enviando após click; submitLocalForm resolve demo após somente 350ms. Falha observada é compatível com perder esse estado transitório sob carga, mas a causa final deve ser reproduzida/verificada. Não aumentar atraso do produto, remover assert, adicionar sleep/retries ou tornar cenário indisponível.
- **LCP:** relatórios finais de produção móvel: Home 4876,8ms, Ciber 4800,5ms, ROSI 4875,2ms, newsletter 4860ms; CLS0, TBT114/452,5/452,5/112ms, JS172501/308149/315566/166400 bytes. Nos relatórios da primeira rodada, candidatos LCP são texto (h1/span/parágrafo), não objetos 3D. Render-blocking CSS aparece; fontes já usam swap e preload local. O breakdown observado usa timings diferentes da simulação final: investigar essa distinção e a rede/fontes/main thread antes de atribuir causalidade. Three já é carregado ao entrar na viewport; adiar mais gráficos sem evidência não garante resolver LCP.
- **Estado da árvore:** mudanças documentais anteriores permanecem sem commit final. next-env.d.ts contém alteração gerada para .next/dev/types; não foi criada neste planejamento. Não reverter trabalho do usuário nem incluir gerados/segredos sem inspecionar.

### Pesquisa externa — fontes oficiais consultadas

- [Next Link](https://nextjs.org/docs/app/api-reference/components/link) e [data-scroll-behavior](https://nextjs.org/docs/messages/missing-data-scroll-behavior): considerar coordenação entre roteamento, hash e scroll suave; atributo não substitui política explícita para âncoras entre páginas.
- [Playwright Clock](https://playwright.dev/docs/clock): relógio deve ser instalado antes de timers da aplicação; pause/runFor controlam o intervalo observado. Relógio também afeta requestAnimationFrame; isolar este teste dos asserts de animação.
- [Otimização de LCP](https://web.dev/articles/optimize-lcp): identificar candidato e separar TTFB, descoberta/download e atraso de renderização. Não escolher otimização somente pelo tamanho do bundle.

Consulta Firecrawl não foi necessária nem realizada nesta rodada. Não atribuir a ele evidências. Sem atualização de pacotes proposta.

## 3. Registro de decisões

| ID | Questão | Decisão | Motivo/fonte |
|---|---|---|---|
| D11 | Destino Newsletter no header | /newsletter no desktop e mobile, em todas as páginas | Pedido explícito atual; substitui /#newsletter apenas nesse contexto. |
| D12 | Aviso inicial dos formulários | Remover a frase exata de FormStatus em todo o site; preservar feedback verdadeiro e aviso do modo demo | Pedido atual, sem ativar integrações ou sucesso simulado. |
| D13 | Largura da newsletter | Toda a largura útil da moldura para conjunto/título/lista/card, parágrafos com largura confortável | Resposta Opção1 à entrevista; não esticar texto até a borda da tela. |
| D14 | Movimento na navegação | Rolagem suave para âncoras, exceto reduced-motion/pausa global; links de página não recebem transição artificial | Proposta técnica para aprovação; sem nova biblioteca. |
| D15 | Execução e custo | Sonnet implementa em tarefas pequenas e revisa em sessão distinta; GPT orquestra/gates/medições/PLAN. Haiku não é necessário nesta rodada; Opus só impasse complexo | Mantém D06 e autorização operacional; sem Fable. |
| D16 | Meta de desempenho | Buscar LCP mediano ≤2,5s nas quatro rotas, CLS≤0,1; se não alcançar, apresentar medidas e consultar antes de aceitar exceção | Meta existente; não repetir encerramento com desvio silencioso. |

D01–D10 continuam válidas, com substituições delimitadas acima. A aprovação deste plano valida D14–D16 e a abordagem abaixo; não autoriza commit final/push/deploy. Entrevista de largura resolvida; decisões de implementação restantes estão propostas para aprovação do plano, sem perguntas redundantes.

## 4. Arquitetura e execução

Correções nos componentes/CSS compartilhados; conteúdo essencial SSR, pequeno escopo cliente, native select preservado, sem pacote novo. Preferir scrolling nativo/CSS com ativação delimitada às âncoras de navegação; não impor smooth incondicional que altere todos os scrollTo/focos das suítes. Se houver atributo/classe no html, sua ativação respeita reduced-motion e estado de pausa SPA. se Next saltar diretamente ao hash entre rotas, coordenar chegada à Home e scroll após montagem com handler mínimo, preservando URL, histórico, modificadores e navegação sem JavaScript. Não bloquear rolagem natural ou inserir transição de página para /newsletter. Alvos podem mudar de posição com pinning/altura de serviços/processo: verificar destino depois da estabilização, com correção delimitada e sem loop infinito. Capturas e helpers de posicionamento usam rolagem instantânea/movimento reduzido quando aplicável; não desligar globalmente a animação nas suítes que verificam movimento. Apenas testes dedicados de navegação verificam posições intermediárias. Respeitar preferência reduzida dinâmica e pausa global, offsets e pinning.

Select mantém elemento nativo, label/foco/teclado e disabled. Se necessário, appearance:none com chevron decorativo local e reserva de espaço à direita; suporte forced-colors sem duplicar setas. Corrigir os seletores de cenário e demo onde o defeito existir.

Newsletter usa largura do contêiner, sem mudar a moldura geral. Parágrafos mantêm largura legível; título, estrutura editorial e card de inscrição se expandem, com distribuição responsiva para evitar vazio unilateral. Não replicar uma prévia inteira nem expor corpo editorial privado.

Uma escrita Claude por vez. Antes de cada escrita: confirmar raiz Git, inspecionar git add -A --dry-run, parar se houver segredo, checkpoint WIP LOCAL autorizado (inclusive árvore suja), registrar hash/sessão/modelo. Claude não lê .env*, não faz commit/push/instalação nem inicia gates/servidores; GPT roda gates após terminal. Não sobrescrever processo de desenvolvimento do usuário: conferir ocupantes das portas e escolher porta livre ou consultar, sem matar processo desconhecido.

Prompt sempre exige AGENTS.md/PLAN.md e arquivos do passo; escopo explícito. Rodapé obrigatório: Sessão headless: AskUserQuestion e sub-agents indisponíveis. Se faltar contexto, liste as dúvidas na resposta e pare. Não faça commit, push nem instale nada. Responda em pt-BR. Modelo sonnet explícito, confirmar modelo efetivo; esforço não configurável via ponte. Revisor em outra sessão, readonly, com diff delimitado (sem ler PLAN histórico inteiro). Sem workers adicionais nesta rodada para poupar cota.

## 5. Fases e tarefas

### Fase 7 — correções de interface

#### P7.1 — Header, destinos e rolagem [claude:escreve] Sonnet

**Dono:** Header.tsx, shell.module.css, globals.css, layout.tsx e testes de navegação afetados; pequeno componente auxiliar de âncora somente se comprovadamente necessário. GPT [codex] compara header da baseline em navegador e fornece observação delimitada ao Sonnet antes da escrita, sem modificar referência. Capturas/medidas de P7.2/P7.3 também são executadas exclusivamente pelo GPT após escrita terminal.
**Dependência:** aprovação deste plano.

- [ ] Newsletter desktop/mobile aponta /newsletter a partir da Home e das internas.
- [ ] Serviços/Ferramentas/CTA chegam à seção correta da Home com posições intermediárias observáveis durante a rolagem normal, tanto na Home quanto partindo de interna.
- [ ] Reduced-motion e pausa global removem animação; destino permanece visível abaixo do header. Voltar/avançar, hash inicial, teclado e Ctrl/Cmd-click mantêm comportamento esperado.
- [ ] Menu fecha; clique repetido não deixa scroll pendente/callback após desmontagem. Nenhuma biblioteca nova ou scroll hijacking.

#### P7.2 — Aviso inicial e indicadores dos selects [claude:escreve] Sonnet

**Dono:** FormStatus.tsx, forms.module.css, tools.module.css, campos de ferramentas apenas se necessário e testes relacionados.
**Dependência:** P7.1 terminal/gates; sem escrita concorrente.

- [ ] Frase Este formulário ainda não recebe solicitações. Nenhum dado é enviado ou guardado. ausente do conteúdo público de todas as rotas, sem mera ocultação CSS.
- [ ] Não substituir a frase por outro aviso inicial equivalente em FormStatus; manter rótulo demo, validação, erro/indisponibilidade após tentativa, nenhum envio/sucesso real.
- [ ] Setas dos selects com recuo visual de 16px coerente com texto, espaço reservado para texto longo, sem indicadores duplicados, 320px/390px/desktop e smoke Firefox/WebKit.
- [ ] Labels, teclado, foco, disabled e forced-colors preservados; respostas/cálculos e contratos não alterados.

#### P7.3 — Largura do arquivo e prévias [claude:escreve] Sonnet

**Dono:** ArchivePage.tsx, PreviewPage.tsx, newsletter.module.css e testes de newsletter/layout.
**Dependência:** P7.2 terminal/gates.

- [ ] /newsletter/edicoes usa toda a largura útil da moldura na abertura e seção de listagem, com layout distribuído em desktop, não apenas bloco estreito à esquerda.
- [ ] /newsletter/edicoes/responsabilidades-na-nuvem e demais slugs compartilham título/estrutura/card expandidos; parágrafos permanecem legíveis. Não aplicar limite reading720 ao conjunto inteiro.
- [ ] Landing /newsletter não sofre alteração incidental; filtros, paginação, edição escolhida, abertura pública e noindex preservados.
- [ ] 320/390/1440px sem overflow/corte, semântica/ordem de leitura/foco corretos; capturas antes/depois identificam a nova adaptação aprovada.

### Fase 8 — confiabilidade e desempenho

#### P8.1 — Tornar o E2E de contato determinístico [claude:escreve] Sonnet

**Dono:** foundation.spec.ts, teste unitário do adaptador se houver lacuna comprovada; não modificar timer/comportamento de produção para acomodar teste.
**Dependência:** P7.2/P7.3 terminados.

- [ ] Clock instalado antes de navegar; congelar/avançar tempo de forma que submitting permaneça observável e 350ms conclua deterministicamente. Não instalar clock após timers existentes.
- [ ] Asserts preservam botão disabled/aria-busy, guarda de duplicidade, falha com campos preservados, nova tentativa aceita apenas localmente e ausência de envio/storage. Verificar duplicidade de maneira observável, não apenas pelo título do teste.
- [ ] 10 repetições desktop e 10 mobile passam, retries0, sem sleep/aumento de timeout/delay do produto. Também passa na suíte completa com configuração de workers da CI/local registrada, sem reduzir concorrência para esconder falha. Regressão de cancelamento/unmount preservada.
- [ ] Teste demonstra submitting antes de avançar o relógio e conclusão após runFor(350); controle temporal instalado antes de goto, pausado somente após página pronta. Guarda de duplicidade verificada por instrumentação restrita ao teste (por exemplo contador de agendamento do timer local de submissão), ou spy equivalente viável sem dependências novas, não apenas disabled. Não adicionar contador/endpoint ao produto.

#### P8.2 — Diagnóstico reproduzível de LCP [codex] GPT; [claude:consulta] Sonnet

**Dono GPT:** servidores, relatórios/logs e PLAN. **Sonnet readonly:** análise delimitada dos candidatos/trace e proposta mínima, sem executar comandos.
**Dependência:** P8.1/gates; medir versão após correções de layout como baseline comparável.

- [ ] Preservar baseline anterior antes de regenerar relatórios; produzir três rodadas por Home/Ciber/ROSI/newsletter, mesmo build de produção/ambiente/preset, sem concorrência de testes/capturas.
- [ ] Registrar candidato LCP por rota, timing observado versus simulado, fontes requisitadas/tamanhos/preload, CSS bloqueante e trabalho main-thread/Canvas/Three. Hipótese inicial a verificar: piso compartilhado (fontes/CSS/TTFB/renderização) porque LCP é próximo nas quatro rotas apesar de JS/TBT distintos; isso não comprova causalidade. GPT entrega à consulta Sonnet pacote curto com candidatos, extratos de rede/fontes/CSS e timings observado/simulado, sem leitura de relatórios inteiros. Documentar hipótese causal sustentada por dados; não somar breakdown bruto como se fosse LCP simulado.
- [ ] Definir conjunto mínimo de otimizações dentro do escopo SSR/fonts/CSS/carregamento inicial decorativo, com arquivos e dono no PLAN antes da escrita. Se exigir dependência, mudança de arquitetura/fontes/arte aprovada ou escopo, parar e consultar.

#### P8.3 — Otimização medida sem perda visual [claude:escreve] Sonnet; medições [codex]

**Dono:** somente arquivos identificados em P8.2 (layout/fonts, CSS, fronteiras cliente/runtime gráfico e scripts de medição se bug comprovado). Não pré-autoriza reescrita ampla.
**Dependência:** P8.2 com hipótese/escopo registrados.

- [ ] Correções sustentadas pelo diagnóstico; h1/texto/CTA essenciais continuam SSR, fontes oficiais/licenças preservadas e sem salto visual, flash artificial ou ocultação de candidato LCP.
- [ ] Objetos/ASCII permanecem com fallback, primeiro quadro correto, pausa/redução/suspensão/dispose. Não remover efeito aprovado para obter pontuação.
- [ ] Três rodadas por rota no mesmo protocolo evidenciam LCP menor que baseline pós-layout, buscando mediana≤2500ms e CLS≤0,1; registrar TBT/bytes JS e qualquer regressão. Registrar mínimo/máximo de cada trio; se diferença de mediana ficar dentro da variação das rodadas, classificá-la como inconclusiva e repetir somente a comparação necessária, dentro do limite de duas iterações. Não comparar apenas melhor rodada ou ambiente diferente.
- [ ] Se meta não for atingida, não marcar otimização aceita: apresentar causas, melhoria medida e opções ao usuário. Limitar a duas iterações focadas antes de escalar decisão; evitar consumo aberto de cota.

### Fase 9 — revisão, documentação e aceite

#### P9.1 — Revisão independente e gates completos [claude:consulta] Sonnet; [codex] GPT

**Dono revisão:** sessão Sonnet distinta dos escritores; diff limitado por tarefa. **Dono gates:** GPT.
**Dependência:** P7/P8 concluídos ou exceção humana de desempenho registrada.

- [ ] Revisão readonly de diff após mudanças em três ou mais arquivos, por lote; achados corrigidos pelo dono e comprovados. Claude não é o único verificador.
- [ ] lint/typecheck/101 unitários existentes e novos/build/E2E completo passam com retries0. Skips anteriores separados de passes; não criar skips para mascarar regressões.
- [ ] Navegação suave tem asserts de posições intermediárias e destino final, não somente CSS/hash; testes reduced-motion/pausa/cross-route/mobile e destino Newsletter. Layout tem medidas de largura útil e recuo do indicador, além de capturas.
- [ ] Chromium desktop/mobile, Firefox/WebKit smoke, teclado, 320px/reflow e ausência de erros de console/rede/hidratação nas rotas testadas. Sem novos uploads privados/assets/corpos editoriais em build público.

#### P9.2 — Alinhar contexto e registrar evidências [claude:escreve] Sonnet; PLAN [codex]

**Dono:** seis docs/web, AGENTS.md e final-qa.md, apenas trechos alterados; Sonnet por tarefa curta, sem Haiku repetir leitura ampla. GPT atualiza este PLAN. Revisão documental readonly em sessão distinta.
**Dependência:** P9.1 e medições finais disponíveis.

- [ ] Documentar destino Newsletter, política de âncoras, remoção da frase inicial, largura da newsletter, fix determinístico e LCP real; eliminar contradições com notas anteriores identificando histórico. Atualizar explicitamente AGENTS.md e docs que exigem aviso inicial, sem retirar honestidade do modo demo e pós-tentativa. Migrar asserts da frase para o novo contrato, sem eliminar cobertura de estados/foco/erros/live region.
- [ ] Preservar seis docs canônicos e 56 linhas F/S/N, licenças, exports e limites operacionais; conferir hashes e links.
- [ ] Gates após escrita conforme protocolo; para documentação sem mudança de código não repetir capturas/Lighthouse. Resultados novos distinguem histórico; não chamar falha isolada aprovada de suite verde.

#### P9.3 — Revisão humana e encerramento [codex] GPT + usuário

**Dependência:** P9.1/P9.2, exceções explícitas se houver.

- [ ] Apresentar prévia local verificável e resumo por cinco correções + E2E + LCP, com imagens/dados e limitações; usuário aprova o conjunto.
- [ ] Só após aceite final arquivar este PLAN conforme regra do repositório; sem arquivo de plano concorrente antes disso.
- [ ] Sem commit final, push, PR ou deploy sem autorização específica; WIP local segue exceção já autorizada.

## 6. Testes e validação

Comandos em web/: npm run lint, npm run typecheck, npm test, npm run build, npm run test:e2e. Teste focado via npx playwright test tests/e2e/foundation.spec.ts --project=chromium-desktop --grep 'contact validates' --repeat-each=10 e equivalente chromium-mobile. Gates sem capture; capturas via node scripts/qa-capture.mjs; Lighthouse via node scripts/lighthouse.mjs, sem concorrência e com diretório baseline preservado primeiro. Servidores de testes exclusivos 3100/3101, medição3200; não matar servidor desconhecido.

Novos asserts devem provar regressões reais: movimento intermediário/endereço/destino, geometria do container e indicador, ausência da frase exata, estados submitting/duplicate/error/accepted sem tempo real frágil. Medidas visuais permitem tolerância de renderização declarada, sem pixel perfect; conservar navegabilidade sem JS, reduced-motion e guarda de dados. Reflow não certifica zoom real, smoke não certifica acessibilidade e laboratório não certifica INP de campo.

## 7. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Next já salta ao hash antes da animação | Alto | Teste cross-route e coordenar scroll após montagem; preservar histórico/teclado, sem Lenis/GSAP. |
| Scroll interfere no pinning ou viola redução | Alto | Testar serviços/processo, pausa/redução e navegação repetida; não copiar handler errado do export. |
| Remover aviso parece habilitar backend | Médio | Visitante pode preencher antes de descobrir indisponibilidade: risco UX registrado em atendimento ao pedido explícito. Feedback honesto após tentativa, demo identificado; preservar D01/D09/D10 e privacidade. |
| Select perde usabilidade nativa/forced-colors | Médio | Manter select nativo, chevron sem interação e fallback de contraste. |
| Largura global altera landing/legibilidade | Médio | Classes delimitadas por página e parágrafos com limite; testar todos slugs. |
| Clock interfere no Canvas/React | Médio | Instalar antes da página, isolar cenário temporal, avançar tempo explicitamente sem alterar produção. |
| LCP alto vem da simulação/rede/fonts | Alto | Diagnóstico por candidato/trace, baseline comparável, mediana de três rodadas; sem garantia antes de medir. |
| Claude consome cota em leitura ampla | Alto | Uma tarefa curta, escopo e recortes do PLAN, sem transcrição/exports completos; máximo duas iterações de desempenho antes de consultar. |
| Árvore suja ou servidor do usuário | Alto | Inspeção WIP/segredos/gerados; não sobrescrever mudanças nem encerrar processo desconhecido. |

## 8. Progresso e aprovação

| Tarefa | Responsável | Estado | Evidência/dependência |
|---|---|---|---|
| Pesquisa e entrevista | GPT/usuário | Concluído | Fontes/código acima; largura Opção1 confirmada. |
| Crítica deste plano | Sonnet5.5 readonly | Concluído com ajustes | Sessão00b6b993-cc46-4696-8187-5b2960ae9004 succeeded45s; cinco grupos de sugestões avaliados/incorporados. |
| P7.1 Header/scroll | Sonnet | Concluído | Gates69932 lint/types/101unit/build/266E2E6skip; revisão independente aprovada. |
| P7.2 Aviso/select | Sonnet | Concluído | Gates34414 lint/types/101unit/build/270E2E6skip; revisão6d65922a e geometria320/390/1440 aprovadas. |
| P7.3 Newsletter | Sonnet | Gates concluídos | Exec57880 lint/types/101unit/build/284E2E6skip; captura/revisão consolidada emP9.1. |
| P8.1 E2E | Sonnet | Em execução | P7 gates concluídos; checkpoint antes da escrita. |
| P8.2 Diagnóstico LCP | GPT + Sonnet consulta | Aguardando aprovação | P8.1. |
| P8.3 Otimização | Sonnet + GPT gates | Aguardando aprovação | P8.2; consultar se sair do escopo. |
| P9.1 Revisão/gates | Sonnet independente + GPT | Aguardando aprovação | P7/P8. |
| P9.2 Contexto/evidências | Sonnet + GPT PLAN | Aguardando aprovação | P9.1. |
| P9.3 Aceite | Usuário + GPT | Pendente | Sem antecipar aprovação. |

**Revisão independente:** primeira inicialização falhou após30s e foi encerrada sem sessionId; usuário avisado antes da única nova tentativa. Sonnet5.5 sessão00b6b993-cc46-4696-8187-5b2960ae9004 succeeded45s, aprovou com limites e cinco grupos de ajustes. Leu somente bloco inicial do plano, sem verificar arquivos de código/testes. GPT incorporou isolamento do scroll, execução browser/medições por GPT, E2E completo e duplicidade observável, hipótese compartilhada de LCP/variabilidade e atualização dos contratos do aviso. Referência do revisor a Next14 não se aplica: projeto usa16.4.0; nenhuma troca de versão foi proposta. Não tratar hipóteses do revisor como defeitos comprovados.

**Gate:** apresentar este plano após crítica independente; implementar somente após aprovação explícita do usuário. Este planejamento não significa que as cinco falhas já foram corrigidas nem que LCP/teste estejam resolvidos.

---

# Histórico preservado — migração Next anterior

O conteúdo abaixo preserva aprovações, contratos e evidências anteriores. Seus estados de conclusão não representam aceite desta rodada de correções; usar as tarefas P7–P9 acima como trabalho ativo.

# Desenvolvimento do frontend Root Trust em Next.js

**Aprovado pelo usuário:** “Aplique o plano”, 10/10/2026. **Estado:** execução. Este arquivo é a fonte única de tarefas e evidências. A aprovação visual da Home é obrigatória antes das páginas internas.

## 1. Problema e objetivo

Converter os 12 exports aprovados do Claude Design em frontend Next.js executável, fiel ao visual, conteúdo e comportamento, corrigindo as lacunas auditadas. Consolidar documentação sem perder contratos. Backend, CMS, e-mail, recebimento real de contatos, relatórios operacionais, hospedagem e deploy ficam para outra etapa.

## 2. Pesquisa e evidências

O repositório contém marca v2, contratos F01–F29, S01–S16 e N01–N11 e auditorias dos exports. No levantamento inicial ainda não havia aplicação npm ou testes; a fundação, Home e páginas internas estão implementadas; Home aprovada em 10/10 e QA final em P6. Node observado: 24.13.1; npm: 11.8.0. O runtime DC interpreta templates dinamicamente; sua substituição por JSX integra a migração. Three.js direto produz objetos; Canvas 2D produz hero/moldura/símbolos. A Home original tem `s.href`/`s.title` indevidos em `ETAPAS.map`; preservar original e corrigir somente cópia de comparação.

Fontes: [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [hidratação](https://nextjs.org/docs/messages/react-hydration-error), [instalação](https://nextjs.org/docs/app/getting-started/installation), [suporte](https://nextjs.org/support-policy), [React effects](https://react.dev/reference/react/useEffect), [Three cleanup](https://threejs.org/manual/pages/cleanup.html), [Vitest](https://nextjs.org/docs/app/guides/testing/vitest), [Playwright](https://nextjs.org/docs/app/guides/testing/playwright), [snapshots](https://playwright.dev/docs/test-snapshots), [Web Vitals](https://web.dev/articles/vitals), [agentes](https://learn.chatgpt.com/docs/agent-configuration/subagents).

A pesquisa observou Next 16.4.0/React 19.3, Three 0.184.0, Vitest 5.0.3 e Playwright 1.64.0. Revalidar registry, compatibilidade e advisories na instalação: versões pesquisadas não substituem a verificação. TypeScript 5.9.3 evita incompatibilidade observada entre TS 7 e parser ESLint. Firecrawl retornou falta de créditos; documentação oficial foi pesquisada pela web, sem alegar consulta Firecrawl bem-sucedida.

## 3. Decisões aprovadas

| ID | Decisão |
|---|---|
| D01 | Frontend completo primeiro; integrações e publicação adiadas. |
| D02 | Preservar 12 exports aprovados; corrigir bugs, contratos e acessibilidade auditados, sem redesenho. |
| D03 | Somente tema escuro nesta entrega. |
| D04 | Aplicação em `web/`; exports preservados em `references/claude-design/`. |
| D05 | Exatamente seis documentos canônicos em `docs/web`; excluir substituídos após migrar informação única. Preservar marca/assets. |
| D06 | GPT-6.1 Sol XHigh orquestra, mantém PLAN e decide escopo/arquitetura; todo desenvolvimento restante ocorre pelo MCP `claude-agent`, com Sonnet ou Haiku explícitos. Opus somente consulta complexa. Uma escrita ativa por vez; revisor independente. Atualizado pelo usuário em 10/10/2026; Fable excluído por indisponibilidade no plano Pro. Exceção autorizada em11/10 (Opção A): GPT atualiza somente documentação final; GPT também executa gates/servidores, sem implementar código do site. |
| D07 | Aprovação humana da Home antes das internas; aceite humano final do conjunto. |
| D08 | `/privacidade` temporária, descrevendo honestamente a operação local. |
| D09 | Campos ativos, validação completa, preparados para futura integração. |
| D10 | Simulação local identificada de carregamento/sucesso/erro em modo demo/testes; nenhum envio real. |

## 4. Arquitetura, contratos e propriedade

Next App Router, React, TypeScript estrito, npm, CSS Modules e tokens CSS; Three.js direto. Sem R3F, Tailwind, runtime DC/CDN ou Cache Components. Conteúdo essencial em Server Components; fronteiras cliente pequenas para interação/gráficos. Primeiro render determinístico. Baloo 2 e Archivo via `next/font/local`, preservando OFL. Dependências e builds têm um único proprietário.

```text
PLAN.md
AGENTS.md
.codex/config.toml
.codex/agents/
.claude/settings.json
docs/design/
docs/web/{README,product,design,tools,newsletter,development}.md
references/{claude-design,audits,editorial}/
web/{src/app,src/components,src/features,src/lib,src/styles,public,tests}/
web/{package.json,package-lock.json}
.github/workflows/
```

### Rotas

`/`; `/servicos/ciberseguranca`; `/servicos/infraestrutura-em-nuvem`; `/servicos/desenvolvimento-de-software` (rótulo Software); `/ferramentas/rosi`; `/ferramentas/shadow-ai`; `/ferramentas/divida-tecnica`; `/ferramentas/migracao-para-nuvem`; `/newsletter`; `/newsletter/edicoes`; `/newsletter/edicoes/[slug]`; `/privacidade`; 404 nativa. Sem Sobre, hub de ferramentas ou diagnóstico dedicado.

### Formulários

`FORM_MODE=demo` ativa explicitamente simulação local em ambiente de revisão/testes. Sem configuração, nunca produzir sucesso simulado. Campos permanecem ativos, com validação, foco/erros associados, guarda contra envio duplicado e preservação após erro. Adaptador interno único separa UI da submissão futura. Diagnóstico exige Nome, Empresa e WhatsApp. Aviso junto ao formulário e confirmação informa “nenhum dado foi enviado”. Newsletter aceita solicitação de confirmação, sem declarar inscrição confirmada/endereço verificado/e-mail entregue. Relatório recebe contato e ID da ferramenta, nunca respostas/resultados. Nenhum endpoint operacional, persistência ou analytics nesta fase.

### Ferramentas, newsletter e gráficos

Modelos puros TS preservam F01–F29. Estado local descartado ao sair e limpo no retorno; sem URL/storage/logs/associação ao e-mail. Edição invalida resultado; troca 12/36 meses exige revisão, sem multiplicação automática. Shadow AI sem score. Vazio/desconhecido não são zero; preservar resultados negativos; tratar denominador zero e overflow explicitamente.

Newsletter: três amostras públicas, metadados/fontes/primeiro parágrafo completo; arquivo com dois itens por página e filtro reiniciando página 1. Preservar edição escolhida; inscrição geral escolhe mais recente. Slug inválido retorna HTTP 404 antes de streaming. Corpos completos ficam fora de HTML/RSC/JS/maps/assets; demos sem indexação.

Pausa global acessível durante a sessão SPA; redução de movimento dinâmica. Animar somente quando não reduzido, não pausado, aba visível e elemento relevante. Pausa/redução mantêm apresentação estática. Aba oculta suspende desenho e timers. Fallback usa asset aprovado sem reconstruir logo. Descarte explícito de GPU/listeners/loops e guarda contra inicialização assíncrona após desmontagem.

### Consolidação documental

`README`: índice/estado; `product`: brief/conteúdo/fluxos/serviços; `design`: visual/componentes/responsivo/movimento/a11y; `tools`: F01–F29/modelos/fixtures; `newsletter`: N01–N11/limites públicos; `development`: arquitetura/comandos/testes/agentes/integrações pendentes. Audits → `references/audits`; edições completas → `references/editorial`. Manter rastreabilidade F/S/N e distinção aprovado/proposta/demo/pendência/histórico. Excluir briefings/prompts/planos antigos após conferir cobertura. Atualizar links de AGENTS e marca sem reescrever o manual. Nenhuma limpeza ampla de `temp`.

### Agentes, modelos e operação da ponte Claude

Distribuição atual substitui Luna/Sol como executores futuros; nomes nas evidências concluídas permanecem históricos. Os perfis em `.codex/agents/` ficam preservados, sem uso para implementação nesta etapa. Não alterar modelos/permissões globais ou a assinatura do usuário.

| Responsabilidade | Modelo / permissão | Motivo |
|---|---|---|
| Orquestração, PLAN, despacho, critérios e decisões | GPT-6.1 Sol XHigh; `[codex]` | Coordenação e validação de evidências; não implementa código do site. |
| Inventário, cópias com hash, catálogo por allowlist, documentação factual | `haiku`; `[claude:escreve]` | Trabalho delimitado e verificável, sem criar regras de negócio. |
| Next/React, CSS, gráficos, modelos, testes, CI e correções | `sonnet`; `[claude:escreve]` | Trabalho com dependências, estado, matemática e lifecycle. |
| Revisão funcional, visual, matemática, privacidade e acessibilidade | `sonnet`; `[claude:consulta]`, sessão independente | Verificar contratos e diff com contexto suficiente, sem autorrevisão como aceite. |
| Impasse arquitetural/matemático ou falha crítica persistente | `opus`; `[claude:consulta]`, condicional | Segunda opinião pontual; GPT decide e Sonnet implementa. |

**Capacidade verificada em 10/10/2026:** o schema MCP aceita os aliases `haiku`, `sonnet`, `opus` e `fable`; **Fable é proibido neste plano**, pois o usuário não tem acesso no Pro. O schema não permite IDs arbitrários, `opusplan`, ajuste de esforço ou orçamento de tokens. Não inventar parâmetros low/high/XHigh para Claude. Resolução inicial histórica: Haiku `claude-haiku-4-5-20251001` e Sonnet `claude-sonnet-5`. Após os mapeamentos locais abaixo, Sonnet/Haiku/Opus 5.5 efetivos foram observados em tarefas úteis; registrar o `model` de cada chamada, sem presumir disponibilidade futura. Alias aceito no schema não comprova acesso. Não gastar rodadas apenas para testar modelos; validar na primeira tarefa útil. Modelo inesperado: interromper antes de continuar a tarefa, registrar e informar; nunca fazer fallback silencioso.

Servidor denominado `claude-agent` nas instruções do usuário; ferramentas reais expostas neste ambiente: `mcp__claude_agent__claude`, `mcp__claude_agent__claude_reply`, `mcp__claude_agent__claude_result` e `mcp__claude_agent__claude_cancel`. Os nomes curtos `claude-reply`/`claude-result`/`claude-cancel` neste protocolo se referem a essas ferramentas; não são servidores adicionais.

**Atualização solicitada pelo usuário — versões atuais:** em 10/10/2026, a documentação oficial de configuração lista Sonnet 5.5, Haiku 5.5 e Opus 5.5; a CLI instalada é 2.1.296, acima dos mínimos publicados (2.1.284 / 2.1.293 / 2.1.280, respectivamente). Como a ponte só aceita aliases e anteriormente resolveu modelos mais antigos, `.claude/settings.json` define apenas os mapeamentos de família `ANTHROPIC_DEFAULT_*_MODEL` para `claude-sonnet-5-5`, `claude-haiku-5-5` e `claude-opus-5-5`, restritos a este projeto. Sem alterar permissões/configurações globais ou instalar/atualizar ferramentas. Esta configuração expressa o modelo solicitado, não comprova acesso: confirmar `model` efetivo no início de cada sessão; rejeição ou versão divergente exige cancelamento/registro e consulta ao usuário, sem fallback. Revalidar versões oficiais e acesso ao retomar outra fase, evitando manter pins antigos por inércia. Fable continua excluído.

Fontes oficiais: [configuração e resolução de aliases](https://code.claude.com/docs/en/model-config), [Sonnet](https://www.anthropic.com/claude/sonnet), [Haiku](https://www.anthropic.com/claude/haiku), [Opus](https://www.anthropic.com/claude/opus). A escolha acima é uma avaliação para este repositório; descrições comerciais e preço por token de API não estimam a cota Pro. A ponte informa `contextTokens`, não gasto total nem saldo do plano.

#### Protocolo obrigatório por tarefa

1. `[codex]` confirmar raiz com `git rev-parse --show-toplevel`, verificar dependência/estado e atribuir dono/arquivos. Nenhuma página interna antes do aceite P3.4. Preservar árvore suja e evidências existentes; não refazer P1/P2.
2. Antes de cada `[claude:escreve]`: executar `git add -A --dry-run` e inspecionar arquivos para segredos/gerados, sem imprimir conteúdo sensível. Se houver suspeita, parar e informar. Aplicar exclusões já previstas para builds/caches; não descartar trabalho anterior.
3. Criar ponto de restauração LOCAL: `git add -A` e `git commit -m "wip: pre-claude <passo>"` (`--allow-empty` se necessário). Exceção autorizada pelo usuário em 10/10/2026 inclui a árvore suja preexistente, após inspeção. Falha bloqueia escrita; registrar hash neste PLAN antes da chamada. Commit final, push, PR e deploy continuam exigindo autorização específica.
4. Abrir sessão nova `claude` com `cwd` na raiz e `model` explícito. `writable: true` somente em tarefa `[claude:escreve]` escrita aqui; omitir em consulta. Prompt curto: ID, objetivo, arquivos permitidos/proibidos, contratos, testes e formato da evidência. Sempre incluir: “Leia AGENTS.md, PLAN.md e os documentos que o passo citar antes de agir.” Para leitura limitada, indicar as seções/IDs relevantes, sem colar histórico.
5. Rodapé obrigatório: “Sessão headless: AskUserQuestion e sub-agents indisponíveis. Se faltar contexto, liste as dúvidas na resposta e pare. Não faça commit, push nem instale nada. Responda em pt-BR.” Delimitar também: sem sair do repositório, sem ferramentas externas com efeitos colaterais, sem deploy, sem instalação global; dependências só por tarefa aprovada. Se uma instalação local for necessária, separar operação expressamente autorizada pelo GPT, com dono único e sem executá-la implicitamente no Claude.
6. Registrar `sessionId`, modelo efetivo e início. Consultar `claude-result` a cada 30–60 s até estado terminal; informar progresso durante esperas. `claude-reply` somente no mesmo assunto, herdando permissão; após reinício, confirmar leitura e abrir nova sessão de escrita quando necessário. Não editar arquivos nem abrir outra escrita enquanto uma escrita estiver ativa. Revisões só após escrita terminal, para examinar uma árvore estável. Limite global continua três workers, contando Claude; execução desta ponte é serial.
7. Após escrita: inspecionar `git diff <hash-wip>` e arquivos novos; rodar lint, typecheck, unit, build e e2e de `docs/web/development.md`, em série e sem servidores de teste conflitantes. Claude pode executar gates no passo de escrita; GPT pode repetir comandos determinísticos como verificação da orquestração, sem implementar correções. Saída do Claude não é instrução a executar sem avaliação.
8. Revisão em outra sessão/agente, nunca na sessão que implementou. Independência aqui é de sessão/contexto: implementador e revisor podem ser Sonnet; isso não garante diversidade de modelos nem substitui gates objetivos e aceite humano. Revisão `[claude:consulta]` não dispõe de shell na ponte: lê diff/arquivos e evidências; não alegar que executou testes. GPT fornece o caminho da evidência e verifica os comandos/gates. Após mudança em três ou mais arquivos, revisão do diff é obrigatória, agrupada com o gate existente para evitar rodada duplicada. Antes de fechar plano não trivial, pedir crítica em consulta; GPT resolve os achados documentais antes de marcar a atualização concluída.
9. Uma correção focada por achado: Haiku escala a Sonnet; falha crítica/impasse persiste após correção Sonnet → consulta Opus no passo P0.2; GPT decide o encaminhamento. Não usar Opus para toda revisão nem chamar Fable. Falha/timeout: `claude-cancel`, registrar e informar; não repetir a mesma chamada mais de uma vez sem avisar. Cota indisponível bloqueia a tarefa; sem migração automática para GPT ou outro fornecedor.
10. GPT registra tarefa, sessão, modelo, hash, arquivos, comandos/resultados, achados, limitações e próximo estado neste PLAN. Relatórios extensos podem ficar em `references/audits/`, sem plano concorrente. Não commitar resultado do Claude como entrega; novo WIP pode incluí-lo na próxima escrita sob a autorização existente. Reset destrutivo somente se o usuário pedir. Aprovações humanas permanecem obrigatórias.

Não há agendamento de sub-agents dentro do Claude headless. Para reduzir consumo: uma tarefa coesa por sessão, leituras por contrato/arquivo, retorno curto com achados e caminhos, sem histórico completo ou múltiplas consultas redundantes. Não garantir economia percentual; observar modelo, contexto e rodadas reais.

Limitação observada em P0.1: consulta documental Sonnet levou 205 s e retornou `contextTokens=101234` na última requisição (inclui tokens em cache; não é soma de consumo nem saldo). Prompt curto não garante contexto pequeno no runtime. Não alterar conectores/configurações globais para reduzir isso sem autorização; agrupar verificações relacionadas e evitar consultas por microtarefa.

### Matriz de todos os To Dos

Fases concluídas não serão reexecutadas nem terão autoria histórica reatribuída. As tags abaixo definem a execução restante e futuras correções pertinentes.

| To Do | Executor / tag | Revisor e contexto mínimo |
|---|---|---|
| P0.1 Atualizar distribuição e instruções | GPT `[codex]` | Sonnet consulta; PLAN, AGENTS e development. |
| P0.2 Impasse complexo, somente quando acionado | Opus `[claude:consulta]` | GPT decide; achado reproduzível, contrato e alternativas. Sem escrita. |
| P0.3 Versões atuais e piloto | GPT `[codex]`; Sonnet `[claude:consulta]` em P3.4-P | Configuração local de aliases; validar modelo efetivo e aguardar decisão do usuário após uma tarefa. |
| P0.4 Bloqueio de arquivos .env* | GPT `[codex]`, por determinação do usuário | Preservar arquivos locais; excluir todos do versionamento, sem exceção para template. Nenhum Claude nesta correção. |
| P1.1 Registro do plano (concluído) | GPT `[codex]` | Preservar evidências. |
| P1.2 Inventário/assets (concluído) | Histórico; correções Haiku `[claude:escreve]` | Sonnet consulta; inventário, hashes e baseline. |
| P1.3 Consolidação documental (concluído) | Histórico; correções Haiku `[claude:escreve]` | Sonnet consulta; matriz F/S/N/D, sem reinterpretar contratos. |
| P1.4 Instruções/agentes (concluído) | Histórico; migração atual em P0.1 | Perfis Codex preservados; sem reconfiguração global. |
| P2.1 Bootstrap (concluído) | Histórico; correções Sonnet `[claude:escreve]` | Sonnet independente; development e fundação. |
| P2.2 Assets (concluído) | Histórico; correções Haiku `[claude:escreve]` | Sonnet; catálogo, allowlist e hashes. |
| P2.3 Shell/componentes (concluído) | Histórico; correções Sonnet `[claude:escreve]` | Sonnet; design, D09–D10 e testes afetados. |
| P2.4 Testes/formulários (concluído) | Histórico; correções Sonnet `[claude:escreve]` | Sonnet; adaptador, validação e provas dos gates. |
| P3.1 Gráficos em revisão | Sonnet `[claude:escreve]`, se houver correção | Sonnet independente em P3.4; lifecycle, GPU, shaders e baseline. |
| P3.2 Movimento em revisão | Sonnet `[claude:escreve]`, se houver correção | Sonnet em P3.4; pausa/redução/suspensão/fallback. |
| P3.3 Home em revisão | Sonnet `[claude:escreve]`, se houver correção | Sonnet em P3.4; design/product, Home e testes. |
| P3.4 Revisão e aceite Home | Sonnet `[claude:consulta]`; GPT/usuário `[codex]` | Sessão independente; comparação visual, gates e achados. Correções retornam P3.1–P3.3; usuário aprova. |
| P3.4-P Piloto: movimento/lifecycle | Sonnet `[claude:consulta]`; GPT verifica evidências `[codex]` | Uma tarefa de revisão estática, sem corrigir código ou concluir P3.4. Resultado apresentado antes de continuar. |
| P3.4-T Testes de movimento/fallback e evidência visual | Sonnet `[claude:escreve]` | Sonnet independente depois da escrita; testes reais Chromium, falhas reproduzíveis e comparação estática com baseline. Sem mudar direção visual. |
| P4.1 Três serviços | Sonnet `[claude:escreve]` | Sonnet P4.4; product S01–S16, exports e componentes existentes. Conteúdo contratual exclui Haiku como dono. |
| P4.2 Modelos puros | Sonnet `[claude:escreve]` | Sonnet P4.4; tools F01–F29, fixtures e unidades. Matemática não delegada ao Haiku. |
| P4.3 Quatro interfaces | Sonnet `[claude:escreve]` | Sonnet P4.4; modelos, estado local, formulários e exports. |
| P4.4 Revisão S/F | Sonnet `[claude:consulta]` | Sessão independente das implementações; gates e contratos. Correções retornam ao dono P4.1–P4.3. |
| P5.1 Catálogo público | Haiku `[claude:escreve]` | Sonnet antes de consumo público; newsletter N01–N11, allowlist e aberturas permitidas. |
| P5.2 Três páginas newsletter | Sonnet `[claude:escreve]` | Sonnet P5.4; newsletter, catálogo revisado, filtros/edição escolhida. |
| P5.3 Privacidade/metadata/404 | Sonnet `[claude:escreve]` | Sonnet P5.4; development/product, HTTP 404, noindex e privacidade real. |
| P5.4 Revisão pública | Sonnet `[claude:consulta]` | Sessão independente; HTML/RSC/JS/maps/assets e evidências de inspeção. |
| P6.1 CI local | Sonnet `[claude:escreve]` | Sonnet independente; scripts, lockfile, Node e workflow sem deploy. |
| P6.2 QA integral | Sonnet `[claude:consulta]`; GPT executa gates `[codex]` | Revisor distinto; artefatos de browser, visual, matemática e medições. Novos testes/correções via dono de escrita original. |
| P6.3 Aceite/entrega | GPT + usuário `[codex]` | GPT autorizado escreve apenas documentos/evidências em P6.3-D; Sonnet revisa diff. |
| P6.3-D Documentação final | GPT `[codex]` autorizado em 11/10; Sonnet `[claude:consulta]` | Após P6.2, antes do aceite final: seis docs/evidências, sem código nem alteração de escopo. GPT arquiva PLAN somente após aceite. |

## 5. Fases, tarefas e Acceptance Criteria

### Fase 0 — Troca de executores, sem reiniciar desenvolvimento

#### P0.1 Atualizar plano e instruções — [codex]
Dependência: solicitação atual do usuário. Dono GPT; alterações limitadas a PLAN, AGENTS e development.
- [x] Modelos por tarefa definidos, Fable excluído e limitações reais da ponte registradas.
- [x] Preservar tarefas concluídas, contratos, dependências e aprovação humana da Home.
- [x] Crítica independente Sonnet em somente leitura e revisão dos três documentos; GPT resolveu os quatro achados documentais após o retorno.
- [x] Modelo efetivo e sessionId da crítica registrados; nenhum código do site alterado.

#### P0.2 Consultoria complexa condicional — [claude:consulta] Opus
Dependência: impasse documentado após uma correção Sonnet, ou decisão arquitetural complexa levantada pelo GPT.
- [x] Quando acionado: registrar problema, alternativas, sessão/modelo e recomendação; GPT decide sem ampliar escopo implicitamente.
Não é bloqueador obrigatório: permanecer “não acionado” quando não houver impasse; sem chamada só para testar disponibilidade.

#### P0.3 Atualizar versões e validar uma tarefa — [codex]
Dependência: solicitação do usuário para modelos atuais e um piloto antes da continuação completa.
- [x] Fonte oficial e CLI local verificadas; mapeamento de família restrito a `.claude/settings.json`, sem Fable/permissões novas.
- [x] Modelos efetivos Sonnet, Haiku e Opus 5.5 confirmados em tarefas úteis; Sonnet no piloto, Haiku em P5.1 e Opus no impasse P4.2.
- [x] Resultado, limites e próximos passos registrados em `references/audits/claude-home-motion-pilot.md`.
- [x] Usuário validou piloto: “Pela minha análise tudo correu bem. Siga com o resto das outras tasks.” (10/10/2026). Isso não aprova visualmente a Home.

#### P0.4 Resolver arquivos .env* mantendo o bloqueio — [codex]
Dependência: instrução do usuário “Mantenha esse bloqueio por agora, resolva essas questões relacionadas a .env* com os modelos do GPT”. Esta correção é exclusiva do GPT; não autoriza Claude a ler/editar esses arquivos.
- [x] Confirmado: nenhum `.env*` já versionado; único template identificado é `web/.env.example`, sem dependência/referência obrigatória no código ou docs.
- [x] `.gitignore` usa `.env*`, sem exceção. Template preservado no disco, ignorado por Git; nenhum conteúdo/configuração local removido ou enviado ao Claude.
- [x] Oito verificações de ignore passaram; arquivo normal da aplicação continua versionável. Template preservado; nenhum `.env*` já rastreado. Dry-run: 243 entradas, zero caminhos sensíveis/gerados detectados; busca de padrões de chaves/tokens sem correspondências.
- [x] Resultado registrado; regra de parada mantida caso um arquivo sensível volte a aparecer no checkpoint. Git ignore controla versionamento, não é sandbox de acesso; Claude continua fora do escopo `.env*`.

### Fase 1 — Referências e documentação

#### P1.1 Registrar plano e estado — orquestrador
Dependência: aprovação do usuário. Registrar plano aprovado e alterações anteriores.
- [x] Decisões, tarefas, dependências e critérios persistidos.
- [x] Estado Git anterior identificado; nenhuma alteração preexistente descartada.

#### P1.2 Preservar exports e baseline — Luna Low; correção técnica Sol Medium
Dependência: P1.1. Mover exports com inventário e criar cópia de comparação.
- [x] Doze HTML e dependências preservados com hashes antes/depois e caminhos relativos funcionais.
- [x] Home original intacta; cópia de comparação corrige somente `s` indefinido, com diff registrado.
- [x] Cópia executa sem erro `Home.renderVals` conhecido.

#### P1.3 Consolidar seis documentos — Luna High
Dependência: P1.2. Migrar contratos e eliminar redundâncias.
- [x] Exatamente seis docs; F/S/N, copy, fluxos e auditorias com origem/destino verificáveis.
- [x] Exclusões somente após cobertura de requisitos únicos; links válidos, inclusive marca.

#### P1.4 Configurar agentes e revisar contexto — Sol Medium; revisor Sol High
Dependência: P1.3. Atualizar instruções/propriedade e verificar consolidação.
- [x] Perfis explícitos, máximo três workers, AGENTS atualizado e regras de autorização preservadas.
- [x] Revisão independente sem perda de contratos ou conflito de autoridade.

### Fase 2 — Fundação Next

#### P2.1 Bootstrap — Sol Medium integrador
Dependência: P1.4. Inicializar aplicação mínima na stack aprovada.
- [x] Compatibilidade/advisories/Node verificados; lockfile, TS estrito e ESLint presentes.
- [x] Scripts reais dev/build/start/typecheck/lint; sem sobrescrever instruções ou adicionar tecnologias não aprovadas.

#### P2.2 Assets — Luna Low e integrador
Dependência: P2.1. Publicar apenas cópias necessárias com proveniência.
- [x] Fontes/assinaturas/grafismos corretos locais, OFL incluídas e allowlist pública registrada.
- [x] Sem uploads privados, identidade antiga ou alteração de assets originais.

#### P2.3 Shell e componentes — Sol Medium
Dependência: P2.2. Estrutura SSR, navegação e fundamentos de interface.
- [x] Destinos corretos; menu teclado/Escape/devolução de foco.
- [x] Campos semânticos com labels/tipos/autocomplete/erros; 320px sem overflow.

#### P2.4 Testes e formulários demo — Sol Medium + QA
Dependência: P2.3. Vitest Node e Playwright contra produção; contrato D09–D10.
- [x] Scripts e smoke executáveis com build/start de produção.
- [x] Validação/loading/sucesso/erro explícitos, sem rede/persistência; sem configuração não há falso sucesso.
- [x] Configuração local e testes documentados.

### Fase 3 — Gráficos e Home

#### P3.1 Portar gráficos — [claude:escreve] Sonnet, somente correções restantes
Dependência: P2.4. Preservar formas, materiais e shaders em lifecycle React.
- [x] Sem canvas/listeners/loops duplicados na montagem/desmontagem.
- [x] GPU/recursos compartilhados descartados; import/fontes tardios não ressuscitam componente.
- [x] Falha de inicialização/perda de contexto exibem fallback.

#### P3.2 Movimento acessível — [claude:escreve] Sonnet, somente correções restantes
Dependência: P3.1. Completar pausa e suspensão dinâmica.
- [x] Pausa visível, redução dinâmica, suspensão de aba oculta/elemento fora de tela.
- [x] Conteúdo/CTA utilizáveis sem gráficos; estado estático legível.

#### P3.3 Home nativa — [claude:escreve] Sonnet, somente correções restantes
Dependência: P3.2. Portar todas as seções e corrigir auditoria.
- [x] Desktop/mobile fiéis; seletor/processo/terminal acessíveis por teclado.
- [x] Links de serviços/ferramentas/arquivo corretos; formulário D09–D10.
- [x] ROSI descrito como simulador financeiro, sem runtime DC ou erro de hidratação.

#### P3.4 Validar Home e obter aceite — [claude:consulta] Sonnet independente; [codex] GPT + usuário
Dependência: P3.3.
- [x] Build/lint/tipos/testes; capturas por seção e inspeção amostral desktop/mobile, diferenças e limites em `references/audits/home-qa.md`.
- [x] Desktop/mobile/teclado/pausa/redução/fallback verificados.
- [x] **Usuário aprovou Home: “Sim, aprovo a home”, 10/10/2026. P4/P5 liberados.**

#### P3.4-P Piloto de revisão movimento/lifecycle — [claude:consulta] Sonnet
Dependência: P0.3 (versões verificadas/configuração solicitada) e implementação P3.1–P3.3 existente. Esta tarefa é um recorte de P3.4, não substitui comparação visual, QA integral ou aceite humano. Nenhuma escrita Claude; nenhum checkpoint WIP necessário.
- [x] Revisar GraphicsProvider, animation, HomeCanvas, PillarArt, SymbolAscii, pillar-runtime, Terminal e testes relacionados: pausa, redução dinâmica, aba oculta, interseção, inicialização tardia e descarte.
- [x] Achados com caminho/linha, mecanismo e gravidade; separar fatos do código de hipóteses e cobertura ausente. Nenhum teste de browser declarado executado pelo revisor.
- [x] GPT confrontou achados e corrigiu afirmação incorreta sobre cobertura: recursos/context-loss já têm testes. Lint/typecheck/unit/build/e2e passaram; nenhuma correção de código nesta rodada.
- [x] Relatório salvo em `references/audits/claude-home-motion-pilot.md`; sequência bloqueada até validação do usuário.
- [x] Usuário validou resultado do piloto em 10/10/2026; isso não equivale ao aceite visual da Home.

#### P3.4-T Completar QA de movimento/fallback e evidências visuais — [claude:escreve] Sonnet
Dependência: piloto aprovado; P3.1–P3.3 implementados. Dono Sonnet; arquivos permitidos: `web/tests/e2e/`, `web/tests/unit/graphics/`, correções mínimas reproduzíveis em `web/src/features/graphics/` e evidência em `references/audits/home-qa.md`/`references/audits/home-qa/`. Sem modificar PLAN, marca, exports, formulários, dependências ou páginas internas. Não ler/editar `.env*`.
- [x] Adicionar regressões úteis de redução dinâmica, pausa, fallback de inicialização/perda de contexto e suspensão; distinguir simulações de visibilidade de testes reais de aba.
- [x] Corrigir somente bugs reproduzidos nos gráficos, preservando composição e controles; nenhum bug de produção confirmado, sem alteração em web/src.
- [x] Executar lint/typecheck/unit/build/e2e em série; 45 capturas desktop/mobile, limites/diferenças documentados. Sem comparação pixel a pixel.
- [x] Revisão Sonnet independente aprovada após correção do servidor de capturas.
- [x] Aceite humano da Home obtido em 10/10/2026; P4/P5 liberados.

### Fase 4 — Serviços e ferramentas (após aceite da Home)

#### P4.1 Três serviços — [claude:escreve] Sonnet
Dependência: P3.4. Portar três rotas, seis seções, quatro frentes.
- [x] Restaurar vulnerabilidades/Red Team/compliance; preservar limites contratuais de Pentest/reteste/suporte.
- [x] Sem novos pilares, provas ou promessas; componentes/formulários/gráficos comuns; moldura e símbolo CTA restaurados após revisão.

#### P4.2 Modelos puros — [claude:escreve] Sonnet
Dependência: P3.4. Extrair modelos F e fixtures independentes.
- [x] Vazio/desconhecido/zero diferenciados, divisão zero/não finitos tratados; Shadow sem score.
- [x] 69 testes unitários passando, confirmados GPT; revisão independente Sonnet e Opus no impasse de precisão concluídas. Limite IEEE754 documentado.

#### P4.3 Quatro interfaces — [claude:escreve] Sonnet
Dependência: P4.2. Entradas/resultados compactos e revisão.
- [x] Calcular/editar/limpar; horizonte invalida; sair/retornar limpa respostas (pageshow persistido testado por simulação, BFcache real não certificado).
- [x] Nenhuma resposta em URL/storage/logs/submissão; relatório e newsletter independentes.

#### P4.4 Revisão — [claude:consulta] Sonnet independente
Dependências: P4.1 e P4.3.
- [x] Contratos S/F, fixtures independentes e jornadas conferidos; três revisões focadas após escrita, sem bug bloqueador restante.
- [x] Nenhum envio/persistência de respostas; revisão de código e testes locais, limites em tools-native.md.

### Fase 5 — Newsletter e rotas (após aceite da Home; independente da fase 4 até P5.2, execução Claude serial)

#### P5.1 Catálogo público — [claude:escreve] Haiku
Dependência: P3.4.
- [x] Slugs/datas/pilares/fontes/abertura e links preservados; nenhum corpo completo.
- [x] Edições extras somente em fixtures de teste.
- [x] Revisão Sonnet independente23c26e7b-8401-4935-99c6-5c41a3de4b7d aprovou allowlist; GPT confirmou94unit e hashfonte.

#### P5.2 Três páginas — [claude:escreve] Sonnet
Dependência: P5.1.
- [x] Apresentação completa; filtro reinicia paginação, dois itens/página.
- [x] Prévia/retorno/edição escolhida corretos; demos identificadas; aceito não significa confirmado.

#### P5.3 Privacidade, metadata e 404 — [claude:escreve] Sonnet
Dependências: P4.3 e P5.2.
- [x] Privacidade provisória verdadeira; títulos/descrições; HTTP 404 real para URLs válidas inexistentes; saída para Home. Codificação malformada: risco framework registrado.
- [x] Sem links vazios; demos sem indexação.

#### P5.4 Revisão pública — [claude:consulta] Sonnet independente
Dependência: P5.3.
- [x] Jornadas N verificadas; catálogo por allowlist, imports/build sem referências privadas; inspeção complementar em QA.
- [x] Aviso de indisponibilidade antes do submit inclusive support personalizado; nenhum estado alega inscrição/envio operacional.

### Fase 6 — Validação final

#### P6.1 CI GitHub — [claude:escreve] Sonnet
Dependências: P4.4 e P5.4.
- [x] npm ci/lint/typecheck/unit/build/e2e, Node consistente, falhas vermelhas, sem segredo/deploy.
- [x] Equivalente local validado; CI remota só declarada após push autorizado e execução real.

#### P6.2 QA integral — [claude:consulta] Sonnet independente; [codex] gates determinísticos
Dependência: P6.1.
- [x] Chromium desktop/mobile completo, Firefox/WebKit smoke; 320px/reflow/foco/teclado/erros. Limites de zoom real/Tab WebKit registrados.
- [x] Sem runtime/hidratação/recursos órfãos; desempenho medido com ambiente/limites e desvios resolvidos ou explicitamente decididos. Evidência limitada às rotas/testes executados, sem certificação universal; descarte coberto. Decisão técnica GPT sobre LCP acima da meta sujeita ao aceite humano final P6.3.

#### P6.3 Aceite e entrega — [codex] GPT + usuário
Dependência: P6.2.
- [ ] Usuário aprova conjunto; docs registram comandos/versões/limites e futuras integrações.
- [ ] Todas tarefas com evidência; somente após aceite final arquivar PLAN em docs/plans.
- [ ] Nenhum commit/push/PR/deploy sem autorização específica.

#### P6.3-D Documentação da entrega — [codex] GPT autorizado; [claude:consulta] Sonnet
Dependência: P6.2; concluir antes do aceite final P6.3. Limitar a documentação e evidências, sem alterar produto ou implementação.
- [x] Comandos/versões/limites reais atualizados; nenhum gate não executado declarado como sucesso.
- [x] Diff revisado por Sonnet em sessão independente; quatro correções documentais aplicadas. GPT registra resultado; apresentação do aceite final após gates em curso.

## 6. Testes e validação

Vitest Node para lógica real; Playwright com `next build`/`next start`. Chromium 1440×1000 e 390×844, Firefox/WebKit smoke; 320px e zoom 200%. Rotas diretas/cliente, HTTP404, console/hidratação, formulários, descarte de estado, filtros e ausência de rede/storage. Gráficos: redução inicial/dinâmica, pausa, aba oculta, fora de tela, desmontagem tardia e perda de contexto.

Fixtures: ROSI 200mil × 0,5 × 60% × 9/12 = benefício45mil; custo30mil → líquido15mil, ROSI50%, equilíbrio40%. Custo zero → retorno indefinido; mitigação desconhecida → somente equilíbrio; atraso12 → benefíciozero e ROSI−100% com custo positivo; preservar equilíbrio>100%. Dívida: 8×10000×0,4×0,25 = 8000/mês, 96000/ano. Migração120mil versus90mil+20mil → diferença10mil/8,33%; basezero sem percentual; horizonte requer revisão. Shadow incompleto bloqueado, sem score. Parser pt-BR, vazio/desconhecido/zero, limites, subtotal incompleto e overflow.

Visual: viewport/DPR/fontes/scroll/ponteiro fixos; captura estática ou máscara somente do desenho dinâmico, com inspeção ativa. Desativar CSS não congela Canvas. Comparação por seção, sem exigir igualdade pixel a pixel entre runtimes. Lighthouse local em Home/serviço/ferramenta/newsletter: três rodadas e mediana; LCP/CLS/TBT/tamanho JS e ambiente. Metas orientativas LCP≤2,5s/CLS≤0,1; não certificar INP com TBT nem desempenho real sem campo.

## 7. Riscos e mitigação

Perda documental → matriz de cobertura e revisão antes de excluir. Home quebrada → original imutável e baseline corrigida mínima. Vazamento editorial → allowlist e inspeção de build. Recursos gráficos órfãos → lifecycle/ownership/testes. Falso envio → demo explícita, sem sucesso por default. Conflitos → dono único/instalações serializadas. Dependências → rechecagem de advisories/lockfile. Divergência visual → aceite Home e conjunto. Aparelhos físicos e operações reais não são certificados por testes locais.

**Bootstrap, 10/10:** `npm audit` identificou cinco ocorrências high propagadas por um advisory de `braces <=3.0.3` na cadeia de desenvolvimento ESLint/fast-glob/micromatch. O integrador verificou ausência de patch publicado naquele momento; não aplicar downgrade forçado do Next. Registrar ID, cadeia e resultado `--omit=dev` na auditoria da fundação. Desenvolvimento local continua no escopo aprovado; reavaliar lockfile/advisories antes da publicação futura.

## 8. Progresso e evidências

Estados: pendente, em execução, em revisão, aguardando usuário, concluído. Não marcar fases futuras concluídas por preparação parcial.

| Tarefa | Estado | Evidência / responsável |
|---|---|---|
| P0.1 | Concluído | PLAN/AGENTS/development alinhados. Crítica Sonnet independente concluída: sem conflito factual grave; quatro ajustes resolvidos pelo GPT (independência de sessão, Fase 5 serial, nomes completos MCP, fechamento pós-crítica). 26 IDs únicos com referência na matriz/evidências; nenhuma mudança no código do site. |
| P0.2 | Concluído quando acionado | Consulta Opus5.5 2aa28270-6bc2-4c09-aac8-2aba6b74cead resolveu impasse de tolerância matemática P4.2; decisão e limite IEEE754 abaixo. |
| P0.3 | Concluído | CLI 2.1.296; mapeamentos locais 5.5. Sonnet/Haiku/Opus5.5 efetivos confirmados em tarefas úteis, sem Fable. Usuário validou piloto e autorizou continuidade em 10/10/2026. |
| P0.4 | Concluído | GPT manteve bloqueio, removeu exceção `.env.example` e usou ignore `.env*`. Oito verificações passaram; template local preservado, zero `.env*` rastreados; dry-run 243 entradas sem caminhos sensíveis/gerados detectados. Sem chamada Claude, staging real ou commit nesta correção. |
| P1.1 | Concluído | PLAN persistido; git status anterior: AGENTS e quatro docs/design alterados, três planos antigos e docs/web/web pendentes; nada descartado. |
| P1.2 | Concluído | 158 arquivos / 11.176.670 bytes / 12 HTML preservados, hashes iguais em references/audits/export-inventory.json. Baseline com correção única de 53 bytes; Chromium 1440×1000, H1 renderizado, dez canvas e zero pageerror; relatório home-baseline.md. |
| P1.3 | Concluído | Seis docs; 13 fontes substituídas e três planos removidos após cobertura. Matriz em references/audits/documentation-migration.md; marca/assets preservados. |
| P1.4 | Concluído | review_frontend_plan (Sol High) confirmou contratos F/S/N/D, nove regras, 158 hashes; 572 links/âncoras em 18 docs sem erro. D06 atualizado para Sol XHigh por instrução do usuário. |
| P2.1 | Concluído | Next 16.4 / React 19.3 / TS 5.9.3, lockfile e scripts reais; build/lint/typecheck passaram. Audit em references/audits/frontend-foundation.md. |
| P2.2 | Concluído | Quatro assets necessários + duas fontes/duas OFL; oito cópias com hashes iguais. Allowlist/proveniência em references/audits/public-assets.json. |
| P2.3 | Concluído | Shell/formulários e menu desktop/mobile; conflito de especificidade no CTA mobile corrigido, teste 320px menu/erros sem overflow (2/2). Home completa será revalidada. |
| P2.4 | Concluído | Validadores corrigidos após revisão: Vitest 8/8, build final e e2e afetados 6/6; 320px 2/2. Revisor confirmou Enter sem JS não envia dados/não altera URL e guardas de duplicidade/desmontagem. Correção menor de fechar menu pelo logo será integrada à P3.3. |
| P3.1–P3.2 | Concluído tecnicamente | Lifecycle/movimento/fallback/GPU cobertos por testes e revisão Sonnet independente; carga adiada e primeiro quadro corrigidos em P6. Limites de aba real em final-qa.md. |
| P3.3 | Concluído | Home nativa aprovada pelo usuário em10/10; CTA320px corrigido e jornadas locais validadas em P6. |
| P3.4 | Concluído | Usuário: “Sim, aprovo a home”, 10/10/2026. Revisão Sonnet independente e gates concluídos; P4/P5 liberados. Lacunas navegador real/SPA e QA integral permanecem obrigatórias em P6. |
| P3.4-P | Concluído | Consulta Sonnet 5.5 concluída; parecer conferido, cobertura corrigida pelo GPT. Lint/typecheck/build e 15 unitários/16 e2e passaram. Usuário validou piloto em 10/10/2026. Sem aceite visual P3.4. |
| P3.4-T | Concluído | Dois testes, relatório/45 capturas; sem alteração web/src. Gates originais confirmados GPT: 15 unitários/32 E2E. Correção focada: gates Sonnet 15 unitários/34 E2E+4 skips; novo teste HTTP confirmado GPT 2/2. Revisão independente e aceite Home concluídos. |
| P4.1 | Concluído | Sessão d9fac3af-1e3e-4e4d-b414-0980b0744b55: três serviços SSR,15unit/54E2E+4skip e lint/type/build; revisão 0981b385-3269-47ef-a462-980021713fee aprovou lifecycle/contratos/composição após correção (301s escritor,22s revisor). Revisor não releu testes/audit no follow-up; rechecagem integral em P4.4. |
| P4.2 | Concluído | cd309153-1f7a-40de-bad1-00a0a9dcf69c Sonnet5.5, correção final104s:69unit/54E2E+4skip,lint/type/build. GPT confirmou69unit. RevisorOpus2aa28270-6bc2-4c09-aac8-2aba6b74cead follow-up17s aprovou4EPS e regressões; limiteIEEE754 registrado em tools-models.md. |
| P4.3–P4.4 | Concluído | Quatro interfaces,82→86unit/108→110E2E+4skip e lint/type/build. GPT86unit/54E2E ferramentas confirmados. Escritorbed215fd follow-ups300s/132s, revisor ea77d follow-ups37s/11s aprovou fechamento. F28/serialização/aux/foco/sinais corrigidos; revisões independentes e limites em tools-native.md. |
| P5.1 | Concluído | Haiku5.5 sessão6c1f3a8e-2f47-40c6-909a-3faeb5af3932 succeeded187s:94unit/110E2E+4skip lint/type/build. Sonnet5.5 revisão23c26e7b-8401-4935-99c6-5c41a3de4b7d succeeded18s aprovou. GPT94unit/hash confirmados. |
| P5.2–P5.4 | Concluído | P5.3 gates GPT101unit/148E2E+4skip; correção19ebf5fb Sonnet5.5 succeeded254s mesmos gates; revisor independente aaa7c823 follow-up32s aprovou. Limites em newsletter-native/public-routes. |
| P6.1 | Concluído localmente | Workflow sem deploy, Node24.13.1/npmci e gates equivalentes locais aprovados; CI remoto não executado. |
| P6.2 | Concluído localmente com limites | Revisões independentes, lint/types/101unit/build/228E2E4skips;44capturas/22pares e12rodadas Lighthouse. LCP acima da meta registrado; não autoriza publicação. |
| P6.3 | Aguardando aceite humano final | Aceite humano final e arquivamento obrigatórios, sem commit final/push/deploy autorizados. |
| P6.3-D | Documentação concluída e revisada | GPT autorizado atualizou oito documentos; Sonnet5.5 revisou diff, quatro correções factuais aplicadas.56contratos intactos/seis docs/87links válidos. Código não alterado; lint/types/101unit/build passaram. E2E227pass/4skip/1falha transitória; rechecagem isolada3/3pass, sem nova rodada completa verde. |

### Registro de sessões da ponte

**Pré-checagem de retomada (10/10/2026):** antes da primeira escrita Claude, `git add -A --dry-run` listou 244 entradas e acionou a regra de parada por `web/.env.example`. Leitura local sem expor valores confirmou que o template contém somente `FORM_MODE` no formato aprovado; não é credencial. A regra fornecida pelo usuário menciona `.env*`, sem exceção explícita para esse template. Nenhum WIP/staging real ou sessão de escrita foi iniciado. Naquele momento a execução parou para decisão, registrada abaixo; não afrouxar a detecção de arquivos com credenciais.

**Decisão posterior:** usuário recusou exceção e determinou tratamento `.env*` exclusivamente pelo GPT (P0.4). Preservar o bloqueio; todos esses arquivos ficam fora do checkpoint, inclusive templates. Nenhuma ferramenta Claude foi chamada para essa correção.

**Validação P0.4:** `.gitignore` agora ignora `.env*` em qualquer profundidade, sem exceções. Oito nomes representativos foram verificados com `git check-ignore --no-index`; `web/package.json` continua fora do ignore e o template local permanece no disco. Zero `.env*` rastreados. Novo dry-run listou 243 entradas, sem arquivos sensíveis ou saídas geradas detectados; busca de padrões de chaves privadas/tokens sem correspondências. Isso não é prova universal de ausência de segredos nem restrição de acesso do processo Claude: futuras chamadas continuam proibidas de ler/editar `.env*` por escopo, e a pré-checagem permanece obrigatória antes de cada escrita. Nenhuma escrita Claude foi iniciada nesta rodada.

Cada escrita exige linha com hash WIP antes da chamada. Consultas usam “não aplicável”. Atualizar ao terminar, sem criar controle paralelo.

| Tarefa / tipo | Alias / modelo efetivo | sessionId | Hash WIP | Estado / evidência |
|---|---|---|---|---|
| P3.4-T testes/QA / escrita | sonnet / claude-sonnet-5-5 | 7b343f20-f2db-42c4-8644-7fc5dbb3ca0a | c4dd2f7971992239523a3611a1391b3cbeeb4dfe | succeeded; 618 s; compactedThisTurn=true; última entrada85533 tokens incluindo cache. Dois testes novos, relatório,45 JPGs+2JSONs. Nenhuma alteração de produção. Sem push/commit final; revisão independente a seguir. |
| P0.1 crítica e diff / consulta | sonnet / claude-sonnet-5 | 6a09bc16-d705-4ec6-a062-4f4f8de1dd90 | Não aplicável | succeeded; 205 s; última entrada 101234 tokens incluindo cache. Aprovação condicionada aos ajustes 1–2, aplicados; sugestões 3–4 também resolvidas. Sem shell/testes pelo revisor. |
| P3.4-P piloto / consulta | sonnet / claude-sonnet-5-5 | 11ffc75e-ec74-4196-8377-c11c669a2e2d | Não aplicável | succeeded; 100 s; última entrada 91925 tokens incluindo cache. Quatro observações menores, sem bug crítico comprovado; afirmação de cobertura corrigida na conferência. 15 unitários/16 E2E e demais gates passaram pelo GPT. Aguardando validação do usuário. |
| P3.4-P revisão dos três arquivos / follow-up mesma tarefa | sonnet / claude-sonnet-5-5 | 11ffc75e-ec74-4196-8377-c11c669a2e2d | Não aplicável | succeeded; 16 s; última entrada 106090 tokens incluindo cache. Configuração, registro e relatório aprovados sem correções factuais obrigatórias; retratação de cobertura reconhecida. 28 IDs únicos e JSON verificados pelo GPT. |

SQL/session-store não disponíveis nesta sessão: este PLAN é o registro único, sem banco artificial ou cópia concorrente.

**P5.2 resultado/P5.3 início:** escritord29cba37-d561-40d0-8435-cb3b8815f814 Sonnet5.5 succeeded425s,101unit/136E2E+4skip,type/build; lintfalhou por linkHomepreexistenteagora detectado(nova rota). Não é bloqueio comercial: P5.3 autoriza correção mínima `<a>`→`Link` naHome, sem mudança visual, alémprivacidade/404/metadata/testes. CheckpointWIP `cd5f154ec121c926b42034995b2c92d970ead814`, pré-checagem sem segredos/gerados; revisãoP5.4 cobrirá P5.2/P5.3 juntos após escrita.

**P5.2 início:** checkpointWIP `8be2c0359e83347ec5608cf6ba7b0716d92c8063`; sem segredos/gerados. Dono Sonnet rotas/newsletter,features/newsletter (catálogo preservado), extensão mínima NewsletterForm para destino/copy aprovados, testes e audit/newsletter-native.md. Reusar gráficos existentes, semcorposcompletos/env/deps/export/marca/Home. P5.3 privacidade/404 final será tarefa seguinte.

**P5.1 início:** checkpointWIP `f3a128ae23b0d02d33e49abee2a2b84f1f75c0ee`, sem sensíveis/gerados. Dono Haiku catálogo público tipado features/newsletter/catalog.ts,unit/newsletter/catalog.test.ts,audit/newsletter-catalog.md. Fonte exclusiva pública references/claude-design/newsletter-edicoes.js, sem ler/copiar corpos completos/editorial/uploads. ModeloHaiku5.5/acesso confirmar primeira tarefa útil, semfallback.

**P4.3 fechamento:** correção escritorbed215fd succeeded300s,82unit/108E2E+4skip; GPT confirmou82unit/54E2E ferramentas. Revisorea77d succeeded37s aprovou F11/F15/F16/F24/F27/F29 e services.spec/audit; F28 ajuda de cobertura ausente. GPT encontrou exactText com maximumFractionDigits100 convertendo1e-200em0. Última correção delimitada mesmosarquivos (format/MigrationTool/testes/audit), checkpoint `b4d0fbccc66c772d2fb4806cb8b460f9c8d02b6a`; usar dígitos significativos em serialização e testar subnormal/limites IEEE754. Não alterar modelos.

**P4.3 início:** checkpoint WIP `db9e594804df19cbb2b535b1e61873db05c32b18`, pré-checagem sem segredos/gerados. Dono Sonnet interfaces/dados/CSS features/tools (modelos já aprovados, correção mínima somente se bug demonstrado), quatro rotas ferramentas, ReportForm local e testes/evidências correspondentes. Reutilizar FrameCanvas/PillarArt/adaptador. Sem dependências/env/exports/marca/Home/serviços/PLAN.

**P4.3/P4.4 correção focada:** escritorbed215fd-28cd-431e-9d51-aefa679d16e9 Sonnet5.5 succeeded670s,69unit/100E2E+4skip. Revisorea77d631-7d51-42ae-9d13-74c5a42fe1a5 succeeded66s encontrou transferênciaaux arredondada, erroShadow silencioso e selo de formulário impreciso. GPT acrescentou validação/foco dos auxiliares, sinais pequenos e teste sintético pageshow; restaurar ajuda cenários export. Mesmo dono, checkpointWIP `24bb735fa014de5bcf240893cc9ea0e73d6dfbeb`. Revisor não conferiu fórmulas/exports/serviçostests nesta rodada; rechecagem específica pendente antes de concluir P4.4.

**P4.2 ajuste indicado P0.2:** checkpoint WIP `606582b6a9e416c90c4ed9d9086f817c66f7f81f`, escopo já aprovado modelos/testes/audit. Follow-up mesmo dono Sonnet, revisão final agrupada P4.4; nenhuma entrada real armazenada.

**P4.2 início:** checkpoint WIP `8cbd155dd870ff14dc13b90a6ef7bf7c4856010c`; pré-checagem sem segredos/gerados. Dono Sonnet para modelos/parsers TS puros em features/tools/models, testes unit/tools e audit/tools-models.md; interfaces ficam P4.3. Sem alterações de dependências/env/export/marca/Home.

**P4.2 correção:** escritor cd309153-1f7a-40de-bad1-00a0a9dcf69c succeeded380s Sonnet5.5,60unit/54E2E+4skip; GPT60unit confirmados. Revisor43ed22e9-ef64-400a-b214-d987e633d2b9 succeeded82s Sonnet5.5 aprovou fórmulas com bug de cancelamento decimal em diferença/líquido. Checkpoint antes da correção focada `f87694651b1d070e50a6c35ebbeafa1c21f2285c`; preservar diferenças reais subcentavo, normalizar somente resíduos de precisão flutuante e testar igualdade/inegualdade/overflow. Revisão nova após correção.

**P0.2 acionado por impasse matemático P4.2:** follow-up Sonnet escritor succeeded170s (69unit/54E2E+4skip), helper16EPS zera diferenças reais (1 em1e15). Revisor43ed succeeded16s aprovou por plausibilidade de uso; GPT discorda: ausência de teto arbitrário é contrato e1 nessa escala é representável (ULP~0,125). Também corrigir parecer: PLAN seção6 possui fixtures numéricas. Consulta Opus somente leitura para menor solução defensável, sem aceitar perda silenciosa ou instalar biblioteca. Model efetivo/acesso devem ser verificados; falha interrompe fluxo para usuário.

**Decisão P0.2:** Opus5.5 efetivo confirmado, sessão2aa28270-6bc2-4c09-aac8-2aba6b74cead succeeded101s. Recomendou limite4EPS para cadeias atuais, em vez16; GPT aceita menor correção com testes1em1e15 e documentação explícita da precisão IEEE754, sem garantir aritmética decimal exata nem preservação universal de diferenças. Valor efetivamente representável pode cair na tolerância: declarar limite, não chamá-lo irrepresentável. Sem teto monetário, nova dependência ou alteração de produto. Checkpoint da próxima escrita registrado abaixo antes da chamada.

**P4.1 início:** aceite Home recebido. Dono Sonnet; escopo três páginas de serviço, componentes/dados/CSS em features/services, rotas servicos e testes correspondentes; reutilizar gráficos/formulários. Checkpoint WIP `b69a452c9179d84f5a65ccd35ee23ff7dd3afee6`; pré-checagem sem arquivo sensível/gerado, servidor manual encerrado para liberar gates. Sem alteração de exports/marca/dependências/env/Home.

**P4.1 revisão/correção:** escritor d9fac3af-1e3e-4e4d-b414-0980b0744b55, Sonnet5.5 succeeded518s;15unit/48E2E+4skip e lint/type/build. GPT confirmou14/14 serviços. Revisor 0981b385-3269-47ef-a462-980021713fee, Sonnet5.5 succeeded50s, contratos aprovados mas faltam símbolo CTA e moldura dos exports. Correção do mesmo dono autorizada também em novo graphics/FrameCanvas.tsx, reutilizando HomeAscii.drawFrame e lifecycle existente, sem alterar composição Home; atualizar serviços/CSS/testes/audit. Checkpoint WIP antes do follow-up: `7aef9c899aad5c70d5b95d5822d96f8a8f3c4967`. Revisão após correção obrigatória.

**Revisão humana local:** Home demo disponível em `http://127.0.0.1:3100/`, processo exec 80151, HTTP 200 confirmado pelo GPT. Formulários não enviam dados. Encerrar esse servidor antes de executar novamente os E2E (porta exclusiva do runner). A disponibilidade depende da sessão local continuar ativa.

**P3.4-T revisão e correção focada:** consulta independente `a430cb46-0458-4b36-b688-86ab2af716e2`, Sonnet 5.5, succeeded (81 s), aprovou com limites e apontou tratamento de URL/contenção/cleanup no servidor de capturas. GPT repetiu lint/typecheck/unit/build/e2e: 15 unitários e 32 E2E passaram, 4 skips explícitos. Checkpoint local antes da correção: `e67d2dbc25889ae506244e39e53b370b4e7ce6d7`; follow-up de escrita restrito aos testes de captura e relatório, sem produção. Aceite humano Home permanece pendente.

**Conclusão técnica da correção:** follow-up escritor `7b343f20-f2db-42c4-8644-7fc5dbb3ca0a`, Sonnet 5.5, succeeded (94 s), no checkpoint e67d2db; lint/typecheck/unit/build/e2e passaram (15 unitários, 34 E2E, 4 skips). Follow-up revisor independente `a430cb46-0458-4b36-b688-86ab2af716e2`, Sonnet 5.5, succeeded (13 s): aprovado sem bug novo. GPT conferiu diff e executou o teste HTTP afetado, 2/2. Capturas não regeneradas; novos campos de requestfailed não existem nas métricas antigas. Sem alteração de produção, push ou commit final; apenas checkpoints WIP locais autorizados. Inspeção visual GPT amostral incluiu hero desktop/baseline/mobile, pilares, serviços, processo, ferramentas mobile, newsletter desktop/baseline e CTA desktop/mobile. P3.4 aguarda aceite humano obrigatório D07.

## Pausa solicitada pelo usuário — 10/10/2026

Execução pausada até novo “ok” explícito, por limite informado de Claude (5%) e GPT (20%). Não iniciar novas sessões, desenvolvimento ou verificações durante a pausa.

- A tentativa de cancelar a sessão P5.3 `1867aaf5-13c0-45f7-bb15-395cb4e11b61` encontrou a tarefa já encerrada: `succeeded`, Sonnet 5.5, 374 s, checkpoint WIP `cd5f154ec121c926b42034995b2c92d970ead814`. Nenhuma nova chamada de implementação foi aberta.
- O escritor relata privacidade provisória, 404, metadata e correção do Link da Home implementados; lint/typecheck/build, 101 unitários e 148 E2E passaram, com 4 skips. Estes resultados finais ainda não foram repetidos nem revisados independentemente pelo orquestrador.
- Limitação relatada: slug com percent-encoding malformado retorna 500 do Next; URLs inválidas comuns retornam 404. Avaliar na retomada, sem assumir necessária a solução sugerida pelo escritor.
- Retomada: conferir diff e auditoria `references/audits/public-routes.md`; concluir validação P5.3 e revisão independente P5.4 (incluindo P5.2); depois executar P6 conforme critérios de aceite. Preservar a árvore atual e o aceite humano já concedido à Home. Aceite final continua pendente.

## Retomada autorizada — 11/10/2026

Usuário: “Ok para retomar o PLAN.md por completo até finaliza-lo”. Revoga a pausa anterior. P5.3 terminou antes da pausa; gates repetidos pelo GPT em andamento. P5.4 revisão independente Sonnet 5.5, sessão `aaa7c823-5b7c-418b-9d1c-9272cdda5be8`, somente leitura, em execução. Sem nova implementação enquanto revisamos esta entrega. Permanecem autorização apenas para checkpoints locais e necessidade de aceite humano final.

**P5.4 revisão inicial:** Sonnet5.5 `aaa7c823-5b7c-418b-9d1c-9272cdda5be8` succeeded127s, aprovou com ressalvas. Correção focada P5.2/P5.3 [claude:escreve] Sonnet: aviso prévio de indisponibilidade em NewsletterForm inclusive quando support personalizado, metadata prévia usando abertura pública, rótulo demonstrativo no arquivo e copy vazia exata; testes e auditorias correspondentes. Não criar estado de falha de rede fictício para catálogo local estático: ausência/filtro vazio já têm fixtures unitárias. GPT conferiu FrameCanvas event-driven, somente moldura lateral, sem fundo contínuo de leitura. Busca em src/static/server newsletter não encontrou referências/editorial, newsletter-editorial, fonte de catálogo de referência ou imports Markdown; public contém só quatro assets aprovados. Inspeção complementar de respostas públicas integra QA.

**Limite decidido pelo orquestrador:** percent-encoding UTF-8 inválido não é um slug válido inexistente; falha no decodificador do framework antes da página. Preservar HTTP404 para slugs bem formados inexistentes. Registrar caso malformado como risco conhecido de Next para revisão antes de publicação; não adicionar camada de roteamento nesta entrega local somente para mascarar falha do framework. Não tratar 500 como sucesso do gate404.

**P5.4 correção início:** checkpoint WIP ed2dd456990606029c1b65ad130635452d3bff7b; pré-checagem sem sensíveis/gerados. GPT confirmou gates P5.3: lint/typecheck/build,101unit/148E2E+4skip.


#### P6.2-T Preparação e execução de QA — [claude:escreve] Sonnet

Extensão executável de P6.1/P6.2, sem mudança de produto. Dono único: `.github/workflows/frontend.yml`, `web/playwright.config.ts`, novos testes de QA/captura e scripts de medição em `web/scripts/`, auditoria `references/audits/final-qa*`. Preservar todos testes existentes. CI Node24.13.1 npmci/lint/types/unit/build/E2E, sem deploy/segredos, browsers smoke distintos e Chromium completo. Cobrir SPA pausa/descarte de gráficos, 200% zoom/teclado/320px, runtime/errors e rotas representativas Firefox/WebKit. Capturas de serviço/ferramenta/newsletter/404 comparadas com exports em servidor local read-only, fontes/viewport/movimento estáveis, sem igualdade pixel-a-pixel. Medição Lighthouse13.5.0 efêmera autorizada via npmexec/npx (não dependência do app), três rodadas por Home/serviço/ferramenta/newsletter, mediana LCP/CLS/TBT/bytesJS, relatórios locais rastreáveis. Firefox/WebKit já instalados pelo GPT, Chromium existente. Não instalar outras dependências sem decisão. Novos testes/correções próprios revisados em P6.2 independente. Não mascarar falhas como skips. Entrega final inclui limitações reais, não certificação. Ambiente remoto CI não executado até push autorizado.

**P5.4 fechamento:** escritor19ebf5fb-c3bf-468d-8a6f-7cbdbed5d92a Sonnet5.5 succeeded254s,101unit/148E2E+4skip lint/type/build. Revisor aaa7c823-5b7c-418b-9d1c-9272cdda5be8 follow-up32s aprovou. Metadata corte/HTMLescape têm limites para futuro conteúdo, sem efeito no catálogo fixo atual. Copy vazia longa prevalece conforme product; sincronizar newsletter na documentação final. Rechecagem audit GPT: produção0, desenvolvimento5high na cadeia braces, correção forçada oferece downgrade Next, não aplicada. Lighthouse registry13.5.0; browsers Firefox157/WebKit27.2 instalados localmente pelo GPT para gates previstos.

**P6.1/P6.2-T início:** checkpoint WIP 6240b5fa7edc65352cb239076f25fad77aaaf8e8, pré-checagem sem sensíveis/gerados. Escopo CI/testes/scripts/evidências acima, Sonnet5.5 solicitado. Sem alterar código de produto nesta tarefa.

## Interrupção técnica da ponte — 11/10/2026

P6.1/P6.2-T sessão `e0432692-9f5a-4272-ba95-a643169dbd7d`, Sonnet5.5, cancelada pelo GPT após944s, último contexto164993 e sem novo retorno por vários minutos. Nenhuma nova escrita iniciada. Conforme solicitação anterior do usuário para consultar diante de problemas de utilização do Claude, continuidade aguardando decisão.

Trabalho preservado: workflow, config Playwright, qa-smoke/qa-spa/qa-capture/qa-shared, scripts Lighthouse/captura e44 capturas internas. Não marcar P6 concluído. Logs `.qa-e2e.log` e `.qa-e2e2.log` temporários na raiz, ainda sem integrar à auditoria. Uma rodada smoke registra62passes/12falhas WebKit: expectativa de foco no primeiro Tab (toBeFocused do skiplink); investigar comportamento de teclado WebKit antes de classificar bug da aplicação. Reexecução completa encontrou porta3100 ocupada. Servidor residual conhecido da tarefa PID9136 encerrado pelo GPT após confirmar porta, tipo e início na janela da sessão; não encerrar processos alheios. Lighthouse ainda sem resultados gerados.

Inspeção visual GPT encontrou divergências bloqueadoras de fidelidade em serviços: frentes4colunas em vez de2×2, FAQ sem composição em2colunas, painel detalhe sem disposição do export e copy de seção diferente. Corrigir via dono P4.1 Sonnet, preservando restaurações contratuais S/F e sem redesenho. Depois regenerar capturas. Reflow por viewport não certifica zoom real: rotular evidência com precisão. Próximos passos recomendados: GPT executa comandos QA/Lighthouse e gerencia servidores, Claude fica em tarefas pequenas de escrita/revisão; isso preserva D06 (GPT não desenvolve código). Apenas após validação concluir P6.2, documentação Haiku e aceite humano final.

## Continuidade de QA aprovada — 11/10/2026

Usuário escolheu Opção1: GPT executa gates/medições e controla servidores; Claude somente escritas e revisões pequenas. Atualiza o protocolo de execução restante: Claude não inicia servidores/builds/testes demorados; retorna a escrita concluída e GPT roda gates após sessão terminal. D06 permanece: GPT não desenvolve código do site. Sonnet corrige fidelidade P4.1 (services/ServicePage.tsx,services.module.css,content.ts somente copy export), testes serviços e auditoria correspondente. Restaurar composição export (frentes2×2, situações numeradas sem cards fechados, FAQduascolunas, detalheduascolunas, hierarquia/tipografia/copy) preservando conteúdos contratuais recuperados e acessibilidade. Não alterar Home/stack/formulários/modelos. Depois revisão independente junto P6.2. Capturas anteriores são evidência do desvio, regenerar após correção. QA WebKit: versão atual qa-smoke já trata foco programático do link no WebKit; isso verifica foco programático e NÃO ordem Tab real, registrar limite sem alegar cobertura inexistente. Reflow640/320CSSpx é equivalente geométrico, NÃO zoom real do browser. Aprovação final segue pendente.

**P4.1 correção visual:** checkpoint WIP dd4064562607d4584b47772cca1ce3812ccdfdad, pré-checagem57arquivos sem caminhos sensíveis. Evidências anteriores preservadas no checkpoint; proprietário Sonnet somente serviços/testes/auditoria, sem executar gates.

**P4.1 visual gates:** escritor e9e11a66-f1da-4fe1-a7eb-507368f200e5 Sonnet5.5 succeeded157s, sem gates próprios. GPT lint/typecheck/101unit/build e230E2E+4skips passou, Chromiumdesktop/mobile+Firefox/WebKit smoke. Exec77293. Nova revisão20aba837-fa07-4cae-bdfe-9d2341164525 Sonnet5.5 succeeded143s: composição serviços conferida parcialmente; revisão QA encontrou captura executando indevidamente no gate, falta de inicialização dos gráficos inferiores nas capturas, quotingWindowsLighthouse e rótulos zoom/foco imprecisos. Correção focada P6.2-T [claude:escreve] Sonnet: config/testesqa/scripts apenas. Isolar captura explicitamente QA_CAPTURE=1; percorrer página esperando gráficos em tela e registrar estados; corrigir spawnWindows sem shell interpolado; rotularreflow sem zoomreal, detectar corte de conteúdo relevante, foco com ring real, suportar abortos normais de prefetch Firefox/WebKit sem ocultar outros erros. Nenhum gate pode alegar zoombrowserreal/TabWebKit não medido. GPT confirmou actionsv7 oficiais via gh api releases/latest. CI remoto não rodado. Executar medições somente após correção terminal. Fidelidade ferramentas e newsletter reaberta para restauração de composição, mantendo contratos.

**P6.2-T correção:** checkpoint1714393e929eaf4675ce6e1eca9da76e82a735ab,28arquivos esperados sem caminhos sensíveis. Sonnet escreve somente QA/scripts/config; GPT executará os gates.

**P6.2-T gates corrigidos:** escritor b9d24011-b91e-4d35-897c-d9dede8ae039 Sonnet5.5 succeeded111s; GPT lint/types/101unit/build passou; E2E224passes/4skips/4falhas, todas reflow detectam botão Home “Conhecer Infraestrutura em nuvem” cortado [40,336] em320px. Não afrouxar detector. Lighthouse script executado pelo GPT exec82231:12rodadas,medianas LCPHome5476ms/serviço5400/ferramenta5535/newsletter4860; CLS0; TBT237/355/350/112ms; JS300,9/295,4/302,7/157KiB. Valores são baseline antes dos ajustes restantes, meta orientativaLCP2,5s não atingida, laboratório móvel4×CPU/slow4G. Scripts fecharam servidor3200. Resultados em final-qa/lighthouse/summary.json, logs/lighthouse.log. Não declarar desempenho aprovado sem tratar/registrar desvio final.

**Correção visual P5.2 — [claude:escreve] Sonnet:** restaurar composição3exportsnewsletter em features/newsletter(LandingPage/ArchivePage/PreviewPage/NewsletterParts/CSS), somente variantevisual NewsletterForm/forms.module.css se preciso, testesnewsletter/layout. Preservar catálogo, SSR/filtros/allowlist/edição escolhida/avisos e regras N01–N11. Hero títuloacento, formuláriodesktopemlinha, ediçãorecenteem2colunas, benefíciosnumerados, curadoria/FAQeCTAconformeexports. GPT também autoriza correção mínima de home.module.css secondaryCta para largura320px sem cortar, com regressão QA existente. Sem redesenhar Home ou alterarmodelos/contratos. Sonnet não executa gates, GPT assume.

**P5.2 correção visual início:** checkpoint400eef1c296bb524562038f1f71514d3b3a49e41,23arquivos previstos sem sensíveis. Regenerar capturas após gates; não usar capturas antigas como aprovação.

**P5.2 fidelidade concluída tecnicamente:** escritor18cfa4a0-2eaa-4d3e-bd19-6abb7cfece9d Sonnet5.5 succeeded228s, sem gates; GPT lint/types/101unit/build/228E2E+4skips passou (exec57102, logs/newsletter-fidelity-e2e.log). CTAHome320px não é mais cortado. Revisor20aba837 follow-up55s não encontrou bug novo; revisão estática parcial e limitações registradas. GPT já conferiu que qa-shared instrumenta7métodos2D, corrigindo referência desatualizada do parecer a3métodos. Capturas regenerar depois da última alteração visual.

**P4.3 restauração visual — [claude:escreve] Sonnet:** preservar integralmente modelos e contratos F, restaurar composição4exportsFerramenta: hero horizontal com acentoinline e artecompactaàdireita, formulário/resultadosladoalado, paresdeentradasdesktop/painéisarredondados/resultadosplaceholder, método expansível acessível, relatóriocomo cardlargura/forminline, CTAconformeexport sem adicionarsímbolo onde nãoexiste. Arquivos features/tools exceto models/format/useToolForm/ToolSession, ReportForm/forms.module.css,4rotas ferramentas só slotprops se necessário, testes/audittools-native. Não redesenhar nem remover estados/ajudas/limites para fazer coincidir export incompleto.

**P3.1 desempenho focado — [claude:escreve] Sonnet:** mesmo dono integração permite PillarArt.tsx e testesgraphics-motion/qa-spa para postergar import/runtimeThree até o elemento entrar em tela. Hoje todos importam no mount mesmo longe da tela; preservar primeiroframeestático/pausa/reduced/hidden/dispose e bloqueio de montagem tardia. Sem biblioteca, timers arbitrários ou mudar hero/cena. GatesGPT e medições finais após escrita. Metas de laboratório orientativas, diferença final será explicitada sem certificação.

**P4.3/P3.1 correção início:** checkpoint9800e60105884f8a7960179c75df5c3903b8e2dc,12arquivos previstos sem sensíveis. Escopo delimitado acima; Sonnet escreve, GPT gates.

**P4.3/P3.1 gates e revisão:** escritor d6c23c6a-6122-4e49-bbf1-eef9ab21bf74 Sonnet5.5 succeeded181s. GPT npmci/lint/types/101unit/build passou; E2E223passes/4skips/5falhas: expectativas antigas exigiam carregar gráficos fora da tela, incompatíveis com lazy init. Revisão independente0be30398-5fe7-4c1b-874b-44fcd9eec335 Sonnet5.5 succeeded92s encontrou janela sem fallback antes do primeiro draw e testes com controle insuficiente. Correção focada P3.1/P6.2-T [claude:escreve] Sonnet: PillarArt.tsx, pillar-runtime.ts (callback first frame), graphics-motion.spec.ts e audit final-qa. Manter fallback até primeiro desenho real; não marcar ready no mount. Testar todos os pilares visíveis prontos/pintados, visitar cada pilar antes de testar suspensão/semWebGL, verificar somente fallback Home no teste contextlostHome. Perda de contexto congela instâncias montadas, novas instâncias ainda não montadas podem obter renderer novo; testar e nomear alcance com precisão. Sem remover asserts, sem medir offscreen nunca montado como suspensão. Sem rootMargin adicional, sem alterar fórmulas ou layouts. GPT roda gates após terminal.

**P3.1 primeiro quadro início:** checkpoint69fb8f1, pré-checagem12arquivos sem sensíveis/gerados. Dono Sonnet, escopo acima, sem comandos QA.

**P3.1 correção e revisão:** escritor641608f4-2b81-45dd-96e5-665c1123da3a Sonnet5.5 succeeded109s; callback firstFrame após drawImage, limpo no dispose, fallback preservado até render. Revisorindependente0be30398 follow-up46s aprovou sem bloqueador; testes visitam instâncias renderizadas antes de medir suspensão, contexto perdido não ressuscita instâncias já montadas. GPT lint/types/101unit/build passou; E2E em execução. Rechecagem hash158exports/8cópias=0divergências. ScanGPT230arquivos src/public/static/serverapp com11trechos privados (90caracteres iniciais dos parágrafos posteriores à abertura),0ocorrências. Scan inicial amplo incluía prévias seguintes por erro de delimitação, corrigido para limitar cada edição antes da próxima seção C; não foi vazamento. Audit final logs audit-production.json=0advisories, audit-all.json mantém5high desenvolvimento; não aplicar force/downgrade. Esses scans são evidência complementar, não prova universal de confidencialidade ou segurança.

**P3.1 gates finalização:** GPT lint/types/101unit/build passou;226E2Epass/4skip/2falhas apenas teste contextlostHome: após falha ele exige canvas visível, mas HomeCanvas corretamente esconde seus canvas e mostra fallback. Com lazy init não há outro canvas fora de tela carregado para satisfazer seletor global. Correção mínima P6.2-T [claude:escreve] Sonnet, somente graphics-motion.spec.ts: afirmar canvas Home anexado E oculto apóscontextlost, remover helper visibleCanvases se ficar sem uso. Preservar asserts fallback/título; não alterar produção. GPT repetir gates, depois capturas/medição.

**P6.2-T assert início:** checkpoint21b022b3c9234e6bfb407c1893a3f3ee29eba24f,8arquivos previstos sem sensíveis/gerados. Sonnet apenas teste Home fallback, sem gates próprios.

**P6.2 gates aprovados:** escritor ef983328-334c-4135-8e47-8caf1003e625 Sonnet5.5 succeeded13s corrigiu somente assert Home anexado/oculto. GPT exec79331 lint/types/101unit/build e228E2E+4skips passou, logfinal-e2e.log. Chromiumdesktop/mobilecompleto eFirefox/WebKit smoke. Nenhum teste falho restante. Capturas finais iniciadas pelo GPT com QA_CAPTURE1; Lighthouse depois, sem contaminar medição com testes paralelos. Quatro skips conhecidos não são passes (aba real e capturas Home opt-in). Modelos/contratos preservados.

**P6.2 inspeção visual GPT:** captura74786 passou2/2,44JPG atualizados. Inspecionados serviço Ciberdesktopnative/export/mobile, ROSIdesktopnative/export e newsletterlandingdesktopnative/export. Composição geral restaurada, diferenças legítimas: demoControls/avisos, conteúdo Srecuperado, arte estática vs exportanimado. Achados concretos restantes, P4.1/P4.3 [claude:escreve] Sonnet: (1) services.h2 max-width760 aplicado indevidamente em frentes/processo, export não restringe esses títulos; manter largura aprovada por seção, sem mudarfontes; (2) ToolPage ol usa svc.crumbs que não reseta list-style/margin/padding: breadcrumb numerado colado, dar estilo próprio semântico; (3) ROSI lossaux interrompe par perda/frequência, costaux interrompe par custo/prazo: agrupar pares e colocar auxiliar abaixo do par, preservando customfields/DOM/foco/ajudas; (4) estado inicial ResultBox traz3barras semidentificação em todasferramentas: restaurar rótulos/descrições conhecidos com travessão SEM valores calculados, nunca métricas/score emShadowAI. Escopo somente services CSS/Title sepreciso, tools ToolPage/fields/RosiTool/TechDebtTool/MigrationTool/ShadowAiTool/toolsCSS, testesafetados e audits services/tools/finalQA. Preservar selectcenario e estados desconhecidos como adaptação funcional registrada; sem modelos/novasfórmulas/dependências/produçãooperacional. Revisorindependente e gatesGPT após escrita. Estas correções não ampliam produto.

**P4.1/P4.3 detalhes início:** checkpointe67872d40128521f7e281581746732caeb71ca24, pré-checagem sem sensíveis/gerados, capturas de evidência intencionais. Sonnet escreve escopo acima, GPT gates depois.

**P4.1/P4.3 detalhes concluídos:** escritor779d6b83-b74d-4384-acde-0499dc9fcdfd Sonnet5.5 succeeded72s,12arquivosincluindoPLANregistro. ParesROSImovidos sem fórmulas; iniciaiscomrótulos/travessãosemvalor, Shadowtemas semscore. GatesGPT após complemento P5.3 abaixo. Capturas newsletterarquivo/prévia/404desktopnative/export e arquivopréviamobile também inspecionadas: composição preservada, demoControls elevam alturas; prévias completaspúblicaspermitidas, sem corposprivados.

**P5.3 fidelidade404 — [claude:escreve] Sonnet:** inspeção mostra moldura do export404 ausente na página nativa. Correção mínima em web/src/app/not-found.tsx: reutilizar FrameCanvas já existente, data-graphics-root e corte inferior, sem alterar HTTP404/metadata/links/art. Teste focado em public-routes.spec.ts garante moldura pronta e título/retorno em404; preservar semJS. Dono pode remover CSS .placeholders agora semuso emtoolsCSS, nenhuma outra limpeza. Auditoria public-routes registra complemento. GPT executará gates agrupados de ambas escritas, Sonnetindependente revisará. Não executar comandos QA/servidores.

**P5.3 moldura início:** checkpoint9d625ef06be246749439b0df30041ee1b381279b, escopo acima e pré-checagem aprovada, Sonnet sem gates próprios.

**P6.2 revisão técnica final:** f62830cd-91f7-4033-be5f-d90f9549a91a Sonnet5.5 succeeded92s, independente dos implementadores, sem bloqueador concreto nos arquivos lidos. Revisão estática parcial, sem diffGit/testes/exports/modelos; não ampliar conclusão. GPT verificou actions via gh api: checkoutv7.0.1/setup-nodev7.1.0/upload-artifactv7.0.2, Node24.13.1/npm11.8.0; porta3200 livre antes de medir. Limites scripts: Lighthouse efêmero nãooffline, spawnSync pode atrasar cleanup em sinal externo/timeout; esta rodada será normal e PID/porta conferidos depois. Captura só grava métricas após sucesso integral: conferir exit0/22pares antes de aceitar. Sem alterações adicionais só por hipóteses; riscos registrados na entrega. Gates e capturas exec45357 ainda em execução, nenhuma alegação de resultado final antes de terminal.

**P6.2 rodada final:** exec45357 lint/types/101unit/build/228E2E4skips e captura2/2 passou.44JPG atualizados;22pares sem pageerrors/overflow/timeouts/gráficosfailed ou requestfailedexports. GPT conferiu novas capturas serviçoCiberdesktop eROSIdesktop apóscorreções. Lighthouse final iniciado serialmente apósgates/capturas, porta3200 livre.

**P4.3 ajuste mobile — [claude:escreve] Sonnet:** comparação final ROSImobile contraexport encontrou margenslateraiszeradas: tools.module.css .hero/.section/.reportSection e @media usam paddingvertical com laterais0, anulando svc.wrap padding-inlineclamp20..60. Corrigir somente para padding-block (incluindo mediaqueries), mantendo valoresverticais; preservar padding do card/inputs. Teste320px nas4ferramentas garante título/form/cardrelatório comgutters e semcorte; CSS/testestools/audittools são único escopo. Não redesenho, fórmulas/forms/SSRintactos. Aguardar Lighthouse corrente terminar antes do checkpoint; medição atual anterior aosgutters será repetida apósbuildfinal. GPTexecuta gates/capturas, Claude não roda comandos demorados.

**P4.3 mobile início:** checkpoint2597dc0e7c1d23a6fbdcf63f32b246f217e1f13d, pré-checagem aprovada. Lighthousepré-gutters12/12exit0, porta3200encerrada. MedianasHomeLCP4877ms/CLS0/TBT117/JS172501bytes; serviço4860/0/450/308149; ROSI4875/0/451/315566; newsletter4860/0/105/166400. OrientativaLCP2,5snãoatingida, semcertificação. RepetirapóscorreçãoCSSfinal.

**P6.2 pós-gutters final:** escritor05d419bc-7361-4e35-842f-38e5c0311f9f Sonnet5.5 succeeded31s, revisão f62830cd follow-up20s sembloqueador. GPT exec19907 exit0: lint/types/101unit/build/228E2E4skips, captura2/2 e Lighthouse12/12.44JPG/22pares regenerados; GPT confirmouROSImobilegutters. Portas3100/3101/3200 encerradas. Medianas finais: Home LCP4876,8ms CLS0 TBT114ms JS172501bytes; Ciber4800,5/0/452,5/308149; ROSI4875,2/0/452,5/315566; newsletter4860/0/112/166400. LCP2,5snãoatingido. DecisãoGPT: preservar fidelidade/stack e entregar frontendlocal com desvio explícito, sem declarar desempenho aprovado ou publicar; otimização adicional/medição em hardware e patches entram antes da publicação futura. Aceite humano final incluirá ciência desses limites, não certificação.

**P6.3-D execução — [claude:escreve] Haiku:** dono único dos6docsweb, AGENTS.md e references/audits/final-qa.md. Atualizar estado factual P1–P5/QA concluídos tecnicamente, Homeaprovada10/10, aceitefinalpendente. Preservar tabelas S01–S16/F01–F29/N01–N11 bytea-byte naslinhas e identidades/regras D. D06 atual: GPTorquestra/decide/gates/servidores; Claudeescreve/revisaescopequeno, Sonnetcódigo, Haikudocs, Opusconsulta; perfisCodexhistóricossemusoimplementaçãoatual, semFable. Preservar regra semcommitfinal/push/deploy, exceçãoWIPautorizada e bloqueio.env*. Atualizar comandosreais/captura/Lighthouse/browsers/limites/integracõesfuturas, layoutatual aprovado e adaptaçõescontratuais/UI explicitadas, carregarPillarArtvisível/fallbackprimeiroframe, newsletteravisoanterior/metadataabertura/emptycopyproduct, política404válidavsencodingmalformado500. Audit finalQA consolidado comlogs/gates/capturas/12medições/ambiente/resultados/limitesreais e revisõessessões, semcompilarfictícios. GPTscan230arquivos11trechosprivados0hits,158exports/8assets0hashmismatch,82linksarquivosválidosantesdocs; revisãoestáticaparcial não certificação. SHA256linhastabelas: product16=8bf9aec3094df1eb04af38f730b0451a76a0510e5cbd8362cf438563423cdf7d; tools29=c585d82629e7ea2a9c884a48a3fb3734dc1f3a6db4458451356a4f50bfdf1ded; newsletter11=6081a84f487306cae98c2e2aec4caccdb2d3a740e45b8bc14e3b487f58d00df8. Não alterar PLAN/código/brand/assets/exports ou criaroutrosdocs/plano. Sem testes/build/servidores, GPTgates apósterminal e revisãoSonnetindependente. Não arquivarPLAN atéaceite.

**P6.3-D início:** checkpoint142dd975050bc2974078e35dd466847b9196f19b, pré-checagem sem sensíveis/gerados, evidências QA intencionais. Haiku escreve somente8documentos acima.

**P6.3-D primeira resposta:** Haiku5.5 sessão922f843e-fc6a-404e-9218-7e4605935128 succeeded118s, compactedThisTurn=true, retornou checagem em vez de editar;0alteraçõesdocumentais. GPT avisou antes de correção focada mesma tarefa. Os dados finais embytes/medianas no último registroPLAN conferem comsummary; valores157KiB/baselineanteriores são históricos, não substituir esses registros como se fossem atuais. Seguir com escrita8docsautorizada usando resumoJSON atual, skipsnominais, gatesregistradosGPT (sem alegarlogsarquivadosquando sótooloutput),56linhastabelaspreservadas. Se houver algo não verificado peloHaiku, atribuirregistroGPT/PLAN e conservarlimite, não parar diante defatosjáregistrados. Sem código nem ampliaçãoescopo. Revisãoindependenteapósescrita, aceitefinalpermanecependente.

**P6.3-D correção focada início:** checkpoint76e0239bb08d7b3cd5f32c611f009619d54ccb92, somentePLANalterado, escopo8docsinalterado. Haikuescritaexplicitamenteautorizada, semgatepróprio.

## Consulta obrigatória sobre a ponte — 11/10/2026

P6.3-D sessão Haiku5.5 922f843e-fc6a-404e-9218-7e4605935128: primeiroturno succeeded118s comcompactação, retornouauditoria semeditar. Follow-up focado explicitamenteautorizado cancelado peloGPT após203s, voltouacompactarcontexto semeditar; terminalcancelled em2026-10-11T14:02:36.193Z. Gitstatus confirma somentePLANmodificado desdecheckpoint76e0239;0alterações8docs. NenhumaescritaClaudeativa ou servidorresidual conhecido. Diante da instruçãodousuário de parar/consultar emproblemasdeutilizaçãoClaude, não abrirnova sessão antesdadecisão.

Frontend eQA preservados/concluídostecnicamente:101unit/228E2E4skips,lint/types/build,capturas44JPG22pares,Lighthouse12rodadas, revisõesSonnetindependentes. Falta P6.3-D editar8documentos+revisãofinal, rechecagensdocumentais/gatesprevistos, disponibilizarprévia eaceitehumanoD07. LCP4,8–4,9s acimaorientativa2,5s, produçãoaudit0/dev5high, encodingUTF8malformado500 conhecido; semprontidãopublicação. Nenhumcommitfinal/push/deploy. Propostas para decisãousuário: GPTsomenteescrita factualdocfinal (exceção explícita àpropriedadeHaiku, códigoinalterado, revisãoSonnetmantida), ou escalar documentaçãoSonnetcomescopodelimitado. Não arquivarPLAN/registraraceitefinalantesdousuário.

### P6.3-D autorização e execução documental — 11/10/2026

Usuário escolheu Opção A: GPT conclui a escrita factual dos seis docs canônicos, AGENTS.md e final-qa.md; Sonnet revisa o diff em somente leitura. Exceção restrita à propriedade documental após Haiku sem edições, sem alteração do código do site. Usuário informou 14% de cota GPT e 26% Claude: uma revisão delimitada, gates determinísticos locais, sem nova pesquisa ou medições opcionais. Aceite final e arquivamento permanecem pendentes.

**P6.3-D revisão independente:** sessão601114c3-8761-457b-a872-a5152f4dd99c Sonnet5.5 succeeded43s, sem bloqueador, quatro correções pequenas: D06 alinhada entre fontes; critério original P6.2 preservado com alcance medido e decisãoGPT sujeita ao aceitehumano; fallbackIntersectionObserver/formulárioslocais/limiteabaoculta esclarecidos; datasexportHome04/10 eHomeNext10/10 distintas. GPT aplicou correções sem código. Revisão estática do diff472linhas e greps pontuais, semrevalidar logs/metrics/hashes; essas evidências são GPT. Contratos56linhas intactos porSHA256, exatamenteseisdocs,87links locaissemfaltas. Gatefinalemexecução56926,logfinal-delivery-gates.log.

**P6.3-D concluído:** oito documentos atualizados e revisados; seis canônicos,56contratos SHA256intactos e95links locais verificados semfaltas (incluindo auditoria). Nenhum código do site alterado. GatesGPT56926 exit1: lint/types/101unit/build passaram; E2E227pass/4skip/1falha no foundation.spec.ts:40, observação do botão transitório Enviando. Rechecagem58958 exit0: mesmo teste3/3pass sem mudanças. Causa não comprovada, instabilidade registrada em todosdocs e log preservado; não declarar rodadafinalcompletaverde. Nenhuma nova chamadaClaude ou medição opcional. Aceite humano final/arquivamento continuam pendentes; commitfinal/push/PR/deploy não autorizados.

## Execução P7–P9 — 11/10/2026

Aprovação explícita: Aplique o plano. GPT executou baseline Home.baseline via HTTP temporário/Chromium1440x1000/no-preference: header Serviços produziu27eventos scroll, amostras y2/8/16/28/45/67/97/136/188/258, finaly1698; scroll-behavior computedauto, hashvazio. Portanto runtime da baseline faz animação mesmo semCSSsmooth; reproduzir comportamento funcional, não importar runtime. Servidor3000 PID24392 preexistente preservado. next-env.d.ts gerado/devtypes não incluir no checkpoint; demais alterações documentais/evidências anteriores preservadas.
`P7.1 checkpoint`: d0cfd7edd1bcee6d2ccdfc03e1e7581ab85083be. Pré-checagem sem segredos/gerados, next-env.d.ts excluído do índice e preservado na árvore.
P7.1 escrita: sessão f00c24bf-8724-49dd-982f-0495fb9a3861 Sonnet5.5 succeeded162s. Header/anchor-scroll/globals e navigation.spec; sem gates próprios. GPT inicia gates e revisão independente. Limites escritor: cancelamento por input sem teste dedicado, estabilidade limitada de layout, smoke não inclui nova spec.
P7.1 gates11036 exit1 no lint: react-hooks/refs na factory onLink; demais gates não executados. Revisão independente00bbf98f-01dd-4dfc-848c-bbbbf5a75ec7 Sonnet5.5 succeeded42s aprovou com limites; GPT resolve pendente/history/cancelamento e mudança dinâmica da preferência antes de concluir. Correção focada mesmo dono, sem alterar escopo.
P7.1 correção checkpoint: f716c1ddf86d2b335fd64f26f9e6626172c7f528. Sem segredos; next-env.d.ts excluído do índice.
P7.1 correção mesma sessão succeeded72s: handlers sem factory, pending limitado a origem/hash, popstate/hashchange cancelam, animatedfalse finaliza destino, testes lifecycle/foco/hash/início/cancelamento. Sem gates próprios. GPT nova rodada.
P7.1 gates14381: lint/types/101unit/build passou; E2E263pass/6skip/3falhas novas assertions: SSR buscou ausência /#newsletter em HTML inteiro incluindo footer foraescopo; foco desktop procurou menu hidden. Funcionalidade scroll/crossroute/reduced/pausa/history passou nos demais cenários. Correção testes somente, sem código produto. Revisão followup00bbf98f succeeded26s aprovou comlimites.
P7.1 testes checkpoint: dea5cba9983a780848b3f921c9b53200c1fd7e5c. Sem segredos; gerado next-env excluído.
P7.1 testes followup succeeded26s somente SSRheader e assertmenucondicional. GPT roda gates finais lote.

P7.1 concluído: exec69932 exit0 lint/typecheck/101unit/build/266E2E6skips. Logp7-1-final-gates.log. Skips:4anteriores mais2modificadoresdesktop inaplicáveis no mobile, não falhas mascaradas. Revisão00bbf98f follow26s aprovada. Testescrossroute/reduced/pausa/foco/history/cancelamento passaram.
P7.2 checkpoint: 25a6cd3fb56ffa4e84113705faa7348bc04e02d0. Sem segredos/gerados; next-env excluído se modificado.
P7.2 escrita2e6c085e-8465-4483-8df0-bdffe7badc1d Sonnet5.5 succeeded75s: FormStatus semfrase, selects nativos comchevron16/padding44/forcedcolorsauto, testespublic-routes/tools. Sem gates próprios.

P7.2 concluído: gates34414 exit0 lint/types/101unit/build/270E2E6skip logp7-2-gates.log. Revisão6d65922a-e564-4bde-bdd9-24b4071c1fe5 succeeded33s aprovada comlimites. GPTbrowserprodução3300ownserverencerrado: selects320/390/1440 appearance none,backgroundcalc(100%-16px),padding44px,semoverflow. p7-before-layout.json mede artigo720 dentro1200 eheroarchiveestreito;lista já1200. Nenhum servidor usuário encerrado.
P7.3 checkpoint: d3f69ff7b1f976c22e1dd030ad465379aefe3d28. Pré-checagem sem segredos/gerados.
P7.3 escritaeac6e9ad-6955-4b89-a940-8c57349e2c7f Sonnet5.5 succeeded90s, CSSnewsletter e novo newsletter-layout.spec.ts. Semgates próprios; GPT valida geometria/capturas e revisão P9.1.
P7.3 gates34388 lint/types/101unit/build passou; E2E280pass6skip4fail título #titulo shrink1078/1106 em2slugs desktop (duplicadosprojetomobile viewport1440). Artigo1200 passou; corrigir .previewTitle width100%, não reduzirassert. Sem outrasfalhas.
P7.3 correção checkpoint: 5b75c6f534334a1b266c1cb137fa006e8cee3bb3. Pré-checagem sem segredos/gerados.
P7.3 correção same-session succeeded14s: previewTitlewidth100/minwidth0, parágrafo65ch preservado. GPTgates após escrita, semalterarassert.

P7.3 gates finais57880 exit0 lint/typecheck/101unit/build/284E2E6skip. Logp7-3-final-gates.log. Artigo/title/card1200 eparagraphlegível nas3prévias,landingpreservada e320/390semoverflow cobertos. Capturas/revisão independente consolidamP9.1. Nenhumcorpoeditorialextra exposto.
