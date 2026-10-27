import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticateInternal, signInternalRequest } from "../../../src/lib/server/internal-auth";
import { createMemoryStore } from "../../../src/lib/server/store";
import { DRAFT_PATH } from "../../../src/lib/server/newsletter-protocol";
import { handleDraft, type Env } from "../../../workers/newsletter-ingress/index";

const env: Env = { SITE_ORIGIN: "https://site.example", NEWSLETTER_INGRESS_TOKEN: "entry-test-".repeat(4), INTERNAL_KEY_DRAFT: "draft-test-".repeat(4) };
const ID = "ed_00000000-0000-4000-8000-000000000000";
const BODY = '{ "titulo": "Análise privada √", "corpo": "PRIVATE_SENTINEL" }';
const queued = () => Response.json({ status: "queued", draftId: ID, revision: 1, corpo: "PRIVATE_SENTINEL", token: env.NEWSLETTER_INGRESS_TOKEN }, { status: 202 });

function request(options: { body?: BodyInit; path?: string; method?: string; headers?: Record<string, string> } = {}) {
  const method = options.method ?? "POST";
  return new Request(`https://ingress.example${options.path ?? "/draft"}`, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${env.NEWSLETTER_INGRESS_TOKEN}`, ...options.headers },
    ...(method === "GET" ? {} : { body: options.body ?? BODY, duplex: "half" }),
  } as RequestInit);
}

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("newsletter draft ingress", () => {
  it("forwards exact bytes with compatible HMAC, fresh nonces and no client credentials", async () => {
    const store = createMemoryStore();
    const nonces: string[] = [];
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      expect(url).toBe(`https://site.example${DRAFT_PATH}`);
      expect(init?.redirect).toBe("manual");
      const headers = new Headers(init?.headers);
      expect([...headers.keys()].sort()).toEqual(["content-type", "x-rt-nonce", "x-rt-signature", "x-rt-timestamp"]);
      const nonce = headers.get("x-rt-nonce")!;
      nonces.push(nonce);
      expect(headers.get("x-rt-signature")).toBe(signInternalRequest(env.INTERNAL_KEY_DRAFT, {
        scope: "draft", method: "POST", pathname: DRAFT_PATH, timestamp: Number(headers.get("x-rt-timestamp")), nonce, body: new TextEncoder().encode(BODY),
      }));
      const proof = await authenticateInternal(new Request(String(url), init), { scope: "draft", keys: { draft: [env.INTERNAL_KEY_DRAFT] }, store, idSecret: "id-test-".repeat(5), now: new Date(), maxBodyBytes: 69632 });
      expect(proof.ok).toBe(true);
      if (proof.ok) expect(new TextDecoder().decode(proof.body)).toBe(BODY);
      return queued();
    });
    const response = await handleDraft(request({ headers: { "x-rt-signature": "spoof", "x-forwarded-host": "evil.example" } }), env, fetcher);
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "queued", draftId: ID, revision: 1 });
    expect(response.headers.get("cache-control")).toBe("no-store");
    await handleDraft(request(), env, fetcher);
    expect(new Set(nonces).size).toBe(2);
  });

  it.each([
    { SITE_ORIGIN: "http://site.example" }, { SITE_ORIGIN: "https://site.example/" },
    { SITE_ORIGIN: "https://site.example/path" }, { SITE_ORIGIN: "https://user:pass@site.example" },
    { SITE_ORIGIN: "https://site.example?target=evil" }, { SITE_ORIGIN: "https://site.example#part" },
    { INTERNAL_KEY_DRAFT: "short" }, { INTERNAL_KEY_DRAFT: `${env.INTERNAL_KEY_DRAFT},previous` },
    { NEWSLETTER_INGRESS_TOKEN: "" }, { NEWSLETTER_INGRESS_TOKEN: "a b".repeat(16) },
    { NEWSLETTER_INGRESS_TOKEN: env.INTERNAL_KEY_DRAFT },
  ])("fails closed for invalid configuration %j", async (override) => {
    const fetcher = vi.fn<typeof fetch>();
    const response = await handleDraft(request(), { ...env, ...override }, fetcher);
    expect(response.status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(["", "Basic abc", `Bearer ${"wrong".repeat(10)}`, `Bearer ${env.NEWSLETTER_INGRESS_TOKEN},other`, `Bearer ${"x".repeat(4100)}`])("rejects invalid credentials without reading the body or calling API", async (authorization) => {
    const read = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ pull: read }, { highWaterMark: 0 });
    const fetcher = vi.fn<typeof fetch>();
    expect((await handleDraft(request({ body: stream, headers: { authorization } }), env, fetcher)).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([{ path: "/" }, { path: "/draft?url=https://evil.example" }, { method: "GET" }])("rejects other methods/paths", async (options) => {
    const fetcher = vi.fn<typeof fetch>();
    const response = await handleDraft(request(options), env, fetcher);
    expect(response.status).toBe(options.method ? 405 : 404);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(["{", "null", "[]", "true", '"text"', new Uint8Array([0xff])])("rejects invalid JSON/UTF-8 before forwarding", async (body) => {
    const fetcher = vi.fn<typeof fetch>();
    expect((await handleDraft(request({ body }), env, fetcher)).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects media type and declared oversized content", async () => {
    const fetcher = vi.fn<typeof fetch>();
    expect((await handleDraft(request({ headers: { "content-type": "text/plain" } }), env, fetcher)).status).toBe(415);
    expect((await handleDraft(request({ headers: { "content-length": "69633" } }), env, fetcher)).status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("counts chunked bytes despite a false content length and cancels excess", async () => {
    const cancel = vi.fn();
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) { controller.enqueue(new Uint8Array(4096)); pulls++; }, cancel,
    }, { highWaterMark: 0 });
    const fetcher = vi.fn<typeof fetch>();
    expect((await handleDraft(request({ body: stream, headers: { "content-length": "1" } }), env, fetcher)).status).toBe(413);
    expect(pulls).toBe(18);
    expect(cancel).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("accepts the exact byte boundary", async () => {
    const body = JSON.stringify({ x: "x".repeat(69624) });
    expect(new TextEncoder().encode(body)).toHaveLength(69632);
    const fetcher = vi.fn<typeof fetch>(async () => queued());
    expect((await handleDraft(request({ body }), env, fetcher)).status).toBe(202);
  });

  it("times out a stalled incoming stream without forwarding", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ cancel }, { highWaterMark: 0 });
    const fetcher = vi.fn<typeof fetch>();
    const pending = handleDraft(request({ body: stream }), env, fetcher);
    await vi.waitUntil(() => vi.getTimerCount() > 0);
    await vi.advanceTimersByTimeAsync(10000);
    expect((await pending).status).toBe(408);
    expect(cancel).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([400, 401, 404, 409, 429, 503])("passes only allowlisted failure codes (%s), excluding provider details", async (status) => {
    const codes: Record<number, string> = { 400: "invalid_request", 401: "unauthorized", 404: "draft_not_found", 409: "slug_exists", 429: "rate_limited", 503: "storage_unavailable" };
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({ code: codes[status], corpo: BODY, details: env.INTERNAL_KEY_DRAFT }, { status }));
    const response = await handleDraft(request(), env, fetcher);
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ code: codes[status] });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it.each([
    () => new Response(null, { status: 302, headers: { location: "https://evil.example" } }),
    () => Response.json({ code: BODY }, { status: 409 }),
    () => Response.json({ status: "queued", draftId: "bad-id", revision: 1 }, { status: 202 }),
    () => Response.json({ status: "queued", draftId: ID, revision: 1.5 }, { status: 202 }),
    () => Response.json({ status: "sent", draftId: ID, revision: 1 }, { status: 202 }),
    () => new Response("private malformed body", { status: 202 }),
    () => Response.json({ corpo: "x".repeat(4096) }, { status: 202 }),
    () => new Response("private error", { status: 500 }),
  ])("does not retry/redirect or expose unexpected responses", async (answer) => {
    const log = vi.spyOn(console, "error");
    const fetcher = vi.fn<typeof fetch>(async () => answer());
    const response = await handleDraft(request(), env, fetcher);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "upstream_uncertain" });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(log).not.toHaveBeenCalled();
  });

  it("keeps network failures private without retry", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => { throw new Error(`${BODY} ${env.INTERNAL_KEY_DRAFT}`); });
    const response = await handleDraft(request(), env, fetcher);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "upstream_uncertain" });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it.each(["fetch", "response stream"])("bounds total upstream time even if %s stalls", async (stage) => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    let upstreamSignal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>(async (_, init) => {
      upstreamSignal = init?.signal as AbortSignal;
      if (stage === "fetch") return new Promise<Response>(() => undefined);
      return new Response(new ReadableStream<Uint8Array>({ cancel }, { highWaterMark: 0 }), { status: 202 });
    });
    const pending = handleDraft(request(), env, fetcher);
    await vi.waitUntil(() => fetcher.mock.calls.length === 1);
    await vi.advanceTimersByTimeAsync(20000);
    const response = await pending;
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ code: "upstream_uncertain" });
    expect(upstreamSignal?.aborted).toBe(true);
    expect(fetcher).toHaveBeenCalledOnce();
    if (stage === "response stream") expect(cancel).toHaveBeenCalledOnce();
  });
});
