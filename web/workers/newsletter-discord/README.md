# Worker `newsletter-discord` (T4.2/T4.3)

Recebe as interações de botões do Discord no canal privado de revisão da newsletter. **Recusar**, **Gerar nova versão** e **Aprovar e publicar** têm efeito. O Worker encaminha cada decisão com a interação original (`proof`: timestamp, assinatura Ed25519 e corpo bruto); o servidor reverifica a assinatura com `DISCORD_PUBLIC_KEY` e consome a prova uma única vez. Aprovar só registra a decisão e agenda o job durável de publicação; a prévia pública e o Broadcast ao segmento piloto são feitos pelos jobs do servidor. Sem a configuração do piloto (Resend, segmento, allowlist), a publicação da prévia **não cria** job de envio. A aprovação para **envio** vale 24 h (`APPROVAL_VALIDITY_MS`): se o job só rodar depois disso, ele falha de forma permanente com alerta (`approval_expired`) e nada é enviado; a prévia pública continua publicada. Antes de cada envio o servidor também compara assunto e HTML do rascunho remoto com a versão aprovada; divergência exige reconciliação humana, sem envio.

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

## Operação manual: falha parcial, jobs `dead` e reconciliação (T4.3)

Não há painel, CLI nem reenfileiramento automático para o envio. `enqueueJob` nunca reativa um job existente: um job `dead` continua `dead` até uma pessoa agir. A prévia pública e o envio são estados separados, então uma falha de envio nunca despublica a edição. Os alertas saem como eventos `newsletter_*` (sem dados de destinatários); o diagnóstico usa o job, o registro de entrega e o provedor.

**Regra geral.** Nunca reenviar um desfecho incerto: não limpar `reconcile`, `createAttemptAt` nem `sendAttemptAt` só para "destravar". Antes de qualquer retomada, inspecionar os três lugares abaixo e só então decidir.

1. **Job** (coleção `jobs`, `kind` `newsletter.broadcast`, `payload.draftId`/`payload.revision`): `status`, `attempts` e `lastError` (código sem conteúdo).
2. **Registro de entrega** (coleção `edition_broadcasts`, id `{draftId}.{revision}`): `createAttemptAt`, `broadcastId`, `sendAttemptAt`, `sentAt`, `reconcile`. Conferir também `edition_drafts.decidedAt` (início das 24 h) e `editions_public` (prévia publicada).
3. **Provedor** (painel do Resend): Broadcasts com o nome `rt-newsletter {draftId}.{revision}`; quantos existem, em qual segmento, qual o status, se assunto e HTML ainda são os aprovados e se há envio em andamento ou concluído.

**Retomar um job** é editar o documento do job (`status: "pending"`, `dueAt` com o instante atual em ISO, `attempts: 0`, sem `leaseToken` e sem `lastError`). O handler revalida tudo (aprovação de até 24 h, segmento só com a allowlist, conteúdo remoto igual ao aprovado, carimbos) e nunca envia duas vezes, mas a pessoa só retoma depois de inspecionar e de corrigir a causa.

