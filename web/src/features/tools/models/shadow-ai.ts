import { modelError } from "./numbers";
import type { ModelError, ModelOutcome } from "./numbers";

export const SHADOW_ANSWERS = ["sim", "parcialmente", "nao", "nao-sei"] as const;
export type ShadowAnswer = (typeof SHADOW_ANSWERS)[number];
export const SHADOW_ANSWER_LABELS: Record<ShadowAnswer, string> = { sim: "Sim", parcialmente: "Parcialmente", nao: "Não", "nao-sei": "Não sei" };

export const SHADOW_QUESTIONS = [
  { id: "regras", theme: "Regras", question: "Existem regras conhecidas para o uso de IA no trabalho?", improvement: "Definir ou completar usos permitidos, limites e responsáveis; comunicar as regras.", confirmation: "Confirmar com o responsável se há regra vigente e como encontrá-la." },
  { id: "visibilidade", theme: "Visibilidade", question: "A organização conhece as ferramentas de IA utilizadas pela equipe?", improvement: "Organizar e manter um inventário de ferramentas e usos declarados.", confirmation: "Consultar responsáveis e usuários para identificar o que já está mapeado." },
  { id: "dados", theme: "Dados sensíveis", question: "Existem orientações e controles para evitar envio indevido de dados sensíveis à IA?", improvement: "Definir dados permitidos, restrições de compartilhamento e meios de aplicá-las.", confirmation: "Confirmar quais dados podem ser enviados e quais controles existem." },
  { id: "fornecedores", theme: "Fornecedores", question: "Ferramentas/fornecedores de IA são avaliados antes de adoção?", improvement: "Avaliar tratamento de dados, retenção, acessos e condições antes de aprovar usos.", confirmation: "Identificar quem aprova fornecedores e quais verificações realiza." },
  { id: "equipe", theme: "Equipe", question: "A equipe recebe orientação prática sobre uso responsável de IA?", improvement: "Preparar orientação sobre regras, dados, conferência de saídas e canal de dúvidas.", confirmation: "Confirmar treinamento/orientações disponíveis e quem os mantém." },
] as const;

export type ShadowQuestionId = (typeof SHADOW_QUESTIONS)[number]["id"];
/** Ausente/`undefined` = sem resposta; nunca há pré-seleção. */
export type ShadowAnswers = Partial<Record<ShadowQuestionId, ShadowAnswer | undefined>>;

export type ShadowStatus = "declared" | "partial" | "not-declared" | "to-confirm";

export interface ShadowGuidance {
  id: ShadowQuestionId;
  theme: string;
  answer: ShadowAnswer;
  status: ShadowStatus;
  /** Rótulo textual da distinção (não depende de cor). */
  statusLabel: string;
  /** Ação de melhoria, passo de confirmação ou lembrete de revisão. */
  action: string;
}

export type ShadowResult =
  | { complete: false; pending: ShadowQuestionId[] }
  | { complete: true; items: ShadowGuidance[]; allDeclared: boolean; allUnknown: boolean };

const isAnswer = (v: unknown): v is ShadowAnswer => typeof v === "string" && (SHADOW_ANSWERS as readonly string[]).includes(v);

/** Associação direta resposta → orientação, sem pesos, score, percentual ou classificação de risco. "Não sei" nunca vira "Não". */
export function evaluateShadowAi(answers: ShadowAnswers): ModelOutcome<ShadowResult> {
  const errors: ModelError[] = [];
  for (const q of SHADOW_QUESTIONS) {
    const a = answers[q.id];
    if (a !== undefined && !isAnswer(a)) errors.push(modelError(q.id, "invalid_choice"));
  }
  if (errors.length > 0) return { ok: false, errors };

  const pending = SHADOW_QUESTIONS.filter((q) => answers[q.id] === undefined).map((q) => q.id);
  if (pending.length > 0) return { ok: true, result: { complete: false, pending } };

  const items = SHADOW_QUESTIONS.map((q): ShadowGuidance => {
    const answer = answers[q.id] as ShadowAnswer;
    switch (answer) {
      case "sim":
        return { id: q.id, theme: q.theme, answer, status: "declared", statusLabel: "Prática declarada — implementação e eficácia não verificadas", action: "Manter a prática revisada periodicamente." };
      case "parcialmente":
        return { id: q.id, theme: q.theme, answer, status: "partial", statusLabel: "Cobertura parcial declarada", action: q.improvement };
      case "nao":
        return { id: q.id, theme: q.theme, answer, status: "not-declared", statusLabel: "Prática não declarada", action: q.improvement };
      case "nao-sei":
        return { id: q.id, theme: q.theme, answer, status: "to-confirm", statusLabel: "Informação a confirmar", action: q.confirmation };
    }
  });
  return {
    ok: true,
    result: { complete: true, items, allDeclared: items.every((i) => i.status === "declared"), allUnknown: items.every((i) => i.status === "to-confirm") },
  };
}
