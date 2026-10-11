import { describe, expect, it } from "vitest";
import { evaluateRosi, resolveAux } from "../../../src/features/tools/models";
import type { RosiInputs } from "../../../src/features/tools/models";

const base: RosiInputs = { loss: { direct: 200000 }, frequency: 0.5, cost: { direct: 30000 }, delayMonths: 0, reductionPercent: 60 };
const run = (o: Partial<RosiInputs> = {}) => {
  const r = evaluateRosi({ ...base, ...o });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.result;
};
const num = (c: { status: string; value?: number }) => {
  expect(c.status).toBe("value");
  return c.value as number;
};

describe("ROSI fixtures (docs/web/tools.md)", () => {
  it("imediato", () => {
    const r = run();
    expect(r.mode).toBe("full");
    expect(num(r.referenceLoss)).toBeCloseTo(100000, 6);
    expect(num(r.benefit)).toBeCloseTo(60000, 6);
    expect(num(r.residualLoss)).toBeCloseTo(40000, 6);
    expect(num(r.netBenefit)).toBeCloseTo(30000, 6);
    expect(num(r.rosiPercent)).toBeCloseTo(100, 6);
    expect(num(r.breakevenPercent)).toBeCloseTo(30, 6);
  });
  it("três meses", () => {
    const r = run({ delayMonths: 3 });
    expect(num(r.activeFraction)).toBe(0.75);
    expect(num(r.benefit)).toBeCloseTo(45000, 6);
    expect(num(r.netBenefit)).toBeCloseTo(15000, 6);
    expect(num(r.rosiPercent)).toBeCloseTo(50, 6);
    expect(num(r.breakevenPercent)).toBeCloseTo(40, 6);
  });
  it("sem redução: só equilíbrio, sem inventar benefício/residual/ROSI", () => {
    for (const reductionPercent of [null, undefined]) {
      const r = run({ delayMonths: 3, reductionPercent });
      expect(r.mode).toBe("breakeven");
      expect(num(r.breakevenPercent)).toBeCloseTo(40, 6);
      expect(r.benefit.status).toBe("missing");
      expect(r.residualLoss.status).toBe("missing");
      expect(r.netBenefit.status).toBe("missing");
      expect(r.rosiPercent.status).toBe("missing");
      expect(r.missingInputs).toEqual([{ field: "reductionPercent", state: reductionPercent === null ? "unknown" : "empty" }]);
    }
  });
  it("prazo 12: benefício 0, residual 100.000, líquido -30.000, ROSI -100, equilíbrio indefinido", () => {
    const r = run({ delayMonths: 12 });
    expect(num(r.benefit)).toBe(0);
    expect(num(r.residualLoss)).toBeCloseTo(100000, 6);
    expect(num(r.netBenefit)).toBeCloseTo(-30000, 6);
    expect(num(r.rosiPercent)).toBeCloseTo(-100, 6);
    expect(r.breakevenPercent).toEqual({ status: "undefined", reason: "no_active_period" });
  });
  it("prazo ≥12 com redução desconhecida: benefício 0 e demais conforme dependências", () => {
    const r = run({ delayMonths: 18, reductionPercent: null });
    expect(num(r.benefit)).toBe(0);
    expect(num(r.netBenefit)).toBeCloseTo(-30000, 6);
    expect(num(r.rosiPercent)).toBeCloseTo(-100, 6);
    expect(r.mode).toBe("partial");
    const noCost = run({ delayMonths: 12, reductionPercent: null, cost: { direct: undefined } });
    expect(num(noCost.benefit)).toBe(0);
    expect(noCost.netBenefit.status).toBe("missing");
    expect(num(noCost.residualLoss)).toBeCloseTo(100000, 6);
  });
  it("custo zero: razão indefinida, equilíbrio 0%", () => {
    const r = run({ cost: { direct: 0 } });
    expect(num(r.benefit)).toBeCloseTo(60000, 6);
    expect(num(r.netBenefit)).toBeCloseTo(60000, 6);
    expect(r.rosiPercent).toEqual({ status: "undefined", reason: "zero_cost" });
    expect(num(r.breakevenPercent)).toBe(0);
  });
  it("custo zero declarado com benefício desconhecido continua indefinido", () => {
    expect(run({ cost: { direct: 0 }, reductionPercent: null }).rosiPercent).toEqual({ status: "undefined", reason: "zero_cost" });
  });
  it("limiar acima de 100% não é truncado", () => {
    const r = run({ cost: { direct: 90000 }, delayMonths: 3, reductionPercent: null });
    expect(num(r.breakevenPercent)).toBeCloseTo(120, 6);
    expect(r.breakevenExceedsLimit).toBe(true);
    expect(run().breakevenExceedsLimit).toBe(false);
  });
  it("perda de referência zero: equilíbrio indefinido, ROSI negativo preservado", () => {
    const r = run({ frequency: 0 });
    expect(r.referenceLoss).toEqual({ status: "value", value: 0 });
    expect(r.breakevenPercent).toEqual({ status: "undefined", reason: "zero_reference_loss" });
    expect(num(r.rosiPercent)).toBeCloseTo(-100, 6);
  });
  it("desconhecidos não viram zero nem inventam L/benefício/ROSI", () => {
    for (const patch of [{ loss: { direct: null } }, { frequency: null }, { frequency: undefined }] as Partial<RosiInputs>[]) {
      const r = run(patch);
      expect(r.referenceLoss.status).toBe("missing");
      expect(r.benefit.status).toBe("missing");
      expect(r.rosiPercent.status).toBe("missing");
      expect(r.breakevenPercent.status).toBe("missing");
      expect(r.mode).toBe("partial");
    }
    const r = run({ cost: { direct: null }, delayMonths: null });
    expect(r.activeFraction.status).toBe("missing");
    expect(r.missingInputs.map((m) => m.field)).toEqual(["cost", "delayMonths"]);
    expect(num(r.referenceLoss)).toBeCloseTo(100000, 6);
  });
  it("tudo vazio: insuficiente", () => {
    const r = run({ loss: { direct: undefined }, frequency: undefined, cost: { direct: undefined }, delayMonths: undefined, reductionPercent: undefined });
    expect(r.mode).toBe("insufficient");
    expect(r.missingInputs).toHaveLength(5);
  });
  it("zero explícito é valor (redução 0 → benefício 0, ROSI -100)", () => {
    const r = run({ reductionPercent: 0 });
    expect(num(r.benefit)).toBe(0);
    expect(num(r.rosiPercent)).toBeCloseTo(-100, 6);
  });
  it("frações de mês e prazo", () => {
    expect(num(run({ delayMonths: 1.5 }).activeFraction)).toBe(0.875);
  });
});

