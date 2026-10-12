import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "../../src/components/forms/ContactForm";
import { pilotMessage } from "../../src/components/forms/FormStatus";
import { canRetryChallenge, challengeMessage, type ChallengeState } from "../../src/components/forms/challenge-state";
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
