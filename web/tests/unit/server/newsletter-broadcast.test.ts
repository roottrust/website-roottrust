import { describe, expect, it, vi } from "vitest";
import { PermanentFailure, RetryLater, enqueueJob, processJobs, type JobHandler } from "../../../src/lib/server/jobs";
import {
  buildBroadcastMessage,
  createBroadcastHandler,
  createPublishHandler,
  loadBroadcastConfig,
  type BroadcastConfig,
  type BroadcastMessage,
  type BroadcastProvider,
  type ProviderResult,
  type RemoteBroadcast,
} from "../../../src/lib/server/newsletter-broadcast";
import { createMemoryStore, type Store } from "../../../src/lib/server/store";
import { COLLECTIONS, JOB_KINDS, type EditionBroadcastRecord, type EditionDraftRecord, type EditionPublicRecord, type EditionRevisionRecord, type JobRecord } from "../../../src/lib/server/types";
import { NOW, SECRET } from "./helpers";

const DRAFT = "ed_00000000-0000-4000-8000-000000000001";
const OTHER_DRAFT = "ed_00000000-0000-4000-8000-000000000002";
const SLUG = "edicao-de-teste";
const SEGMENT = "seg_pilot_0001";
const PRIVATE_TEXT = "SEGUNDO PARAGRAFO PRIVADO";
const ALLOW = ["a@pilot.test", "b@pilot.test"];
const STATE_ID = `${DRAFT}.1`;

const revisionRecord = (overrides: Partial<EditionRevisionRecord> = {}): EditionRevisionRecord => ({
  id: STATE_ID,
  draftId: DRAFT,
  revision: 1,
  slug: SLUG,
  data: "2026-10-13",
  pilar: "Software",
  titulo: "Título da edição",
  corpo: `Abertura pública com [fonte](https://exemplo.org/a).\n\n${PRIVATE_TEXT}`,
  abertura: [{ t: "Abertura pública com " }, { t: "fonte", href: "https://exemplo.org/a" }, { t: "." }],
  fontes: [{ titulo: "Fonte oficial", href: "https://exemplo.org/a" }],
  createdAt: NOW.toISOString(),
  ...overrides,
});

const HOUR = 3_600_000;
const later = (offsetMs: number) => new Date(NOW.getTime() + offsetMs);

async function seed(
  store: Store,
  options: { status?: EditionDraftRecord["status"]; approvedRevision?: number; reservedBy?: string; revision?: Partial<EditionRevisionRecord>; decidedAt?: string | null } = {},
) {
  const { status = "approved", approvedRevision = 1, reservedBy = DRAFT } = options;
  const at = NOW.toISOString();
  await store.transaction(async (tx) => {
    tx.set(COLLECTIONS.editionRevisions, STATE_ID, revisionRecord(options.revision));
    tx.set(COLLECTIONS.editionDrafts, DRAFT, {
      id: DRAFT,
      slug: SLUG,
      currentRevision: 1,
      status,
      ...(status === "approved" ? { approvedRevision } : {}),
      ...(options.decidedAt === null ? {} : { decidedAt: options.decidedAt ?? at }),
      createdAt: at,
      updatedAt: at,
    } satisfies EditionDraftRecord);
    tx.set(COLLECTIONS.slugReservations, SLUG, { slug: SLUG, draftId: reservedBy, createdAt: at });
  });
}

type Mode = "ok" | "applied-lost" | "unapplied-lost" | 429 | 422;

// In-memory Resend: counts every call and can lose a response after (or without) applying the request.
function fakeProvider() {
  const remotes = new Map<string, RemoteBroadcast>();
  const calls = { list: 0, create: 0, get: 0, find: 0, send: 0 };
  const created: BroadcastMessage[] = [];
  const control = {
    contacts: { emails: [...ALLOW], complete: true } as { emails: string[]; complete: boolean },
    listFails: false,
    findFails: false,
    getFails: false,
    createMode: "ok" as Mode,
    sendMode: "ok" as Mode,
    afterCreate: undefined as (() => void) | undefined,
    afterSend: undefined as (() => void) | undefined,
    beforeSend: undefined as (() => Promise<void>) | undefined,
  };
  const failure = (status: number | null): ProviderResult<never> => ({ ok: false, code: status === null ? "provider_timeout" : "http_error", status });
  const provider: BroadcastProvider = {
    async listContacts() {
      calls.list += 1;
      return control.listFails ? failure(503) : { ok: true, value: control.contacts };
    },
    async createDraft(message) {
      calls.create += 1;
      if (typeof control.createMode === "number") return failure(control.createMode);
      if (control.createMode === "unapplied-lost") return failure(null);
      const id = `bc_${remotes.size + 1}`;
      remotes.set(id, { id, name: message.name, segmentId: message.segmentId, status: "draft", subject: message.subject, html: message.html });
      created.push(message);
      control.afterCreate?.();
      return control.createMode === "applied-lost" ? failure(null) : { ok: true, value: { id } };
    },
    async get(id) {
      calls.get += 1;
      const remote = remotes.get(id);
      return control.getFails || !remote ? failure(control.getFails ? 503 : 404) : { ok: true, value: { ...remote } };
    },
    async findByName(name) {
      calls.find += 1;
      return control.findFails ? failure(503) : { ok: true, value: { matches: [...remotes.values()].filter((remote) => remote.name === name), complete: true } };
    },
    async send(id) {
      calls.send += 1;
      await control.beforeSend?.();
      if (typeof control.sendMode === "number") return failure(control.sendMode);
      if (control.sendMode === "unapplied-lost") return failure(null);
      const remote = remotes.get(id);
      if (remote) remote.status = "queued";
      control.afterSend?.();
      return control.sendMode === "applied-lost" ? failure(null) : { ok: true, value: { id } };
    },
  };
  return { provider, calls, control, remotes, created };
}

