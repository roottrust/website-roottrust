import { isIP } from "node:net";
import { opaqueId } from "./ids";
import { parseLimitOverrides, type Limits } from "./limits";
import { logEvent, safeErrorCode } from "./safe";
import type { Store } from "./store";
import { COLLECTIONS, type ReplayRecord } from "./types";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TOKEN_MAX_LENGTH = 2048;
const CHALLENGE_MAX_AGE_MS = 5 * 60_000;
const TOKEN_MEMORY_MS = 10 * 60_000;
const MIN_SECRET_LENGTH = 32;

export interface DefenseConfig {
  turnstileSecret: string;
  turnstileHostnames: string[];
  trustedOrigins: string[];
  ipHeader: string;
  limits: Limits;
  fetch: typeof fetch;
  turnstileTimeoutMs: number;
}

const list = (value: string | undefined): string[] =>
  (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

// Every setting is required: pilot never runs half-protected. `missing` names variables only, never values.
export function loadDefenseConfig(
  env: Record<string, string | undefined> = process.env,
  fetchFn: typeof fetch = fetch,
): { config?: DefenseConfig; missing: string[] } {
  const missing: string[] = [];
  const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
  if (!turnstileSecret) missing.push("TURNSTILE_SECRET_KEY");
  const turnstileHostnames = list(env.TURNSTILE_HOSTNAMES).map((host) => host.toLowerCase());
  if (!turnstileHostnames.length) missing.push("TURNSTILE_HOSTNAMES");
  const trustedOrigins = list(env.TRUSTED_ORIGINS).flatMap((origin) => {
    try {
      return [new URL(origin).origin];
    } catch {
      return [];
    }
  });
  if (!trustedOrigins.length || trustedOrigins.length !== list(env.TRUSTED_ORIGINS).length) missing.push("TRUSTED_ORIGINS");
  const ipHeader = env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (!ipHeader || !/^[a-z0-9-]{1,64}$/.test(ipHeader)) missing.push("TRUSTED_IP_HEADER");
  const limits = parseLimitOverrides(env.RATE_LIMITS_JSON);
  if (!limits) missing.push("RATE_LIMITS_JSON");
  if (missing.length || !turnstileSecret || !ipHeader || !limits) return { missing };
  return { missing, config: { turnstileSecret, turnstileHostnames, trustedOrigins, ipHeader, limits, fetch: fetchFn, turnstileTimeoutMs: 3000 } };
}

export const hasIdSecret = (secret: string | undefined): secret is string => !!secret && secret.length >= MIN_SECRET_LENGTH;

// Origin/Referer is checked against the configured allowlist; Sec-Fetch-Site, when sent, must say same-origin.
// This is browser protection (CSRF/cross-site posting), not identity: non-browser clients can forge both headers.
export function isTrustedOrigin(request: Request, trusted: readonly string[]): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  let origin = request.headers.get("origin");
  if (origin === null) {
    try {
      origin = new URL(request.headers.get("referer") ?? "").origin;
    } catch {
      return false;
    }
  }
  return trusted.includes(origin);
}

function expandIpv6(address: string): string[] | undefined {
  const [head, tail, extra] = address.toLowerCase().split("::");
  if (extra !== undefined) return undefined;
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const fill = tail === undefined ? 0 : 8 - left.length - right.length;
  const groups = [...left, ...Array<string>(Math.max(fill, 0)).fill("0"), ...right];
  return groups.length === 8 ? groups.map((group) => group.padStart(4, "0")) : undefined;
}

// The header must be the platform-set client address (single IP). Anything else is untrusted: no key, so fail closed.
// IPv6 is bucketed by /64 so one subscriber cannot rotate through its prefix to dodge the limits.
export function clientIpKey(request: Request, header: string): string | undefined {
  const raw = request.headers.get(header)?.trim();
  if (!raw || !isIP(raw)) return undefined;
  if (isIP(raw) === 4) return raw;
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(raw);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];
  const groups = expandIpv6(raw);
  return groups ? `${groups.slice(0, 4).join(":")}::/64` : undefined;
}

export type TurnstileOutcome = "ok" | "rejected" | "unavailable";

interface SiteverifyResponse {
  success?: boolean;
  hostname?: string;
  action?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
}

// The token is reserved (single use) before the provider call, so concurrent replays lose even before Cloudflare answers.
// If the provider cannot answer, the reservation is released: Cloudflare itself still rejects a token it already consumed.
export async function verifyTurnstile(options: {
  store: Store;
  secret: string;
  config: DefenseConfig;
  token: string | null;
  action: string;
  remoteIp: string | undefined;
  now: Date;
}): Promise<TurnstileOutcome> {
  const { store, secret, config, token, action, remoteIp, now } = options;
  if (!token || token.length > TOKEN_MAX_LENGTH) return "rejected";
  const id = opaqueId(secret, "tt", token);
  const reserved = await store.transaction(async (tx) => {
    if (await tx.get(COLLECTIONS.replays, id)) return false;
    const record: ReplayRecord = { id, expiresAt: new Date(now.getTime() + TOKEN_MEMORY_MS).toISOString() };
    tx.set(COLLECTIONS.replays, id, record);
    return true;
  });
  if (!reserved) return "rejected";

  const release = () =>
    store.transaction(async (tx) => tx.delete(COLLECTIONS.replays, id)).catch((error: unknown) => {
      logEvent("error", "turnstile_release_failed", { error: safeErrorCode(error) });
    });

  let body: SiteverifyResponse;
  try {
    const form = new URLSearchParams({ secret: config.turnstileSecret, response: token, idempotency_key: crypto.randomUUID() });
    if (remoteIp) form.set("remoteip", remoteIp);
    const response = await config.fetch(SITEVERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(config.turnstileTimeoutMs),
    });
    if (!response.ok) throw new Error("siteverify_status");
    body = (await response.json()) as SiteverifyResponse;
  } catch (error) {
    logEvent("warn", "turnstile_unavailable", { error: safeErrorCode(error) });
    await release();
    return "unavailable";
  }

  if (body["error-codes"]?.includes("internal-error")) {
    await release();
    return "unavailable";
  }
  const challengeAt = body.challenge_ts ? Date.parse(body.challenge_ts) : Number.NaN;
  const fresh = Number.isFinite(challengeAt) && now.getTime() - challengeAt <= CHALLENGE_MAX_AGE_MS && challengeAt - now.getTime() <= 60_000;
  const valid =
    body.success === true &&
    body.action === action &&
    typeof body.hostname === "string" &&
    config.turnstileHostnames.includes(body.hostname.toLowerCase()) &&
    fresh;
  if (!valid) logEvent("warn", "turnstile_rejected", { action });
  return valid ? "ok" : "rejected";
}
