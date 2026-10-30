import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "../../src/components/forms/ContactForm";
import { ReportForm } from "../../src/components/forms/ReportForm";
import { FormStatus, pilotMessage } from "../../src/components/forms/FormStatus";
import { canRetryChallenge, challengeGroupId, challengeMessage, type ChallengeState } from "../../src/components/forms/challenge-state";
import { submitDiagnostic } from "../../src/lib/forms";

const values = { name: "Ana Souza", company: "Acme", whatsapp: "(11) 94008-4692" };
const reply = (status: number, body?: unknown, headers?: Record<string, string>) =>
  vi.fn<typeof fetch>(async () => new Response(body === undefined ? null : JSON.stringify(body), { status, headers }));

vi.mock("@/lib/forms", async () => import("../../src/lib/forms"));

describe("submitDiagnostic", () => {
  const run = (fetchFn: ReturnType<typeof reply>) => submitDiagnostic(values, "tok", new AbortController().signal, fetchFn);

  it("POSTs the three fields with the Turnstile header and nothing else", async () => {
    const fetchFn = reply(202, { status: "accepted", id: "DG-0123456789" });
    expect(await run(fetchFn)).toEqual({ result: "accepted", reference: "DG-0123456789" });
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/diagnostico");
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["x-turnstile-token"]).toBe("tok");
    expect(JSON.parse(String(init?.body))).toEqual(values);
  });
  it("maps 400/403/429/503/5xx/network failures to honest states", async () => {
    expect((await run(reply(400, { code: "invalid_request" }))).result).toBe("invalid");
    expect((await run(reply(403, { code: "challenge_failed" }))).result).toBe("challenge");
    expect((await run(reply(403, { code: "forbidden_origin" }))).result).toBe("forbidden");
    expect((await run(reply(403))).result).toBe("forbidden");
    expect(await run(reply(429, { code: "rate_limited", retryAfter: 30 }))).toEqual({ result: "rate_limited", retryAfter: 30 });
    expect((await run(reply(503, { code: "not_operational" }))).result).toBe("unavailable");
    expect((await run(reply(500))).result).toBe("error");
    const down = vi.fn<typeof fetch>(async () => {
      throw new TypeError("network");
    });
    expect((await submitDiagnostic(values, "tok", new AbortController().signal, down)).result).toBe("error");
  });
  it("an untrusted reference is not displayed, and 2xx without 202 is not success", async () => {
    expect(await run(reply(202, { id: "<script>" }))).toEqual({ result: "accepted" });
    expect((await run(reply(200, { id: "DG-0123456789" }))).result).toBe("error");
  });
  it("aborting rethrows instead of reporting a result", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(submitDiagnostic(values, "tok", controller.signal, vi.fn<typeof fetch>())).rejects.toThrow();
  });
});

describe("pilot messages and markup", () => {
  it("states the next-business-day promise only on acceptance and keeps data on failures", () => {
    expect(pilotMessage("accepted", "DG-0123456789")).toContain("próximo dia útil");
    expect(pilotMessage("accepted", "DG-0123456789")).toContain("DG-0123456789");
    for (const status of ["invalid", "rate_limited", "challenge", "forbidden", "unavailable", "error"] as const) {
      expect(pilotMessage(status)).not.toContain("próximo dia útil");
    }
    for (const status of ["invalid", "rate_limited", "forbidden", "unavailable", "error"] as const) expect(pilotMessage(status)).toContain("mantidos");
  });
  it("renders the challenge as a labelled group, keeps submit disabled until ready, and has no e-mail field", () => {
    const html = renderToStaticMarkup(createElement(ContactForm, { config: { mode: "pilot", siteKey: "site-key" } }));
    expect(html).toContain('aria-label="Verificação de segurança"');
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
    expect(html).not.toMatch(/type="email"|name="email"/i);
  });
  it("pilot markup links the disabled submit to a persistent live status and does not load the script on render", () => {
    const html = renderToStaticMarkup(createElement(ContactForm, { config: { mode: "pilot", siteKey: "site-key" } }));
    const statusId = /<p[^>]*id="([^"]+-challenge)"[^>]*role="status"|<p[^>]*role="status"[^>]*id="([^"]+-challenge)"/.exec(html);
    const id = statusId?.[1] ?? statusId?.[2];
    expect(id).toBeTruthy();
    expect(html).toMatch(new RegExp(`<button[^>]*aria-describedby="${id}"`));
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("challenges.cloudflare.com");
    expect(html).toContain(challengeMessage("idle"));
  });
  it("noscript copy is specific to the pilot and does not call it a local form", () => {
    const pilot = renderToStaticMarkup(createElement(ContactForm, { config: { mode: "pilot", siteKey: "site-key" } }));
    expect(pilot).toContain("Ative JavaScript para enviar a solicitação");
    expect(pilot).not.toContain("formulário local");
    expect(renderToStaticMarkup(createElement(ContactForm, { config: { mode: "demo" } }))).toContain("formulário local");
  });
  it("demo and unavailable render no challenge and no webhook configuration", () => {
    for (const mode of ["demo", "unavailable"] as const) {
      const html = renderToStaticMarkup(createElement(ContactForm, { config: { mode } }));
      expect(html).not.toContain("Verificação de segurança");
      expect(html).not.toMatch(/discord|turnstile/i);
    }
  });
});

