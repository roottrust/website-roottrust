# Auditoria P4.1 — Três serviços nativos

Data: 2026-10-10. Checkpoint: `b69a452`. Executor: `claude-agent` (Sonnet), sessão headless, sem commit/push.

## Arquivos

- `web/src/features/services/content.ts`: dados tipados dos três serviços (conteúdo dos exports `Servico *.dc.html`, conferido com `docs/web/product.md`).
- `web/src/features/services/ServicePage.tsx`: Server Component; 6 seções (hero, situações, 4 frentes + painel, método em 5 etapas + fecho, FAQ nativo `details/summary`, contato `#contato`).
- `web/src/features/services/services.module.css`.
- `web/src/app/servicos/{ciberseguranca,infraestrutura-em-nuvem,desenvolvimento-de-software}/page.tsx`: `force-dynamic`, `resolveFormMode(process.env.FORM_MODE)` no servidor, `metadata` por rota.
- `web/tests/e2e/services.spec.ts`.
- Reutilizados sem alteração: Header/Footer globais, `PillarArt` (`chave`/`servidores`/`modulos`), `ContactForm`, tokens. Nenhum arquivo compartilhado alterado.

## Conteúdo e limites contratuais

- Cibersegurança restaura “Capacidades complementares, conforme escopo contratado” no painel Pentest: Gestão de vulnerabilidades, Red Team (escopo próprio, não sinônimo de Pentest) e Apoio a normas/compliance (sem prometer certificação). Mantidos: autorização/escopo, 3 entregas, “Reteste ... conforme escopo e contrato”, “A conversa gratuita não inclui...”.
- Infraestrutura: sem percentual de economia; 24×7 automático não implica equipe humana.
- Software: integração ≠ automação; suporte/evolução conforme contratação.
- Sem novos pilares, provas, métricas, selos ou ferramentas promocionais.

## Gates (em série, `web/`)

- `npm run lint`: ok. `npm run typecheck`: ok. `npm test`: 15/15. `npm run build`: ok (as 3 rotas dinâmicas).
- `npm run test:e2e`: 48 passed, 4 skipped (aba real em segundo plano, preexistente).
- Novos testes: SSR do HTML bruto (H1 e textos contratuais), 6 seções, CTA `#contato`, FAQ por teclado (Enter/Espaço), validação com foco no primeiro campo, sem `pageerror` nem recurso 404, sem overflow a 320px, modo padrão sem sucesso simulado (porta 3101).

## Limites

- Canvas de moldura reativa e símbolo ASCII do CTA da Home não foram reproduzidos (`HomeCanvas` é acoplado às seções da Home); os serviços usam `PillarArt` no hero e CTA sem símbolo.
- Sem comparação pixel a pixel contra os exports; composição transcrita em CSS Modules a partir dos tokens, sem aprovação visual humana ainda.
- O CTA do Header global aponta para `/#contato` (Home), não para o contato local; o CTA do hero e o do `main` usam `#contato` local.
- Acessibilidade e desempenho não certificados; Lighthouse não medido nesta etapa.
- Ferramentas/newsletter não iniciadas.
