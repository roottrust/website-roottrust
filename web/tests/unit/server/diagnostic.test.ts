import { describe, expect, it, vi } from "vitest";
import { createDiagnosticHandler, formatDiscordMessage, loadDiagnosticConfig, resolveContactAvailability } from "../../../src/lib/server/diagnostic";
import { defaultDeps, handleDiagnostic } from "../../../src/lib/server/http";
import { processJobs } from "../../../src/lib/server/jobs";
import { recordDiagnostic } from "../../../src/lib/server/repository";
import { JOB_KINDS, type DiagnosticRecord, type JobRecord } from "../../../src/lib/server/types";
import { NOW, SECRET, WEBHOOK_URL, postDiagnostic, setup } from "./helpers";

const contact = { name: "Ana Souza", company: "Acme", whatsapp: "(11) 94008-4692" };
type Env = ReturnType<typeof setup>;

async function accept(deps: Env["deps"], body: Record<string, string> = contact) {
  const response = await handleDiagnostic(postDiagnostic(body), deps);
  expect(response.status).toBe(202);
  return ((await response.json()) as { id: string }).id;
}

const jobs = (store: Env["store"]) => Object.values(store.dump("jobs")) as JobRecord[];
const respond = (status: number, init: ResponseInit = {}, body?: unknown) =>
  vi.fn<typeof fetch>(async () => new Response(body === undefined ? null : JSON.stringify(body), { status, ...init }));

function runner(store: Env["store"], send: typeof fetch, now = NOW) {
  const handler = createDiagnosticHandler(store, { webhookUrl: WEBHOOK_URL, fetch: send }, () => now);
  return () => processJobs(store, { [JOB_KINDS.diagnosticDiscord]: handler }, { now: () => now, limit: 5, leaseMs: 60_000, handlerTimeoutMs: 5_000 });
}

describe("diagnostic request", () => {
  it("same WhatsApp with different names keeps one record per request and does not overwrite earlier ones", async () => {
    const { deps, store } = setup();
    const a = await accept(deps, { ...contact, name: "Ana Souza", company: "Acme" });
    const b = await accept(deps, { ...contact, name: "Bruno Lima", company: "Beta" });
    expect(a).not.toBe(b);
    const records = store.dump("diagnostics") as Record<string, DiagnosticRecord>;
    expect(records[a]).toMatchObject({ name: "Ana Souza", company: "Acme" });
    expect(records[b]).toMatchObject({ name: "Bruno Lima", company: "Beta" });
    expect(records[a].leadId).toBe(records[b].leadId);
    const events = Object.values(store.dump("lead_events")) as { requestId?: string }[];
    expect(events.map((event) => event.requestId).sort()).toEqual([a, b].sort());
    expect(store.dump("leads")[records[a].leadId]).toMatchObject({ interactionCount: 2, name: "Bruno Lima" });
  });

  it("creates exactly one outbox job per request holding only the request ID", async () => {
    const { deps, store } = setup();
    const a = await accept(deps);
    const b = await accept(deps);
    const queued = jobs(store);
    expect(queued).toHaveLength(2);
    expect(queued.map((job) => job.payload.requestId).sort()).toEqual([a, b].sort());
    expect(JSON.stringify(queued)).not.toMatch(/Ana|Acme|94008/);
  });

  it("a denied gate writes neither record nor job, and a rolled-back transaction leaves no orphan job", async () => {
    const { store } = setup();
    const denied = await recordDiagnostic(store, SECRET, contact, NOW, async () => ({ ok: false, retryAfterSec: 5 }) as never);
    expect(denied).toMatchObject({ ok: false });
    expect(store.dump("diagnostics")).toEqual({});
    expect(jobs(store)).toHaveLength(0);
    await expect(
      store.transaction(async (tx) => {
        await recordDiagnostic({ transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx) } as never, SECRET, contact, NOW);
        throw new Error("rollback");
      }),
    ).rejects.toThrow();
    expect(store.dump("diagnostics")).toEqual({});
    expect(jobs(store)).toHaveLength(0);
  });
});

