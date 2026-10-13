# Worker `newsletter-discord` (T4.2)

Recebe as interações de botões do Discord no canal privado de revisão da newsletter. Fase T4.2: só **Recusar** e **Gerar nova versão** têm efeito; **Aprovar** está desabilitado e a API devolve `approval_unavailable` sem escrever nada. Aprovar, publicar e enviar são T4.3.

## O que o Worker faz

1. Valida Ed25519 sobre `timestamp + corpo bruto` (`X-Signature-Ed25519`, `X-Signature-Timestamp`, tolerância de 300 s) **antes** de interpretar o JSON; falha => 401.
2. `PING` (type 1) => `PONG`.
3. Para botões (type 3), exige `application_id`, `guild_id`, `channel_id` e `message.id` válidos e iguais aos configurados; `custom_id` com formato `nl:{a|r|g}:{draftId}.{revision}` e menos de 100 caracteres.
4. Chama `POST /api/internal/newsletter/decision` com HMAC de escopo `publish` (mesmo canônico de `signInternalRequest`), com limite de 2,2 s para caber no ACK de 3 s do Discord.
5. A API compara o canal e a mensagem com o vínculo gravado para a revisão corrente. Revisão antiga, mensagem diferente, rascunho já decidido ou nova revisão tornam os botões antigos inválidos. A decisão é compare-and-set: repetição e concorrência têm um vencedor.
6. Resposta: type 7 (remove os botões) quando a revisão fica encerrada; type 4 efêmero nos demais casos. Só uma resposta **2xx** da API vale como decisão (`result`); qualquer outro status, timeout, redirecionamento ou corpo inválido => mensagem efêmera de resultado incerto (a decisão é idempotente; clicar de novo é seguro). A API responde 200 com `result` para todo desfecho de uma decisão bem formada; 4xx/5xx são erros e não carregam decisão. Corpo assinado que seja JSON mas não objeto (`null`, array, número) => 400.
7. Ao encerrar a mensagem de controle (type 7), o texto novo mantém `Edição <slug> · ID <draftId> · revisão N`; o slug só é repetido quando o texto original tem o formato da mensagem de controle com o mesmo ID.

## Credenciais

- Tem: chave pública do Discord (variável, não secreta) e `INTERNAL_KEY_PUBLISH` (secret).
- Não tem: token do bot, chave `draft` da Routine, credenciais de armazenamento, qualquer credencial de e-mail.
- Segredos só com `wrangler secret put`; `wrangler.toml` tem apenas identificadores públicos e valores vazios.
- A fronteira de autorização é o acesso ao canal privado do Discord (quem pode ver os botões). O Worker não identifica o revisor.

## Limites e pendências

- **Worker Free: 10 ms de CPU por invocação.** Ed25519 + SHA-256 + HMAC via Web Crypto devem caber, mas isso **não foi medido**: a medição real (CPU time no painel/`wrangler tail`, p95) é gate do PLAN T6.2. Se exceder, a alternativa é plano pago ou outro runtime; não decidir sem a medição.
- `waitUntil` é usado somente para o aviso opcional à Routine (`ROUTINE_FIRE_URL`/`ROUTINE_FIRE_TOKEN`) depois de "Gerar nova versão". **Não é fila**: pode ser descartado. O pedido de regeneração já está durável no armazenamento (status `regeneration_requested`), mas a execução agendada não descobre sozinha qual edição regenerar: o aviso leva o `draftId` no campo `text`, e sem ele o revisor aciona a Routine manualmente com o ID. O formato exato do corpo aceito pelo gatilho da Routine não foi verificado.
- `Ed25519` em `crypto.subtle` do runtime Workers deve ser confirmado no deploy real (testes locais usam Node 24).
- **Risco para a T4.3 (antes de habilitar Aprovar):** a API só autentica o Worker pelo HMAC `publish`; a assinatura Ed25519 do Discord é verificada no Worker, **não reverificada no servidor**. Quem obtiver `INTERNAL_KEY_PUBLISH` poderia forjar uma decisão com IDs válidos. Para recusar/regenerar o impacto é limitado; para aprovar/publicar a reverificação da assinatura Discord no servidor (ou equivalente) deve ser tratada antes.
- Nunca testado contra Discord ou Cloudflare reais nesta fase; os testes usam fakes.
- A ação de ligar a URL de Interactions ao Worker no Developer Portal é manual e fica para a operação.
