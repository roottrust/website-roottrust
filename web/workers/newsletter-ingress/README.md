# Entrada privada de rascunhos

T6.2-R3.2: `POST /draft` recebe um objeto JSON e encaminha seus bytes exatos à API fixa `/api/internal/newsletter/draft`, com HMAC de escopo `draft`. A validação editorial, a reserva de slug e os limites continuam na API. Este Worker não aprova, publica nem envia newsletter e não acessa banco, bot ou Resend.

## Configuração pelo operador

1. Conferir conta e `SITE_ORIGIN` no `wrangler.toml`. Deve ser uma origem HTTPS exata, sem barra final, caminho, query, fragmento ou credenciais.
2. Criar um token exclusivo aleatório de pelo menos 32 caracteres (sem espaços/vírgulas). Guardar como **Secret** `NEWSLETTER_INGRESS_TOKEN` no Cloudflare. Não reutilizar a chave HMAC nem credenciais do LinkedIn.
3. Guardar como **Secret** `INTERNAL_KEY_DRAFT` apenas a chave atual usada pela API. Não passar CSV de rotação; a API pode continuar aceitando chave anterior durante a transição.
4. Após revisão, gates e autorização específica, publicar. Registrar versão e conferir o hostname exato antes de configurar o Claude. Não criar `.env` nem colar tokens em chat/comandos versionados.
5. Em um ambiente Claude exclusivo, criar network secret para o hostname exato deste Worker, header `Authorization`, valor Bearer do token de entrada. Não usar variável de ambiente visível nem fornecer a chave HMAC ao Claude. A Routine manda apenas JSON a `/draft`.

O Worker retorna apenas status/código/ID/revisão. Não escreve logs nem reflete conteúdo editorial, headers ou mensagens de exceção. Corpo recebido: até 69.632 bytes, contado durante a leitura (10 s). Chamada API e leitura da resposta: prazo conjunto de 20 s, resposta limitada a 4.096 bytes. Sem redirects ou repetição automática; token inválido 401, configuração inválida 503, JSON inválido 400, limite 413, leitura lenta 408. Resposta incerta da API: 502/504 `upstream_uncertain`; **pode ter persistido**. Manter slug e conferir Discord/estado antes de qualquer nova tentativa. 202 significa revisão enfileirada, nunca aprovação ou entrega.

## Verificação e reversão

Em `web/`: `npm test -- tests/unit/workers/newsletter-ingress.test.ts`. O orquestrador executa lint, tipos, suíte, build/E2E e ensaio workerd isolado antes de publicar. Testes não usam provedores ou segredos reais.

Para interromper novas entradas, pausar a Routine e revogar o token no Worker/ambiente Claude. Não altera jobs de edições já aprovadas. O comando manual HMAC do operador continua como alternativa. A credencial Bearer é estática: posse indevida permite pedidos de rascunho dentro dos limites da API; HMAC não elimina esse risco nem garante CPU/cotas gratuitas sob abuso. Medir o runtime real durante o piloto.