describe("fail closed", () => {
  it("pilot without the Discord destination / follow-up confirmation answers 503 not_operational and stores nothing", async () => {
    const { deps, store } = setup();
    const response = await handleDiagnostic(postDiagnostic(contact), { ...deps, diagnostic: undefined });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "not_operational" });
    expect(store.dump("diagnostics")).toEqual({});
  });

  it("pilot without a jobs key answers 503 not_operational even with the Discord config present", async () => {
    const { deps, store } = setup();
    const response = await handleDiagnostic(postDiagnostic(contact), { ...deps, internalKeys: undefined });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "not_operational" });
    expect(store.dump("diagnostics")).toEqual({});
  });

  it("loadDiagnosticConfig needs both a real Discord webhook URL and the explicit confirmation", () => {
    const env = { DISCORD_DIAGNOSTIC_WEBHOOK_URL: WEBHOOK_URL, DIAGNOSTIC_FOLLOWUP_CONFIRMED: "true", JOBS_TRIGGER_CONFIRMED: "true" };
    expect(loadDiagnosticConfig(env)).toEqual({ webhookUrl: WEBHOOK_URL });
    expect(loadDiagnosticConfig({ ...env, DIAGNOSTIC_FOLLOWUP_CONFIRMED: "yes" })).toBeUndefined();
    expect(loadDiagnosticConfig({ ...env, JOBS_TRIGGER_CONFIRMED: undefined })).toBeUndefined();
    expect(loadDiagnosticConfig({ ...env, JOBS_TRIGGER_CONFIRMED: "1" })).toBeUndefined();
    expect(loadDiagnosticConfig({ DISCORD_DIAGNOSTIC_WEBHOOK_URL: WEBHOOK_URL })).toBeUndefined();
    for (const url of ["http://discord.com/api/webhooks/1/a", "https://evil.test/api/webhooks/1/a", "https://discord.com/other", "https://u:p@discord.com/api/webhooks/1/a", "nope", ""]) {
      expect(loadDiagnosticConfig({ ...env, DISCORD_DIAGNOSTIC_WEBHOOK_URL: url })).toBeUndefined();
    }
  });

  it("defaultDeps registers the job handler only when the destination is configured", () => {
    expect(defaultDeps({}).jobHandlers).toEqual({});
    expect(defaultDeps({}).mode).toBe("off");
    const configured = defaultDeps({ DISCORD_DIAGNOSTIC_WEBHOOK_URL: WEBHOOK_URL, DIAGNOSTIC_FOLLOWUP_CONFIRMED: "true", JOBS_TRIGGER_CONFIRMED: "true" });
    expect(Object.keys(configured.jobHandlers ?? {})).toEqual([JOB_KINDS.diagnosticDiscord]);
  });
});

const READY_ENV = {
  BACKEND_MODE: "pilot",
  TURNSTILE_SITE_KEY: "site-key",
  TURNSTILE_SECRET_KEY: "turnstile-secret-for-tests",
  TURNSTILE_HOSTNAMES: "roottrust.test",
  TRUSTED_ORIGINS: "https://roottrust.test",
  TRUSTED_IP_HEADER: "x-real-ip",
  DATA_ID_SECRET: "s".repeat(32),
  INTERNAL_KEY_JOBS: "j".repeat(32),
  DISCORD_DIAGNOSTIC_WEBHOOK_URL: WEBHOOK_URL,
  DIAGNOSTIC_FOLLOWUP_CONFIRMED: "true",
  JOBS_TRIGGER_CONFIRMED: "true",
};

describe("contact availability (page gate)", () => {
  it("is unavailable by default and in plain backend modes", () => {
    expect(resolveContactAvailability({})).toEqual({ mode: "unavailable" });
    expect(resolveContactAvailability({ BACKEND_MODE: "pilot" })).toEqual({ mode: "unavailable" });
    expect(resolveContactAvailability({ ...READY_ENV, BACKEND_MODE: "demo" })).toEqual({ mode: "unavailable" });
  });

  it("offers the pilot only with the complete server configuration and exposes just mode and site key", () => {
    const ready = resolveContactAvailability(READY_ENV);
    expect(ready).toEqual({ mode: "pilot", siteKey: "site-key" });
    expect(JSON.stringify(ready)).not.toMatch(/discord|secret|test-token|jjjj/i);
  });

  it("each missing requirement closes the form", () => {
    for (const missing of Object.keys(READY_ENV)) {
      expect(resolveContactAvailability({ ...READY_ENV, [missing]: undefined }), missing).toEqual({ mode: "unavailable" });
    }
    expect(resolveContactAvailability({ ...READY_ENV, INTERNAL_KEY_JOBS: "short" })).toEqual({ mode: "unavailable" });
    expect(resolveContactAvailability({ ...READY_ENV, DATA_ID_SECRET: "short" })).toEqual({ mode: "unavailable" });
    expect(resolveContactAvailability({ ...READY_ENV, JOBS_TRIGGER_CONFIRMED: "false" })).toEqual({ mode: "unavailable" });
  });

  it("FORM_MODE=demo wins and carries no pilot configuration", () => {
    expect(resolveContactAvailability({ ...READY_ENV, FORM_MODE: "demo" })).toEqual({ mode: "demo" });
  });
});

