import { generateKeyPairSync, sign as nodeSign } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { handleNewsletterDecision, handleNewsletterDraft, type Deps } from "../../../src/lib/server/http";
import { signInternalRequest, type InternalScope } from "../../../src/lib/server/internal-auth";
import type { JobRecord } from "../../../src/lib/server/types";
import { createMemoryStore } from "../../../src/lib/server/store";
import { DECISION_PATH, DRAFT_PATH, buildCustomId, parseCustomId, type DecisionAction } from "../../../src/lib/server/newsletter-protocol";
import {
  controlComponents,
  createNewsletterHandler,
  formatReviewText,
  loadNewsletterConfig,
  splitForDiscord,
  type NewsletterConfig,
} from "../../../src/lib/server/newsletter";
import { PermanentFailure, RetryLater } from "../../../src/lib/server/jobs";
import { COLLECTIONS, JOB_KINDS, type EditionDraftRecord, type EditionRevisionRecord } from "../../../src/lib/server/types";
import { NOW, setup } from "./helpers";

const KEY_DRAFT = "d".repeat(40);
const KEY_PUBLISH = "p".repeat(40);
const BOT_TOKEN = "bot-token-abcdefghijklmnop.secret";
const IDS = { applicationId: "111111111111111111", guildId: "222222222222222222", channelId: "333333333333333333" };

const OPENING = "Uma abertura completa de edição, com contexto suficiente e uma [fonte oficial](https://exemplo.org/a) citada.";
const PARA = "\n\n";
const edition = (overrides: Record<string, unknown> = {}) => ({
  slug: "edicao-de-teste",
  data: "2026-10-13",
  pilar: "Cibersegurança",
  titulo: "Título da edição",
  corpo: `${OPENING}\n\nSegundo parágrafo privado, só para revisão.`,
  fontes: [{ titulo: "Fonte oficial", href: "https://exemplo.org/a" }],
  ...overrides,
});

const pair = generateKeyPairSync("ed25519");
const PUBLIC_HEX = (pair.publicKey.export({ format: "der", type: "spki" }) as Buffer).subarray(-32).toString("hex");

// The original Discord interaction, signed like Discord does (Ed25519 over timestamp + raw body).
let interactionSeq = 0;
function discordProof(fields: Record<string, unknown>, options: { at?: number; signWith?: typeof pair.privateKey; interaction?: Record<string, unknown> } = {}) {
  const body = JSON.stringify({
    id: String(++interactionSeq),
    type: 3,
    application_id: fields.applicationId,
    guild_id: fields.guildId,
    channel_id: fields.channelId,
    message: { id: fields.messageId },
    data: { custom_id: buildCustomId(fields.action as DecisionAction, fields.draftId as string, fields.revision as number), component_type: 2 },
    ...options.interaction,
  });
  const timestamp = String(Math.floor((options.at ?? NOW.getTime()) / 1000));
  return { timestamp, signature: nodeSign(null, Buffer.from(timestamp + body), options.signWith ?? pair.privateKey).toString("hex"), body };
}

let seq = 0;
function signedPost(path: string, scope: InternalScope, key: string, body: unknown, options: { at?: number; nonce?: string } = {}) {
  seq += 1;
  const bytes = Buffer.from(typeof body === "string" ? body : JSON.stringify(body));
  const timestamp = options.at ?? NOW.getTime();
  const nonce = options.nonce ?? `nl-nonce-${String(seq).padStart(16, "0")}`;
  const signature = signInternalRequest(key, { scope, method: "POST", pathname: path, timestamp, nonce, body: bytes });
  return new Request(`http://localhost${path}`, {
    method: "POST",
    body: bytes,
    headers: { "content-type": "application/json", "x-rt-timestamp": String(timestamp), "x-rt-nonce": nonce, "x-rt-signature": signature },
  });
}

