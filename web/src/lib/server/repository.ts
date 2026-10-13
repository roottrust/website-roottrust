import { randomInt, randomUUID } from "node:crypto";
import { opaqueId } from "./ids";
import { MAX_REGENERATIONS_PER_DAY, type DecisionAction, type DecisionResult } from "./newsletter-protocol";
import { checkEmail, extractOpening, type EditionInput } from "./validation";
import { enqueueJob } from "./jobs";
import type { Denied, Gate } from "./limits";
import type { Store, Tx } from "./store";
import { COLLECTIONS, JOB_KINDS, type DiagnosticRecord, type EditionBroadcastRecord, type EditionDraftRecord, type EditionPublicRecord, type EditionRevisionRecord, type JobRecord, type LeadEventRecord, type LeadRecord, type ReplayRecord, type ReportDeliveryRecord, type SlugReservationRecord, type SubscriptionRecord, type SubscriptionStatus, type ToolId } from "./types";

const REPORT_MAX_ATTEMPTS = 8;

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

// One delivery (and one e-mail job, one quota unit) per e-mail + tool + UTC day, with an opaque stable ID: repeats the same
// day only touch the lead (checkbox updates are kept) and reuse the queued delivery. 202 means queued (new or existing),
// never sent; a same-day repeat whose job already died is denied until the next UTC day rather than acknowledged.
export async function recordReportRequest(
  store: Store,
  secret: string,
  value: { email: string; toolId: ToolId; commercialConsent: boolean },
  now: Date,
  gate?: Gate,
): Promise<{ ok: true } | Denied> {
  const id = opaqueId(secret, "ld", `email:${value.email}`);
  const at = now.toISOString();
  const deliveryId = opaqueId(secret, "rp", `${value.email}:${value.toolId}:${at.slice(0, 10)}`);
  return store.transaction(async (tx) => {
    const denied = await gate?.(tx);
    if (denied) return denied;
    const existing = await tx.get<ReportDeliveryRecord>(COLLECTIONS.reportDeliveries, deliveryId);
    const job = existing ? await tx.get<JobRecord>(COLLECTIONS.jobs, opaqueId(secret, "jb", `${JOB_KINDS.reportEmail}:${deliveryId}`)) : undefined;
    if (existing && !existing.sentAt && (!job || job.status === "dead")) {
      return { ok: false as const, retryAfterSec: Math.ceil((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - now.getTime()) / 1000) };
    }
    await touchLead(tx, id, { email: value.email }, `relatorio:${value.toolId}`, at, value.commercialConsent, deliveryId);
    if (existing) return { ok: true as const };
    const delivery: ReportDeliveryRecord = { id: deliveryId, leadId: id, email: value.email, toolId: value.toolId, createdAt: at };
    tx.set(COLLECTIONS.reportDeliveries, deliveryId, delivery);
    await enqueueJob(tx, secret, { kind: JOB_KINDS.reportEmail, key: deliveryId, payload: { requestId: deliveryId }, maxAttempts: REPORT_MAX_ATTEMPTS }, now);
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

// A revision is written once and never updated: approval (T4.3) binds to `${draftId}.${revision}` and so to the exact text
// that was reviewed. Saving never publishes. A new revision (regeneration) resets the draft to "pending", moves
// `currentRevision` and drops the Discord binding, which is what makes older revisions and their buttons stale.
// A first revision also reserves its slug (`slug_reservations`, doc ID = slug) in the same transaction: two concurrent first
// revisions with one slug cannot both commit, and a slug already published by another draft is refused too.
// Approved drafts are frozen. `regenerationOnly` (the draft endpoint) additionally refuses to touch a draft that no reviewer
// asked to regenerate. `gate` and `enqueue` run inside the same transaction, so the outbox job commits with the revision.
export async function saveEditionRevision(
  store: Store,
  input: EditionInput & { draftId?: string },
  now: Date,
  options: { regenerationOnly?: boolean; gate?: Gate; enqueue?: (tx: Tx, saved: { draftId: string; revision: number }) => Promise<void> } = {},
): Promise<
  | { ok: true; draftId: string; revision: number }
  | { ok: false; reason: "not_found" | "approved" | "invalid_body" | "not_regenerating" | "slug_mismatch" | "slug_exists" }
  | ({ ok: false; reason: "rate_limited" } & Denied)
> {
  const abertura = extractOpening(input.corpo);
  if (!abertura) return { ok: false, reason: "invalid_body" };
  const at = now.toISOString();
  return store.transaction(async (tx) => {
    const current = input.draftId ? await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, input.draftId) : undefined;
    if (input.draftId && !current) return { ok: false as const, reason: "not_found" as const };
    if (current?.status === "approved") return { ok: false as const, reason: "approved" as const };
    if (options.regenerationOnly && current && current.status !== "regeneration_requested") return { ok: false as const, reason: "not_regenerating" as const };
    if (current && current.slug !== input.slug) return { ok: false as const, reason: "slug_mismatch" as const };
    const draftId = current?.id ?? `ed_${randomUUID()}`;
    const revision = (current?.currentRevision ?? 0) + 1;
    const id = `${draftId}.${revision}`;
    if (await tx.get(COLLECTIONS.editionRevisions, id)) throw new Error("edition_revision_exists");
    const reservation = current ? undefined : await tx.get<SlugReservationRecord>(COLLECTIONS.slugReservations, input.slug);
    const published = current ? undefined : await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, input.slug);
    if (reservation || published) return { ok: false as const, reason: "slug_exists" as const };
    const denied = await options.gate?.(tx);
    if (denied) return { reason: "rate_limited" as const, ...denied };
    const record: EditionRevisionRecord = {
      id,
      draftId,
      revision,
      slug: input.slug,
      data: input.data,
      pilar: input.pilar,
      titulo: input.titulo,
      corpo: input.corpo,
      abertura,
      fontes: input.fontes,
      createdAt: at,
    };
    const carried: Partial<EditionDraftRecord> = { ...current };
    delete carried.notification;
    delete carried.decidedAt;
    const draft: EditionDraftRecord = { ...carried, id: draftId, slug: input.slug, currentRevision: revision, status: "pending", createdAt: current?.createdAt ?? at, updatedAt: at };
    tx.set(COLLECTIONS.editionRevisions, id, record);
    tx.set(COLLECTIONS.editionDrafts, draftId, draft);
    if (!current) tx.set(COLLECTIONS.slugReservations, input.slug, { slug: input.slug, draftId, createdAt: at } satisfies SlugReservationRecord);
    await options.enqueue?.(tx, { draftId, revision });
    return { ok: true as const, draftId, revision };
  });
}

// The only place that builds the public record: an explicit allowlist, so `corpo` (or any future private field) cannot leak.
export function projectPublicEdition(revision: EditionRevisionRecord, publishedAt: string): EditionPublicRecord {
  return {
    slug: revision.slug,
    data: revision.data,
    pilar: revision.pilar,
    titulo: revision.titulo,
    abertura: revision.abertura.map((segment) => (segment.href ? { t: segment.t, href: segment.href } : { t: segment.t })),
    fontes: revision.fontes.map((source) => ({ titulo: source.titulo, href: source.href })),
    draftId: revision.draftId,
    revision: revision.revision,
    publishedAt,
  };
}

// One-step approve+publish compare-and-set. The real flow does not use it (approval and publication are separate steps:
// decideEditionRevision then publishApprovedEdition); it stays as a self-contained library operation covered by tests.
export async function publishEditionRevision(
  store: Store,
  draftId: string,
  revision: number,
  now: Date,
): Promise<"published" | "already" | "not_found" | "stale" | "conflict" | "slug_taken"> {
  return store.transaction(async (tx) => {
    const draft = await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, draftId);
    const record = await tx.get<EditionRevisionRecord>(COLLECTIONS.editionRevisions, `${draftId}.${revision}`);
    if (!draft || !record) return "not_found";
    if (draft.status === "approved") return draft.approvedRevision === revision ? "already" : "conflict";
    if (draft.status !== "pending") return "conflict";
    if (draft.currentRevision !== revision) return "stale";
    const taken = await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, record.slug);
    if (taken && taken.draftId !== draftId) return "slug_taken";
    const at = now.toISOString();
    tx.set(COLLECTIONS.editionsPublic, record.slug, projectPublicEdition(record, at));
    tx.set(COLLECTIONS.editionDrafts, draftId, { ...draft, status: "approved", approvedRevision: revision, updatedAt: at });
    return "published";
  });
}

