# Auditoria dos exports — 09/10/2026

## Conclusão

O conjunto atual cobre as páginas principais planejadas: **Home, três serviços, quatro ferramentas e três páginas de newsletter**, além da 404. Não é necessário gerar novamente essas páginas para começar a portabilidade. Primeiro, corrigir a regressão da Home e as lacunas de conteúdo/navegação descritas abaixo.

Os exports são protótipos executáveis, não uma aplicação pronta para publicação. Não há Next.js inicializado, recebimento real de contatos, confirmação de e-mail, CMS ou envio de relatórios. A presença das telas não representa aprovação visual final das internas nem conclusão operacional.

Esta análise não altera os HTML, os cálculos ou as regras comerciais. Usa a identidade v2, a Home aprovada e os contratos [S01–S16](../../docs/web/product.md#conteúdo-proposto--cibersegurança), [F01–F29](../../docs/web/tools.md) e [N01–N11](../../docs/web/newsletter.md). Não recupera árvore, Bonsai ou identidade anterior.

## Método e evidências

- Leitura dos 12 HTML, dependências compartilhadas, dados públicos da newsletter e briefings.
- Execução em Chrome por HTTP local: **24 combinações**, 1440 × 1000 e 390 × 844. Captura da primeira tela e inspeção do DOM de cada página; inspeção visual dos 12 screenshots desktop e de Software mobile.
- Verificação adicional de largura de 320 px em Software, arquivo da newsletter e ROSI. Nenhum transbordamento horizontal nesses casos. O resultado da Home corresponde à renderização de contingência, não valida sua composição pretendida.
- **13 verificações de lógica:** 12 passaram; a Home falhou por variável inexistente. **13 verificações de interação:** 12 passaram; a mesma regressão da Home falhou no navegador.
- Conferência de referências locais estáticas: nenhum arquivo ausente entre os caminhos verificados. Isso não comprova navegação funcional, âncoras dinâmicas ou integração.

Evidências de trabalho: [resultados do navegador](../../temp/audit-web-2026-10-09/browser-results.json), [lógica](../../temp/audit-web-2026-10-09/model-results.json) e [interações](../../temp/audit-web-2026-10-09/interaction-results.json). Os screenshots e scripts ficam na mesma pasta, fora do conjunto publicável. As verificações usam o código extraído dos exports, sem criar uma segunda implementação das fórmulas.

## Achados prioritários

### P0 — A Home apresenta erro de execução

Em [Home.dc.html](../claude-design/Home.dc.html), linha 894, o `map` de `ETAPAS` recebe `(e, i)`, mas tenta acessar `s.href` e `s.title`. A variável `s` pertence ao outro mapeamento, de serviços, e não existe nesse contexto.

O navegador mostra **`Home.renderVals(): s is not defined`**. O runtime captura a exceção e exibe uma renderização de contingência; por isso, parte da página continua visível. Isso não significa que os componentes e interações estejam funcionando. A checagem de exceções não capturadas, isoladamente, também não detecta esse erro tratado pelo runtime.

**Ação:** corrigir o mapeamento das etapas na origem e conferir novamente Home desktop/mobile, seletor de serviços, processo, links das ferramentas e formulários. O código já contém os destinos dos novos serviços e ferramentas, mas esta regressão impede validar a jornada completa a partir da Home.

### P1 — Cibersegurança tem cobertura parcial do briefing

Pentest recebeu o destaque solicitado, dentro de Diagnóstico de riscos. A página inclui aplicações web, APIs, redes, infraestrutura e mobile; relatório técnico com evidências/impacto, resumo executivo, recomendações priorizadas e reteste conforme contratação. Também distingue conversa gratuita de Pentest e monitoramento automático de resposta humana.

Faltam as menções explícitas previstas no [briefing, seção de capacidades complementares](../../docs/web/product.md#conteúdo-proposto--cibersegurança): **gestão de vulnerabilidades, Red Team e apoio a normas/compliance**. Mencionar vulnerabilidades genericamente não explica sua gestão.

**Ação:** acomodar essas capacidades nas quatro frentes existentes, sem criar outro pilar, um quinto serviço ou promessa de certificação. Red Team não deve aparecer como sinônimo de Pentest.

### P1 — Navegação e privacidade ainda incompletas

- O link **“Ver edições anteriores” da Home continua com `href="#"`**, embora o arquivo da newsletter exista.
- Nas ferramentas, os links de newsletter levam à seção da Home, não à apresentação dedicada. É um destino existente, mas a jornada deve ser padronizada.
- **Privacidade continua com `href="#"` nas 12 páginas**; a política ainda não foi produzida.
- A 404 existe, mas um arquivo servido com sucesso por HTTP não constitui resposta HTTP 404. Seu botão prioriza voltar no histórico; há fallback para Home quando não existe histórico/referrer, mas uma ação explícita “Ir para a Home” seria mais previsível. Newsletter aparece destacada no cabeçalho dessa tela sem ser a seção ativa.

**Ação:** definir e aplicar os destinos na portabilidade. Não criar hub de ferramentas, diagnóstico dedicado ou Sobre apenas para preencher navegação: essas páginas continuam fora do escopo atual.

### P1 — Movimento e acessibilidade exigem conclusão

- Não foi encontrado controle visível para pausar os efeitos contínuos.
- Os três serviços passam `this.reduce` ao 3D sem inicializar essa preferência: o objeto e a rolagem programática não respeitam corretamente redução de movimento. O símbolo ASCII compartilhado, por outro lado, já acompanha mudanças dessa preferência.
- As ferramentas acompanham mudanças de `prefers-reduced-motion`, mas o renderer compartilhado continua desenhando em modo reduzido. Em aba oculta, `pillars3d.js` chama `frame()` periodicamente a cada 120 ms; não há suspensão completa.
- Há tratamento inicial de indisponibilidade do 3D nos serviços, com SVG alternativo. A perda de contexto WebGL, porém, apenas cancela o comportamento padrão; recuperação e alternativa durante a perda continuam pendentes.
- Os formulários de serviços exigem os três campos por validação JavaScript, mas os inputs não expõem `required`/`aria-required` nem indicação prévia clara de obrigatoriedade. Não são campos opcionais: falta comunicar essa regra de forma acessível.

**Ação:** concluir pausa, preferência dinâmica, suspensão, fallback e semântica na implementação, preservando a aparência aprovada. O menu mobile de Software passou no teste de abertura, Escape e devolução do foco; isso não certifica o teclado de todas as páginas.

### P1 — Publicação e integrações não estão prontas

Os formulários de serviços e newsletter mudam estado local; os testes não observaram envio dos dados fictícios. As mensagens de demonstração são adequadas ao protótipo. Na aplicação real, sucesso só pode aparecer após confirmação da operação correspondente.

O arquivo público `newsletter-edicoes.js` contém apenas metadados e abertura editorial de três amostras, como previsto. Entretanto, **`web/uploads/` contém as edições completas e contexto interno**. Publicar a pasta inteira exporia esse material, contrariando a entrega completa por e-mail. O [manifesto público](../claude-design/newsletter-pacote-publico.md) identifica corretamente as exclusões, mas ainda é uma orientação, não um processo de build.

O manifesto também prevê licenças OFL junto das fontes. Elas não foram encontradas em `web/_ds`; os originais estão preservados em `docs/design/assets/fonts/archivo/OFL.txt` e `baloo-2/OFL.txt`.

**Ação:** produzir um conjunto publicável explícito, com licenças e sem uploads/scratch/contexto editorial completo. Definir recebimento do diagnóstico, fluxo editorial, confirmação/cancelamento, envio e política de privacidade antes de ativar essas operações. Backend, CMS, e-mail e hospedagem permanecem sem escolha.

## Análise por página

| Página | Resultado e pontos a preservar |
|---|---|
| **Home** | Bloqueada pela regressão de `renderVals`. Preservar hero ASCII, moldura, princípios, serviços, processo e CTA após reparar a execução; não avaliar a versão de contingência como novo design. |
| **Cibersegurança** | Seis seções e quatro frentes; Pentest está claro e contratualmente delimitado. Completar as três capacidades mencionadas acima. |
| **Infraestrutura em nuvem** | Boa aderência: continuidade e custos, ambientes locais/nuvem/híbridos, redes, arquitetura/configuração, recuperação e capacidade. Não promete economia ou disponibilidade garantidas; suporte depende do contrato. |
| **Software** | Boa aderência: aplicações web/mobile, integrações/automação e modernização/evolução. Entregas exemplificadas com testes e documentação, sem afirmar propriedade intelectual ou suporte universal não contratados. |
| **ROSI** | Resultado compacto, premissas e equilíbrio. Os casos avaliados preservam retorno negativo, custo zero, eficácia desconhecida e atraso de 12 meses. Não é avaliação de postura de segurança: revisar a descrição antiga na Home para não criar essa expectativa. |
| **Shadow AI** | Checklist qualitativo de cinco temas e quatro respostas; sem score inventado. Respostas incompletas impedem concluir. Não comprova automaticamente a existência ou eficácia dos controles da empresa. |
| **Dívida técnica** | Quatro entradas e estimativa de custo de capacidade. Cálculo e aviso de resultado desatualizado após edição funcionaram. O valor não representa toda a dívida técnica nem orçamento garantido de correção. |
| **Migração para nuvem** | Comparação de totais em 12/36 meses, transição separada e resultados positivos/negativos. Troca de horizonte pede revisão, sem multiplicação automática dos valores. Não promete economia. |
| **Newsletter — apresentação** | Proposta, amostra, benefícios, curadoria, FAQ e inscrição presentes. Entrega imediata da edição mais recente após confirmação continua simulada. |
| **Newsletter — arquivo** | Três edições demonstrativas, destaque, filtro por pilar e paginação de duas por página. Filtro exercitado no navegador; paginação conferida no código e controles. |
| **Newsletter — prévia** | Primeiro parágrafo editorial e fontes, captura de e-mail e edição escolhida preservada na interface. Slug inválido leva à 404 em vez de escolher silenciosamente a última edição. |
| **404** | Visual consistente com as internas e símbolo ASCII; ajustar navegação ativa, saída explícita para Home e resposta HTTP na aplicação. |

Os três serviços repetem a estrutura aprovada: abertura → situações → quatro frentes → método → FAQ → formulário. Não adicionaram seção promocional de ferramentas. Nome, Empresa e WhatsApp são exigidos; promessa de retorno no próximo dia útil permanece. O processo admite variação conforme o projeto.

Visualmente, as internas compartilham tema escuro, Baloo 2/Archivo, paleta v2, assinatura negativa, espaçamentos e componentes da Home com efeitos contidos. Os objetos hachurados usam **Three.js real**; hero/moldura/símbolos usam **Canvas 2D**. Não é necessário transformar todo efeito em 3D ou escolher React Three Fiber.

### Exemplos de cálculo reproduzidos

| Ferramenta | Entradas | Saída verificada |
|---|---|---|
| ROSI | Prejuízo R$ 200 mil; frequência 0,5/ano; custo R$ 30 mil; atraso 3 meses; redução 60% | Benefício R$ 45 mil; líquido R$ 15 mil; ROSI 50%; equilíbrio 40% |
| Dívida técnica | 8 pessoas; custo mensal R$ 10 mil/pessoa; manutenção 40%; parcela evitável 25% | R$ 8 mil/mês e R$ 96 mil/ano |
| Migração | Atual R$ 120 mil; operação futura R$ 90 mil; transição R$ 20 mil | Total futuro R$ 110 mil; diferença R$ 10 mil, equivalente a 8,33% |

Esses testes verificam implementações e casos selecionados, não validam as estimativas fornecidas pelo visitante nem certificam todos os valores possíveis. Relatórios por e-mail permanecem indisponíveis no protótipo, coerentemente com a falta de integração/material final.

## Próximos passos recomendados

1. **Estabilizar o export:** corrigir Home, completar Cibersegurança e conectar os destinos já existentes. Revalidar apenas os fluxos afetados.
2. **Fechar a referência de desenvolvimento:** revisar visual/textos das internas e atualizar inventário, pendências e próxima etapa em `docs/web` e `AGENTS.md`. Hoje ainda há trechos pedindo geração de serviços já existentes. Preservar a distinção entre aprovado, demonstrativo e operacional.
3. **Portar para a stack confirmada:** Next.js App Router, React, TypeScript, npm, CSS Modules e tokens. Reutilizar assinaturas/fontes/objetos, extrair cálculos verificáveis e implementar navegação real. Definir versões compatíveis na inicialização; não copiar versões CDN como decisão automática.
4. **Concluir qualidade durante a portabilidade:** HTML semântico renderizado, foco/teclado, erros, movimento, alternativas gráficas e ciclo de vida do renderer. Medir desempenho antes de prometer que o 3D está otimizado.
5. **Definir e integrar operações:** responsáveis pelo contato e promessa de prazo; CMS/e-mail e revisão humana; confirmação, edição escolhida/mais recente e cancelamento; relatório padrão opcional independente da newsletter. Não escolher fornecedores sem validação do time.
6. **Preparar publicação:** privacidade compatível com os dados reais, exclusões do pacote, licenças, metadados/URLs/404, testes dos modelos e revisão em dispositivos e tecnologias assistivas.

**Limites:** não houve certificação de WCAG, medição de Core Web Vitals, ensaio em aparelhos físicos, auditoria jurídica ou teste de serviços de envio inexistentes. A estrutura visual está suficientemente coberta para avançar; a regressão da Home e as pendências operacionais impedem tratar o conjunto como pronto para produção.


