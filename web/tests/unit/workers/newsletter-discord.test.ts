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
const INTERACTION_TOKEN = "fake/interaction+token";

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
  token: INTERACTION_TOKEN,
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

function harness(decision: typeof fetch, config = env, reply: typeof fetch = async () => new Response(null, { status: 204 })) {
  const pending: Promise<unknown>[] = [];
  const replies: { url: string; init?: RequestInit; body: Record<string, unknown> }[] = [];
  const context = { waitUntil: (promise: Promise<unknown>) => void pending.push(promise) };
  const fetcher = vi.fn<typeof fetch>(async (input, init) => {
    if (String(input).startsWith("https://discord.com/")) {
      replies.push({ url: String(input), init, body: JSON.parse(String(init?.body)) });
      return reply(input, init);
    }
    return decision(input, init);
  });
  const settle = async () => {
    for (let index = 0; index < pending.length; index += 1) await pending[index];
  };
  const ack = (payload: unknown) => handleInteraction(discordRequest(payload), config, context, fetcher);
  const run = async (payload: unknown) => {
    const response = await ack(payload);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ type: 6 });
    await settle();
    expect(replies).toHaveLength(1);
    return replies[0];
  };
  return { pending, replies, context, fetcher, settle, ack, run };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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
  it("uses the Workers-supported redirect mode and leaves redirects unconfirmed", async () => {
    const decision = vi.fn<typeof fetch>(async (_input, init) => {
      if (init?.redirect !== "manual") throw new TypeError("Workers supports follow or manual, not error");
      return Response.json({ result: "regeneration_requested" });
    });
    const ready = harness(decision);
    const closed = await ready.run(button(buildCustomId("regenerate", DRAFT_ID, 1)));
    expect(closed.init?.method).toBe("PATCH");
    expect(closed.body.components).toEqual([]);
    expect(decision).toHaveBeenCalledTimes(1);
    expect(ready.fetcher.mock.calls.every(([, init]) => init?.redirect === "manual")).toBe(true);

    const redirect = harness(async () => new Response(null, { status: 302, headers: { location: "https://other.example" } }));
    const uncertain = await redirect.run(button(buildCustomId("regenerate", DRAFT_ID, 1)));
    expect(uncertain.init?.method).toBe("POST");
    expect(uncertain.body.content).toContain("Não foi possível confirmar");
    expect(redirect.fetcher).toHaveBeenCalledTimes(2);
    expect(redirect.fetcher.mock.calls.map(([url]) => String(url))).not.toContain("https://other.example");
  });

  it("sends a publish-scope HMAC the site accepts, with the exact ids the interaction carried", async () => {
    const base = setup();
    const deps = { ...base.deps, now: () => new Date(), newsletter: { botToken: "b".repeat(30), ...IDS, publicKey: publicHex }, internalKeys: { jobs: ["j".repeat(32)], publish: [KEY_PUBLISH] } };
    const seen: { url: string; body: unknown }[] = [];
    const bridge = vi.fn<typeof fetch>(async (input, init) => {
      seen.push({ url: String(input), body: JSON.parse(new TextDecoder().decode(init?.body as Uint8Array)) });
      return handleNewsletterDecision(new Request(`http://localhost${DECISION_PATH}`, { method: "POST", headers: init?.headers, body: init?.body }), deps);
    });
    const worker = harness(bridge);
    const response = await worker.run(button(buildCustomId("reject", DRAFT_ID, 3)));
    expect(seen[0].url).toBe(`https://site.example${DECISION_PATH}`);
    const { proof, ...target } = seen[0].body as { proof: { timestamp: string; signature: string; body: string } };
    expect(target).toEqual({ action: "reject", draftId: DRAFT_ID, revision: 3, ...IDS, messageId: MESSAGE_ID });
    // The original interaction travels verbatim so the site can re-verify the Ed25519 signature itself.
    expect(proof.body).toBe(JSON.stringify(button(buildCustomId("reject", DRAFT_ID, 3))));
    expect(proof.timestamp).toMatch(/^[0-9]{10}$/);
    expect(proof.signature).toMatch(/^[0-9a-f]{128}$/);
    expect(response.init?.method).toBe("POST");
    expect(response.body.content).toContain("Edição não encontrada.");
    expect(bridge).toHaveBeenCalledTimes(1);
    const decisionHeaders = new Headers(worker.fetcher.mock.calls[0][1]?.headers);
    expect(decisionHeaders.get("x-rt-signature")).toBeTruthy();
    const replyHeaders = new Headers(response.init?.headers);
    expect([...replyHeaders.keys()]).toEqual(["content-type"]);
    expect(JSON.stringify(response.body)).not.toContain(INTERACTION_TOKEN);
    expect(JSON.stringify(response.body)).not.toContain(KEY_PUBLISH);
  });

  it("signPublishRequest matches the server canonical string and differs per scope or body", async () => {
    const parts = { method: "post", pathname: DECISION_PATH, timestamp: 1760000000000, nonce: "n".repeat(20), body: new TextEncoder().encode("{}") };
    const { signInternalRequest } = await import("../../../src/lib/server/internal-auth");
    expect(await signPublishRequest(KEY_PUBLISH, parts)).toBe(signInternalRequest(KEY_PUBLISH, { scope: "publish", ...parts }));
    expect(await signPublishRequest(KEY_PUBLISH, parts)).not.toBe(signInternalRequest(KEY_PUBLISH, { scope: "draft", ...parts }));
    expect(await signPublishRequest(KEY_PUBLISH, parts)).not.toBe(await signPublishRequest(KEY_PUBLISH, { ...parts, body: new TextEncoder().encode("[]") }));
  });

  it("closes the control message by PATCH without buttons when the revision is finished", async () => {
    for (const result of ["rejected", "already_rejected", "regeneration_requested", "already_regenerating", "stale", "approved", "already_approved"]) {
      const response = await harness(answer(result)).run(button(buildCustomId("reject", DRAFT_ID, 1)));
      expect(response.init?.method).toBe("PATCH");
      expect(response.url).toBe(`https://discord.com/api/v10/webhooks/${IDS.applicationId}/${encodeURIComponent(INTERACTION_TOKEN)}/messages/@original`);
      expect(response.body.components).toEqual([]);
      expect(response.body.allowed_mentions).toEqual({ parse: [] });
      expect(response.body.content).toMatch(/Nada foi publicado nem enviado|botões não valem|aprovad/);
    }
  });

  it("keeps slug, ID and revision visible when the control message is replaced", async () => {
    const content = `Revisão 2 da edição edicao-de-teste (ID ${DRAFT_ID}).\nNada foi publicado nem enviado.`;
    const closed = async (message: Record<string, unknown> | undefined, custom = buildCustomId("regenerate", DRAFT_ID, 2)) =>
      (await harness(answer("regeneration_requested")).run(button(custom, { message }))).body.content;
    const full = await closed({ id: MESSAGE_ID, content });
    expect(full).toContain("Nova versão solicitada");
    expect(full).toContain(`Edição edicao-de-teste · ID ${DRAFT_ID} · revisão 2`);
    // Without trusted slug text the ID and revision still stay.
    expect(await closed({ id: MESSAGE_ID })).toContain(`Edição ID ${DRAFT_ID} · revisão 2`);
    expect(await closed({ id: MESSAGE_ID, content: content.replace(DRAFT_ID, "ed_11111111-1111-4111-8111-111111111111") })).toContain(`Edição ID ${DRAFT_ID} · revisão 2`);
    expect(await closed({ id: MESSAGE_ID, content: { not: "text" } })).toContain(`Edição ID ${DRAFT_ID} · revisão 2`);
  });

  it("keeps the buttons and answers privately for slug_unavailable, mismatch and conflict", async () => {
    for (const result of ["slug_unavailable", "mismatch", "conflict", "regeneration_limit", "not_found"]) {
      const response = await harness(answer(result)).run(button(buildCustomId("approve", DRAFT_ID, 1)));
      expect(response.init?.method).toBe("POST");
      expect(response.url).toBe(`https://discord.com/api/v10/webhooks/${IDS.applicationId}/${encodeURIComponent(INTERACTION_TOKEN)}`);
      expect(response.body).toMatchObject({ flags: 64, allowed_mentions: { parse: [] } });
      expect(response.body).not.toHaveProperty("components");
    }
    const approval = await harness(answer("slug_unavailable")).run(button(buildCustomId("approve", DRAFT_ID, 1)));
    expect(approval.body.content).toContain("Nada foi publicado nem enviado");
    // A removed result is no longer understood: it becomes the honest uncertain message.
    const removed = await harness(answer("approval_unavailable")).run(button(buildCustomId("approve", DRAFT_ID, 1)));
    expect(removed.body.content).toContain("Não foi possível confirmar");
  });

  it("ACKs before the 3 s window while a slow decision stays pending, then reports uncertainty at the 20 s timeout", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.spyOn(AbortSignal, "timeout").mockImplementation((delay) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), delay);
      return controller.signal;
    });
    let started!: () => void;
    const decisionStarted = new Promise<void>((resolve) => { started = resolve; });
    const decision = vi.fn<typeof fetch>(async (_input, init) => {
      started();
      return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
    });
    const worker = harness(decision);
    const before = Date.now();
    const response = await worker.ack(button(buildCustomId("reject", DRAFT_ID, 1)));
    expect(await response.json()).toEqual({ type: 6 });
    expect(Date.now() - before).toBeLessThan(3000);
    await decisionStarted;
    await vi.advanceTimersByTimeAsync(3001);
    expect(worker.replies).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(16_999);
    await worker.settle();
    expect(decision).toHaveBeenCalledTimes(1);
    expect(worker.replies).toHaveLength(1);
    expect(worker.replies[0].body).toMatchObject({ flags: 64, content: expect.stringContaining("Não foi possível confirmar") });
    expect(worker.replies[0].body.content).toContain(`ID ${DRAFT_ID} · revisão 1`);
  });

  it("reports an honest uncertain private follow-up when the site fails or answers nonsense", async () => {
    for (const decision of [
      async () => { throw new Error("boom"); },
      async () => new Response("<html>", { status: 502 }),
      async () => Response.json({ result: "made_up" }),
      async () => Response.json({ result: { nested: true } }),
      async () => Response.json({ result: "rejected" }, { status: 500 }),
      async () => Response.json({ result: "rejected" }, { status: 403 }),
      async () => Response.json({ result: "not_found" }, { status: 404 }),
      async () => Response.json({ result: "conflict" }, { status: 409 }),
      async () => Response.json({ result: "regeneration_requested" }, { status: 302 }),
    ]) {
      const response = await harness(decision).run(button(buildCustomId("reject", DRAFT_ID, 1)));
      expect(response.body).toMatchObject({ flags: 64, content: expect.stringContaining("Não foi possível confirmar") });
      expect(response.init?.method).toBe("POST");
      expect(response.body).not.toHaveProperty("components");
    }
  });

  it("requires waitUntil and a bounded interaction token without deciding synchronously", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const valid = button(buildCustomId("reject", DRAFT_ID, 1));
    expect((await handleInteraction(discordRequest(valid), env, undefined, fetcher)).status).toBe(503);
    for (const token of [undefined, "", 42, "x".repeat(2049)]) {
      const worker = harness(fetcher);
      expect((await worker.ack({ ...valid, token })).status).toBe(400);
      expect(worker.pending).toHaveLength(0);
    }
    expect(fetcher).not.toHaveBeenCalled();
    for (const token of ["x", "x".repeat(2048)]) {
      const worker = harness(answer("rejected"));
      expect((await worker.run({ ...valid, token })).init?.method).toBe("PATCH");
    }
  });

  it("does not retry a decision or expose tokens when the Discord reply throws or redirects", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const result of ["rejected", "not_found"]) {
      for (const reply of [
        async () => { throw new Error(`network ${INTERACTION_TOKEN} ${KEY_PUBLISH}`); },
        async () => new Response(null, { status: 302, headers: { location: "https://other.example" } }),
        async () => new Response(null, { status: 500 }),
      ]) {
        const decision = vi.fn<typeof fetch>(answer(result));
        const worker = harness(decision, env, reply);
        await worker.run(button(buildCustomId("reject", DRAFT_ID, 1)));
        expect(decision).toHaveBeenCalledTimes(1);
        expect(worker.fetcher).toHaveBeenCalledTimes(2);
        expect(worker.fetcher.mock.calls.every(([, init]) => init?.redirect === "manual")).toBe(true);
      }
    }
    const logged = JSON.stringify(warning.mock.calls);
    expect(logged).toContain("newsletter_discord_reply_failed");
    expect(logged).not.toContain(INTERACTION_TOKEN);
    expect(logged).not.toContain(encodeURIComponent(INTERACTION_TOKEN));
    expect(logged).not.toContain(KEY_PUBLISH);
    expect(logged).not.toContain("network");
  });
});

