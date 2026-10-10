# Piloto Claude — movimento e lifecycle da Home

Data: 10/10/2026. Tarefa P3.4-P do PLAN. Estado: execução concluída; aguardando validação do usuário antes de continuar outras tarefas. É uma auditoria estática, não uma implementação nem o aceite integral P3.4.

## Modelo e escopo

- Ponte `mcp__claude_agent__claude`, `cwd` na raiz do repositório, `model: sonnet`, sem `writable`.
- Modelo efetivo confirmado pelo MCP: `claude-sonnet-5-5`.
- SessionId: `11ffc75e-ec74-4196-8377-c11c669a2e2d`; resultado `succeeded`; duração reportada 100 s.
- Último `contextTokens`: 91925, incluindo cache; não representa consumo total, saldo Pro ou economia.
- Follow-up da mesma tarefa/sessão: revisão dos três arquivos alterados, Sonnet 5.5, `succeeded`, 16 s, última entrada 106090 tokens incluindo cache. Resultado: aprovado sem correções factuais obrigatórias; Claude reconheceu a correção de cobertura. Dados de execução dos gates/modelo são evidências do orquestrador, não verificação independente do Claude.
- Revisão: provider de movimento, animation, Canvas/ASCII, PillarArt, runtime Three, terminal e testes relacionados. Claude não executou shell/testes, não chamou MCPs externos e não escreveu arquivos nesta tarefa.
- Mapeamentos Sonnet/Haiku/Opus 5.5 estão em `.claude/settings.json`, somente neste projeto. CLI 2.1.296; referência: [configuração oficial](https://code.claude.com/docs/en/model-config). Acesso a Haiku/Opus 5.5 ainda não testado. Fable excluído.

## Resultado e avaliação do orquestrador

Claude não encontrou, na leitura estática, bug comprovável de loop órfão ou inicialização tardia após desmontagem. Isso não certifica ausência de bugs nem substitui testes reais de navegador. O orquestrador confrontou os pontos abaixo com o código, sem aplicar mudanças.

| Ponto do parecer | Conferência no código | Encaminhamento |
|---|---|---|
| Terminal pode congelar texto parcial ao pausar | Confirmado em `web/src/features/home/Terminal.tsx:14` e `:30`: pausa cancela timer; somente redução mostra todo o texto. | Comportamento real, mas pausa congelar o estado não é por si uma violação. Terminal é decorativo; anúncio agregado separado permanece em `Process.tsx:15`. Completar visualmente ao pausar é proposta a decidir em P3.4. |
| Terminal completo pode encolher ao iniciar digitação | Fluxo confirmado: estado inicial `total` (`Terminal.tsx:12`) e progresso inicial zero; primeiro tick mostra até seis caracteres (`:23`). | Potencial flash visual, ainda sem reprodução/captura no navegador. Avaliar com movimento ativo, preservando conteúdo SSR/sem JS. |
| Scroll invalida o desenho mesmo pausado | Confirmado em `HomeCanvas.tsx:36` e `:50`; invalidação força novo desenho no quadro seguinte. | Observação de custo, não bug comprovado: scroll muda a composição/viewport. Medir antes de otimizar, sem impedir desenho estático correto. |
| Listeners/observers permanecem após fallback por falha | `HomeCanvas.tsx:29` e `SymbolAscii.tsx:26` descartam animações; teardown completo ocorre no cleanup (`:53` e `:40`). | Possível custo residual enquanto o componente permanece montado; não é vazamento comprovado após desmontagem. Considerar teardown imediato em P3.1 com teste de regressão. |

**Erro do parecer corrigido:** Claude afirmou que só `createAnimation` tinha teste unitário e que `pillar-runtime` não tinha cobertura. Há `web/tests/unit/graphics/resources.test.ts` para descarte de geometria/material e `context-loss.test.ts` para perda de contexto durante troca, sem recriação posterior. Ambos passaram nesta rodada. A afirmação ampla foi rejeitada; a revisão serve como entrada sujeita a conferência.

Continuam ausentes dos E2E atuais: troca dinâmica de redução, aba oculta, saída de viewport, perda real de WebGL, inicialização/import tardio após desmontagem e fallback após falha. Há cobertura parcial unitária desses contratos, que não equivale à validação real no navegador. Comparação visual por seção, zoom, Firefox/WebKit e desempenho também permanecem no gate P3.4/P6 conforme o plano.

## Gates executados pelo GPT como verificação determinística

Em `web/`, serialmente, contra produção; portas 3100/3101 livres antes de iniciar. Playwright iniciou/encerrou os servidores padrão/demo, sem reutilizar instâncias anteriores.

| Comando | Resultado | Tempo reportado |
|---|---|---|
| `npm run lint` | Exit 0 | 35,5 s |
| `npm run typecheck` | Exit 0 | 15,6 s |
| `npm run test` | Exit 0; 4 arquivos, 15 testes | 5,6 s |
| `npm run build` | Exit 0; Home SSR e 404; sem páginas internas antecipadas | 28,5 s |
| `npm run test:e2e` | Exit 0; 16 testes Chromium desktop/mobile | 13,3 s; suíte 11,4 s |

Avisos E2E: conflito `NO_COLOR`/`FORCE_COLOR`, sem falha de teste. Não são medições de performance da aplicação. Nenhum commit, push, PR ou deploy nesta rodada; consulta não exigiu checkpoint WIP.

Configuração JSON e 28 IDs únicos do plano conferidos. `git diff --check` também apontou linhas vazias finais nos quatro documentos de marca já modificados antes deste piloto; não foram alterados nesta tarefa.

## Próxima decisão

Piloto confirmou seleção da versão Sonnet 5.5, consulta assíncrona, retorno rastreável e gates locais. O parecer trouxe observações úteis e uma generalização incorreta de cobertura, corrigida na conferência. Escrita de código via ponte ainda não foi testada neste piloto. Após validação do usuário, retomar P3.4, decidir os ajustes menores e executar a comparação visual/QA restante; a aprovação humana da Home continua bloqueando páginas internas.
