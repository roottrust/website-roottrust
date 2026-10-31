import type { Denied } from "./limits";
import type { Store, Tx } from "./store";
import { COLLECTIONS, type ConsentEpochRecord, type EmailQuotaRecord, type MarketingBaselineRecord, type QuotaReservation, type SubscriptionRecord } from "./types";

// Resend Free plan. The environment may only lower these ceilings, never raise them.
export const RESEND_DAILY_LIMIT = 100;
export const RESEND_MONTHLY_LIMIT = 3000;
const DAY_MS = 86_400_000;

export interface EmailLimits {
  dailyLimit: number;
  monthlyLimit: number;
}

const dayId = (day: string) => `qt_day_${day}`;
const monthId = (month: string) => `qt_month_${month}`;
const nextDayStart = (at: Date) => Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1);
const nextMonthStart = (at: Date) => Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1);

export interface Counters {
  at: Date;
  day: string;
  month: string;
  dayUsed: number;
  monthUsed: number;
}

// Reads only. Every capacity decision happens before the first write of the caller: a returned refusal does not roll back
// what the transaction already buffered, so refusing after a write would leave a partial reservation behind.
export async function readCounters(tx: Tx, at: Date): Promise<Counters> {
  const day = at.toISOString().slice(0, 10);
  const month = at.toISOString().slice(0, 7);
  const dayDoc = await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, dayId(day));
  const monthDoc = await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, monthId(month));
  return { at, day, month, dayUsed: dayDoc?.used ?? 0, monthUsed: monthDoc?.used ?? 0 };
}

// Milliseconds until a unit is free (month wins: it is the longer wait), undefined when there is room.
export function capacityWaitMs(counters: Counters, limits: EmailLimits, scope: "both" | "day" = "both"): number | undefined {
  if (scope === "both" && counters.monthUsed >= limits.monthlyLimit) return nextMonthStart(counters.at) - counters.at.getTime();
  if (counters.dayUsed >= limits.dailyLimit) return nextDayStart(counters.at) - counters.at.getTime();
  return undefined;
}

export const emailCapacityDenied = (waitMs: number): Denied => ({ ok: false, retryAfterSec: Math.max(1, Math.ceil(waitMs / 1000)), capacity: "email" });

// Caller checked `capacityWaitMs` first.
export function takeSlot(tx: Tx, counters: Counters, kind: "admission" | "attempt"): QuotaReservation {
  const { at, day, month } = counters;
  tx.set(COLLECTIONS.emailQuota, dayId(day), { id: dayId(day), used: counters.dayUsed + 1, expiresAt: new Date(nextDayStart(at) + DAY_MS).toISOString() } satisfies EmailQuotaRecord);
  tx.set(COLLECTIONS.emailQuota, monthId(month), { id: monthId(month), used: counters.monthUsed + 1, expiresAt: new Date(nextMonthStart(at) + DAY_MS).toISOString() } satisfies EmailQuotaRecord);
  return { day, month, kind };
}

// First send attempt of a record. A record admitted with a reservation converts it (no second count); across a UTC rollover
// the unit moves to the current period when it has room, otherwise the accepted request waits (nothing is dropped).
// Without a reservation (older records) a fresh unit is taken.
export async function startAttempt(tx: Tx, held: QuotaReservation | undefined, at: Date, limits: EmailLimits): Promise<QuotaReservation | { waitMs: number }> {
  const counters = await readCounters(tx, at);
  if (!held) {
    const wait = capacityWaitMs(counters, limits);
    return wait !== undefined ? { waitMs: wait } : takeSlot(tx, counters, "attempt");
  }
  const plan = await planReservationMove(tx, held, counters, limits);
  return plan.ok ? plan.apply(tx, "attempt") : { waitMs: plan.waitMs };
}