describe("discord job", () => {
  it("sends a private message with the visible ID, empty allowed_mentions and marks the request notified", async () => {
    const { deps, store } = setup();
    const id = await accept(deps);
    const send = respond(204);
    expect(await runner(store, send)()).toMatchObject({ claimed: 1, done: 1 });
    expect(send).toHaveBeenCalledTimes(1);
    const [url, init] = send.mock.calls[0];
    expect(url).toBe(WEBHOOK_URL);
    const payload = JSON.parse(String(init?.body)) as { content: string; allowed_mentions: { parse: string[] } };
    expect(payload.allowed_mentions).toEqual({ parse: [] });
    expect(payload.content).toContain(id);
    expect((store.dump("diagnostics")[id] as DiagnosticRecord).notifiedAt).toBe(NOW.toISOString());
    expect(await runner(store, send)()).toMatchObject({ claimed: 0 });
  });

  it("does not resend a request that is already notified", async () => {
    const { deps, store } = setup();
    const id = await accept(deps);
    await store.transaction(async (tx) => {
      const current = (await tx.get("diagnostics", id)) as DiagnosticRecord;
      tx.set("diagnostics", id, { ...current, notifiedAt: NOW.toISOString() });
    });
    const send = respond(204);
    expect(await runner(store, send)()).toMatchObject({ done: 1 });
    expect(send).not.toHaveBeenCalled();
  });

  it("neutralises mentions and markdown in user-controlled fields", () => {
    const text = formatDiscordMessage({ id: "DG-AAAAAAAAAA", leadId: "l", name: "@everyone <@123> **x**\n\nfake", company: "[a](http://x)", whatsapp: "1", createdAt: "" });
    expect(text).not.toMatch(/(^|[^\\])@everyone/);
    expect(text).not.toMatch(/(^|[^\\])<@/);
    expect(text.split("\n")).toHaveLength(5);
  });

  it("429 retries later honoring Retry-After; a later success notifies once", async () => {
    const { deps, store } = setup();
    await accept(deps);
    const limited = respond(429, { headers: { "retry-after": "120" } }, { retry_after: 120 });
    expect(await runner(store, limited)()).toMatchObject({ retried: 1 });
    expect(Date.parse(jobs(store)[0].dueAt as string) - NOW.getTime()).toBeGreaterThanOrEqual(120_000);
    const ok = respond(204);
    expect(await runner(store, ok, new Date(NOW.getTime() + 121_000))()).toMatchObject({ done: 1 });
    expect(ok).toHaveBeenCalledTimes(1);
  });

  it("5xx and network errors retry; 4xx other than 429 is permanent; a missing request is permanent", async () => {
    const { deps, store } = setup();
    await accept(deps);
    expect(await runner(store, respond(502))()).toMatchObject({ retried: 1 });
    const boom = vi.fn(async () => {
      throw new TypeError(`fetch failed ${WEBHOOK_URL}`);
    });
    expect(await runner(store, boom, new Date(NOW.getTime() + 3_600_000))()).toMatchObject({ retried: 1 });
    expect(jobs(store)[0].lastError).not.toContain("123456789012345678");
    expect(await runner(store, respond(404), new Date(NOW.getTime() + 7_200_000))()).toMatchObject({ dead: 1 });

    const other = setup();
    const id = await accept(other.deps);
    await other.store.transaction(async (tx) => tx.delete("diagnostics", id));
    const send = respond(204);
    expect(await runner(other.store, send)()).toMatchObject({ dead: 1 });
    expect(send).not.toHaveBeenCalled();
  });

  it("times out a hung webhook through the abort signal and retries", async () => {
    const { deps, store } = setup();
    await accept(deps);
    const hung = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))),
    );
    const handler = createDiagnosticHandler(store, { webhookUrl: WEBHOOK_URL, fetch: hung }, () => NOW);
    const summary = await processJobs(store, { [JOB_KINDS.diagnosticDiscord]: handler }, { now: () => NOW, limit: 1, leaseMs: 5_000, handlerTimeoutMs: 20 });
    expect(summary).toMatchObject({ claimed: 1, retried: 1 });
  });

  it("never logs contact data or the webhook URL", async () => {
    const { deps, store } = setup();
    await accept(deps);
    const spies = (["warn", "error", "log"] as const).map((level) => vi.spyOn(console, level).mockImplementation(() => undefined));
    const boom = vi.fn(async () => {
      throw new TypeError(`connect ECONNREFUSED ${WEBHOOK_URL} Ana Souza`);
    });
    await runner(store, boom)();
    await runner(store, respond(500), new Date(NOW.getTime() + 3_600_000))();
    const logged = spies.flatMap((spy) => spy.mock.calls).flat().join(" ");
    vi.restoreAllMocks();
    expect(logged).not.toMatch(/Ana|Acme|94008|123456789012345678|test-token/);
    expect(logged).toContain("job_failed");
  });
});