// Binds the Discord control message to exactly one revision. Written only if that revision is still the current, pending
// one and has no binding yet; otherwise the message that was posted simply never matches (its buttons are stale).
export async function bindEditionNotification(
  store: Store,
  notification: { draftId: string; revision: number; channelId: string; messageId: string },
  now: Date,
): Promise<boolean> {
  return store.transaction(async (tx) => {
    const draft = await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, notification.draftId);
    if (!draft || draft.currentRevision !== notification.revision || draft.status !== "pending" || draft.notification) return false;
    const at = now.toISOString();
    tx.set(COLLECTIONS.editionDrafts, draft.id, {
      ...draft,
      notification: { revision: notification.revision, channelId: notification.channelId, messageId: notification.messageId, at },
      updatedAt: at,
    });
    return true;
  });
}

const SAO_PAULO_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });

export const NEWSLETTER_JOB_ATTEMPTS = 8;
export type DecisionOutcome = DecisionResult | "proof_replay";

// Compare-and-set on the draft. Buttons are valid only for the current revision, in the exact channel and message recorded
// for it, while the draft is still pending: rejecting or asking for a new version changes the status, and a new revision
// replaces the binding, so every older button fails here.
// Approval is the only decision that starts publication, and it only records the decision: in ONE transaction the draft
// becomes "approved" for exactly this revision and the durable publish job is enqueued (idempotent on draft+revision). A
// repeat or a concurrent click finds "approved" and answers "already_approved" without a second job. The Discord proof
// marker (`replay`) is consumed in the same transaction as the decision, so one signed interaction decides at most once.
export async function decideEditionRevision(
  store: Store,
  input: { action: DecisionAction; draftId: string; revision: number; channelId: string; messageId: string },
  now: Date,
  context: { secret: string; replay: { id: string; expiresAt: string } },
): Promise<DecisionOutcome> {
  return store.transaction(async (tx) => {
    const draft = await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, input.draftId);
    const used = await tx.get<ReplayRecord>(COLLECTIONS.replays, context.replay.id);
    if (used) return "proof_replay";
    if (!draft) return "not_found";
    if (draft.currentRevision !== input.revision) return "stale";
    const bound = draft.notification;
    if (!bound || bound.revision !== input.revision || bound.channelId !== input.channelId || bound.messageId !== input.messageId) return "mismatch";
    const at = now.toISOString();
    const consume = () => tx.set(COLLECTIONS.replays, context.replay.id, { id: context.replay.id, expiresAt: context.replay.expiresAt } satisfies ReplayRecord);
    if (input.action === "approve") {
      if (draft.status === "approved") return draft.approvedRevision === input.revision ? "already_approved" : "conflict";
      if (draft.status !== "pending") return "conflict";
      const reservation = await tx.get<SlugReservationRecord>(COLLECTIONS.slugReservations, draft.slug);
      const published = await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, draft.slug);
      if (reservation?.draftId !== draft.id || (published && published.draftId !== draft.id)) return "slug_unavailable";
      await enqueueJob(
        tx,
        context.secret,
        { kind: JOB_KINDS.newsletterPublish, key: `${draft.id}.${input.revision}`, payload: { draftId: draft.id, revision: String(input.revision) }, maxAttempts: NEWSLETTER_JOB_ATTEMPTS },
        now,
      );
      tx.set(COLLECTIONS.editionDrafts, draft.id, { ...draft, status: "approved", approvedRevision: input.revision, decidedAt: at, updatedAt: at });
      consume();
      return "approved";
    }
    if (input.action === "reject") {
      if (draft.status === "rejected") return "already_rejected";
      if (draft.status !== "pending") return "conflict";
      tx.set(COLLECTIONS.editionDrafts, draft.id, { ...draft, status: "rejected", decidedAt: at, updatedAt: at });
      consume();
      return "rejected";
    }
    if (draft.status === "regeneration_requested") return "already_regenerating";
    if (draft.status !== "pending") return "conflict";
    const day = SAO_PAULO_DAY.format(now);
    const count = draft.regenerations?.day === day ? draft.regenerations.count : 0;
    if (count >= MAX_REGENERATIONS_PER_DAY) return "regeneration_limit";
    tx.set(COLLECTIONS.editionDrafts, draft.id, { ...draft, status: "regeneration_requested", regenerations: { day, count: count + 1 }, decidedAt: at, updatedAt: at });
    consume();
    return "regeneration_requested";
  });
}

