import { randomInt, randomUUID } from "node:crypto";
import { opaqueId } from "./ids";
import { checkEmail } from "./validation";
import { enqueueJob } from "./jobs";
import type { Denied, Gate } from "./limits";
import type { Store, Tx } from "./store";
import { COLLECTIONS, JOB_KINDS, type DiagnosticRecord, type LeadEventRecord, type LeadRecord, type SubscriptionRecord, type SubscriptionStatus, type ToolId } from "./types";

async function touchLead(
  tx: Tx,
  id: string,
  fields: Pick<LeadRecord, "name" | "company" | "whatsapp" | "email">,
  origin: string,
  at: string,
  commercialConsent: boolean,
  requestId?: string,
): Promise<void> {
  const current = await tx.get<LeadRecord>(COLLECTIONS.leads, id);
  const lead: LeadRecord = {
    ...current,
    ...fields,
    id,
    origins: current?.origins.includes(origin) ? current.origins : [...(current?.origins ?? []), origin],
    commercialConsent: commercialConsent || current?.commercialConsent === true,
    firstSeenAt: current?.firstSeenAt ?? at,
    lastInteractionAt: at,
    interactionCount: (current?.interactionCount ?? 0) + 1,
  };
  if (commercialConsent && !current?.commercialConsent) {
    lead.commercialConsentAt = at;
    lead.commercialConsentOrigin = origin;
    delete lead.commercialConsentWithdrawnAt;
  }
  const eventId = `ev_${randomUUID()}`;
  const event: LeadEventRecord = {
    id: eventId,
    leadId: id,
    origin,
    at,
    ...(requestId ? { requestId } : {}),
    ...(origin.startsWith("relatorio:") ? { commercialConsent } : {}),
  };
  tx.set(COLLECTIONS.leads, id, lead);
  tx.set(COLLECTIONS.leadEvents, eventId, event);
}

const REQUEST_ID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const DIAGNOSTIC_ID = /^DG-[0-9A-HJKMNP-TV-Z]{10}$/;

// Short, typeable, random: the team quotes it from Discord; it reveals nothing about the person.
function newDiagnosticId(): string {
  return `DG-${Array.from({ length: 10 }, () => REQUEST_ID_ALPHABET[randomInt(REQUEST_ID_ALPHABET.length)]).join("")}`;
}

// Every accepted request gets its own record (ID unique per request) and its own Discord outbox job, committed together:
// a 202 means the request is stored and its notification is queued. The lead keeps the latest contact fields and its
// history (origins, event per request, counters); earlier names/companies stay on their own request records.
// `gate` (rate limits) runs inside the same transaction as the write: limit consumption and persistence commit together,
// and a request denied by this gate writes nothing (the earlier IP gate in http.ts is a separate transaction).
export async function recordDiagnostic(
  store: Store,
  secret: string,
  value: { name: string; company: string; whatsapp: string },
  now: Date,
  gate?: Gate,
): Promise<{ ok: true; id: string } | Denied> {
  const leadId = opaqueId(secret, "ld", `whatsapp:${value.whatsapp}`);
  const at = now.toISOString();
  return store.transaction(async (tx) => {
    const denied = await gate?.(tx);
    if (denied) return denied;
    let id = newDiagnosticId();
    for (let attempt = 0; attempt < 5 && (await tx.get(COLLECTIONS.diagnostics, id)); attempt += 1) id = newDiagnosticId();
    if (await tx.get(COLLECTIONS.diagnostics, id)) throw new Error("diagnostic_id_collision");
    await touchLead(tx, leadId, value, "diagnostico", at, false, id);
    const record: DiagnosticRecord = { id, leadId, ...value, createdAt: at };
    tx.set(COLLECTIONS.diagnostics, id, record);
    await enqueueJob(tx, secret, { kind: JOB_KINDS.diagnosticDiscord, key: id, payload: { requestId: id }, maxAttempts: 8 }, now);
    return { ok: true as const, id };
  });
}

export async function recordReportRequest(
  store: Store,
  secret: string,
  value: { email: string; toolId: ToolId; commercialConsent: boolean },
  now: Date,
  gate?: Gate,
): Promise<{ ok: true } | Denied> {
  const id = opaqueId(secret, "ld", `email:${value.email}`);
  return store.transaction(async (tx) => {
    const denied = await gate?.(tx);
    if (denied) return denied;
    await touchLead(tx, id, { email: value.email }, `relatorio:${value.toolId}`, now.toISOString(), value.commercialConsent);
    return { ok: true as const };
  });
}

// Confirmed and cancelled records are left untouched: re-confirmation and delivery belong to the confirmation flow.
export async function requestSubscription(
  store: Store,
  secret: string,
  value: { email: string; editionSlug?: string },
  now: Date,
  gate?: Gate,
): Promise<{ ok: true } | Denied> {
  const id = opaqueId(secret, "sb", `email:${value.email}`);
  const at = now.toISOString();
  return store.transaction(async (tx) => {
    const denied = await gate?.(tx);
    if (denied) return denied;
    const current = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, id);
    if (current && current.status !== "pending") return { ok: true as const };
    const slug = value.editionSlug ?? current?.requestedEditionSlug;
    const record: SubscriptionRecord = {
      id,
      email: value.email,
      status: "pending",
      ...(slug ? { requestedEditionSlug: slug } : {}),
      createdAt: current?.createdAt ?? at,
      updatedAt: at,
    };
    tx.set(COLLECTIONS.subscriptions, id, record);
    return { ok: true as const };
  });
}

// Compare-and-set: of N concurrent callers with the same `from`, exactly one gets "ok".
export async function transitionSubscription(
  store: Store,
  id: string,
  from: SubscriptionStatus,
  to: SubscriptionStatus,
  now: Date,
): Promise<"ok" | "not_found" | "conflict"> {
  return store.transaction(async (tx) => {
    const current = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, id);
    if (!current) return "not_found";
    if (current.status !== from) return "conflict";
    tx.set(COLLECTIONS.subscriptions, id, { ...current, status: to, updatedAt: now.toISOString() });
    return "ok";
  });
}

export const CONSENT_WITHDRAWAL_ORIGIN = "consentimento:retirada";

// Administrative, local operation (needs DATA_ID_SECRET and storage credentials): the public site cannot prove who owns
// an e-mail, so withdrawal is never exposed as an unauthenticated endpoint. The operator verifies the request by hand
// (see docs/web/development.md) and runs this. Idempotent; it does not count as lead activity (retention clock untouched).
export async function withdrawCommercialConsent(
  store: Store,
  secret: string,
  email: string,
  now: Date,
): Promise<"withdrawn" | "no_consent" | "not_found" | "invalid_email"> {
  const normalized = checkEmail(email);
  if (!normalized) return "invalid_email";
  const id = opaqueId(secret, "ld", `email:${normalized}`);
  const at = now.toISOString();
  return store.transaction(async (tx) => {
    const current = await tx.get<LeadRecord>(COLLECTIONS.leads, id);
    if (!current) return "not_found";
    if (!current.commercialConsent) return "no_consent";
    const lead: LeadRecord = { ...current, commercialConsent: false, commercialConsentWithdrawnAt: at };
    delete lead.commercialConsentAt;
    delete lead.commercialConsentOrigin;
    const eventId = `ev_${randomUUID()}`;
    const event: LeadEventRecord = { id: eventId, leadId: id, origin: CONSENT_WITHDRAWAL_ORIGIN, commercialConsent: false, at };
    tx.set(COLLECTIONS.leads, id, lead);
    tx.set(COLLECTIONS.leadEvents, eventId, event);
    return "withdrawn";
  });
}