const config = (provider: BroadcastProvider, overrides: Partial<BroadcastConfig> = {}): BroadcastConfig => ({
  apiKey: "re_test_key_not_used",
  from: "Root Trust <news@roottrust.test>",
  replyTo: "contato@roottrust.test",
  segmentId: SEGMENT,
  allowlist: ALLOW,
  provider,
  ...overrides,
});

const job = (overrides: Record<string, string> = {}): JobRecord => ({
  id: "jb_test",
  kind: JOB_KINDS.newsletterBroadcast,
  payload: { draftId: DRAFT, revision: "1", ...overrides },
  status: "pending",
  attempts: 0,
  maxAttempts: 8,
  createdAt: NOW.toISOString(),
  updatedAt: NOW.toISOString(),
});

const run = (handler: JobHandler, record: JobRecord = job()) => handler(record, { signal: new AbortController().signal });
const stateOf = (store: ReturnType<typeof createMemoryStore>) => store.dump(COLLECTIONS.editionBroadcasts)[STATE_ID] as EditionBroadcastRecord | undefined;

async function harness(options: Parameters<typeof seed>[1] = {}, overrides: Partial<BroadcastConfig> = {}) {
  const store = createMemoryStore();
  await seed(store, options);
  // the public projection exists once the publish job ran
  await run(createPublishHandler(store, SECRET, () => NOW, true), job());
  const fake = fakeProvider();
  const handler = createBroadcastHandler(store, config(fake.provider, overrides), () => NOW);
  // the same delivery, run later (clock moved), for approval-validity cases
  const handlerAt = (offsetMs: number) => createBroadcastHandler(store, config(fake.provider, overrides), () => later(offsetMs));
  return { store, fake, handler, handlerAt };
}

