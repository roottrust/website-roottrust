import { afterEach, describe, expect, it, vi } from "vitest";
import { handleDiagnostic, handleReport } from "../../../src/lib/server/http";
import { opaqueId } from "../../../src/lib/server/ids";
import { recordDiagnostic, recordReportRequest, withdrawCommercialConsent } from "../../../src/lib/server/repository";
import { leadRetentionCutoff, purgeInactiveLeads } from "../../../src/lib/server/retention";
import { createFirestoreStore, createMemoryStore, type Store } from "../../../src/lib/server/store";
import { COLLECTIONS, JOB_KINDS, type Collection, type LeadRecord } from "../../../src/lib/server/types";
import { createFakeFirestore, NOW, postDiagnostic, postReport, SECRET, setup } from "./helpers";

const EMAIL = "leitor@example.com";
const PHONE = "11940084692";
const DAY = 24 * 60 * 60_000;
const ago = (days: number) => new Date(NOW.getTime() - days * DAY);
const leadOf = (email: string) => opaqueId(SECRET, "ld", `email:${email}`);
const lead = (store: Store, id: string) => store.transaction((tx) => tx.get<LeadRecord>(COLLECTIONS.leads, id));
const purge = (store: Store, limit = 10) => purgeInactiveLeads(store, SECRET, NOW, limit);

afterEach(() => vi.restoreAllMocks());

describe("origin and commercial consent", () => {
  it("diagnostic and report requests are distinguishable in the data and a diagnostic never authorizes marketing", async () => {
    const { deps, store } = setup();
    await handleDiagnostic(postDiagnostic({ name: "Pessoa de teste", company: "Empresa", whatsapp: PHONE }), deps);
    await handleReport(postReport({ email: EMAIL, toolId: "rosi" }), deps);
    const leads = Object.values(store.dump("leads")) as LeadRecord[];
    expect(leads.find((item) => item.whatsapp)).toMatchObject({ origins: ["diagnostico"], commercialConsent: false });
    expect(leads.find((item) => item.email)).toMatchObject({ origins: ["relatorio:rosi"], commercialConsent: false });
    const events = Object.values(store.dump("lead_events")) as { origin: string; commercialConsent?: boolean }[];
    expect(events.find((item) => item.origin === "diagnostico")).not.toHaveProperty("commercialConsent");
    expect(events.find((item) => item.origin === "relatorio:rosi")).toMatchObject({ commercialConsent: false });
  });

  it("only a boolean true checkbox grants consent, recording its origin; strings and absence do not", async () => {
    const { deps, store } = setup({ limits: { reportToolDaily: 100, reportEmailDaily: 100 } });
    for (const bad of ["true", 1, "on", null]) {
      expect((await handleReport(postReport({ email: EMAIL, toolId: "rosi", commercialConsent: bad }), deps)).status).toBe(400);
    }
    await handleReport(postReport({ email: EMAIL, toolId: "rosi" }), deps);
    expect(await lead(store, leadOf(EMAIL))).toMatchObject({ commercialConsent: false });
    await handleReport(postReport({ email: EMAIL, toolId: "shadow-ai", commercialConsent: true }), deps);
    expect(await lead(store, leadOf(EMAIL))).toMatchObject({ commercialConsent: true, commercialConsentOrigin: "relatorio:shadow-ai" });
  });

  it("withdrawal: clears consent, keeps the retention clock, is idempotent, and can be granted again", async () => {
    const store = createMemoryStore();
    const id = leadOf(EMAIL);
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: true }, ago(10));
    expect(await withdrawCommercialConsent(store, SECRET, " Leitor@Example.com ", NOW)).toBe("withdrawn");
    const withdrawn = await lead(store, id);
    expect(withdrawn).toMatchObject({ commercialConsent: false, commercialConsentWithdrawnAt: NOW.toISOString(), lastInteractionAt: ago(10).toISOString() });
    expect(withdrawn).not.toHaveProperty("commercialConsentAt");
    expect(withdrawn).not.toHaveProperty("commercialConsentOrigin");
    const events = Object.values(store.dump("lead_events")) as { origin: string; commercialConsent?: boolean }[];
    expect(events.filter((item) => item.origin === "consentimento:retirada")).toEqual([expect.objectContaining({ commercialConsent: false })]);

    expect(await withdrawCommercialConsent(store, SECRET, EMAIL, NOW)).toBe("no_consent");
    expect(await withdrawCommercialConsent(store, SECRET, "outra@example.com", NOW)).toBe("not_found");
    expect(await withdrawCommercialConsent(store, SECRET, "nao-e-email", NOW)).toBe("invalid_email");

    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: false }, NOW);
    expect(await lead(store, id)).toMatchObject({ commercialConsent: false });
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: true }, NOW);
    const regranted = await lead(store, id);
    expect(regranted).toMatchObject({ commercialConsent: true, commercialConsentAt: NOW.toISOString() });
    expect(regranted).not.toHaveProperty("commercialConsentWithdrawnAt");
  });
});

