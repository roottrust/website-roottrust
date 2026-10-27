# Routine da newsletter (T4.2 / T6.2-R3)

A Routine pesquisa e entrega **um rascunho por execução**. A pessoa decide no Discord; somente a API publica e envia após aprovação. LinkedIn, Buffer e suas credenciais permanecem separados.

## Fluxo e estado

**Configuração atual, confirmada pelo operador em18/10/2026:** prompt diário restaurado; Schedule configurado para segunda a sexta às08h de Brasília. API trigger preservado conforme orientação. Primeira ocorrência automática confirmada em19/10/2026, com criação às08h11 Brasília. A confirmação é do usuário, sem inspeção direta do painel pelo assistente. Não usar Run now como prova de agenda. O fluxo completo Routine → Discord → aprovação → prévia/Broadcast → inbox já foi ensaiado; piloto restrito aceito por Renato em19/10/2026.

`Routine → entrada Cloudflare /draft → API HMAC draft → fila → Discord privado → decisão humana → prévia/Broadcast`.

O fluxo manual foi ensaiado em17/10/2026. Implementação, gates, deploy, ensaio cloud e agenda são estados distintos registrados no [PLAN](../../../docs/plans/integrations-pilot-completed.md). A entrada e o prompt locais não comprovam ativação cloud.

**Ensaio cloud, 18/10/2026:** configuração aplicada; nova edição, regeneração pelo botão para revisão 2 e recusa comprovadas com usuário e Firestore. A edição não foi publicada/enviada. O trigger iniciou a Routine apesar do feedback de disparo incerto; não repetir nesse caso, conferir sessões/estado. Esse diagnóstico foi sucedido pela correção D2 e ensaio abaixo; na ocasião a agenda estava desligada. A primeira execução agendada continua não observada.

**Diagnóstico D2:** ensaio único pelo operador retornou HTTP 200 em 1,257 s, JSON/type válidos, mas rejeição da antiga regra de ID/prefixo. A correção publicada em 18/10/2026 usa ID opaco e link HTTPS claude.ai sem relação literal entre os dois, conforme contrato. Formato exato da resposta não foi exposto; o diagnóstico atual não prova retrospectivamente o ramo da primeira ocorrência. Ensaio pós-deploy confirmado pelo usuário: retorno “Routine iniciada”, seguido da revisão2 com mesmo ID/slug; Firestore confirmou notificações concluídas e nenhuma publicação/Broadcast. D2 concluída conforme PLAN; a revisão2 foi recusada. A agenda foi depois configurada pelo operador conforme estado atual acima.

**Ensaio integral cloud, 18/10/2026:** uma nova edição criada pela Routine foi revisada e aprovada no Discord. Publicação e Broadcast concluíram uma vez; a prévia respondeu HTTP200 com abertura de531caracteres e sem o corpo privado na resposta verificada. O usuário confirmou recebimento do e-mail dessa edição, exclusivamente no próprio endereço do segmento piloto. Isso complementa os testes manuais de17/10; configuração de agenda foi confirmada depois pelo operador; primeira execução agendada e aceite do piloto restrito foram confirmados em19/10/2026. Evidências no PLAN.

O [prompt completo](prompt.md) é autocontido: usa JSON temporário e curl, sem depender de publicar código para executar o POST. Se conectar repositório como contexto, escolher deliberadamente a branch; a Routine não deve modificar código, criar PR ou fazer deploy.

## Configuração, uma etapa por vez