describe("publish job", () => {
  it("publishes only the allowlisted public projection and enqueues exactly one broadcast job, idempotently", async () => {
    const store = createMemoryStore();
    await seed(store);
    const publish = createPublishHandler(store, SECRET, () => NOW, true);
    await run(publish, job());
    const first = store.dump(COLLECTIONS.editionsPublic)[SLUG] as EditionPublicRecord;
    expect(first).toMatchObject({ slug: SLUG, titulo: "Título da edição", draftId: DRAFT, revision: 1 });
    expect(Object.keys(first).sort()).toEqual(["abertura", "data", "draftId", "fontes", "pilar", "publishedAt", "revision", "slug", "titulo"]);
    expect(JSON.stringify(store.dump(COLLECTIONS.editionsPublic))).not.toContain(PRIVATE_TEXT);
    const jobs = () => Object.values(store.dump(COLLECTIONS.jobs)) as JobRecord[];
    expect(jobs().filter((item) => item.kind === JOB_KINDS.newsletterBroadcast)).toHaveLength(1);
    expect(jobs()[0].payload).toEqual({ draftId: DRAFT, revision: "1" });

    await run(publish, job());
    await Promise.all([run(publish, job()), run(publish, job())]);
    expect(jobs().filter((item) => item.kind === JOB_KINDS.newsletterBroadcast)).toHaveLength(1);
    expect(store.dump(COLLECTIONS.editionsPublic)[SLUG]).toEqual(first);
  });

  it("without a configured Broadcast it publishes the preview but enqueues no delivery job; configuring it later enqueues exactly one", async () => {
    const store = createMemoryStore();
    await seed(store);
    const jobs = () => (Object.values(store.dump(COLLECTIONS.jobs)) as JobRecord[]).filter((item) => item.kind === JOB_KINDS.newsletterBroadcast);
    await run(createPublishHandler(store, SECRET, () => NOW, false), job());
    await run(createPublishHandler(store, SECRET, () => NOW, false), job());
    expect(store.dump(COLLECTIONS.editionsPublic)[SLUG]).toMatchObject({ draftId: DRAFT, revision: 1 });
    expect(jobs()).toHaveLength(0);
    await run(createPublishHandler(store, SECRET, () => NOW, true), job());
    await run(createPublishHandler(store, SECRET, () => NOW, true), job());
    expect(jobs()).toHaveLength(1);
  });

  it("is permanent, and publishes nothing, for a draft that is not approved for this revision, a taken slug or a bad payload", async () => {
    for (const options of [{ status: "pending" as const }, { status: "rejected" as const }, { approvedRevision: 2 }, { reservedBy: OTHER_DRAFT }]) {
      const store = createMemoryStore();
      await seed(store, options);
      await expect(run(createPublishHandler(store, SECRET, () => NOW, true))).rejects.toBeInstanceOf(PermanentFailure);
      expect(store.dump(COLLECTIONS.editionsPublic)).toEqual({});
      expect(store.dump(COLLECTIONS.jobs)).toEqual({});
    }
    const store = createMemoryStore();
    await seed(store);
    const publish = createPublishHandler(store, SECRET, () => NOW, true);
    await expect(run(publish, job({ draftId: "nope" }))).rejects.toBeInstanceOf(PermanentFailure);
    await expect(run(publish, job({ revision: "0" }))).rejects.toBeInstanceOf(PermanentFailure);
    await expect(run(publish, job({ draftId: OTHER_DRAFT }))).rejects.toMatchObject({ message: "publish_not_found" });
  });

  it("does not overwrite a public record that already belongs to another draft", async () => {
    const store = createMemoryStore();
    await seed(store);
    await store.transaction(async (tx) => tx.set(COLLECTIONS.editionsPublic, SLUG, { ...revisionRecord(), draftId: OTHER_DRAFT, publishedAt: NOW.toISOString() }));
    await expect(run(createPublishHandler(store, SECRET, () => NOW, true))).rejects.toMatchObject({ message: "publish_slug_taken" });
    expect((store.dump(COLLECTIONS.editionsPublic)[SLUG] as EditionPublicRecord).draftId).toBe(OTHER_DRAFT);
  });
});

