import { generateKeyPairSync, sign as nodeSign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleNewsletterDecision } from "../../../src/lib/server/http";
import { DECISION_PATH, buildCustomId } from "../../../src/lib/server/newsletter-protocol";
import { handleInteraction, signPublishRequest, verifyDiscordSignature, type Env } from "../../../workers/newsletter-discord/index";
import { setup } from "../server/helpers";

const IDS = { applicationId: "111111111111111111", guildId: "222222222222222222", channelId: "333333333333333333" };
const MESSAGE_ID = "800000000000000001";
const DRAFT_ID = "ed_00000000-0000-4000-8000-000000000000";
const KEY_PUBLISH = "p".repeat(40);

const pair = generateKeyPairSync("ed25519");
const publicHex = (pair.publicKey.export({ format: "der", type: "spki" }) as Buffer).subarray(-32).toString("hex");

const env: Env = {
  DISCORD_PUBLIC_KEY: publicHex,
  DISCORD_APPLICATION_ID: IDS.applicationId,
  DISCORD_GUILD_ID: IDS.guildId,
  DISCORD_NEWSLETTER_CHANNEL_ID: IDS.channelId,
  SITE_ORIGIN: "https://site.example",
  INTERNAL_KEY_PUBLISH: KEY_PUBLISH,
};

const button = (customId: unknown, overrides: Record<string, unknown> = {}) => ({
  type: 3,
  application_id: IDS.applicationId,
  guild_id: IDS.guildId,
  channel_id: IDS.channelId,
  message: { id: MESSAGE_ID },
  data: { custom_id: customId, component_type: 2 },
  ...overrides,
});

function discordRequest(payload: unknown, options: { raw?: string; timestamp?: string; signWith?: typeof pair.privateKey; method?: string } = {}) {
  const raw = options.raw ?? JSON.stringify(payload);
  const timestamp = options.timestamp ?? String(Math.floor(Date.now() / 1000));
  const signature = nodeSign(null, Buffer.from(timestamp + raw), options.signWith ?? pair.privateKey).toString("hex");
  return new Request("https://worker.example/", {
    method: options.method ?? "POST",
    body: options.method === "GET" ? undefined : raw,
    headers: { "x-signature-ed25519": signature, "x-signature-timestamp": timestamp },
  });
}

const answer = (result: unknown) => async () => Response.json({ result });

afterEach(() => vi.useRealTimers());

