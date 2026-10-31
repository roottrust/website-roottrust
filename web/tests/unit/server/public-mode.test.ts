import { describe, expect, it, vi } from "vitest";
import { cancellationToken, confirmationToken, opaqueId } from "../../../src/lib/server/ids";
import { loadDiagnosticConfig, resolveContactAvailability } from "../../../src/lib/server/diagnostic";
import {
  defaultDeps,
  handleDiagnostic,
  handleJobsProcess,
  handleNewsletterCancellation,
  handleNewsletterConfirmation,
  handleReport,
  handleSubscription,
  type Deps,
} from "../../../src/lib/server/http";
import { signInternalRequest } from "../../../src/lib/server/internal-auth";
import { PermanentFailure, RetryLater, enqueueJob, processJobs } from "../../../src/lib/server/jobs";
import { isOperationalMode, resolveBackendMode } from "../../../src/lib/server/mode";
import { createBroadcastHandler, holdPublicEffects, loadBroadcastConfig, type BroadcastProvider } from "../../../src/lib/server/newsletter-broadcast";
import { createContactSyncHandler, resolveNewsletterAvailability } from "../../../src/lib/server/newsletter-email";
import { resolveReportAvailability } from "../../../src/lib/server/report";
import { confirmSubscription, requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { handleResendWebhook, loadPublicWebhookSender, type ResendWebhookConfig } from "../../../src/lib/server/resend-webhook";
import { COLLECTIONS, JOB_KINDS, type JobRecord, type SubscriptionRecord } from "../../../src/lib/server/types";
import { NOW, ORIGIN, SECRET, WEBHOOK_URL, postDiagnostic, postReport, postSubscription, setup } from "./helpers";

const contact = { name: "Ana Souza", company: "Acme", whatsapp: "(11) 94008-4692" };
const OUTSIDER = { ...contact, whatsapp: "(21) 98888-7777" };
const publicDiagnostic = (env: ReturnType<typeof setup>) => {
  env.deps.diagnostic = { mode: "public", webhookUrl: WEBHOOK_URL, allowlist: [], fetch: env.discord };
  return env;
};
const jobsOf = (store: ReturnType<typeof setup>["store"]) => Object.values(store.dump(COLLECTIONS.jobs)) as JobRecord[];
const context = () => ({ signal: new AbortController().signal });

const READY_ENV = {
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

describe("backend mode", () => {
  it("recognizes the literal public mode and closes anything unknown", () => {
    expect(resolveBackendMode("public")).toBe("public");
    for (const value of ["PUBLIC", " public", "publico", "true", "1", "", undefined]) expect(resolveBackendMode(value), String(value)).toBe("off");
    expect(isOperationalMode("pilot")).toBe(true);
    expect(isOperationalMode("public")).toBe(true);
    expect(isOperationalMode("demo")).toBe(false);
    expect(isOperationalMode("off")).toBe(false);
  });

  it("defaultDeps reads the explicit mode and never infers public from a missing allowlist", () => {
    expect(defaultDeps({ ...READY_ENV, BACKEND_MODE: "public" }).mode).toBe("public");
    const pilot = defaultDeps({ ...READY_ENV, BACKEND_MODE: "pilot" });
    expect(pilot.mode).toBe("pilot");
    expect(pilot.diagnostic).toBeUndefined();
    expect(defaultDeps({ ...READY_ENV, BACKEND_MODE: "publica" }).mode).toBe("off");
  });
});

describe("public configs", () => {
  it("diagnostic config is public only when asked and needs the Discord destination plus both attestations", () => {
    expect(loadDiagnosticConfig(READY_ENV, "public")).toEqual({ mode: "public", webhookUrl: WEBHOOK_URL, allowlist: [] });
    expect(loadDiagnosticConfig(READY_ENV)).toBeUndefined();
    for (const missing of ["DISCORD_DIAGNOSTIC_WEBHOOK_URL", "DIAGNOSTIC_FOLLOWUP_CONFIRMED", "JOBS_TRIGGER_CONFIRMED"] as const) {
      expect(loadDiagnosticConfig({ ...READY_ENV, [missing]: undefined }, "public"), missing).toBeUndefined();
    }
    expect(loadDiagnosticConfig({ ...READY_ENV, DISCORD_DIAGNOSTIC_WEBHOOK_URL: "https://evil.test/api/webhooks/1/x" }, "public")).toBeUndefined();
  });

  it("a pilot config keeps its allowlist and carries no public marker", () => {
    const pilot = loadDiagnosticConfig({ ...READY_ENV, DIAGNOSTIC_PILOT_ALLOWLIST: "11940084692" });
    expect(pilot).toEqual({ webhookUrl: WEBHOOK_URL, allowlist: ["11940084692"] });
    expect(pilot).not.toHaveProperty("mode");
  });

  it("broadcast config keeps provider requirements in public mode and drops only the recipient list", () => {
    const env = {
      RESEND_API_KEY: "re_test_key", NEWSLETTER_EMAIL_FROM: "Root Trust <newsletter@roottrust.test>", NEWSLETTER_EMAIL_REPLY_TO: "contato@roottrust.test",
      RESEND_NEWSLETTER_SEGMENT_ID: "seg_public_0001", RESEND_DOMAIN_CONFIRMED: "true", JOBS_TRIGGER_CONFIRMED: "true", NEWSLETTER_PILOT_SEGMENT_CONFIRMED: "true",
    };
    expect(loadBroadcastConfig(env, "public")).toMatchObject({ mode: "public", allowlist: [], segmentId: "seg_public_0001" });
    expect(loadBroadcastConfig(env)).toBeUndefined();
    for (const missing of Object.keys(env)) expect(loadBroadcastConfig({ ...env, [missing]: undefined }, "public"), missing).toBeUndefined();
    expect(loadBroadcastConfig({ ...env, NEWSLETTER_PILOT_ALLOWLIST: "a@pilot.test" })).toMatchObject({ allowlist: ["a@pilot.test"] });
  });

  it("public webhook sender needs only the provider key and a valid newsletter sender", () => {
    expect(loadPublicWebhookSender({ RESEND_API_KEY: "re_k", NEWSLETTER_EMAIL_FROM: "Root Trust <newsletter@roottrust.test>" })).toEqual({ apiKey: "re_k", newsletterFrom: "Root Trust <newsletter@roottrust.test>" });
    expect(loadPublicWebhookSender({ RESEND_API_KEY: "re_k" })).toBeUndefined();
    expect(loadPublicWebhookSender({ NEWSLETTER_EMAIL_FROM: "newsletter@roottrust.test" })).toBeUndefined();
    expect(loadPublicWebhookSender({ RESEND_API_KEY: "re_k", NEWSLETTER_EMAIL_FROM: "Root Trust <not-an-address>" })).toBeUndefined();
  });
});

describe("availability offered to the page", () => {
  it("public contact needs the same complete configuration, minus the pilot recipient list", () => {
    expect(resolveContactAvailability({ ...READY_ENV, BACKEND_MODE: "public" })).toEqual({ mode: "public", siteKey: "site-key" });
    for (const missing of Object.keys(READY_ENV)) {
      expect(resolveContactAvailability({ ...READY_ENV, BACKEND_MODE: "public", [missing]: undefined }), missing).toEqual({ mode: "unavailable" });
    }
    expect(resolveContactAvailability({ ...READY_ENV, BACKEND_MODE: "public", FORM_MODE: "demo" })).toEqual({ mode: "demo" });
    expect(resolveContactAvailability({ ...READY_ENV, BACKEND_MODE: "publico" })).toEqual({ mode: "unavailable" });
    expect(JSON.stringify(resolveContactAvailability({ ...READY_ENV, BACKEND_MODE: "public" }))).not.toMatch(/discord|secret|test-token|jjjj/i);
  });

  it("newsletter and report stay unavailable in public until the capacity controls exist", () => {
    const full = { ...READY_ENV, BACKEND_MODE: "public", RESEND_API_KEY: "re_test_key", NEWSLETTER_EMAIL_FROM: "Root Trust <newsletter@roottrust.test>", RESEND_WEBHOOK_SECRET: "whsec_x" };
    expect(resolveNewsletterAvailability(full)).toEqual({ mode: "unavailable" });
    expect(resolveReportAvailability(full)).toEqual({ mode: "unavailable" });
  });
});

describe("public diagnostic", () => {
  it("accepts an identity outside the old allowlist, without Resend, and queues exactly one job", async () => {
    const env = publicDiagnostic(setup({ mode: "public" }));
    delete env.deps.report;
    delete env.deps.newsletterEmail;
    delete env.deps.broadcast;
    const response = await handleDiagnostic(postDiagnostic(OUTSIDER), env.deps);
    expect(response.status).toBe(202);
    expect(jobsOf(env.store).map((job) => job.kind)).toEqual([JOB_KINDS.diagnosticDiscord]);
  });

  it("without an explicit public config, public deps stay restricted to the pilot allowlist", async () => {
    const env = setup({ mode: "public" });
    expect((await handleDiagnostic(postDiagnostic(OUTSIDER), env.deps)).status).toBe(403);
    expect((await handleDiagnostic(postDiagnostic(contact), env.deps)).status).toBe(202);
  });

  it("a public config injected into pilot deps does not waive the allowlist", async () => {
    const env = publicDiagnostic(setup({ mode: "pilot" }));
    expect((await handleDiagnostic(postDiagnostic(OUTSIDER), env.deps)).status).toBe(403);
  });

  it("runs the whole defense block in order", async () => {
    const unknown = publicDiagnostic(setup({ mode: "public" }));
    unknown.deps.mode = "unknown" as Deps["mode"];
    expect((await handleDiagnostic(postDiagnostic(contact), unknown.deps)).status).toBe(503);
    expect(unknown.getStore).not.toHaveBeenCalled();
    const closed = publicDiagnostic(setup({ mode: "public", withDefense: false }));
    expect((await handleDiagnostic(postDiagnostic(contact), closed.deps)).status).toBe(503);
    const noSecret = publicDiagnostic(setup({ mode: "public", idSecret: undefined }));
    expect((await handleDiagnostic(postDiagnostic(contact), noSecret.deps)).status).toBe(503);

    const env = publicDiagnostic(setup({ mode: "public" }));
    expect((await handleDiagnostic(postDiagnostic(contact, { origin: "https://evil.test" }), env.deps)).status).toBe(403);
    expect((await handleDiagnostic(postDiagnostic({ name: "", company: "", whatsapp: "1" }), env.deps)).status).toBe(400);
    expect((await handleDiagnostic(postDiagnostic(contact, { ip: null }), env.deps)).status).toBe(503);
    expect((await handleDiagnostic(postDiagnostic(contact, { token: "bad!1" }), env.deps)).status).toBe(403);
    expect((await handleDiagnostic(postDiagnostic(contact, { token: "down!1" }), env.deps)).status).toBe(503);
    expect((await handleDiagnostic(postDiagnostic(contact, { token: null }), env.deps)).status).toBe(403);
    expect(jobsOf(env.store)).toHaveLength(0);

    const limited = publicDiagnostic(setup({ mode: "public", limits: { ipBurst: 1 } }));
    expect((await handleDiagnostic(postDiagnostic(contact), limited.deps)).status).toBe(202);
    expect((await handleDiagnostic(postDiagnostic(contact), limited.deps)).status).toBe(429);
  });

  it("demo never reaches the network or storage", async () => {
    const env = publicDiagnostic(setup({ mode: "demo" }));
    expect((await handleDiagnostic(postDiagnostic(contact), env.deps)).status).toBe(503);
    expect(env.siteverify).not.toHaveBeenCalled();
    expect(env.getStore).not.toHaveBeenCalled();
    expect(env.discord).not.toHaveBeenCalled();
  });
});

describe("public admission of new e-mail addresses (closed until T4.2)", () => {
  it("subscription and report answer 503 not_operational before any storage or Turnstile access, for any address", async () => {
    const env = setup({ mode: "public" });
    for (const response of [
      await handleSubscription(postSubscription({ email: "leitor@example.com" }), env.deps),
      await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps),
      await handleReport(postReport({ email: "rosi@example.com", toolId: "rosi" }), env.deps),
      await handleReport(postReport({ email: "novo@fora.test", toolId: "rosi" }), env.deps),
    ]) {
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ code: "not_operational" });
    }
    expect(env.getStore).not.toHaveBeenCalled();
    expect(env.siteverify).not.toHaveBeenCalled();
    expect(env.mailer).not.toHaveBeenCalled();
  });

  it("the pilot keeps its admission and its allowlist guard", async () => {
    const env = setup({ mode: "pilot" });
    expect((await handleSubscription(postSubscription({ email: "leitor@example.com" }), env.deps)).status).toBe(202);
    expect((await handleReport(postReport({ email: "novo@fora.test", toolId: "rosi" }), env.deps)).status).toBe(403);
  });

  it("confirmation is closed in public even with a valid link, and pilot is unchanged", async () => {
    const env = setup({ mode: "public" });
    const result = await requestSubscriptionConfirmation(env.store, SECRET, { email: "leitor@example.com" }, NOW);
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    const token = confirmationToken(SECRET, result.confirmationId);
    const confirm = (deps: Deps) => handleNewsletterConfirmation(new Request(`${ORIGIN}/api/newsletter/confirmar`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" }, body: JSON.stringify({ token }) }), deps);
    const blocked = await confirm(env.deps);
    expect(blocked.status).toBe(503);
    expect(await blocked.json()).toEqual({ code: "not_operational" });
    expect(Object.values(env.store.dump(COLLECTIONS.subscriptions)).some((record) => (record as SubscriptionRecord).status === "confirmed")).toBe(false);
    expect((await confirm({ ...env.deps, mode: "pilot" })).status).toBe(200);
  });
});

describe("cancellation readiness in public", () => {
  const EMAIL = "leitor@example.com";
  const SUB_ID = opaqueId(SECRET, "sb", `email:${EMAIL}`);
  const post = (token: string, origin = ORIGIN) =>
    new Request(`${ORIGIN}/api/newsletter/cancelar`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ token }) });

  async function confirmed(env: ReturnType<typeof setup>, queueSync = true) {
    const result = await requestSubscriptionConfirmation(env.store, SECRET, { email: EMAIL }, NOW);
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    await confirmSubscription(env.store, SECRET, confirmationToken(SECRET, result.confirmationId), NOW, queueSync);
    return cancellationToken(SECRET, SUB_ID, NOW.toISOString());
  }

  it("cancels with only origin, secret, signed proof and storage: no sender, Resend, Turnstile or quota", async () => {
    for (const mode of ["pilot", "public"] as const) {
      const env = setup({ mode });
      const token = await confirmed(env, false);
      const bare: Deps = { ...defaultDeps({ BACKEND_MODE: mode, TRUSTED_ORIGINS: ORIGIN, DATA_ID_SECRET: SECRET }), getStore: env.getStore, now: () => NOW };
      expect(bare.defense).toBeUndefined();
      expect((await handleNewsletterCancellation(post(token), bare)).status, mode).toBe(200);
      expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).status).toBe("cancelled");
      expect(env.siteverify).not.toHaveBeenCalled();
      expect(env.newsletterMailer).not.toHaveBeenCalled();
      // local acceptance never claims remote reconciliation: without a Broadcast config no contact-sync job is queued
      expect(jobsOf(env.store).some((job) => job.kind === JOB_KINDS.newsletterContactSync)).toBe(false);
    }
  });

  it("queues the remote contact sync when a Broadcast config exists, and public holds it", async () => {
    const env = setup({ mode: "public" });
    const token = await confirmed(env);
    expect((await handleNewsletterCancellation(post(token), env.deps)).status).toBe(200);
    const [sync] = jobsOf(env.store).filter((job) => job.kind === JOB_KINDS.newsletterContactSync);
    expect(sync).toBeDefined();
    const provider = vi.fn();
    const handler = createContactSyncHandler(env.store, { ...env.deps.broadcast!, mode: "public" }, provider);
    await expect(handler(sync, context())).rejects.toBeInstanceOf(RetryLater);
    expect(provider).not.toHaveBeenCalled();
  });

  it("stays closed without a trusted origin config, the ID secret or a valid proof, and for a wrong origin", async () => {
    const env = setup({ mode: "public" });
    const token = await confirmed(env);
    expect((await handleNewsletterCancellation(post(token), { ...env.deps, defense: undefined })).status).toBe(503);
    const minimal = { ...env.deps, defense: undefined };
    for (const invalid of [undefined, "", "https://roottrust.test,invalid"]) {
      const deps = { ...minimal, ...defaultDeps({ BACKEND_MODE: "public", DATA_ID_SECRET: SECRET, TRUSTED_ORIGINS: invalid }), getStore: env.getStore };
      expect((await handleNewsletterCancellation(post(token), deps)).status).toBe(503);
    }
    expect((await handleNewsletterCancellation(post(token), { ...env.deps, idSecret: undefined })).status).toBe(503);
    expect((await handleNewsletterCancellation(post(token, "https://evil.test"), env.deps)).status).toBe(403);
    expect((await handleNewsletterCancellation(post(`${token}x`), env.deps)).status).toBe(400);
    expect((await handleNewsletterCancellation(post(token), { ...env.deps, mode: "demo" })).status).toBe(503);
    expect((await handleNewsletterCancellation(post(token), { ...env.deps, mode: "off" })).status).toBe(503);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).status).toBe("confirmed");
  });

  it("reports storage failure as unavailable", async () => {
    const env = setup({ mode: "public" });
    const token = await confirmed(env);
    const failing: Deps = { ...env.deps, getStore: async () => { throw new Error("down"); } };
    expect((await handleNewsletterCancellation(post(token), failing)).status).toBe(503);
  });
});