// Reads only. Moves a held unit to the current UTC buckets: same buckets keep it untouched (one slot, no recount); a rollover
// needs room in the NEW buckets and, once applied, returns the old units. `apply` writes and must run after every other read.
export async function planReservationMove(
  tx: Tx,
  held: QuotaReservation,
  counters: Counters,
  limits: EmailLimits,
): Promise<{ ok: true; apply: (tx: Tx, kind: "admission" | "attempt") => QuotaReservation } | { ok: false; waitMs: number }> {
  const dayMoved = held.day !== counters.day;
  const monthMoved = held.month !== counters.month;
  if (!dayMoved && !monthMoved) return { ok: true, apply: (_tx, kind) => ({ ...held, kind }) };
  const oldDay = await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, dayId(held.day));
  const oldMonth = monthMoved ? await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, monthId(held.month)) : undefined;
  const wait = capacityWaitMs(counters, limits, monthMoved ? "both" : "day");
  if (wait !== undefined) return { ok: false, waitMs: wait };
  return {
    ok: true,
    apply: (target, kind) => {
      const { at } = counters;
      target.set(COLLECTIONS.emailQuota, dayId(counters.day), { id: dayId(counters.day), used: counters.dayUsed + 1, expiresAt: new Date(nextDayStart(at) + DAY_MS).toISOString() } satisfies EmailQuotaRecord);
      if (monthMoved) target.set(COLLECTIONS.emailQuota, monthId(counters.month), { id: monthId(counters.month), used: counters.monthUsed + 1, expiresAt: new Date(nextMonthStart(at) + DAY_MS).toISOString() } satisfies EmailQuotaRecord);
      if (oldDay) target.set(COLLECTIONS.emailQuota, oldDay.id, { ...oldDay, used: Math.max(0, oldDay.used - 1) });
      if (oldMonth) target.set(COLLECTIONS.emailQuota, oldMonth.id, { ...oldMonth, used: Math.max(0, oldMonth.used - 1) });
      return { day: counters.day, month: counters.month, kind };
    },
  };
}

// Gives a unit back. Only valid with proof that nothing was sent (definite provider refusal, or an admission that never
// started an attempt). `exhausted` means the provider said the scope is full, so the local counter was behind: raise it.
export async function releaseReservation(tx: Tx, reservation: QuotaReservation, limits?: EmailLimits, exhausted?: "day" | "month"): Promise<void> {
  const scopes = [
    { id: dayId(reservation.day), name: "day", limit: limits?.dailyLimit ?? RESEND_DAILY_LIMIT },
    { id: monthId(reservation.month), name: "month", limit: limits?.monthlyLimit ?? RESEND_MONTHLY_LIMIT },
  ] as const;
  const docs = await Promise.all(scopes.map((scope) => tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, scope.id)));
  scopes.forEach((scope, index) => {
    const doc = docs[index];
    if (doc) tx.set(COLLECTIONS.emailQuota, scope.id, { ...doc, used: exhausted === scope.name ? Math.max(scope.limit, doc.used - 1) : Math.max(0, doc.used - 1) });
  });
}

type Reserved = { attemptStartedAt?: string; sentAt?: string; reservation?: QuotaReservation };

// An accepted record that ends without ever starting an attempt (superseded, consumed, cancelled, edition gone) owes nothing:
// its admission unit is returned. Records with a started attempt keep their unit (the send may have happened).
export async function releaseUnstartedAdmission(store: Store, collection: typeof COLLECTIONS.subscriptionConfirmations | typeof COLLECTIONS.newsletterDeliveries | typeof COLLECTIONS.reportDeliveries, id: string, limits?: EmailLimits): Promise<void> {
  await store.transaction(async (tx) => {
    const current = await tx.get<Reserved & { id: string }>(collection, id);
    if (!current?.reservation || current.reservation.kind !== "admission" || current.attemptStartedAt || current.sentAt) return;
    await releaseReservation(tx, current.reservation, limits);
    const updated: Reserved = { ...current };
    delete updated.reservation;
    tx.set(collection, id, updated);
  });
}

// ---- Marketing account (Resend Free: 1000 contacts per ACCOUNT, not per segment) ------------------------------------

