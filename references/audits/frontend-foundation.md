# Fundação frontend — P2.1–P2.4

Data: 10/10/2026. Execução local autorizada pelo `PLAN.md`; Home completa, páginas internas, integrações e deploy não fazem parte desta fundação.

## Implementação

Aplicação em `web/` com App Router, React, TypeScript estrito, CSS Modules/tokens e fontes locais Baloo 2/Archivo. Shell com assinatura SVG, navegação por âncoras, menu móvel operável por Escape, devolução de foco e skip link. `page.tsx` é conteúdo SSR provisório identificado, não a portabilidade visual final.

`FORM_MODE` é lido exclusivamente no servidor por request (`force-dynamic`) e serializado como `demo` ou `unavailable`. Isso permite revisar ambos os modos no mesmo build. Sem configuração há validação e feedback de indisponibilidade, nunca sucesso simulado. Formulários ativos e semânticos; erros associados, foco, Enter, guarda síncrona contra duplicidade, campos preservados após falha e aborto do timer ao desmontar. Botão fica desabilitado antes da hidratação para impedir submissão HTML de dados pessoais pela URL quando JavaScript está desativado; campos continuam ativos e há alternativa de contato.

O adaptador local único não possui transporte, armazenamento ou logs. O controle “Resultado da demonstração” só aparece em modo demo; simula andamento, pedido aceito ou erro explicitamente. A newsletter nunca declara inscrição/endereço confirmados ou entrega. O tipo do pedido de relatório permite somente e-mail/ID da ferramenta; nenhuma interface de relatório ou interna foi criada nesta etapa.

Assets e fontes foram copiados pelo worker proprietário, com proveniência em [public-assets.json](public-assets.json). Nenhum original de marca foi alterado.

## Versões e comandos

Ambiente: Windows, Node `24.13.1`, npm `11.8.0`. Pins: Next/eslint-config-next `16.4.0`; React/ReactDOM/types `19.3.0`; Three/types `0.184.0`; TypeScript `5.9.3`; ESLint `9.39.5`; Vitest `5.0.3`; Playwright `1.64.0`; tipos Node `24.19.2`. Peers/engines foram conferidos no registry. TS 7 excede o intervalo do parser ESLint; ESLint 10 excede os peers dos plugins React/import. ESLint 9 está fora de suporte upstream, registrado como limite da configuração compatível atual; reavaliar quando esses plugins suportarem 10.

Scripts reais: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`. Executar em `web/`. Para revisão manual demo, definir `FORM_MODE=demo` no ambiente antes de iniciar o servidor; `.env.example` contém apenas esse exemplo, sem segredo.

Instalação serializada: `npm install --no-fund`, 383 pacotes adicionados; lockfile gerado. Nenhum `audit fix --force`, downgrade de framework ou override especulativo foi aplicado.

## Segurança das dependências

`npm audit --json`: cinco achados high propagados por um único advisory de desenvolvimento, [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Cadeia: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`. A falha é exaustão de pilha ao processar padrões profundamente aninhados; o lint usa padrões locais de configuração neste escopo.

Disponibilidade de patch conferida: `npm view braces version` retorna `3.0.3`; `gh api /advisories/GHSA-vfj7-8cjw-p6xm` retorna `first_patched_version: null`. O downgrade semver-major sugerido pelo audit para config Next 14 não é uma correção compatível da stack aprovada. O orquestrador autorizou continuar o desenvolvimento local com este residual documentado.

