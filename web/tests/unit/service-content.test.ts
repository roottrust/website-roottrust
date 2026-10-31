import { describe, expect, it } from "vitest";
import { getService, services } from "../../src/features/services/content";

const INTRO_CYBER =
  "Identifique riscos, fortaleça seus sistemas e esteja preparado para enfrentar ameaças digitais. Com soluções de cibersegurança alinhadas à sua operação, ajudamos sua empresa a reduzir vulnerabilidades, proteger seus ativos digitais e elevar sua maturidade em segurança.";

describe("service content", () => {
  it("has the three public services", () => {
    expect(services.map((service) => service.slug)).toEqual(["ciberseguranca", "infraestrutura-em-nuvem", "desenvolvimento-de-software"]);
  });

  it("Cibersegurança keeps the approved H1 and literal introduction", () => {
    const cyber = getService("ciberseguranca");
    expect(cyber.h1).toEqual(["Cibersegurança", "para proteger o seu negócio."]);
    expect(cyber.intro).toBe(INTRO_CYBER);
    expect(cyber.metaTitle).toBe("Cibersegurança para proteger o seu negócio");
  });

  it("each service has four own, distinct steps with title and text", () => {
    for (const service of services) {
      expect(service.steps).toHaveLength(4);
      for (const step of service.steps) {
        expect(step.title.trim()).not.toBe("");
        expect(step.text.trim()).not.toBe("");
      }
    }
    const titles = services.flatMap((service) => service.steps.map((step) => step.title));
    expect(new Set(titles).size).toBe(titles.length);
    expect(services.map((service) => service.stageNote)).toEqual(Array(3).fill("As etapas podem variar conforme o escopo do projeto."));
  });

  it("no front carries a highlight badge", () => {
    for (const service of services) for (const frente of service.frentes) expect(frente).not.toHaveProperty("badge");
  });

  it("Pentest is a neutral collapsible detail inside the first Cibersegurança front, with all items preserved", () => {
    const [first, ...others] = getService("ciberseguranca").frentes;
    expect(first.title).toBe("Riscos e testes de segurança");
    expect(first.detail?.id).toBe("pentest");
    expect(first.detail?.summary).toBe("Sobre o Pentest");
    expect(first.detail?.text).toContain("Antes de qualquer teste de segurança, definimos escopo e autorização.");
    expect(first.detail?.items).toEqual([
      "Relatório técnico com evidências e impacto dos achados.",
      "Resumo executivo para apoiar decisões.",
      "Recomendações priorizadas de correção.",
    ]);
    expect(first.detail?.complements?.map((item) => item.title)).toEqual(["Gestão de vulnerabilidades", "Red Team", "Apoio a normas e compliance"]);
    expect(first.detail?.notes.map((note) => note.text)).toEqual([
      "Reteste após as correções conforme escopo e contrato.",
      "A conversa gratuita não inclui a execução do Pentest ou esses relatórios.",
    ]);
    expect(others.every((frente) => !frente.detail)).toBe(true);
    for (const service of services.filter((item) => item.slug !== "ciberseguranca")) expect(service.frentes.every((frente) => !frente.detail)).toBe(true);
  });

  it("asks whether the diagnosis includes security tests", () => {
    expect(getService("ciberseguranca").faq[0].q).toBe("Solicitar diagnóstico inclui testes de segurança?");
  });

  it("promises no saving percentage, certification or fixed guarantee", () => {
    const infra = getService("infraestrutura-em-nuvem");
    expect(infra.faq.some((item) => item.a.includes("Não há percentual de economia prometido."))).toBe(true);
    const text = JSON.stringify(services);
    expect(text).not.toMatch(/economia garantida|certificação garantida|100% seguro/i);
  });
});