describe("retention cutoff", () => {
  it("is six calendar months in UTC, clamping the day", () => {
    expect(leadRetentionCutoff(new Date("2026-10-12T12:00:00.000Z")).toISOString()).toBe("2026-04-12T12:00:00.000Z");
    expect(leadRetentionCutoff(new Date("2026-08-31T00:00:00.000Z")).toISOString()).toBe("2026-02-28T00:00:00.000Z");
    expect(leadRetentionCutoff(new Date("2028-08-31T00:00:00.000Z")).toISOString()).toBe("2028-02-29T00:00:00.000Z");
    expect(leadRetentionCutoff(new Date("2026-03-15T00:00:00.000Z")).toISOString()).toBe("2025-09-15T00:00:00.000Z");
  });
});

const stores: Array<[string, () => Store]> = [
  ["memory store", () => createMemoryStore()],
  ["firestore adapter", () => createFirestoreStore(createFakeFirestore() as never)],
];

async function seedDiagnostic(store: Store, at: Date, whatsapp = PHONE) {
  const outcome = await recordDiagnostic(store, SECRET, { name: "Pessoa", company: "Empresa", whatsapp }, at);
  if (!outcome.ok) throw new Error("seed failed");
  return outcome.id;
}
const jobId = (diagnosticId: string) => opaqueId(SECRET, "jb", `${JOB_KINDS.diagnosticDiscord}:${diagnosticId}`);
const exists = (store: Store, collection: Collection, id: string) =>
  store.transaction((tx) => tx.get(collection, id)).then(Boolean);