describe("broadcast delivery", () => {
  it("verifies the whole segment, persists the draft before sending, sends once and is idempotent afterwards", async () => {
    const { store, fake, handler } = await harness();
    let atSend: EditionBroadcastRecord | undefined;
    fake.control.beforeSend = async () => {
      atSend = stateOf(store);
    };
    await run(handler);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(atSend).toMatchObject({ broadcastId: "bc_1", sendAttemptAt: NOW.toISOString() });
    expect(atSend?.createAttemptAt).toBeUndefined();
    expect(stateOf(store)).toMatchObject({ broadcastId: "bc_1", sentAt: NOW.toISOString() });
    expect(stateOf(store)?.sendAttemptAt).toBeUndefined();
    expect(fake.created[0]).toMatchObject({ name: `rt-newsletter ${STATE_ID}`, segmentId: SEGMENT, subject: "Título da edição" });
    expect(fake.created[0].html.match(/\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/g)).toHaveLength(1);
    const before = { ...fake.calls };
    await run(handler);
    await Promise.all([run(handler), run(handler)]);
    expect(fake.calls).toEqual(before);
  });

  it("blocks create and send when any contact is outside the allowlist, the list is partial or empty, or the provider fails", async () => {
    const cases: [string, (fake: ReturnType<typeof fakeProvider>) => void, RegExp][] = [
      ["foreign contact", (fake) => void (fake.control.contacts = { emails: [...ALLOW, "intruso@externo.test"], complete: true }), /segment_not_pilot_safe/],
      ["only one foreign contact", (fake) => void (fake.control.contacts = { emails: ["intruso@externo.test"], complete: true }), /segment_not_pilot_safe/],
      ["incomplete pagination", (fake) => void (fake.control.contacts = { emails: [...ALLOW], complete: false }), /segment_not_pilot_safe/],
      ["empty segment", (fake) => void (fake.control.contacts = { emails: [], complete: true }), /segment_not_pilot_safe/],
      ["provider error", (fake) => void (fake.control.listFails = true), /segment_check_unavailable/],
    ];
    for (const [, arrange, message] of cases) {
      const { store, fake, handler } = await harness();
      arrange(fake);
      await expect(run(handler)).rejects.toThrow(message);
      // contamination is permanent (dead job + alert); an unavailable provider is transient (retried)
      if (message.source === "segment_not_pilot_safe") await expect(run(handler)).rejects.toBeInstanceOf(PermanentFailure);
      else await expect(run(handler)).rejects.not.toBeInstanceOf(PermanentFailure);
      expect(fake.calls).toMatchObject({ create: 0, send: 0 });
      expect(stateOf(store)?.createAttemptAt).toBeUndefined();
      expect(stateOf(store)?.reconcile).toBeUndefined();
    }
  });

  it("re-checks the segment before sending: a contact added after the draft was created blocks the send permanently (alert), and a person's re-run reuses the draft", async () => {
    const { store, fake, handler } = await harness();
    fake.control.afterCreate = () => void (fake.control.contacts = { emails: [...ALLOW, "novo@externo.test"], complete: true });
    await expect(run(handler)).rejects.toBeInstanceOf(PermanentFailure);
    await expect(run(handler)).rejects.toThrow("segment_not_pilot_safe");
    expect(fake.calls).toMatchObject({ create: 1, send: 0 });
    expect(stateOf(store)).toMatchObject({ broadcastId: "bc_1" });
    expect(stateOf(store)?.sendAttemptAt).toBeUndefined();
    fake.control.contacts = { emails: [...ALLOW], complete: true };
    await run(handler);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(stateOf(store)?.sentAt).toBeDefined();
  });

  it("refuses editions that are not approved and published, a changed segment and a state flagged for reconciliation, without any provider call", async () => {
    const unpublished = createMemoryStore();
    await seed(unpublished);
    const fake = fakeProvider();
    await expect(run(createBroadcastHandler(unpublished, config(fake.provider), () => NOW))).rejects.toMatchObject({ message: "broadcast_not_found" });
    const pending = createMemoryStore();
    await seed(pending, { status: "pending" });
    await expect(run(createBroadcastHandler(pending, config(fake.provider), () => NOW))).rejects.toMatchObject({ message: "broadcast_not_approved" });
    await expect(run(createBroadcastHandler(pending, config(fake.provider), () => NOW), job({ draftId: "nope" }))).rejects.toMatchObject({ message: "bad_payload" });
    expect(fake.calls).toEqual({ list: 0, create: 0, get: 0, find: 0, send: 0 });

    const { store, fake: second, handler } = await harness();
    second.control.createMode = "applied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_create_uncertain");
    const moved = createBroadcastHandler(store, config(second.provider, { segmentId: "seg_other_0002" }), () => NOW);
    await expect(run(moved)).rejects.toMatchObject({ message: "segment_changed" });
    await store.transaction(async (tx) => tx.set(COLLECTIONS.editionBroadcasts, STATE_ID, { ...(stateOf(store) as EditionBroadcastRecord), reconcile: true }));
    const callsBefore = { ...second.calls };
    await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
    expect(second.calls).toEqual(callsBefore);
  });
});

describe("uncertain create", () => {
  it("a create whose response was lost is found again by its deterministic name, bound and sent: one Broadcast, one send", async () => {
    const { store, fake, handler } = await harness();
    fake.control.createMode = "applied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_create_uncertain");
    expect(stateOf(store)).toMatchObject({ createAttemptAt: NOW.toISOString() });
    expect(stateOf(store)?.broadcastId).toBeUndefined();
    await run(handler);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(fake.remotes.size).toBe(1);
    expect(stateOf(store)).toMatchObject({ broadcastId: "bc_1" });
    expect(stateOf(store)?.sentAt).toBeDefined();
    expect(stateOf(store)?.createAttemptAt).toBeUndefined();
  });

  it("absence is not proof: a lost create that left nothing remote goes to a person, never to a second create, and stays there", async () => {
    const { store, fake, handler } = await harness();
    fake.control.createMode = "unapplied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_create_uncertain");
    fake.control.createMode = "ok";
    await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
    expect(stateOf(store)?.reconcile).toBe(true);
    await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
    expect(fake.calls).toMatchObject({ create: 1, send: 0 });
  });

  it("several matches, or a match in another segment, require a person", async () => {
    for (const arrange of [
      (fake: ReturnType<typeof fakeProvider>) => {
        fake.remotes.set("bc_x", { id: "bc_x", name: `rt-newsletter ${STATE_ID}`, segmentId: SEGMENT, status: "draft", subject: null, html: null });
        fake.remotes.set("bc_y", { id: "bc_y", name: `rt-newsletter ${STATE_ID}`, segmentId: SEGMENT, status: "draft", subject: null, html: null });
      },
      (fake: ReturnType<typeof fakeProvider>) => void fake.remotes.set("bc_x", { id: "bc_x", name: `rt-newsletter ${STATE_ID}`, segmentId: "seg_other_0002", status: "draft", subject: null, html: null }),
    ]) {
      const { store, fake, handler } = await harness();
      fake.control.createMode = "unapplied-lost";
      await expect(run(handler)).rejects.toThrow("broadcast_create_uncertain");
      arrange(fake);
      await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
      expect(stateOf(store)?.reconcile).toBe(true);
      expect(fake.calls).toMatchObject({ create: 1, send: 0 });
    }
  });

  it("an unavailable lookup keeps the state as is (retry later) without creating or flagging anything", async () => {
    const { store, fake, handler } = await harness();
    fake.control.createMode = "applied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_create_uncertain");
    fake.control.findFails = true;
    await expect(run(handler)).rejects.toThrow("reconcile_unavailable");
    expect(stateOf(store)?.reconcile).toBeUndefined();
    expect(stateOf(store)?.createAttemptAt).toBeDefined();
    fake.control.findFails = false;
    await run(handler);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
  });

  it("a rate limit or a definite refusal clears the stamp (nothing was created); only the limit is retried", async () => {
    const { store, fake, handler } = await harness();
    fake.control.createMode = 429;
    await expect(run(handler)).rejects.toBeInstanceOf(RetryLater);
    expect(stateOf(store)?.createAttemptAt).toBeUndefined();
    fake.control.createMode = 422;
    await expect(run(handler)).rejects.toMatchObject({ message: "broadcast_create_refused" });
    expect(stateOf(store)?.createAttemptAt).toBeUndefined();
    expect(stateOf(store)?.reconcile).toBeUndefined();
    fake.control.createMode = "ok";
    await run(handler);
    expect(fake.remotes.size).toBe(1);
    expect(fake.calls.send).toBe(1);
  });
});