function review() {
  const base = setup();
  let messageSeq = 0;
  const discord = vi.fn<typeof fetch>(async () => Response.json({ id: String(800000000000000000n + BigInt(++messageSeq)) }));
  const newsletter: NewsletterConfig = { botToken: BOT_TOKEN, ...IDS, publicKey: PUBLIC_HEX, fetch: discord };
  const deps: Deps = { ...base.deps, newsletter, internalKeys: { jobs: ["j".repeat(32)], draft: [KEY_DRAFT], publish: [KEY_PUBLISH] } };
  const postDraft = (body: unknown, options?: { at?: number; nonce?: string }) =>
    handleNewsletterDraft(signedPost(DRAFT_PATH, "draft", KEY_DRAFT, body, options), deps);
  // `proof` defaults to a fresh valid interaction matching the decision; `false` omits it.
  const decide = (body: Record<string, unknown>, options?: { at?: number; nonce?: string; proof?: Record<string, unknown> | false }) => {
    const fields = { ...IDS, ...body };
    const proof = options?.proof === false ? {} : { proof: options?.proof ?? discordProof(fields) };
    return handleNewsletterDecision(signedPost(DECISION_PATH, "publish", KEY_PUBLISH, { ...fields, ...proof }, options), deps);
  };
  const jobs = () => Object.values(base.store.dump(COLLECTIONS.jobs)) as JobRecord[];
  const draftOf = (id: string) => base.store.dump(COLLECTIONS.editionDrafts)[id] as EditionDraftRecord | undefined;
  const run = async (job: JobRecord) => createNewsletterHandler(base.store, newsletter, () => NOW)(job, { signal: new AbortController().signal });
  return { ...base, deps, newsletter, discord, postDraft, decide, jobs, draftOf, run };
}

async function queued(ctx: ReturnType<typeof review>, body: unknown = edition()) {
  const response = await ctx.postDraft(body);
  expect(response.status).toBe(202);
  return (await response.json()) as { status: string; draftId: string; revision: number };
}

// Posts the review messages for the newest job and returns the control message ID the Worker would see.
async function posted(ctx: ReturnType<typeof review>, body: unknown = edition()) {
  const saved = await queued(ctx, body);
  const job = ctx.jobs().find((candidate) => candidate.payload.draftId === saved.draftId && candidate.payload.revision === String(saved.revision));
  await ctx.run(job as JobRecord);
  const bound = ctx.draftOf(saved.draftId)?.notification;
  expect(bound).toBeDefined();
  return { ...saved, messageId: (bound as { messageId: string }).messageId };
}

