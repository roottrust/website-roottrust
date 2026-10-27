import { clientIpKey, hasIdSecret, isTrustedOrigin, loadDefenseConfig, verifyTurnstile, type DefenseConfig } from "./defense";
import { createDiagnosticHandler, loadDiagnosticConfig, type DiagnosticConfig } from "./diagnostic";
import { verifyDiscordProof } from "./discord-proof";
import { opaqueId, verifyCancellationToken, verifyConfirmationToken } from "./ids";
import { authenticateInternal, loadInternalKeys, type InternalKeys } from "./internal-auth";
import { enqueueJob, processJobs, purgeExpired, type JobHandlers } from "./jobs";
import { createNewsletterHandler, loadNewsletterConfig, type NewsletterConfig } from "./newsletter";
import { createBroadcastHandler, createPublishHandler, loadBroadcastConfig, type BroadcastConfig } from "./newsletter-broadcast";
import { createConfirmationHandler, createContactSyncHandler, createEditionDeliveryHandler, loadNewsletterEmailConfig, type NewsletterEmailConfig } from "./newsletter-email";
import { MAX_PROOF_BODY_BYTES, PROOF_TOLERANCE_S } from "./newsletter-protocol";
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
import { createReportHandler, loadReportConfig, type ReportConfig } from "./report";
import { purgeInactiveLeads } from "./retention";
import { cancelSubscription, confirmSubscription, decideEditionRevision, recordDiagnostic, recordReportRequest, requestSubscriptionConfirmation, saveEditionRevision } from "./repository";
import { logEvent, safeErrorCode } from "./safe";
import { loadFirestoreStore, type Store } from "./store";
import { COLLECTIONS, JOB_KINDS } from "./types";
import { MAX_BODY_BYTES, MAX_EDITION_BYTES, parseConfirmation, parseDecision, parseDiagnostic, parseDraftRequest, parseReport, parseSubscription, type Parsed } from "./validation";

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
  // Report e-mails are operational only with Resend configured and attested; absent => 503.
  report?: ReportConfig;
  // The private newsletter review channel (bot token + Discord IDs); absent => the draft and decision endpoints answer 503.
  newsletter?: NewsletterConfig;
  // Resend Broadcast delivery to the dedicated pilot segment; absent => approved editions are published but nothing is sent.
  broadcast?: BroadcastConfig;
  newsletterEmail?: NewsletterEmailConfig;
  resendWebhookReady?: boolean;
  // Monotonic milliseconds for the jobs request's time plan; tests inject it.
  clock?: () => number;
}

let firestoreStore: Store | undefined;