export type PublishOutcome = "published" | "already";
export class PublicationBlocked extends Error {
  override name = "PublicationBlocked";
  readonly reason: "not_approved" | "not_found" | "slug_taken";
  constructor(reason: "not_approved" | "not_found" | "slug_taken") {
    super(reason);
    this.reason = reason;
  }
}

// Publication step, run by the durable job. It trusts nothing but storage: the draft must be approved for exactly this
// revision (the stored decision, not the job payload), the revision must exist and the slug must belong to this draft.
// It writes only the allowlisted public projection (idempotent: an existing record of the same draft is left as is) and,
// in the same transaction, enqueues the broadcast job, so "published" and "delivery scheduled" commit together while
// staying separate states (a delivery failure never un-publishes). Without a configured Broadcast (`scheduleBroadcast`
// false) no delivery job is created: it would have no handler and would only crowd the claim window of other kinds.
export async function publishApprovedEdition(store: Store, secret: string, draftId: string, revision: number, now: Date, scheduleBroadcast: boolean): Promise<PublishOutcome> {
  return store.transaction(async (tx) => {
    const draft = await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, draftId);
    const record = await tx.get<EditionRevisionRecord>(COLLECTIONS.editionRevisions, `${draftId}.${revision}`);
    if (!draft || !record) throw new PublicationBlocked("not_found");
    if (draft.status !== "approved" || draft.approvedRevision !== revision) throw new PublicationBlocked("not_approved");
    const reservation = await tx.get<SlugReservationRecord>(COLLECTIONS.slugReservations, record.slug);
    const existing = await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, record.slug);
    if (reservation?.draftId !== draftId || (existing && (existing.draftId !== draftId || existing.revision !== revision))) throw new PublicationBlocked("slug_taken");
    if (scheduleBroadcast) {
      await enqueueJob(
        tx,
        secret,
        { kind: JOB_KINDS.newsletterBroadcast, key: `${draftId}.${revision}`, payload: { draftId, revision: String(revision) }, maxAttempts: NEWSLETTER_JOB_ATTEMPTS },
        now,
      );
    }
    if (existing) return "already";
    tx.set(COLLECTIONS.editionsPublic, record.slug, projectPublicEdition(record, now.toISOString()));
    return "published";
  });
}

