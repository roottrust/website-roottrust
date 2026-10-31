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
import { RetryLater, enqueueJob, processJobs } from "../../../src/lib/server/jobs";
import { isOperationalMode, resolveBackendMode } from "../../../src/lib/server/mode";
import { createBroadcastHandler, loadBroadcastConfig, type BroadcastProvider } from "../../../src/lib/server/newsletter-broadcast";
import { createContactSyncHandler, resolveNewsletterAvailability } from "../../../src/lib/server/newsletter-email";
import { resolveReportAvailability } from "../../../src/lib/server/report";
import { confirmSubscription, requestSubscriptionConfirmation } from "../../../src/lib/server/repository";
import { handleResendWebhook, loadPublicWebhookSender, type ResendWebhookConfig } from "../../../src/lib/server/resend-webhook";
import { COLLECTIONS, JOB_KINDS, type EmailQuotaRecord, type JobRecord, type MarketingBaselineRecord, type SubscriptionRecord } from "../../../src/lib/server/types";
import { NOW, ORIGIN, SECRET, WEBHOOK_URL, postDiagnostic, postReport, postSubscription, setup } from "./helpers";

const contact = { name: "Ana Souza", company: "Acme", whatsapp: "(11) 94008-4692" };
const OUTSIDER = { ...contact, whatsapp: "(21) 98888-7777" };
const publicDiagnostic = (env: ReturnType<typeof setup>) => {
  env.deps.diagnostic = { mode: "public", webhookUrl: WEBHOOK_URL, allowlist: [], fetch: env.discord };
  return env;
};
const jobsOf = (store: ReturnType<typeof setup>["store"]) => Object.values(store.dump(COLLECTIONS.jobs)) as JobRecord[];
const context = () => ({ signal: new AbortController().signal });
const publicEnv = (options: Parameters<typeof setup>[0] = {}) => {
  const env = publicDiagnostic(setup({ mode: "public", ...options }));
  env.deps.newsletterEmail = { ...env.newsletterEmail, mode: "public", allowlist: [] };
  env.deps.report = { ...env.report, mode: "public", allowlist: [] };
  env.deps.broadcast = { ...env.deps.broadcast!, mode: "public", allowlist: [] };
  return env;
};
const seedBaseline = (store: ReturnType<typeof setup>["store"], patch: Partial<MarketingBaselineRecord> = {}) =>
  store.transaction(async (tx) => {
    tx.set(COLLECTIONS.marketingBaseline, "account", { id: "account", complete: true, count: 10, reserved: 0, seq: 0, measuredAt: NOW.toISOString(), ...patch } satisfies MarketingBaselineRecord);
  });