describe("newsletter draft endpoint", () => {
  it("stores an immutable revision and its Discord job together, and publishes nothing", async () => {
    const ctx = review();
    const saved = await queued(ctx);
    expect(saved).toMatchObject({ status: "queued", revision: 1 });
    expect(ctx.draftOf(saved.draftId)).toMatchObject({ status: "pending", currentRevision: 1 });
    expect(ctx.store.dump(COLLECTIONS.editionRevisions)[`${saved.draftId}.1`]).toMatchObject({ slug: "edicao-de-teste", revision: 1 });
    expect(ctx.jobs()).toHaveLength(1);
    expect(ctx.jobs()[0]).toMatchObject({ kind: JOB_KINDS.newsletterDiscord, status: "pending", payload: { draftId: saved.draftId, revision: "1" } });
    expect(ctx.store.dump(COLLECTIONS.editionsPublic)).toEqual({});
    expect(ctx.discord).not.toHaveBeenCalled();
  });

  it("requires a valid draft-scope signature; other scopes, replays, skew and the 503 states fail", async () => {
    const ctx = review();
    const publishKey = await handleNewsletterDraft(signedPost(DRAFT_PATH, "draft", KEY_PUBLISH, edition()), ctx.deps);
    expect(publishKey.status).toBe(401);
    const unsigned = await handleNewsletterDraft(new Request(`http://localhost${DRAFT_PATH}`, { method: "POST", body: JSON.stringify(edition()) }), ctx.deps);
    expect(unsigned.status).toBe(401);
    const stale = await ctx.postDraft(edition(), { at: NOW.getTime() - 120_000 });
    expect(stale.status).toBe(401);
    expect((await ctx.postDraft(edition(), { nonce: "replay-nonce-0000001" })).status).toBe(202);
    expect((await ctx.postDraft(edition({ slug: "outra-edicao" }), { nonce: "replay-nonce-0000001" })).status).toBe(401);
    const noKey = await handleNewsletterDraft(signedPost(DRAFT_PATH, "draft", KEY_DRAFT, edition()), { ...ctx.deps, internalKeys: { jobs: ["j".repeat(32)] } });
    expect(noKey.status).toBe(503);
    const noDiscord = await handleNewsletterDraft(signedPost(DRAFT_PATH, "draft", KEY_DRAFT, edition({ slug: "sem-discord" })), { ...ctx.deps, newsletter: undefined });
    expect(noDiscord.status).toBe(503);
    expect((await handleNewsletterDraft(signedPost(DRAFT_PATH, "draft", KEY_DRAFT, edition({ slug: "off" })), { ...ctx.deps, mode: "off" })).status).toBe(503);
  });

  it("rejects bodies over the 64 KiB edition cap and invalid or extra fields without storing anything", async () => {
    const ctx = review();
    expect((await ctx.postDraft(edition({ corpo: `${OPENING}\n\n${"x".repeat(70 * 1024)}` }))).status).toBe(400);
    for (const body of [edition({ status: "approved" }), edition({ notification: {} }), edition({ pilar: "Outro" }), edition({ corpo: "curto" }), edition({ draftId: "ed_x" }), edition({ fontes: [] }), edition({ fontes: [{ titulo: "Sem https", href: "http://exemplo.org/a" }] }), edition({ fontes: [{ titulo: "Sem href" }] }), "{nao-json", "null", "[]"]) {
      expect((await ctx.postDraft(body)).status).toBe(400);
    }
    expect(ctx.store.dump(COLLECTIONS.editionDrafts)).toEqual({});
    expect(ctx.jobs()).toHaveLength(0);
  });

  it("refuses a duplicate slug and a draftId the reviewer did not ask to regenerate", async () => {
    const ctx = review();
    const saved = await queued(ctx);
    const duplicate = await ctx.postDraft(edition());
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ code: "slug_exists" });
    const notRequested = await ctx.postDraft({ ...edition(), draftId: saved.draftId });
    expect(notRequested.status).toBe(409);
    expect(await notRequested.json()).toEqual({ code: "not_regenerating" });
    const unknown = await ctx.postDraft({ ...edition(), draftId: "ed_00000000-0000-4000-8000-000000000000" });
    expect(unknown.status).toBe(404);
    expect(ctx.jobs()).toHaveLength(1);
  });

  it("limits drafts per day globally with 429 and Retry-After", async () => {
    const ctx = review();
    for (let index = 0; index < 8; index += 1) await queued(ctx, edition({ slug: `edicao-${index}` }));
    const denied = await ctx.postDraft(edition({ slug: "edicao-9" }));
    expect(denied.status).toBe(429);
    expect(Number(denied.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(ctx.jobs()).toHaveLength(8);
  });

  it("a regeneration becomes revision 2 only after the reviewer asked for it, and the old buttons go stale", async () => {
    const ctx = review();
    const first = await posted(ctx);
    expect((await ctx.decide({ action: "regenerate", draftId: first.draftId, revision: 1, messageId: first.messageId })).status).toBe(200);
    expect(ctx.draftOf(first.draftId)?.status).toBe("regeneration_requested");
    const next = await ctx.postDraft({ ...edition({ titulo: "Segunda versão" }), draftId: first.draftId });
    expect(next.status).toBe(202);
    expect(await next.json()).toMatchObject({ draftId: first.draftId, revision: 2 });
    expect(ctx.store.dump(COLLECTIONS.editionRevisions)[`${first.draftId}.1`]).toMatchObject({ titulo: "Título da edição" });
    expect(ctx.draftOf(first.draftId)).toMatchObject({ status: "pending", currentRevision: 2 });
    expect(ctx.draftOf(first.draftId)?.notification).toBeUndefined();
    const old = await ctx.decide({ action: "reject", draftId: first.draftId, revision: 1, messageId: first.messageId });
    expect(old.status).toBe(200);
    expect(await old.json()).toEqual({ result: "stale" });
  });

  it("refuses a regeneration that changes the slug, inside the transaction, and keeps the request open", async () => {
    const ctx = review();
    const first = await posted(ctx);
    await ctx.decide({ action: "regenerate", draftId: first.draftId, revision: 1, messageId: first.messageId });
    const changed = await ctx.postDraft({ ...edition({ slug: "outro-slug" }), draftId: first.draftId });
    expect(changed.status).toBe(409);
    expect(await changed.json()).toEqual({ code: "slug_mismatch" });
    expect(ctx.draftOf(first.draftId)).toMatchObject({ status: "regeneration_requested", currentRevision: 1, slug: "edicao-de-teste" });
    expect(Object.keys(ctx.store.dump(COLLECTIONS.editionRevisions))).toEqual([`${first.draftId}.1`]);
    expect(ctx.jobs()).toHaveLength(1);
    const same = await ctx.postDraft({ ...edition({ titulo: "Mesmo slug" }), draftId: first.draftId });
    expect(same.status).toBe(202);
  });
});

