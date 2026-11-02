import { describe, expect, it } from "vitest";
import { getService, services } from "../../src/features/services/content";

const INTRO_CYBER =
  "Identifique riscos, fortaleça seus sistemas e esteja preparado para enfrentar ameaças digitais. Com soluções de cibersegurança alinhadas à sua operação, ajudamos sua empresa a reduzir vulnerabilidades, proteger seus ativos digitais e elevar sua maturidade em segurança.";

describe("service content", () => {
  it("has the three public services", () => {
    expect(services.map((service) => service.slug)).toEqual(["ciberseguranca", "infraestrutura", "software"]);
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

  it("drops the closing paragraphs and keeps the scope pill", () => {
    for (const service of services) {
      expect(service).not.toHaveProperty("closing");
      expect(service.stageNote).toBe("As etapas podem variar conforme o escopo do projeto.");
    }
  });

  it("names the second service Infraestrutura and keeps local, cloud and hybrid scope", () => {
    const infra = getService("infraestrutura");
    expect(infra.label).toBe("Infraestrutura");
    expect(infra.metaTitle).toBe("Infraestrutura");
    expect(infra.intro).toContain("locais, em nuvem e híbridos");
    expect(getService("software").label).toBe("Software");
  });

  it("no front carries a highlight badge", () => {
    for (const service of services) for (const frente of service.frentes) expect(frente).not.toHaveProperty("badge");
  });

  it("Pentest is a neutral always-visible panel after the four Cibersegurança fronts, with all items preserved", () => {
    const cyber = getService("ciberseguranca");
    expect(cyber.frentes.map((frente) => frente.title)).toEqual(["Riscos e testes de segurança", "Identidade e acesso", "Monitoramento", "Resposta a incidentes"]);
    for (const frente of cyber.frentes) expect(frente).not.toHaveProperty("detail");
    const pentest = cyber.pentest;
    expect(pentest?.id).toBe("pentest");
    expect(pentest?.summary).toBe("Sobre o Pentest");
    expect(pentest?.text).toContain("Antes de qualquer teste de segurança, definimos escopo e autorização.");
    expect(pentest?.items).toEqual([
      "Relatório técnico com evidências e impacto dos achados.",
      "Resumo executivo para apoiar decisões.",
      "Recomendações priorizadas de correção.",
    ]);
    expect(pentest?.complements?.map((item) => item.title)).toEqual(["Gestão de vulnerabilidades", "Red Team", "Apoio a normas e compliance"]);
    expect(pentest?.complements?.find((item) => item.title === "Red Team")?.text).toContain("não é sinônimo de Pentest");
    expect(pentest?.complements?.find((item) => item.title === "Apoio a normas e compliance")?.text).toContain("não garante certificação");
    expect(pentest?.notes.map((note) => note.text)).toEqual([
      "Reteste após as correções conforme escopo e contrato.",
      "A conversa gratuita não inclui a execução do Pentest ou esses relatórios.",
    ]);
    for (const service of services.filter((item) => item.slug !== "ciberseguranca")) {
      expect(service.pentest).toBeUndefined();
      expect(service.frentes.every((frente) => !("detail" in frente))).toBe(true);
    }
  });

  it("asks whether the diagnosis includes security tests", () => {
    expect(getService("ciberseguranca").faq[0].q).toBe("Solicitar diagnóstico inclui testes de segurança?");
  });

  it("promises no saving percentage, certification or fixed guarantee", () => {
    const infra = getService("infraestrutura");
    expect(infra.faq.some((item) => item.a.includes("Não há percentual de economia prometido."))).toBe(true);
    const text = JSON.stringify(services);
    expect(text).not.toMatch(/economia garantida|certificação garantida|100% seguro/i);
  });
});
