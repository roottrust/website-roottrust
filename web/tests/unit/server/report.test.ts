import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { defaultDeps, handleReport } from "../../../src/lib/server/http";
import { processJobs } from "../../../src/lib/server/jobs";
import {
  IDEMPOTENCY_WINDOW_MS,
  createReportHandler,
  loadReportConfig,
  resolveReportAvailability,
  type MailMessage,
  type ReportConfig,
} from "../../../src/lib/server/report";
import { purgeInactiveLeads } from "../../../src/lib/server/retention";
import { JOB_KINDS, TOOL_IDS, type EmailQuotaRecord, type JobRecord, type LeadRecord, type ReportDeliveryRecord } from "../../../src/lib/server/types";
import { createFirestoreStore, type Store } from "../../../src/lib/server/store";
import { NOW, SECRET, createFakeFirestore, postReport, setup } from "./helpers";

type Env = ReturnType<typeof setup>;
const EMAIL = "leitor@example.com";
const HOUR = 60 * 60_000;

const deliveries = (store: Env["store"]) => Object.values(store.dump("report_deliveries")) as ReportDeliveryRecord[];
const jobs = (store: Env["store"]) => Object.values(store.dump("jobs")) as JobRecord[];
const quota = (store: Env["store"]) => store.dump("email_quota") as Record<string, EmailQuotaRecord>;

async function request(deps: Env["deps"], body: Record<string, unknown> = { email: EMAIL, toolId: "rosi" }) {
  const response = await handleReport(postReport(body), deps);
  expect(response.status).toBe(202);
}

function runner(env: Env, at: () => Date, report: ReportConfig = env.report) {
  const handler = createReportHandler(env.store, report, at);
  return () => processJobs(env.store, { [JOB_KINDS.reportEmail]: handler }, { now: at, limit: 10, leaseMs: 60_000, handlerTimeoutMs: 5_000 });
}

const fixed = () => NOW;

describe("report request", () => {
  it("stores one delivery and one job per request, holding no answers or results", async () => {
    const env = setup();
    await request(env.deps);
    await request(env.deps, { email: EMAIL, toolId: "shadow-ai" });
    expect(deliveries(env.store)).toHaveLength(2);
    expect(jobs(env.store)).toHaveLength(2);
    const stored = JSON.stringify([deliveries(env.store), jobs(env.store), env.store.dump("lead_events")]);
    expect(stored).not.toMatch(/answers|result|resultado/i);
    for (const job of jobs(env.store)) expect(Object.keys(job.payload)).toEqual(["requestId"]);
    const response = await handleReport(postReport({ email: EMAIL, toolId: "rosi", answers: [1], result: { rosi: 3 } }), env.deps);
    expect(response.status).toBe(400);
  });

  it("without the checkbox the lead gets no commercial consent; with it, consent is recorded", async () => {
    const env = setup();
    await request(env.deps);
    const leads = () => Object.values(env.store.dump("leads")) as LeadRecord[];
    expect(leads()[0].commercialConsent).toBe(false);
    await request(env.deps, { email: EMAIL, toolId: "shadow-ai", commercialConsent: true });
    expect(leads()[0]).toMatchObject({ commercialConsent: true, commercialConsentOrigin: "relatorio:shadow-ai" });
  });

  it("answers 503 not_operational in pilot without the report configuration", async () => {
    const env = setup();
    const response = await handleReport(postReport({ email: EMAIL, toolId: "rosi" }), { ...env.deps, report: undefined });
    expect(response.status).toBe(503);
    expect(deliveries(env.store)).toHaveLength(0);
  });

  it("the default dependencies register the e-mail handler only when the report is configured", () => {
    const ready = { RESEND_API_KEY: "re_x", REPORT_EMAIL_FROM: "a@roottrust.test", REPORT_EMAIL_REPLY_TO: "b@roottrust.test", RESEND_DOMAIN_CONFIRMED: "true", JOBS_TRIGGER_CONFIRMED: "true", NEWSLETTER_PILOT_ALLOWLIST: EMAIL };
    expect(Object.keys(defaultDeps(ready).jobHandlers ?? {})).toEqual([JOB_KINDS.reportEmail]);
    expect(Object.keys(defaultDeps({}).jobHandlers ?? {})).toEqual([]);
  });
});