const baselineOf = (store: ReturnType<typeof setup>["store"]) => store.dump(COLLECTIONS.marketingBaseline).account as MarketingBaselineRecord;
const usedToday = (store: ReturnType<typeof setup>["store"]) => (store.dump(COLLECTIONS.emailQuota)[`qt_day_${NOW.toISOString().slice(0, 10)}`] as EmailQuotaRecord | undefined)?.used ?? 0;
const fillDay = (store: ReturnType<typeof setup>["store"], used: number) =>
  store.transaction(async (tx) => {
    const day = NOW.toISOString().slice(0, 10);
    tx.set(COLLECTIONS.emailQuota, `qt_day_${day}`, { id: `qt_day_${day}`, used, expiresAt: "2099-01-01T00:00:00.000Z" } satisfies EmailQuotaRecord);
  });

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

  it("newsletter and report are ready per flow in public, each with its own complete configuration", () => {
    const flow = {
      ...READY_ENV, BACKEND_MODE: "public", RESEND_API_KEY: "re_test_key", RESEND_DOMAIN_CONFIRMED: "true", NEWSLETTER_SITE_ORIGIN: "https://roottrust.test",
      NEWSLETTER_EMAIL_FROM: "Root Trust <newsletter@roottrust.test>", NEWSLETTER_EMAIL_REPLY_TO: "contato@roottrust.test",
      RESEND_NEWSLETTER_SEGMENT_ID: "seg_public_0001", NEWSLETTER_PILOT_SEGMENT_CONFIRMED: "true", RESEND_WEBHOOK_SECRET: "whsec_x",
      REPORT_EMAIL_FROM: "Root Trust <relatorios@roottrust.test>", REPORT_EMAIL_REPLY_TO: "contato@roottrust.test",
    };
    expect(resolveNewsletterAvailability(flow)).toEqual({ mode: "public", siteKey: "site-key" });
    expect(resolveReportAvailability(flow)).toEqual({ mode: "public", siteKey: "site-key" });
    expect(resolveNewsletterAvailability({ ...flow, RESEND_WEBHOOK_SECRET: undefined })).toEqual({ mode: "unavailable" });
    expect(resolveNewsletterAvailability({ ...flow, RESEND_NEWSLETTER_SEGMENT_ID: undefined })).toEqual({ mode: "unavailable" });
    expect(resolveReportAvailability({ ...flow, RESEND_WEBHOOK_SECRET: undefined })).toEqual({ mode: "public", siteKey: "site-key" });
    expect(resolveReportAvailability({ ...flow, REPORT_EMAIL_FROM: undefined })).toEqual({ mode: "unavailable" });
    expect(resolveReportAvailability({ ...flow, BACKEND_MODE: "off" })).toEqual({ mode: "unavailable" });
    expect(JSON.stringify([resolveNewsletterAvailability(flow), resolveReportAvailability(flow)])).not.toMatch(/re_test|whsec|seg_/);
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

describe("public admission of new e-mail addresses", () => {
  it("accepts an address outside the old lists, queues one confirmation and reserves one unit and one marketing slot", async () => {
    const env = publicEnv();
    await seedBaseline(env.store);
    const response = await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps);
    expect(response.status).toBe(202);
    expect(jobsOf(env.store).map((job) => job.kind)).toEqual([JOB_KINDS.newsletterConfirmation]);
    expect(usedToday(env.store)).toBe(1);
    expect(baselineOf(env.store)).toMatchObject({ reserved: 1, seq: 1 });
    const [record] = Object.values(env.store.dump(COLLECTIONS.subscriptions)) as SubscriptionRecord[];
    expect(record.marketingSlotAt).toBe(NOW.toISOString());
    expect(JSON.stringify(await response.clone().json())).not.toMatch(/slot|quota|baseline/i);
  });

  it("a repeated request reuses the reservation and the slot instead of counting twice", async () => {
    const env = publicEnv({ limits: { subscriptionEmailDaily: 5, subscriptionEditionDaily: 5 } });
    await seedBaseline(env.store);
    for (let index = 0; index < 3; index += 1) expect((await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps)).status).toBe(202);
    expect(usedToday(env.store)).toBe(1);
    expect(baselineOf(env.store).reserved).toBe(1);
  });

  it("a missing, partial, stale or full marketing baseline closes admission with a neutral 503 and writes nothing", async () => {
    const stale = new Date(NOW.getTime() - 31 * 60_000).toISOString();
    const cases: Array<[string, Partial<MarketingBaselineRecord> | undefined]> = [
      ["missing", undefined],
      ["partial", { complete: false, reason: "truncated" }],
      ["stale", { measuredAt: stale }],
      ["no free slot", { count: 960 }],
      ["reserved fills the margin", { count: 900, reserved: 60 }],
    ];
    for (const [label, patch] of cases) {
      const env = publicEnv();
      if (patch) await seedBaseline(env.store, patch);
      const response = await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps);
      expect(response.status, label).toBe(503);
      expect(await response.json(), label).toEqual({ code: "unavailable", retryAfter: 300 });
      expect(response.headers.get("retry-after"), label).toBe("300");
      expect(env.store.dump(COLLECTIONS.subscriptions), label).toEqual({});
      expect(env.store.dump(COLLECTIONS.subscriptionConfirmations), label).toEqual({});
      expect(env.store.dump(COLLECTIONS.leads), label).toEqual({});
      expect(jobsOf(env.store), label).toHaveLength(0);
      expect(usedToday(env.store), label).toBe(0);
    }
  });

  it("without e-mail capacity answers a neutral 429 with Retry-After and leaves no partial reservation, lead, consent or job", async () => {
    const env = publicEnv();
    await seedBaseline(env.store);
    await fillDay(env.store, 100);
    const response = await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps);
    expect(response.status).toBe(429);
    const body = (await response.json()) as { code: string; retryAfter: number };
    expect(body.code).toBe("rate_limited");
    expect(body.retryAfter).toBe(12 * 3600);
    expect(response.headers.get("retry-after")).toBe(String(body.retryAfter));
    expect(env.store.dump(COLLECTIONS.subscriptions)).toEqual({});
    expect(env.store.dump(COLLECTIONS.leads)).toEqual({});
    expect(jobsOf(env.store)).toHaveLength(0);
    expect(usedToday(env.store)).toBe(100);
    expect(baselineOf(env.store)).toMatchObject({ reserved: 0, seq: 0 });
  });

  it("report admission is open to any valid address, shares the daily ceiling and never subscribes", async () => {
    const env = publicEnv();
    const response = await handleReport(postReport({ email: "novo@fora.test", toolId: "rosi" }), env.deps);
    expect(response.status).toBe(202);
    expect(usedToday(env.store)).toBe(1);
    expect(env.store.dump(COLLECTIONS.subscriptions)).toEqual({});
    expect(baselineOf(env.store)).toBeUndefined();
    await fillDay(env.store, 100);
    const refused = await handleReport(postReport({ email: "outro@fora.test", toolId: "rosi" }), env.deps);
    expect(refused.status).toBe(429);
    expect(usedToday(env.store)).toBe(100);
  });

  it("public mode without the explicit public configs stays closed instead of inheriting the pilot allowlist", async () => {
    const env = setup({ mode: "public" });
    for (const response of [
      await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps),
      await handleReport(postReport({ email: "novo@fora.test", toolId: "rosi" }), env.deps),
    ]) {
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ code: "not_operational" });
    }
    expect(env.getStore).not.toHaveBeenCalled();
    expect(env.siteverify).not.toHaveBeenCalled();
    expect(env.mailer).not.toHaveBeenCalled();
  });

  it("the defense block still runs in order: origin, validation and Turnstile fail before any storage access", async () => {
    const env = publicEnv();
    await seedBaseline(env.store);
    expect((await handleSubscription(postSubscription({ email: "novo@fora.test" }, { origin: "https://evil.test" }), env.deps)).status).toBe(403);
    expect((await handleSubscription(postSubscription({ email: "invalido" }), env.deps)).status).toBe(400);
    expect((await handleSubscription(postSubscription({ email: "novo@fora.test" }, { token: "bad!1" }), env.deps)).status).toBe(403);
    expect((await handleSubscription(postSubscription({ email: "novo@fora.test" }, { ip: null }), env.deps)).status).toBe(503);
    expect(env.store.dump(COLLECTIONS.subscriptions)).toEqual({});
    expect(usedToday(env.store)).toBe(0);
  });

  it("the pilot keeps its admission and its allowlist guard", async () => {
    const env = setup({ mode: "pilot" });
    expect((await handleSubscription(postSubscription({ email: "leitor@example.com" }), env.deps)).status).toBe(202);
    expect((await handleReport(postReport({ email: "novo@fora.test", toolId: "rosi" }), env.deps)).status).toBe(403);
    const outside = await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps);
    expect(outside.status).toBe(202);
    expect(Object.values(env.store.dump(COLLECTIONS.subscriptions)).map((record) => (record as SubscriptionRecord).email)).toEqual(["leitor@example.com"]);
    expect(env.store.dump(COLLECTIONS.marketingBaseline)).toEqual({});
  });

  it("confirmation works in public with a valid link and keeps the token usable when there is no capacity", async () => {
    const env = publicEnv();
    await seedBaseline(env.store);
    const result = await requestSubscriptionConfirmation(env.store, SECRET, { email: "leitor@example.com" }, NOW, undefined, { marketing: true });
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    const token = confirmationToken(SECRET, result.confirmationId);
    const confirm = (deps: Deps) => handleNewsletterConfirmation(new Request(`${ORIGIN}/api/newsletter/confirmar`, { method: "POST", headers: { origin: ORIGIN, "content-type": "application/json" }, body: JSON.stringify({ token }) }), deps);
    expect((await confirm({ ...env.deps, mode: "demo" })).status).toBe(503);
    expect((await confirm({ ...env.deps, newsletterEmail: { ...env.newsletterEmail } })).status).toBe(503);
    expect((await confirm(env.deps)).status).toBe(200);
    expect(Object.values(env.store.dump(COLLECTIONS.subscriptions)).some((record) => (record as SubscriptionRecord).status === "confirmed")).toBe(true);
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
      // local acceptance never claims remote reconciliation: the pending sync is recorded (and queued) even without a Broadcast config
      expect(jobsOf(env.store).some((job) => job.kind === JOB_KINDS.newsletterContactSync && job.status === "pending")).toBe(true);
      expect(env.store.dump(COLLECTIONS.subscriptions)[SUB_ID]).toMatchObject({ contactSyncState: "pending", contactSyncReason: "cancelled" });
    }
  });

  it("queues the remote contact sync even over quota, and the public handler runs it with the provider", async () => {
    const env = publicEnv();
    const token = await confirmed(env);
    await fillDay(env.store, 100);
    expect((await handleNewsletterCancellation(post(token), env.deps)).status).toBe(200);
    const [sync] = jobsOf(env.store).filter((job) => job.kind === JOB_KINDS.newsletterContactSync && job.status === "pending");
    expect(sync).toBeDefined();
    const provider = vi.fn(async () => undefined);
    await createContactSyncHandler(env.store, env.deps.broadcast!, provider)(sync, context());
    expect(provider).toHaveBeenCalledWith(EMAIL, false, expect.anything(), { reactivate: false });
    expect((env.store.dump(COLLECTIONS.subscriptions)[SUB_ID] as SubscriptionRecord).contactSyncState).toBeUndefined();
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

describe("public effects", () => {
  const sign = (body = "") => {
    const nonce = `nonce-${Math.random().toString(16).slice(2).padEnd(16, "0")}`;
    const signature = signInternalRequest("j".repeat(32), { scope: "jobs", method: "POST", pathname: "/api/internal/jobs/process", timestamp: NOW.getTime(), nonce, body: Buffer.from(body) });
    return new Request("http://localhost/api/internal/jobs/process", { method: "POST", body: body || undefined, headers: { "x-rt-timestamp": String(NOW.getTime()), "x-rt-nonce": nonce, "x-rt-signature": signature } });
  };
  const provider = (emails: string[], complete = true): BroadcastProvider => ({
    listContacts: vi.fn(async () => ({ ok: true as const, value: { emails, complete } })),
    createDraft: vi.fn(async () => ({ ok: true as const, value: { id: "bc_1" } })),
    get: vi.fn(), findByName: vi.fn(), send: vi.fn(),
  }) as unknown as BroadcastProvider;

  async function confirmedSubscriber(env: ReturnType<typeof setup>, email: string, syncDone = true) {
    const result = await requestSubscriptionConfirmation(env.store, SECRET, { email }, NOW);
    if (!result.ok || result.action !== "confirmation_requested") throw new Error("expected confirmation");
    await confirmSubscription(env.store, SECRET, confirmationToken(SECRET, result.confirmationId), NOW, !syncDone);
    return opaqueId(SECRET, "sb", `email:${email}`);
  }

  it("a public Broadcast handler refuses a segment with an unconfirmed or unknown contact before create or send", async () => {
    const env = publicEnv();
    await env.store.transaction(async (tx) => { await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterBroadcast, key: "x" }, NOW); });
    await confirmedSubscriber(env, "ok@fora.test");
    for (const emails of [["ok@fora.test", "desconhecido@fora.test"], ["desconhecido@fora.test"]]) {
      const listed = provider(emails);
      const handler = createBroadcastHandler(env.store, { ...env.deps.broadcast!, provider: listed }, () => NOW, SECRET);
      const error = await handler({ id: "jb_x", kind: JOB_KINDS.newsletterBroadcast, payload: {} } as JobRecord, context()).catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(Error);
      expect(listed.createDraft).not.toHaveBeenCalled();
      expect(listed.send).not.toHaveBeenCalled();
    }
  });

  it("the jobs runner in public runs the handlers it was given and leaves unregistered kinds pending", async () => {
    const env = publicEnv();
    await env.store.transaction(async (tx) => {
      await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterBroadcast, key: "a" }, NOW);
      await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterContactSync, key: "b" }, NOW);
    });
    const sync = vi.fn(async () => undefined);
    const response = await handleJobsProcess(sign(), { ...env.deps, jobHandlers: { [JOB_KINDS.newsletterContactSync]: sync } });
    expect(response.status).toBe(200);
    expect(sync).toHaveBeenCalledTimes(1);
    expect(jobsOf(env.store).filter((job) => job.kind === JOB_KINDS.newsletterBroadcast).every((job) => job.status === "pending" && job.attempts === 0)).toBe(true);
  });

  it("the authenticated jobs flow prepares the marketing baseline, and an inconclusive scan only closes admission", async () => {
    const env = publicEnv();
    const complete = vi.fn(async () => ({ complete: true as const, emails: ["a@x.test", "b@x.test"] }));
    const body = (await (await handleJobsProcess(sign(), { ...env.deps, accountScan: complete })).json()) as { marketingBaseline?: string };
    expect(body.marketingBaseline).toBe("measured");
    expect(baselineOf(env.store)).toMatchObject({ complete: true, count: 2, reserved: 0 });
    expect((await handleSubscription(postSubscription({ email: "novo@fora.test" }), env.deps)).status).toBe(202);

    const partial = publicEnv();
    await seedBaseline(partial.store, { measuredAt: new Date(NOW.getTime() - 20 * 60_000).toISOString() });
    const bad = vi.fn(async () => ({ complete: false as const, reason: "truncated" }));
    expect(((await (await handleJobsProcess(sign(), { ...partial.deps, accountScan: bad })).json()) as { marketingBaseline?: string }).marketingBaseline).toBe("closed");
    expect(baselineOf(partial.store)).toMatchObject({ complete: false, reason: "truncated" });
    expect((await handleSubscription(postSubscription({ email: "novo@fora.test" }), partial.deps)).status).toBe(503);

    const thrown = publicEnv();
    const boom = vi.fn(async () => { throw new Error("network"); });
    expect(((await (await handleJobsProcess(sign(), { ...thrown.deps, accountScan: boom })).json()) as { marketingBaseline?: string }).marketingBaseline).toBe("closed");
  });

  it("the pilot jobs runner never touches the account and keeps processing sync", async () => {
    const pilot = setup({ mode: "pilot" });
    await pilot.store.transaction(async (tx) => { await enqueueJob(tx, SECRET, { kind: JOB_KINDS.newsletterContactSync, key: "b" }, NOW); });
    const sync = vi.fn(async () => undefined);
    const scan = vi.fn(async () => ({ complete: true as const, emails: [] }));
    const body = (await (await handleJobsProcess(sign(), { ...pilot.deps, accountScan: scan, jobHandlers: { [JOB_KINDS.newsletterContactSync]: sync } })).json()) as Record<string, unknown>;
    expect(body).toMatchObject({ claimed: 1, done: 1 });
    expect(body).not.toHaveProperty("marketingBaseline");
    expect(scan).not.toHaveBeenCalled();
  });

  it("public still processes the diagnostic", async () => {
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
