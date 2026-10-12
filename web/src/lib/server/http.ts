import { clientIpKey, hasIdSecret, isTrustedOrigin, loadDefenseConfig, verifyTurnstile, type DefenseConfig } from "./defense";
import { createDiagnosticHandler, loadDiagnosticConfig, type DiagnosticConfig } from "./diagnostic";
import { authenticateInternal, loadInternalKeys, type InternalKeys } from "./internal-auth";
import { processJobs, purgeExpired, type JobHandlers } from "./jobs";
import {
  consumeLimits,
  diagnosticLimitSpecs,
  gateOf,
  ipLimitSpecs,
  reportLimitSpecs,
  subscriptionLimitSpecs,
  type Denied,
  type Gate,
  type Limits,
} from "./limits";
import { resolveBackendMode, type BackendMode } from "./mode";
import { purgeInactiveLeads } from "./retention";
import { recordDiagnostic, recordReportRequest, requestSubscription } from "./repository";
import { logEvent, safeErrorCode } from "./safe";
import { loadFirestoreStore, type Store } from "./store";
import { JOB_KINDS } from "./types";
import { MAX_BODY_BYTES, parseDiagnostic, parseReport, parseSubscription, type Parsed } from "./validation";

if (typeof window !== "undefined") throw new Error("lib/server must not be imported in the browser");

export interface Deps {
  mode: BackendMode;
  idSecret: string | undefined;
  getStore(): Promise<Store>;
  now(): Date;
  // Pilot needs all of these; when absent the pilot fails closed (503) instead of accepting unprotected requests.
  defense?: DefenseConfig;
  internalKeys?: InternalKeys;
  jobHandlers?: JobHandlers;
  // Diagnostic receipt is operational only with a private webhook and the follow-up statement; absent => 503.
  diagnostic?: DiagnosticConfig;
  // Monotonic milliseconds for the jobs request's time plan; tests inject it.
  clock?: () => number;
}

let firestoreStore: Store | undefined;

export function defaultDeps(env: Record<string, string | undefined> = process.env): Deps {
  const getStore = async () => (firestoreStore ??= loadFirestoreStore());
  const now = () => new Date();
  const diagnostic = loadDiagnosticConfig(env);
  return {
    mode: resolveBackendMode(env.BACKEND_MODE),
    idSecret: env.DATA_ID_SECRET,
    getStore,
    now,
    defense: loadDefenseConfig(env).config,
    internalKeys: loadInternalKeys(env),
    diagnostic,
    jobHandlers: diagnostic
      ? { [JOB_KINDS.diagnosticDiscord]: (job, context) => getStore().then((store) => createDiagnosticHandler(store, diagnostic, now)(job, context)) }
      : {},
  };
}

const TURNSTILE_HEADER = "x-turnstile-token";
const JOBS_LEASE_MS = 60_000;
const JOBS_HANDLER_TIMEOUT_MS = 20_000;
const JOBS_BATCH = 5;
// Time plan inside the route's maxDuration (60 s): job claims stop when the next handler (20 s) could not end by
// JOBS_BUDGET_MS, so jobs end by ~35 s plus the last completion write. The window up to MAINTENANCE_DEADLINE_MS is
// reserved for retention and counter cleanup, so jobs can never starve it. No new maintenance step starts after the
// deadline, leaving ~8 s for the step in flight. Real durations are unmeasured: PLAN T6.2 gate (see development.md).
const JOBS_BUDGET_MS = 35_000;
const MAINTENANCE_DEADLINE_MS = 52_000;
const PURGE_BATCH = 25;
const LEAD_PURGE_BATCH = 10;
const JOBS_MAX_BODY_BYTES = 1024;

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

const unavailable = (code: string) => json(503, { code });
const rateLimited = (denied: Denied) =>
  json(429, { code: "rate_limited", retryAfter: denied.retryAfterSec }, { "Retry-After": String(denied.retryAfterSec) });

// Content-Length is only a fast path; the stream is counted so a missing or spoofed header cannot buffer more than the cap.
async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return { ok: false };
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return { ok: false };
  const chunks: Uint8Array[] = [];
  let received = 0;
  if (request.body) {
    const reader = request.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { ok: false };
      }
      chunks.push(value);
    }
  }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))) as unknown };
  } catch {
    return { ok: false };
  }
}

interface Operation<T> {
  requires?: (deps: Deps) => boolean; // pilot only: false => 503 "not_operational" before anything is read
  action: string; // Turnstile action the widget must have been rendered with
  parse: (body: unknown) => Parsed<T>;
  limits: (value: T, limits: Limits) => ReturnType<typeof diagnosticLimitSpecs>;
  persist: (store: Store, secret: string, value: T, now: Date, gate: Gate) => Promise<({ ok: true } & Record<string, unknown>) | Denied>;
}