| `lastError` / situação | Significado | O que fazer |
| --- | --- | --- |
| `approval_expired` | Passaram 24 h da aprovação; nada foi enviado. Pode existir um Broadcast em rascunho criado a tempo. | **Não retomar nem enviar manualmente.** Uma revisão aprovada não aceita nova revisão e o slug fica reservado. Não editar `decidedAt`, pois isso fabricaria uma aprovação humana. A prévia pública permanece; apagar eventual rascunho remoto após conferir seu estado. Novo envio exige um fluxo de reaprovação ainda não implementado. |
| `segment_not_pilot_safe` | Algum contato fora da allowlist, lista incompleta ou vazia. Nada foi enviado. | Corrigir o segmento no provedor (somente allowlist) e retomar o job, se ainda dentro de 24 h; depois disso, tratar como `approval_expired`. |
| `segment_check_unavailable` (esgotou tentativas) | O provedor não respondeu à verificação do segmento. | Confirmar que o provedor voltou, inspecionar e retomar dentro de 24 h. |
| `broadcast_create_refused`, `broadcast_send_refused` | O provedor recusou de forma definitiva (4xx) e não fez nada; o carimbo foi limpo. | Corrigir a causa (domínio, remetente, cota, conteúdo) e retomar dentro de 24 h. |
| `lease_expired` | Uma execução morreu no meio. O carimbo no registro mostra até onde foi. | Inspecionar. Com `createAttemptAt` ou `sendAttemptAt` pendentes o handler concilia pelo provedor e, na dúvida, marca `reconcile`. Retomar só dentro de 24 h. |
| `reconciliation_required` (`reconcile: true`) | O desfecho é incerto ou inseguro: create/send sem resposta, vários Broadcasts com o nome, Broadcast em outro segmento, status desconhecido, **conteúdo remoto divergente** (`newsletter_remote_diverged`) ou ainda rascunho após um envio incerto. O handler recusa para sempre. | **Não retomar o job nem limpar os carimbos.** Resolver no provedor: (a) já enviado/em fila: registrar `sentAt` (ISO) e `broadcastId` no registro de entrega; (b) nada enviado e conteúdo idêntico ao aprovado: decisão humana entre enviar pelo painel dentro das 24 h (e registrar `sentAt`) ou apagar o rascunho e não enviar; (c) conteúdo alterado ou rascunhos duplicados: apagar os que não forem conferidos e investigar quem editou; (d) nenhum Broadcast encontrado após create incerto: a ausência não prova rejeição definitiva, portanto manter `reconcile` e não criar outro. |
| `segment_changed`, `bad_payload`, `broadcast_*` (`not_found`, `not_approved`, `slug_taken`), `publish_*` (mesmos motivos) | Configuração ou dados inconsistentes. | Não retomar. Restaurar o segmento configurado originalmente ou corrigir o registro; na dúvida, tratar como `reconcile`. |

**Sem configuração do Broadcast.** Se a prévia foi publicada sem o piloto configurado, não existe job de envio. Dentro de 24 h da aprovação, depois de configurar e verificar o piloto, retomar o job `newsletter.publish` da mesma revisão (idempotente) cria o job de envio; passadas as 24 h, vale a linha `approval_expired`.

**Não desligar o Broadcast com jobs pendentes.** Antes de remover a configuração do piloto, conferir que não há jobs `newsletter.broadcast` pendentes ou com lease; sem handler, eles podem ocupar a janela de busca e atrasar outros jobs. Resolver ou conciliar esses jobs primeiro.

## Limites e pendências

- **Worker Free: 10 ms de CPU por invocação.** Ed25519 + SHA-256 + HMAC via Web Crypto devem caber, mas isso **não foi medido**: a medição real (CPU time no painel/`wrangler tail`, p95) é gate do PLAN T6.2. Se exceder, a alternativa é plano pago ou outro runtime; não decidir sem a medição.
- `waitUntil` é usado somente para o aviso opcional à Routine (`ROUTINE_FIRE_URL`/`ROUTINE_FIRE_TOKEN`) depois de "Gerar nova versão". **Não é fila**: pode ser descartado. O pedido de regeneração já está durável no armazenamento (status `regeneration_requested`), mas a execução agendada não descobre sozinha qual edição regenerar: o aviso leva o `draftId` no campo `text`, e sem ele o revisor aciona a Routine manualmente com o ID. O formato exato do corpo aceito pelo gatilho da Routine não foi verificado.
- `Ed25519` em `crypto.subtle` do runtime Workers deve ser confirmado no deploy real (testes locais usam Node 24).
- **Aprovador:** a reverificação Ed25519 no servidor (`proof`, uso único) impede forjar uma decisão apenas com `INTERNAL_KEY_PUBLISH`, mas não há allowlist de aprovador: quem puder clicar nos botões do canal privado aprova. Isso é a decisão do plano (canal privado + Ed25519); não mudar sem nova decisão.
- Nunca testado contra Discord ou Cloudflare reais nesta fase; os testes usam fakes.
- A ação de ligar a URL de Interactions ao Worker no Developer Portal é manual e fica para a operação.
