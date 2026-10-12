import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { opaqueId } from "./ids";
import type { Store } from "./store";
import { COLLECTIONS, type ReplayRecord } from "./types";

// One credential family per capability: a draft key can never publish, a publish key can never run jobs.
export const INTERNAL_SCOPES = ["jobs", "draft", "publish"] as const;
export type InternalScope = (typeof INTERNAL_SCOPES)[number];
// Several keys per scope allow rotation (current + previous).
export type InternalKeys = Partial<Record<InternalScope, string[]>>;

export const SKEW_MS = 60_000;
const NONCE = /^[A-Za-z0-9_-]{16,64}$/;
const MIN_KEY_LENGTH = 32;

// INTERNAL_KEY_<SCOPE>=key[,previousKey]. Invalid (short or shared between scopes) => undefined: fail closed.
export function loadInternalKeys(env: Record<string, string | undefined> = process.env): InternalKeys | undefined {
  const keys: InternalKeys = {};
  const seen = new Set<string>();
  for (const scope of INTERNAL_SCOPES) {
    const values = (env[`INTERNAL_KEY_${scope.toUpperCase()}`] ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    for (const value of values) {
      if (value.length < MIN_KEY_LENGTH || seen.has(value)) return undefined;
      seen.add(value);
    }
    if (values.length) keys[scope] = values;
  }
  return keys;
}

export function signInternalRequest(
  key: string,
  parts: { scope: InternalScope; method: string; pathname: string; timestamp: number; nonce: string; body: Uint8Array },
): string {
  const bodyHash = createHash("sha256").update(parts.body).digest("hex");
  const canonical = ["v1", parts.scope, parts.method.toUpperCase(), parts.pathname, parts.timestamp, parts.nonce, bodyHash].join("\n");
  return createHmac("sha256", key).update(canonical).digest("base64url");
}

export type InternalAuthResult =
  | { ok: true; body: Uint8Array }
  | { ok: false; status: 400 | 401 | 503; reason: "misconfigured" | "malformed" | "bad_timestamp" | "bad_signature" | "replay" | "too_large" };

async function readCapped(request: Request, max: number): Promise<Uint8Array | undefined> {
  const chunks: Uint8Array[] = [];
  let received = 0;
  if (request.body) {
    const reader = request.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > max) {
        await reader.cancel().catch(() => undefined);
        return undefined;
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

// Signature covers scope, method, path, timestamp, nonce and body hash. The nonce is recorded only after the signature
// verifies (unauthenticated callers cannot fill storage) and inside a transaction, so concurrent replays have one winner.
export async function authenticateInternal(
  request: Request,
  options: { scope: InternalScope; keys: InternalKeys | undefined; store: Store; idSecret: string; now: Date; maxBodyBytes: number },
): Promise<InternalAuthResult> {
  const { scope, keys, store, idSecret, now, maxBodyBytes } = options;
  const scopeKeys = keys?.[scope];
  if (!scopeKeys?.length) return { ok: false, status: 503, reason: "misconfigured" };

  const timestamp = request.headers.get("x-rt-timestamp") ?? "";
  const nonce = request.headers.get("x-rt-nonce") ?? "";
  const signature = request.headers.get("x-rt-signature") ?? "";
  if (!/^\d{10,16}$/.test(timestamp) || !NONCE.test(nonce) || !signature) return { ok: false, status: 401, reason: "malformed" };
  if (Math.abs(now.getTime() - Number(timestamp)) > SKEW_MS) return { ok: false, status: 401, reason: "bad_timestamp" };

  const body = await readCapped(request, maxBodyBytes);
  if (!body) return { ok: false, status: 400, reason: "too_large" };

  const given = Buffer.from(signature, "utf8");
  const parts = { scope, method: request.method, pathname: new URL(request.url).pathname, timestamp: Number(timestamp), nonce, body };
  let matched = false;
  for (const key of scopeKeys) {
    const expected = Buffer.from(signInternalRequest(key, parts), "utf8");
    if (expected.length === given.length && timingSafeEqual(expected, given)) matched = true;
  }
  if (!matched) return { ok: false, status: 401, reason: "bad_signature" };

  const id = opaqueId(idSecret, "rp", `${scope}:${nonce}`);
  const fresh = await store.transaction(async (tx) => {
    if (await tx.get(COLLECTIONS.replays, id)) return false;
    const record: ReplayRecord = { id, expiresAt: new Date(now.getTime() + 2 * SKEW_MS).toISOString() };
    tx.set(COLLECTIONS.replays, id, record);
    return true;
  });
  return fresh ? { ok: true, body } : { ok: false, status: 401, reason: "replay" };
}