export function defaultDeps(env: Record<string, string | undefined> = process.env): Deps {
  const getStore = async () => (firestoreStore ??= loadFirestoreStore());
  const now = () => new Date();
  const diagnostic = loadDiagnosticConfig(env);
  const report = loadReportConfig(env);
  const newsletter = loadNewsletterConfig(env);
  const broadcast = loadBroadcastConfig(env);
  const newsletterEmail = loadNewsletterEmailConfig(env);
  const resendWebhookReady = Boolean(env.RESEND_WEBHOOK_SECRET?.trim());
  const idSecret = env.DATA_ID_SECRET;
  return {
    mode: resolveBackendMode(env.BACKEND_MODE),
    idSecret,
    getStore,
    now,
    defense: loadDefenseConfig(env).config,
    internalKeys: loadInternalKeys(env),
    diagnostic,
    report,
    newsletter,
    broadcast,
    newsletterEmail,
    resendWebhookReady,
    jobHandlers: {
      ...(newsletter ? { [JOB_KINDS.newsletterDiscord]: (job, context) => getStore().then((store) => createNewsletterHandler(store, newsletter, now)(job, context)) } : {}),
      ...(newsletter && hasIdSecret(idSecret) ? { [JOB_KINDS.newsletterPublish]: (job, context) => getStore().then((store) => createPublishHandler(store, idSecret, now, broadcast !== undefined)(job, context)) } : {}),
      ...(newsletter && broadcast && hasIdSecret(idSecret) ? { [JOB_KINDS.newsletterBroadcast]: (job, context) => getStore().then((store) => createBroadcastHandler(store, broadcast, now, idSecret)(job, context)) } : {}),
      ...(newsletterEmail && resendWebhookReady && hasIdSecret(idSecret) ? {
        [JOB_KINDS.newsletterConfirmation]: (job, context) => getStore().then((store) => createConfirmationHandler(store, idSecret, newsletterEmail, now)(job, context)),
        [JOB_KINDS.newsletterDelivery]: (job, context) => getStore().then((store) => createEditionDeliveryHandler(store, idSecret, newsletterEmail, now)(job, context)),
      } : {}),
      ...(broadcast ? { [JOB_KINDS.newsletterContactSync]: (job, context) => getStore().then((store) => createContactSyncHandler(store, broadcast)(job, context)) } : {}),
      ...(diagnostic ? { [JOB_KINDS.diagnosticDiscord]: (job, context) => getStore().then((store) => createDiagnosticHandler(store, diagnostic, now)(job, context)) } : {}),
      ...(report ? { [JOB_KINDS.reportEmail]: (job, context) => getStore().then((store) => createReportHandler(store, report, now)(job, context)) } : {}),
    },
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
  allowed?: (value: T) => boolean;
  limits: (value: T, limits: Limits) => ReturnType<typeof diagnosticLimitSpecs>;
  persist: (store: Store, secret: string, value: T, now: Date, gate: Gate) => Promise<({ ok: true } & Record<string, unknown>) | Denied>;
}

// The IP limiter runs before Turnstile verification on purpose (cheap abuse shield), so requests later rejected by
// Turnstile (or by a storage/provider failure) still count against the IP ceilings; identity limits count only
// requests that passed Turnstile and are not consumed when the identity gate denies.
// off: 503, body never read. demo: validates only, then 503 (never a fictitious success).
// pilot, in order: config (503) → origin (403) → body/validation (400) → pilot identity (403) → trusted IP (503) → IP limits (429) →
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
  if (operation.allowed && !operation.allowed(parsed.value)) return json(403, { code: "forbidden" });

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
    allowed: (value) => deps.diagnostic?.allowlist.includes(value.whatsapp) === true,
    limits: (value, limits) => diagnosticLimitSpecs(value.whatsapp, limits),
    persist: recordDiagnostic,
  });

// Same body for new, pending, confirmed and cancelled addresses (anti-enumeration).
export const handleSubscription = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, {
    requires: (current) => current.newsletterEmail !== undefined && current.broadcast !== undefined && current.resendWebhookReady === true && Boolean(current.internalKeys?.jobs?.length),
    action: "newsletter-inscricao",
    parse: parseSubscription,
    limits: subscriptionLimitSpecs,
    persist: async (store, secret, value, now, gate) => {
      // The pilot never stores or sends to addresses outside its private recipient list.
      if (!deps.newsletterEmail?.allowlist.includes(value.email)) return { ok: true };
      const result = await requestSubscriptionConfirmation(store, secret, value, now, gate);
      return result.ok ? { ok: true } : result;
    },
  });

// A confirmation link opens a page first; only an explicit POST consumes its token. Mail scanners may follow GET links.
export async function handleNewsletterConfirmation(request: Request, deps: Deps = defaultDeps()): Promise<Response> {
  if (deps.mode !== "pilot") return unavailable("unavailable");
  if (!deps.defense || !hasIdSecret(deps.idSecret) || !deps.newsletterEmail || !deps.broadcast || !deps.resendWebhookReady || !deps.internalKeys?.jobs?.length) return unavailable("not_operational");
  if (!isTrustedOrigin(request, deps.defense.trustedOrigins)) return json(403, { code: "forbidden_origin" });
  const read = await readJson(request);
  if (!read.ok) return json(400, { code: "invalid_request" });
  const parsed = parseConfirmation(read.body);
  if (!parsed.ok || !verifyConfirmationToken(deps.idSecret, parsed.value.token)) return json(400, { code: "invalid_link" });
  try {
    const result = await confirmSubscription(await deps.getStore(), deps.idSecret, parsed.value.token, deps.now(), deps.broadcast !== undefined);
    if (result.status === "confirmed") return json(200, { status: "confirmed", editionQueued: Boolean(result.editionSlug), selectedEditionUnavailable: result.selectedEditionUnavailable === true });
    if (result.status === "expired") return json(410, { code: "expired_link" });
    if (result.status === "superseded") return json(409, { code: "superseded_link" });
    if (result.status === "already_used") return json(409, { code: "already_used" });
    return json(400, { code: "invalid_link" });
  } catch (error) {
    logEvent("error", "confirmation_failed", { error: safeErrorCode(error) });
    return unavailable("storage_unavailable");
  }
}

