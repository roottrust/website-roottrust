import { describe, expect, it } from "vitest";
import { brl, exactText, pct } from "../../../src/features/tools/format";
import { parsePtBR } from "../../../src/features/tools/models";

const flat = (s: string) => s.replace(/ /g, " ");

describe("brl", () => {
  it("formata valores normais, com sinal", () => {
    expect(flat(brl(6000))).toBe("R$ 6.000,00");
    expect(flat(brl(-1234.5))).toBe("−R$ 1.234,50");
    expect(flat(brl(0.01))).toBe("R$ 0,01");
    expect(flat(brl(-0.01))).toBe("−R$ 0,01");
  });
  it("zero exato é zero, inclusive -0", () => {
    expect(flat(brl(0))).toBe("R$ 0,00");
    expect(flat(brl(-0))).toBe("R$ 0,00");
  });
  it("subcentavo não vira zero e mantém o sinal", () => {
    expect(flat(brl(0.004))).toBe("< R$ 0,01");
    expect(flat(brl(-0.004))).toBe("> −R$ 0,01");
    expect(flat(brl(1e-9))).toBe("< R$ 0,01");
    expect(flat(brl(-1e-9))).toBe("> −R$ 0,01");
  });
});

describe("pct", () => {
  it("formata valores normais, com sinal", () => {
    expect(pct(30)).toBe("30%");
    expect(pct(-12.34)).toBe("−12,3%");
    expect(pct(0.1)).toBe("0,1%");
    expect(pct(-0.1)).toBe("−0,1%");
  });
  it("zero exato é zero", () => {
    expect(pct(0)).toBe("0%");
    expect(pct(-0)).toBe("0%");
  });
  it("abaixo de 0,05 não vira zero e mantém o sinal", () => {
    expect(pct(0.01)).toBe("< 0,1%");
    expect(pct(-0.01)).toBe("> −0,1%");
    expect(pct(-1e-9)).toBe("> −0,1%");
  });
});

describe("exactText", () => {
  it.each([0, 0.001, 0.1 + 0.2, 6000, 1e-21, 123456789.12345679, 1e21])("preserva %s ao reler", (n) => {
    const parsed = parsePtBR(exactText(n));
    expect(parsed).toEqual({ kind: "value", value: n });
  });
});
