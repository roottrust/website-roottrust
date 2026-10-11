import { checkValue, inputState, mul } from "./numbers";
import type { Input, MissingInput, ModelError, ModelOutcome } from "./numbers";

export interface TechDebtInputs {
  /** Profissionais na equipe: inteiro positivo (validação de interface do formulário simples). */
  team: Input;
  /** R$ por profissional por mês. */
  monthlyCost: Input;
  /** % do tempo total em manutenção, 0–100. */
  maintenancePercent: Input;
  /** % da manutenção atribuída à dívida técnica, 0–100 (incide sobre a manutenção). */
  debtSharePercent: Input;
}

export type TechDebtField = keyof TechDebtInputs;

export type TechDebtResult =
  | { status: "insufficient"; missing: MissingInput[] }
  | { status: "overflow" }
  | { status: "value"; monthly: number; annual: number; /** Algum custo/percentual foi declarado como zero: não comprova ausência de dívida. */ zeroDeclared: boolean };

/** D = N × K × m × q (mensal) e 12 × D (mesma equipe, custo e percentuais). */
export function evaluateTechDebt(input: TechDebtInputs): ModelOutcome<TechDebtResult> {
  const errors: ModelError[] = [];
  const checks = [
    checkValue("team", input.team, { integer: true, positive: true }),
    checkValue("monthlyCost", input.monthlyCost),
    checkValue("maintenancePercent", input.maintenancePercent, { percent: true }),
    checkValue("debtSharePercent", input.debtSharePercent, { percent: true }),
  ];
  for (const e of checks) if (e) errors.push(e);
  if (errors.length > 0) return { ok: false, errors };

  const fields: [TechDebtField, Input][] = [["team", input.team], ["monthlyCost", input.monthlyCost], ["maintenancePercent", input.maintenancePercent], ["debtSharePercent", input.debtSharePercent]];
  const missing: MissingInput[] = [];
  for (const [field, v] of fields) {
    const state = inputState(v);
    if (state !== "value") missing.push({ field, state });
  }
  if (missing.length > 0) return { ok: true, result: { status: "insufficient", missing } };

  const [n, k, m, q] = fields.map(([, v]) => v as number);
  const payroll = mul(n, k);
  const maintenance = payroll === null ? null : mul(payroll, m / 100);
  const monthly = maintenance === null ? null : mul(maintenance, q / 100);
  const annual = monthly === null ? null : mul(monthly, 12);
  if (monthly === null || annual === null) return { ok: true, result: { status: "overflow" } };
  return { ok: true, result: { status: "value", monthly, annual, zeroDeclared: k === 0 || m === 0 || q === 0 } };
}