export const MARKETING_CONTACT_LIMIT = 1000;
// Room left for contacts created outside this site; the site cannot control the account globally.
export const MARKETING_MARGIN = 50;
// At 950 local slots, six scans per day read about 5,700 documents; other operations and external changes still need monitoring.
// A failed or missing refresh closes admission after eight hours.
export const MARKETING_MAX_AGE_MS = 8 * 60 * 60_000;
export const MARKETING_REFRESH_MS = 4 * 60 * 60_000;
export const MARKETING_RETRY_AFTER_SEC = 300;
const BASELINE_ID = "account";
const SCAN_PAGE = 100;
const MAX_SCAN_PAGES = 12;

const CONSENT_ID = "consent";

// Read before any write of the transaction; `bumpConsentEpoch` is then called with that value.
export const readConsentEpoch = async (tx: Tx): Promise<number> => (await tx.get<ConsentEpochRecord>(COLLECTIONS.marketingBaseline, CONSENT_ID))?.version ?? 0;
export const bumpConsentEpoch = (tx: Tx, current: number, at: string): void =>
  tx.set(COLLECTIONS.marketingBaseline, CONSENT_ID, { id: CONSENT_ID, version: current + 1, updatedAt: at } satisfies ConsentEpochRecord);

export const readBaseline = (tx: Tx) => tx.get<MarketingBaselineRecord>(COLLECTIONS.marketingBaseline, BASELINE_ID);

// A local counter of zero proves nothing about the account: admission opens only on a complete, recent measurement.
export function marketingClosedReason(baseline: MarketingBaselineRecord | undefined, at: Date): string | undefined {
  if (!baseline) return "baseline_missing";
  if (!baseline.complete) return baseline.reason ?? "baseline_incomplete";
  const measured = Date.parse(baseline.measuredAt);
  if (!Number.isFinite(measured) || at.getTime() - measured > MARKETING_MAX_AGE_MS) return "baseline_stale";
  if (baseline.count + baseline.reserved + MARKETING_MARGIN >= MARKETING_CONTACT_LIMIT) return "no_free_slot";
  return undefined;
}

export const marketingDenied = (): Denied => ({ ok: false, retryAfterSec: MARKETING_RETRY_AFTER_SEC, capacity: "marketing" });

// Caller checked `marketingClosedReason` first (and read `baseline` in this transaction).
export function reserveMarketingSlot(tx: Tx, baseline: MarketingBaselineRecord): void {
  tx.set(COLLECTIONS.marketingBaseline, BASELINE_ID, { ...baseline, reserved: baseline.reserved + 1, seq: baseline.seq + 1 });
}

export type AccountScanResult = { complete: true; emails: string[] } | { complete: false; reason: string };
export type AccountScan = (signal: AbortSignal) => Promise<AccountScanResult>;

export const ACCOUNT_SCAN_PAGE = SCAN_PAGE;
export const ACCOUNT_SCAN_MAX_PAGES = MAX_SCAN_PAGES;

type Page = { ok: true; contacts: { id: string; email: string }[]; hasMore: boolean } | { ok: false; reason: string };

// Provider boundary: anything that is not exactly a bounded list of {id, email} strings plus a boolean `has_more` is an
// incomplete page (never read as "no more"), so a missing or malformed field cannot make the count look complete.
export function parseContactsPage(data: unknown): Page {
  if (typeof data !== "object" || data === null) return { ok: false, reason: "bad_page" };
  const { data: list, has_more: hasMore } = data as { data?: unknown; has_more?: unknown };
  if (!Array.isArray(list) || typeof hasMore !== "boolean" || list.length > SCAN_PAGE) return { ok: false, reason: "bad_page" };
  const contacts: { id: string; email: string }[] = [];
  for (const item of list) {
    const { id, email } = (typeof item === "object" && item !== null ? item : {}) as { id?: unknown; email?: unknown };
    if (typeof id !== "string" || id === "" || typeof email !== "string" || email.trim() === "") return { ok: false, reason: "bad_page" };
    contacts.push({ id, email });
  }
  return { ok: true, contacts, hasMore };
}

