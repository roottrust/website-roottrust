import { describe, expect, it, vi } from "vitest";
import { cancellationToken, confirmationToken, opaqueId, verifyCancellationToken } from "../../../src/lib/server/ids";
import { handleNewsletterCancellation } from "../../../src/lib/server/http";
import { purgeExpired } from "../../../src/lib/server/jobs";
import { createContactSyncHandler } from "../../../src/lib/server/newsletter-email";
import { cancelSubscription, confirmSubscription, requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { handleResendWebhook } from "../../../src/lib/server/resend-webhook";
import { COLLECTIONS, JOB_KINDS, type JobRecord, type SubscriptionRecord } from "../../../src/lib/server/types";
import { NOW, ORIGIN, SECRET, setup } from "./helpers";

const EMAIL = "leitor@example.com";
const SUB_ID = opaqueId(SECRET, "sb", `email:${EMAIL}`);
const later = (ms: number) => new Date(NOW.getTime() + ms);
const request = (token: string) => new Request(`${ORIGIN}/api/newsletter/cancelar`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" }, body: JSON.stringify({ token }) });

async function subscribe(env: ReturnType<typeof setup>, now = NOW) {
  const result = await requestSubscriptionConfirmation(env.store, SECRET, { email: EMAIL }, now);
  if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
  await confirmSubscription(env.store, SECRET, confirmationToken(SECRET, result.confirmationId), now, true);
  return cancellationToken(SECRET, SUB_ID, now.toISOString());
}

describe("newsletter cancellation", () => {
  it("requires a signed link and an explicit POST, preserves independent commercial consent", async () => {
    const env = setup();
    const token = await subscribe(env);
    await env.store.transaction(async (tx) => tx.set(COLLECTIONS.leads, "unrelated", { commercialConsent: true }));
    expect(verifyCancellationToken(SECRET, token)).toEqual({ id: SUB_ID, confirmedAt: NOW.toISOString() });
    expect(verifyCancellationToken(SECRET, `${token}x`)).toBeUndefined();
    expect((await handleNewsletterCancellation(request(`${token}x`), env.deps)).status).toBe(400);
    expect((await handleNewsletterCancellation(request(token), env.deps)).status).toBe(200);
    expect((await handleNewsletterCancellation(request(token), env.deps)).status).toBe(200);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).status).toBe("cancelled");
    expect(Object.values(env.store.dump(COLLECTIONS.jobs)).some((job) => (job as JobRecord).kind === JOB_KINDS.newsletterContactSync)).toBe(true);
    expect(env.store.dump(COLLECTIONS.leads)["unrelated"]).toMatchObject({ commercialConsent: true });
  });

  it("does not let an old cancellation token revoke a fresh confirmation", async () => {
    const env = setup();
    const old = await subscribe(env);
    expect(await cancelSubscription(env.store, SECRET, verifyCancellationToken(SECRET, old)!, later(1000), true)).toBe("cancelled");
    await subscribe(env, later(2000));
    expect((await handleNewsletterCancellation(request(old), env.deps)).status).toBe(409);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).status).toBe("confirmed");
  });

  it("removes a cancelled subscription after six calendar months", async () => {
    const env = setup();
    const token = await subscribe(env);
    await cancelSubscription(env.store, SECRET, verifyCancellationToken(SECRET, token)!, later(1000));
    expect(await purgeExpired(env.store, new Date("2027-04-13T12:00:02.000Z"), 25)).toBeGreaterThan(0);
    expect(env.store.dump(COLLECTIONS.subscriptions)[SUB_ID]).toBeUndefined();
  });

  it("sync job removes canceled contacts and stale jobs read current state", async () => {
    const env = setup();
    const token = await subscribe(env);
    const calls: boolean[] = [];
    const sync = vi.fn(async (_email: string, active: boolean) => { calls.push(active); });
    const handler = createContactSyncHandler(env.store, env.deps.broadcast!, sync);
    const queued = Object.values(env.store.dump(COLLECTIONS.jobs)).find((entry) => (entry as JobRecord).kind === JOB_KINDS.newsletterContactSync) as JobRecord;
    await handler(queued, { signal: new AbortController().signal });
    await cancelSubscription(env.store, SECRET, verifyCancellationToken(SECRET, token)!, later(1000), true);
    await handler(queued, { signal: new AbortController().signal });
    expect(calls).toEqual([true, false]);
  });

  it("corrects a remote add when cancellation happens during the sync call", async () => {
    const env = setup();
    const token = await subscribe(env);
    const calls: boolean[] = [];
    const handler = createContactSyncHandler(env.store, env.deps.broadcast!, async (_email, active) => {
      calls.push(active);
      if (active) await cancelSubscription(env.store, SECRET, verifyCancellationToken(SECRET, token)!, later(1000), true);
    });
    const queued = Object.values(env.store.dump(COLLECTIONS.jobs)).find((entry) => (entry as JobRecord).kind === JOB_KINDS.newsletterContactSync) as JobRecord;
    await handler(queued, { signal: new AbortController().signal });
    expect(calls).toEqual([true, false]);
  });

  it("verified unsubscribe is idempotent and an older event cannot cancel a reconfirmation", async () => {
    const env = setup();
    await subscribe(env);
    let eventAt = later(1000).toISOString();
    const config = {
      apiKey: "re_test_key", webhookSecret: "whsec_test", idSecret: SECRET,
      newsletterFrom: env.newsletterEmail.from, allowlist: env.newsletterEmail.allowlist,
      store: env.store, now: () => later(2000),
      verify: vi.fn(() => ({ type: "contact.updated" as const, created_at: eventAt, data: { email: EMAIL, unsubscribed: true } } as never)),
    };
    const incoming = (id: string) => new Request(`${ORIGIN}/api/internal/resend/webhook`, { method: "POST", headers: { "content-type": "application/json", "svix-id": id, "svix-timestamp": "1", "svix-signature": "v1,test" }, body: "{}" });
    expect((await handleResendWebhook(incoming("evt1"), config)).status).toBe(204);
    expect((await handleResendWebhook(incoming("evt1"), config)).status).toBe(204);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).status).toBe("cancelled");
    await subscribe(env, later(3000));
    eventAt = later(1000).toISOString();
    expect((await handleResendWebhook(incoming("evt2"), config)).status).toBe(204);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).status).toBe("confirmed");
    expect((await handleResendWebhook(new Request(`${ORIGIN}/api/internal/resend/webhook`, { method: "POST", body: "{}" }), config)).status).toBe(400);
  });

  it("matches a tagged delivery webhook before the provider ID has been stored", async () => {
    const env = setup();
    await subscribe(env);
    const deliveryId = opaqueId(SECRET, "jb", "delivery-test");
    await env.store.transaction(async (tx) => tx.set(COLLECTIONS.newsletterDeliveries, deliveryId, {
      id: deliveryId, subscriptionId: SUB_ID, editionSlug: "teste",
      attemptStartedAt: NOW.toISOString(),
    }));
    const config = {
      apiKey: "re_test_key", webhookSecret: "whsec_test", idSecret: SECRET,
      newsletterFrom: env.newsletterEmail.from, allowlist: env.newsletterEmail.allowlist,
      store: env.store, now: () => later(1000),
      verify: () => ({ type: "email.delivered", created_at: later(1000).toISOString(), data: {
        email_id: "provider-early", from: env.newsletterEmail.from, to: [EMAIL], tags: { rt_delivery_id: deliveryId },
      } } as never),
    };
    const incoming = new Request(`${ORIGIN}/api/internal/resend/webhook`, { method: "POST", headers: { "content-type": "application/json", "svix-id": "early", "svix-timestamp": "1", "svix-signature": "v1,test" }, body: "{}" });
    expect((await handleResendWebhook(incoming, config)).status).toBe(204);
    expect(env.store.dump(COLLECTIONS.newsletterDeliveries)[deliveryId]).toMatchObject({ resendId: "provider-early", deliveryState: "delivered", sentAt: later(1000).toISOString() });
  });
});
