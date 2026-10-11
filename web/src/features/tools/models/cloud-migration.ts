import { add, checkValue, div, inputState, mul, sub } from "./numbers";
import type { Input, MissingInput, ModelError, ModelOutcome } from "./numbers";

export type MigrationHorizon = 12 | 36;
export const MIGRATION_HORIZONS: readonly MigrationHorizon[] = [12, 36];
export const DEFAULT_MIGRATION_HORIZON: MigrationHorizon = 12;

export interface MigrationInputs {
  horizon: MigrationHorizon;
  /** Horizonte ao qual os três totais foram informados/confirmados; se diferir de `horizon`, exige revisão. */
  totalsHorizon: MigrationHorizon;
  /** A — R$ totais para manter o ambiente atual no horizonte. */
  keep: Input;
  /** O — R$ totais de operação do cenário com migração (inclui coexistência e parte local). */
  operate: Input;
  /** T — R$ de transição adicional não incluída em O (nunca multiplicado pelo horizonte). */
  transition: Input;
}

/** Troca o horizonte sem tocar nos totais: o resultado fica em `review-required` até `confirmTotals`. */
export const changeHorizon = (input: MigrationInputs, horizon: MigrationHorizon): MigrationInputs => ({ ...input, horizon });
export const confirmTotals = (input: MigrationInputs): MigrationInputs => ({ ...input, totalsHorizon: input.horizon });

export type MigrationResult =
  | { status: "review-required"; horizon: MigrationHorizon; totalsHorizon: MigrationHorizon }
  | { status: "insufficient"; missing: MissingInput[] }
  | { status: "overflow" }
  | {
      status: "value";
      horizon: MigrationHorizon;
      keep: number;
      /** M = O + T. */
      migrate: number;
      /** A − M: positiva = migrar custa menos; negativa = custa mais. */
      difference: number;
      direction: "cheaper" | "costlier" | "equal";
      /** 100 × (A − M) / A, com sinal preservado; indefinido quando A = 0. */
      percent: { status: "value"; value: number } | { status: "undefined"; reason: "zero_base" } | { status: "overflow" };
    };

/** Comparação aritmética de totais informados (F26–F29); sem preços, descontos, payback ou recomendação. */
export function evaluateMigration(input: MigrationInputs): ModelOutcome<MigrationResult> {
  const errors: ModelError[] = [];
  if (!MIGRATION_HORIZONS.includes(input.horizon)) errors.push({ field: "horizon", code: "invalid_choice", message: "Escolha 12 ou 36 meses." });
  if (!MIGRATION_HORIZONS.includes(input.totalsHorizon)) errors.push({ field: "totalsHorizon", code: "invalid_choice", message: "Escolha 12 ou 36 meses." });
  for (const e of [checkValue("keep", input.keep), checkValue("operate", input.operate), checkValue("transition", input.transition)]) if (e) errors.push(e);
  if (errors.length > 0) return { ok: false, errors };

  if (input.horizon !== input.totalsHorizon) {
    return { ok: true, result: { status: "review-required", horizon: input.horizon, totalsHorizon: input.totalsHorizon } };
  }

  const missing: MissingInput[] = [];
  for (const [field, v] of [["keep", input.keep], ["operate", input.operate], ["transition", input.transition]] as [string, Input][]) {
    const state = inputState(v);
    if (state !== "value") missing.push({ field, state });
  }
  if (missing.length > 0) return { ok: true, result: { status: "insufficient", missing } };

  const a = input.keep as number;
  const migrate = add(input.operate as number, input.transition as number);
  const difference = migrate === null ? null : sub(a, migrate);
  if (migrate === null || difference === null) return { ok: true, result: { status: "overflow" } };

  let percent: Extract<MigrationResult, { status: "value" }>["percent"];
  if (a === 0) percent = { status: "undefined", reason: "zero_base" };
  else {
    const ratio = div(difference, a);
    const p = ratio === null ? null : mul(ratio, 100);
    percent = p === null ? { status: "overflow" } : { status: "value", value: p };
  }
  return {
    ok: true,
    result: { status: "value", horizon: input.horizon, keep: a, migrate, difference, direction: difference > 0 ? "cheaper" : difference < 0 ? "costlier" : "equal", percent },
  };
}
