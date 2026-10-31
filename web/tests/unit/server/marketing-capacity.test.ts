import { describe, expect, it } from "vitest";
import { parseContactsPage, refreshMarketingBaseline, scanAccount } from "../../../src/lib/server/capacity";
import { createMemoryStore } from "../../../src/lib/server/store";
import { COLLECTIONS } from "../../../src/lib/server/types";
import { requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { NOW, SECRET } from "./helpers";

const signal = new AbortController().signal;

describe("marketing account measurement", () => {
  it("rejects malformed pages and scans beyond the pilot's 100 contacts", async () => {
    expect(parseContactsPage({ data: [] })).toEqual({ ok: false, reason: "bad_page" });
    expect(parseContactsPage({ data: [{ id: "x" }], has_more: false })).toEqual({ ok: false, reason: "bad_page" });
    const result = await scanAccount(async (after) => ({ ok: true, contacts: Array.from({ length: after ? 20 : 100 }, (_, i) => ({ id: `${after ? 100 + i : i}`, email: `${after ? 100 + i : i}@example.com` })), hasMore: !after }), signal);
    expect(result.complete && result.emails).toHaveLength(120);
    expect(await scanAccount(async () => ({ ok: true, contacts: [{ id: "same", email: "a@example.com" }], hasMore: true }), signal)).toEqual({ complete: false, reason: "bad_pagination" });
  });

  it("keeps a reservation made while a scan is in flight", async () => {
    const store = createMemoryStore();
    let finish!: (result: { complete: true; emails: string[] }) => void;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => { entered = resolve; });
    const scan = refreshMarketingBaseline(store, () => { entered(); return new Promise((resolve) => { finish = resolve; }); }, () => NOW, signal, true);
    await started;
    await store.transaction(async (tx) => {
      const baseline = await tx.get<Record<string, unknown>>(COLLECTIONS.marketingBaseline, "account");
      tx.set(COLLECTIONS.marketingBaseline, "account", { ...baseline, reserved: 1, seq: 1 });
    });
    finish({ complete: true, emails: [] });
    expect(await scan).toBe("measured");
    expect(store.dump(COLLECTIONS.marketingBaseline).account).toMatchObject({ count: 0, reserved: 1, seq: 1 });
  });

  it("keeps an inherited admission unchanged when the new UTC month is full", async () => {
    const store = createMemoryStore();
    const first = new Date("2026-10-31T23:59:00.000Z");
    const next = new Date("2026-11-01T00:01:00.000Z");
    const request = await requestSubscriptionConfirmation(store, SECRET, { email: "a@example.com" }, first);
    expect(request).toMatchObject({ ok: true, action: "confirmation_requested" });
    await store.transaction(async (tx) => tx.set(COLLECTIONS.emailQuota, "qt_month_2026-11", { id: "qt_month_2026-11", used: 3000, expiresAt: "2027-01-01T00:00:00.000Z" }));
    const before = JSON.stringify([store.dump(COLLECTIONS.subscriptions), store.dump(COLLECTIONS.subscriptionConfirmations), store.dump(COLLECTIONS.jobs), store.dump(COLLECTIONS.emailQuota)]);
    expect(await requestSubscriptionConfirmation(store, SECRET, { email: "a@example.com" }, next)).toMatchObject({ ok: false, capacity: "email" });
    expect(JSON.stringify([store.dump(COLLECTIONS.subscriptions), store.dump(COLLECTIONS.subscriptionConfirmations), store.dump(COLLECTIONS.jobs), store.dump(COLLECTIONS.emailQuota)])).toBe(before);
  });

  it("does not let an older scan overwrite a newer scan or lose concurrent reservations", async () => {
    const store = createMemoryStore();
    let finish!: (result: { complete: true; emails: string[] }) => void;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => { entered = resolve; });
    const old = refreshMarketingBaseline(store, () => { entered(); return new Promise((resolve) => { finish = resolve; }); }, () => NOW, signal, true);
    await started;
    const newer = new Date(NOW.getTime() + 1000);
    expect(await refreshMarketingBaseline(store, async () => ({ complete: true, emails: ["new@example.com"] }), () => newer, signal, true)).toBe("measured");
    await store.transaction(async (tx) => {
      const baseline = await tx.get<Record<string, unknown>>(COLLECTIONS.marketingBaseline, "account");
      tx.set(COLLECTIONS.marketingBaseline, "account", { ...baseline, reserved: 1, seq: 1 });
    });
    finish({ complete: true, emails: [] });
    expect(await old).toBe("closed");
    expect(store.dump(COLLECTIONS.marketingBaseline).account).toMatchObject({ count: 1, reserved: 1, measuredAt: newer.toISOString() });
  });
});
