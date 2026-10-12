# Contrato das ferramentas Root Trust

**Atualizado:** 11/10/2026. F01–F29 definem o escopo aprovado das quatro ferramentas. Seus exports aprovados estão em `references/claude-design/` e foram avaliados na auditoria de 09/10; os modelos locais foram implementados, testados e revisados; a publicação futura exige nova revisão de fontes, patches e operação. Propostas neste contrato devem ser comparadas com o export aprovado. Entrada: [README](README.md); newsletter: [newsletter.md](newsletter.md).

## Resumo para começar

As quatro páginas (ROSI, Shadow AI, Dívida técnica e Migração para nuvem) foram portadas para Next e revisadas contra este contrato. Cada uma tem formulário/checklist curto e resultado compacto na mesma página. Não há wizard obrigatório, gráficos analíticos, score de risco, comparação automática de propostas ou personalização do relatório.

Este documento é o contrato de escopo, modelos, limites, estados e exemplos reproduzíveis para a portabilidade e revisão das ferramentas.

## Implementação e limites verificados

Modelos TS puros cobertos por 69 testes de modelos, dentro dos 107 unitários totais atuais (101 anteriores + 6 de cobertura de fontes). Cálculo somente no navegador; edição invalida resultado e respostas não são associadas ao relatório. A aritmética usa IEEE 754, com tratamento de cancelamento limitado a quatro EPSILON; não é contabilidade decimal exata nem garantia de precisão universal. Fixtures incluem valores subcentavo e diferenças de 1 em 10¹⁵.

Adaptações funcionais preservadas: seletor de cenário, campos desconhecidos/personalizados e ajudas explícitas; rótulos com “—” antes do cálculo, sem valores fictícios; Shadow AI sem score. Método em acordeão, resultado sem fixação e exemplo fictício abaixo do resultado podem alterar altura/posição em relação ao export. Objetos 3D são decorativos. [QA e limitações](../../references/audits/final-qa.md).

## Fontes e precedência

1. Respostas explícitas da entrevista F01–F29 registradas neste documento; decisões posteriores substituem as anteriores no mesmo assunto.
2. [Home.dc.html](../../references/claude-design/Home.dc.html) e [design](design.md) como referência visual: as ferramentas herdam sua linguagem com efeitos contidos, conforme F01. Os quatro exports aprovados orientam as composições internas atuais.
3. [Marca](../design/README.md), [conteúdo](product.md) e [jornadas](product.md) para contexto compartilhado.
4. [DC das ferramentas](<../../temp/Ferramentas/Root Trust - Ferramentas Interativas.dc.html>) e [briefing histórico](../../temp/Ferramentas/uploads/root-trust-ferramentas-interativas.md) como inspiração não aprovada.

Standalone e export das ferramentas são versões anteriores, com números diferentes do DC raiz. São 17 arquivos e 12 mockups desktop, sem handlers de cálculo/envio, navegação entre etapas ou projeto mobile específico.

## Requisitos já aprovados

- Quatro ferramentas: ROSI, Shadow AI, Dívida técnica e Migração para nuvem. pt-BR, operações críticas.
- Resultado inicial aberto, sem cadastro; método, fontes, unidades, premissas e limites visíveis.
- Fluxo curto, com revisão das respostas e resultado na mesma página. F18/F21/F25/F29 substituem as etapas inicialmente propostas em F02: todas as quatro ferramentas usam formulário/checklist em uma página.
- Quantitativo somente com modelo aprovado; qualitativo também exige critérios defensáveis.
- Cálculo frontend. Respostas somente em memória, descartadas, sem envio/persistência/analytics/URL/associação ao e-mail.
- Relatório **padrão por tema**, opcional por e-mail, separado da newsletter; sem personalização/plano individual prometidos.
- CTA **Solicitar diagnóstico**, conversa inicial gratuita; sem agenda automática.
- Ícones Home: balança, olho, engrenagem com dentes faltantes, nuvem/seta. Reuso contido nas internas é proposta visual para revisão, sem substituir controles ou resultados.
- Entrega real depende de integração; demonstrações precisam de identificação.

## Direção visual aprovada para as ferramentas

**F01 — Home com efeitos contidos.** Herdar a linguagem da Home: fundo escuro, Baloo 2/Archivo, assinatura oficial, moldura/contornos, cards e repertório de ícones. Adaptar a intensidade dos efeitos para não disputar atenção com campos, explicações e resultados. Conteúdo e controles permanecem em HTML, independentes dos canvases.

A escolha aprova a direção geral, não a posição dos objetos, quantidade de animações, amplitude, velocidade, pinning ou composições específicas. A seção de composição abaixo propõe uma solução simples para revisão visual. Pausa acessível, redução de movimento e fallback permanecem requisitos; não preservar falhas do export como comportamento desejado.

### Aproveitamento do material histórico

Aproveitar perguntas → resultado aberto → relatório/CTA, agrupamentos, cards de resultado, método e custos únicos/recorrentes. Não copiar JPG antigo, Industry azul, Barlow, Marketing Digital, navegador fictício ou largura fixa480px.

| Ferramenta | Proposta histórica | Questão a resolver |
|---|---|---|
| ROSI | Setor/porte/controles e percentuais fixos | Sem perda/frequência/investimento/mitigação; tabelas/fontes insuficientes |
| Shadow AI | Cinco controles sim/não, score fixo | Sem faixas/ponderação defensáveis; respostas e lacunas divergem |
| Dívida técnica | Time/custo/manutenção/parcela de dívida/atraso | Faixas usam profissionais representativos; estados não recalculam custos |
| Migração | Porte/gasto atual/tipo | Falta custo futuro/horizonte; resultado fixo e economia sem modelo |

Números e estatísticas históricos **não são evidências ou benchmarks aprovados**. Nenhuma fórmula será promovida por reprodução do mockup.

## Escopo aprovado por ferramenta

### Base comum

Linguagem visual definida em F01. F02 propôs etapas curtas; F18/F21/F25/F29 definem formulário/checklist em uma página para todas as ferramentas. Permitir revisar respostas e exibir resultado aberto logo abaixo. As quatro rotas de ferramenta estão no escopo; hub de ferramentas adiado e fora das rotas desta entrega. Não acrescentar etapas artificiais ou telas de captura antes do resultado.

As regras operacionais e propostas de copy/composição abaixo completam o contrato de implementação e revisão. Não apresentar essas propostas como respostas adicionais do proprietário. Integrações, revisão técnica/editorial final, relatórios e publicação continuam pendentes.

### ROSI

**F03 — Simulador guiado de investimento em cibersegurança, com exploração do ponto de equilíbrio.** Direção aprovada após pesquisa na web/Firecrawl e revisão independente. Quando houver premissas suficientes, apresentar ROSI, perda esperada de referência/residual, custo e benefício líquido. Quando a eficácia da proteção for desconhecida, permitir calcular a redução mínima de perdas necessária para justificar o custo, desde que exista uma base de perdas válida. Sem essa base, explicar os dados faltantes; não gerar resultado financeiro fictício.