export async function handleNewsletterCancellation(request: Request, deps: Deps = defaultDeps()): Promise<Response> {
  if (deps.mode !== "pilot") return unavailable("unavailable");
  if (!deps.defense || !hasIdSecret(deps.idSecret) || !deps.newsletterEmail) return unavailable("not_operational");
  if (!isTrustedOrigin(request, deps.defense.trustedOrigins)) return json(403, { code: "forbidden_origin" });
  const read = await readJson(request);
  if (!read.ok || !read.body || typeof read.body !== "object" || Array.isArray(read.body)) return json(400, { code: "invalid_link" });
  const body = read.body as Record<string, unknown>;
  if (Object.keys(body).length !== 1) return json(400, { code: "invalid_link" });
  const proof = verifyCancellationToken(deps.idSecret, body.token);
  if (!proof) return json(400, { code: "invalid_link" });
  try {
    const result = await cancelSubscription(await deps.getStore(), deps.idSecret, proof, deps.now(), deps.broadcast !== undefined);
    return result === "invalid" ? json(409, { code: "invalid_link" }) : json(200, { status: "cancelled" });
  } catch (error) {
    logEvent("error", "cancellation_failed", { error: safeErrorCode(error) });
    return unavailable("storage_unavailable");
  }
}

export const handleReport = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, {
    requires: (current) => current.report !== undefined && Boolean(current.internalKeys?.jobs?.length),
    action: "relatorio",
    parse: parseReport,
    allowed: (value) => deps.report?.allowlist.includes(value.email) === true,
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

const DRAFT_MAX_BODY_BYTES = MAX_EDITION_BYTES + 4096; // the edition itself is capped at 64 KiB; the rest is JSON framing
const DECISION_MAX_BODY_BYTES = 2 * MAX_PROOF_BODY_BYTES + 2048; // the raw Discord interaction travels JSON-escaped inside `proof`
const DRAFT_DAILY_LIMIT = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

type NewsletterAuth = { ok: true; store: Store; body: Uint8Array; config: NewsletterConfig; secret: string } | { ok: false; response: Response };

// Authentication first, then the body: the signature already covers the exact bytes. A draft key can never decide and a
// publish key can never post drafts (scopes are separate credentials).
async function authenticateNewsletter(request: Request, deps: Deps, scope: "draft" | "publish", maxBodyBytes: number): Promise<NewsletterAuth> {
  if (deps.mode !== "pilot") return { ok: false, response: unavailable("unavailable") };
  const secret = deps.idSecret;
  if (!hasIdSecret(secret) || !deps.internalKeys?.[scope]?.length) {
    logEvent("error", "pilot_misconfigured", { action: `newsletter-${scope}` });
    return { ok: false, response: unavailable("misconfigured") };
  }
  if (!deps.newsletter) return { ok: false, response: unavailable("not_operational") };
  const store = await deps.getStore();
  const auth = await authenticateInternal(request, { scope, keys: deps.internalKeys, store, idSecret: secret, now: deps.now(), maxBodyBytes });
  if (!auth.ok) {
    logEvent("warn", "internal_auth_failed", { scope, reason: auth.reason });
    return { ok: false, response: auth.status === 401 ? json(401, { code: "unauthorized" }) : json(auth.status, { code: auth.reason }) };
  }
  return { ok: true, store, body: auth.body, config: deps.newsletter, secret };
}

function parseSignedJson(body: Uint8Array): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)) as unknown };
  } catch {
    return { ok: false };
  }
}

