import { describe, expect, it } from "vitest";
import { confirmationToken, newConfirmationId, opaqueId, verifyConfirmationToken } from "../../../src/lib/server/ids";
import { gateOf, subscriptionLimitSpecs, DEFAULT_LIMITS } from "../../../src/lib/server/limits";
import { claimJobs, enqueueJob, failJob, purgeExpired } from "../../../src/lib/server/jobs";
import { CONFIRMATION_TTL_MS, confirmSubscription, requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { createFirestoreStore, createMemoryStore, type Store } from "../../../src/lib/server/store";
import { COLLECTIONS, JOB_KINDS, type EditionPublicRecord, type JobRecord, type SubscriptionConfirmationRecord, type SubscriptionRecord } from "../../../src/lib/server/types";
import { parseConfirmation } from "../../../src/lib/server/validation";
import { createFakeFirestore, NOW, SECRET } from "./helpers";

const EMAIL = "leitor@example.com";
const SUB_ID = opaqueId(SECRET, "sb", `email:${EMAIL}`);
const later = (ms: number) => new Date(NOW.getTime() + ms);

async function publish(store: Store, slug: string, data: string) {
  const edition: EditionPublicRecord = { slug, data, pilar: "Cibersegurança", titulo: `Edição ${slug}`, abertura: [{ t: "Abertura editorial de teste, inteira." }], fontes: [], draftId: `ed_${slug}`, revision: 1, publishedAt: NOW.toISOString() };
  await store.transaction(async (tx) => tx.set(COLLECTIONS.editionsPublic, slug, edition));
}

async function jobs(store: Store, kind: string): Promise<JobRecord[]> {
  const ids = await store.queryEquals(COLLECTIONS.jobs, "kind", kind, 50);
  return store.transaction(async (tx) => Promise.all(ids.map(async (id) => (await tx.get<JobRecord>(COLLECTIONS.jobs, id)) as JobRecord)));
}
const subscription = (store: Store) => store.transaction((tx) => tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, SUB_ID)).then((record) => record as SubscriptionRecord);
const confirmationOf = (store: Store, id: string) => store.transaction((tx) => tx.get<SubscriptionConfirmationRecord>(COLLECTIONS.subscriptionConfirmations, id));

async function request(store: Store, value: { email?: string; editionSlug?: string } = {}, now = NOW) {
  const result = await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL, ...value }, now);
  if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected a confirmation request");
  return { id: result.confirmationId, token: confirmationToken(SECRET, result.confirmationId) };
}

describe("confirmation token", () => {
  it("is opaque, authentic only for the secret, and never stored", async () => {
    const store = createMemoryStore();
    const { id, token } = await request(store);
    expect(verifyConfirmationToken(SECRET, token)).toBe(id);
    expect(verifyConfirmationToken("x".repeat(32), token)).toBeUndefined();
    expect(verifyConfirmationToken(SECRET, `${id}.${"A".repeat(43)}`)).toBeUndefined();
    for (const bad of [undefined, 42, "", id, `${token}x`, token.toUpperCase(), `${newConfirmationId()}.${token.split(".")[1]}`]) {
      expect(verifyConfirmationToken(SECRET, bad)).toBeUndefined();
    }
    const mac = token.split(".")[1];
    for (const collection of [COLLECTIONS.subscriptions, COLLECTIONS.subscriptionConfirmations, COLLECTIONS.jobs]) {
      expect(JSON.stringify(store.dump(collection))).not.toContain(mac);
    }
    expect(newConfirmationId()).not.toBe(newConfirmationId());
  });

  it("parseConfirmation accepts only a well-formed token and no other keys", () => {
    const token = confirmationToken(SECRET, newConfirmationId());
    expect(parseConfirmation({ token })).toEqual({ ok: true, value: { token } });
    expect(parseConfirmation({ token: "abc" })).toEqual({ ok: false, fields: ["token"] });
    expect(parseConfirmation({ token, email: EMAIL })).toEqual({ ok: false, fields: ["email"] });
    expect(parseConfirmation([token])).toEqual({ ok: false, fields: ["body"] });
  });
});