describe("public effects stay blocked", () => {
  const sign = (body = "") => {
    const nonce = `nonce-${Math.random().toString(16).slice(2).padEnd(16, "0")}`;
    const signature = signInternalRequest("j".repeat(32), { scope: "jobs", method: "POST", pathname: "/api/internal/jobs/process", timestamp: NOW.getTime(), nonce, body: Buffer.from(body) });
    return new Request("http://localhost/api/internal/jobs/process", { method: "POST", body: body || undefined, headers: { "x-rt-timestamp": String(NOW.getTime()), "x-rt-nonce": nonce, "x-rt-signature": signature } });
  };

  it("holdPublicEffects defers the job without spending an attempt or failing it permanently", async () => {
    const error = await holdPublicEffects({} as JobRecord, context()).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(RetryLater);
    expect(error).not.toBeInstanceOf(PermanentFailure);
    expect((error as RetryLater).deferral).toBe(true);
  });

  it("a public Broadcast handler never touches the provider, even when injected directly", async () => {
    const env = setup({ mode: "public" });
    const provider: BroadcastProvider = {
      listContacts: vi.fn(), createBroadcast: vi.fn(), sendBroadcast: vi.fn(), getBroadcast: vi.fn(), upsertContact: vi.fn(), removeContact: vi.fn(),
    } as unknown as BroadcastProvider;
    const handler = createBroadcastHandler(env.store, { ...env.deps.broadcast!, mode: "public", provider }, () => NOW, SECRET);
    await expect(handler({ id: "jb_x", kind: JOB_KINDS.newsletterBroadcast, payload: {} } as JobRecord, context())).rejects.toBeInstanceOf(RetryLater);
    for (const fn of Object.values(provider)) expect(fn).not.toHaveBeenCalled();
  });

  it("the job stays pending after a held attempt", async () => {
    const env = setup({ mode: "public" });
    await env.store.transaction(async (tx) => { await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterBroadcast, key: "x" }, NOW); });
    const handler = createBroadcastHandler(env.store, { ...env.deps.broadcast!, mode: "public" }, () => NOW, SECRET);
    const summary = await processJobs(env.store, { [JOB_KINDS.newsletterBroadcast]: handler }, { now: () => NOW, limit: 1, leaseMs: 60_000, handlerTimeoutMs: 5_000 });
    expect(summary).toMatchObject({ claimed: 1, retried: 1, dead: 0 });
    const [job] = jobsOf(env.store);
    expect(job.status).toBe("pending");
    expect(job.attempts).toBe(0);
  });

  it("the jobs runner in public defers held kinds without effects or lost attempts, whatever handlers were injected", async () => {
    const env = setup({ mode: "public" });
    await env.store.transaction(async (tx) => {
      await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterBroadcast, key: "a" }, NOW);
      await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterContactSync, key: "b" }, NOW);
    });
    const broadcast = vi.fn(async () => undefined);
    const sync = vi.fn(async () => undefined);
    const deps: Deps = { ...env.deps, jobHandlers: { [JOB_KINDS.newsletterBroadcast]: broadcast, [JOB_KINDS.newsletterContactSync]: sync } };
    const response = await handleJobsProcess(sign(), deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ claimed: 2, retried: 2, dead: 0 });
    expect(broadcast).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
    expect(jobsOf(env.store).every((job) => job.status === "pending" && job.attempts === 0)).toBe(true);
  });

  it("held jobs at the front do not permanently hide an accepted diagnostic", async () => {
    const env = setup({ mode: "public" });
    await env.store.transaction(async tx => {
      for (let index = 0; index < 3; index++) {
        await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterBroadcast, key: `old-${index}` }, new Date(NOW.getTime() - 1000));
      }
      await enqueueJob(tx, SECRET, { kind: JOB_KINDS.diagnosticDiscord, key: "accepted" }, NOW);
    });
    const diagnostic = vi.fn(async () => undefined);
    const response = await handleJobsProcess(sign(), { ...env.deps, jobHandlers: { [JOB_KINDS.diagnosticDiscord]: diagnostic } });
    expect(await response.json()).toMatchObject({ claimed: 4, done: 1, retried: 3, dead: 0 });
    expect(diagnostic).toHaveBeenCalledTimes(1);
    expect(jobsOf(env.store).filter(job => job.kind === JOB_KINDS.newsletterBroadcast).every(job => job.status === "pending" && job.attempts === 0)).toBe(true);
  });

  it("the pilot jobs runner still processes those kinds and public still processes the others", async () => {
    const pilot = setup({ mode: "pilot" });
    await pilot.store.transaction(async (tx) => { await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterContactSync, key: "b" }, NOW); });
    const sync = vi.fn(async () => undefined);
    expect(await (await handleJobsProcess(sign(), { ...pilot.deps, jobHandlers: { [JOB_KINDS.newsletterContactSync]: sync } })).json()).toMatchObject({ claimed: 1, done: 1 });
    expect(sync).toHaveBeenCalledTimes(1);

    const open = publicDiagnostic(setup({ mode: "public" }));
    await handleDiagnostic(postDiagnostic(OUTSIDER), open.deps);
    const sent = vi.fn(async () => undefined);
    const body = (await (await handleJobsProcess(sign(), { ...open.deps, jobHandlers: { [JOB_KINDS.diagnosticDiscord]: sent } })).json()) as { claimed: number };
    expect(body.claimed).toBe(1);
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it("the jobs endpoint keeps authentication in public and stays closed in demo and off", async () => {
    const env = setup({ mode: "public" });
    expect((await handleJobsProcess(new Request("http://localhost/api/internal/jobs/process", { method: "POST" }), env.deps)).status).toBe(401);
    expect((await handleJobsProcess(sign(), { ...env.deps, internalKeys: {} })).status).toBe(503);
    expect((await handleJobsProcess(sign(), { ...env.deps, mode: "demo" })).status).toBe(503);
    expect((await handleJobsProcess(sign(), { ...env.deps, mode: "off" })).status).toBe(503);
    const replay = sign();
    expect((await handleJobsProcess(replay.clone(), env.deps)).status).toBe(200);
    expect((await handleJobsProcess(replay.clone(), env.deps)).status).toBe(401);
  });
});

