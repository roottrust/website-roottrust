# Agendador de jobs do piloto

Worker separado do bot Discord, sem endpoint HTTP público. A cada cinco minutos
faz um POST sem corpo para `/api/internal/jobs/process`, usando o protocolo HMAC
existente: escopo `jobs`, timestamp em milissegundos, nonce novo e SHA-256 do corpo
vazio. Nunca possui credenciais de Firebase, Resend, Discord, draft ou publish.

## Configuração e ativação

1. Publicação exige autorização humana. Para uma instalação nova, iniciar com
   `JOBS_ENABLED="false"`. No piloto atual, o arquivo está sincronizado com o
   Worker ativo após ensaio HMAC200; o Next usa `JOBS_TRIGGER_CONFIRMED=true`
   no piloto restrito às identidades de teste. Entregas ainda exigem ensaio
   completo. Estado e autorizações no PLAN.md.
2. No Worker **roottrust-jobs-scheduler**, salvar `INTERNAL_KEY_JOBS` como
   **Secret**, com o mesmo valor vigente de Production na Vercel. Na rotação,
   usar somente uma chave no Worker; a API pode aceitar atual e anterior.
3. Conferir `SITE_ORIGIN` (origem HTTPS exata, sem barra final), deploy da API,
   WAF publicado, configuração do piloto e allowlist. Não marcar
   `JOBS_TRIGGER_CONFIRMED=true` antes do ensaio e da ativação coordenada.
4. Com autorização, ativar `JOBS_ENABLED="true"` e verificar execuções/retorno
   HTTP 200 no painel. O cron não é horário editorial nem aprova newsletters:
   executa somente jobs que a API já autorizou/persistiu, além da manutenção.
5. Para pausar, usar `JOBS_ENABLED="false"`; remover o trigger também interrompe
   invocações. Um deploy futuro aplica o valor do arquivo local: sincronizá-lo
   após qualquer alteração manual aprovada no painel.

## Limites e falhas

- Cron `*/5 * * * *`: 288 invocações/dia, até 8.928 em um mês de 31 dias.
  A fila pode esperar cerca de cinco minutos sem atrasos do provedor; não é SLA.
- Uma tentativa por execução, sem seguir redirects, timeout de 65 segundos.
  Falhas geram códigos sem corpo/PII/assinatura nos logs. Conferir também jobs
  `dead` e filas no servidor: HTTP 200 não comprova entrega de cada item.
- Sem retry local em resposta incerta; o próximo cron usa nonce novo e a API
  controla lease/idempotência dos jobs. Excluir documentos vencidos depende
  dessa API, não de TTL pago do Firestore.
- Medir CPU Cloudflare Free (10 ms por invocação), leituras/escritas Firestore,
  duração e cotas Vercel/Resend antes de aceitar T6.2. Quantidade baixa de crons
  não garante custo zero do processamento completo.
- Cron triggers usam UTC e alterações podem levar até 15 minutos para propagar.
  Fonte: [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).

Validação local: `npm test -- tests/unit/workers/jobs-scheduler.test.ts` em `web/`.
Teste compara a assinatura Web Crypto com o autenticador real Node e replay,
sem rede nem provedores reais.