describe("request", () => {
  it("stores a 24 h confirmation and enqueues its e-mail job with opaque references only", async () => {
    const store = createMemoryStore();
    const { id } = await request(store, { editionSlug: "backup" });
    const record = await confirmationOf(store, id);
    expect(record).toMatchObject({ id, subscriptionId: SUB_ID, editionSlug: "backup", createdAt: NOW.toISOString(), expiresAt: later(CONFIRMATION_TTL_MS).toISOString() });
    expect(await subscription(store)).toMatchObject({ email: EMAIL, status: "pending", pendingConfirmationId: id });
    const [job] = await jobs(store, JOB_KINDS.newsletterConfirmation);
    expect(job.payload).toEqual({ confirmationId: id });
    expect(job.priorityDueAt).toBe(NOW.toISOString());
    expect(JSON.stringify(store.dump(COLLECTIONS.jobs))).not.toContain(EMAIL);
    expect(JSON.stringify(store.dump(COLLECTIONS.subscriptionConfirmations))).not.toContain(EMAIL);
  });

  it("keeps confirmation ahead of reports after quota deferral", async () => {
    const store = createMemoryStore();
    await store.transaction((tx) => enqueueJob(tx, SECRET, { kind: JOB_KINDS.reportEmail, key: "report", payload: {} }, later(-60_000)));
    await request(store);
    const kinds = [JOB_KINDS.reportEmail, JOB_KINDS.newsletterConfirmation];
    const [first] = await claimJobs(store, { kinds, now: NOW, limit: 1, leaseMs: 60_000 });
    expect(first.kind).toBe(JOB_KINDS.newsletterConfirmation);
    await failJob(store, first, "quota", NOW, { retryAfterMs: 60_000, deferral: true });
    const [again] = await claimJobs(store, { kinds, now: later(60_000), limit: 1, leaseMs: 60_000 });
    expect(again.id).toBe(first.id);
  });

  it("a newer request supersedes the older token", async () => {
    const store = createMemoryStore();
    const first = await request(store);
    const second = await request(store, {}, later(60_000));
    expect(await confirmSubscription(store, SECRET, first.token, later(120_000))).toEqual({ status: "superseded" });
    expect((await subscription(store)).status).toBe("pending");
    expect(await confirmSubscription(store, SECRET, second.token, later(120_000))).toMatchObject({ status: "confirmed" });
  });

  it("a denied gate writes nothing", async () => {
    const store = createMemoryStore();
    const limits = { ...DEFAULT_LIMITS, subscriptionEditionDaily: 1 };
    const gate = () => gateOf(SECRET, subscriptionLimitSpecs({ email: EMAIL }, limits), NOW);
    expect((await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL }, NOW, gate())).ok).toBe(true);
    const denied = await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL }, NOW, gate());
    expect(denied.ok).toBe(false);
    expect(Object.keys(store.dump(COLLECTIONS.subscriptionConfirmations))).toHaveLength(1);
    expect(await jobs(store, JOB_KINDS.newsletterConfirmation)).toHaveLength(1);
  });
});

describe("confirmation: edition choice", () => {
  it("general request resolves the latest public edition at confirmation time", async () => {
    const store = createMemoryStore();
    await publish(store, "antiga", "2026-09-01");
    const { token } = await request(store);
    await publish(store, "recente", "2026-10-01");
    expect(await confirmSubscription(store, SECRET, token, later(1000))).toEqual({ status: "confirmed", editionSlug: "recente" });
    const [delivery] = await jobs(store, JOB_KINDS.newsletterDelivery);
    expect(delivery.payload).toEqual({ subscriptionId: SUB_ID, editionSlug: "recente" });
    expect(await subscription(store)).toMatchObject({ status: "confirmed", confirmedAt: later(1000).toISOString() });
    expect((await subscription(store)).pendingConfirmationId).toBeUndefined();
  });

  it("preview request keeps the chosen slug even when a newer edition exists", async () => {
    const store = createMemoryStore();
    await publish(store, "antiga", "2026-09-01");
    await publish(store, "recente", "2026-10-01");
    const { token } = await request(store, { editionSlug: "antiga" });
    expect(await confirmSubscription(store, SECRET, token, later(1000))).toEqual({ status: "confirmed", editionSlug: "antiga" });
    expect((await jobs(store, JOB_KINDS.newsletterDelivery)).map((job) => job.payload.editionSlug)).toEqual(["antiga"]);
  });

  it("confirms without a delivery when the chosen edition is not public or none exists", async () => {
    const store = createMemoryStore();
    const missing = await request(store, { editionSlug: "inexistente" });
    expect(await confirmSubscription(store, SECRET, missing.token, later(1000))).toEqual({ status: "confirmed", selectedEditionUnavailable: true });
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(0);
    expect((await subscription(store)).status).toBe("confirmed");
  });

  it("never carries editorial body or tool answers in stored records", async () => {
    const store = createMemoryStore();
    await publish(store, "recente", "2026-10-01");
    const { token } = await request(store);
    await confirmSubscription(store, SECRET, token, later(1000));
    for (const collection of [COLLECTIONS.subscriptions, COLLECTIONS.subscriptionConfirmations, COLLECTIONS.jobs]) {
      expect(JSON.stringify(store.dump(collection))).not.toMatch(/corpo|answers|abertura/);
    }
  });
});