describe.each(stores)("six-month purge on %s", (_name, make) => {
  it("deletes stale leads with their events, diagnostics and outbox jobs, and keeps recent ones", async () => {
    const store = make();
    const staleDiagnostic = await seedDiagnostic(store, ago(200));
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: true }, ago(200));
    const recentDiagnostic = await seedDiagnostic(store, ago(30), "11988887777");
    await recordReportRequest(store, SECRET, { email: "novo@example.com", toolId: "rosi", commercialConsent: true }, ago(30));
    // exactly at the boundary (6 months) is eligible; a day newer is not
    await recordReportRequest(store, SECRET, { email: "limite@example.com", toolId: "rosi", commercialConsent: false }, leadRetentionCutoff(NOW));
    await recordReportRequest(store, SECRET, { email: "quase@example.com", toolId: "rosi", commercialConsent: false }, new Date(leadRetentionCutoff(NOW).getTime() + DAY));

    expect(await purge(store)).toEqual({ leads: 3, records: 6, partial: 0, failed: 0, deferred: 0 });

    expect(await lead(store, leadOf(EMAIL))).toBeUndefined();
    expect(await lead(store, leadOf("limite@example.com"))).toBeUndefined();
    expect(await lead(store, leadOf("quase@example.com"))).toBeDefined();
    expect(await lead(store, leadOf("novo@example.com"))).toBeDefined();
    expect(await exists(store, COLLECTIONS.diagnostics, staleDiagnostic)).toBe(false);
    expect(await exists(store, COLLECTIONS.jobs, jobId(staleDiagnostic))).toBe(false);
    expect(await exists(store, COLLECTIONS.diagnostics, recentDiagnostic)).toBe(true);
    expect(await exists(store, COLLECTIONS.jobs, jobId(recentDiagnostic))).toBe(true);
    expect(await purge(store)).toEqual({ leads: 0, records: 0, partial: 0, failed: 0, deferred: 0 });
  });

  it("a storage failure leaves the stale lead as the resume marker; the next run finishes without orphans", async () => {
    const store = make();
    const diagnostic = await seedDiagnostic(store, ago(200));
    let calls = 0;
    const flaky: Store = { ...store, transaction: (fn) => (++calls === 2 ? Promise.reject(Object.assign(new Error(`falha ${PHONE}`), { code: "unavailable" })) : store.transaction(fn)) };
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    // transactions: 1 events, 2 diagnostics (fails), 3 lead -> events gone, diagnostic and lead remain
    expect(await purge(flaky)).toEqual({ leads: 0, records: 0, partial: 0, failed: 1, deferred: 0 });
    expect(await lead(store, opaqueId(SECRET, "ld", `whatsapp:${PHONE}`))).toBeDefined();
    expect(await exists(store, COLLECTIONS.diagnostics, diagnostic)).toBe(true);
    const logged = log.mock.calls.map((args) => String(args[0])).join("\n");
    expect(logged).toContain("lead_purge_failed");
    expect(logged).not.toContain(PHONE);
    expect(logged).not.toContain(diagnostic);

    expect(await purge(store)).toMatchObject({ leads: 1, failed: 0, deferred: 0 });
    expect(await exists(store, COLLECTIONS.diagnostics, diagnostic)).toBe(false);
    expect(await exists(store, COLLECTIONS.jobs, jobId(diagnostic))).toBe(false);
    expect(await lead(store, opaqueId(SECRET, "ld", `whatsapp:${PHONE}`))).toBeUndefined();
  });

  it("a failing query is reported, not thrown, and a failing lead does not stop the others", async () => {
    const store = make();
    await recordReportRequest(store, SECRET, { email: "a@example.com", toolId: "rosi", commercialConsent: false }, ago(300));
    await recordReportRequest(store, SECRET, { email: "b@example.com", toolId: "rosi", commercialConsent: false }, ago(200));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await purge({ ...store, query: () => Promise.reject(new Error("down")) })).toMatchObject({ leads: 0, failed: 1, deferred: 0 });

    let calls = 0;
    const flaky: Store = { ...store, transaction: (fn) => (++calls === 1 ? Promise.reject(new Error("blip")) : store.transaction(fn)) };
    expect(await purge(flaky)).toMatchObject({ leads: 1, failed: 1, deferred: 0 });
    expect(await lead(store, leadOf("a@example.com"))).toBeDefined();
    expect(await lead(store, leadOf("b@example.com"))).toBeUndefined();
  });

  it("work per run is bounded: a lead with a long history is finished over several runs", async () => {
    const store = make();
    const id = leadOf(EMAIL);
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.leads, id, { id, email: EMAIL, origins: ["relatorio:rosi"], commercialConsent: false, firstSeenAt: ago(300).toISOString(), lastInteractionAt: ago(200).toISOString(), interactionCount: 210 });
      for (let n = 0; n < 210; n += 1) tx.set(COLLECTIONS.leadEvents, `ev_${n}`, { id: `ev_${n}`, leadId: id, origin: "relatorio:rosi", at: ago(200).toISOString() });
    });
    expect(await purge(store)).toEqual({ leads: 0, records: 200, partial: 1, failed: 0, deferred: 0 });
    expect(await lead(store, id)).toBeDefined();
    expect(await purge(store)).toEqual({ leads: 1, records: 10, partial: 0, failed: 0, deferred: 0 });
    expect(await lead(store, id)).toBeUndefined();
  });

  it("deletes every child of a stale lead even when the withdrawal event is recent (withdrawn 1 month ago, last interaction 7 months ago)", async () => {
    const store = make();
    const id = leadOf(EMAIL);
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: true }, ago(210));
    expect(await withdrawCommercialConsent(store, SECRET, EMAIL, ago(30))).toBe("withdrawn");
    expect(await lead(store, id)).toMatchObject({ lastInteractionAt: ago(210).toISOString() });
    expect(await store.queryEquals(COLLECTIONS.leadEvents, "leadId", id, 10)).toHaveLength(2);

    expect(await purge(store)).toEqual({ leads: 1, records: 3, partial: 0, failed: 0, deferred: 0 });
    expect(await lead(store, id)).toBeUndefined();
    expect(await store.queryEquals(COLLECTIONS.leadEvents, "leadId", id, 10)).toHaveLength(0);
  });

  it("a lead touched during the purge keeps its recent records", async () => {
    const store = make();
    const id = leadOf(EMAIL);
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: true }, ago(200));
    let touched = false;
    const racing: Store = {
      ...store,
      queryEquals: async (...args) => {
        if (!touched) {
          touched = true;
          await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "shadow-ai", commercialConsent: false }, NOW);
        }
        return store.queryEquals(...args);
      },
    };
    expect(await purge(racing)).toMatchObject({ leads: 0, partial: 1, failed: 0, deferred: 0 });
    expect(await lead(store, id)).toMatchObject({ commercialConsent: true, interactionCount: 2 });
    const events = await store.queryEquals(COLLECTIONS.leadEvents, "leadId", id, 10);
    expect(events).toHaveLength(2);
  });
});