describe("Discord signature", () => {
  it("accepts only a valid Ed25519 signature over timestamp + raw body", async () => {
    const timestamp = "1760000000";
    const body = Buffer.from('{"type":1}');
    const signature = nodeSign(null, Buffer.concat([Buffer.from(timestamp), body]), pair.privateKey).toString("hex");
    expect(await verifyDiscordSignature(publicHex, signature, timestamp, body)).toBe(true);
    expect(await verifyDiscordSignature(publicHex, signature, "1760000001", body)).toBe(false);
    expect(await verifyDiscordSignature(publicHex, signature, timestamp, Buffer.from('{"type":1} '))).toBe(false);
    expect(await verifyDiscordSignature(publicHex, "zz", timestamp, body)).toBe(false);
    expect(await verifyDiscordSignature("abcd", signature, timestamp, body)).toBe(false);
  });

  it("answers 401 before parsing when the signature, key or timestamp is wrong, and 405 for other methods", async () => {
    const other = generateKeyPairSync("ed25519");
    const fetcher = vi.fn<typeof fetch>();
    expect((await handleInteraction(discordRequest({ type: 1 }, { signWith: other.privateKey }), env, undefined, fetcher)).status).toBe(401);
    expect((await handleInteraction(discordRequest({ type: 1 }, { timestamp: String(Math.floor(Date.now() / 1000) - 3600) }), env, undefined, fetcher)).status).toBe(401);
    expect((await handleInteraction(discordRequest({ type: 1 }, { timestamp: "abc" }), env, undefined, fetcher)).status).toBe(401);
    expect((await handleInteraction(new Request("https://worker.example/", { method: "POST", body: "{}" }), env, undefined, fetcher)).status).toBe(401);
    expect((await handleInteraction(discordRequest({}, { method: "GET" }), env, undefined, fetcher)).status).toBe(405);
    // signed but not JSON: authenticated first, then rejected as malformed
    expect((await handleInteraction(discordRequest(undefined, { raw: "not-json" }), env, undefined, fetcher)).status).toBe(400);
    expect((await handleInteraction(discordRequest(undefined, { raw: "x".repeat(17 * 1024) }), env, undefined, fetcher)).status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("answers 400, without any call, to a signed body that is JSON but not an object (null, array, number, string)", async () => {
    const fetcher = vi.fn<typeof fetch>();
    for (const raw of ["null", "[]", "42", '"x"', "true"]) {
      expect((await handleInteraction(discordRequest(undefined, { raw }), env, undefined, fetcher)).status).toBe(400);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("answers PING with PONG", async () => {
    const response = await handleInteraction(discordRequest({ type: 1 }), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ type: 1 });
  });
});

describe("button validation before any call to the site", () => {
  const cases: [string, unknown][] = [
    ["wrong application", button(buildCustomId("reject", DRAFT_ID, 1), { application_id: "999999999999999999" })],
    ["wrong guild", button(buildCustomId("reject", DRAFT_ID, 1), { guild_id: "999999999999999999" })],
    ["wrong channel", button(buildCustomId("reject", DRAFT_ID, 1), { channel_id: "999999999999999999" })],
    ["direct message (no guild)", button(buildCustomId("reject", DRAFT_ID, 1), { guild_id: undefined })],
    ["no message", button(buildCustomId("reject", DRAFT_ID, 1), { message: undefined })],
    ["non-snowflake message", button(buildCustomId("reject", DRAFT_ID, 1), { message: { id: "abc" } })],
    ["unknown custom_id", button("nl:x:foo.1")],
    ["custom_id of 100 chars", button(`nl:r:${DRAFT_ID}.1`.padEnd(100, "0"))],
    ["non-string custom_id", button(42)],
  ];
  it.each(cases)("%s => private refusal and no request to the site", async (_name, payload) => {
    const fetcher = vi.fn<typeof fetch>();
    const response = await handleInteraction(discordRequest(payload), env, undefined, fetcher);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ type: 4, data: { flags: 64, content: "Estes botões não são válidos neste canal." } });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refuses unsupported interaction types (slash command, select menu)", async () => {
    const fetcher = vi.fn<typeof fetch>();
    for (const payload of [{ type: 2, data: { name: "x" } }, button("nl:r:x", { data: { custom_id: "nl:r:x", component_type: 3 } })]) {
      const response = await handleInteraction(discordRequest(payload), env, undefined, fetcher);
      expect(await response.json()).toMatchObject({ type: 4, data: { flags: 64 } });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("decision call", () => {
  it("sends a publish-scope HMAC the site accepts, with the exact ids the interaction carried", async () => {
    const base = setup();
    const deps = { ...base.deps, now: () => new Date(), newsletter: { botToken: "b".repeat(30), ...IDS }, internalKeys: { jobs: ["j".repeat(32)], publish: [KEY_PUBLISH] } };
    const seen: { url: string; body: unknown }[] = [];
    const bridge = vi.fn<typeof fetch>(async (input, init) => {
      seen.push({ url: String(input), body: JSON.parse(new TextDecoder().decode(init?.body as Uint8Array)) });
      return handleNewsletterDecision(new Request(`http://localhost${DECISION_PATH}`, { method: "POST", headers: init?.headers, body: init?.body }), deps);
    });
    const response = await handleInteraction(discordRequest(button(buildCustomId("reject", DRAFT_ID, 3))), env, undefined, bridge);
    expect(seen[0].url).toBe(`https://site.example${DECISION_PATH}`);
    expect(seen[0].body).toEqual({ action: "reject", draftId: DRAFT_ID, revision: 3, ...IDS, messageId: MESSAGE_ID });
    // the site accepted the signature (the draft does not exist => not_found, mapped to a private message)
    expect(await response.json()).toMatchObject({ type: 4, data: { content: "Edição não encontrada." } });
  });

  it("signPublishRequest matches the server canonical string and differs per scope or body", async () => {
    const parts = { method: "post", pathname: DECISION_PATH, timestamp: 1760000000000, nonce: "n".repeat(20), body: new TextEncoder().encode("{}") };
    const { signInternalRequest } = await import("../../../src/lib/server/internal-auth");
    expect(await signPublishRequest(KEY_PUBLISH, parts)).toBe(signInternalRequest(KEY_PUBLISH, { scope: "publish", ...parts }));
    expect(await signPublishRequest(KEY_PUBLISH, parts)).not.toBe(signInternalRequest(KEY_PUBLISH, { scope: "draft", ...parts }));
  });

  it("closes the control message (type 7, no buttons) when the revision is finished", async () => {
    for (const result of ["rejected", "already_rejected", "regeneration_requested", "stale"]) {
      const response = await handleInteraction(discordRequest(button(buildCustomId("reject", DRAFT_ID, 1))), env, undefined, answer(result));
      const json = (await response.json()) as { type: number; data: { components: unknown[]; content: string; allowed_mentions: unknown } };
      expect(json.type).toBe(7);
      expect(json.data.components).toEqual([]);
      expect(json.data.allowed_mentions).toEqual({ parse: [] });
      expect(json.data.content).toMatch(/Nada foi publicado nem enviado|botões não valem/);
    }
  });

  it("keeps slug, ID and revision visible when the control message is replaced", async () => {
    const content = `Revisão 2 da edição edicao-de-teste (ID ${DRAFT_ID}).
Nada foi publicado nem enviado.`;
    const closed = async (message: Record<string, unknown> | undefined, custom = buildCustomId("regenerate", DRAFT_ID, 2)) => {
      const response = await handleInteraction(discordRequest(button(custom, { message })), env, undefined, answer("regeneration_requested"));
      return ((await response.json()) as { type: number; data: { content: string } }).data.content;
    };
    const full = await closed({ id: MESSAGE_ID, content });
    expect(full).toContain("Nova versão solicitada");
    expect(full).toContain(`Edição edicao-de-teste · ID ${DRAFT_ID} · revisão 2`);
    // without trusted slug text the ID and revision still stay
    expect(await closed({ id: MESSAGE_ID })).toContain(`Edição ID ${DRAFT_ID} · revisão 2`);
    expect(await closed({ id: MESSAGE_ID, content: content.replace(DRAFT_ID, "ed_11111111-1111-4111-8111-111111111111") })).toContain(`Edição ID ${DRAFT_ID} · revisão 2`);
    expect(await closed({ id: MESSAGE_ID, content: { not: "text" } })).toContain(`Edição ID ${DRAFT_ID} · revisão 2`);
  });

  it("keeps the buttons and answers privately for approval_unavailable, mismatch and conflict", async () => {
    for (const result of ["approval_unavailable", "mismatch", "conflict", "regeneration_limit", "not_found"]) {
      const response = await handleInteraction(discordRequest(button(buildCustomId("approve", DRAFT_ID, 1))), env, undefined, answer(result));
      expect(await response.json()).toMatchObject({ type: 4, data: { flags: 64 } });
    }
    const approval = await handleInteraction(discordRequest(button(buildCustomId("approve", DRAFT_ID, 1))), env, undefined, answer("approval_unavailable"));
    expect(JSON.stringify(await approval.json())).toContain("Nada foi publicado nem enviado");
  });

  it("answers within the 3 s ACK window with an honest 'uncertain' message when the site hangs, fails or answers nonsense", async () => {
    const uncertain = { type: 4, data: { flags: 64, content: expect.stringContaining("Não foi possível confirmar") } };
    const hang = (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
    const started = Date.now();
    const slow = await handleInteraction(discordRequest(button(buildCustomId("reject", DRAFT_ID, 1))), env, undefined, hang as typeof fetch);
    expect(Date.now() - started).toBeLessThan(3000);
    expect(await slow.json()).toMatchObject(uncertain);
    for (const fetcher of [
      async () => {
        throw new Error("boom");
      },
      async () => new Response("<html>", { status: 502 }),
      async () => Response.json({ result: "made_up" }),
      async () => Response.json({ result: { nested: true } }),
      async () => Response.json({ result: "rejected" }, { status: 500 }),
      async () => Response.json({ result: "rejected" }, { status: 403 }),
      async () => Response.json({ result: "not_found" }, { status: 404 }),
      async () => Response.json({ result: "conflict" }, { status: 409 }),
      async () => Response.json({ result: "regeneration_requested" }, { status: 302 }),
    ]) {
      const response = await handleInteraction(discordRequest(button(buildCustomId("reject", DRAFT_ID, 1))), env, undefined, fetcher as typeof fetch);
      expect(await response.json()).toMatchObject(uncertain);
    }
  });
});

describe("regeneration notice (waitUntil is best effort, not a queue)", () => {
  const withFire: Env = { ...env, ROUTINE_FIRE_URL: "https://routine.example/fire", ROUTINE_FIRE_TOKEN: "t".repeat(24) };

  it("fires the Routine only after regeneration_requested and carries no secret in the text", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      if (String(input).startsWith("https://routine.example")) {
        calls.push({ url: String(input), init });
        return new Response(null, { status: 200 });
      }
      return Response.json({ result: "regeneration_requested" });
    });
    const pending: Promise<unknown>[] = [];
    const context = { waitUntil: (promise: Promise<unknown>) => void pending.push(promise) };
    await handleInteraction(discordRequest(button(buildCustomId("regenerate", DRAFT_ID, 2))), withFire, context, fetcher);
    await Promise.all(pending);
    expect(calls).toHaveLength(1);
    expect(String(calls[0].init?.body)).toContain(DRAFT_ID);
    expect(String(calls[0].init?.body)).not.toContain(KEY_PUBLISH);
  });

  it("does nothing extra for reject, for other results, without configuration, and survives a failing notice", async () => {
    const pending: Promise<unknown>[] = [];
    const context = { waitUntil: (promise: Promise<unknown>) => void pending.push(promise) };
    await handleInteraction(discordRequest(button(buildCustomId("reject", DRAFT_ID, 1))), withFire, context, answer("rejected"));
    await handleInteraction(discordRequest(button(buildCustomId("regenerate", DRAFT_ID, 1))), withFire, context, answer("regeneration_limit"));
    await handleInteraction(discordRequest(button(buildCustomId("regenerate", DRAFT_ID, 1))), env, context, answer("regeneration_requested"));
    expect(pending).toHaveLength(0);
    const failing = vi.fn<typeof fetch>(async (input) => {
      if (String(input).startsWith("https://routine.example")) throw new Error("down");
      return Response.json({ result: "regeneration_requested" });
    });
    const response = await handleInteraction(discordRequest(button(buildCustomId("regenerate", DRAFT_ID, 1))), withFire, context, failing);
    await expect(Promise.all(pending)).resolves.toBeDefined();
    expect(await response.json()).toMatchObject({ type: 7 });
  });
});
