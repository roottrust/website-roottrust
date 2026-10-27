import { Resend } from "resend";
import { cancellationToken, confirmationToken } from "./ids";
import { PermanentFailure, RetryLater, type JobHandler } from "./jobs";
import { buildBroadcastMessage, loadBroadcastConfig, type BroadcastConfig } from "./newsletter-broadcast";
import { IDEMPOTENCY_WINDOW_MS, RESEND_DAILY_LIMIT, RESEND_MONTHLY_LIMIT } from "./report";
import { logEvent, safeErrorCode } from "./safe";
import type { Store, Tx } from "./store";
import { COLLECTIONS, type EditionDraftRecord, type EditionPublicRecord, type EditionRevisionRecord, type EmailQuotaRecord, type NewsletterDeliveryRecord, type SubscriptionConfirmationRecord, type SubscriptionRecord } from "./types";
import { checkEmail } from "./validation";
import { loadDefenseConfig } from "./defense";
import { hasIdSecret } from "./defense";
import { loadInternalKeys } from "./internal-auth";
import { resolveBackendMode } from "./mode";
import { resolveFormMode, type ContactFormConfig } from "../forms";

const SEND_TIMEOUT_MS = 15_000;
const DAY_MS = 86_400_000;

export interface NewsletterEmail {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}
export type EmailResult = { ok: true; id: string } | { ok: false; code: string; status: number | null };
export type NewsletterMailer = (email: NewsletterEmail, key: string, signal: AbortSignal) => Promise<EmailResult>;
export interface NewsletterEmailConfig {
  apiKey: string;
  from: string;
  replyTo: string;
  siteOrigin: string;
  allowlist: readonly string[];
  dailyLimit: number;
  monthlyLimit: number;
  mailer?: NewsletterMailer;
}

const clamp = (raw: string | undefined, max: number) => {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 && value < max ? value : max;
};
const senderAddress = (value: string) => checkEmail(/<([^<>]+)>\s*$/.exec(value)?.[1] ?? value);

