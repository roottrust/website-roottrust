import { describe, expect, it, vi } from "vitest";
import { confirmationToken, opaqueId } from "../../../src/lib/server/ids";
import { createConfirmationHandler, createEditionDeliveryHandler, loadNewsletterEmailConfig, resolveNewsletterAvailability } from "../../../src/lib/server/newsletter-email";
import { confirmSubscription, requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { COLLECTIONS, JOB_KINDS, type EditionDraftRecord, type EditionRevisionRecord, type JobRecord } from "../../../src/lib/server/types";
import { NOW, SECRET, setup } from "./helpers";

const EMAIL = "leitor@example.com";
const SLUG = "edicao-teste";
const DRAFT = "ed_00000000-0000-4000-8000-000000000001";
const PRIVATE = "Segundo parágrafo privado da edição.";

async function seedEdition(store: ReturnType<typeof setup>["store"]) {
  const revision: EditionRevisionRecord = {
    id: `${DRAFT}.1`, draftId: DRAFT, revision: 1, slug: SLUG, data: "2026-10-13", pilar: "Software",
    titulo: "Edição teste", corpo: `Abertura pública.\n\n${PRIVATE}`, abertura: [{ t: "Abertura pública." }],
    fontes: [], createdAt: NOW.toISOString(),
  };
  const draft: EditionDraftRecord = { id: DRAFT, slug: SLUG, currentRevision: 1, approvedRevision: 1, status: "approved", createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() };
  await store.transaction(async (tx) => {
    tx.set(COLLECTIONS.editionsPublic, SLUG, { slug: SLUG, data: revision.data, pilar: revision.pilar, titulo: revision.titulo, abertura: revision.abertura, fontes: [], draftId: DRAFT, revision: 1, publishedAt: NOW.toISOString() });
    tx.set(COLLECTIONS.editionDrafts, DRAFT, draft);
    tx.set(COLLECTIONS.editionRevisions, revision.id, revision);
  });
}

function job(store: ReturnType<typeof setup>["store"], kind: string): JobRecord {
  const match = Object.values(store.dump(COLLECTIONS.jobs)).find((item) => (item as JobRecord).kind === kind);
  if (!match) throw new Error(`missing ${kind} job`);
  return match as JobRecord;
}

const context = { signal: new AbortController().signal };

describe("newsletter transactional delivery", () => {
  it("fails closed when provider or pilot configuration is incomplete", () => {
    expect(loadNewsletterEmailConfig({})).toBeUndefined();
    expect(resolveNewsletterAvailability({ BACKEND_MODE: "pilot" })).toEqual({ mode: "unavailable" });
    expect(resolveNewsletterAvailability({ FORM_MODE: "demo", BACKEND_MODE: "pilot" })).toEqual({ mode: "demo" });
  });

  it("sends a confirmation, consumes only explicit POST token, and sends the chosen full edition once", async () => {
    const { store, newsletterEmail, newsletterMailer } = setup();
    await seedEdition(store);
    const result = await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL, editionSlug: SLUG }, NOW);
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    const confirm = createConfirmationHandler(store, SECRET, newsletterEmail, () => NOW);
    await confirm(job(store, JOB_KINDS.newsletterConfirmation), context);
    await confirm(job(store, JOB_KINDS.newsletterConfirmation), context);
    expect(newsletterMailer).toHaveBeenCalledTimes(1);
    expect(newsletterMailer.mock.calls[0][0].html).toContain("#token=");
    expect(await confirmSubscription(store, SECRET, confirmationToken(SECRET, result.confirmationId), NOW)).toEqual({ status: "confirmed", editionSlug: SLUG });
    const delivery = job(store, JOB_KINDS.newsletterDelivery);
    const send = createEditionDeliveryHandler(store, SECRET, newsletterEmail, () => NOW);
    await send(delivery, context);
    await send(delivery, context);
    expect(newsletterMailer).toHaveBeenCalledTimes(2);
    expect(newsletterMailer.mock.calls[1][0].html).toContain(PRIVATE);
    expect(JSON.stringify(store.dump(COLLECTIONS.newsletterDeliveries))).not.toContain(PRIVATE);
    expect(JSON.stringify(store.dump(COLLECTIONS.jobs))).not.toContain(PRIVATE);
  });

  it("does not send a queued edition after cancellation or withdrawn approval", async () => {
    const { store, newsletterEmail, newsletterMailer } = setup();
    await seedEdition(store);
    const id = opaqueId(SECRET, "sb", `email:${EMAIL}`);
    await store.transaction(async (tx) => tx.set(COLLECTIONS.subscriptions, id, { id, email: EMAIL, status: "confirmed", confirmedAt: NOW.toISOString(), createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() }));
    const queued: JobRecord = { id: "job_test", kind: JOB_KINDS.newsletterDelivery, payload: { subscriptionId: id, editionSlug: SLUG }, status: "pending", attempts: 0, maxAttempts: 3, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() };
    const send = createEditionDeliveryHandler(store, SECRET, newsletterEmail, () => NOW);
    await store.transaction(async (tx) => tx.set(COLLECTIONS.subscriptions, id, { id, email: EMAIL, status: "cancelled", createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() }));
    await send(queued, context);
    expect(newsletterMailer).not.toHaveBeenCalled();
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.subscriptions, id, { id, email: EMAIL, status: "confirmed", confirmedAt: NOW.toISOString(), createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() });
      tx.set(COLLECTIONS.editionDrafts, DRAFT, { id: DRAFT, slug: SLUG, currentRevision: 1, status: "rejected", createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() });
    });
    await expect(send(queued, context)).rejects.toThrow("edition_not_approved");
    expect(newsletterMailer).not.toHaveBeenCalled();
  });

  it("does not retry an uncertain confirmation after the token expires", async () => {
    const { store, newsletterEmail } = setup();
    const fail = vi.fn(async () => ({ ok: false as const, code: "provider_timeout", status: null }));
    newsletterEmail.mailer = fail;
    const result = await requestSubscriptionConfirmation(store, SECRET, { email: EMAIL }, NOW);
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    const confirmation = job(store, JOB_KINDS.newsletterConfirmation);
    await expect(createConfirmationHandler(store, SECRET, newsletterEmail, () => NOW)(confirmation, context)).rejects.toThrow("newsletter_send_uncertain");
    const later = new Date(NOW.getTime() + 25 * 60 * 60 * 1000);
    await createConfirmationHandler(store, SECRET, newsletterEmail, () => later)(confirmation, context);
    expect(fail).toHaveBeenCalledTimes(1);
  });
});
