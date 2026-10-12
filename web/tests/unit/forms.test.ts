import { describe, expect, it, vi } from "vitest";
import { resolveFormMode, submitLocalForm, submitReport, validateContact, validateEmail } from "../../src/lib/forms";

const contact = { name: "Pessoa de teste", company: "Empresa demonstrativa", whatsapp: "(11) 94008-4692" };

describe("local forms", () => {
  it("requires an explicit demo mode", () => {
    expect(resolveFormMode(undefined)).toBe("unavailable");
    expect(resolveFormMode("production")).toBe("unavailable");
    expect(resolveFormMode("demo")).toBe("demo");
  });
  it("validates all contact fields without treating whitespace as a name", () => {
    expect(validateContact({ name: " ", company: "", whatsapp: "123" })).toEqual({ name: "Informe seu nome.", company: "Informe a empresa.", whatsapp: "Informe um número com DDD." });
    expect(validateContact(contact)).toEqual({});
  });
  it("rejects incomplete email addresses and accepts a trimmed address", () => {
    for (const email of ["", "a@", "a@b", "a b@example.com", "leitor@ex..com", "leitor@-example.com", "leitor@example.com,", "[leitor]@ex.com"]) expect(validateEmail(email)).toBeDefined();
    expect(validateEmail(" leitor@example.com ")).toBeUndefined();
    expect(validateEmail("leitor+edicao@news.example.com")).toBeUndefined();
  });
  it("rejects alphabetic, excessive, zero-DDD and repeated phone input", () => {
    for (const whatsapp of ["abc11940084692", "0".repeat(200), "00940084692", "11999999999"]) {
      expect(validateContact({ ...contact, whatsapp }).whatsapp).toBe("Informe um número com DDD.");
    }
  });
  it("accepts plausible Brazilian national and country-code formats without verifying ownership", () => {
    for (const whatsapp of ["(11) 94008-4692", "11 4008-4692", "+55 (11) 94008-4692", "551140084692"]) {
      expect(validateContact({ ...contact, whatsapp })).toEqual({});
    }
  });
  it("keeps valid submission unavailable by default", async () => {
    await expect(submitLocalForm({ kind: "contact", values: contact }, "unavailable", "success", new AbortController().signal)).resolves.toBe("unavailable");
  });
  it("sends only contact, tool and consent for a report, without calculator data", async () => {
    const fetchFn = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({ email: "leitor@example.com", toolId: "rosi", commercialConsent: false });
      expect(init?.headers).toEqual({ "content-type": "application/json", "x-turnstile-token": "token-de-teste" });
      return Response.json({ status: "accepted" }, { status: 202 });
    }) as typeof fetch;
    await expect(submitReport("leitor@example.com", "rosi", false, "token-de-teste", new AbortController().signal, fetchFn)).resolves.toEqual({ result: "accepted" });
    expect(fetchFn).toHaveBeenCalledOnce();
  });
  it("simulates acceptance and error locally, retaining the requested edition", async () => {
    vi.useFakeTimers();
    try {
      const request = { kind: "newsletter" as const, email: "leitor@example.com", editionSlug: "edicao-escolhida" };
      for (const [outcome, expected] of [["success", "accepted"], ["error", "error"]] as const) {
        const result = submitLocalForm(request, "demo", outcome, new AbortController().signal);
        await vi.runAllTimersAsync();
        await expect(result).resolves.toBe(expected);
      }
      expect(request.editionSlug).toBe("edicao-escolhida");
    } finally { vi.useRealTimers(); }
  });
  it("aborts pending work and rejects malformed requests", async () => {
    const controller = new AbortController();
    const pending = submitLocalForm({ kind: "contact", values: contact }, "demo", "success", controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await assertion;
    await expect(submitLocalForm({ kind: "report", email: "bad", toolId: "rosi" }, "demo", "success", new AbortController().signal)).rejects.toThrow("Invalid form request");
  });
});