describe("confirmation: expiry", () => {
  it("purges an expired token and its unconfirmed address, but keeps a newer request", async () => {
    const store = createMemoryStore();
    const first = await request(store);
    const second = await request(store, {}, later(1000));
    expect(await purgeExpired(store, later(CONFIRMATION_TTL_MS), 10)).toBe(1);
    expect(await confirmationOf(store, first.id)).toBeUndefined();
    expect((await subscription(store)).pendingConfirmationId).toBe(second.id);
    expect(await purgeExpired(store, later(CONFIRMATION_TTL_MS + 1000), 10)).toBe(1);
    expect(await store.transaction((tx) => tx.get(COLLECTIONS.subscriptions, SUB_ID))).toBeUndefined();
  });
  it("expires exactly at 24 h without consuming or changing the subscription", async () => {
    const store = createMemoryStore();
    const { id, token } = await request(store);
    expect(await confirmSubscription(store, SECRET, token, later(CONFIRMATION_TTL_MS))).toEqual({ status: "expired" });
    expect((await subscription(store)).status).toBe("pending");
    expect((await confirmationOf(store, id))?.consumedAt).toBeUndefined();
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(0);
    // After the expired attempt a fresh request issues a working token.
    const fresh = await request(store, {}, later(CONFIRMATION_TTL_MS));
    expect(await confirmSubscription(store, SECRET, fresh.token, later(CONFIRMATION_TTL_MS + 1000))).toMatchObject({ status: "confirmed" });
  });

  it("is still valid one millisecond before 24 h", async () => {
    const store = createMemoryStore();
    const { token } = await request(store);
    expect(await confirmSubscription(store, SECRET, token, later(CONFIRMATION_TTL_MS - 1))).toMatchObject({ status: "confirmed" });
  });

  it("unknown or forged tokens read nothing and change nothing", async () => {
    const store = createMemoryStore();
    expect(await confirmSubscription(store, SECRET, confirmationToken(SECRET, newConfirmationId()), NOW)).toEqual({ status: "invalid" });
    expect(await confirmSubscription(store, SECRET, "lixo", NOW)).toEqual({ status: "invalid" });
    expect(store.dump(COLLECTIONS.subscriptions)).toEqual({});
  });
});

describe("confirmation: replay and concurrency", () => {
  it("a replay is recognized and changes nothing", async () => {
    const store = createMemoryStore();
    await publish(store, "recente", "2026-10-01");
    const { token } = await request(store);
    expect(await confirmSubscription(store, SECRET, token, later(1000))).toMatchObject({ status: "confirmed" });
    const before = JSON.stringify([store.dump(COLLECTIONS.subscriptions), store.dump(COLLECTIONS.jobs), store.dump(COLLECTIONS.subscriptionConfirmations)]);
    expect(await confirmSubscription(store, SECRET, token, later(5000))).toEqual({ status: "already_used" });
    expect(JSON.stringify([store.dump(COLLECTIONS.subscriptions), store.dump(COLLECTIONS.jobs), store.dump(COLLECTIONS.subscriptionConfirmations)])).toBe(before);
  });

  it.each([
    ["memory store", () => createMemoryStore()],
    ["firestore adapter", () => createFirestoreStore(createFakeFirestore() as never)],
  ])("exactly one of N concurrent confirmations wins (%s)", async (_name, makeStore) => {
    const store = makeStore();
    await publish(store, "recente", "2026-10-01");
    const { token } = await request(store);
    const results = await Promise.all(Array.from({ length: 12 }, () => confirmSubscription(store, SECRET, token, later(1000))));
    expect(results.filter((result) => result.status === "confirmed")).toHaveLength(1);
    expect(results.filter((result) => result.status === "already_used")).toHaveLength(11);
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(1);
  });
});

