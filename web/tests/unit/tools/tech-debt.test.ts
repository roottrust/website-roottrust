import { describe, expect, it } from "vitest";
import { evaluateTechDebt } from "../../../src/features/tools/models";
import type { TechDebtInputs } from "../../../src/features/tools/models";

const base: TechDebtInputs = { team: 4, monthlyCost: 10000, maintenancePercent: 30, debtSharePercent: 50 };
const run = (o: Partial<TechDebtInputs> = {}) => {
  const r = evaluateTechDebt({ ...base, ...o });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.result;
};
const codes = (o: Partial<TechDebtInputs>) => {
  const r = evaluateTechDebt({ ...base, ...o });
  return r.ok ? [] : r.errors.map((e) => `${e.field}:${e.code}`);
};

describe("Dívida técnica", () => {
  it("fixture: R$ 6.000/mês e R$ 72.000 em 12 meses", () => {
    const r = run();
    expect(r.status).toBe("value");
    if (r.status === "value") {
      expect(r.monthly).toBeCloseTo(6000, 6);
      expect(r.annual).toBeCloseTo(72000, 6);
      expect(r.zeroDeclared).toBe(false);
    }
  });
  it("vazio/desconhecido não geram número financeiro", () => {
    const r = run({ monthlyCost: undefined, debtSharePercent: null });
    expect(r).toEqual({ status: "insufficient", missing: [{ field: "monthlyCost", state: "empty" }, { field: "debtSharePercent", state: "unknown" }] });
  });
  it("zero explícito gera zero com ressalva", () => {
    for (const o of [{ maintenancePercent: 0 }, { debtSharePercent: 0 }, { monthlyCost: 0 }]) {
      const r = run(o);
      expect(r).toMatchObject({ status: "value", monthly: 0, annual: 0, zeroDeclared: true });
    }
  });
  it("percentuais 0/100 são aceitos; fora da faixa não", () => {
    expect(run({ maintenancePercent: 100, debtSharePercent: 100 })).toMatchObject({ monthly: 40000 });
    expect(codes({ maintenancePercent: 100.1 })).toEqual(["maintenancePercent:percent_out_of_range"]);
    expect(codes({ debtSharePercent: -1 })).toEqual(["debtSharePercent:negative"]);
  });
  it("equipe: inteiro positivo; zero/fracionado/negativo rejeitados", () => {
    expect(codes({ team: 0 })).toEqual(["team:not_positive"]);
    expect(codes({ team: 2.5 })).toEqual(["team:not_integer"]);
    expect(codes({ team: -3 })).toEqual(["team:negative"]);
    expect(codes({ team: Number.NaN })).toEqual(["team:not_finite"]);
    expect(codes({ monthlyCost: Number.POSITIVE_INFINITY })).toEqual(["monthlyCost:not_finite"]);
  });
  it("overflow em produto intermediário ou anual", () => {
    expect(run({ team: 1e200, monthlyCost: 1e200 })).toEqual({ status: "overflow" });
    expect(run({ team: 1, monthlyCost: 1e308, maintenancePercent: 100, debtSharePercent: 100 })).toEqual({ status: "overflow" });
  });
});
