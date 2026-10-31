import { expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), update: vi.fn(), add: vi.fn(), remove: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { contacts = { get: sdk.get, create: sdk.create, update: sdk.update, segments: { add: sdk.add, remove: sdk.remove } }; } }));
import { createContactSyncHandler, createEditionDeliveryHandler } from "../../../src/lib/server/newsletter-email";
import { requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { opaqueId } from "../../../src/lib/server/ids";
import { COLLECTIONS, JOB_KINDS, type JobRecord } from "../../../src/lib/server/types";
import { NOW, SECRET, setup } from "./helpers";

it("keeps remote suppression, blocks a pending individual delivery and requires a new confirmation", async () => {
  const env = setup();
  const email = "leitor@example.com";
  const id = opaqueId(SECRET, "sb", `email:${email}`);
  await env.store.transaction(async (tx) => tx.set(COLLECTIONS.subscriptions, id, { id, email, status: "confirmed", confirmedAt: NOW.toISOString(), revokedAt: "2026-10-10T00:00:00.000Z", contactSyncState: "pending", contactSyncSince: NOW.toISOString(), createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() }));
  sdk.get.mockResolvedValue({ data: { id: "remote", email, unsubscribed: true }, error: null });
  const sync = { id: "sync", kind: JOB_KINDS.newsletterContactSync, payload: { subscriptionId: id }, status: "pending", attempts: 0, maxAttempts: 3, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() } as JobRecord;
  const context = { signal: new AbortController().signal };
  await createContactSyncHandler(env.store, env.deps.broadcast!)(sync, context);
  expect(sdk.get).toHaveBeenCalled();
  expect(sdk.update).not.toHaveBeenCalled();
  expect(sdk.add).not.toHaveBeenCalled();
  expect(env.store.dump(COLLECTIONS.subscriptions)[id]).toMatchObject({ contactSyncState: "blocked", contactSyncReason: "remote_unsubscribed_unknown" });
  const delivery = { id: "delivery", kind: JOB_KINDS.newsletterDelivery, payload: { subscriptionId: id, editionSlug: "edition" }, status: "pending", attempts: 0, maxAttempts: 3, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() } as JobRecord;
  await expect(createEditionDeliveryHandler(env.store, SECRET, env.newsletterEmail, () => NOW)(delivery, context)).rejects.toMatchObject({ name: "RetryLater", deferral: true });
  expect(env.newsletterMailer).not.toHaveBeenCalled();
  expect(await requestSubscriptionConfirmation(env.store, SECRET, { email }, NOW)).toMatchObject({ ok: true, action: "confirmation_requested" });
});