// The IP limiter runs before Turnstile verification on purpose (cheap abuse shield), so requests later rejected by
// Turnstile (or by a storage/provider failure) still count against the IP ceilings; identity limits count only
// requests that passed Turnstile and are not consumed when the identity gate denies.
// off: 503, body never read. demo: validates only, then 503 (never a fictitious success).
// pilot, in order: config (503) → origin (403) → body/validation (400) → trusted IP (503) → IP limits (429) →
// Turnstile (403/503) → identity limits + persistence in one transaction (429/202). 202 only after commit.
async function handle<T>(request: Request, deps: Deps, operation: Operation<T>): Promise<Response> {
  if (deps.mode === "off") return unavailable("unavailable");
  if (deps.mode === "pilot") {
    if (!deps.defense || !hasIdSecret(deps.idSecret)) {
      logEvent("error", "pilot_misconfigured", { action: operation.action });
      return unavailable("misconfigured");
    }
    if (!isTrustedOrigin(request, deps.defense.trustedOrigins)) return json(403, { code: "forbidden_origin" });
    if (operation.requires && !operation.requires(deps)) return unavailable("not_operational");
  }
  const read = await readJson(request);
  if (!read.ok) return json(400, { code: "invalid_request" });
  const parsed = operation.parse(read.body);
  if (!parsed.ok) return json(400, { code: "invalid_request", fields: parsed.fields });
  if (deps.mode === "demo") return unavailable("demo_mode");

  const defense = deps.defense as DefenseConfig;
  const secret = deps.idSecret as string;
  const ipKey = clientIpKey(request, defense.ipHeader);
  if (!ipKey) {
    logEvent("error", "client_ip_unavailable", { action: operation.action });
    return unavailable("ip_unavailable");
  }
  try {
    const store = await deps.getStore();
    const ipDenied = await store.transaction((tx) => consumeLimits(tx, secret, ipLimitSpecs(ipKey, defense.limits), deps.now()));
    if (ipDenied) return rateLimited(ipDenied);

    const challenge = await verifyTurnstile({
      store,
      secret,
      config: defense,
      token: request.headers.get(TURNSTILE_HEADER),
      action: operation.action,
      remoteIp: request.headers.get(defense.ipHeader)?.trim(),
      now: deps.now(),
    });
    if (challenge === "unavailable") return unavailable("challenge_unavailable");
    if (challenge === "rejected") return json(403, { code: "challenge_failed" });

    const now = deps.now();
    const gate = gateOf(secret, operation.limits(parsed.value, defense.limits), now);
    const result = await operation.persist(store, secret, parsed.value, now, gate);
    if (!result.ok) return rateLimited(result);
    const rest: Record<string, unknown> = { ...result };
    delete rest.ok;
    return json(202, { status: "accepted", ...rest });
  } catch (error) {
    logEvent("error", "persistence_failed", { action: operation.action, error: safeErrorCode(error) });
    return unavailable("storage_unavailable");
  }
}

export const handleDiagnostic = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, {
    requires: (current) => current.diagnostic !== undefined && Boolean(current.internalKeys?.jobs?.length),
    action: "diagnostico",
    parse: parseDiagnostic,
    limits: (value, limits) => diagnosticLimitSpecs(value.whatsapp, limits),
    persist: recordDiagnostic,
  });

// Same body for new, pending, confirmed and cancelled addresses (anti-enumeration).
export const handleSubscription = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, {
    action: "newsletter-inscricao",
    parse: parseSubscription,
    limits: subscriptionLimitSpecs,
    persist: requestSubscription,
  });

export const handleReport = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, {
    action: "relatorio",
    parse: parseReport,
    limits: reportLimitSpecs,
    persist: recordReportRequest,
  });

// Internal, scope "jobs": claims a small batch of due jobs and sweeps expired counters and six-month-inactive leads. No body is expected.
// Authentication failures share one generic 401 so callers learn nothing about which check failed.
export async function handleJobsProcess(request: Request, deps: Deps = defaultDeps()): Promise<Response> {
  if (deps.mode !== "pilot") return unavailable("unavailable");
  if (!hasIdSecret(deps.idSecret) || !deps.internalKeys?.jobs?.length) {
    logEvent("error", "pilot_misconfigured", { action: "jobs" });
    return unavailable("misconfigured");
  }
  const clock = deps.clock ?? Date.now;
  const startedAt = clock();
  try {
    const store = await deps.getStore();
    const auth = await authenticateInternal(request, {
      scope: "jobs",
      keys: deps.internalKeys,
      store,
      idSecret: deps.idSecret,
      now: deps.now(),
      maxBodyBytes: JOBS_MAX_BODY_BYTES,
    });
    if (!auth.ok) {
      logEvent("warn", "internal_auth_failed", { scope: "jobs", reason: auth.reason });
      return auth.status === 401 ? json(401, { code: "unauthorized" }) : json(auth.status, { code: auth.reason });
    }
    const summary = await processJobs(store, deps.jobHandlers ?? {}, {
      now: deps.now,
      limit: JOBS_BATCH,
      leaseMs: JOBS_LEASE_MS,
      handlerTimeoutMs: JOBS_HANDLER_TIMEOUT_MS,
      budgetMs: JOBS_BUDGET_MS,
    });
    // Retention (a legal duty) first; expired counters use whatever time remains.
    const pastDeadline = () => clock() - startedAt >= MAINTENANCE_DEADLINE_MS;
    const leadPurge = await purgeInactiveLeads(store, deps.idSecret, deps.now(), LEAD_PURGE_BATCH, pastDeadline);
    const purged = await purgeExpired(store, deps.now(), PURGE_BATCH, pastDeadline);
    const deadlineReached = pastDeadline();
    if (deadlineReached) logEvent("warn", "jobs_maintenance_deadline", { deferredLeads: leadPurge.deferred, partialLeads: leadPurge.partial });
    return json(200, { ...summary, purged, leadPurge, deadlineReached });
  } catch (error) {
    logEvent("error", "jobs_failed", { error: safeErrorCode(error) });
    return unavailable("storage_unavailable");
  }
}
