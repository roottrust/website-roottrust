import { randomUUID } from "node:crypto";
import { opaqueId } from "./ids";
import { leadRetentionCutoff } from "./retention";
import { logEvent, safeErrorCode } from "./safe";
import type { Store, Tx } from "./store";
import { COLLECTIONS, JOB_KINDS, type EmailQuotaRecord, type JobRecord, type NewsletterDeliveryRecord, type RateLimitRecord, type ReplayRecord, type SubscriptionConfirmationRecord, type SubscriptionRecord } from "./types";

const BACKOFF_BASE_MS = 30_000;
const BACKOFF_CAP_MS = 60 * 60_000;
const DEFERRAL_CAP_MS = 24 * 60 * 60_000;
const DEFAULT_MAX_ATTEMPTS = 5;

// Handler outcomes: a plain throw retries with backoff, RetryLater honors a provider wait (e.g. 429 Retry-After),
// PermanentFailure goes straight to "dead" for human review. Messages are never stored.
export class RetryLater extends Error {
  override name = "RetryLater";
  readonly retryAfterMs: number;
  // Provider-supplied waits are untrusted: non-finite or non-positive values are ignored (plain backoff applies)
  // and anything above the backoff cap is clamped, so a hostile Retry-After cannot park a job indefinitely.
  // `deferral` (a known local wait, e.g. a quota reset) keeps the exact wait up to a day and does not spend the attempt.
  readonly deferral: boolean;
  constructor(retryAfterMs: number, options: { deferral?: boolean } = {}) {
    super("retry_later");
    this.deferral = options.deferral === true;
    const cap = this.deferral ? DEFERRAL_CAP_MS : BACKOFF_CAP_MS;
    this.retryAfterMs = Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? Math.min(Math.ceil(retryAfterMs), cap) : 0;
  }
}
export class PermanentFailure extends Error {
  override name = "PermanentFailure";
}

export type JobHandler = (job: JobRecord, context: { signal: AbortSignal }) => Promise<void>;
export type JobHandlers = Record<string, JobHandler>;

function omitLease(job: JobRecord): Omit<JobRecord, "dueAt" | "leaseToken"> {
  const rest: Partial<JobRecord> = { ...job };
  delete rest.dueAt;
  delete rest.priorityDueAt;
  delete rest.leaseToken;
  return rest as Omit<JobRecord, "dueAt" | "leaseToken">;
}

// Idempotent outbox insert: call it inside the transaction that persists the business record so both commit or neither
// does. The ID derives from (kind, key), so repeating the same logical effect never creates a second job.
// `payload` must hold opaque references only (IDs), never contact data.
export async function enqueueJob(
  tx: Tx,
  secret: string,
  job: { kind: string; key: string; payload?: Record<string, string>; maxAttempts?: number; runAt?: Date },
  now: Date,
): Promise<string> {
  const id = opaqueId(secret, "jb", `${job.kind}:${job.key}`);
  if (await tx.get(COLLECTIONS.jobs, id)) return id;
  const at = now.toISOString();
  const record: JobRecord = {
    id,
    kind: job.kind,
    payload: job.payload ?? {},
    status: "pending",
    attempts: 0,
    maxAttempts: job.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    dueAt: (job.runAt ?? now).toISOString(),
    ...(job.kind === JOB_KINDS.newsletterConfirmation ? { priorityDueAt: (job.runAt ?? now).toISOString() } : {}),
    createdAt: at,
    updatedAt: at,
  };
  tx.set(COLLECTIONS.jobs, id, record);
  return id;
}

// Each candidate is re-read and claimed in its own transaction: of N concurrent claimers exactly one gets a lease.
// The lease token fences completion, so a worker whose lease expired cannot overwrite the new owner's result.
// ponytail: candidates of unhandled kinds at the head of the queue can crowd out others; add a per-kind index if kinds multiply.
export async function claimJobs(
  store: Store,
  options: { kinds: readonly string[]; now: Date; limit: number; leaseMs: number },
): Promise<JobRecord[]> {
  const { kinds, now, limit, leaseMs } = options;
  if (!kinds.length || limit < 1) return [];
  const at = now.toISOString();
  const claimed: JobRecord[] = [];
  const prioritized = await store.query(COLLECTIONS.jobs, "priorityDueAt", at, limit * 3);
  const ordinary = await store.query(COLLECTIONS.jobs, "dueAt", at, limit * 3);
  for (const id of new Set([...prioritized, ...ordinary])) {
    if (claimed.length >= limit) break;
    const job = await store.transaction(async (tx) => {
      const current = await tx.get<JobRecord>(COLLECTIONS.jobs, id);
      if (!current || !current.dueAt || current.dueAt > at || !kinds.includes(current.kind)) return undefined;
      if (current.status !== "pending" && current.status !== "leased") return undefined;
      if (current.status === "leased" && current.attempts >= current.maxAttempts) {
        tx.set(COLLECTIONS.jobs, id, { ...omitLease(current), status: "dead", lastError: "lease_expired", updatedAt: at });
        return undefined;
      }
      const leased: JobRecord = {
        ...current,
        status: "leased",
        attempts: current.attempts + 1,
        leaseToken: randomUUID(),
        dueAt: new Date(now.getTime() + leaseMs).toISOString(),
        ...(current.priorityDueAt ? { priorityDueAt: new Date(now.getTime() + leaseMs).toISOString() } : {}),
        updatedAt: at,
      };
      tx.set(COLLECTIONS.jobs, id, leased);
      return leased;
    });
    if (job) claimed.push(job);
  }
  return claimed;
}