describe("report e-mail job", () => {
  it("permanently blocks a queued recipient removed from the allowlist before PDF access or quota reservation", async () => {
    const env = setup();
    await request(env.deps);
    const readPdf = vi.fn(env.report.readPdf!);
    const report = { ...env.report, allowlist: [], readPdf };
    const handler = createReportHandler(env.store, report, fixed);
    await expect(handler(jobs(env.store)[0], { signal: new AbortController().signal })).rejects.toThrow("pilot_recipient_not_allowed");
    expect(await runner(env, fixed, report)()).toMatchObject({ dead: 1 });
    expect(readPdf).not.toHaveBeenCalled();
    expect(env.mailer).not.toHaveBeenCalled();
    expect(quota(env.store)).toEqual({});
    expect(deliveries(env.store)[0].sentAt).toBeUndefined();
  });

  it("sends the right PDF per tool with sender, reply-to and a generic body, then never again", async () => {
    const env = setup();
    for (const toolId of TOOL_IDS) await request(env.deps, { email: `${toolId}@example.com`, toolId });
    const real: ReportConfig = { ...env.report, readPdf: undefined };
    expect(await runner(env, fixed, real)()).toMatchObject({ claimed: 4, done: 4 });
    const sent = env.mailer.mock.calls.map(([message]) => message as MailMessage);
    expect(sent).toHaveLength(4);
    const files: Record<string, string> = { rosi: "rosi-v1.pdf", "shadow-ai": "shadow-ai-v1.pdf", "divida-tecnica": "divida-tecnica-v1.pdf", "migracao-para-nuvem": "migracao-nuvem-v1.pdf" };
    for (const message of sent) {
      const toolId = message.to.split("@")[0];
      expect(message.attachment.content.equals(readFileSync(path.join(process.cwd(), "private", "reports", files[toolId])))).toBe(true);
      expect(message.attachment.content.subarray(0, 5).toString()).toBe("%PDF-");
      expect(message.attachment.filename).toBe(`root-trust-${toolId}.pdf`);
      expect(message.replyTo).toBe("contato@roottrust.test");
      expect(message.from).toBe("Root Trust <relatorios@roottrust.test>");
      expect(message.text).toMatch(/não inscreve/);
    }
    expect(await runner(env, fixed, real)()).toMatchObject({ claimed: 0 });
    expect(env.mailer).toHaveBeenCalledTimes(4);
  });

  it("uses one idempotency key per request and drops the e-mail address once sent", async () => {
    const env = setup();
    await request(env.deps);
    await runner(env, fixed)();
    const [delivery] = deliveries(env.store);
    expect(env.mailer.mock.calls[0][1]).toBe(`report-${delivery.id}`);
    expect(delivery).toMatchObject({ sentAt: NOW.toISOString(), resendId: "re_test" });
    expect(delivery.email).toBeUndefined();
    expect(JSON.stringify(env.store.dump("report_deliveries"))).not.toContain(EMAIL);
  });

  it("a missing PDF is a permanent failure and nothing is reserved or sent", async () => {
    const env = setup();
    await request(env.deps);
    const missing: ReportConfig = { ...env.report, readPdf: undefined };
    const cwd = process.cwd();
    process.chdir(path.join(cwd, "src"));
    try {
      expect(await runner(env, fixed, missing)()).toMatchObject({ dead: 1 });
    } finally {
      process.chdir(cwd);
    }
    expect(env.mailer).not.toHaveBeenCalled();
    expect(quota(env.store)).toEqual({});
  });
});

