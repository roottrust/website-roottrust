import { randomUUID } from "node:crypto";
import { opaqueId } from "./ids";
import type { Denied, Gate } from "./limits";
import type { Store, Tx } from "./store";
import { COLLECTIONS, type LeadEventRecord, type LeadRecord, type SubscriptionRecord, type SubscriptionStatus, type ToolId } from "./types";

async function touchLead(
  tx: Tx,
  id: string,
  fields: Pick<LeadRecord, "name" | "company" | "whatsapp" | "email">,
  origin: string,
  at: string,
  commercialConsent: boolean,
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
  if (commercialConsent && !current?.commercialConsent) lead.commercialConsentAt = at;
  const eventId = `ev_${randomUUID()}`;
  const event: LeadEventRecord = {
    id: eventId,
    leadId: id,
    origin,
    at,
    ...(origin.startsWith("relatorio:") ? { commercialConsent } : {}),
  };
  tx.set(COLLECTIONS.leads, id, lead);
  tx.set(COLLECTIONS.leadEvents, eventId, event);
}

// `gate` (rate limits) runs inside the same transaction as the write: limit consumption and persistence commit together,
// and a request denied by this gate writes nothing (the earlier IP gate in http.ts is a separate transaction).
export async function recordDiagnostic(
  store: Store,
  secret: string,
  value: { name: string; company: string; whatsapp: string },
  now: Date,
  gate?: Gate,
): Promise<{ ok: true; id: string } | Denied> {
  const id = opaqueId(secret, "ld", `whatsapp:${value.whatsapp}`);
  return store.transaction(async (tx) => {
    const denied = await gate?.(tx);
    if (denied) return denied;
    await touchLead(tx, id, value, "diagnostico", now.toISOString(), false);
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