// Internal, scope "draft" (the Routine). Persists an immutable revision and its Discord job in one transaction; it never
// approves, publishes or sends. A body with `draftId` is only accepted when a reviewer asked to regenerate that draft.
export async function handleNewsletterDraft(request: Request, deps: Deps = defaultDeps()): Promise<Response> {
  try {
    const auth = await authenticateNewsletter(request, deps, "draft", DRAFT_MAX_BODY_BYTES);
    if (!auth.ok) return auth.response;
    const read = parseSignedJson(auth.body);
    if (!read.ok) return json(400, { code: "invalid_request" });
    const parsed = parseDraftRequest(read.value);
    if (!parsed.ok) return json(400, { code: "invalid_request", fields: parsed.fields });
    const { store, secret } = auth;
    const now = deps.now();

    if (!parsed.value.draftId) {
      const taken = await store.queryEquals(COLLECTIONS.editionDrafts, "slug", parsed.value.slug, 1);
      const published = await store.transaction((tx) => tx.get(COLLECTIONS.editionsPublic, parsed.value.slug));
      if (taken.length || published) return json(409, { code: "slug_exists" });
    }
    const gate = gateOf(secret, [{ name: "nl-draft-day", identity: "global", limit: DRAFT_DAILY_LIMIT, windowMs: DAY_MS }], now);
    const result = await saveEditionRevision(store, parsed.value, now, {
      regenerationOnly: true,
      gate,
      enqueue: async (tx, saved) => {
        await enqueueJob(
          tx,
          secret,
          { kind: JOB_KINDS.newsletterDiscord, key: `${saved.draftId}.${saved.revision}`, payload: { draftId: saved.draftId, revision: String(saved.revision) }, maxAttempts: 8 },
          now,
        );
      },
    });
    if (result.ok) return json(202, { status: "queued", draftId: result.draftId, revision: result.revision });
    if (result.reason === "rate_limited") return rateLimited(result);
    if (result.reason === "not_found") return json(404, { code: "draft_not_found" });
    if (result.reason === "invalid_body") return json(400, { code: "invalid_request", fields: ["corpo"] });
    return json(409, { code: result.reason });
  } catch (error) {
    logEvent("error", "newsletter_draft_failed", { error: safeErrorCode(error) });
    return unavailable("storage_unavailable");
  }
}

// Internal, scope "publish" (the Discord Worker). The HMAC only proves the Worker spoke: the server verifies again the
// Ed25519 signature of the original Discord interaction (`proof`) and that it is this exact button on this exact message,
// then compares the forwarded IDs with the configured review channel and with the binding stored for the revision. The proof
// is single-use: its marker is consumed in the same transaction as the decision.
export async function handleNewsletterDecision(request: Request, deps: Deps = defaultDeps()): Promise<Response> {
  try {
    const auth = await authenticateNewsletter(request, deps, "publish", DECISION_MAX_BODY_BYTES);
    if (!auth.ok) return auth.response;
    const read = parseSignedJson(auth.body);
    if (!read.ok) return json(400, { code: "invalid_request" });
    const parsed = parseDecision(read.value);
    if (!parsed.ok) return json(400, { code: "invalid_request", fields: parsed.fields });
    const { config, store } = auth;
    const { applicationId, guildId, channelId, messageId, ...decision } = parsed.value;
    if (applicationId !== config.applicationId || guildId !== config.guildId || channelId !== config.channelId) return json(403, { code: "forbidden_binding" });
    const { proof, ...target } = decision;
    const now = deps.now();
    const verified = verifyDiscordProof(proof, { ...target, publicKeyHex: config.publicKey, now, applicationId, guildId, channelId, messageId });
    if (!verified.ok) {
      logEvent("warn", "newsletter_proof_rejected", { reason: verified.reason });
      return json(403, { code: "invalid_proof" });
    }
    const replay = { id: opaqueId(auth.secret, "dp", proof.signature.toLowerCase()), expiresAt: new Date(now.getTime() + 2 * PROOF_TOLERANCE_S * 1000).toISOString() };
    const result = await decideEditionRevision(store, { ...target, channelId, messageId }, now, { secret: auth.secret, replay });
    if (result === "proof_replay") return json(409, { code: "proof_replay" });
    // Every outcome of a well-formed decision is a 200 with `result`; any other status is an error and carries no decision.
    return json(200, { result });
  } catch (error) {
    logEvent("error", "newsletter_decision_failed", { error: safeErrorCode(error) });
    return unavailable("storage_unavailable");
  }
}
