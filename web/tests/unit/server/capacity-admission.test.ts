import { describe, expect, it } from "vitest";
import { confirmationToken } from "../../../src/lib/server/ids";
import { confirmSubscription, recordReportRequest, requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { createMemoryStore } from "../../../src/lib/server/store";
import { COLLECTIONS, type EmailQuotaRecord, type EditionPublicRecord } from "../../../src/lib/server/types";
import { NOW, SECRET } from "./helpers";

const limits = { dailyLimit: 1, monthlyLimit: 3000 };
const dayId = `qt_day_${NOW.toISOString().slice(0, 10)}`;
const entries = (store: ReturnType<typeof createMemoryStore>, collection: Parameters<ReturnType<typeof createMemoryStore>["dump"]>[0]) => Object.values(store.dump(collection));

describe("capacity admission across flows", () => {
  it("admits only one concurrent report or confirmation request for the last email unit", async () => {
    const store = createMemoryStore();
    const [report, confirmation] = await Promise.all([
      recordReportRequest(store, SECRET, { email: "report@example.com", toolId: "rosi", commercialConsent: true }, NOW, undefined, limits),
      requestSubscriptionConfirmation(store, SECRET, { email: "newsletter@example.com" }, NOW, undefined, { limits }),
    ]);
    expect([report, confirmation].filter((result) => result.ok)).toHaveLength(1);
    expect([report, confirmation].filter((result) => !result.ok)).toHaveLength(1);
    expect((store.dump(COLLECTIONS.emailQuota)[dayId] as EmailQuotaRecord).used).toBe(1);
    expect(entries(store, COLLECTIONS.jobs)).toHaveLength(1);
    expect(entries(store, COLLECTIONS.leads)).toHaveLength(report.ok ? 1 : 0);
    expect(entries(store, COLLECTIONS.leadEvents)).toHaveLength(report.ok ? 1 : 0);
    expect(entries(store, COLLECTIONS.reportDeliveries)).toHaveLength(report.ok ? 1 : 0);
    expect(entries(store, COLLECTIONS.subscriptions)).toHaveLength(confirmation.ok ? 1 : 0);
    expect(entries(store, COLLECTIONS.subscriptionConfirmations)).toHaveLength(confirmation.ok ? 1 : 0);
  });

  it("preserves the confirmation token when its edition cannot be admitted, then consumes it exactly once", async () => {
    const store = createMemoryStore();
    const edition: EditionPublicRecord = { slug: "edicao", data: "2026-10-12", pilar: "Software", titulo: "Edição", abertura: [{ t: "Abertura." }], fontes: [], draftId: "ed_1", revision: 1, publishedAt: NOW.toISOString() };
    await store.transaction(async (tx) => tx.set(COLLECTIONS.editionsPublic, edition.slug, edition));
    const requested = await requestSubscriptionConfirmation(store, SECRET, { email: "reader@example.com", editionSlug: edition.slug }, NOW, undefined, { limits });
    if (!requested.ok || requested.action !== "confirmation_requested") throw new Error("confirmation not requested");
    const token = confirmationToken(SECRET, requested.confirmationId);
    const before = store.dump(COLLECTIONS.subscriptionConfirmations)[requested.confirmationId];
    expect(await confirmSubscription(store, SECRET, token, NOW, false, { limits })).toMatchObject({ status: "capacity", reason: "email_capacity" });
    expect(store.dump(COLLECTIONS.subscriptionConfirmations)[requested.confirmationId]).toEqual(before);
    expect(entries(store, COLLECTIONS.newsletterDeliveries)).toHaveLength(0);
    const nextDay = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate() + 1, 0, 1));
    expect(await confirmSubscription(store, SECRET, token, nextDay, false, { limits })).toMatchObject({ status: "confirmed", editionSlug: edition.slug });
    expect(await confirmSubscription(store, SECRET, token, nextDay, false, { limits })).toEqual({ status: "already_used" });
    expect((store.dump(COLLECTIONS.emailQuota)[dayId] as EmailQuotaRecord).used).toBe(1);
    expect((store.dump(COLLECTIONS.emailQuota)[`qt_day_${nextDay.toISOString().slice(0, 10)}`] as EmailQuotaRecord).used).toBe(1);
    expect(entries(store, COLLECTIONS.newsletterDeliveries)).toHaveLength(1);
    expect(entries(store, COLLECTIONS.jobs)).toHaveLength(2);
  });

  it("reserves the final public marketing slot for only one of two concurrent new contacts", async () => {
    const store = createMemoryStore();
    await store.transaction(async (tx) => tx.set(COLLECTIONS.marketingBaseline, "account", { id: "account", complete: true, count: 949, reserved: 0, seq: 0, measuredAt: NOW.toISOString() }));
    const results = await Promise.all(["a@example.com", "b@example.com"].map((email) => requestSubscriptionConfirmation(store, SECRET, { email }, NOW, undefined, { marketing: true })));
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toMatchObject([{ capacity: "marketing" }]);
    expect(store.dump(COLLECTIONS.marketingBaseline).account).toMatchObject({ reserved: 1, seq: 1 });
    expect((store.dump(COLLECTIONS.emailQuota)[dayId] as EmailQuotaRecord).used).toBe(1);
    expect(entries(store, COLLECTIONS.subscriptions)).toHaveLength(1);
    expect(entries(store, COLLECTIONS.subscriptionConfirmations)).toHaveLength(1);
    expect(entries(store, COLLECTIONS.jobs)).toHaveLength(1);
  });
});