describe("regeneration notice (waitUntil is best effort, not a queue)", () => {
  const ROUTINE_URL = "https://api.anthropic.com/v1/claude_code/routines/trig_test123/fire";
  const withFire: Env = { ...env, ROUTINE_FIRE_URL: ROUTINE_URL, ROUTINE_FIRE_TOKEN: "t".repeat(24) };
  const SLUG = "newsletter-2026-10-17";
  const regeneration = (revision = 1, content: unknown = `Revisão ${revision} da edição ${SLUG} (ID ${DRAFT_ID}).`) =>
    button(buildCustomId("regenerate", DRAFT_ID, revision), { message: { id: MESSAGE_ID, content } });
  const fired = () => Response.json({ type: "routine_fire", claude_code_session_id: "session_test123", claude_code_session_url: "https://claude.ai/code/session_test123" });

  it.each([
    ["11111111-2222-4333-8444-555555555555", "https://claude.ai/code/different-session-reference"],
    ["01K7SYNTHETICULIDEXAMPLE0000", "https://claude.ai/code/another-reference?view=session#details"],
    ["cse_synthetic_example", "https://claude.ai/code/link-identity-differs"],
    ["opaque-synthetic-id", "https://claude.ai:443/code/independent-link"],
  ])("accepts an opaque session ID and independently valid Claude session URL", async (sessionId, sessionUrl) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const decision = vi.fn<typeof fetch>(async (input) => String(input) === ROUTINE_URL
      ? Response.json({ type: "routine_fire", claude_code_session_id: sessionId, claude_code_session_url: sessionUrl })
      : Response.json({ result: "regeneration_requested" }));
    const worker = harness(decision, withFire);
    const reply = await worker.run(regeneration());
    expect(reply.body.content).toContain("Routine iniciada; execução e revisão pendentes");
    expect(reply.body.content).not.toContain(sessionId);
    expect(reply.body.content).not.toContain(sessionUrl);
    expect(warning).not.toHaveBeenCalled();
    expect(decision).toHaveBeenCalledTimes(2);
  });

  it.each([
    { claude_code_session_id: [] }, { claude_code_session_id: ["opaque-id"] },
    { claude_code_session_id: 123 }, { claude_code_session_id: null },
    { claude_code_session_id: {} }, { claude_code_session_id: "" },
    { claude_code_session_id: " " }, { claude_code_session_id: " opaque-id" },
    { claude_code_session_id: "opaque-id " }, { claude_code_session_id: "opaque\u0000id" },
    { claude_code_session_id: "opaque\u007fid" }, { claude_code_session_id: "opaque\u0085id" },
    { claude_code_session_url: [] }, { claude_code_session_url: ["https://claude.ai/code/test"] },
    { claude_code_session_url: 123 }, { claude_code_session_url: null },
    { claude_code_session_url: {} }, { claude_code_session_url: "" },
    { claude_code_session_url: " " }, { claude_code_session_url: "not-a-url" },
    { claude_code_session_url: "https://user:pass@claude.ai/code/test" },
    { claude_code_session_url: "https://claude.ai:444/code/test" },
    { claude_code_session_url: "https://claude.ai.evil.example/code/test" },
    { claude_code_session_url: "http://claude.ai/code/test" },
  ])("rejects invalid session metadata without exposing values or retrying", async (override) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const result = { type: "routine_fire", claude_code_session_id: "opaque-id", claude_code_session_url: "https://claude.ai/code/test", ...override };
    const decision = vi.fn<typeof fetch>(async (input) => String(input) === ROUTINE_URL ? Response.json(result) : Response.json({ result: "regeneration_requested" }));
    const worker = harness(decision, withFire);
    const reply = await worker.run(regeneration());
    expect(reply.body.content).toContain("Disparo da Routine não confirmado");
    expect(reply.body.content).not.toContain("Routine iniciada");
    expect(decision).toHaveBeenCalledTimes(2);
    expect(warning.mock.calls).toEqual([["newsletter_routine_fire_failed"]]);
  });

  it("fires the Routine only after regeneration_requested with official headers and identity, carrying no secret in the text", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const decision = vi.fn<typeof fetch>(async (input, init) => {
      if (String(input) === ROUTINE_URL) {
        calls.push({ url: String(input), init });
        return fired();
      }
      return Response.json({ result: "regeneration_requested" });
    });
    const worker = harness(decision, withFire);
    const reply = await worker.run(regeneration(2));
    expect(calls).toHaveLength(1);
    expect(calls[0].init?.redirect).toBe("manual");
    const headers = new Headers(calls[0].init?.headers);
    expect(headers.get("authorization")).toBe(`Bearer ${withFire.ROUTINE_FIRE_TOKEN}`);
    expect(headers.get("anthropic-beta")).toBe("experimental-cc-routine-2026-04-01");
    expect(headers.get("anthropic-version")).toBe("2023-06-01");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.has("x-rt-signature")).toBe(false);
    const body = JSON.parse(String(calls[0].init?.body));
    expect(Object.keys(body)).toEqual(["text"]);
    expect(body.text).toContain(SLUG);
    expect(body.text).toContain(DRAFT_ID);
    expect(body.text).toContain("revisão 2");
    expect(body.text).not.toContain(KEY_PUBLISH);
    expect(body.text).not.toContain(INTERACTION_TOKEN);
    expect(body.text).not.toContain(withFire.ROUTINE_FIRE_TOKEN);
    expect(reply.body.content).toContain("Routine iniciada; execução e revisão pendentes");
    expect(reply.body.content).not.toContain("session_test123");
    expect(reply.body.content).not.toContain("https://claude.ai");
    for (const [input, init] of worker.fetcher.mock.calls) {
      if (String(input) !== ROUTINE_URL) expect(new Headers(init?.headers).has("authorization")).toBe(false);
    }
  });

  it("does nothing extra for reject, other results or absent configuration, and survives a failing notice", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const [action, result, config] of [
      ["reject", "rejected", withFire],
      ["regenerate", "regeneration_limit", withFire],
      ["regenerate", "already_regenerating", withFire],
      ["regenerate", "regeneration_requested", env],
    ] as const) {
      const decision = vi.fn<typeof fetch>(answer(result));
      const payload = { ...regeneration(), data: { component_type: 2, custom_id: buildCustomId(action, DRAFT_ID, 1) } };
      const reply = await harness(decision, config).run(payload);
      expect(decision).toHaveBeenCalledTimes(1);
      if (result === "regeneration_requested") expect(reply.body.content).toContain("Disparo da Routine não confirmado");
    }
    const failing = vi.fn<typeof fetch>(async (input) => {
      if (String(input) === ROUTINE_URL) throw new Error(`down ${ROUTINE_URL} ${withFire.ROUTINE_FIRE_TOKEN}`);
      return Response.json({ result: "regeneration_requested" });
    });
    const reply = await harness(failing, withFire).run(regeneration());
    expect(reply.init?.method).toBe("PATCH");
    expect(reply.body.content).toContain("Disparo da Routine não confirmado");
    expect(failing).toHaveBeenCalledTimes(2);
  });

  it.each([
    "http://api.anthropic.com/v1/claude_code/routines/trig_test123/fire",
    "https://evil.example/v1/claude_code/routines/trig_test123/fire",
    "https://api.anthropic.com.evil.example/v1/claude_code/routines/trig_test123/fire",
    "https://user:pass@api.anthropic.com/v1/claude_code/routines/trig_test123/fire",
    "https://api.anthropic.com:443/v1/claude_code/routines/trig_test123/fire",
    "https://api.anthropic.com:444/v1/claude_code/routines/trig_test123/fire",
    "https://api.anthropic.com/v1/claude_code/routines/trig_test123/fire?token=no",
    "https://api.anthropic.com/v1/claude_code/routines/trig_test123/fire#fragment",
    "https://api.anthropic.com/v1/claude_code/routines//fire",
    "https://api.anthropic.com/v1/claude_code/routines/trig_test123/fire/",
    "https://api.anthropic.com/v1/claude_code/routines/%2e%2e/fire",
    "not-a-url",
    "",
  ])("refuses unsafe Routine destination %s without transmitting its Bearer", async (url) => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const decision = vi.fn<typeof fetch>(answer("regeneration_requested"));
    const worker = harness(decision, { ...withFire, ROUTINE_FIRE_URL: url });
    const reply = await worker.run(regeneration());
    expect(decision).toHaveBeenCalledTimes(1);
    expect(reply.body.content).toContain("Nova versão solicitada");
    expect(reply.body.content).toContain("Disparo da Routine não confirmado");
    expect(reply.body.content).toContain("não repita a decisão");
    expect(reply.body.components).toEqual([]);
    expect(worker.fetcher.mock.calls.every(([, init]) => !new Headers(init?.headers).has("authorization"))).toBe(true);
  });

  it("requires a valid matching slug and nonempty token before firing, preserving the registered request", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const content of [undefined, { text: "not-a-string" }, "Revisão 1 da edição Invalid Slug.", `Revisão 1 da edição ${"x".repeat(81)} (ID ${DRAFT_ID}).`, `Revisão 1 da edição ${SLUG} (ID ed_11111111-1111-4111-8111-111111111111).`]) {
      const decision = vi.fn<typeof fetch>(answer("regeneration_requested"));
      const payload = button(buildCustomId("regenerate", DRAFT_ID, 1), { message: { id: MESSAGE_ID, content } });
      const reply = await harness(decision, withFire).run(payload);
      expect(decision).toHaveBeenCalledTimes(1);
      expect(reply.body.content).toContain("Disparo da Routine não confirmado");
    }
    for (const token of [undefined, "", " "]) {
      const decision = vi.fn<typeof fetch>(answer("regeneration_requested"));
      expect((await harness(decision, { ...withFire, ROUTINE_FIRE_TOKEN: token }).run(regeneration())).body.content).toContain("Disparo da Routine não confirmado");
      expect(decision).toHaveBeenCalledTimes(1);
    }
  });

  it("requires a bounded valid success body and never confirms non-2xx or redirects", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const response of [
      () => new Response(null, { status: 302, headers: { location: "https://other.example" } }),
      () => new Response("sensitive provider body", { status: 401 }),
      () => new Response("sensitive provider body", { status: 429 }),
      () => new Response("sensitive provider body", { status: 500 }),
      () => new Response(null, { status: 204 }),
      () => new Response("not-json"),
      () => new Response("x".repeat(8193)),
      () => Response.json(null),
      () => Response.json([]),
      () => Response.json([{ type: "routine_fire", claude_code_session_id: "opaque-id", claude_code_session_url: "https://claude.ai/code/test" }]),
      () => Response.json({ type: "made_up", claude_code_session_id: "session_test123", claude_code_session_url: "https://claude.ai/code/session_test123" }),
      () => Response.json({ type: "routine_fire", claude_code_session_id: "", claude_code_session_url: "" }),
      () => Response.json({ type: "routine_fire", claude_code_session_id: "session_test123", claude_code_session_url: "http://claude.ai/code/session_test123" }),
      () => Response.json({ type: "routine_fire", claude_code_session_id: "session_test123", claude_code_session_url: "https://evil.example/session_test123" }),
    ]) {
      const decision = vi.fn<typeof fetch>(async (input) => String(input) === ROUTINE_URL ? response() : Response.json({ result: "regeneration_requested" }));
      const worker = harness(decision, withFire);
      const reply = await worker.run(regeneration());
      expect(reply.body.content).toContain("Disparo da Routine não confirmado");
      expect(reply.body.content).not.toContain("Routine iniciada");
      expect(decision).toHaveBeenCalledTimes(2);
      expect(worker.fetcher).toHaveBeenCalledTimes(3);
    }
    const logged = JSON.stringify(warning.mock.calls);
    expect(logged).not.toContain(withFire.ROUTINE_FIRE_TOKEN);
    expect(logged).not.toContain(ROUTINE_URL);
    expect(logged).not.toContain("sensitive provider body");
    expect(logged).not.toContain("not-json");
    expect(warning.mock.calls.every(([code, detail]) => code === "newsletter_routine_fire_failed" && (detail === undefined || typeof detail.status === "number"))).toBe(true);
  });

  it("cancels non-2xx and oversized bodies without waiting for cancellation completion", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const status of [302, 500, 200]) {
      const cancel = vi.fn(() => new Promise<void>(() => undefined));
      const body = new ReadableStream<Uint8Array>({
        start(controller) { controller.enqueue(new Uint8Array(8193)); },
        cancel,
      });
      const decision = vi.fn<typeof fetch>(async (input) => String(input) === ROUTINE_URL ? new Response(body, { status }) : Response.json({ result: "regeneration_requested" }));
      const reply = await harness(decision, withFire).run(regeneration());
      expect(reply.body.content).toContain("Disparo da Routine não confirmado");
      expect(cancel).toHaveBeenCalledTimes(1);
    }
  });

  it.each(["fetch", "body"])("bounds the Routine %s by 5 s while preserving ACK and reporting the uncertain fire without retry", async (phase) => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    const timeout = vi.spyOn(AbortSignal, "timeout").mockImplementation((delay) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), delay);
      return controller.signal;
    });
    let started!: () => void;
    const routineStarted = new Promise<void>((resolve) => { started = resolve; });
    const cancel = vi.fn();
    const decision = vi.fn<typeof fetch>(async (input, init) => {
      if (String(input) === ROUTINE_URL) {
        started();
        if (phase === "body") return new Response(new ReadableStream({ cancel }));
        return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
      }
      return Response.json({ result: "regeneration_requested" });
    });
    const worker = harness(decision, withFire);
    expect(await (await worker.ack(regeneration())).json()).toEqual({ type: 6 });
    await routineStarted;
    expect(worker.replies).toHaveLength(0);
    expect(timeout).toHaveBeenCalledWith(5000);
    await vi.advanceTimersByTimeAsync(5000);
    await worker.settle();
    expect(worker.replies).toHaveLength(1);
    expect(worker.replies[0].body.content).toContain("Disparo da Routine não confirmado");
    expect(timeout).toHaveBeenCalledWith(4000);
    expect(decision).toHaveBeenCalledTimes(2);
    if (phase === "body") expect(cancel).toHaveBeenCalledTimes(1);
  });
});