export type Finish = "done" | "retry" | "dead" | "lost";

async function finishJob(
  store: Store,
  job: JobRecord,
  decide: (current: JobRecord) => Omit<JobRecord, "dueAt" | "leaseToken"> & { dueAt?: string },
  now: Date,
): Promise<Finish> {
  return store.transaction(async (tx) => {
    const current = await tx.get<JobRecord>(COLLECTIONS.jobs, job.id);
    if (!current || current.status !== "leased" || current.leaseToken !== job.leaseToken) return "lost";
    const next = decide(current);
    tx.set(COLLECTIONS.jobs, job.id, { ...next, updatedAt: now.toISOString() });
    return next.status === "done" ? "done" : next.status === "dead" ? "dead" : "retry";
  });
}

export const completeJob = (store: Store, job: JobRecord, now: Date) =>
  finishJob(store, job, (current) => ({ ...omitLease(current), status: "done" }), now);

export const failJob = (store: Store, job: JobRecord, code: string, now: Date, options: { retryAfterMs?: number; permanent?: boolean; deferral?: boolean } = {}) =>
  finishJob(
    store,
    job,
    (current) => {
      if (options.deferral && !options.permanent) {
        // The handler did nothing (e.g. quota exhausted): give the attempt back and wait the exact time.
        const wait = Math.max(options.retryAfterMs ?? 0, BACKOFF_BASE_MS);
        const dueAt = new Date(now.getTime() + wait).toISOString();
        return { ...omitLease(current), status: "pending", attempts: Math.max(current.attempts - 1, 0), lastError: code, dueAt, ...(current.priorityDueAt ? { priorityDueAt: dueAt } : {}) };
      }
      if (options.permanent || current.attempts >= current.maxAttempts) {
        return { ...omitLease(current), status: "dead", lastError: code };
      }
      const backoff = Math.min(BACKOFF_BASE_MS * 2 ** (current.attempts - 1), BACKOFF_CAP_MS);
      const requested = options.retryAfterMs;
      const wait = Math.max(backoff, Number.isFinite(requested) && requested !== undefined && requested > 0 ? Math.min(requested, BACKOFF_CAP_MS) : 0);
      const dueAt = new Date(now.getTime() + wait).toISOString();
      return { ...omitLease(current), status: "pending", lastError: code, dueAt, ...(current.priorityDueAt ? { priorityDueAt: dueAt } : {}) };
    },
    now,
  );

export interface ProcessSummary {
  claimed: number;
  done: number;
  retried: number;
  dead: number;
  lost: number;
  // The handler finished but its outcome could not be persisted (storage failure). The job stays leased: it is neither
  // marked failed nor retried here, and is only reclaimed after the lease expires, so handlers must be idempotent on
  // `job.id` and reconcile before repeating an effect.
  uncertain: number;
}

// Jobs are claimed one at a time, right before they run, so a lease never ages while earlier jobs execute: the lease
// only has to outlive a single handler (timeout < lease). `budgetMs` stops claiming when the next handler could no
// longer finish inside the caller's request budget (e.g. the route's maxDuration).
// A handler that times out has an unknown outcome: it may still finish its side effect. Handlers must therefore be
// idempotent on `job.id` (pass it as the provider's idempotency key) and reconcile before repeating an effect.
export async function processJobs(
  store: Store,
  handlers: JobHandlers,
  options: { now: () => Date; limit: number; leaseMs: number; handlerTimeoutMs: number; budgetMs?: number },
): Promise<ProcessSummary> {
  if (options.handlerTimeoutMs >= options.leaseMs) throw new Error("handler timeout must be shorter than the lease");
  const summary: ProcessSummary = { claimed: 0, done: 0, retried: 0, dead: 0, lost: 0, uncertain: 0 };
  const kinds = Object.keys(handlers);
  if (!kinds.length) return summary;
  const startedAt = Date.now();
  while (summary.claimed < options.limit) {
    if (options.budgetMs !== undefined && Date.now() - startedAt + options.handlerTimeoutMs > options.budgetMs) break;
    const [job] = await claimJobs(store, { kinds, now: options.now(), limit: 1, leaseMs: options.leaseMs });
    if (!job) break;
    summary.claimed += 1;
    const outcome = await runJob(store, handlers[job.kind], job, options);
    summary[outcome] += 1;
  }
  return summary;
}

