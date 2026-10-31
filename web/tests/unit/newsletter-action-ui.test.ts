import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FeedbackPanel, FormStatus } from "../../src/components/forms/FormStatus";
import {
  canRetryNewsletterAction,
  newsletterActionFeedback,
  performNewsletterAction,
  tokenFromFragment,
  type NewsletterActionKind,
  type NewsletterActionResult,
} from "../../src/lib/newsletter-actions";

vi.mock("@/lib/forms", async () => import("../../src/lib/forms"));

const reply = (status: number, body?: unknown) =>
  vi.fn<typeof fetch>(async () => new Response(body === undefined ? null : typeof body === "string" ? body : JSON.stringify(body), { status }));
const run = (kind: NewsletterActionKind, fetchFn: typeof fetch, signal = new AbortController().signal) => performNewsletterAction(kind, "opaque-token", signal, fetchFn);

describe("performNewsletterAction transport", () => {
  it("POSTs only the token, uncached and same-origin, to the matching endpoint", async () => {
    for (const [kind, url, status] of [["confirm", "/api/newsletter/confirmar", "confirmed"], ["cancel", "/api/newsletter/cancelar", "cancelled"]] as const) {
      const fetchFn = reply(200, { status });
      await run(kind, fetchFn);
      const [target, init] = fetchFn.mock.calls[0];
      expect(target).toBe(url);
      expect(init).toMatchObject({ method: "POST", cache: "no-store", credentials: "same-origin" });
      expect(JSON.parse(String(init?.body))).toEqual({ token: "opaque-token" });
    }
  });

  it("succeeds only on a 200 with the expected status and keeps the edition flags", async () => {
    expect(await run("confirm", reply(200, { status: "confirmed", editionQueued: true, selectedEditionUnavailable: false }))).toEqual({ result: "done", editionQueued: true, editionUnavailable: false });
    expect(await run("confirm", reply(200, { status: "confirmed", editionQueued: false, selectedEditionUnavailable: true }))).toEqual({ result: "done", editionQueued: false, editionUnavailable: true });
    expect(await run("cancel", reply(200, { status: "cancelled" }))).toMatchObject({ result: "done" });
    expect((await run("cancel", reply(200, { status: "confirmed" }))).result).toBe("uncertain");
    expect((await run("confirm", reply(200, { status: "cancelled" }))).result).toBe("uncertain");
    expect((await run("confirm", reply(200, "not json"))).result).toBe("uncertain");
    expect((await run("confirm", reply(200))).result).toBe("uncertain");
    expect((await run("confirm", reply(202, { status: "confirmed" }))).result).toBe("uncertain");
    expect((await run("cancel", reply(204))).result).toBe("uncertain");
  });

  it("classifies each failure without calling a transient failure an invalid link", async () => {
    expect((await run("confirm", reply(400, { code: "invalid_link" }))).result).toBe("invalid");
    expect((await run("confirm", reply(403, { code: "forbidden_origin" }))).result).toBe("forbidden");
    expect((await run("confirm", reply(403))).result).toBe("forbidden");
    expect((await run("confirm", reply(409, { code: "already_used" }))).result).toBe("stale");
    expect((await run("confirm", reply(410, { code: "expired_link" }))).result).toBe("stale");
    expect((await run("cancel", reply(409, { code: "invalid_link" }))).result).toBe("stale");
    expect(await run("cancel", reply(429, { code: "rate_limited", retryAfter: 30 }))).toEqual({ result: "rate_limited", retryAfter: 30 });
    expect(await run("cancel", reply(429, { retryAfter: 0 }))).toEqual({ result: "rate_limited" });
    expect(await run("cancel", reply(429))).toEqual({ result: "rate_limited" });
    expect((await run("confirm", reply(503, { code: "not_operational" }))).result).toBe("unavailable");
    for (const status of [401, 404, 500, 502, 504]) expect((await run("confirm", reply(status))).result).toBe("uncertain");
    const down = vi.fn<typeof fetch>(async () => {
      throw new TypeError("network");
    });
    expect((await run("cancel", down)).result).toBe("uncertain");
  });

  it("rethrows aborts and never sends after abort", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchFn = reply(200, { status: "confirmed" });
    await expect(run("confirm", fetchFn, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchFn).not.toHaveBeenCalled();

    const late = new AbortController();
    const slow = vi.fn<typeof fetch>(async () => {
      late.abort();
      throw new DOMException("aborted", "AbortError");
    });
    await expect(run("cancel", slow, late.signal)).rejects.toMatchObject({ name: "AbortError" });

    const lateBody = new AbortController();
    const abortedAfterResponse = vi.fn<typeof fetch>(async () => {
      queueMicrotask(() => lateBody.abort());
      return new Response(JSON.stringify({ status: "confirmed" }), { status: 200 });
    });
    await expect(run("confirm", abortedAfterResponse, lateBody.signal)).rejects.toMatchObject({ name: "AbortError" });
  });

  it("retries with the same token payload when a retryable result is repeated", async () => {
    const fetchFn = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "confirmed" }), { status: 200 }));
    expect((await run("confirm", fetchFn)).result).toBe("unavailable");
    expect((await run("confirm", fetchFn)).result).toBe("done");
    expect(fetchFn.mock.calls.map(([, init]) => String(init?.body))).toEqual(['{"token":"opaque-token"}', '{"token":"opaque-token"}']);
  });
});