// Separate from Broadcast config: transactional confirmation can be prepared before a marketing segment exists.
export function loadNewsletterEmailConfig(env: Record<string, string | undefined>): NewsletterEmailConfig | undefined {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.NEWSLETTER_EMAIL_FROM?.trim();
  const replyTo = checkEmail(env.NEWSLETTER_EMAIL_REPLY_TO?.trim());
  let siteOrigin: string | undefined;
  try {
    const url = new URL(env.NEWSLETTER_SITE_ORIGIN ?? "");
    if (url.protocol === "https:" && !url.username && !url.password && url.href === `${url.origin}/`) siteOrigin = url.origin;
  } catch { /* missing configuration */ }
  const items = (env.NEWSLETTER_PILOT_ALLOWLIST ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const emails = items.map(checkEmail);
  if (!apiKey || !from || !senderAddress(from) || !replyTo || !siteOrigin || !items.length || items.length > 100 || emails.some((email) => !email)) return undefined;
  if (env.RESEND_DOMAIN_CONFIRMED !== "true" || env.JOBS_TRIGGER_CONFIRMED !== "true") return undefined;
  return { apiKey, from, replyTo, siteOrigin, allowlist: [...new Set(emails as string[])], dailyLimit: clamp(env.REPORT_EMAIL_DAILY_LIMIT, RESEND_DAILY_LIMIT), monthlyLimit: clamp(env.REPORT_EMAIL_MONTHLY_LIMIT, RESEND_MONTHLY_LIMIT) };
}

export function resolveNewsletterAvailability(env: Record<string, string | undefined>): ContactFormConfig {
  if (resolveFormMode(env.FORM_MODE) === "demo") return { mode: "demo" };
  const siteKey = env.TURNSTILE_SITE_KEY?.trim();
  const ready = resolveBackendMode(env.BACKEND_MODE) === "pilot"
    && loadDefenseConfig(env).config !== undefined
    && hasIdSecret(env.DATA_ID_SECRET)
    && Boolean(loadInternalKeys(env)?.jobs?.length)
    && loadNewsletterEmailConfig(env) !== undefined
    && loadBroadcastConfig(env) !== undefined
    && Boolean(env.RESEND_WEBHOOK_SECRET?.trim());
  return ready && siteKey ? { mode: "pilot", siteKey } : { mode: "unavailable" };
}

function resendMailer(apiKey: string): NewsletterMailer {
  const client = new Resend(apiKey);
  return async (email, idempotencyKey, signal) => {
    const { data, error } = await client.emails.send({ from: email.from, to: email.to, replyTo: email.replyTo, subject: email.subject, html: email.html, text: email.text, tags: [{ name: "rt_delivery_id", value: idempotencyKey.slice("newsletter-".length) }] }, { idempotencyKey, signal });
    return error || !data ? { ok: false, code: error?.name ?? "no_response", status: error?.statusCode ?? null } : { ok: true, id: data.id };
  };
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);

export function confirmationEmail(config: NewsletterEmailConfig, to: string, token: string): NewsletterEmail {
  const link = `${config.siteOrigin}/newsletter/confirmar#token=${encodeURIComponent(token)}`;
  const text = `Confirme seu endereço para receber a newsletter Root Trust.\n\nAbra ${link} e selecione Confirmar. O link vale por 24 horas. Se você não fez o pedido, ignore esta mensagem.`;
  return { to, from: config.from, replyTo: config.replyTo, subject: "Confirme seu endereço — Root Trust", text, html: `<p>Confirme seu endereço para receber a newsletter Root Trust.</p><p><a href="${escapeHtml(link)}">Abrir confirmação</a></p><p>O link vale por 24 horas. Se você não fez o pedido, ignore esta mensagem.</p>` };
}

export function editionEmail(config: NewsletterEmailConfig, to: string, revision: EditionRevisionRecord, unsubscribe: string): NewsletterEmail {
  const rendered = buildBroadcastMessage({ from: config.from, replyTo: config.replyTo, segmentId: "individual" }, revision, "individual", unsubscribe);
  return { to, from: config.from, replyTo: config.replyTo, subject: rendered.subject, html: rendered.html, text: rendered.text };
}

type Attempt = { attemptStartedAt?: string; reservation?: { day: string; month: string }; sentAt?: string; resendId?: string; reconcile?: boolean };
type Reservation = { day: string; month: string };
type Prepared = "done" | "send" | "reconcile" | { waitMs: number };

async function reserveQuota(tx: Tx, config: NewsletterEmailConfig, at: Date): Promise<Reservation | { waitMs: number }> {
  const day = at.toISOString().slice(0, 10);
  const month = at.toISOString().slice(0, 7);
  const dayId = `qt_day_${day}`;
  const monthId = `qt_month_${month}`;
  const dayDoc = await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, dayId);
  const monthDoc = await tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, monthId);
  const nextDay = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1);
  const nextMonth = Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1);
  if ((monthDoc?.used ?? 0) >= config.monthlyLimit) return { waitMs: nextMonth - at.getTime() };
  if ((dayDoc?.used ?? 0) >= config.dailyLimit) return { waitMs: nextDay - at.getTime() };
  tx.set(COLLECTIONS.emailQuota, dayId, { id: dayId, used: (dayDoc?.used ?? 0) + 1, expiresAt: new Date(nextDay + DAY_MS).toISOString() });
  tx.set(COLLECTIONS.emailQuota, monthId, { id: monthId, used: (monthDoc?.used ?? 0) + 1, expiresAt: new Date(nextMonth + DAY_MS).toISOString() });
  return { day, month };
}

async function releaseQuota(tx: Tx, reservation: Reservation, config: NewsletterEmailConfig, exhausted?: "day" | "month") {
  const scopes = [
    { id: `qt_day_${reservation.day}`, limit: config.dailyLimit, name: "day" },
    { id: `qt_month_${reservation.month}`, limit: config.monthlyLimit, name: "month" },
  ] as const;
  const docs = await Promise.all(scopes.map((scope) => tx.get<EmailQuotaRecord>(COLLECTIONS.emailQuota, scope.id)));
  scopes.forEach((scope, index) => {
    const doc = docs[index];
    if (doc) tx.set(COLLECTIONS.emailQuota, scope.id, { ...doc, used: exhausted === scope.name ? scope.limit : Math.max(0, doc.used - 1) });
  });
}

async function prepare<T extends Attempt>(store: Store, collection: typeof COLLECTIONS.subscriptionConfirmations | typeof COLLECTIONS.newsletterDeliveries, id: string, config: NewsletterEmailConfig, now: Date, create: (tx: Tx) => Promise<T | undefined>): Promise<Prepared> {
  return store.transaction(async (tx) => {
    const current = await create(tx);
    if (!current || current.sentAt) return "done";
    if (current.reconcile) return "reconcile";
    if (current.attemptStartedAt) {
      if (!Number.isFinite(Date.parse(current.attemptStartedAt)) || now.getTime() - Date.parse(current.attemptStartedAt) >= IDEMPOTENCY_WINDOW_MS) {
        tx.set(collection, id, { ...current, reconcile: true });
        return "reconcile";
      }
      return "send";
    }
    const reservation = await reserveQuota(tx, config, now);
    if ("waitMs" in reservation) return reservation;
    tx.set(collection, id, { ...current, attemptStartedAt: now.toISOString(), reservation });
    return "send";
  });
}

