import { DRAFT_ID, DRAFT_PATH } from "../../src/lib/server/newsletter-protocol";

export interface Env {
  NEWSLETTER_INGRESS_TOKEN: string;
  INTERNAL_KEY_DRAFT: string;
  SITE_ORIGIN: string;
}

const ENCODER = new TextEncoder();
const MAX_BODY_BYTES = 64 * 1024 + 4096;
const MAX_RESPONSE_BYTES = 4096;
const READ_TIMEOUT_MS = 10_000;
const UPSTREAM_TIMEOUT_MS = 20_000;
const ERROR_CODES: Record<number, readonly string[]> = {
  400: ["invalid_request", "too_large"],
  401: ["unauthorized"],
  404: ["draft_not_found"],
  409: ["slug_exists", "slug_mismatch", "approved", "not_regenerating"],
  429: ["rate_limited"],
  503: ["unavailable", "misconfigured", "not_operational", "storage_unavailable"],
};

const reply = (status: number, data: Record<string, unknown>, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

function validSecret(value: unknown): value is string {
  return typeof value === "string" && value.length >= 32 && value.length <= 4096 && !/[\s,]/u.test(value);
}

function destination(env: Env): string | undefined {
  if (!validSecret(env.NEWSLETTER_INGRESS_TOKEN) || !validSecret(env.INTERNAL_KEY_DRAFT) || env.NEWSLETTER_INGRESS_TOKEN === env.INTERNAL_KEY_DRAFT) return undefined;
  try {
    const origin = new URL(env.SITE_ORIGIN);
    if (origin.protocol !== "https:" || origin.origin !== env.SITE_ORIGIN) return undefined;
    return new URL(DRAFT_PATH, origin).toString();
  } catch {
    return undefined;
  }
}

async function authorized(header: string, token: string): Promise<boolean> {
  if (header.length > 4103 || !/^Bearer [^\s,]{32,4096}$/u.test(header)) return false;
  const key = await crypto.subtle.importKey("raw", ENCODER.encode(token), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  // Web Crypto verifies the MAC without a JavaScript string/byte comparison of the supplied credential.
  const expected = await crypto.subtle.sign("HMAC", key, ENCODER.encode(token));
  return crypto.subtle.verify("HMAC", key, expected, ENCODER.encode(header.slice(7)));
}

class BoundaryError extends Error {
  constructor(readonly code: "too_large" | "timeout") { super(code); }
}

async function readBounded(stream: ReadableStream<Uint8Array> | null, maximum: number, signal: AbortSignal): Promise<Uint8Array> {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const cancel = () => { void reader.cancel().catch(() => undefined); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    for (;;) {
      if (signal.aborted) throw new BoundaryError("timeout");
      const { done, value } = await reader.read();
      if (signal.aborted) throw new BoundaryError("timeout");
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        cancel();
        throw new BoundaryError("too_large");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return body;
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}

async function deadline<T>(milliseconds: number, operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation(controller.signal),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new BoundaryError("timeout")); }, milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function objectJson(bytes: Uint8Array): Record<string, unknown> {
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_json");
  return value as Record<string, unknown>;
}

async function signature(key: string, body: Uint8Array, timestamp: number, nonce: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", body as BufferSource));
  const hash = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const canonical = ["v1", "draft", "POST", DRAFT_PATH, timestamp, nonce, hash].join("\n");
  const hmac = await crypto.subtle.importKey("raw", ENCODER.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", hmac, ENCODER.encode(canonical)));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function handleDraft(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/draft" || url.search) return reply(404, { code: "not_found" });
  if (request.method !== "POST") return reply(405, { code: "method_not_allowed" }, { Allow: "POST" });
  const target = destination(env);
  if (!target) return reply(503, { code: "misconfigured" });
  try {
    if (!(await authorized(request.headers.get("authorization") ?? "", env.NEWSLETTER_INGRESS_TOKEN))) return reply(401, { code: "unauthorized" });
  } catch {
    return reply(503, { code: "misconfigured" });
  }
  if (!/^application\/json(?:\s*;|$)/iu.test(request.headers.get("content-type") ?? "")) return reply(415, { code: "unsupported_media_type" });
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return reply(413, { code: "too_large" });
  let body: Uint8Array;
  try {
    body = await deadline(READ_TIMEOUT_MS, (signal) => readBounded(request.body, MAX_BODY_BYTES, signal));
    objectJson(body);
  } catch (error) {
    if (error instanceof BoundaryError) return reply(error.code === "timeout" ? 408 : 413, { code: error.code === "timeout" ? "request_timeout" : "too_large" });
    return reply(400, { code: "invalid_request" });
  }

  try {
    return await deadline(UPSTREAM_TIMEOUT_MS, async (signal) => {
      const timestamp = Date.now();
      const nonce = crypto.randomUUID();
      const signed = await signature(env.INTERNAL_KEY_DRAFT, body, timestamp, nonce);
      if (signal.aborted) throw new BoundaryError("timeout");
      const response = await fetcher(target, {
        method: "POST", redirect: "manual", signal,
        headers: { "content-type": "application/json", "x-rt-timestamp": String(timestamp), "x-rt-nonce": nonce, "x-rt-signature": signed },
        body: body as BodyInit,
      });
      if (response.status !== 202 && !ERROR_CODES[response.status]) {
        void response.body?.cancel().catch(() => undefined);
        return reply(502, { code: "upstream_uncertain" });
      }
      if (Number(response.headers.get("content-length")) > MAX_RESPONSE_BYTES) {
        void response.body?.cancel().catch(() => undefined);
        return reply(502, { code: "upstream_uncertain" });
      }
      const answer = objectJson(await readBounded(response.body, MAX_RESPONSE_BYTES, signal));
      if (response.status === 202) {
        if (answer.status !== "queued" || typeof answer.draftId !== "string" || !DRAFT_ID.test(answer.draftId) || typeof answer.revision !== "number" || !Number.isSafeInteger(answer.revision) || answer.revision < 1) return reply(502, { code: "upstream_uncertain" });
        return reply(202, { status: "queued", draftId: answer.draftId, revision: answer.revision });
      }
      if (typeof answer.code !== "string" || !ERROR_CODES[response.status].includes(answer.code)) return reply(502, { code: "upstream_uncertain" });
      return reply(response.status, { code: answer.code });
    });
  } catch (error) {
    return reply(error instanceof BoundaryError && error.code === "timeout" ? 504 : 502, { code: "upstream_uncertain" });
  }
}

const worker = { fetch: (request: Request, env: Env) => handleDraft(request, env) };
export default worker;
