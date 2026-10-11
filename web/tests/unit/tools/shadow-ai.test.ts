import { describe, expect, it } from "vitest";
import { SHADOW_QUESTIONS, evaluateShadowAi } from "../../../src/features/tools/models";
import type { ShadowAnswer, ShadowAnswers } from "../../../src/features/tools/models";

const answers = (list: ShadowAnswer[]): ShadowAnswers => Object.fromEntries(SHADOW_QUESTIONS.map((q, i) => [q.id, list[i]]));
const run = (a: ShadowAnswers) => {
  const r = evaluateShadowAi(a);
  if (!r.ok) throw new Error("invalid");
  return r.result;
};

describe("Shadow AI", () => {
  it("fixture Sim / Parcialmente / Não / Não sei / Sim", () => {
    const r = run(answers(["sim", "parcialmente", "nao", "nao-sei", "sim"]));
    if (!r.complete) throw new Error("incomplete");
    expect(r.items.map((i) => i.status)).toEqual(["declared", "partial", "not-declared", "to-confirm", "declared"]);
    expect(r.items[1].action).toBe(SHADOW_QUESTIONS[1].improvement);
    expect(r.items[2].action).toBe(SHADOW_QUESTIONS[2].improvement);
    expect(r.items[3].action).toBe(SHADOW_QUESTIONS[3].confirmation);
    expect(r.items[0].statusLabel).toContain("não verificadas");
    expect(new Set(r.items.map((i) => i.statusLabel)).size).toBe(4);
    expect(r.allDeclared || r.allUnknown).toBe(false);
  });
  it("não produz score, nota nem risco", () => {
    const r = run(answers(["sim", "nao", "nao", "nao-sei", "parcialmente"]));
    expect(Object.keys(r).sort()).toEqual(["allDeclared", "allUnknown", "complete", "items"]);
    expect(JSON.stringify(r)).not.toMatch(/score|risco|nota|pontos/i);
  });
  it("cinco Sim / cinco Não sei não equivalem a segurança nem a ausência", () => {
    const yes = run(answers(Array(5).fill("sim")));
    const unk = run(answers(Array(5).fill("nao-sei")));
    expect(yes.complete && yes.allDeclared).toBe(true);
    expect(unk.complete && unk.allUnknown).toBe(true);
    expect(unk.complete && unk.items.every((i) => i.status !== "not-declared")).toBe(true);
  });
  it("sem pré-seleção: respostas ausentes são apontadas e não geram lista", () => {
    const r = run({ regras: "sim", dados: "nao" });
    expect(r).toEqual({ complete: false, pending: ["visibilidade", "fornecedores", "equipe"] });
    expect(run({})).toMatchObject({ complete: false });
  });
  it("rejeita valores desconhecidos", () => {
    const r = evaluateShadowAi({ regras: "talvez" as ShadowAnswer });
    expect(r.ok).toBe(false);
  });
});
