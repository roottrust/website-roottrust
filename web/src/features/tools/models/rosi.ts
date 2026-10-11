import { add, checkValue, div, inputState, modelError, mul, OVERFLOW, undef, val } from "./numbers";
import type { Calc, Input, MissingInput, ModelError, ModelOutcome } from "./numbers";

/** Quatro grupos monetários do auxiliar (F15 prejuízo / F16 custo). */
export type AuxTotals = readonly [Input, Input, Input, Input];
export const LOSS_AUX_LABELS = ["Serviços externos de resposta/recuperação", "Trabalho interno adicional", "Perda operacional/comercial", "Outros prejuízos identificados"] as const;
export const COST_AUX_LABELS = ["Implantação", "Despesas recorrentes nos primeiros 12 meses", "Trabalho interno adicional", "Outros custos adicionais"] as const;

/** Opções editoriais de frequência (incidentes com prejuízo/ano); hipóteses do visitante, não benchmarks. */
export const FREQUENCY_OPTIONS = [
  { id: "cada-5-anos", label: "Uma vez a cada 5 anos", perYear: 0.2 },
  { id: "cada-2-anos", label: "Uma vez a cada 2 anos", perYear: 0.5 },
  { id: "uma-por-ano", label: "Uma vez por ano", perYear: 1 },
  { id: "duas-por-ano", label: "Duas vezes por ano", perYear: 2 },
] as const;

export const ROSI_HORIZON_MONTHS = 12;

export type AuxResolution =
  | { status: "complete"; total: number }
  | { status: "incomplete"; subtotal: number | null; missing: number[] }
  | { status: "overflow" };

/** Soma somente com os quatro grupos conhecidos (zero conta como conhecido); caso contrário, subtotal incompleto. */
export function resolveAux(items: AuxTotals): AuxResolution {
  let total = 0;
  let known = 0;
  let overflow = false;
  const missing: number[] = [];
  items.forEach((item, i) => {
    if (typeof item !== "number") {
      missing.push(i);
      return;
    }
    const next = add(total, item);
    if (next === null) overflow = true;
    else total = next;
    known += 1;
  });
  if (overflow) return { status: "overflow" };
  if (missing.length === 0) return { status: "complete", total };
  return { status: "incomplete", subtotal: known > 0 ? total : null, missing };
}

export interface AmountInput {
  direct: Input;
  /** Auxiliar opcional: quando completo, substitui o total direto (nunca soma com ele). */
  aux?: AuxTotals;
}

export interface RosiInputs {
  /** R$ por incidente com prejuízo (F07). */
  loss: AmountInput;
  /** Incidentes com prejuízo por ano (F08). */
  frequency: Input;
  /** R$ nos primeiros 12 meses (F09). */
  cost: AmountInput;
  /** Meses até a proteção estar efetiva; 0 = imediatamente (F10). */
  delayMonths: Input;
  /** Redução esperada da perda durante a operação efetiva, 0–100 (F12). */
  reductionPercent: Input;
}

export type RosiField = "loss" | "frequency" | "cost" | "delayMonths" | "reductionPercent";

export interface AmountSource {
  source: "aux" | "direct";
  /** Auxiliar preenchido parcialmente: nunca substitui a entrada principal. */
  auxIncomplete?: { subtotal: number | null; missing: number[] };
}

export interface RosiResult {
  /** `full`: todas as entradas; `breakeven`: só falta a redução e o equilíbrio é calculável; demais: parcial/insuficiente. */
  mode: "full" | "breakeven" | "partial" | "insufficient";
  missingInputs: MissingInput[];
  sources: { loss: AmountSource; cost: AmountSource };
  /** L = prejuízo × frequência (12 meses, controles atuais). */
  referenceLoss: Calc;
  /** f = max(0, 12 − d) / 12. */
  activeFraction: Calc;
  /** B = L × e × f (0 quando d ≥ 12, mesmo com redução desconhecida). */
  benefit: Calc;
  residualLoss: Calc;
  netBenefit: Calc;
  /** ROSI em %: (B − C) / C × 100; indefinido com C = 0. */
  rosiPercent: Calc;
  /** Redução necessária durante o período ativo, em %: C / (L × f) × 100. Sem limite superior. */
  breakevenPercent: Calc;
  /** Equilíbrio acima de 100%: sem truncamento; a UI deve explicar que a redução não cobre o custo. */
  breakevenExceedsLimit: boolean;
}

function resolveAmount(field: string, input: AmountInput, errors: ModelError[]): { value: Input; source: AmountSource } {
  const direct = checkValue(`${field}.direct`, input.direct);
  if (direct) errors.push(direct);
  if (!input.aux) return { value: input.direct, source: { source: "direct" } };
  input.aux.forEach((item, i) => {
    const e = checkValue(`${field}.aux.${i}`, item);
    if (e) errors.push(e);
  });
  const aux = resolveAux(input.aux);
  if (aux.status === "complete") return { value: aux.total, source: { source: "aux" } };
  if (aux.status === "overflow") {
    errors.push(modelError(`${field}.aux`, "overflow"));
    return { value: input.direct, source: { source: "direct" } };
  }
  const touched = input.aux.some((item) => item !== undefined);
  return { value: input.direct, source: { source: "direct", ...(touched ? { auxIncomplete: { subtotal: aux.subtotal, missing: aux.missing } } : {}) } };
}