async function settle<T extends Attempt>(store: Store, collection: typeof COLLECTIONS.subscriptionConfirmations | typeof COLLECTIONS.newsletterDeliveries, id: string, config: NewsletterEmailConfig, now: Date, result: EmailResult) {
  return store.transaction(async (tx) => {
    const current = await tx.get<T>(collection, id);
    if (!current || current.sentAt) return;
    if (result.ok) {
      tx.set(collection, id, { ...current, sentAt: now.toISOString(), resendId: result.id });
      return;
    }
    const { code, status } = result;
    if (status === null || status < 400 || status >= 500 || status === 408 || status === 409) return;
    if (current.reservation) await releaseQuota(tx, current.reservation, config, code === "daily_quota_exceeded" ? "day" : code === "monthly_quota_exceeded" ? "month" : undefined);
    const updated: Attempt = { ...current };
    delete updated.attemptStartedAt;
    delete updated.reservation;
    tx.set(collection, id, updated);
  });
}

async function sendAttempt<T extends Attempt>(store: Store, collection: typeof COLLECTIONS.subscriptionConfirmations | typeof COLLECTIONS.newsletterDeliveries, id: string, email: NewsletterEmail, config: NewsletterEmailConfig, now: () => Date, signal: AbortSignal, create: (tx: Tx) => Promise<T | undefined>) {
  const prepared = await prepare(store, collection, id, config, now(), create);
  if (prepared === "done") return;
  if (prepared === "reconcile") throw new PermanentFailure("reconciliation_required");
  if (typeof prepared === "object") throw new RetryLater(prepared.waitMs, { deferral: true });
  const guard = AbortSignal.any([signal, AbortSignal.timeout(SEND_TIMEOUT_MS)]);
  let result: EmailResult;
  try {
    result = await Promise.race([
      (config.mailer ?? resendMailer(config.apiKey))(email, `newsletter-${id}`, guard),
      new Promise<never>((_, reject) => guard.addEventListener("abort", () => reject(new Error("send_timeout")), { once: true })),
    ]);
  } catch (error) {
    logEvent("warn", "newsletter_send_uncertain", { error: safeErrorCode(error) });
    throw new Error("newsletter_send_uncertain");
  }
  await settle(store, collection, id, config, now(), result);
  if (result.ok) return;
  if (result.status === null || result.status < 400 || result.status >= 500 || result.status === 408 || result.status === 409) throw new Error("newsletter_send_uncertain");
  if (result.code === "daily_quota_exceeded" || result.code === "monthly_quota_exceeded") {
    const at = now();
    const reset = result.code === "daily_quota_exceeded" ? Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1) : Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1);
    throw new RetryLater(reset - at.getTime(), { deferral: true });
  }
  if (result.code === "rate_limit_exceeded") throw new RetryLater(60_000, { deferral: true });
  throw new PermanentFailure(`resend_${result.code}`.slice(0, 60));
}

export function createConfirmationHandler(store: Store, secret: string, config: NewsletterEmailConfig, now: () => Date): JobHandler {
  return async (job, { signal }) => {
    const id = job.payload.confirmationId;
    if (!id) throw new PermanentFailure("missing_confirmation");
    const basis = await store.transaction(async (tx) => {
      const record = await tx.get<SubscriptionConfirmationRecord>(COLLECTIONS.subscriptionConfirmations, id);
      const subscription = record ? await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, record.subscriptionId) : undefined;
      return { record, subscription };
    });
    if (!basis.record || !basis.subscription || basis.record.consumedAt || basis.record.expiresAt <= now().toISOString() || basis.subscription.pendingConfirmationId !== id) return;
    if (!config.allowlist.includes(basis.subscription.email)) throw new PermanentFailure("recipient_not_in_pilot_allowlist");
    await sendAttempt(store, COLLECTIONS.subscriptionConfirmations, id, confirmationEmail(config, basis.subscription.email, confirmationToken(secret, id)), config, now, signal, async (tx) => {
      const record = await tx.get<SubscriptionConfirmationRecord>(COLLECTIONS.subscriptionConfirmations, id);
      const subscription = record ? await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, record.subscriptionId) : undefined;
      return record && subscription && !record.consumedAt && record.expiresAt > now().toISOString() && subscription.pendingConfirmationId === id ? record : undefined;
    });
  };
}

