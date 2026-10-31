import type { Denied } from "./limits";
import type { Store, Tx } from "./store";
import { COLLECTIONS, type EmailQuotaRecord, type MarketingBaselineRecord, type QuotaReservation, type SubscriptionRecord } from "./types";

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
  const dayMoved = held.day !== counters.day;
  const monthMoved = held.month !== counters.month;
  if (!dayMoved && !monthMoved) return { ...held, kind: "attempt" };
  const oldDay = await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, dayId(held.day));
  const oldMonth = monthMoved ? await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, monthId(held.month)) : undefined;
  const wait = capacityWaitMs(counters, limits, monthMoved ? "both" : "day");
  if (wait !== undefined) return { waitMs: wait };
  tx.set(COLLECTIONS.emailQuota, dayId(counters.day), { id: dayId(counters.day), used: counters.dayUsed + 1, expiresAt: new Date(nextDayStart(at) + DAY_MS).toISOString() } satisfies EmailQuotaRecord);
  if (monthMoved) tx.set(COLLECTIONS.emailQuota, monthId(counters.month), { id: monthId(counters.month), used: counters.monthUsed + 1, expiresAt: new Date(nextMonthStart(at) + DAY_MS).toISOString() } satisfies EmailQuotaRecord);
  if (oldDay) tx.set(COLLECTIONS.emailQuota, oldDay.id, { ...oldDay, used: Math.max(0, oldDay.used - 1) });
  if (oldMonth) tx.set(COLLECTIONS.emailQuota, oldMonth.id, { ...oldMonth, used: Math.max(0, oldMonth.used - 1) });
  return { day: counters.day, month: counters.month, kind: "attempt" };
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
export const MARKETING_MAX_AGE_MS = 30 * 60_000;
export const MARKETING_REFRESH_MS = 10 * 60_000;
export const MARKETING_RETRY_AFTER_SEC = 300;
const BASELINE_ID = "account";
const SCAN_PAGE = 100;
const MAX_SCAN_PAGES = 12;

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

// Complete, bounded, paginated listing: any error, repeated cursor, truncation or more contacts than the plan allows is
// reported as incomplete so admission stays closed.
export async function scanAccount(fetchPage: (after: string | undefined, signal: AbortSignal) => Promise<Page>, signal: AbortSignal): Promise<AccountScanResult> {
  const emails: string[] = [];
  const cursors = new Set<string>();
  let after: string | undefined;
  for (let page = 0; page < MAX_SCAN_PAGES; page += 1) {
    const result = await fetchPage(after, signal);
    if (!result.ok) return { complete: false, reason: result.reason };
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
// over-count briefly but never under-counts, and a measurement never overwrites a reservation.
export async function refreshMarketingBaseline(store: Store, scan: AccountScan, now: () => Date, signal: AbortSignal, force = false): Promise<BaselineRefresh> {
  const before = await store.transaction((tx) => readBaseline(tx));
  const started = now();
  if (!force && before?.complete && started.getTime() - Date.parse(before.measuredAt) < MARKETING_REFRESH_MS) return "fresh";
  const seq0 = before?.seq ?? 0;
  const close = async (reason: string): Promise<BaselineRefresh> => {
    await store.transaction(async (tx) => {
      const current = await readBaseline(tx);
      tx.set(COLLECTIONS.marketingBaseline, BASELINE_ID, { id: BASELINE_ID, count: current?.count ?? 0, reserved: current?.reserved ?? 0, seq: current?.seq ?? 0, complete: false, measuredAt: now().toISOString(), reason } satisfies MarketingBaselineRecord);
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
  const holders = await store.query(COLLECTIONS.subscriptions, "marketingSlotAt", "9999", MARKETING_CONTACT_LIMIT + SCAN_PAGE);
  if (holders.length > MARKETING_CONTACT_LIMIT) return close("too_many_slots");
  let pending = 0;
  for (let index = 0; index < holders.length; index += SCAN_PAGE) {
    const chunk = holders.slice(index, index + SCAN_PAGE);
    const records = await store.transaction((tx) => Promise.all(chunk.map((id) => tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, id))));
    pending += records.filter((record) => record?.marketingSlotAt && !remote.has(record.email.trim().toLowerCase())).length;
  }
  await store.transaction(async (tx) => {
    const current = await readBaseline(tx);
    const seq = current?.seq ?? 0;
    tx.set(COLLECTIONS.marketingBaseline, BASELINE_ID, { id: BASELINE_ID, complete: true, count: result.emails.length, reserved: pending + Math.max(0, seq - seq0), seq, measuredAt: now().toISOString() } satisfies MarketingBaselineRecord);
  });
  return "measured";
}