type Dep = [RosiField, Input];
const missingOf = (deps: Dep[]): Calc => {
  const missing: MissingInput[] = [];
  for (const [field, v] of deps) {
    const state = inputState(v);
    if (state !== "value") missing.push({ field, state });
  }
  return { status: "missing", missing };
};
const allKnown = (deps: Dep[]) => deps.every(([, v]) => typeof v === "number");

/** Modelo ROSI/equilíbrio dos 12 primeiros meses (F03–F18). Função pura; sem estado nem efeitos. */
export function evaluateRosi(input: RosiInputs): ModelOutcome<RosiResult> {
  const errors: ModelError[] = [];
  const lossR = resolveAmount("loss", input.loss, errors);
  const costR = resolveAmount("cost", input.cost, errors);
  for (const e of [
    checkValue("frequency", input.frequency),
    checkValue("delayMonths", input.delayMonths),
    checkValue("reductionPercent", input.reductionPercent, { percent: true }),
  ]) {
    if (e) errors.push(e);
  }
  if (errors.length > 0) return { ok: false, errors };

  const loss = lossR.value;
  const cost = costR.value;
  const { frequency, delayMonths: delay, reductionPercent } = input;

  const lossDeps: Dep[] = [["loss", loss], ["frequency", frequency]];
  let referenceLoss: Calc;
  if (allKnown(lossDeps)) {
    const l = mul(loss as number, frequency as number);
    referenceLoss = l === null ? OVERFLOW : val(l);
  } else referenceLoss = missingOf(lossDeps);

  const f = typeof delay === "number" ? Math.max(0, 12 - delay) / 12 : null;
  const activeFraction: Calc = f === null ? missingOf([["delayMonths", delay]]) : val(f);

  const benefitDeps: Dep[] = [["loss", loss], ["frequency", frequency], ["delayMonths", delay], ["reductionPercent", reductionPercent]];
  let benefit: Calc;
  if (typeof delay === "number" && delay >= ROSI_HORIZON_MONTHS) benefit = val(0);
  else if (referenceLoss.status === "overflow") benefit = OVERFLOW;
  else if (referenceLoss.status === "value" && f !== null && typeof reductionPercent === "number") {
    const reduced = mul(referenceLoss.value, reductionPercent / 100);
    const b = reduced === null ? null : mul(reduced, f);
    benefit = b === null ? OVERFLOW : val(b);
  } else benefit = missingOf(benefitDeps);

  const residualLoss: Calc =
    referenceLoss.status === "value" && benefit.status === "value"
      ? val(referenceLoss.value - benefit.value)
      : referenceLoss.status === "overflow" ? OVERFLOW
      : referenceLoss.status === "value" ? missingOf(benefitDeps) // L conhecido, falta redução/prazo
      : referenceLoss;

  let netBenefit: Calc;
  if (benefit.status === "value" && typeof cost === "number") netBenefit = val(benefit.value - cost);
  else if (benefit.status === "overflow") netBenefit = OVERFLOW;
  else {
    const deps: Dep[] = benefit.status === "missing" ? benefitDeps.filter(([, v]) => typeof v !== "number") : [];
    netBenefit = missingOf([["cost", cost], ...deps]);
  }

  let rosiPercent: Calc;
  if (cost === 0) rosiPercent = undef("zero_cost");
  else if (netBenefit.status === "value" && typeof cost === "number") {
    const ratio = div(netBenefit.value, cost);
    const pct = ratio === null ? null : mul(ratio, 100);
    rosiPercent = pct === null ? OVERFLOW : val(pct);
  } else rosiPercent = netBenefit;

  const breakevenDeps: Dep[] = [["cost", cost], ["loss", loss], ["frequency", frequency], ["delayMonths", delay]];
  let breakevenPercent: Calc;
  if (referenceLoss.status === "overflow") breakevenPercent = OVERFLOW;
  else if (!allKnown(breakevenDeps) || referenceLoss.status !== "value" || f === null) breakevenPercent = missingOf(breakevenDeps);
  else if (f === 0) breakevenPercent = undef("no_active_period");
  else if (referenceLoss.value === 0) breakevenPercent = undef("zero_reference_loss");
  else {
    const active = mul(referenceLoss.value, f);
    const ratio = active === null ? null : div(cost as number, active);
    const pct = ratio === null ? null : mul(ratio, 100);
    breakevenPercent = pct === null ? OVERFLOW : val(pct);
  }

  const missingInputs: MissingInput[] = [];
  const all: Dep[] = [["loss", loss], ["frequency", frequency], ["cost", cost], ["delayMonths", delay], ["reductionPercent", reductionPercent]];
  for (const [field, v] of all) {
    const state = inputState(v);
    if (state !== "value") missingInputs.push({ field, state });
  }

  const anyValue = [referenceLoss, activeFraction, benefit, residualLoss, netBenefit, rosiPercent, breakevenPercent].some((c) => c.status === "value");
  const onlyReductionMissing = missingInputs.length === 1 && missingInputs[0].field === "reductionPercent";
  const mode: RosiResult["mode"] =
    missingInputs.length === 0 ? "full"
    : onlyReductionMissing && breakevenPercent.status === "value" ? "breakeven"
    : anyValue ? "partial"
    : "insufficient";

  return {
    ok: true,
    result: {
      mode,
      missingInputs,
      sources: { loss: lossR.source, cost: costR.source },
      referenceLoss,
      activeFraction,
      benefit,
      residualLoss,
      netBenefit,
      rosiPercent,
      breakevenPercent,
      breakevenExceedsLimit: breakevenPercent.status === "value" && breakevenPercent.value > 100,
    },
  };
}