export function createEditionDeliveryHandler(store: Store, secret: string, config: NewsletterEmailConfig, now: () => Date): JobHandler {
  return async (job, { signal }) => {
    const { subscriptionId, editionSlug } = job.payload;
    if (!subscriptionId || !editionSlug) throw new PermanentFailure("bad_delivery_payload");
    const basis = await store.transaction(async (tx) => {
      const subscription = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, subscriptionId);
      const published = await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, editionSlug);
      const draft = published ? await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, published.draftId) : undefined;
      const revision = published ? await tx.get<EditionRevisionRecord>(COLLECTIONS.editionRevisions, `${published.draftId}.${published.revision}`) : undefined;
      return { subscription, published, draft, revision };
    });
    if (!basis.subscription || basis.subscription.status !== "confirmed") return;
    if (!basis.subscription.confirmedAt) throw new PermanentFailure("missing_confirmation_date");
    if (!basis.published || !basis.draft || !basis.revision || basis.draft.status !== "approved" || basis.draft.approvedRevision !== basis.published.revision || basis.revision.slug !== editionSlug) throw new PermanentFailure("edition_not_approved");
    if (!config.allowlist.includes(basis.subscription.email)) throw new PermanentFailure("recipient_not_in_pilot_allowlist");
    const unsubscribe = `${config.siteOrigin}/newsletter/cancelar#token=${encodeURIComponent(cancellationToken(secret, basis.subscription.id, basis.subscription.confirmedAt))}`;
    const email = editionEmail(config, basis.subscription.email, basis.revision, unsubscribe);
    await sendAttempt(store, COLLECTIONS.newsletterDeliveries, job.id, email, config, now, signal, async (tx) => {
      const subscription = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, subscriptionId);
      const published = await tx.get<EditionPublicRecord>(COLLECTIONS.editionsPublic, editionSlug);
      const draft = published ? await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, published.draftId) : undefined;
      const revision = published ? await tx.get<EditionRevisionRecord>(COLLECTIONS.editionRevisions, `${published.draftId}.${published.revision}`) : undefined;
      const current = await tx.get<NewsletterDeliveryRecord>(COLLECTIONS.newsletterDeliveries, job.id);
      if (!subscription || subscription.status !== "confirmed" || !published || !draft || draft.status !== "approved" || draft.approvedRevision !== published.revision || !revision || revision.slug !== editionSlug) return undefined;
      return current ?? { id: job.id, subscriptionId, editionSlug };
    });
  };
}

export type ContactSync = (email: string, active: boolean, signal: AbortSignal) => Promise<void>;

function resendContactSync(config: BroadcastConfig): ContactSync {
  const client = new Resend(config.apiKey);
  return async (email, active, signal) => {
    const options = { signal };
    const found = await client.contacts.get(email, options);
    if (found.error && found.error.statusCode !== 404) throw new Error(`contact_lookup_${found.error.name}`);
    if (active) {
      if (!found.data) {
        const created = await client.contacts.create({ email, unsubscribed: false, segments: [{ id: config.segmentId }] }, options);
        if (created.error && created.error.statusCode !== 409) throw new Error(`contact_create_${created.error.name}`);
        if (!created.error) return;
      }
      const updated = await client.contacts.update({ email, unsubscribed: false }, options);
      if (updated.error) throw new Error(`contact_update_${updated.error.name}`);
      const added = await client.contacts.segments.add({ email, segmentId: config.segmentId }, options);
      if (added.error && added.error.statusCode !== 409) throw new Error(`contact_segment_add_${added.error.name}`);
    } else if (found.data) {
      const removed = await client.contacts.segments.remove({ email, segmentId: config.segmentId }, options);
      if (removed.error && removed.error.statusCode !== 404) throw new Error(`contact_segment_remove_${removed.error.name}`);
    }
  };
}

export function createContactSyncHandler(store: Store, config: BroadcastConfig, sync: ContactSync = resendContactSync(config)): JobHandler {
  return async (job, { signal }) => {
    const id = job.payload.subscriptionId;
    if (!id) throw new PermanentFailure("missing_subscription");
    const guard = AbortSignal.any([signal, AbortSignal.timeout(SEND_TIMEOUT_MS)]);
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const subscription = await store.transaction((tx) => tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, id));
        if (!subscription || !config.allowlist.includes(subscription.email)) throw new PermanentFailure("contact_not_in_pilot_allowlist");
        const active = subscription.status === "confirmed";
        await sync(subscription.email, active, guard);
        const current = await store.transaction((tx) => tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, id));
        if (current?.status === subscription.status && current.confirmedAt === subscription.confirmedAt && current.canceledAt === subscription.canceledAt) return;
      }
      throw new Error("contact_changed_during_sync");
    } catch (error) {
      if (error instanceof PermanentFailure) throw error;
      logEvent("warn", "newsletter_contact_sync_failed", { error: safeErrorCode(error) });
      throw new Error("newsletter_contact_sync_failed");
    }
  };
}