// Complete, bounded, paginated listing: any error, repeated cursor, truncation or more contacts than the plan allows is
// reported as incomplete so admission stays closed.
export async function scanAccount(fetchPage: (after: string | undefined, signal: AbortSignal) => Promise<Page>, signal: AbortSignal): Promise<AccountScanResult> {
  const emails: string[] = [];
  const cursors = new Set<string>();
  let after: string | undefined;
  for (let page = 0; page < MAX_SCAN_PAGES; page += 1) {
    const result = await fetchPage(after, signal);
    if (!result.ok) return { complete: false, reason: result.reason };
    if (typeof result.hasMore !== "boolean" || !Array.isArray(result.contacts)) return { complete: false, reason: "bad_page" };
    for (const contact of result.contacts) emails.push(contact.email.trim().toLowerCase());
    if (emails.length > MARKETING_CONTACT_LIMIT) return { complete: false, reason: "over_limit" };
    if (!result.hasMore) return { complete: true, emails };
    const next = result.contacts.at(-1)?.id;
    if (!next || cursors.has(next)) return { complete: false, reason: "bad_pagination" };
    cursors.add(next);
    after = next;
  }
  return { complete: false, reason: "truncated" };
}

export type BaselineRefresh = "fresh" | "measured" | "closed";

// Authenticated internal job path (never per submit). Remote contacts are the count; slots the site holds whose contact is
// not (yet) visible remotely stay reserved. `seq` fences reservations made while the scan ran: they are added on top, which can
// over-count briefly but never under-counts, and a measurement never overwrites a reservation. `generation` fences the
// measurements themselves: a scan publishes (or closes) only if no newer scan started since, and its age counts from its start.
export async function refreshMarketingBaseline(store: Store, scan: AccountScan, now: () => Date, signal: AbortSignal, force = false): Promise<BaselineRefresh> {
  const started = now();
  const lease = await store.transaction(async (tx) => {
    const current = await readBaseline(tx);
    if (!force && current?.complete && started.getTime() - Date.parse(current.measuredAt) < MARKETING_REFRESH_MS) return undefined;
    const generation = (current?.generation ?? 0) + 1;
    tx.set(COLLECTIONS.marketingBaseline, BASELINE_ID, { id: BASELINE_ID, count: current?.count ?? 0, reserved: current?.reserved ?? 0, seq: current?.seq ?? 0, complete: current?.complete ?? false, measuredAt: current?.measuredAt ?? started.toISOString(), generation, ...(current?.reason ? { reason: current.reason } : {}) } satisfies MarketingBaselineRecord);
    return { generation, seq0: current?.seq ?? 0 };
  });
  if (!lease) return "fresh";
  const close = async (reason: string): Promise<BaselineRefresh> => {
    await store.transaction(async (tx) => {
      const current = await readBaseline(tx);
      if (current?.generation !== lease.generation) return;
      tx.set(COLLECTIONS.marketingBaseline, BASELINE_ID, { ...current, complete: false, measuredAt: started.toISOString(), reason } satisfies MarketingBaselineRecord);
    });
    return "closed";
  };
  let result: AccountScanResult;
  try {
    result = await scan(signal);
  } catch {
    return close("scan_error");
  }
  if (!result.complete) return close(result.reason);
  const remote = new Set(result.emails);
  const holders = await store.latest<SubscriptionRecord>(COLLECTIONS.subscriptions, "marketingSlotAt", MARKETING_CONTACT_LIMIT + 1);
  if (holders.length > MARKETING_CONTACT_LIMIT) return close("too_many_slots");
  const pending = holders.filter(({ data }) => data.marketingSlotAt && !remote.has(data.email.trim().toLowerCase())).length;
  return store.transaction(async (tx) => {
    const current = await readBaseline(tx);
    if (!current || current.generation !== lease.generation) return "closed" as const;
    tx.set(COLLECTIONS.marketingBaseline, BASELINE_ID, { id: BASELINE_ID, complete: true, count: result.emails.length, reserved: pending + Math.max(0, current.seq - lease.seq0), seq: current.seq, measuredAt: started.toISOString(), generation: lease.generation } satisfies MarketingBaselineRecord);
    return "measured" as const;
  });
}