1. **Entrada Cloudflare:** após gates e autorização de deploy, publicar [newsletter-ingress](../../workers/newsletter-ingress/README.md). Configurar SITE_ORIGIN=https://website-roottrust.vercel.app; salvar no cofre INTERNAL_KEY_DRAFT (mesma chave atual da API) e NEWSLETTER_INGRESS_TOKEN (novo token exclusivo). Não copiar publish/jobs/LinkedIn.
2. **Ambiente Claude exclusivo:** permitir hostname exato da entrada; criar network secret de Authorization com Bearer e o token, restrito somente a esse hostname. Conferir como o formulário aplica o prefixo para não duplicar Bearer. Definir variável **não secreta** NEWSLETTER_INGRESS_URL=https://hostname-confirmado/draft. Nenhuma chave em variável visível, prompt, chat, setup script ou Git. Network secrets são headers do proxy, não process.env.
3. **Nova Routine:** nome “Root Trust — Newsletter”; colar [prompt](prompt.md); selecionar apenas Firecrawl entre conectores, removendo Buffer, Discord, bancos e publicação. Skills só se disponíveis, sem instalação automática; humanizer tem revisão direta como fallback. Usar modelo disponível no plano, sem inferir versões de aliases antigos ou ativar cobrança API. Começar **sem agenda**, com trigger API.
4. **Regeneração:** salvar Routine, obter URL/token exclusivos no trigger API. Salvar ROUTINE_FIRE_URL e secret ROUTINE_FIRE_TOKEN no Worker newsletter-discord. URL oficial https://api.anthropic.com/v1/claude_code/routines/ID-FORNECIDO/fire; não deduzir ID nem reutilizar a Routine LinkedIn. Código inclui headers beta/version e contexto ID/slug/revisão.
5. **Ensaio:** Run now → rascunho no Discord → Gerar nova versão → mesma edição/revisão nova → recusar. Conferir transcript, API e estado saneado. Geração não exige aprovação/envio; novo Broadcast exige conferir segmento e autorização própria. Não reativar assinante cancelado.
6. **Agenda autorizada em18/10/2026:** após salvar o prompt diário restaurado, editar a Routine existente e adicionar gatilho Schedule com preset Weekdays (segunda a sexta), às **08h no horário local de Brasília, America/Sao_Paulo**. Manter também o gatilho API, pois os botões usam regeneração via API; não criar outra Routine nem revogar token. A [documentação oficial](https://code.claude.com/docs/en/routines#add-a-schedule-trigger) informa que o formulário usa horário local e converte automaticamente; conferir fuso do navegador/painel e a próxima execução, sem presumir cron UTC. Início exatamente na hora pode atrasar alguns minutos. Primeira ocorrência esperada após autorização:19/10/2026 às08h Brasília (11h UTC). Não clicar Run now para comprovar a agenda. Configuração pelo operador e primeira execução observada serão registradas separadamente no PLAN. Agenda desligada impede disparos agendados; Run now/API ainda podem gerar rascunhos e jobs já aprovados não são cancelados.

Não colar segredos nas respostas ao assistente. Informar somente conclusão da etapa e hostnames/IDs públicos necessários. Se um campo não existir no formulário, conferir a tela/docs antes de adaptar.

## Contratos editoriais e de envio

- Um tema central, pt-BR, análise com fontes nos três pilares para operações críticas. Não transportar slogan antigo, foco exclusivo em PME, agenda seg/qua/sex ou formato curto sem links do LinkedIn.
- Nova edição: newsletter-AAAA-MM-DD, data Brasília, identidade gerada uma vez antes da pesquisa/POST. A exceção de múltiplos ensaios foi encerrada por autorização do usuário em18/10/2026 após teste integral; não usar horário/sufixo aleatório nem título de ensaio nas novas edições normais. Preservar identidade após erros. A API continua reservando cada slug e limitando oito rascunhos/revisões por janela de24h; não existe histórico semântico privado de temas. O operador deve salvar o prompt restaurado no Claude antes de habilitar a agenda; arquivo local não atualiza serviço.
- Regeneração: exige regeneration_requested e conserva **draftId e slug**. Outro slug recebe409slug_mismatch; até três pedidos/edição/dia. Payload incompleto exige operador, nunca edição nova.
- Primeiro parágrafo completo público (40–2.000 caracteres), com links citados; demais parágrafos privados. JSON: slug/data/pilar/titulo/corpo/fontes; só regeneração acrescenta draftId. Fontes HTTPS 1–20, título até 200 caracteres, corpo até 64 KiB; JSON total até 64 KiB+4 KiB. API deriva abertura.
- O renderizador suporta parágrafos e links inline, sem Markdown geral; prompt não pede títulos, tabelas ou negrito.
- 202 significa registro/fila, não mensagem entregue, publicação ou envio. Timeout pode ocorrer após gravação: não repetir cegamente nem mudar slug. 409slug_exists exige conferir estado.
- Sem pauta/Firecrawl: não criar edição fictícia; motivo no transcript. Não há alerta Discord adicional para esse caso.

## Fallback manual do operador

post-draft.mjs continua para operador autorizado com SITE_ORIGIN e INTERNAL_KEY_DRAFT no **processo local**, carregada de forma oculta e removida ao terminar. Não é o caminho da Routine cloud.

```text
node ops/newsletter-routine/post-draft.mjs rascunho.json
```

Executar de web/. Mesmo JSON do prompt; não colocar chaves em argumentos, histórico, arquivos públicos ou mensagens. A API aceita rotação atual,anterior; cada assinador usa uma chave individual, nunca a lista inteira.

## Falhas, cotas e reversão

“Nova versão solicitada” registra estado no banco; apenas resposta válida do /fire confirma **início**, não conclusão da Routine. Timeout/falha exige conferir execuções antes de disparo manual. Sem token/config/slug, regeneração permanece pendente: Run now pode receber identidade completa, nunca autorização de publicar.

Revogar token da entrada ou pausar Routine impede novas gerações. Para Workers, usar versão anterior registrada no PLAN; retirar entrada nova somente após revogar acesso. Não desfazer decisões aprovadas ou limpar estados incertos para forçar envio. Conciliar jobs pendentes antes de mudar envio.

Claude Pro/Firecrawl compartilham cotas existentes. Medir Workers Free (10 ms CPU/invocação) e limites do piloto; não assumir operação ilimitada nem ativar planos pagos. Estado verde de execução não prova rascunho entregue: conferir resultados.

Fontes: [Routines/API/limites](https://code.claude.com/docs/en/routines), [ambientes/network secrets](https://code.claude.com/docs/en/cloud-environments). Recursos em research preview; revalidar contratos se mudarem.


**Encerramento, 19/10/2026:** primeira execução automática confirmada pelo operador, com aprovação humana no Discord, prévia publicada e e-mail recebido. Piloto restrito aceito por Renato, responsável pelas cotas e cópias externas. Evidências em `docs/plans/integrations-pilot-completed.md`; nenhuma abertura pública autorizada. Notas anteriores sobre aguardar a primeira ocorrência são históricas.