describe("ROSI validação e limites", () => {
  it("rejeita negativos, não finitos e percentual fora da faixa", () => {
    const codes = (o: Partial<RosiInputs>) => {
      const r = evaluateRosi({ ...base, ...o });
      return r.ok ? [] : r.errors.map((e) => `${e.field}:${e.code}`);
    };
    expect(codes({ frequency: -1 })).toEqual(["frequency:negative"]);
    expect(codes({ loss: { direct: Number.NaN } })).toEqual(["loss.direct:not_finite"]);
    expect(codes({ cost: { direct: Number.POSITIVE_INFINITY } })).toEqual(["cost.direct:not_finite"]);
    expect(codes({ reductionPercent: 100.5 })).toEqual(["reductionPercent:percent_out_of_range"]);
    expect(codes({ delayMonths: -2 })).toEqual(["delayMonths:negative"]);
    expect(codes({ reductionPercent: 100 })).toEqual([]);
  });
  it("estouro intermediário vira overflow, nunca Infinity", () => {
    const r = run({ loss: { direct: 1e308 }, frequency: 10 });
    expect(r.referenceLoss).toEqual({ status: "overflow" });
    expect(r.benefit).toEqual({ status: "overflow" });
    expect(r.netBenefit).toEqual({ status: "overflow" });
    expect(r.breakevenPercent).toEqual({ status: "overflow" });
    const rat = run({ cost: { direct: 1e308 }, loss: { direct: 1 }, frequency: 1e-10 });
    expect(rat.breakevenPercent).toEqual({ status: "overflow" });
    const rosi = run({ cost: { direct: 1e-300 }, loss: { direct: 1e300 }, frequency: 1, reductionPercent: 100 });
    expect(rosi.rosiPercent).toEqual({ status: "overflow" });
  });
  it("underflow para zero é tratado como erro numérico", () => {
    const r = run({ loss: { direct: 1e-200 }, frequency: 1e-200 });
    expect(r.referenceLoss).toEqual({ status: "overflow" });
  });
});

describe("auxiliares F15/F16", () => {
  it("soma somente quando completo (zero conta como conhecido)", () => {
    expect(resolveAux([100, 200, 0, 50])).toEqual({ status: "complete", total: 350 });
    expect(resolveAux([100, undefined, 0, 50])).toEqual({ status: "incomplete", subtotal: 150, missing: [1] });
    expect(resolveAux([undefined, null, undefined, undefined])).toEqual({ status: "incomplete", subtotal: null, missing: [0, 1, 2, 3] });
    expect(resolveAux([1e308, 1e308, 0, 0])).toEqual({ status: "overflow" });
  });
  it("total completo substitui o direto (sem somar); incompleto não substitui", () => {
    const aux = run({ loss: { direct: 999, aux: [100000, 50000, 40000, 10000] }, frequency: 1 });
    expect(aux.sources.loss.source).toBe("aux");
    expect(num(aux.referenceLoss)).toBe(200000);
    const inc = run({ loss: { direct: 200000, aux: [100000, undefined, undefined, undefined] } });
    expect(inc.sources.loss).toEqual({ source: "direct", auxIncomplete: { subtotal: 100000, missing: [1, 2, 3] } });
    expect(num(inc.referenceLoss)).toBeCloseTo(100000, 6);
    const incNoDirect = run({ cost: { direct: undefined, aux: [10, 20, undefined, undefined] } });
    expect(incNoDirect.netBenefit.status).toBe("missing");
    expect(run({ cost: { direct: 5, aux: [undefined, undefined, undefined, undefined] } }).sources.cost).toEqual({ source: "direct" });
  });
  it("valida itens do auxiliar e estouro da soma", () => {
    const bad = evaluateRosi({ ...base, cost: { direct: 1, aux: [1, -2, 3, 4] } });
    expect(bad.ok ? [] : bad.errors.map((e) => e.field + ":" + e.code)).toEqual(["cost.aux.1:negative"]);
    const over = evaluateRosi({ ...base, cost: { direct: 1, aux: [1e308, 1e308, 1, 1] } });
    expect(over.ok ? [] : over.errors.map((e) => e.code)).toEqual(["overflow"]);
  });
});