describe("tokenFromFragment", () => {
  it("reads only an explicit token key and ignores unrelated anchors", () => {
    expect(tokenFromFragment("#token=abc.def")).toBe("abc.def");
    expect(tokenFromFragment("token=abc")).toBe("abc");
    expect(tokenFromFragment("#token=")).toBe("");
    expect(tokenFromFragment("#conteudo")).toBeNull();
    expect(tokenFromFragment("")).toBeNull();
  });
});

describe("newsletter action feedback", () => {
  const results: NewsletterActionResult[] = [
    { result: "done", editionQueued: false, editionUnavailable: false },
    { result: "invalid" }, { result: "stale" }, { result: "forbidden" }, { result: "rate_limited" }, { result: "rate_limited", retryAfter: 61 }, { result: "unavailable" }, { result: "uncertain" },
  ];

  it("never calls a retryable or authorization outcome an invalid link", () => {
    for (const kind of ["confirm", "cancel"] as const) {
      for (const state of results.filter((item) => canRetryNewsletterAction(item.result) || item.result === "forbidden")) {
        const { title, message } = newsletterActionFeedback(kind, state);
        expect(`${title} ${message}`.toLowerCase()).not.toMatch(/inválid|expirou|não é mais válido/);
      }
    }
  });

  it("uses the shared static wait phrase for 429 with and without retryAfter", () => {
    expect(newsletterActionFeedback("confirm", { result: "rate_limited", retryAfter: 61 }).message).toContain("em 2 minutos");
    expect(newsletterActionFeedback("cancel", { result: "rate_limited" }).message).not.toMatch(/\d/);
  });

  it("keeps confirmation honest about delivery and edition availability", () => {
    const text = (editionQueued: boolean, editionUnavailable: boolean) => newsletterActionFeedback("confirm", { result: "done", editionQueued, editionUnavailable }).message;
    expect(text(false, true)).toContain("não está disponível para envio");
    expect(text(false, true)).toContain("sem garantia");
    expect(text(true, false)).toContain("não é garantida");
    expect(text(false, false)).toContain("sem garantia");
    for (const value of [text(false, true), text(true, false), text(false, false)]) expect(value).not.toMatch(/foi enviado|entregue|você receberá a edição/);
  });

  it("keeps cancellation independent and the stale/invalid guidance neutral", () => {
    expect(newsletterActionFeedback("cancel", results[0]).message).toContain("não altera uma autorização separada");
    expect(newsletterActionFeedback("cancel", { result: "stale" }).message).toContain("contato@roottrust.com.br");
    expect(newsletterActionFeedback("cancel", { result: "stale" }).action).toBe("contact");
    expect(newsletterActionFeedback("confirm", { result: "stale" }).action).toBe("renew");
    expect(newsletterActionFeedback("cancel", { result: "invalid" }).message).not.toMatch(/responda/i);
  });

  it("only retains the retry path for unavailable, limited and uncertain results", () => {
    expect(results.filter((item) => canRetryNewsletterAction(item.result)).map((item) => item.result)).toEqual(["rate_limited", "rate_limited", "unavailable", "uncertain"]);
  });
  it("does not infer an active subscription from a consumed link or promise a used-link reply for cancellation", () => {
    for (const kind of ["confirm", "cancel"] as const) {
      expect(newsletterActionFeedback(kind, { result: "stale" }).message).not.toMatch(/nada mais precisa|inscrição ativa|acabou de/);
      expect(newsletterActionFeedback(kind, { result: "uncertain" }).message).not.toMatch(/avisará que o link foi usado/);
    }
  });
});

describe("FeedbackPanel", () => {
  it("keeps FormStatus idle as a single empty live region without a visible panel", () => {
    const html = renderToStaticMarkup(createElement(FormStatus, { mode: "pilot", status: "idle", kind: "newsletter" }));
    expect(html.match(/role="status"/g)).toHaveLength(1);
    expect(html).toContain('class="srOnly"');
    expect(html).not.toContain("<svg");
  });

  it("renders the shared panel with decorative icon, title, message and the renew action", () => {
    const feedback = newsletterActionFeedback("confirm", { result: "stale" });
    const html = renderToStaticMarkup(createElement(FeedbackPanel, { feedback, renewHref: "/newsletter" }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(feedback.title);
    expect(html).toContain('role="status"');
    expect(html).toContain('href="/newsletter"');
    expect(html).toContain('data-tone="problem"');
  });
});
