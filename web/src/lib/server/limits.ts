import { opaqueId } from "./ids";
import type { Tx } from "./store";
import { COLLECTIONS, type RateLimitRecord } from "./types";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// Pilot ceilings (PLAN 4.3); RATE_LIMITS_JSON may only lower them (free-plan ceilings).
export interface Limits {
  ipBurst: number; // per IP, per 10 min
  ipDaily: number;
  diagnosticWhatsappDaily: number;
  subscriptionEmailDaily: number;
  subscriptionEditionDaily: number;
  reportToolDaily: number;
  reportEmailDaily: number;
}

export const DEFAULT_LIMITS: Limits = {
  ipBurst: 10,
  ipDaily: 20,
  diagnosticWhatsappDaily: 3,
  subscriptionEmailDaily: 3,
  subscriptionEditionDaily: 1,
  reportToolDaily: 1,
  reportEmailDaily: 4,
};

// Unknown keys, non-integers, values < 1 or above the default make the whole override invalid (fail closed).
export function parseLimitOverrides(raw: string | undefined): Limits | undefined {
  if (!raw) return DEFAULT_LIMITS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return undefined;
    const limits: Limits = { ...DEFAULT_LIMITS };
    for (const [key, value] of Object.entries(parsed)) {
      if (!(key in DEFAULT_LIMITS)) return undefined;
      const name = key as keyof Limits;
      if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > DEFAULT_LIMITS[name]) return undefined;
      limits[name] = value;
    }
    return limits;
  } catch {
    return undefined;
  }
}

export interface LimitSpec {
  name: string;
  identity: string;
  limit: number;
  windowMs: number;
}

export type Denied = { ok: false; retryAfterSec: number };
export type Gate = (tx: Tx) => Promise<Denied | undefined>;

export const ipLimitSpecs = (ipKey: string, limits: Limits): LimitSpec[] => [
  { name: "ip10m", identity: ipKey, limit: limits.ipBurst, windowMs: 10 * MINUTE },
  { name: "ipday", identity: ipKey, limit: limits.ipDaily, windowMs: DAY },
];

// Fixed window starting at the first hit. Reads every bucket first and writes only if none is exhausted, so a denied
// request consumes nothing from the buckets of THIS call and concurrent callers cannot overshoot (the transaction
// serializes them). Counters consumed by an earlier call (e.g. the IP gate, see http.ts) are not rolled back.
export async function consumeLimits(tx: Tx, secret: string, specs: LimitSpec[], now: Date): Promise<Denied | undefined> {
  const at = now.getTime();
  const states = await Promise.all(
    specs.map(async (spec) => {
      const id = opaqueId(secret, "rl", `${spec.name}:${spec.identity}`);
      const current = await tx.get<RateLimitRecord>(COLLECTIONS.rateLimits, id);
      const live = current !== undefined && at < current.windowStart + spec.windowMs;
      return { spec, id, windowStart: live ? current.windowStart : at, count: live ? current.count : 0 };
    }),
  );
  const exhausted = states.filter((state) => state.count >= state.spec.limit);
  if (exhausted.length) {
    const waitMs = Math.max(...exhausted.map((state) => state.windowStart + state.spec.windowMs - at));
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(waitMs / 1000)) };
  }
  for (const { spec, id, windowStart, count } of states) {
    const record: RateLimitRecord = { id, count: count + 1, windowStart, expiresAt: new Date(windowStart + spec.windowMs).toISOString() };
    tx.set(COLLECTIONS.rateLimits, id, record);
  }
  return undefined;
}

export const gateOf = (secret: string, specs: LimitSpec[], now: Date): Gate => (tx) => consumeLimits(tx, secret, specs, now);

export const diagnosticLimitSpecs = (whatsapp: string, limits: Limits): LimitSpec[] => [
  { name: "whatsapp-day", identity: whatsapp, limit: limits.diagnosticWhatsappDaily, windowMs: DAY },
];

export const subscriptionLimitSpecs = (value: { email: string; editionSlug?: string }, limits: Limits): LimitSpec[] => [
  { name: "sub-email-day", identity: value.email, limit: limits.subscriptionEmailDaily, windowMs: DAY },
  { name: "sub-edition-day", identity: `${value.email}|${value.editionSlug ?? "latest"}`, limit: limits.subscriptionEditionDaily, windowMs: DAY },
];

export const reportLimitSpecs = (value: { email: string; toolId: string }, limits: Limits): LimitSpec[] => [
  { name: "report-tool-day", identity: `${value.email}|${value.toolId}`, limit: limits.reportToolDaily, windowMs: DAY },
  { name: "report-email-day", identity: value.email, limit: limits.reportEmailDaily, windowMs: DAY },
];