describe("newsletter Discord job", () => {
  it("posts the full body and sources, then a control message with buttons under 100 chars bound to the revision", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const calls = ctx.discord.mock.calls;
    expect(calls).toHaveLength(2);
    const [bodyCall, controlCall] = calls.map(([, init]) => JSON.parse(String(init?.body)) as Record<string, unknown>);
    expect(String(bodyCall.content)).toContain("Segundo parágrafo privado");
    expect(String(bodyCall.content)).toContain("<https://exemplo.org/a>");
    expect(bodyCall.allowed_mentions).toEqual({ parse: [] });
    expect(bodyCall.enforce_nonce).toBe(true);
    expect(String(controlCall.content)).toContain("Nada foi publicado nem enviado");
    const buttons = (controlCall.components as { components: { custom_id: string; disabled?: boolean; label: string }[] }[])[0].components;
    expect(buttons.map((button) => parseCustomId(button.custom_id)?.action)).toEqual(["approve", "reject", "regenerate"]);
    expect(buttons.every((button) => button.custom_id.length < 100)).toBe(true);
    expect(buttons[0]).toMatchObject({ label: "Aprovar e publicar" });
    expect(buttons.some((button) => button.disabled)).toBe(false);
    expect(calls[0][0]).toBe(`https://discord.com/api/v10/channels/${IDS.channelId}/messages`);
    expect((calls[0][1]?.headers as Record<string, string>).authorization).toBe(`Bot ${BOT_TOKEN}`);
    expect(ctx.draftOf(saved.draftId)?.notification).toMatchObject({ revision: 1, channelId: IDS.channelId, messageId: saved.messageId });
  });

  it("splits text under 2000 chars per message", () => {
    expect(splitForDiscord("a".repeat(5000), 1900).every((chunk) => chunk.length <= 1900)).toBe(true);
  });

  it("posts up to two body chunks inline and moves anything longer to one attachment that keeps slug and ID visible", async () => {
    const slug = "edicao-de-teste";
    const chunkCount = (corpo: string) => splitForDiscord(formatReviewText({ slug, draftId: "ed_x", revision: 1, data: "2026-10-13", pilar: "Software", titulo: "T", corpo, fontes: [{ titulo: "Fonte oficial", href: "https://exemplo.org/a" }] } as unknown as EditionRevisionRecord)).length;
    const corpoFor = (target: number) => {
      for (let paragraphs = 1; paragraphs < 12; paragraphs += 1) {
        const body = Array.from({ length: paragraphs }, (_, index) => `${index} ${"palavra ".repeat(125)}`).join(PARA);
        const corpo = [OPENING, body].join(PARA);
        if (chunkCount(corpo) === target) return corpo;
      }
      throw new Error(`no body with ${target} chunks`);
    };

    const two = review();
    const inlineSaved = await queued(two, edition({ corpo: corpoFor(2) }));
    await two.run(two.jobs()[0]);
    expect(two.discord).toHaveBeenCalledTimes(3);
    expect(two.discord.mock.calls.every(([, init]) => typeof init?.body === "string")).toBe(true);
    expect(two.draftOf(inlineSaved.draftId)?.notification).toBeDefined();

    const three = review();
    const attachedSaved = await queued(three, edition({ corpo: corpoFor(3) }));
    await three.run(three.jobs()[0]);
    expect(three.discord).toHaveBeenCalledTimes(2);
    const form = three.discord.mock.calls[0][1]?.body;
    expect(form).toBeInstanceOf(FormData);
    const payload = JSON.parse(String((form as FormData).get("payload_json"))) as { content: string };
    expect(payload.content).toContain(`Slug: ${slug}`);
    expect(payload.content).toContain(`ID ${attachedSaved.draftId}`);
    expect(payload.content).toContain("revisão 1");
    const attached = (form as FormData).get("files[0]") as File;
    const attachedText = await attached.text();
    expect(attachedText).toContain(attachedSaved.draftId);
    expect(attachedText).toContain("<https://exemplo.org/a>");
    expect(three.draftOf(attachedSaved.draftId)?.notification).toBeDefined();
  });

  it("is idempotent once bound and posts nothing for a stale, rejected or missing revision", async () => {
    const ctx = review();
    const first = await posted(ctx);
    const job = ctx.jobs()[0];
    await ctx.run(job);
    expect(ctx.discord).toHaveBeenCalledTimes(2);
    await ctx.decide({ action: "reject", draftId: first.draftId, revision: 1, messageId: first.messageId });
    await ctx.run(job);
    expect(ctx.discord).toHaveBeenCalledTimes(2);
    await expect(ctx.run({ ...job, payload: { draftId: "ed_00000000-0000-4000-8000-000000000000", revision: "1" } })).rejects.toBeInstanceOf(PermanentFailure);
    await expect(ctx.run({ ...job, payload: { draftId: "nope", revision: "1" } })).rejects.toBeInstanceOf(PermanentFailure);
  });

  it("maps Discord failures to retry/permanent without leaking the token or the draft text", async () => {
    const ctx = review();
    await queued(ctx);
    const job = ctx.jobs()[0];
    const run = (config: Partial<NewsletterConfig>) =>
      createNewsletterHandler(ctx.store, { ...ctx.newsletter, ...config }, () => NOW)(job, { signal: new AbortController().signal });
    await expect(run({ fetch: async () => new Response("{}", { status: 429, headers: { "retry-after": "3" } }) })).rejects.toMatchObject({ retryAfterMs: 3000 });
    await expect(run({ fetch: async () => new Response("{}", { status: 429, headers: { "retry-after": "3" } }) })).rejects.toBeInstanceOf(RetryLater);
    await expect(run({ fetch: async () => new Response("", { status: 503 }) })).rejects.toThrow("discord_503");
    await expect(run({ fetch: async () => new Response("", { status: 403 }) })).rejects.toBeInstanceOf(PermanentFailure);
    await expect(run({ fetch: async () => Response.json({ id: "x" }) })).rejects.toBeInstanceOf(PermanentFailure);
    const error = await run({
      fetch: async () => {
        throw new Error(`connect failed ${BOT_TOKEN} Segundo parágrafo privado`);
      },
    }).then(
      () => new Error("resolved"),
      (caught: unknown) => caught as Error,
    );
    expect(error.message).toBe("discord_unreachable");
    expect(ctx.draftOf(job.payload.draftId)?.notification).toBeUndefined();
  });

  it.each([
    { paragraphs: 2, posts: 3 },
    { paragraphs: 4, posts: 2 },
  ])("a 429 on the second post retries the first with the same nonce ($posts posts per attempt at most)", async ({ paragraphs: count, posts }) => {
    const paragraphs = Array.from({ length: count }, (_, index) => `${index} ${"palavra ".repeat(125)}`).join(PARA);
    const ctx = review();
    await queued(ctx, edition({ corpo: [OPENING, paragraphs].join(PARA) }));
    const job = ctx.jobs()[0];
    let ids = 0;
    const sent: string[] = [];
    let limited = 1;
    const fetchFake = vi.fn<typeof fetch>(async (_url, init) => {
      const body = init?.body;
      const json = body instanceof FormData ? (JSON.parse(String(body.get("payload_json"))) as { nonce: string }) : (JSON.parse(String(body)) as { nonce: string });
      sent.push(json.nonce);
      if (sent.length === 2 && limited-- > 0) return new Response("{}", { status: 429, headers: { "retry-after": "2" } });
      return Response.json({ id: String(810000000000000000n + BigInt(++ids)) });
    });
    const handler = createNewsletterHandler(ctx.store, { ...ctx.newsletter, fetch: fetchFake }, () => NOW);
    await expect(handler(job, { signal: new AbortController().signal })).rejects.toMatchObject({ retryAfterMs: 2000 });
    const firstAttempt = [...sent];
    expect(firstAttempt).toHaveLength(2);
    expect(ctx.draftOf(job.payload.draftId)?.notification).toBeUndefined();
    sent.length = 0;
    await handler(job, { signal: new AbortController().signal });
    expect(sent).toHaveLength(posts);
    expect(sent.slice(0, 2)).toEqual(firstAttempt);
    expect(new Set(sent).size).toBe(sent.length);
    expect(ctx.draftOf(job.payload.draftId)?.notification).toBeDefined();
  });

  it("formats the review text with neutralised control characters and loads config only when complete", () => {
    const record = { slug: "s", draftId: "ed_x", revision: 1, data: "2026-10-13", pilar: "Software", titulo: "T", corpo: `a${String.fromCharCode(0x202e)}b${String.fromCharCode(7)}c`, fontes: [] } as unknown as EditionRevisionRecord;
    expect(formatReviewText(record)).toContain("abc");
    expect(controlComponents("ed_00000000-0000-4000-8000-000000000000", 1)[0].components).toHaveLength(3);
    const env = { DISCORD_NEWSLETTER_BOT_TOKEN: BOT_TOKEN, DISCORD_APPLICATION_ID: IDS.applicationId, DISCORD_GUILD_ID: IDS.guildId, DISCORD_NEWSLETTER_CHANNEL_ID: IDS.channelId, DISCORD_PUBLIC_KEY: PUBLIC_HEX, JOBS_TRIGGER_CONFIRMED: "true" };
    expect(loadNewsletterConfig(env)).toMatchObject({ channelId: IDS.channelId });
    expect(loadNewsletterConfig({ ...env, JOBS_TRIGGER_CONFIRMED: undefined })).toBeUndefined();
    expect(loadNewsletterConfig({ ...env, DISCORD_GUILD_ID: "x" })).toBeUndefined();
    expect(loadNewsletterConfig({ ...env, DISCORD_PUBLIC_KEY: undefined })).toBeUndefined();
    expect(loadNewsletterConfig({ ...env, DISCORD_PUBLIC_KEY: "abcd" })).toBeUndefined();
    expect(loadNewsletterConfig({ ...env, DISCORD_NEWSLETTER_BOT_TOKEN: "short" })).toBeUndefined();
    expect(() => buildCustomId("approve", `ed_${"0".repeat(8)}-0000-0000-0000-${"0".repeat(12)}`, 1)).not.toThrow();
  });
});