describe("uncertain send", () => {
  it("a send whose response was lost but was applied is recorded from the provider status, without sending again", async () => {
    const { store, fake, handler } = await harness();
    fake.control.sendMode = "applied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_send_uncertain");
    expect(stateOf(store)).toMatchObject({ broadcastId: "bc_1", sendAttemptAt: NOW.toISOString() });
    expect(stateOf(store)?.sentAt).toBeUndefined();
    await run(handler);
    expect(fake.calls.send).toBe(1);
    expect(stateOf(store)?.sentAt).toBeDefined();
    expect(stateOf(store)?.sendAttemptAt).toBeUndefined();
  });

  it("a send that still shows a draft is NOT retried on that evidence: it goes to a person", async () => {
    const { store, fake, handler } = await harness();
    fake.control.sendMode = "unapplied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_send_uncertain");
    fake.control.sendMode = "ok";
    await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
    expect(stateOf(store)?.reconcile).toBe(true);
    await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
    expect(fake.calls.send).toBe(1);
    expect(fake.remotes.get("bc_1")?.status).toBe("draft");
  });

  it("a Broadcast in an unknown status, or whose name or segment is not ours, is never sent", async () => {
    for (const arrange of [
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).status = "deleted"),
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).segmentId = "seg_other_0002"),
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).name = "outro nome"),
      // content edited in the provider after creation: what would go out is no longer what was approved
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).subject = "Assunto alterado"),
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).html += "<p>texto inserido por terceiros</p>"),
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).html = null),
      (fake: ReturnType<typeof fakeProvider>) => void ((fake.remotes.get("bc_1") as RemoteBroadcast).subject = null),
    ]) {
      const { store, fake, handler } = await harness();
      const tamper = vi.spyOn(fake.provider, "get").mockImplementationOnce(async (id) => {
        arrange(fake);
        return { ok: true, value: { ...(fake.remotes.get(id) as RemoteBroadcast) } };
      });
      await expect(run(handler)).rejects.toMatchObject({ message: "reconciliation_required" });
      tamper.mockRestore();
      expect(fake.calls.send).toBe(0);
      expect(stateOf(store)?.reconcile).toBe(true);
    }
  });

  it("only surrounding whitespace in the remote content is tolerated", async () => {
    const { store, fake, handler } = await harness();
    const normalize = vi.spyOn(fake.provider, "get").mockImplementationOnce(async (id) => {
      const remote = fake.remotes.get(id) as RemoteBroadcast;
      return { ok: true, value: { ...remote, subject: ` ${remote.subject} `, html: `\r\n${remote.html}\r\n` } };
    });
    await run(handler);
    normalize.mockRestore();
    expect(fake.calls.send).toBe(1);
    expect(stateOf(store)?.sentAt).toBeDefined();
  });

  it("a rate limit or a definite refusal clears the send stamp (nothing was sent); only the limit is retried", async () => {
    const { store, fake, handler } = await harness();
    fake.control.sendMode = 429;
    await expect(run(handler)).rejects.toBeInstanceOf(RetryLater);
    expect(stateOf(store)?.sendAttemptAt).toBeUndefined();
    fake.control.sendMode = 422;
    await expect(run(handler)).rejects.toMatchObject({ message: "broadcast_send_refused" });
    expect(stateOf(store)?.sendAttemptAt).toBeUndefined();
    expect(stateOf(store)?.reconcile).toBeUndefined();
    fake.control.sendMode = "ok";
    await run(handler);
    expect(fake.calls).toMatchObject({ create: 1, send: 3 });
    expect(fake.remotes.get("bc_1")?.status).toBe("queued");
    expect(stateOf(store)?.sentAt).toBeDefined();
  });

  it("an unavailable status read stops before any send", async () => {
    const { fake, handler } = await harness();
    fake.control.afterCreate = () => void (fake.control.getFails = true);
    await expect(run(handler)).rejects.toThrow("broadcast_state_unavailable");
    expect(fake.calls.send).toBe(0);
  });
});

