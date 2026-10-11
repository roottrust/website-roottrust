import { describe, expect, it } from "vitest";
import { changeHorizon, confirmTotals, evaluateMigration } from "../../../src/features/tools/models";
import type { MigrationInputs } from "../../../src/features/tools/models";

const base: MigrationInputs = { horizon: 12, totalsHorizon: 12, keep: 120000, operate: 96000, transition: 30000 };
const run = (o: Partial<MigrationInputs> = {}) => {
  const r = evaluateMigration({ ...base, ...o });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.result;
};

describe("Migração para nuvem", () => {
  it("fixture: custa mais (-6.000, -5%)", () => {
    const r = run();
    expect(r).toMatchObject({ status: "value", keep: 120000, migrate: 126000, difference: -6000, direction: "costlier" });
    expect(r.status === "value" && r.percent).toEqual({ status: "value", value: -5 });
  });
  it("fixture: base zero mostra moeda e percentual indisponível", () => {
    const r = run({ keep: 0, operate: 10000, transition: 2000 });
    expect(r).toMatchObject({ status: "value", migrate: 12000, difference: -12000, direction: "costlier" });
    expect(r.status === "value" && r.percent).toEqual({ status: "undefined", reason: "zero_base" });
  });
  it("migrar mais barato e igualdade", () => {
    const cheaper = run({ operate: 60000, transition: 10000 });
    expect(cheaper).toMatchObject({ difference: 50000, direction: "cheaper" });
    expect(cheaper.status === "value" && cheaper.percent.status === "value" && cheaper.percent.value).toBeCloseTo(41.6667, 3);
    const equal = run({ operate: 100000, transition: 20000 });
    expect(equal).toMatchObject({ difference: 0, direction: "equal" });
    expect(equal.status === "value" && equal.percent).toEqual({ status: "value", value: 0 });
  });
  it("transição não é multiplicada pelo horizonte", () => {
    const r12 = run();
    const r36 = run({ horizon: 36, totalsHorizon: 36 });
    expect(r12.status === "value" && r36.status === "value" && r36.migrate === r12.migrate).toBe(true);
  });
  it("trocar horizonte invalida o resultado até reconfirmar os totais", () => {
    const changed = changeHorizon(base, 36);
    expect(changed).toMatchObject({ keep: 120000, operate: 96000, transition: 30000 });
    expect(run(changed)).toEqual({ status: "review-required", horizon: 36, totalsHorizon: 12 });
    expect(run(confirmTotals(changed))).toMatchObject({ status: "value", horizon: 36 });
    expect(run(changeHorizon(changeHorizon(base, 36), 12))).toMatchObject({ status: "value" });
  });
  it("total ausente não vira zero; zero declarado vale", () => {
    expect(run({ transition: undefined })).toEqual({ status: "insufficient", missing: [{ field: "transition", state: "empty" }] });
    expect(run({ keep: null, operate: undefined })).toEqual({ status: "insufficient", missing: [{ field: "keep", state: "unknown" }, { field: "operate", state: "empty" }] });
    expect(run({ transition: 0 })).toMatchObject({ status: "value", migrate: 96000, difference: 24000 });
  });
  it("rejeita negativos, não finitos e horizonte inválido", () => {
    const codes = (o: Partial<MigrationInputs>) => {
      const r = evaluateMigration({ ...base, ...o });
      return r.ok ? [] : r.errors.map((e) => `${e.field}:${e.code}`);
    };
    expect(codes({ keep: -1 })).toEqual(["keep:negative"]);
    expect(codes({ operate: Number.NaN })).toEqual(["operate:not_finite"]);
    expect(codes({ transition: Number.POSITIVE_INFINITY })).toEqual(["transition:not_finite"]);
    expect(codes({ horizon: 24 as 12 })).toEqual(["horizon:invalid_choice"]);
  });
  it("overflow na soma, no percentual e na diferença", () => {
    expect(run({ operate: 1e308, transition: 1e308 })).toEqual({ status: "overflow" });
    const p = run({ keep: 1e-300, operate: 0, transition: 1e300 });
    expect(p.status === "value" && p.percent).toEqual({ status: "overflow" });
    const big = run({ keep: 1e308, operate: 0, transition: 0 });
    expect(big.status === "value" && big.percent).toEqual({ status: "value", value: 100 });
  });
});

describe("Migração: cancelamento de ponto flutuante", () => {
  const diff = (o: Partial<MigrationInputs>) => {
    const r = run(o);
    if (r.status !== "value") throw new Error(r.status);
    return r;
  };
  it(".1+.2 vs .3 é igual", () => {
    const r = diff({ keep: 0.3, operate: 0.1, transition: 0.2 });
    expect(r).toMatchObject({ difference: 0, direction: "equal", percent: { status: "value", value: 0 } });
    expect(Object.is(r.difference, -0)).toBe(false);
  });
  it("1000,30 vs 500,10+500,20 é igual", () => {
    expect(diff({ keep: 1000.3, operate: 500.1, transition: 500.2 })).toMatchObject({ difference: 0, direction: "equal" });
  });
  it("diferença real subcentavo é preservada", () => {
    const r = diff({ keep: 1000.3, operate: 500.1, transition: 500.201 });
    expect(r.direction).toBe("costlier");
    expect(r.difference).toBeCloseTo(-0.001, 9);
    expect(diff({ keep: 0.3, operate: 0.1, transition: 0.199 }).direction).toBe("cheaper");
  });
  it("magnitudes grandes: igualdade de representação e diferença real", () => {
    expect(diff({ keep: 3e15, operate: 1e15, transition: 2e15 })).toMatchObject({ difference: 0, direction: "equal" });
    expect(diff({ keep: 1e15, operate: 1e15, transition: 100 }).direction).toBe("costlier");
    expect(diff({ keep: 1e300, operate: 0.5e300, transition: 0.5e300 }).direction).toBe("equal");
    expect(run({ keep: 1e308, operate: 1e308, transition: 1e308 })).toEqual({ status: "overflow" });
  });
  it("base zero continua sem percentual", () => {
    expect(diff({ keep: 0, operate: 0, transition: 0 })).toMatchObject({ direction: "equal", percent: { status: "undefined", reason: "zero_base" } });
  });
});