`npm audit --omit=dev --json`: zero vulnerabilidades. Isso não comprova ausência de falhas desconhecidas. Next anunciou uma atualização de segurança upstream para 14/10/2026, com impacto detalhado ainda pendente: [aviso oficial](https://nextjs.org/blog/upcoming-nextjs-security-update-october-2026). **Pendência real para P6 e qualquer futura publicação:** revalidar registry/advisories/patches, atualizar conforme compatibilidade e conferir novamente as dependências de produção e desenvolvimento.

## Gates

- `npm run lint` e `npm run typecheck`: passaram, inclusive execução final após os ajustes.
- Vitest Node: oito testes passaram na execução final, cobrindo modo explícito, campos obrigatórios, formatos plausíveis de WhatsApp/e-mail, indisponibilidade padrão, resultados demo e aborto/entrada inválida.
- `npm run build`: passou com Next 16.4.0/Turbopack, compilação e TypeScript concluídos. Rotas nesta etapa: `/` dinâmica SSR e `/_not-found` nativa; nenhuma interna antecipada.
- `npm run test:e2e`: **12/12 passaram** após a correção CSS, em 7,6s; após as correções de validação, os seis checks afetados (contato/newsletter/320px nos dois projetos) passaram novamente em 8,6s. Duas instâncias do mesmo build, demo em 3100 e padrão em 3101; Chromium 1440×1000 e 390×844. Cobertura: SSR/lang/noindex/sem overflow, menu/Escape/retorno de foco, validação/Enter/carregamento/guarda, erro/retry e preservação, newsletter aguardando confirmação, modo padrão sem falso sucesso, campos ativos sem JavaScript com envio desabilitado, nenhuma submissão de rede e nenhum storage. Processos geridos e encerrados pelo `webServer` do runner.

Sem screenshots/comparação visual final, Firefox/WebKit, gráficos, leitor de tela, dispositivo físico ou medições Lighthouse nesta etapa. Esses gates permanecem no plano da Home/QA; não declarar certificação.


Primeira tentativa E2E identificou browser Playwright novo ausente no cache; `npx playwright install chromium` instalou Chromium/headless shell build 1248 (Chrome for Testing 156.0.8078.4) e FFmpeg 1013. Segunda tentativa: 9/10 passaram e um locator de teste ainda buscava “Abrir menu” depois do botão mudar para “Fechar menu”; corrigido o locator sem alteração da UI. Execução final: 10/10 passaram. Avisos `NO_COLOR`/`FORCE_COLOR` do ambiente não impediram os testes.

`git diff --check` passou para arquivos desta tarefa. Diretórios `.next`, node_modules, resultados/relatórios de teste, coverage, tsbuildinfo e ambientes privados estão ignorados; `.env.example` contém apenas modo demo. Nenhum commit/push/PR/deploy realizado.


### Verificação adicional de 320px

O gate P2.3 motivou um teste dirigido de menu e validação de formulário em 320×844. Ele revelou overflow real: o seletor global `.button` sobrepunha o `display:none` de `.headerCta` com a mesma especificidade, mantendo o CTA visível abaixo de 560px. Corrigido somente o seletor para `.bar .headerCta` na media query existente. Não houve alteração de fontes, dimensões, copy ou composição. Rebuild passou e o teste pós-correção passou em ambos os projetos Chromium. Menu aberto e mensagens de validação não produziram overflow em 320×844. Esse gate precisará ser repetido na Home completa.


### Correções da revisão independente

A revisão identificou que a checagem inicial de WhatsApp apenas contava dígitos e aceitava letras, excesso numérico e DDD zero; também encontrou e-mails cujo domínio tinha rótulos vazios, hífen inicial ou pontuação inválida. A raiz compartilhada `src/lib/forms.ts` foi corrigida, com fixtures dos casos reportados e formatos válidos.

WhatsApp aceita formatação usual, número nacional brasileiro de dez/onze dígitos e código 55 opcional; rejeita caracteres alfabéticos, tamanhos fora desse formato, DDD com zero e assinante composto de um dígito repetido. Celular de nove dígitos começa com 9, conforme [tabela oficial Anatel](https://www.gov.br/anatel/pt-br/regulado/numeracao/tabela-servico-movel-celular). A checagem usa plausibilidade do DDD, sem alegar alocação real, existência, titularidade ou conta WhatsApp verificada; não é uma consulta operacional de numeração.

E-mail aceita local ASCII usual, inclusive `+`, e subdomínios; rejeita local com caracteres obviamente inválidos/pontos consecutivos ou nas extremidades e domínio com rótulos vazios, hífens nas extremidades ou pontuação final. Não implementa parser universal RFC nem entrega/verificação de endereço. Confirmar requisitos de endereços internacionalizados com o fornecedor na etapa de integração futura.

Após essas correções: `npm test` oito testes; `npm run build` passou incluindo TypeScript; `npm run test:e2e -- --grep="contact|newsletter|320px"` seis checks afetados passaram. Testes independentes sem mudanças não foram repetidos. Revisão independente final permanece responsabilidade do revisor e é registrada no PLAN pelo orquestrador.

Reprodução independente final em produção padrão (`http://127.0.0.1:3101/`), por agente diferente do implementador: contato e newsletter preenchidos sem JavaScript, seguidos de Enter, mantiveram a URL e produziram zero requisições; submit permaneceu desabilitado. Menu Serviços fechou corretamente e Tab seguiu a posição do destino. Revisor confirmou as correções dos validators e oito testes unitários. Servidor manual encerrado após a revisão.

Pendência pequena autorizada para P3.3: em 390×844, clicar na assinatura Home com o menu aberto ainda mantém `aria-expanded=true` e navegação visível; adicionar fechamento ao Link da assinatura como nos demais links. Não bloqueia o aceite independente dos contratos de dados P2.4; será corrigido e verificado junto à Home, sem build isolado apenas para esse ajuste.
