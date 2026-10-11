import type { PillarKind } from "@/features/graphics/PillarArt";

export interface ToolContent {
  id: "rosi" | "shadow-ai" | "divida-tecnica" | "migracao-para-nuvem";
  slug: string;
  label: string;
  kind: PillarKind;
  metaTitle: string;
  metaDescription: string;
  h1: readonly [string, string];
  lead: string;
  reportTopic: string;
  formulas: readonly string[];
  hypotheses: readonly string[];
  limits: readonly string[];
  sources: readonly { label: string; href: string }[];
}

export const tools: Record<ToolContent["id"], ToolContent> = {
  rosi: {
    id: "rosi", slug: "rosi", label: "ROSI", kind: "balanca",
    metaTitle: "ROSI: retorno de uma proteção adicional",
    metaDescription: "Simule localmente um cenário nos primeiros 12 meses, com suas estimativas de perdas, custos e redução esperada.",
    h1: ["Explore o retorno de", "uma proteção adicional."],
    lead: "Simule um cenário nos primeiros 12 meses, com suas estimativas de perdas, custos e redução esperada.",
    reportTopic: "retorno sobre investimento em segurança",
    formulas: [
      "Perda esperada de referência: L = prejuízo por incidente × frequência por ano (12 meses, com as proteções atuais).",
      "Fração do ano com proteção efetiva: f = máx(0; 12 − d) ÷ 12, sendo d os meses até a proteção estar efetiva.",
      "Benefício esperado: B = L × e × f, sendo e a redução esperada.",
      "Benefício líquido: B − C, sendo C o custo adicional total dos 12 meses.",
      "ROSI: 100 × (B − C) ÷ C, somente se C > 0.",
      "Redução de equilíbrio: 100 × C ÷ (L × f), somente se L × f > 0. Valores acima de 100% não são truncados.",
    ],
    hypotheses: [
      "A referência mantém as proteções atuais; só a proteção adicional é avaliada.",
      "A perda esperada se distribui uniformemente no ano e a redução é constante depois que a proteção está efetiva.",
      "Frequência e redução são hipóteses suas, não benchmarks nem probabilidades atribuídas à sua empresa.",
      "O custo informado não é multiplicado pela fração ativa.",
    ],
    limits: [
      "Este resultado depende das estimativas informadas; não representa economia realizada.",
      "Avalia um cenário por simulação, nos primeiros 12 meses; não soma riscos diferentes nem mede toda a vida útil da proteção.",
      "Não recomenda contratar ou dispensar uma proteção.",
    ],
    sources: [
      { label: "ENISA — Return on Security Investment", href: "https://www.enisa.europa.eu/sites/default/files/publications/Return%20On%20Security%20Investment.pdf" },
      { label: "NIST IR 8286A Rev. 1", href: "https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8286Ar1.pdf" },
      { label: "FAIR — limites plurianuais do ROSI", href: "https://www.fairinstitute.org/blog/redefining-rosi-return-on-security-investment" },
    ],
  },
  "shadow-ai": {
    id: "shadow-ai", slug: "shadow-ai", label: "Shadow AI", kind: "olho",
    metaTitle: "Shadow AI: governança do uso de IA",
    metaDescription: "Responda a cinco perguntas para identificar práticas declaradas, lacunas e informações a confirmar sobre o uso de IA.",
    h1: ["Organize a governança", "do uso de IA."],
    lead: "Responda a cinco perguntas para identificar práticas declaradas, lacunas e informações a confirmar.",
    reportTopic: "governança do uso de IA",
    formulas: ["Cada resposta declarada corresponde diretamente a uma orientação: Sim → manter e revisar; Parcialmente ou Não → ação de melhoria; Não sei → passo de confirmação."],
    hypotheses: ["As respostas são autodeclaradas. Nada é inspecionado e nenhuma ferramenta é detectada automaticamente."],
    limits: [
      "Sem nota, pontuação, percentual, classificação de risco, selo ou declaração de conformidade.",
      "Cinco “Sim” não comprovam segurança; cinco “Não sei” não comprovam falta de controle.",
      "Adaptação educativa da Root Trust; não é um checklist oficial do NIST nem exige produtos Microsoft.",
    ],
    sources: [
      { label: "NIST AI RMF Core 1.0", href: "https://airc.nist.gov/airmf-resources/airmf/5-sec-core/" },
      { label: "Microsoft — proteção contra vazamento para Shadow AI", href: "https://learn.microsoft.com/en-us/purview/deploymentmodels/depmod-data-leak-shadow-ai-intro" },
    ],
  },
  "divida-tecnica": {
    id: "divida-tecnica", slug: "divida-tecnica", label: "Dívida técnica", kind: "engrenagem",
    metaTitle: "Dívida técnica: custo do tempo atribuído",
    metaDescription: "Relacione equipe, custo e esforço de manutenção para estimar o custo mensal e a projeção de 12 meses atribuídos à dívida técnica.",
    h1: ["Estime o custo do tempo", "atribuído à dívida técnica."],
    lead: "Relacione equipe, custo e esforço de manutenção. A estimativa não mede o valor total da dívida.",
    reportTopic: "dívida técnica",
    formulas: [
      "Custo mensal estimado: D = N × K × m × q, sendo N profissionais, K custo médio mensal, m fração do tempo em manutenção e q fração dessa manutenção atribuída à dívida.",
      "Projeção de 12 meses: 12 × D, mantendo equipe, custo e percentuais informados.",
    ],
    hypotheses: [
      "Os dados representam a mesma equipe e o mesmo período.",
      "O percentual atribuído à dívida incide sobre a manutenção, não sobre todo o tempo da equipe.",
      "O custo é alocado proporcionalmente ao tempo estimado.",
    ],
    limits: [
      "Resultado é custo alocado sob as estimativas informadas; não é economia garantida, custo de quitar a dívida nem análise do código.",
      "Não mede impacto sobre novas funcionalidades, terceiros, indisponibilidade ou receita.",
      "Manutenção normal não é, por si só, dívida técnica. A projeção não é uma previsão.",
    ],
    sources: [
      { label: "Martin Fowler — Technical Debt", href: "https://martinfowler.com/bliki/TechnicalDebt.html" },
      { label: "Martin Fowler — Estimated Interest", href: "https://martinfowler.com/bliki/EstimatedInterest.html" },
      { label: "SEI — identificar itens de dívida técnica", href: "https://www.sei.cmu.edu/library/managing-technical-debt-identify-technical-debt-items/" },
    ],
  },
  "migracao-para-nuvem": {
    id: "migracao-para-nuvem", slug: "migracao-para-nuvem", label: "Migração para nuvem", kind: "nuvem",
    metaTitle: "Migração para nuvem: comparação de custos",
    metaDescription: "Compare totais informados de manter o ambiente atual ou migrar e operar na nuvem, em 12 ou 36 meses.",
    h1: ["Compare os custos de", "manter ou migrar."],
    lead: "Informe totais comparáveis de operação e transição. Migrar pode custar mais.",
    reportTopic: "migração para nuvem",
    formulas: [
      "Migrar e operar no período: M = O + T, sendo O a operação do cenário com migração e T a transição adicional.",
      "Diferença estimada: A − M, sendo A o custo de manter o ambiente atual.",
      "Percentual: 100 × (A − M) ÷ A, somente se A > 0.",
    ],
    hypotheses: [
      "Todos os totais são seus, em R$, para o mesmo horizonte, escopo de ambiente e nível de serviço.",
      "A transição adicional (T) não é multiplicada pelo horizonte, e nada é recalculado linearmente ao trocar 12 por 36 meses.",
    ],
    limits: [
      "Diferença positiva indica menor custo estimado ao migrar; negativa, maior custo. Não é economia realizada.",
      "Sem preços automáticos, descontos, câmbio, payback, gráfico ou recomendação. Não substitui cotação nem business case.",
      "Custos não decidem sozinhos segurança, desempenho, restrições ou benefício estratégico.",
    ],
    sources: [
      { label: "AWS — detailed business case", href: "https://docs.aws.amazon.com/prescriptive-guidance/latest/application-portfolio-assessment-guide/detailed-business-case.html" },
      { label: "Microsoft — estimativa de TCO", href: "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/estimate-total-cost-of-ownership" },
    ],
  },
};