describe("approval validity", () => {
  it("refuses to create or send once the approval is older than 24 h, permanently, while the public edition stays published", async () => {
    const { store, fake, handlerAt } = await harness();
    await expect(run(handlerAt(24 * HOUR + 1))).rejects.toBeInstanceOf(PermanentFailure);
    await expect(run(handlerAt(7 * 24 * HOUR))).rejects.toMatchObject({ message: "approval_expired" });
    expect(fake.calls).toEqual({ list: 0, create: 0, get: 0, find: 0, send: 0 });
    expect(stateOf(store)?.createAttemptAt).toBeUndefined();
    expect(stateOf(store)?.reconcile).toBeUndefined();
    expect((store.dump(COLLECTIONS.editionsPublic)[SLUG] as EditionPublicRecord).draftId).toBe(DRAFT);
  });

  it("still delivers exactly at the 24 h limit", async () => {
    const { store, fake, handlerAt } = await harness();
    await run(handlerAt(24 * HOUR));
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(stateOf(store)?.sentAt).toBeDefined();
  });

  it("an approval without a stored instant counts as stale", async () => {
    const { store, fake, handler } = await harness({ decidedAt: null });
    await expect(run(handler)).rejects.toMatchObject({ message: "approval_expired" });
    expect(fake.calls).toEqual({ list: 0, create: 0, get: 0, find: 0, send: 0 });
    expect(stateOf(store)?.createAttemptAt).toBeUndefined();
  });

  it("a Broadcast created in time is not sent after the approval expired; the draft stays at the provider for a person", async () => {
    const { store, fake, handler, handlerAt } = await harness();
    fake.control.afterCreate = () => void (fake.control.contacts = { emails: [...ALLOW, "novo@externo.test"], complete: true });
    await expect(run(handler)).rejects.toMatchObject({ message: "segment_not_pilot_safe" });
    fake.control.contacts = { emails: [...ALLOW], complete: true };
    await expect(run(handlerAt(25 * HOUR))).rejects.toMatchObject({ message: "approval_expired" });
    expect(fake.calls).toMatchObject({ create: 1, send: 0 });
    expect(fake.remotes.get("bc_1")?.status).toBe("draft");
    expect(stateOf(store)?.sendAttemptAt).toBeUndefined();
  });

  it("an old uncertain create is still reconciled by name, but its send is refused once the approval expired", async () => {
    const { store, fake, handler, handlerAt } = await harness();
    fake.control.createMode = "applied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_create_uncertain");
    await expect(run(handlerAt(30 * HOUR))).rejects.toMatchObject({ message: "approval_expired" });
    expect(stateOf(store)).toMatchObject({ broadcastId: "bc_1" });
    expect(fake.calls).toMatchObject({ create: 1, send: 0 });
  });

  it("an expired approval never hides a send the provider already accepted: it is recorded, not refused", async () => {
    const { store, fake, handler, handlerAt } = await harness();
    fake.control.sendMode = "applied-lost";
    await expect(run(handler)).rejects.toThrow("broadcast_send_uncertain");
    await run(handlerAt(48 * HOUR));
    expect(fake.calls.send).toBe(1);
    expect(stateOf(store)?.sentAt).toBeDefined();
  });
});

