import { opaqueId } from "./ids";
import { logEvent, safeErrorCode } from "./safe";
import type { Store } from "./store";
import { COLLECTIONS, JOB_KINDS, type LeadRecord } from "./types";

export const LEAD_RETENTION_MONTHS = 6;
const CHILD_PAGE = 50;
const MAX_CHILD_PAGES = 4; // a lead with more history is finished by later runs (every run is bounded)

// Calendar months in UTC; the day is clamped (31 Aug - 6 months = 28/29 Feb), never rolled into March.
export function leadRetentionCutoff(now: Date): Date {
  const cutoff = new Date(now);
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - LEAD_RETENTION_MONTHS);
  const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
  cutoff.setUTCDate(Math.min(day, lastDay));
  return cutoff;
}

export interface LeadPurgeSummary {
  leads: number; // leads fully deleted
  records: number; // events + diagnostics deleted (each diagnostic's outbox job goes with it)
  partial: number; // stale leads left for the next run (large history, concurrent touch or time budget)
  failed: number; // leads whose deletion hit a storage error; retried next run
  deferred: number; // candidates not started because the time budget ran out; retried next run
}

type ChildCollection = typeof COLLECTIONS.leadEvents | typeof COLLECTIONS.diagnostics | typeof COLLECTIONS.reportDeliveries;

// One bounded page of a stale lead's children, deleted in a single transaction that first re-reads the lead: any
// interaction rewrites the lead, so a lead touched after the staleness check aborts the page (`touched`) and keeps
// everything. Children are deleted regardless of their own date: the lead's inactivity proves them obsolete (e.g. a
// withdrawal event recorded last month on a lead idle for seven). Diagnostic outbox job ids derive from the diagnostic id.
async function deleteChildPage(store: Store, secret: string, leadId: string, cutoff: string, collection: ChildCollection) {
  const ids = await store.queryEquals(collection, "leadId", leadId, CHILD_PAGE);
  if (!ids.length) return { listed: 0, deleted: 0, touched: false };
  return store.transaction(async (tx) => {
    const lead = await tx.get<LeadRecord>(COLLECTIONS.leads, leadId);
    if (!lead || lead.lastInteractionAt > cutoff) return { listed: ids.length, deleted: 0, touched: true };
    let deleted = 0;
    for (const id of ids) {
      const record = await tx.get<{ leadId: string }>(collection, id);
      if (record?.leadId !== leadId) continue;
      tx.delete(collection, id);
      if (collection === COLLECTIONS.diagnostics) tx.delete(COLLECTIONS.jobs, opaqueId(secret, "jb", `${JOB_KINDS.diagnosticDiscord}:${id}`));
      if (collection === COLLECTIONS.reportDeliveries) tx.delete(COLLECTIONS.jobs, opaqueId(secret, "jb", `${JOB_KINDS.reportEmail}:${id}`));
      deleted += 1;
    }
    return { listed: ids.length, deleted, touched: false };
  });
}

// Children first, lead last: an interruption leaves the lead (still stale) as the resume marker and never orphans PII.
async function purgeLead(
  store: Store,
  secret: string,
  leadId: string,
  cutoff: string,
  shouldStop: () => boolean,
): Promise<{ done: boolean; records: number }> {
  let records = 0;
  for (const collection of [COLLECTIONS.leadEvents, COLLECTIONS.diagnostics, COLLECTIONS.reportDeliveries] as const) {
    for (let page = 0; page < MAX_CHILD_PAGES; page += 1) {
      if (shouldStop()) return { done: false, records };
      const result = await deleteChildPage(store, secret, leadId, cutoff, collection);
      records += result.deleted;
      if (result.touched) return { done: false, records };
      // A page that deleted nothing (stale index entries) must not spin; the remaining check below reports it.
      if (result.listed < CHILD_PAGE || result.deleted === 0) break;
    }
  }
  const remaining =
    (await store.queryEquals(COLLECTIONS.leadEvents, "leadId", leadId, 1)).length +
    (await store.queryEquals(COLLECTIONS.diagnostics, "leadId", leadId, 1)).length +
    (await store.queryEquals(COLLECTIONS.reportDeliveries, "leadId", leadId, 1)).length;
  if (remaining) return { done: false, records };

  const removed = await store.transaction(async (tx) => {
    const lead = await tx.get<LeadRecord>(COLLECTIONS.leads, leadId);
    if (!lead || lead.lastInteractionAt > cutoff) return false;
    tx.delete(COLLECTIONS.leads, leadId);
    return true;
  });
  return { done: removed, records };
}

// Leads with no interaction for six months, oldest first, at most `limit` per call. `shouldStop` is the caller's time
// budget, checked before each lead and page; leftovers are reported (`deferred`/`partial`) and continue next run.
// Never throws: storage errors are counted and logged as a short code only (no IDs, no contact data).
export async function purgeInactiveLeads(
  store: Store,
  secret: string,
  now: Date,
  limit: number,
  shouldStop: () => boolean = () => false,
): Promise<LeadPurgeSummary> {
  const cutoff = leadRetentionCutoff(now).toISOString();
  const summary: LeadPurgeSummary = { leads: 0, records: 0, partial: 0, failed: 0, deferred: 0 };
  let candidates: string[];
  try {
    candidates = await store.query(COLLECTIONS.leads, "lastInteractionAt", cutoff, limit);
  } catch (error) {
    logEvent("error", "lead_purge_query_failed", { error: safeErrorCode(error) });
    return { ...summary, failed: 1 };
  }
  for (const [index, leadId] of candidates.entries()) {
    if (shouldStop()) {
      summary.deferred = candidates.length - index;
      break;
    }
    try {
      const result = await purgeLead(store, secret, leadId, cutoff, shouldStop);
      summary.records += result.records;
      if (result.done) summary.leads += 1;
      else summary.partial += 1;
    } catch (error) {
      summary.failed += 1;
      logEvent("error", "lead_purge_failed", { error: safeErrorCode(error) });
    }
  }
  return summary;
}