describe("Resend quota", () => {
  it("holds the queue at the daily limit without a false success or a spent attempt, then resumes the next UTC day", async () => {
    const env = setup();
    const report: ReportConfig = { ...env.report, dailyLimit: 2 };
    for (let i = 0; i < 3; i += 1) await request(env.deps, { email: `p${i}@example.com`, toolId: "rosi" });
    expect(await runner(env, fixed, report)()).toMatchObject({ claimed: 3, done: 2, retried: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(2);
    const waiting = jobs(env.store).find((job) => job.status === "pending") as JobRecord;
    expect(waiting.attempts).toBe(0);
    expect(deliveries(env.store).filter((d) => d.sentAt)).toHaveLength(2);
    expect(Date.parse(waiting.dueAt as string)).toBeGreaterThan(NOW.getTime() + 11 * HOUR);

    const tomorrow = new Date(Date.parse("2026-10-13T00:05:00.000Z"));
    expect(await runner(env, () => tomorrow, report)()).toMatchObject({ claimed: 1, done: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(3);
  });

  it("holds the queue at the monthly limit even with daily room", async () => {
    const env = setup();
    const report: ReportConfig = { ...env.report, monthlyLimit: 1 };
    await request(env.deps, { email: "a@example.com", toolId: "rosi" });
    await request(env.deps, { email: "b@example.com", toolId: "rosi" });
    expect(await runner(env, fixed, report)()).toMatchObject({ claimed: 2, done: 1, retried: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(1);
    const nextMonth = new Date("2026-11-01T00:05:00.000Z");
    expect(await runner(env, () => nextMonth, report)()).toMatchObject({ claimed: 1, done: 1 });
  });

  it("concurrent jobs cannot oversubscribe the quota", async () => {
    const env = setup();
    const report: ReportConfig = { ...env.report, dailyLimit: 3 };
    for (let i = 0; i < 6; i += 1) await request(env.deps, { email: `c${i}@example.com`, toolId: "rosi" });
    const handler = createReportHandler(env.store, report, fixed);
    const results = await Promise.allSettled(
      jobs(env.store).map((job) => handler(job, { signal: new AbortController().signal })),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(3);
    expect(env.mailer).toHaveBeenCalledTimes(3);
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(3);
  });

  it("when Resend reports an exhausted quota the reservation is released, the counter catches up and the job waits", async () => {
    const env = setup();
    env.mailer.mockResolvedValueOnce({ ok: false, code: "daily_quota_exceeded", status: 429 });
    await request(env.deps);
    expect(await runner(env, fixed)()).toMatchObject({ retried: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(1);
    const [delivery] = deliveries(env.store);
    expect(delivery.attemptStartedAt).toBeUndefined();
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(100);
    expect(quota(env.store)["qt_month_2026-10"].used).toBe(0);
    expect(jobs(env.store)[0]).toMatchObject({ status: "pending", attempts: 0 });
    // Same day: the local counter now holds the job back without calling Resend again.
    expect(await runner(env, () => new Date(NOW.getTime() + 6 * HOUR))()).toMatchObject({ claimed: 0 });
  });

  it("a definitive provider rejection releases the reservation and kills the job", async () => {
    const env = setup();
    env.mailer.mockResolvedValueOnce({ ok: false, code: "validation_error", status: 422 });
    await request(env.deps);
    expect(await runner(env, fixed)()).toMatchObject({ dead: 1 });
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(0);
  });
});

describe("uncertain outcome and the 24 h idempotency window", () => {
  it("retries with the same key and reservation while the key is alive, with no double count", async () => {
    const env = setup();
    env.mailer.mockResolvedValueOnce({ ok: false, code: "application_error", status: 500 });
    await request(env.deps);
    expect(await runner(env, fixed)()).toMatchObject({ retried: 1 });
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(1);
    expect(deliveries(env.store)[0].attemptStartedAt).toBe(NOW.toISOString());

    const later = new Date(NOW.getTime() + HOUR);
    expect(await runner(env, () => later)()).toMatchObject({ done: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(2);
    expect(env.mailer.mock.calls[0][1]).toBe(env.mailer.mock.calls[1][1]);
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(1);
  });

  it("a thrown error is uncertain as well", async () => {
    const env = setup();
    env.mailer.mockRejectedValueOnce(new Error("socket hang up"));
    await request(env.deps);
    expect(await runner(env, fixed)()).toMatchObject({ retried: 1 });
    expect(deliveries(env.store)[0].sentAt).toBeUndefined();
    expect(deliveries(env.store)[0].attemptStartedAt).toBeDefined();
  });

  it("past the window it does not resend: it flags reconciliation and the job dies", async () => {
    const env = setup();
    env.mailer.mockResolvedValueOnce({ ok: false, code: "application_error", status: 500 });
    await request(env.deps);
    await runner(env, fixed)();
    const late = new Date(NOW.getTime() + IDEMPOTENCY_WINDOW_MS + 60_000);
    expect(await runner(env, () => late)()).toMatchObject({ dead: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(1);
    expect(deliveries(env.store)[0].reconcile).toBe(true);
  });

  it("when recording sentAt fails after the send, the retry reuses the same key and the quota is counted once", async () => {
    const env = setup();
    await request(env.deps);
    let armed = true;
    const flaky: Store = {
      ...env.store,
      transaction: (fn) =>
        env.store.transaction((tx) =>
          fn({
            get: (collection, id) => tx.get(collection, id),
            delete: (collection, id) => tx.delete(collection, id),
            set: (collection, id, value) => {
              if (armed && collection === "report_deliveries" && (value as ReportDeliveryRecord).sentAt) {
                armed = false;
                throw new Error("write_failed");
              }
              tx.set(collection, id, value);
            },
          }),
        ),
    };
    const run = (at: () => Date) =>
      processJobs(flaky, { [JOB_KINDS.reportEmail]: createReportHandler(flaky, env.report, at) }, { now: at, limit: 10, leaseMs: 60_000, handlerTimeoutMs: 5_000 });
    expect(await run(fixed)).toMatchObject({ retried: 1 });
    expect(deliveries(env.store)[0].sentAt).toBeUndefined();
    expect(await run(() => new Date(NOW.getTime() + HOUR))).toMatchObject({ done: 1 });
    expect(env.mailer).toHaveBeenCalledTimes(2);
    expect(env.mailer.mock.calls[0][1]).toBe(env.mailer.mock.calls[1][1]);
    expect(deliveries(env.store)[0]).toMatchObject({ sentAt: expect.any(String), resendId: "re_test" });
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(1);
  });

  it("a sent request is never sent again even if the job runs twice", async () => {
    const env = setup();
    await request(env.deps);
    const [job] = jobs(env.store);
    const handler = createReportHandler(env.store, env.report, fixed);
    await handler(job, { signal: new AbortController().signal });
    await handler(job, { signal: new AbortController().signal });
    expect(env.mailer).toHaveBeenCalledTimes(1);
  });
});

describe("repeated requests for the same e-mail and tool", () => {
  const wide = { limits: { reportToolDaily: 10, reportEmailDaily: 10 } };

  it("the same UTC day keeps one opaque delivery, one job and one quota unit, while the lead still takes the checkbox", async () => {
    const env = setup(wide);
    await request(env.deps);
    await request(env.deps, { email: EMAIL, toolId: "rosi", commercialConsent: true });
    expect(deliveries(env.store)).toHaveLength(1);
    expect(jobs(env.store)).toHaveLength(1);
    expect(deliveries(env.store)[0].id).toMatch(/^rp_[A-Za-z0-9_-]{32}$/);
    expect(deliveries(env.store)[0].id).not.toContain("leitor");
    const [lead] = Object.values(env.store.dump("leads")) as LeadRecord[];
    expect(lead).toMatchObject({ commercialConsent: true, commercialConsentOrigin: "relatorio:rosi", interactionCount: 2 });
    await runner(env, fixed)();
    expect(env.mailer).toHaveBeenCalledTimes(1);
    expect(quota(env.store)["qt_day_2026-10-12"].used).toBe(1);
  });

  it("concurrent identical requests converge on one delivery and one job, each answered 202", async () => {
    const env = setup(wide);
    const db = createFakeFirestore();
    const deps = { ...env.deps, getStore: async () => createFirestoreStore(db as never) };
    const responses = await Promise.all(Array.from({ length: 5 }, () => handleReport(postReport({ email: EMAIL, toolId: "rosi" }), deps)));
    expect(responses.map((response) => response.status)).toEqual([202, 202, 202, 202, 202]);
    const count = (collection: string) => [...db.docs.keys()].filter((path) => path.startsWith(`${collection}/`)).length;
    expect(count("report_deliveries")).toBe(1);
    expect(count("jobs")).toBe(1);
    expect(count("lead_events")).toBe(5);
  });

  it("the next UTC day creates a new delivery", async () => {
    const env = setup(wide);
    await request(env.deps);
    env.clock.now = new Date("2026-10-13T00:05:00.000Z");
    await request(env.deps);
    expect(deliveries(env.store)).toHaveLength(2);
    expect(jobs(env.store)).toHaveLength(2);
  });

  it("a repeat after the e-mail was sent adds nothing and does not send again", async () => {
    const env = setup(wide);
    await request(env.deps);
    await runner(env, fixed)();
    await request(env.deps);
    expect(jobs(env.store)).toHaveLength(1);
    expect(await runner(env, fixed)()).toMatchObject({ claimed: 0 });
    expect(env.mailer).toHaveBeenCalledTimes(1);
  });

  it("a repeat whose job already died is refused, never acknowledged as queued", async () => {
    const env = setup(wide);
    env.mailer.mockResolvedValueOnce({ ok: false, code: "validation_error", status: 422 });
    await request(env.deps);
    await runner(env, fixed)();
    const response = await handleReport(postReport({ email: EMAIL, toolId: "rosi" }), env.deps);
    expect(response.status).toBe(429);
    expect(deliveries(env.store)).toHaveLength(1);
    expect(jobs(env.store)).toHaveLength(1);
  });
});

describe("report availability and retention", () => {
  const READY_ENV = {
    BACKEND_MODE: "pilot",
    TURNSTILE_SITE_KEY: "site-key",
    TURNSTILE_SECRET_KEY: "turnstile-secret-for-tests",
    TURNSTILE_HOSTNAMES: "roottrust.test",
    TRUSTED_ORIGINS: "https://roottrust.test",
    TRUSTED_IP_HEADER: "x-real-ip",
    DATA_ID_SECRET: SECRET,
    INTERNAL_KEY_JOBS: "j".repeat(32),
    RESEND_API_KEY: "re_test_key",
    REPORT_EMAIL_FROM: "Root Trust <relatorios@roottrust.test>",
    REPORT_EMAIL_REPLY_TO: "contato@roottrust.test",
    RESEND_DOMAIN_CONFIRMED: "true",
    JOBS_TRIGGER_CONFIRMED: "true",
    NEWSLETTER_PILOT_ALLOWLIST: EMAIL,
  };

  it("opens only with the full pilot, exposing just mode and site key; each missing piece closes it", () => {
    const ready = resolveReportAvailability(READY_ENV);
    expect(ready).toEqual({ mode: "pilot", siteKey: "site-key" });
    expect(JSON.stringify(ready)).not.toMatch(/re_test|resend/i);
    for (const missing of Object.keys(READY_ENV)) expect(resolveReportAvailability({ ...READY_ENV, [missing]: undefined }), missing).toEqual({ mode: "unavailable" });
    expect(resolveReportAvailability({ ...READY_ENV, RESEND_DOMAIN_CONFIRMED: "false" })).toEqual({ mode: "unavailable" });
    expect(resolveReportAvailability({ ...READY_ENV, REPORT_EMAIL_REPLY_TO: "nope" })).toEqual({ mode: "unavailable" });
    expect(resolveReportAvailability({ ...READY_ENV, FORM_MODE: "demo" })).toEqual({ mode: "demo" });
    expect(resolveReportAvailability({})).toEqual({ mode: "unavailable" });
  });

  it("the environment can only lower the free-plan ceilings", () => {
    expect(loadReportConfig({ ...READY_ENV, REPORT_EMAIL_DAILY_LIMIT: "10", REPORT_EMAIL_MONTHLY_LIMIT: "99999" })).toMatchObject({ dailyLimit: 10, monthlyLimit: 3000 });
    expect(loadReportConfig({ ...READY_ENV, REPORT_EMAIL_DAILY_LIMIT: "0" })?.dailyLimit).toBe(100);
  });

  it("requires a valid nonempty newsletter pilot allowlist, normalizes casing and caps it at 100 identities", () => {
    for (const value of [undefined, "", " , ", "nope", `${EMAIL},nope`]) {
      expect(loadReportConfig({ ...READY_ENV, NEWSLETTER_PILOT_ALLOWLIST: value }), String(value)).toBeUndefined();
    }
    expect(loadReportConfig({ ...READY_ENV, NEWSLETTER_PILOT_ALLOWLIST: " Leitor@Example.COM , Outra@Example.com " })?.allowlist).toEqual([EMAIL, "outra@example.com"]);
    const identities = Array.from({ length: 101 }, (_, i) => `pilot${i}@example.com`);
    expect(loadReportConfig({ ...READY_ENV, NEWSLETTER_PILOT_ALLOWLIST: identities.slice(0, 100).join(",") })?.allowlist).toHaveLength(100);
    expect(loadReportConfig({ ...READY_ENV, NEWSLETTER_PILOT_ALLOWLIST: identities.join(",") })).toBeUndefined();
  });

  it("purging an inactive lead removes its deliveries and their jobs", async () => {
    const env = setup();
    await request(env.deps);
    const later = new Date(NOW.getTime() + 200 * 24 * HOUR);
    const summary = await purgeInactiveLeads(env.store, SECRET, later, 10);
    expect(summary).toMatchObject({ leads: 1, failed: 0 });
    expect(deliveries(env.store)).toHaveLength(0);
    expect(jobs(env.store)).toHaveLength(0);
    expect(env.store.dump("leads")).toEqual({});
  });
});