export interface BroadcastBasis {
  revision: EditionRevisionRecord;
  state: EditionBroadcastRecord;
  approvedAt: string | undefined; // the stored approval instant; the delivery job refuses to act on a stale approval
}

export const broadcastName = (draftId: string, revision: number) => `rt-newsletter ${draftId}.${revision}`;

// Loads (creating on first use) the delivery state of an approved revision. Refuses anything not approved for exactly this
// revision or not yet published, so a Broadcast can only ever carry text a human approved and the site already shows.
export async function loadBroadcastBasis(store: Store, draftId: string, revision: number, segmentId: string, now: Date): Promise<BroadcastBasis> {
  return store.transaction(async (tx) => {
    const draft = await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, draftId);
    const record = await tx.get<EditionRevisionRecord>(COLLECTIONS.editionRevisions, `${draftId}.${revision}`);
    if (!draft || !record) throw new PublicationBlocked("not_found");
    if (draft.status !== "approved" || draft.approvedRevision !== revision) throw new PublicationBlocked("not_approved");
    const published = await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, record.slug);
    if (published?.draftId !== draftId || published.revision !== revision) throw new PublicationBlocked("not_found");
    const id = `${draftId}.${revision}`;
    const current = await tx.get<EditionBroadcastRecord>(COLLECTIONS.editionBroadcasts, id);
    if (current) return { revision: record, state: current, approvedAt: draft.decidedAt };
    const at = now.toISOString();
    const state: EditionBroadcastRecord = { id, draftId, revision, slug: record.slug, name: broadcastName(draftId, revision), segmentId, createdAt: at, updatedAt: at };
    tx.set(COLLECTIONS.editionBroadcasts, id, state);
    return { revision: record, state, approvedAt: draft.decidedAt };
  });
}

// Compare-and-set on the delivery state: `change` runs on the freshly read record and returns the fields to change, or
// undefined to leave it untouched (the caller then sees the record as it is). Used to stamp attempts BEFORE a provider call.
export async function updateBroadcastState(
  store: Store,
  id: string,
  now: Date,
  change: (current: EditionBroadcastRecord) => { set?: Partial<EditionBroadcastRecord>; clear?: (keyof EditionBroadcastRecord)[] } | undefined,
): Promise<{ applied: boolean; state: EditionBroadcastRecord }> {
  return store.transaction(async (tx) => {
    const current = await tx.get<EditionBroadcastRecord>(COLLECTIONS.editionBroadcasts, id);
    if (!current) throw new Error("broadcast_state_missing");
    const patch = change(current);
    if (!patch) return { applied: false, state: current };
    const next: EditionBroadcastRecord = { ...current, ...patch.set, updatedAt: now.toISOString() };
    for (const key of patch.clear ?? []) delete next[key];
    tx.set(COLLECTIONS.editionBroadcasts, id, next);
    return { applied: true, state: next };
  });
}
