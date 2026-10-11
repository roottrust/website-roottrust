import { describe, expect, it } from "vitest";
import { checkValue, inputState, parsePtBR } from "../../../src/features/tools/models";

const code = (text: string, o = {}) => {
  const r = parsePtBR(text, o);
  return r.kind === "error" ? r.code : r.kind;
};

describe("parsePtBR", () => {
  it("parses decimals and valid grouping", () => {
    expect(parsePtBR("0,5")).toEqual({ kind: "value", value: 0.5 });
    expect(parsePtBR("200.000")).toEqual({ kind: "value", value: 200000 });
    expect(parsePtBR("1.234.567,89")).toEqual({ kind: "value", value: 1234567.89 });
    expect(parsePtBR(" R$ 30.000 ")).toEqual({ kind: "value", value: 30000 });
    expect(parsePtBR("60 %", { percent: true })).toEqual({ kind: "value", value: 60 });
    expect(parsePtBR("0")).toEqual({ kind: "value", value: 0 });
  });
  it("keeps empty distinct from zero", () => {
    expect(parsePtBR("")).toEqual({ kind: "empty" });
    expect(parsePtBR("   ")).toEqual({ kind: "empty" });
    expect(parsePtBR("0")).not.toEqual({ kind: "empty" });
  });
  it("rejects malformed numbers", () => {
    for (const t of ["1.23", "12.34.567", "1.2345", "0.5", "1,2,3", ",5", "5,", "1 000", "abc", "1e5", "0x10", "00,5", "R$"]) {
      expect(parsePtBR(t).kind, t).toBe("error");
    }
    expect(code("1.23")).toBe("invalid_grouping");
    expect(code("abc")).toBe("invalid_format");
  });
  it("rejects negatives, non-finite, overflow", () => {
    expect(code("-1")).toBe("negative");
    expect(code("−5")).toBe("negative");
    expect(code("Infinity")).toBe("not_finite");
    expect(code("NaN")).toBe("not_finite");
    expect(code("9".repeat(400))).toBe("overflow");
  });
  it("enforces percent range and integers", () => {
    expect(code("100", { percent: true })).toBe("value");
    expect(code("100,01", { percent: true })).toBe("percent_out_of_range");
    expect(code("2,5", { integer: true })).toBe("not_integer");
    expect(code("2", { integer: true })).toBe("value");
  });
});

describe("checkValue / inputState", () => {
  it("distinguishes empty, unknown and zero", () => {
    expect(inputState(undefined)).toBe("empty");
    expect(inputState(null)).toBe("unknown");
    expect(inputState(0)).toBe("value");
  });
  it("validates numeric inputs but ignores empty/unknown", () => {
    expect(checkValue("x", undefined)).toBeUndefined();
    expect(checkValue("x", null)).toBeUndefined();
    expect(checkValue("x", 0)).toBeUndefined();
    expect(checkValue("x", -1)?.code).toBe("negative");
    expect(checkValue("x", Number.NaN)?.code).toBe("not_finite");
    expect(checkValue("x", Number.POSITIVE_INFINITY)?.code).toBe("not_finite");
    expect(checkValue("x", 101, { percent: true })?.code).toBe("percent_out_of_range");
    expect(checkValue("x", 0, { positive: true, integer: true })?.code).toBe("not_positive");
  });
});
