import { Resend, type WebhookEventPayload } from "resend";
import { opaqueId } from "./ids";
import { enqueueJob } from "./jobs";
import { logEvent, safeErrorCode } from "./safe";
import type { Store } from "./store";
import { COLLECTIONS, JOB_KINDS, type NewsletterDeliveryRecord, type SubscriptionConfirmationRecord, type SubscriptionRecord } from "./types";
import { checkEmail } from "./validation";

const MAX_WEBHOOK_BYTES = 64 * 1024;
const REPLAY_MS = 24 * 60 * 60_000;

export interface ResendWebhookConfig {
  apiKey: string;
  webhookSecret: string;
  idSecret: string;
  newsletterFrom: string;
  allowlist: readonly string[];
  store: Store;
  now(): Date;
  verify?: (payload: string, headers: { id: string; timestamp: string; signature: string }, secret: string) => WebhookEventPayload;
}

async function rawBody(request: Request): Promise<string | undefined> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_WEBHOOK_BYTES || !request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_WEBHOOK_BYTES) { await reader.cancel(); return undefined; }
    chunks.push(value);
  }
  try { return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)); }
  catch { return undefined; }
}

const eventState = (type: string): "delivered" | "failed" | undefined =>
  type === "email.delivered" ? "delivered" : ["email.failed", "email.bounced", "email.complained", "email.suppressed"].includes(type) ? "failed" : undefined;

export async function handleResendWebhook(request: Request, config: ResendWebhookConfig): Promise<Response> {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature || id.length > 200 || signature.length > 500 || !request.headers.get("content-type")?.startsWith("application/json")) return new Response(null, { status: 400 });
  const payload = await rawBody(request);
  if (payload === undefined) return new Response(null, { status: 400 });
  let event: WebhookEventPayload;
  try {
    event = (config.verify ?? ((body, headers, secret) => new Resend(config.apiKey).webhooks.verify({ payload: body, headers, webhookSecret: secret })))(payload, { id, timestamp, signature }, config.webhookSecret);
  } catch { return new Response(null, { status: 400 }); }

  const occurredAt = new Date(event.created_at);
  if (!Number.isFinite(occurredAt.getTime())) return new Response(null, { status: 400 });
  const state = eventState(event.type);
  const contactUnsubscribed = event.type === "contact.updated" && event.data.unsubscribed === true;
  if (!state && !contactUnsubscribed) return new Response(null, { status: 204 });
  const suppress = ["email.bounced", "email.complained", "email.suppressed"].includes(event.type);
  const senderAddress = (value: string) => checkEmail(/<([^<>]+)>\s*$/.exec(value)?.[1] ?? value);
  const email = event.type === "contact.updated" && event.data.unsubscribed ? checkEmail(event.data.email)
    : state && "to" in event.data && "from" in event.data && senderAddress(event.data.from) === senderAddress(config.newsletterFrom) && event.data.to.length === 1 ? checkEmail(event.data.to[0]) : undefined;
  const allowed = email && config.allowlist.includes(email);
  const emailId = state && "email_id" in event.data ? event.data.email_id : undefined;
  const taggedId = state && "tags" in event.data ? event.data.tags?.rt_delivery_id : undefined;
  const taggedConfirmation = taggedId && /^cf_[0-9a-f]{32}$/.test(taggedId) ? taggedId : undefined;
  const taggedDelivery = taggedId && /^jb_[A-Za-z0-9_-]{32}$/.test(taggedId) ? taggedId : undefined;
  const [confirmationIds, deliveryIds] = emailId ? await Promise.all([
    config.store.queryEquals(COLLECTIONS.subscriptionConfirmations, "resendId", emailId, 2),
    config.store.queryEquals(COLLECTIONS.newsletterDeliveries, "resendId", emailId, 2),
  ]) : [[], []];
  const replayId = opaqueId(config.idSecret, "wh", id);
  try {
    await config.store.transaction(async (tx) => {
      if (await tx.get(COLLECTIONS.replays, replayId)) return;
      const confirmations = await Promise.all([...new Set([...confirmationIds, ...(taggedConfirmation ? [taggedConfirmation] : [])])].map((item) => tx.get<SubscriptionConfirmationRecord>(COLLECTIONS.subscriptionConfirmations, item)));
      const deliveries = await Promise.all([...new Set([...deliveryIds, ...(taggedDelivery ? [taggedDelivery] : [])])].map((item) => tx.get<NewsletterDeliveryRecord>(COLLECTIONS.newsletterDeliveries, item)));
      const subscriptionId = allowed ? opaqueId(config.idSecret, "sb", `email:${email}`) : undefined;
      const subscription = subscriptionId ? await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, subscriptionId) : undefined;
      const at = occurredAt.toISOString();
      const shouldCancel = Boolean(allowed && (contactUnsubscribed || suppress) && subscription?.status === "confirmed" && subscription.confirmedAt && subscription.confirmedAt <= at);
      if (shouldCancel && subscription) {
        const updated: SubscriptionRecord = { ...subscription, status: "cancelled", canceledAt: at, updatedAt: at };
        delete updated.pendingConfirmationId;
        tx.set(COLLECTIONS.subscriptions, subscription.id, updated);
        await enqueueJob(tx, config.idSecret, { kind: JOB_KINDS.newsletterContactSync, key: `${subscription.id}:${at}`, payload: { subscriptionId: subscription.id } }, config.now());
      }
      if (state) {
        for (const record of confirmations) if (record && allowed && (!record.resendId || record.resendId === emailId) && (record.resendId === emailId || record.id === taggedConfirmation) && record.attemptStartedAt && Date.parse(at) + 1000 >= Date.parse(record.attemptStartedAt) && (!record.deliveryStateAt || record.deliveryStateAt <= at)) {
          const subscriber = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, record.subscriptionId);
          if (subscriber?.email !== email) continue;
          tx.set(COLLECTIONS.subscriptionConfirmations, record.id, { ...record, resendId: emailId, deliveryState: state, deliveryStateAt: at, ...(state === "delivered" ? { sentAt: record.sentAt ?? at } : { reconcile: true }) });
        }
        for (const record of deliveries) if (record && allowed && (!record.resendId || record.resendId === emailId) && (record.resendId === emailId || record.id === taggedDelivery) && record.attemptStartedAt && Date.parse(at) + 1000 >= Date.parse(record.attemptStartedAt) && (!record.deliveryStateAt || record.deliveryStateAt <= at)) {
          const subscriber = await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, record.subscriptionId);
          if (subscriber?.email !== email) continue;
          tx.set(COLLECTIONS.newsletterDeliveries, record.id, { ...record, resendId: emailId, deliveryState: state, deliveryStateAt: at, ...(state === "delivered" ? { sentAt: record.sentAt ?? at } : { reconcile: true }) });
        }
      }
      tx.set(COLLECTIONS.replays, replayId, { id: replayId, expiresAt: new Date(config.now().getTime() + REPLAY_MS).toISOString() });
    });
  } catch (error) {
    logEvent("error", "resend_webhook_failed", { error: safeErrorCode(error) });
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 204 });
}