O resultado é condicional às premissas, sem promessa de economia realizada ou diagnóstico da postura de segurança. Não derivar frequência, perda ou eficácia automaticamente de setor, porte ou quantidade de controles. Não recuperar os percentuais fixos do mockup histórico.

Referência matemática: benefício esperado = perda esperada de referência − perda esperada após a proteção; ROSI = (benefício esperado − custo) / custo × 100. Equilíbrio é 0% de ROSI líquido. Com proteção ativa durante todos os 12 meses, redução necessária = custo / perda esperada de referência; para implantação posterior, aplicar F11. Custo e perda devem ser comparáveis no mesmo horizonte. Tratar denominadores zero explicitamente. Entradas e regras escolhidas estão em F04–F18.

Fontes consultadas: [ENISA — ROSI](https://www.enisa.europa.eu/sites/default/files/publications/Return%20On%20Security%20Investment.pdf), [NIST IR 8286A Rev. 1](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8286Ar1.pdf), [FAIR — limites plurianuais](https://www.fairinstitute.org/blog/redefining-rosi-return-on-security-investment). [ToolSec](https://toolsec.net/tools/security-roi-calculator/) e [Advisera](https://advisera.com/27001academy/free-tools/free-return-security-investment-calculator/) são referências de interface/campos, sem aprovação automática de seus modelos ou promessas.

**F04 — Avaliar um novo investimento.** Comparar a operação atual com uma proteção adicional. A referência mantém as proteções existentes; não tratar a empresa como desprotegida. Considerar o custo adicional e a redução adicional de perdas relativos à medida avaliada, em condições comparáveis. Não atribuir ao novo investimento benefícios já proporcionados pelas proteções atuais.

**F05 — Um cenário por simulação.** Avaliar um evento com perda definido e a proteção adicional correspondente. O visitante pode repetir a simulação para outro cenário. Não somar riscos diferentes nem apresentar o resultado como retorno de toda a segurança da empresa. Seleção e exemplos seguem F14.

**F06 — Primeiros 12 meses do investimento.** Comparar os custos adicionais e a redução esperada de perdas nesse mesmo período. Não representar o resultado como avaliação de toda a vida útil da proteção ou de um programa plurianual. Custos seguem F09, prazo até efetividade segue F10 e ajuste do benefício segue F11. Não atribuir benefícios a meses em que a proteção não esteja efetiva.

**F07 — Prejuízo por incidente: valor total com auxiliar opcional.** Permitir informar diretamente o prejuízo estimado do cenário ou usar um auxiliar para compor o total conforme F15. Explicar como evitar contar a mesma perda duas vezes. O total calculado pelo auxiliar substitui a entrada direta; não somar ambos. Valores desconhecidos seguem F13.

**F08 — Frequência: opções simples, valor personalizado e “Não sei”.** Usar rótulos compreensíveis, como “uma vez a cada dois anos”, convertidos em frequência esperada de incidentes com prejuízo por ano. São hipóteses do visitante, não probabilidades ou benchmarks atribuídos à empresa. Permitir frequência personalizada, inclusive superior a uma ocorrência por ano. “Não sei” não equivale a zero nem autoriza preencher uma média automática. Lista exata de opções é proposta editorial abaixo; dados insuficientes seguem F13.

**F09 — Custo adicional: total dos 12 meses com auxiliar opcional.** Permitir informar o custo total ou usar o auxiliar de F16. O total do auxiliar substitui a entrada direta, sem somar ambos. Não diluir implantação por vários anos. Considerar despesas apenas dentro do horizonte aprovado; desconhecidos seguem F13.

**F10 — Informar prazo até a proteção estar efetiva.** Perguntar após quantos meses a proteção estará efetiva, incluindo “imediatamente” e “Não sei”. Não assumir proteção imediata quando o prazo estiver desconhecido. O ajuste ao período ativo segue F11; as propostas de campo/ajuda e os estados estão abaixo; prazo desconhecido segue F13.

**F11 — Ajuste proporcional ao período ativo.** Modelo simples aprovado: perda esperada distribuída uniformemente ao longo do ano e redução constante após a proteção estar efetiva, com essas hipóteses visíveis. Não modelar evolução gradual mês a mês nesta versão. Três meses até efetividade deixam nove meses de benefício no horizonte.

Para prazo conhecido `d >= 0` em meses, perda esperada de referência `L >= 0` nos 12 meses, redução estimada `e` durante a operação efetiva (fração de 0 a 1) e custo adicional total `C >= 0`, todos finitos: fração ativa `f = max(0, 12 − d) / 12`; benefício `B = L × e × f`; perda residual no horizonte `L − B`; benefício líquido `B − C`; ROSI `(B − C) / C × 100` para `C > 0`. Não multiplicar o custo total informado por `f`.

No explorador de equilíbrio, a redução necessária durante o período ativo é `C / (L × f) × 100`, somente com `L × f > 0`. Não limitar silenciosamente valores superiores a 100%: explicar que o equilíbrio não é atingível pela redução das perdas incluídas no cenário, com o custo/prazo informados. Prazo de 12 meses ou mais implica ausência de benefício dentro do horizonte; não dividir por zero. Campos desconhecidos não recebem valores automáticos.

**F12 — Redução esperada: percentual único e “Não sei”.** Pedir um percentual de 0% a 100%, informado pelo visitante, para redução da perda financeira esperada enquanto a proteção estiver efetiva. Não confundir com taxa de bloqueio de ataques nem aplicar o desconto temporal duas vezes. Não pedir percentuais separados de redução de frequência e de prejuízo nesta versão. “Não sei” encaminha ao ponto de equilíbrio quando os demais dados forem suficientes, conforme F03/F11. A ajuda editorial está abaixo; revisar a hipótese não cria um campo obrigatório adicional.

**F13 — Dados insuficientes: orientação e exemplo fictício separado.** Quando faltar prejuízo, frequência, custo ou prazo, explicar o que falta e mostrar somente indicadores calculáveis com os dados disponíveis. Oferecer um exemplo demonstrativo explicitamente fictício, separado das respostas do visitante, e o CTA “Solicitar diagnóstico”. Não substituir respostas por valores demonstrativos nem apresentar resultado fictício como avaliação da empresa. Preservar a distinção entre zero declarado e valor desconhecido. Se faltar apenas a redução esperada, manter o caminho de equilíbrio já aprovado, quando os demais dados forem suficientes.

**F14 — Lista de cenários com descrição personalizada.** Oferecer ransomware com interrupção, comprometimento de contas, vazamento de dados e exploração de falha em aplicação, mais “Outro” para descrever o caso. A escolha orienta as explicações, sem preencher automaticamente perdas, frequência, eficácia ou custos. Mesmo com efeitos relacionados, avaliar apenas o cenário definido pelo visitante e evitar somar prejuízos sobrepostos. Redação das ajudas é proposta editorial abaixo.

**F15 — Auxiliar de prejuízo com quatro grupos monetários.** Pedir valores estimados pelo visitante para: (1) serviços externos de resposta/recuperação; (2) trabalho interno adicional; (3) perda operacional/comercial; (4) outros prejuízos identificados. Somar somente componentes conhecidos e não sobrepostos; se houver componente relevante desconhecido, identificar subtotal incompleto, sem tratá-lo automaticamente como prejuízo total. Explicar que perda comercial não equivale automaticamente a faturamento bruto e que cada prejuízo aparece uma única vez. Não incluir nesta versão um subcalculador de horas, custos por hora ou margens.

**F16 — Auxiliar de custo com quatro grupos monetários.** Pedir valores para: (1) implantação; (2) despesas recorrentes dentro dos primeiros 12 meses; (3) trabalho interno adicional; (4) outros custos adicionais. Usar valores informados pelo visitante, com ajuda para evitar duplicação entre grupos. Não cadastrar nesta versão cada licença, equipamento ou contratação separadamente. Implantação inclui seus custos no horizonte, sem amortização plurianual. Meses de cobrança não são necessariamente iguais aos meses de proteção efetiva; não aplicar automaticamente a fração ativa às despesas. Com componente relevante desconhecido, identificar subtotal incompleto e seguir F13, sem produzir um custo total fictício.

**F17 — Resumo compacto, com edição pelo formulário.** Escolha aprovada: sem gráfico comparativo e sem painel de exploração de premissas. Permitir voltar ao formulário para editar/recalcular. Método e limites continuam acessíveis; manter auxiliares e explicações recolhidos por padrão, em resposta à orientação de simplificar a experiência. Não introduzir cenários alternativos automáticos, gráficos de sensibilidade ou campos extras para uma experiência avançada.

**F18 — Manter ROSI e ponto de equilíbrio em experiência compacta.** Após a proposta de reduzir a versão ao equilíbrio, o usuário escolheu manter ambos. Usar formulário curto, com cenário selecionável e cinco entradas de cálculo: prejuízo por incidente, frequência, custo dos primeiros 12 meses, prazo até efetividade e redução esperada. Auxiliares opcionais e explicações recolhidos por padrão. Resultado compacto conforme F17, sem painel avançado, gráfico ou comparação de propostas. Para ROSI, esta decisão substitui a obrigatoriedade de etapas de F02; as outras ferramentas seguem suas escolhas específicas em F21/F25/F29.

#### ROSI — síntese para o protótipo

- **Valor entregue:** ajudar a avaliar uma proteção adicional sob hipóteses explícitas; mostrar retorno estimado ou redução necessária para justificar seu custo no primeiro ano.
- **Página:** introdução breve, cenário, formulário curto, botão de cálculo, resultado aberto na mesma página; edição pelo formulário. Auxiliares e método acessíveis sem forçar leitura antes de usar.
- **Com redução conhecida e dados suficientes:** resumo do ROSI e benefício líquido; perdas de referência/residual, custo e premissas disponíveis nos detalhes. Não chamar perda esperada evitada de lucro realizado.
- **Sem redução conhecida:** destacar a redução mínima necessária durante o período ativo. Não inventar percentual ROSI, perda residual ou benefício líquido. Exceção aritmética: com prazo conhecido ≥12 meses, o benefício no horizonte é zero independentemente da redução; calcular demais indicadores somente com suas outras entradas necessárias conhecidas. O equilíbrio fica indefinido por ausência de período ativo.
- **Com outros dados insuficientes:** explicar o que falta, apresentar somente indicadores calculáveis e oferecer exemplo fictício separado e diagnóstico. Não transformar campos vazios em zero.
- **Casos limites:** custo zero não permite razão ROSI; perda de referência zero ou período ativo zero não permitem dividir para obter redução necessária. Manter resultados negativos visíveis. Limiar acima de 100% exige explicação, sem truncamento. Resultado não recomenda automaticamente contratar ou dispensar proteção.
- **Complementos:** relatório padrão por tema e CTA de diagnóstico, preservando a independência entre respostas e e-mail. Sem sucesso de envio simulado como serviço real.
- **Técnica:** aritmética no frontend, dados somente em memória; HTML para campos, resultado e ajuda. Efeitos visuais contidos não participam do cálculo nem bloqueiam o uso.

**Entrevista de escopo ROSI concluída em F18.** Moeda, opções exatas de frequência, origem das estimativas, exemplo demonstrativo, copy e composição visual constam abaixo como propostas editoriais, identificadas como tais; não são defaults aprovados por omissão. Não recuperar números históricos nem implementar integrações nesta etapa. Cálculos locais do protótipo seguem as regras deste briefing, sem liberar publicação. O público continua sendo o de operações críticas definido no briefing compartilhado.

As seis decisões finais de ROSI estão em F13–F18; as demais ferramentas também foram concluídas, conforme seções seguintes.

### Shadow AI

**F19 — Checklist com lacunas e próximos passos.** Apresentar uma autoavaliação curta, baseada nas respostas declaradas, sem nota numérica de risco ou índice de controles. Entregar lacunas identificadas e orientações práticas. Não inspecionar sistemas, detectar ferramentas automaticamente ou simular auditoria, probabilidade de incidente ou conformidade legal.

Base de pesquisa para formular perguntas: [NIST AI RMF Core 1.0](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) — políticas, inventário, formação de equipes e terceiros — e [Microsoft: proteção contra vazamento para Shadow AI](https://learn.microsoft.com/en-us/purview/deploymentmodels/depmod-data-leak-shadow-ai-intro) — visibilidade de uso e proteção de dados. São referências de governança e proteção; o checklist Root Trust é uma adaptação educativa, não um checklist oficial/certificado do NIST nem uma exigência de comprar produtos Microsoft.

**F20 — Cinco perguntas curtas com quatro respostas possíveis.** Uma pergunta por tema: (1) regras de uso de IA; (2) visibilidade das ferramentas usadas; (3) proteção de dados sensíveis; (4) avaliação de fornecedores; (5) orientação da equipe. Respostas: “Sim”, “Parcialmente”, “Não” e “Não sei”, sem pré-seleção. Não transformar “Não sei” em ausência comprovada de controle nem “Parcialmente” em prática plenamente estabelecida. Redação e ajudas constam abaixo como propostas editoriais.

**F21 — Checklist em uma página.** Exibir as cinco perguntas na mesma página, com botão “Ver orientações” e resultado logo abaixo. No celular, campos empilhados; não exigir navegação de uma pergunta por etapa. Permitir revisar respostas. Esta escolha substitui a direção inicial de etapas de F02 para Shadow AI. Conteúdo e controles em HTML, independentes do objeto visual.

**F22 — Orientação curta por tema.** Resultado em lista compacta: “Sim” indica prática declarada, sem confirmação independente; “Parcialmente” e “Não” recebem uma ação curta de melhoria; “Não sei” recebe um passo para confirmar a situação. Manter as distinções visíveis em texto, sem depender somente de cores. Não apresentar nota, classificação de risco ou garantia de segurança.

#### Shadow AI — síntese para o protótipo

- **Valor entregue:** ajudar a identificar lacunas declaradas e informações a confirmar no uso de IA, com próximos passos compreensíveis.
- **Página:** introdução breve, cinco perguntas, botão “Ver orientações”, lista de resultados na mesma página e opção de revisar as respostas. Campos empilhados no celular.
- **Interpretação:** uma orientação por tema conforme F22, sem pesos, ranking numérico, porcentagem de exposição ou exigência de dados sobre porte/setor.
- **Todos “Sim”:** reconhecer as práticas declaradas e lembrar que a autoavaliação não verifica sua implementação ou eficácia. Todos “Não sei”: orientar confirmação com responsáveis, sem afirmar ausência de controle.
- **Conteúdo das ações:** redação proposta abaixo, baseada nos temas aprovados e nas referências; sem impor fornecedor, ferramenta de monitoramento ou promessa de adequação legal.
- **Complementos:** método e limites, relatório padrão opcional e CTA de diagnóstico. Respostas somente em memória e separadas do e-mail; nenhuma inspeção de sistemas ou envio real simulado.

**Entrevista de escopo Shadow AI concluída em F22.** Redação exata das perguntas/ajudas/ações e composição visual constam abaixo como propostas identificadas. Preservar simplicidade; não recuperar fórmulas, índices ou percentuais do mockup histórico. Escopo das demais ferramentas nas seções seguintes.

### Dívida técnica

**F23 — Estimativa de custo e orientações.** Estimar o custo do tempo da equipe atribuído à dívida técnica, com poucos dados e explicações simples. O resultado é custo alocado sob as estimativas informadas, não economia garantida ao modernizar, custo de quitar a dívida ou análise do código. Não acrescentar projeção de receita de funcionalidades atrasadas nesta versão.

Referências conceituais: [Martin Fowler — Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html) e [Estimated Interest](https://martinfowler.com/bliki/EstimatedInterest.html) distinguem esforço adicional provocado por limitações do sistema do esforço para removê-las, reconhecendo a incerteza das estimativas; [SEI — identificar itens de dívida técnica](https://www.sei.cmu.edu/library/managing-technical-debt-identify-technical-debt-items/) recomenda identificar itens e consequências. A ferramenta será uma estimativa educativa de alocação de custo proposta pela Root Trust, não um modelo financeiro certificado por essas fontes. Não classificar toda manutenção normal como dívida técnica.

**F24 — Quatro entradas detalhadas.** Pedir quantidade de profissionais, custo médio mensal por profissional, percentual do tempo total dedicado à manutenção e parcela dessa manutenção atribuída à dívida técnica. A última parcela incide sobre a manutenção, não diretamente sobre todo o tempo da equipe. Os dados devem representar a mesma equipe e período. Custo médio deve refletir o custo mensal considerado pelo visitante, com ajuda para incluir encargos/benefícios ou contratação, sem inventar valores.

Modelo de alocação: para quantidade `N`, custo médio mensal `K`, fração de manutenção `m` e fração dessa manutenção atribuída à dívida `q`, custo mensal estimado `D = N × K × m × q`. Frações entre 0 e 1; campos numéricos finitos e não negativos. A ajuda deve distinguir manutenção normal do esforço adicional causado pela dívida. Não usar faixas de equipe como quantidades fictícias, somar percentuais ou converter desconhecidos em zero.

Limite do modelo: aproxima o custo de pessoal associado à parcela de manutenção informada, assumindo alocação de custo proporcional ao tempo estimado. Não mede todo o impacto da dívida sobre novas funcionalidades, terceiros, indisponibilidade ou receita. Não equivale ao valor total da dívida nem ao orçamento necessário para resolvê-la. A distribuição real dos custos/esforços pode diferir da média declarada.

**F25 — Custo mensal e projeção de 12 meses, em experiência compacta.** Formulário curto em uma página, com orientações, resultado compacto e edição pelo próprio formulário; sem gráficos. Mostrar custo mensal `D` e projeção `12 × D`, explicitando que mantém a mesma equipe, custos e percentuais. Não apresentar a projeção como previsão, dívida acumulada ou economia garantida. Esta escolha substitui etapas de F02 para Dívida técnica.

#### Dívida técnica — síntese para o protótipo

- **Valor entregue:** dar ordem de grandeza ao custo de pessoal associado à parcela de manutenção atribuída à dívida técnica, conforme estimativas do visitante.
- **Página:** introdução breve, quatro campos com ajuda, botão de estimativa e resultado aberto abaixo. Permitir revisar os campos; mobile empilhado, sem etapa extra ou painel de exploração.
- **Resultado:** custo mensal, projeção de 12 meses e orientação sobre validar as estimativas e identificar itens concretos de dívida. Método/limites acessíveis, sem score de qualidade ou classificação de gravidade inventados.
- **Dados insuficientes:** não completar percentuais/custos por benchmark nem interpretar desconhecidos como zero; explicar o que falta antes de apresentar valor financeiro. Estados e exemplos abaixo são propostas para revisão.
- **Complementos:** relatório padrão opcional e CTA de diagnóstico; respostas somente em memória e separadas do e-mail. Não pedir repositório, código-fonte ou informações de funcionalidades/receita.

**Entrevista de escopo Dívida técnica concluída em F25.** Copy, ajudas, unidades e exemplos constam abaixo como propostas identificadas. Não recuperar os números fixos ou faixas fictícias do histórico. Escopo de Migração na seção seguinte.

### Migração para nuvem

**F26 — Comparação simples de custos.** Comparar o custo estimado de manter o ambiente atual com o de migrar e operar na nuvem, incluindo a transição. Usar custos informados pelo visitante; não presumir economia, consultar preços automaticamente ou preencher descontos/benchmarks. Não substituir cotação nem emitir recomendação automática de migração. Checklist de prontidão não será o resultado principal desta versão.

Referências para definir escopo: [AWS — detailed business case](https://docs.aws.amazon.com/prescriptive-guidance/latest/application-portfolio-assessment-guide/detailed-business-case.html) considera operação atual/futura, migração, desativação e coexistência; [Microsoft — estimativa de TCO](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/estimate-total-cost-of-ownership) relaciona a estimativa à arquitetura e aos serviços previstos. Usar essas categorias como orientação de cobertura, sem importar percentuais comerciais, escolher provedor ou apresentar a calculadora simplificada como business case completo.

**F27 — Horizonte de 12 ou 36 meses.** Permitir selecionar 12 ou 36 meses, com 12 como padrão. Comparar as alternativas no mesmo horizonte, distinguindo despesas mensais de totais do período. Ao mudar o horizonte, revisar as estimativas e seus rótulos; não triplicar automaticamente custos únicos de migração ou presumir que todos os custos variam linearmente. Entradas totais seguem F28; não apresentar resultado atualizado com totais ainda referentes ao horizonte anterior.

**F28 — Três totais com ajuda opcional.** Pedir, para o horizonte escolhido: (1) custo total de manter o ambiente atual; (2) custo operacional total do cenário com migração, incluindo ambiente antigo durante a transição, coexistência e parte que permanecer local; (3) custos únicos de migrar/desativar ainda não incluídos no item 2. Ajuda opcional explica cobertura e evita contar a mesma despesa duas vezes. Não exigir inventário de cada recurso, licença ou profissional para usar a ferramenta.

Comparação aritmética: custo de manter `A`; operação do cenário com migração `O`; transição adicional `T`; custo de migrar/operar no período `M = O + T`; diferença `A − M`. Todos os valores devem ser finitos, não negativos e comparáveis em moeda, período, escopo de ambiente e requisitos de serviço. Zero declarado é válido; campo desconhecido não equivale a zero. Não calcular comparação financeira se faltar um total necessário.

O item 2 é orçamento de operação do cenário inteiro dentro do horizonte, não apenas a futura fatura mensal do provedor. O item 3 cobre transição adicional não incluída nesse orçamento; não multiplicá-lo pela quantidade de meses. Custos devem vir do visitante ou de cotações/estimativas que ele possua, sem lookup de preços, fatores de economia ou descontos automáticos.

**F29 — Formulário em uma página e resumo compacto.** Mostrar total de manter, total de migrar/operar, diferença monetária e percentual somente quando `A > 0`. Percentual `100 × (A − M) / A`. Mostrar também quando migrar custa mais; permitir editar e recalcular pelo formulário. Sem gráfico, payback automático ou recomendação de compra. Esta decisão substitui as etapas de F02 para Migração.

#### Migração para nuvem — síntese para o protótipo

- **Página:** introdução breve, horizonte de 12/36 meses, três totais com ajuda opcional e resultado aberto abaixo.
- **Resultado:** `A`, `M = O + T`, diferença `A − M` e percentual com base positiva. Diferença positiva indica menor custo estimado de migrar; negativa indica maior custo; zero indica igualdade sob as premissas. Não chamar diferença de economia realizada.
- **Dados insuficientes:** explicar o total ausente, sem comparação inventada. Com `A = 0`, exibir diferença em moeda e indicar que o percentual não tem base de comparação.
- **Limites:** hipóteses informadas pelo visitante, mesmo escopo/nível de serviço, sem taxa de câmbio, preços automáticos, descontos, gráfico ou cálculo de retorno temporal. Totais do período não permitem determinar payback.
- **Complementos:** método, relatório padrão opcional e diagnóstico; nenhum custo/resposta enviado ou associado ao e-mail.

**Entrevista das quatro ferramentas concluída em F29.** Composição, copy e estados detalhados abaixo são propostas para revisão; integrações e liberação de produção continuam pendentes.

## Registro da entrevista

| ID | Pergunta | Resposta aprovada | Data |
|---|---|---|---|
| F01 | Qual intensidade visual nas páginas das ferramentas? | Home com efeitos contidos | 05/10/2026 |
| F02 | Como organizar o preenchimento? | Etapas curtas agrupadas por assunto, com voltar/revisar e resultado aberto na mesma página | 05/10/2026 |
| F03 | Qual abordagem adotar para ROSI após a pesquisa? | Simulador guiado de investimento em cibersegurança; calcular ROSI com dados suficientes e explorar o ponto de equilíbrio quando a eficácia for desconhecida | 05/10/2026 |
| F04 | Qual decisão de investimento o ROSI deve apoiar? | Avaliar um novo investimento: operação atual versus proteção adicional | 05/10/2026 |
| F05 | Quantos cenários entram em cada simulação ROSI? | Um cenário por simulação, com possibilidade de repetir para outro | 05/10/2026 |
| F06 | Qual período o ROSI deve avaliar? | Primeiros 12 meses do investimento, com custos e redução de perdas no mesmo período | 05/10/2026 |
| F07 | Como informar o prejuízo estimado por incidente? | Valor total com auxiliar opcional para compor o prejuízo, evitando contagem duplicada | 05/10/2026 |
| F08 | Como informar a frequência esperada de incidentes com prejuízo? | Opções simples, valor personalizado e “Não sei”, como hipóteses do visitante | 05/10/2026 |
| F09 | Como informar o custo adicional da proteção? | Total dos primeiros 12 meses com auxiliar opcional para implantação, despesas recorrentes e trabalho interno adicional | 05/10/2026 |
| F10 | Como considerar o tempo de implantação da proteção? | Informar prazo até estar efetiva, incluindo “imediatamente” e “Não sei” | 05/10/2026 |
| F11 | Como ajustar o benefício ao período ativo? | Ajuste proporcional: perda esperada uniforme no ano e redução constante após a implantação, com hipóteses visíveis | 05/10/2026 |
| F12 | Como informar a redução esperada das perdas? | Percentual único de 0% a 100% durante a operação efetiva, com “Não sei” para seguir ao ponto de equilíbrio | 05/10/2026 |
| F13 | O que oferecer quando faltarem dados essenciais? | Orientação, indicadores calculáveis, exemplo fictício separado e CTA de diagnóstico; sem substituir as respostas | 05/10/2026 |
| F14 | Como selecionar o cenário? | Lista de quatro exemplos e “Outro” com descrição personalizada; sem preencher premissas financeiras automaticamente | 05/10/2026 |
| F15 | Qual detalhamento deve ter o auxiliar de prejuízo? | Quatro valores monetários: serviços externos, trabalho interno adicional, perda operacional/comercial e outros prejuízos identificados | 05/10/2026 |
| F16 | Qual detalhamento deve ter o auxiliar de custo? | Quatro valores monetários: implantação, despesas recorrentes no período, trabalho interno adicional e outros custos adicionais | 05/10/2026 |
| F17 | Como apresentar e explorar o resultado? | Resumo compacto, sem gráfico ou painel de exploração; edição pelo formulário. Priorizar simplicidade e valor prático | 05/10/2026 |
| F18 | Qual escopo manter após simplificar a experiência? | ROSI e ponto de equilíbrio, com formulário curto, cinco entradas de cálculo e resultado compacto | 05/10/2026 |
| F19 | Qual resultado a ferramenta Shadow AI deve entregar? | Checklist curto com lacunas declaradas e próximos passos, sem nota de risco ou índice | 05/10/2026 |
| F20 | Quais temas e respostas usar no checklist Shadow AI? | Cinco temas: regras, visibilidade, dados sensíveis, fornecedores e orientação; respostas Sim, Parcialmente, Não e Não sei | 05/10/2026 |
| F21 | Como apresentar as perguntas Shadow AI? | Checklist em uma página, botão Ver orientações e resultado logo abaixo; campos empilhados no celular | 05/10/2026 |
| F22 | Como apresentar as orientações Shadow AI? | Lista compacta por tema: prática declarada, ação de melhoria ou passo de confirmação; sem nota, classificação de risco ou garantia | 05/10/2026 |
| F23 | Qual valor entregar na ferramenta Dívida técnica? | Estimativa de custo do tempo atribuído à dívida técnica e orientações, sem promessa de economia ou análise do código | 05/10/2026 |
| F24 | Quais entradas usar na estimativa de dívida técnica? | Quantidade de profissionais, custo médio mensal, tempo em manutenção e parcela dessa manutenção atribuída à dívida | 05/10/2026 |
| F25 | Como apresentar o resultado de dívida técnica? | Formulário em uma página, custo mensal e projeção de 12 meses sob premissas constantes, resultado compacto e orientações, sem gráficos | 05/10/2026 |
| F26 | Qual valor entregar na ferramenta Migração para nuvem? | Comparação de custos estimados entre manter e migrar/operar, incluindo transição e sem presumir economia | 05/10/2026 |
| F27 | Qual período comparar na migração? | 12 ou 36 meses, selecionáveis, com 12 como padrão | 05/10/2026 |
| F28 | Como informar os custos da migração? | Três totais por horizonte: manter, operar o cenário com migração e transição adicional; ajuda opcional, sem contagem duplicada | 05/10/2026 |
| F29 | Como apresentar a comparação de migração? | Formulário em uma página e resumo de totais, diferença em moeda e percentual com base positiva; sem gráfico, payback automático ou recomendação de compra | 05/10/2026 |

Aprovação da direção visual não aprova modelos, números ou fluxos históricos. F18/F21/F25/F29 substituem o preenchimento em etapas de F02, preservando revisão e resultado aberto na mesma página.

## Copy e composição propostas para revisão

As seções seguintes completam a entrega para prototipagem. São propostas editoriais e detalhes operacionais para revisão, sem novas aprovações implícitas do proprietário.

### Composição e leitura — proposta visual

Usar uma estrutura compartilhada: cabeçalho/assinatura oficial → voltar às ferramentas → introdução curta com ícone do tema → formulário → resultado → método/limites → relatório padrão opcional → diagnóstico → rodapé. As rotas estão em [conteúdo](product.md). O hub de ferramentas está adiado e não é uma rota desta entrega.

Propor fundo escuro `#171717`, painéis `#1D1D1D`, contornos `#3C3C3C`, textos Superfície e acentos da paleta aprovada da Home. Baloo 2 nos títulos, Archivo nos campos/textos; não redesenhar assinatura nem trocar por texto HTML. A transferência dos tokens UI para estas internas decorre de F01; não constitui mudança do manual oficial. Não usar variáveis legadas de `_ds` como novas cores de marca.

Introdução menor que o hero da Home; conteúdo central, sem coluna visual gigante ao lado do formulário. Objeto hachurado do tema em escala contida, preferencialmente com reuso do código existente. Não adicionar hero ASCII, múltiplos grafismos, partículas, pinning ou animações contínuas dentro dos campos. Esta posição/intensidade ainda será revisada pelo proprietário. Se o objeto não puder ser carregado, manter ilustração estática ou omitir a decoração, sem perder conteúdo.

Desktop permite dois campos relacionados por linha; mobile empilha tudo. A ordem de leitura é formulário → resultado, inclusive no desktop. Testar 1440px e 390px, além de reflow a 320px e zoom; esses tamanhos são referências de revisão, não certificação. Campos têm label, unidade, ajuda e erro; resultado não depende de Canvas, hover ou cor. Fonte de foco visível, radio groups acessíveis e ajudas expansíveis operáveis por teclado. Sem sidebars de premissas, gráficos ou wizard.

Animação decorativa, se mantida, exige pausa acessível, preferência de movimento reduzido dinâmica, suspensão em aba oculta e descarte de recursos. Não introduzir arrasto necessário ou gestos que bloqueiem scroll. Um objeto estático é aceitável durante a primeira avaliação do formulário; acabamento reativo vem depois da revisão visual.

### Redação, campos e ajuda — propostas editoriais

Valores monetários em **R$ (BRL)** e formatação pt-BR são proposta para esta versão, sem conversão de moeda. Todos os custos/perdas de uma comparação precisam usar a mesma moeda. Entradas reais começam vazias; nenhuma estimativa é preenchida por setor ou porte. Não pedir dados confidenciais, anexos de incidentes, repositório, empresa ou telefone para calcular. Identificação comercial só aparece na jornada independente de diagnóstico.

| Página | H1 proposto | Descrição proposta | Ação proposta |
|---|---|---|---|
| ROSI | Explore o retorno de uma proteção adicional. | Simule um cenário nos primeiros 12 meses, com suas estimativas de perdas, custos e redução esperada. | Calcular cenário |
| Shadow AI | Organize a governança do uso de IA. | Responda a cinco perguntas para identificar práticas declaradas, lacunas e informações a confirmar. | Ver orientações — aprovado em F21 |
| Dívida técnica | Estime o custo do tempo atribuído à dívida técnica. | Relacione equipe, custo e esforço de manutenção. A estimativa não mede o valor total da dívida. | Estimar custo |
| Migração | Compare os custos de manter ou migrar. | Informe totais comparáveis de operação e transição. Migrar pode custar mais. | Comparar custos |

#### ROSI: formulário curto

Cenário: ransomware com interrupção; comprometimento de contas; vazamento de dados; exploração de falha em aplicação; Outro (descrição breve, sem detalhes sensíveis).

| Entrada | Unidade e ajuda proposta |
|---|---|
| Prejuízo estimado por incidente | R$ por incidente com prejuízo no cenário escolhido. Estimar efeitos não sobrepostos; perda comercial não é automaticamente receita bruta. Auxiliar opcional F15 substitui o total direto. |
| Frequência esperada | Incidentes com prejuízo/ano. Propor opções “Uma vez a cada 5 anos” (0,2), “Uma vez a cada 2 anos” (0,5), “Uma vez por ano” (1), “Duas vezes por ano” (2), “Personalizar” e “Não sei”. A lista é editorial; as frequências são hipóteses do visitante, não benchmarks. Não contar tentativas bloqueadas como incidentes com prejuízo. |
| Custo adicional nos primeiros 12 meses | R$ no período. Inclui implantação e operação incremental; exclui custos já pagos na referência. Auxiliar F16 substitui o total direto. |
| Meses até a proteção estar efetiva | Meses desde o início do investimento. Imediatamente = 0; permitir valor personalizado não negativo e “Não sei”. Prazo ≥12 significa nenhum período ativo dentro do horizonte. |
| Redução esperada das perdas | 0–100%, durante o período ativo, ou “Não sei”. Não é percentual de ataques bloqueados. Use evidência própria ou hipótese explícita; não pedir um campo obrigatório adicional sobre origem. |

“Não sei” disponível para valores essenciais; vazio não é zero. Prejuízo por incidente × frequência = `L`, perda financeira esperada de referência nos 12 meses, mantendo os controles atuais. Fórmulas completas e hipóteses em F11. Auxiliares começam recolhidos e só transferem total completo com ação explícita; um subtotal incompleto não substitui a entrada principal. Não somar valor direto e auxiliar nem misturar dois métodos sem aviso.

Resultado principal compacto: ROSI estimado, benefício líquido esperado e ponto de equilíbrio quando calculáveis. No próprio bloco, uma explicação curta: “Este resultado depende das estimativas informadas; não representa economia realizada.” Perda de referência/residual, benefício esperado bruto, custo e hipóteses podem ficar em detalhe recolhido. ROSI 0% é equilíbrio; 100% significa benefício bruto duas vezes o custo, não lucro comprovado.

Se só faltar redução, apresentar equilíbrio. Se faltarem outras entradas, mostrar o que é calculável e o dado ausente. Com custo zero, razão ROSI não definida, ainda que benefício seja calculável; com perda/período ativo zero, redução de equilíbrio não definida. Quando prazo conhecido ≥12, benefício no horizonte é zero independentemente da redução; só mostrar perda residual/net/ROSI se as outras entradas necessárias forem conhecidas. Não inventar perda de referência. Limiar >100%: “A redução necessária excede as perdas incluídas neste cenário. Com estas premissas, essa redução não cobre o custo no período.” Manter retorno negativo; não recomendar contratar/dispensar controle automaticamente.

#### Shadow AI: perguntas e ações propostas

Uma resposta por pergunta: Sim, Parcialmente, Não ou Não sei, sem pré-seleção. As ajudas esclarecem o que está sendo declarado, sem transformar um “Sim” em controle verificado.

| Tema | Pergunta proposta | Ação de melhoria proposta (Parcialmente/Não) | Confirmação proposta (Não sei) |
|---|---|---|---|
| Regras | Existem regras conhecidas para o uso de IA no trabalho? | Definir ou completar usos permitidos, limites e responsáveis; comunicar as regras. | Confirmar com o responsável se há regra vigente e como encontrá-la. |
| Visibilidade | A organização conhece as ferramentas de IA utilizadas pela equipe? | Organizar e manter um inventário de ferramentas e usos declarados. | Consultar responsáveis e usuários para identificar o que já está mapeado. |
| Dados sensíveis | Existem orientações e controles para evitar envio indevido de dados sensíveis à IA? | Definir dados permitidos, restrições de compartilhamento e meios de aplicá-las. | Confirmar quais dados podem ser enviados e quais controles existem. |
| Fornecedores | Ferramentas/fornecedores de IA são avaliados antes de adoção? | Avaliar tratamento de dados, retenção, acessos e condições antes de aprovar usos. | Identificar quem aprova fornecedores e quais verificações realiza. |
| Equipe | A equipe recebe orientação prática sobre uso responsável de IA? | Preparar orientação sobre regras, dados, conferência de saídas e canal de dúvidas. | Confirmar treinamento/orientações disponíveis e quem os mantém. |

Para “Sim”, mostrar o tema e “Prática declarada — implementação e eficácia não verificadas”, sugerindo manter a prática revisada. Para “Parcialmente”, indicar cobertura parcial; para “Não”, prática não declarada; para “Não sei”, informação a confirmar. As ações semelhantes não apagam a diferença entre respostas. Nunca emitir baixo/médio/alto risco, pontuação, percentual, selo, auditoria ou declaração de conformidade. Quando faltar resposta, apontar a pergunta incompleta antes de produzir a lista completa.

#### Dívida técnica: campos e interpretação propostos

Quatro campos: “Profissionais na equipe” (quantidade); “Custo médio mensal por profissional” (R$/mês); “Tempo total dedicado à manutenção” (%); “Parcela dessa manutenção atribuída à dívida técnica” (%). O último percentual incide sobre a manutenção. Ajuda: retrabalho/esforço extra devido a limitações técnicas não é toda manutenção necessária ao funcionamento do sistema. Incluir encargos/benefícios ou custo contratado conforme a base informada; usar a mesma equipe e período.

Modelo `D = N × K × m × q`; percentuais convertidos uma vez em frações. Resultado: “Custo mensal estimado” e “Projeção de 12 meses”, com ressalva “Mantendo equipe, custo e percentuais informados”. Orientação proposta: validar a alocação e identificar itens concretos de dívida antes de priorizar uma intervenção. Não declarar economia, principal da dívida, orçamento de modernização ou saúde do código.

Valores essenciais desconhecidos/vazios impedem número financeiro. Zero explícito em custo/percentuais pode gerar zero aritmético, com ressalva: não comprova ausência de dívida. Propor quantidade inteira positiva de profissionais para este formulário simples; equipe zero indica cenário não aplicável. Essa validação de interface é proposta, não aprovação de um modelo para equipes em equivalentes de tempo integral.

#### Migração: campos e interpretação propostos

Horizonte: 12/36 meses, padrão 12 aprovado. Três entradas em R$ **totais do horizonte**: “Manter o ambiente atual”; “Operar o cenário com migração”; “Transição adicional”. Ajuda opcional F28 detalha categorias, sem criar inventário obrigatório nem subcalculador de faturas.

Mostrar “Total para manter”, “Total para migrar e operar” e “Diferença estimada”. Se `A − M > 0`: “Migrar e operar custa R$ X a menos nas premissas informadas”; se negativa: “custa R$ X a mais”; se zero: “Totais iguais nas premissas informadas”. Percentual acompanha “a menos/a mais” com base explícita no custo de manter. Com base zero, “Comparação percentual indisponível: o custo de manter informado é zero.” Não exibir infinito ou economia percentual de 100% por default.

Alterar 12↔36 invalida o resultado e solicita revisar/reconfirmar os três totais antes de comparar; não recalcular com números do horizonte anterior. Totais zero declarados são válidos; nenhum campo ausente vira zero. Comparação exige escopo e nível de serviço equivalentes; só custos não decidem segurança, desempenho, restrições ou benefício estratégico.

### Estados e dados — requisitos para a demonstração

Protótipo deve calcular com entradas reais **localmente** quando o formato permitir JavaScript; separar isso de envio real, ainda indisponível. Não repetir os mockups históricos com resultados fixos. Identificar “Protótipo — cálculos locais; formulários de envio indisponíveis”. Exemplos financeiros são fictícios e não representam organização, benchmark ou promessa da Root Trust.

| Estado | Comportamento |
|---|---|
| Inicial | Campos vazios; horizonte de migração 12 meses; sem resultado numérico ou resposta pré-selecionada. |
| Inválido | Identificar campo/unidade/formato e preservar demais entradas; não calcular com NaN, infinito, negativos ou percentuais fora de 0–100. |
| Insuficiente | Desconhecido não é zero; orientar conforme ferramenta. Em ROSI, indicadores parciais somente com dependências suficientes. |
| Calculado | Resultado compacto após ação explícita, associado às premissas utilizadas; sem spinner/espera artificial. |
| Edição | Indicar que o resultado anterior está desatualizado e exigir recalcular; não manter número antigo como atual. |
| Limpar | Remover respostas, auxiliares, erros e resultado da memória; retornar ao estado inicial. |
| Exemplo ROSI | Abrir demonstração fictícia separada, conforme F13; não preencher/substituir silenciosamente o formulário real. |
| Falha | Mensagem útil; manter dados conhecidos e permitir corrigir/reiniciar. Falha de decoração não impede cálculo. |
| Relatório indisponível | Explicar que não há envio no protótipo; não coletar e-mail real nem mostrar confirmação de recebimento. |

Aceitar valores decimais compatíveis com pt-BR e exibir moeda com formatação local; parsing inválido gera erro explícito. Tratar overflow numérico como erro, nunca como resultado. Não adicionar tetos de orçamento/frequência arbitrários. A validação acima não substitui revisão da implementação.

Respostas em memória da ferramenta: sem localStorage, sessionStorage, banco, URL/query, analytics, logs ou transmissão. Limpar ao encerrar a sessão da ferramenta; ao restaurar a página pelo histórico/cache de navegação, não recuperar respostas encerradas. Não transmitir resultados ou respostas ao diagnóstico/relatório. O visitante pode explicar seu contexto por iniciativa própria na conversa comercial, fora destes cálculos.

### Relatório, método e diagnóstico

Proposta de título: “Receba o relatório de [tema]”. Descrição: “Material padrão sobre o tema, conceitos e próximos passos gerais. Não é personalizado a partir das suas respostas.” O nome **relatório** foi escolhido pelo proprietário; não substituí-lo por “guia”. Em produção, pedir somente o e-mail necessário ao envio, sem respostas anexadas; informar que newsletter é independente. No protótipo, apresentar o estado indisponível sem coletar cadastro real. Material, envio, retenção e confirmação aguardam definição.

“Como chegamos a este resultado” contém fórmulas/regras, unidades, premissas, fontes e limites por ferramenta. Proposta: detalhe recolhido por padrão, com resumo de limites próximo ao resultado, nunca escondido atrás de inscrição. No Shadow AI, explicar associação direta entre resposta declarada e orientação, sem ponderação. As fontes sustentam conceitos; os modelos simples de dívida/migração, a adaptação temporal ROSI e as frases do checklist são escolhas deste briefing, não modelos certificados pelas instituições citadas.

CTA: **Solicitar diagnóstico**. Oferece conversa inicial gratuita de qualificação; não é auditoria, agenda automática ou promessa de relatório personalizado. Regra comercial aprovada: Nome, Empresa e WhatsApp obrigatórios; retorno por ligação ou WhatsApp no próximo dia útil. Não há rota dedicada de diagnóstico nesta entrega; o CTA leva ao `#contato` da Home. No modo demo, identificar que nenhum dado é enviado. Não apontar silenciosamente para o topo nem inventar endpoint.

### Exemplos reproduzíveis para conferir o protótipo

**Dados próprios e fictícios para verificação, não benchmarks.** Nunca carregar como respostas iniciais do visitante. São critérios de revisão do protótipo; não foi implementada/testada uma aplicação de ferramentas neste repositório.

| Ferramenta | Entradas | Resultado esperado |
|---|---|---|
| ROSI — imediato | Prejuízo R$200.000; frequência 0,5/ano; custo R$30.000; prazo 0; redução 60% | `L=100.000`, `B=60.000`, residual 40.000, líquido 30.000; ROSI 100%; equilíbrio 30% |
| ROSI — três meses | Mesmas premissas, prazo 3 | `f=0,75`, `B=45.000`, líquido 15.000; ROSI 50%; equilíbrio 40% |
| ROSI — sem redução | Mesmas premissas, prazo 3; redução desconhecida | Equilíbrio 40%; sem benefício/residual/ROSI inventados |
| ROSI — prazo 12 | Mesmas premissas conhecidas, prazo 12 | Benefício 0, residual 100.000, líquido −30.000; ROSI −100%; equilíbrio não calculável |
| ROSI — custo zero | Mesmas premissas, prazo 0, custo 0 | Benefício 60.000, líquido 60.000; ROSI não definido; equilíbrio 0% com `L × f > 0` |
| ROSI — limiar acima de 100% | `L=100.000`, custo 90.000, prazo 3; redução desconhecida | Equilíbrio 120%, não truncado; explicar limite do cenário |
| ROSI — desconhecidos | Prejuízo ou frequência desconhecidos | Não inventar `L`, benefício ou razão ROSI; orientar dado ausente |
| Shadow AI | Sim / Parcialmente / Não / Não sei / Sim | Cinco orientações respeitando as distinções; nenhuma nota ou classificação de risco |
| Dívida técnica | 4 pessoas; R$10.000/mês por pessoa; manutenção 30%; dívida 50% da manutenção | R$6.000/mês; projeção R$72.000/12 meses, com premissas constantes |
| Migração — custa mais | 12 meses; `A=120.000`, `O=96.000`, `T=30.000` | `M=126.000`; diferença −6.000; migração 5% mais cara na comparação |
| Migração — base zero | `A=0`, `O=10.000`, `T=2.000` | Total migrar 12.000; custa 12.000 a mais; percentual indisponível |
| Migração — trocar horizonte | Resultado calculado em 12; selecionar 36 | Invalidar resultado e solicitar revisão dos totais; não triplicar automaticamente |

Também conferir percentuais 0/100, valor negativo, campo vazio, excesso numérico, custo desconhecido, auxílio com subtotal incompleto e alteração de dados após resultado. No Shadow AI: cinco “Sim” não comprovam segurança; cinco “Não sei” não comprovam falta de controle.




### Rechecagem documental final — 11/10/2026

**Histórico, superado pelos gates P8.3 (ver [development.md](development.md)):** rechecagem após documentação: lint/tipos/101 unit/build passaram; E2E completo teve 227 passes, quatro skips e uma falha ao observar o estado transitório “Enviando…” do contato. O mesmo teste passou 3/3 na repetição isolada, sem alteração de código/teste. Instabilidade de observação registrada, causa não comprovada; não equivale a uma nova rodada completa verde. Logs na auditoria final.