describe("job runner integration", () => {
  let runs = 0;
  async function runJobs(deps: ReturnType<typeof setup>["deps"]) {
    const { handleJobsProcess } = await import("../../../src/lib/server/http");
    const { signInternalRequest } = await import("../../../src/lib/server/internal-auth");
    const path = "/api/internal/jobs/process";
    const timestamp = NOW.getTime();
    const nonce = `n${(runs += 1)}`.padEnd(24, "n");
    const signature = signInternalRequest("j".repeat(32), { scope: "jobs", method: "POST", pathname: path, timestamp, nonce, body: new Uint8Array() });
    return handleJobsProcess(
      new Request(`http://localhost${path}`, { method: "POST", headers: { "x-rt-timestamp": String(timestamp), "x-rt-nonce": nonce, "x-rt-signature": signature } }),
      deps,
    );
  }

  it("handleJobsProcess reports lead purging", async () => {
    const { deps, store } = setup();
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: false }, ago(200));
    const response = await runJobs(deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ leadPurge: { leads: 1, failed: 0, deferred: 0 }, deadlineReached: false });
    expect(Object.keys(store.dump("leads"))).toHaveLength(0);
  });

  it("an exhausted time budget defers retention visibly and the next run finishes it", async () => {
    const { deps, store } = setup();
    await recordReportRequest(store, SECRET, { email: EMAIL, toolId: "rosi", commercialConsent: false }, ago(200));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    // first reading is the request start; every later one is past the 60 s route limit
    const readings = [0];
    const exhausted = { ...deps, clock: () => readings.shift() ?? 60_000 };
    const body = await (await runJobs(exhausted)).json();
    expect(body).toMatchObject({ leadPurge: { leads: 0, deferred: 1 }, purged: 0, deadlineReached: true });
    expect(Object.keys(store.dump("leads"))).toHaveLength(1);

    const next = await (await runJobs(deps)).json();
    expect(next).toMatchObject({ leadPurge: { leads: 1, deferred: 0 }, deadlineReached: false });
    expect(Object.keys(store.dump("leads"))).toHaveLength(0);
  });
});
