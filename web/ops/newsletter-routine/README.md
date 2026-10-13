# Routine da newsletter (T4.2)

Routine separada do código do site. Ela pesquisa, escreve **um rascunho por execução** e o entrega ao endpoint de rascunho. Ela **não** aprova, publica nem envia nada.

## Agenda

- Segunda a sexta, **08h, America/Sao_Paulo**. Expressão cron: `0 8 * * 1-5`, fuso `America/Sao_Paulo` (a Routine deve interpretar o fuso explicitamente; não converter para UTC à mão).
- Pausar a Routine ou esgotar sua cota significa **nenhum rascunho novo**: nada é publicado nem enviado, porque a Routine não tem como fazê-lo.
- O site também limita a 8 rascunhos por 24 h (`nl-draft-day`), contados de forma global.

## Credencial

- A única credencial de escrita é `INTERNAL_KEY_DRAFT` (escopo `draft`, HMAC), guardada como **network secret** do ambiente da Routine. Não a coloque no prompt, em arquivos do repositório nem em logs.
- A Routine **não** recebe `INTERNAL_KEY_PUBLISH`, `INTERNAL_KEY_JOBS`, token do bot do Discord, chave do Worker nem credenciais de armazenamento ou e-mail.
- `SITE_ORIGIN` (https) também é configuração do ambiente.
- Rotação: o site aceita `INTERNAL_KEY_DRAFT=atual,anterior`.

## Prompt (resumo do que a Routine recebe)

1. Pesquisar o pilar do dia em fontes primárias e verificáveis (advisories e documentação oficiais, relatórios publicados, normas). Cada afirmação factual precisa de uma fonte acessível; sem fonte, não afirmar.
2. Não inventar métricas, citações, nomes, links ou datas. Se uma fonte não puder ser aberta, ela não entra.
3. Tom técnico e próximo, sem medo, jargão sempre explicado, sem promessa genérica. A comunicação pública é de curadoria Root Trust; o texto não declara ser produzido por IA nem descreve o processo interno de revisão.
4. O **primeiro parágrafo** é a abertura pública: completo, com os links Markdown das fontes que ele cita. Os demais parágrafos nunca são públicos.
5. Entregar um único JSON no formato abaixo e executar `node ops/newsletter-routine/post-draft.mjs rascunho.json`.

```json
{
  "slug": "kebab-case-unico",
  "data": "2026-10-13",
  "pilar": "Cibersegurança",
  "titulo": "Título da edição",
  "corpo": "Primeiro parágrafo com [fonte](https://exemplo.org/a).\n\nDemais parágrafos...",
  "fontes": [{ "titulo": "Nome da fonte", "href": "https://exemplo.org/a" }]
}
```

Regeneração: quando o revisor usa **Gerar nova versão**, o site marca a edição como `regeneration_requested`. Só então a Routine pode reenviar a edição incluindo `"draftId": "ed_..."` no JSON (o ID aparece na mensagem de revisão no canal e no aviso opcional do Worker). Qualquer outro `draftId` recebe 409. Cada edição aceita no máximo 3 pedidos de nova versão por dia (America/Sao_Paulo). A regeneração **mantém o slug**: um `slug` diferente do original devolve `409 slug_mismatch` (verificado dentro da transação) e o pedido continua aberto, então reenvie com o mesmo slug.

`fontes` exige **pelo menos 1** fonte (no máximo 20), cada uma com `href` https; lista vazia ou fonte sem https devolve 400.

## Limites conhecidos

- O corpo completo, para revisão, aparece **somente** no canal privado do Discord; nunca no site público.
- Repetir o POST de uma edição nova após timeout devolve `409 slug_exists` se a primeira tentativa foi gravada; isso é esperado e **não** deve ser contornado trocando o slug sem conferir o canal de revisão.
- Se o POST for aceito (202) mas o Discord ou a execução de jobs estiver indisponível, o job fica na fila e é reenviado com backoff; o canal pode receber uma mensagem repetida em caso raro (apenas a mensagem vinculada à revisão decide algo).
- Unicidade global do slug entre edições **concorrentes** não tem reserva transacional: dois rascunhos novos simultâneos com o mesmo slug podem coexistir. Fica como limite para a T4.3, antes de qualquer publicação.
- Nada aqui foi executado contra Discord, Cloudflare, Firestore ou a plataforma de Routines reais nesta fase.
- Aprovar, publicar e enviar são T4.3.