describe("partial failure and concurrency", () => {
  const flaky = (store: ReturnType<typeof createMemoryStore>) => {
    const gate = { fail: false };
    const wrapped: Store = {
      ...store,
      transaction: (fn) => {
        if (gate.fail) {
          gate.fail = false;
          return Promise.reject(new Error("store_down"));
        }
        return store.transaction(fn);
      },
    };
    return { wrapped, gate };
  };

  it("storage failing right after the provider created the Broadcast is recovered by name on the next run", async () => {
    const base = await harness();
    const { wrapped, gate } = flaky(base.store);
    const handler = createBroadcastHandler(wrapped, config(base.fake.provider), () => NOW);
    base.fake.control.afterCreate = () => void (gate.fail = true);
    await expect(run(handler)).rejects.toThrow("store_down");
    expect(stateOf(base.store)?.broadcastId).toBeUndefined();
    await run(handler);
    expect(base.fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(stateOf(base.store)?.sentAt).toBeDefined();
  });

  it("storage failing right after the provider accepted the send is recovered from the provider status, without a second send", async () => {
    const base = await harness();
    const { wrapped, gate } = flaky(base.store);
    const handler = createBroadcastHandler(wrapped, config(base.fake.provider), () => NOW);
    base.fake.control.afterSend = () => void (gate.fail = true);
    await expect(run(handler)).rejects.toThrow("store_down");
    expect(stateOf(base.store)?.sentAt).toBeUndefined();
    await run(handler);
    expect(base.fake.calls.send).toBe(1);
    expect(stateOf(base.store)?.sentAt).toBeDefined();
  });

  it("two concurrent runs can never create or send twice", async () => {
    const { store, fake, handler } = await harness();
    const results = await Promise.allSettled([run(handler), run(handler), run(handler)]);
    expect(fake.calls.create).toBeLessThanOrEqual(1);
    expect(fake.calls.send).toBeLessThanOrEqual(1);
    expect(fake.remotes.size).toBeLessThanOrEqual(1);
    expect(results.some((result) => result.status === "fulfilled")).toBe(true);
    // whatever the interleaving, a settled state never sends again
    for (let attempt = 0; attempt < 3 && !stateOf(store)?.sentAt && !stateOf(store)?.reconcile; attempt += 1) await run(handler).catch(() => undefined);
    expect(fake.calls.send).toBeLessThanOrEqual(1);
  });

  it("the durable chain publish -> broadcast sends once even when the runner executes it repeatedly", async () => {
    const store = createMemoryStore();
    await seed(store);
    await store.transaction(async (tx) => {
      await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterPublish, key: STATE_ID, payload: { draftId: DRAFT, revision: "1" } }, NOW);
    });
    const fake = fakeProvider();
    const handlers = {
      [JOB_KINDS.newsletterPublish]: createPublishHandler(store, SECRET, () => NOW, true),
      [JOB_KINDS.newsletterBroadcast]: createBroadcastHandler(store, config(fake.provider), () => NOW),
    };
    const options = { now: () => NOW, limit: 10, leaseMs: 60_000, handlerTimeoutMs: 30_000 };
    const first = await processJobs(store, handlers, options);
    await processJobs(store, handlers, options);
    await processJobs(store, handlers, options);
    expect(first.done).toBe(2);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(store.dump(COLLECTIONS.editionsPublic)[SLUG]).toBeDefined();
    expect(stateOf(store)?.sentAt).toBeDefined();
  });
});

describe("durable runners racing for the same delivery", () => {
  it("two runners claiming at once: the lease gives the job to one, so there is exactly one create and one send", async () => {
    const { store, fake, handler } = await harness();
    fake.control.beforeSend = () => new Promise((resolve) => setTimeout(resolve, 15));
    const handlers = { [JOB_KINDS.newsletterBroadcast]: handler };
    const options = { now: () => NOW, limit: 10, leaseMs: 60_000, handlerTimeoutMs: 30_000 };
    const summaries = await Promise.all([processJobs(store, handlers, options), processJobs(store, handlers, options), processJobs(store, handlers, options)]);
    expect(summaries.reduce((total, item) => total + item.claimed, 0)).toBe(1);
    expect(summaries.reduce((total, item) => total + item.done, 0)).toBe(1);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(fake.remotes.size).toBe(1);
    expect(stateOf(store)?.sentAt).toBeDefined();
  });

  it("the same job run directly by several workers (lease lost or bypassed) still creates once and sends once", async () => {
    const { store, fake, handler } = await harness();
    fake.control.beforeSend = () => new Promise((resolve) => setTimeout(resolve, 15));
    const settled = await Promise.allSettled(Array.from({ length: 5 }, () => run(handler)));
    expect(settled.some((item) => item.status === "fulfilled")).toBe(true);
    expect(fake.calls).toMatchObject({ create: 1, send: 1 });
    expect(fake.remotes.size).toBe(1);
    const state = stateOf(store);
    expect(state?.sentAt ?? state?.reconcile).toBeTruthy();
  });
});