describe("newsletter decision endpoint", () => {
  it("rejects with a publish-scope signature only, and honours the configured application, guild and channel", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const body = { action: "reject", draftId: saved.draftId, revision: 1, messageId: saved.messageId };
    const draftKey = await handleNewsletterDecision(signedPost(DECISION_PATH, "draft", KEY_DRAFT, { ...IDS, ...body }), ctx.deps);
    expect(draftKey.status).toBe(401);
    for (const wrong of [{ applicationId: "999999999999999999" }, { guildId: "999999999999999999" }, { channelId: "999999999999999999" }]) {
      const response = await ctx.decide({ ...body, ...wrong });
      expect(response.status).toBe(403);
    }
    expect(ctx.draftOf(saved.draftId)?.status).toBe("pending");
    expect((await ctx.decide({ ...body, extra: 1 })).status).toBe(400);
    expect((await handleNewsletterDecision(signedPost(DECISION_PATH, "publish", KEY_PUBLISH, "x".repeat(3000)), ctx.deps)).status).toBe(400);
    for (const raw of ["null", "[]", "42"]) {
      expect((await handleNewsletterDecision(signedPost(DECISION_PATH, "publish", KEY_PUBLISH, raw), ctx.deps)).status).toBe(400);
    }
  });

  it("rejecting writes the final status once and a repeat is reported without a second write", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const body = { action: "reject", draftId: saved.draftId, revision: 1, messageId: saved.messageId };
    const first = await ctx.decide(body);
    expect(await first.json()).toEqual({ result: "rejected" });
    const decidedAt = ctx.draftOf(saved.draftId)?.decidedAt;
    expect(decidedAt).toBeDefined();
    const second = await ctx.decide(body);
    expect(await second.json()).toEqual({ result: "already_rejected" });
    expect(ctx.draftOf(saved.draftId)).toMatchObject({ status: "rejected", decidedAt });
    expect((await (await ctx.decide({ ...body, action: "regenerate" })).json())).toEqual({ result: "conflict" });
  });

  it("rejects a message ID that is not the bound control message, and an unknown draft", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const wrongMessage = await ctx.decide({ action: "reject", draftId: saved.draftId, revision: 1, messageId: "800000000000000999" });
    expect(wrongMessage.status).toBe(200);
    expect(await wrongMessage.json()).toEqual({ result: "mismatch" });
    const unknown = await ctx.decide({ action: "reject", draftId: "ed_00000000-0000-4000-8000-000000000000", revision: 1, messageId: saved.messageId });
    expect(unknown.status).toBe(200);
    expect(await unknown.json()).toEqual({ result: "not_found" });
    expect(ctx.draftOf(saved.draftId)?.status).toBe("pending");
  });

  it("approving records the decision and one durable publish job, and still publishes nothing by itself", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const response = await ctx.decide({ action: "approve", draftId: saved.draftId, revision: 1, messageId: saved.messageId });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: "approved" });
    expect(ctx.draftOf(saved.draftId)).toMatchObject({ status: "approved", approvedRevision: 1 });
    expect(ctx.jobs().filter((job) => job.kind === JOB_KINDS.newsletterPublish)).toHaveLength(1);
    expect(ctx.store.dump(COLLECTIONS.editionsPublic)).toEqual({});
    expect(ctx.jobs().some((job) => job.kind === JOB_KINDS.newsletterBroadcast)).toBe(false);
  });

  it("verifies the original Discord interaction on the server: absent, forged, stale or mismatched proofs change nothing", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const body = { action: "approve", draftId: saved.draftId, revision: 1, messageId: saved.messageId };
    const fields = { ...IDS, ...body };
    const other = generateKeyPairSync("ed25519");
    const valid = discordProof(fields);
    const attempts: (Record<string, unknown> | false)[] = [
      false,
      discordProof(fields, { signWith: other.privateKey }),
      { ...valid, body: valid.body.replace(saved.messageId, "800000000000000999") },
      discordProof(fields, { at: NOW.getTime() - 3_600_000 }),
      discordProof({ ...fields, action: "reject" }),
      discordProof({ ...fields, revision: 2 }),
      discordProof({ ...fields, messageId: "800000000000000999" }),
      discordProof({ ...fields, channelId: "999999999999999999" }),
      discordProof(fields, { interaction: { type: 2 } }),
      discordProof(fields, { interaction: { data: { custom_id: buildCustomId("approve", saved.draftId, 1), component_type: 3 } } }),
      { ...valid, signature: "0".repeat(128) },
    ];
    const before = JSON.stringify(ctx.store.dump(COLLECTIONS.editionDrafts));
    for (const proof of attempts) {
      const response = await ctx.decide(body, { proof });
      expect(response.status).toBe(proof === false ? 400 : 403);
    }
    expect(JSON.stringify(ctx.store.dump(COLLECTIONS.editionDrafts))).toBe(before);
    expect(ctx.jobs().filter((job) => job.kind === JOB_KINDS.newsletterPublish)).toHaveLength(0);
  });

  it("a signed interaction decides at most once: the same proof answers 409 and creates no second job", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const body = { action: "approve", draftId: saved.draftId, revision: 1, messageId: saved.messageId };
    const proof = discordProof({ ...IDS, ...body });
    expect(await (await ctx.decide(body, { proof })).json()).toEqual({ result: "approved" });
    const replay = await ctx.decide(body, { proof });
    expect(replay.status).toBe(409);
    expect(await replay.json()).toEqual({ code: "proof_replay" });
    expect(await (await ctx.decide(body)).json()).toEqual({ result: "already_approved" });
    expect(ctx.jobs().filter((job) => job.kind === JOB_KINDS.newsletterPublish)).toHaveLength(1);
  });

  it("concurrent approvals have exactly one winner and one publish job", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const body = { action: "approve", draftId: saved.draftId, revision: 1, messageId: saved.messageId };
    const results = await Promise.all([1, 2, 3, 4].map(async () => ((await (await ctx.decide(body)).json()) as { result: string }).result));
    expect(results.filter((result) => result === "approved")).toHaveLength(1);
    expect(results.filter((result) => result === "already_approved")).toHaveLength(3);
    expect(ctx.jobs().filter((job) => job.kind === JOB_KINDS.newsletterPublish)).toHaveLength(1);
  });

  it("approval after another decision, on a stale revision or on another message is refused without a job", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const target = { draftId: saved.draftId, revision: 1, messageId: saved.messageId };
    expect(await (await ctx.decide({ action: "approve", ...target, messageId: "800000000000000999" })).json()).toEqual({ result: "mismatch" });
    expect(await (await ctx.decide({ action: "approve", ...target, revision: 2 })).json()).toEqual({ result: "stale" });
    await ctx.decide({ action: "reject", ...target });
    expect(await (await ctx.decide({ action: "approve", ...target })).json()).toEqual({ result: "conflict" });
    expect(ctx.jobs().some((job) => job.kind === JOB_KINDS.newsletterPublish)).toBe(false);
  });

  it("refuses approval when the slug no longer belongs to the draft", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    await ctx.store.transaction(async (tx) => tx.set(COLLECTIONS.slugReservations, "edicao-de-teste", { slug: "edicao-de-teste", draftId: "ed_11111111-1111-4111-8111-111111111111" }));
    const response = await ctx.decide({ action: "approve", draftId: saved.draftId, revision: 1, messageId: saved.messageId });
    expect(await response.json()).toEqual({ result: "slug_unavailable" });
    expect(ctx.draftOf(saved.draftId)?.status).toBe("pending");
    expect(ctx.jobs().some((job) => job.kind === JOB_KINDS.newsletterPublish)).toBe(false);
  });

  it("concurrent clicks on the same revision have exactly one winner", async () => {
    const ctx = review();
    const saved = await posted(ctx);
    const results = await Promise.all(
      ["reject", "regenerate", "reject"].map(async (action) => (await (await ctx.decide({ action, draftId: saved.draftId, revision: 1, messageId: saved.messageId })).json()) as { result: string }),
    );
    const winners = results.filter((item) => item.result === "rejected" || item.result === "regeneration_requested");
    expect(winners).toHaveLength(1);
    expect(["rejected", "regeneration_requested"]).toContain(ctx.draftOf(saved.draftId)?.status);
  });

  it("allows at most three regeneration requests per edition per day (America/Sao_Paulo)", async () => {
    const ctx = review();
    let current = await posted(ctx);
    for (let round = 1; round <= 3; round += 1) {
      const ask = await ctx.decide({ action: "regenerate", draftId: current.draftId, revision: current.revision, messageId: current.messageId });
      expect(await ask.json()).toEqual({ result: "regeneration_requested" });
      const again = await ctx.postDraft({ ...edition({ titulo: `Versão ${round + 1}` }), draftId: current.draftId });
      const saved = (await again.json()) as { revision: number };
      const job = ctx.jobs().find((candidate) => candidate.payload.revision === String(saved.revision)) as JobRecord;
      await ctx.run(job);
      current = { ...current, revision: saved.revision, messageId: (ctx.draftOf(current.draftId)?.notification as { messageId: string }).messageId };
    }
    const blocked = await ctx.decide({ action: "regenerate", draftId: current.draftId, revision: current.revision, messageId: current.messageId });
    expect(blocked.status).toBe(200);
    expect(await blocked.json()).toEqual({ result: "regeneration_limit" });
    expect(ctx.draftOf(current.draftId)?.status).toBe("pending");
  });

  it("works against a store built from the memory fake only (no Firestore, no network)", async () => {
    expect(createMemoryStore()).toBeDefined();
  });
});
