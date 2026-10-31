import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "../../src/components/forms/ContactForm";
import { FormStatus, pilotMessage } from "../../src/components/forms/FormStatus";
import { NewsletterForm } from "../../src/components/forms/NewsletterForm";
import { ReportForm } from "../../src/components/forms/ReportForm";
import { isRealMode, submitLocalForm, type ContactFormConfig, type ContactMode } from "../../src/lib/forms";

vi.mock("@/lib/forms", async () => import("../../src/lib/forms"));

const siteKey = "site-key";
const contact = { name: "Ana Souza", company: "Acme", whatsapp: "(11) 94008-4692" };

describe("client mode helpers", () => {
  it("only pilot and public are real; demo and unavailable are not", () => {
    const modes: ContactMode[] = ["demo", "unavailable", "pilot", "public"];
    expect(modes.filter(isRealMode)).toEqual(["pilot", "public"]);
  });

  it("demo never uses the network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await submitLocalForm({ kind: "contact", values: contact }, "demo", "success", new AbortController().signal)).toBe("accepted");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("the local adapter refuses to simulate success for any mode but demo", async () => {
    expect(await submitLocalForm({ kind: "contact", values: contact }, "unavailable", "success", new AbortController().signal)).toBe("unavailable");
  });
});

describe("public forms are real forms", () => {
  const config = (mode: "pilot" | "public"): ContactFormConfig => ({ mode, siteKey });

  it("renders the same real-mode markup as the pilot for contact, newsletter and report", () => {
    const render = (mode: "pilot" | "public") => [
      renderToStaticMarkup(createElement(ContactForm, { config: config(mode) })),
      renderToStaticMarkup(createElement(NewsletterForm, { config: config(mode) })),
      renderToStaticMarkup(createElement(ReportForm, { config: config(mode), toolId: "rosi", topic: "ROSI" })),
    ];
    expect(render("public")).toEqual(render("pilot"));
    for (const html of render("public")) expect(html).not.toContain("formulário local");
  });

  it("public without a site key behaves exactly like the pilot without one: submit stays disabled", () => {
    const render = (mode: "pilot" | "public") => renderToStaticMarkup(createElement(ContactForm, { config: { mode } }));
    expect(render("public")).toBe(render("pilot"));
    expect(render("public")).toContain("disabled");
  });

  it("the serialized configuration carries only mode and site key", () => {
    expect(Object.keys(config("public")).sort()).toEqual(["mode", "siteKey"]);
  });

  it("feedback is honest and identical to the pilot, without the demo notice", () => {
    const render = (mode: ContactMode, status: Parameters<typeof FormStatus>[0]["status"]) =>
      renderToStaticMarkup(createElement(FormStatus, { mode, status, kind: "contact", reference: "DG-0123456789" }));
    for (const status of ["idle", "submitting", "accepted", "invalid", "rate_limited", "challenge", "forbidden", "unavailable", "error"] as const) {
      expect(render("public", status)).toBe(render("pilot", status));
    }
    expect(render("public", "idle")).not.toContain("Demonstração");
    expect(render("public", "accepted")).toContain("próximo dia útil");
    expect(render("public", "unavailable")).not.toContain("próximo dia útil");
    expect(pilotMessage("unavailable")).toContain("mantidos");
  });

  it("noscript copy of the public form does not call it local", () => {
    const html = renderToStaticMarkup(createElement(FormStatus, { mode: "public", status: "idle", kind: "contact" }));
    expect(html).toContain("Ative JavaScript para enviar a solicitação");
  });
});