describe("configuration and message", () => {
  const env = {
    RESEND_API_KEY: "re_test_key_not_used",
    NEWSLETTER_EMAIL_FROM: "Root Trust <news@roottrust.test>",
    NEWSLETTER_EMAIL_REPLY_TO: "contato@roottrust.test",
    RESEND_NEWSLETTER_SEGMENT_ID: SEGMENT,
    RESEND_DOMAIN_CONFIRMED: "true",
    JOBS_TRIGGER_CONFIRMED: "true",
    NEWSLETTER_PILOT_SEGMENT_CONFIRMED: "true",
    NEWSLETTER_PILOT_ALLOWLIST: "A@pilot.test, b@pilot.test, a@pilot.test",
  };

  it("loads only with every credential, operator statement and a valid allowlist (deduplicated, lowercased)", () => {
    expect(loadBroadcastConfig(env)).toMatchObject({ segmentId: SEGMENT, allowlist: ["a@pilot.test", "b@pilot.test"] });
    for (const key of Object.keys(env)) expect(loadBroadcastConfig({ ...env, [key]: undefined })).toBeUndefined();
    for (const key of ["RESEND_DOMAIN_CONFIRMED", "JOBS_TRIGGER_CONFIRMED", "NEWSLETTER_PILOT_SEGMENT_CONFIRMED"]) expect(loadBroadcastConfig({ ...env, [key]: "yes" })).toBeUndefined();
    expect(loadBroadcastConfig({ ...env, NEWSLETTER_PILOT_ALLOWLIST: "a@pilot.test, not-an-email" })).toBeUndefined();
    expect(loadBroadcastConfig({ ...env, NEWSLETTER_PILOT_ALLOWLIST: Array.from({ length: 101 }, (_, index) => `u${index}@pilot.test`).join(",") })).toBeUndefined();
    expect(loadBroadcastConfig({ ...env, RESEND_NEWSLETTER_SEGMENT_ID: "bad id!" })).toBeUndefined();
  });

  it("escapes editorial text and links only https sources", () => {
    const message = buildBroadcastMessage(
      { from: "Root Trust <news@roottrust.test>", replyTo: "contato@roottrust.test", segmentId: SEGMENT },
      revisionRecord({ titulo: "<script>x</script>", corpo: 'Veja [ok](https://exemplo.org/a) e [ruim](javascript:alert(1)) "aspas" <b>x</b>\n\nSegundo.', fontes: [{ titulo: "F", href: "http://inseguro.test" }] }),
      "nome",
    );
    expect(message.html).not.toContain("<script>");
    expect(message.html).not.toContain("<b>");
    expect(message.html).toContain('<a href="https://exemplo.org/a">ok</a>');
    expect(message.html).not.toContain('href="javascript');
    expect(message.html).not.toContain("inseguro.test");
    expect(message.text).toContain("Cancelar o recebimento");
  });

  it("never lets editorial text open a Resend template variable: only the unsubscribe placeholder survives", () => {
    const joiner = String.fromCharCode(0x2060);
    const message = buildBroadcastMessage(
      { from: "Root Trust <news@roottrust.test>", replyTo: "contato@roottrust.test", segmentId: SEGMENT },
      revisionRecord({
        titulo: "Título {{{RESEND_UNSUBSCRIBE_URL}}} {{contact.email}}",
        corpo: "Olá {{{FIRST_NAME}}} e {{ EMAIL }}.\n\nVeja [{{{x}}}](https://exemplo.org/a?q={{contact.email}}&r={{{y}}}).",
        fontes: [{ titulo: "Fonte {{{RESEND_UNSUBSCRIBE_URL}}}", href: "https://exemplo.org/f?t={{{token}}}" }],
      }),
      "nome",
    );
    const withoutPlaceholder = (value: string) => value.split("{{{RESEND_UNSUBSCRIBE_URL}}}");
    for (const [field, value] of Object.entries({ html: message.html, text: message.text, subject: message.subject })) {
      const pieces = withoutPlaceholder(value);
      expect(pieces.length - 1, `${field} keeps exactly the constant placeholder`).toBe(field === "subject" ? 0 : 1);
      for (const piece of pieces) expect(piece, field).not.toMatch(/\{\{|\}\}|\{\s*\{|\}\s*\}/);
    }
    expect(message.subject).toBe(`Título {${joiner}{${joiner}{${joiner}RESEND_UNSUBSCRIBE_URL${joiner}}${joiner}}${joiner}} {${joiner}{${joiner}contact.email${joiner}}${joiner}}`);
    expect(message.html).toContain("&#123;&#123;&#123;FIRST_NAME&#125;&#125;&#125;");
    expect(message.html).toContain("%7B%7Bcontact.email%7D%7D");
    expect(message.html).toContain("t=%7B%7B%7Btoken%7D%7D%7D");
  });
});