describe("challenge state logic", () => {
  const states: ChallengeState[] = ["idle", "loading", "ready", "solved", "expired", "timeout", "failed"];
  it("every state has a distinct, non-empty message", () => {
    const messages = states.map(challengeMessage);
    expect(messages.every(Boolean)).toBe(true);
    expect(new Set(messages).size).toBe(states.length);
  });
  it("only failed, expired and timeout offer a retry", () => {
    expect(states.filter(canRetryChallenge)).toEqual(["expired", "timeout", "failed"].sort((x, y) => states.indexOf(x as ChallengeState) - states.indexOf(y as ChallengeState)));
  });
});

describe("shared feedback panel", () => {
  const render = (props: Partial<Parameters<typeof FormStatus>[0]>) =>
    renderToStaticMarkup(createElement(FormStatus, { mode: "pilot", status: "idle", kind: "contact", ...props }));
  const liveRegions = (html: string) => html.match(/role="status"/g)?.length ?? 0;

  it("keeps an empty persistent live region without an idle panel", () => {
    for (const mode of ["pilot", "demo", "unavailable"] as const) {
      const html = render({ mode });
      expect(html).toContain('role="status" aria-live="polite" aria-atomic="true" class="srOnly"></p>');
      expect(html).not.toContain("data-tone");
    }
  });
  it("renders a decorative icon, a title and exactly one live region holding only the message", () => {
    for (const status of ["submitting", "accepted", "invalid", "rate_limited", "challenge", "forbidden", "unavailable", "error"] as const) {
      const html = render({ status, kind: "report", reviewId: "x", challengeId: "y" });
      expect(liveRegions(html)).toBe(1);
      expect(html).toContain('aria-hidden="true"');
      expect(html).toMatch(/<p class="[^"]*">[^<]+<\/p><p role="status" aria-live="polite"[^>]*>[^<]+<\/p>/);
    }
  });
  it("keeps the demo notice and the exact unavailable and demo messages", () => {
    expect(render({ mode: "demo", status: "accepted" })).toContain("Demonstração: solicitação aceita localmente. Nenhum dado foi enviado.");
    expect(render({ mode: "demo" })).toContain("Demonstração local — nenhum dado é enviado ou guardado.");
    expect(render({ mode: "unavailable", status: "unavailable" })).toContain(">O envio ainda não está disponível. Nenhum dado foi enviado.</p>");
  });
  it("offers a useful action only where it helps", () => {
    expect(render({ status: "invalid", reviewId: "campo" })).toContain("Rever os campos");
    expect(render({ status: "challenge", challengeId: "grupo" })).toContain("Ir à verificação");
    expect(render({ status: "error" })).toContain("mailto:");
    expect(render({ status: "accepted" })).not.toMatch(/<button|<a /);
    expect(render({ status: "submitting" })).not.toMatch(/<button|<a /);
  });
  it("rounds retryAfter up in the message and never shows a countdown", () => {
    expect(pilotMessage("rate_limited", undefined, 1.2)).toContain("2 segundos");
    expect(pilotMessage("rate_limited", undefined, 61)).toContain("2 minutos");
    expect(pilotMessage("rate_limited")).not.toMatch(/\d/);
    expect(render({ status: "rate_limited", retryAfter: 30 })).toContain("30 segundos");
  });
  it("treats a network or 5xx error as an uncertain outcome without inviting a blind resend", () => {
    for (const kind of ["contact", "report", "newsletter"] as const) {
      const html = render({ status: "error", kind });
      expect(html).toContain("Não foi possível confirmar");
      expect(html).not.toMatch(/tente novamente|envie de novo|reenvie/i);
    }
  });
  it("says a registered report or newsletter request is not delivered or confirmed", () => {
    expect(render({ status: "accepted", kind: "report" })).toContain("A entrega não é garantida");
    expect(render({ status: "accepted", kind: "newsletter" })).toContain("não confirma a inscrição nem a entrega");
  });
  it("derives the challenge group id from the status id", () => {
    expect(challengeGroupId("abc-challenge")).toBe("abc-challenge-group");
  });
  it("keeps optional commercial consent unchecked and allows requesting without ticking it", () => {
    const html = renderToStaticMarkup(createElement(ReportForm, { config: { mode: "pilot", siteKey: "site-key" }, toolId: "rosi", topic: "ROSI" }));
    expect(html).toContain("posso pedir o relatório sem marcar");
    expect(html).toMatch(/type="checkbox"/);
    expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
  });
});