describe("active and cancelled subscribers", () => {
  async function confirmed(store: Store) {
    await publish(store, "recente", "2026-10-01");
    const { token } = await request(store);
    await confirmSubscription(store, SECRET, token, later(1000));
  }

  it("active subscriber gets a direct delivery, no new confirmation, within the existing limits", async () => {
    const store = createMemoryStore();
    await confirmed(store);
    const limits = { ...DEFAULT_LIMITS, subscriptionEditionDaily: 1 };
    const at = later(60 * 60_000);
    const gate = () => gateOf(SECRET, subscriptionLimitSpecs({ email: EMAIL, editionSlug: "recente" }, limits), at);
    const confirmationsBefore = Object.keys(store.dump(COLLECTIONS.subscriptionConfirmations)).length;
    // The confirmation already queued today's delivery of "recente"; the job key dedupes the direct request.
    expect(await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL, editionSlug: "recente" }, at, gate())).toEqual({ ok: true, action: "delivery_queued", editionSlug: "recente" });
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(1);
    expect(await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL, editionSlug: "recente" }, at, gate())).toMatchObject({ ok: false });
    expect(Object.keys(store.dump(COLLECTIONS.subscriptionConfirmations))).toHaveLength(confirmationsBefore);
    expect(await jobs(store, JOB_KINDS.newsletterConfirmation)).toHaveLength(1);
    expect((await subscription(store)).status).toBe("confirmed");
  });

  it("does not claim a fresh delivery when the same-day job is already dead", async () => {
    const store = createMemoryStore();
    await confirmed(store);
    const [job] = await jobs(store, JOB_KINDS.newsletterDelivery);
    await store.transaction(async (tx) => tx.set(COLLECTIONS.jobs, job.id, { ...job, status: "dead", lastError: "reconciliation_required" }));
    expect(await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL, editionSlug: "recente" }, later(60_000))).toEqual({ ok: true, action: "none" });
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(1);
  });

  it("active general request delivers the latest edition; unknown slug queues nothing", async () => {
    const store = createMemoryStore();
    await confirmed(store);
    await publish(store, "nova", "2026-10-10");
    const next = later(24 * 60 * 60_000);
    expect(await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL }, next)).toEqual({ ok: true, action: "delivery_queued", editionSlug: "nova" });
    expect(await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL, editionSlug: "nao-existe" }, next)).toEqual({ ok: true, action: "none" });
    expect((await jobs(store, JOB_KINDS.newsletterDelivery)).map((job) => job.payload.editionSlug).sort()).toEqual(["nova", "recente"]);
  });

  it("cancelled address stays cancelled on request and only a new confirmation reactivates it", async () => {
    const store = createMemoryStore();
    await confirmed(store);
    await store.transaction(async (tx) => {
      const current = (await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, SUB_ID)) as SubscriptionRecord;
      tx.set(COLLECTIONS.subscriptions, SUB_ID, { ...current, status: "cancelled" });
    });
    const deliveries = (await jobs(store, JOB_KINDS.newsletterDelivery)).length;
    const result = await request(store, {}, later(48 * 60 * 60_000));
    expect((await subscription(store)).status).toBe("cancelled");
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(deliveries);
    expect(await confirmSubscription(store, SECRET, result.token, later(48 * 60 * 60_000 + 1000))).toMatchObject({ status: "confirmed" });
    expect((await subscription(store)).status).toBe("confirmed");
  });

  it("a token issued before a cancellation cannot reactivate the address", async () => {
    const store = createMemoryStore();
    const stale = await request(store);
    await store.transaction(async (tx) => {
      const current = (await tx.get<SubscriptionRecord>(COLLECTIONS.subscriptions, SUB_ID)) as SubscriptionRecord;
      const cancelled: SubscriptionRecord = { ...current, status: "cancelled" };
      delete cancelled.pendingConfirmationId;
      tx.set(COLLECTIONS.subscriptions, SUB_ID, cancelled);
    });
    expect(await confirmSubscription(store, SECRET, stale.token, later(1000))).toEqual({ status: "invalid" });
    expect((await subscription(store)).status).toBe("cancelled");
    expect(await jobs(store, JOB_KINDS.newsletterDelivery)).toHaveLength(0);
  });
});