async function runJob(
  store: Store,
  handler: JobHandlers[string],
  job: JobRecord,
  options: { now: () => Date; handlerTimeoutMs: number },
): Promise<Exclude<keyof ProcessSummary, "claimed">> {
  const abort = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failure: unknown;
  try {
    await Promise.race([
      handler(job, { signal: abort.signal }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          abort.abort();
          reject(Object.assign(new Error("job_timeout"), { name: "JobTimeout" }));
        }, options.handlerTimeoutMs);
      }),
    ]);
  } catch (error) {
    failure = error ?? new Error("unknown");
  } finally {
    clearTimeout(timer);
  }

  // Persisting the result is separate from the handler: a storage error here must not be treated as a handler failure.
  try {
    if (failure === undefined) return outcomeKey(await persistCompletion(store, job, options.now));
    const code = safeErrorCode(failure);
    logEvent("warn", "job_failed", { kind: job.kind, attempt: job.attempts, error: code });
    return outcomeKey(
      await failJob(store, job, code, options.now(), {
        retryAfterMs: failure instanceof RetryLater ? failure.retryAfterMs : undefined,
        permanent: failure instanceof PermanentFailure,
        deferral: failure instanceof RetryLater && failure.deferral,
      }),
    );
  } catch (error) {
    logEvent("error", "job_outcome_uncertain", { kind: job.kind, attempt: job.attempts, handlerOk: failure === undefined, error: safeErrorCode(error) });
    return "uncertain";
  }
}

// One immediate retry of the (idempotent, fenced) completion write covers a transient storage blip.
async function persistCompletion(store: Store, job: JobRecord, now: () => Date): Promise<Finish> {
  try {
    return await completeJob(store, job, now());
  } catch {
    return completeJob(store, job, now());
  }
}

const outcomeKey = (finish: Finish): "done" | "retried" | "dead" | "lost" =>
  finish === "done" ? "done" : finish === "retry" ? "retried" : finish;

// Short-lived counters and single-use markers carry an `expiresAt`; this sweeps the expired ones.
export async function purgeExpired(store: Store, now: Date, limit: number, shouldStop: () => boolean = () => false): Promise<number> {
  const at = now.toISOString();
  let purged = 0;
  for (const collection of [COLLECTIONS.rateLimits, COLLECTIONS.replays, COLLECTIONS.emailQuota] as const) {
    for (const id of await store.query(collection, "expiresAt", at, limit)) {
      if (shouldStop()) return purged;
      purged += await store.transaction(async (tx) => {
        const current = await tx.get<RateLimitRecord | ReplayRecord | EmailQuotaRecord>(collection, id);
        if (!current || current.expiresAt > at) return 0;
        tx.delete(collection, id);
        return 1;
      });
    }
  }
  for (const id of await store.query(COLLECTIONS.subscriptionConfirmations, "expiresAt", at, limit)) {
    if (shouldStop()) return purged;
    purged += await store.transaction(async (tx) => {
      const confirmation = await tx.get<SubscriptionConfirmationRecord>(COLLECTIONS.subscriptionConfirmations, id);
      if (!confirmation || confirmation.expiresAt > at) return 0;
      const subscription = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, confirmation.subscriptionId);
      if (subscription?.pendingConfirmationId === id) {
        if (subscription.status === "pending") tx.delete(COLLECTIONS.subscriptions, subscription.id);
        else {
          const updated = { ...subscription };
          delete updated.pendingConfirmationId;
          tx.set(COLLECTIONS.subscriptions, updated.id, updated);
        }
      }
      tx.delete(COLLECTIONS.subscriptionConfirmations, id);
      return 1;
    });
  }
  const cutoff = leadRetentionCutoff(now).toISOString();
  for (const id of await store.query(COLLECTIONS.subscriptions, "canceledAt", cutoff, limit)) {
    if (shouldStop()) return purged;
    const children = await store.queryEquals(COLLECTIONS.newsletterDeliveries, "subscriptionId", id, limit);
    purged += await store.transaction(async (tx) => {
      const subscription = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, id);
      if (!subscription || subscription.status !== "cancelled" || !subscription.canceledAt || subscription.canceledAt > cutoff || subscription.pendingConfirmationId) return 0;
      const records = await Promise.all(children.map((child) => tx.get<NewsletterDeliveryRecord>(COLLECTIONS.newsletterDeliveries, child)));
      records.forEach((record, index) => { if (record?.subscriptionId === id) tx.delete(COLLECTIONS.newsletterDeliveries, children[index]); });
      if (children.length < limit) tx.delete(COLLECTIONS.subscriptions, id);
      return records.filter((record) => record?.subscriptionId === id).length + (children.length < limit ? 1 : 0);
    });
  }
  return purged;
}