describe("resend webhook in public", () => {
  const OUTSIDE = "fora@example.com";
  const SUB = opaqueId(SECRET, "sb", `email:${OUTSIDE}`);
  const incoming = (id: string) =>
    new Request(`${ORIGIN}/api/internal/resend/webhook`, { method: "POST", headers: { "content-type": "application/json", "svix-id": id, "svix-timestamp": "1", "svix-signature": "v1,test" }, body: "{}" });

  async function setupOutsider() {
    const env = setup({ mode: "public" });
    const result = await requestSubscriptionConfirmation(env.store, SECRET, { email: OUTSIDE }, NOW);
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    await confirmSubscription(env.store, SECRET, confirmationToken(SECRET, result.confirmationId), NOW, true);
    const config = (mode?: "public"): ResendWebhookConfig => ({
      ...(mode ? { mode } : {}),
      apiKey: "re_test_key", webhookSecret: "whsec_test", idSecret: SECRET, newsletterFrom: env.newsletterEmail.from,
      allowlist: mode ? [] : env.newsletterEmail.allowlist, store: env.store, now: () => new Date(NOW.getTime() + 2000),
      verify: () => ({ type: "contact.updated" as const, created_at: new Date(NOW.getTime() + 1000).toISOString(), data: { email: OUTSIDE, unsubscribed: true } } as never),
    });
    return { env, config };
  }

  it("honors a verified unsubscribe for an address outside the pilot list, idempotently", async () => {
    const { env, config } = await setupOutsider();
    expect((await handleResendWebhook(incoming("evt1"), config("public"))).status).toBe(204);
    expect((await handleResendWebhook(incoming("evt1"), config("public"))).status).toBe(204);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB] as SubscriptionRecord).status).toBe("cancelled");
  });

  it("the pilot configuration keeps ignoring addresses outside its allowlist", async () => {
    const { env, config } = await setupOutsider();
    expect((await handleResendWebhook(incoming("evt1"), config())).status).toBe(204);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB] as SubscriptionRecord).status).toBe("confirmed");
  });

  it("keeps signature verification: a failed verify is a 400 and changes nothing", async () => {
    const { env, config } = await setupOutsider();
    const rejecting = { ...config("public"), verify: () => { throw new Error("bad signature"); } };
    expect((await handleResendWebhook(incoming("evt2"), rejecting)).status).toBe(400);
    expect((await handleResendWebhook(new Request(`${ORIGIN}/api/internal/resend/webhook`, { method: "POST", body: "{}" }), config("public"))).status).toBe(400);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB] as SubscriptionRecord).status).toBe("confirmed");
  });

  it("keeps correlation by provider tag: an unknown delivery tag does not alter any subscription", async () => {
    const { env, config } = await setupOutsider();
    const stray = {
      ...config("public"),
      verify: () => ({ type: "email.failed" as const, created_at: new Date(NOW.getTime() + 1000).toISOString(), data: { email_id: "unknown", from: env.newsletterEmail.from, to: [OUTSIDE], tags: { rt_delivery_id: "dl_unknown" } } } as never),
    };
    expect((await handleResendWebhook(incoming("evt3"), stray)).status).toBe(204);
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB] as SubscriptionRecord).status).toBe("confirmed");
    expect(Object.keys(env.store.dump(COLLECTIONS.newsletterDeliveries))).toHaveLength(0);
  });
});
