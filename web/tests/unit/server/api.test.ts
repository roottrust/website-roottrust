import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { handleDiagnostic, handleReport, handleSubscription } from "../../../src/lib/server/http";
import { opaqueId } from "../../../src/lib/server/ids";
import { resolveBackendMode } from "../../../src/lib/server/mode";
import { requestSubscription, transitionSubscription } from "../../../src/lib/server/repository";
import { createMemoryStore } from "../../../src/lib/server/store";
import { NOW, ORIGIN, SECRET, postDiagnostic, postReport, postSubscription, setup } from "./helpers";

// Limits are relaxed in setup() so these tests exercise validation and persistence; defense.test.ts covers the ceilings.
const post = postDiagnostic;

const contact = { name: " Pessoa de teste ", company: "Empresa", whatsapp: "+55 (11) 94008-4692" };

describe("backend mode", () => {
  it("defaults to off for anything but exact demo/pilot", () => {
    for (const value of [undefined, "", "PILOT", "production", " pilot"]) expect(resolveBackendMode(value)).toBe("off");
    expect(resolveBackendMode("demo")).toBe("demo");
    expect(resolveBackendMode("pilot")).toBe("pilot");
  });

  it("off: 503 without reading the body or touching storage", async () => {
    const { deps, getStore } = setup({ mode: "off" });
    const request = post(contact);
    const response = await handleDiagnostic(request, deps);
    expect(response.status).toBe(503);
    expect(request.bodyUsed).toBe(false);
    expect(getStore).not.toHaveBeenCalled();
  });

  it("demo: validates (400) but never persists nor reports success", async () => {
    const { deps, getStore, store } = setup({ mode: "demo" });
    expect((await handleDiagnostic(post({ ...contact, whatsapp: "1" }), deps)).status).toBe(400);
    const response = await handleDiagnostic(post(contact), deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "demo_mode" });
    expect(getStore).not.toHaveBeenCalled();
    expect(store.dump("leads")).toEqual({});
  });
});

describe("pilot boundaries", () => {
  it("rejects wrong content type, bad JSON, oversize and non-object bodies with 400", async () => {
    const { deps } = setup();
    const cases = [
      post(contact, { headers: { "content-type": "text/plain" } }),
      post("{not json"),
      post({ ...contact, company: "x".repeat(9000) }),
      post([contact]),
      post("null"),
    ];
    for (const request of cases) expect((await handleDiagnostic(request, deps)).status).toBe(400);
  });

  it("rejects extra keys so tool answers/results cannot be stored", async () => {
    const { deps, store } = setup();
    const response = await handleReport(postReport({ email: "a@example.com", toolId: "rosi", result: { rosi: 3 }, answers: [1] }), deps);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ fields: ["result", "answers"] });
    expect(store.dump("leads")).toEqual({});
    expect((await handleReport(postReport({ email: "a@example.com", toolId: "unknown" }), deps)).status).toBe(400);
    expect((await handleReport(postReport({ email: "a@example.com", toolId: "rosi", commercialConsent: "yes" }), deps)).status).toBe(400);
  });

  it("503 when the secret is missing/short or storage fails; never 202", async () => {
    expect((await handleDiagnostic(post(contact), setup({ idSecret: undefined }).deps)).status).toBe(503);
    expect((await handleDiagnostic(post(contact), setup({ idSecret: "short" }).deps)).status).toBe(503);
    const failing = setup().deps;
    failing.getStore = async () => {
      throw new Error("boom with contact@example.com");
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await handleDiagnostic(post(contact), failing);
    expect(response.status).toBe(503);
    expect(JSON.stringify(spy.mock.calls)).not.toContain("example.com");
    spy.mockRestore();
  });
});

describe("body size cap", () => {
  it("stops reading and cancels the stream once the cap is exceeded, even without Content-Length", async () => {
    const { deps, getStore } = setup();
    let pulled = 0;
    let cancelled = false;
    const chunk = new TextEncoder().encode(" ".repeat(1024));
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(chunk);
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request("http://localhost/api/x", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "10", origin: ORIGIN, "x-real-ip": "203.0.113.7", "x-turnstile-token": "diagnostico:stream" },
      body,
      duplex: "half",
    } as RequestInit);
    const response = await handleDiagnostic(request, deps);
    expect(response.status).toBe(400);
    expect(cancelled).toBe(true);
    expect(pulled).toBeLessThan(20);
    expect(getStore).not.toHaveBeenCalled();
  });

  it("accepts a body exactly at the cap and rejects invalid UTF-8", async () => {
    const { deps } = setup();
    const pad = " ".repeat(8 * 1024 - JSON.stringify(contact).length);
    expect((await handleDiagnostic(post(JSON.stringify(contact) + pad), deps)).status).toBe(202);
    expect((await handleDiagnostic(post(JSON.stringify(contact) + pad + " "), deps)).status).toBe(400);
    const bad = new Request("http://localhost/api/x", { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN, "x-real-ip": "203.0.113.7", "x-turnstile-token": "diagnostico:utf8" }, body: new Uint8Array([0x7b, 0xff, 0x7d]) });
    expect((await handleDiagnostic(bad, deps)).status).toBe(400);
  });
});

describe("persistence", () => {
  it("diagnostic: 202 with a unique request ID per submission; repeats update the same lead", async () => {
    const { deps, store } = setup();
    const first = await handleDiagnostic(post(contact), deps);
    const second = await handleDiagnostic(post({ ...contact, whatsapp: "11940084692" }), deps);
    expect(first.status).toBe(202);
    const { id } = (await first.json()) as { id: string };
    const { id: secondId } = (await second.json()) as { id: string };
    expect(id).toMatch(/^DG-[0-9A-HJKMNP-TV-Z]{10}$/);
    expect(id).not.toContain("94008");
    expect(secondId).not.toBe(id);
    const [leadId, ...otherLeads] = Object.keys(store.dump("leads"));
    expect(otherLeads).toHaveLength(0);
    expect(store.dump("leads")[leadId]).toMatchObject({ name: "Pessoa de teste", whatsapp: "11940084692", interactionCount: 2, commercialConsent: false });
    expect(Object.keys(store.dump("lead_events"))).toHaveLength(2);
    expect(Object.keys(store.dump("diagnostics")).sort()).toEqual([id, secondId].sort());
  });

  it("concurrent identical diagnostics keep one lead and count every interaction", async () => {
    const { deps, store } = setup({ limits: { diagnosticWhatsappDaily: 100 } });
    await Promise.all(Array.from({ length: 10 }, () => handleDiagnostic(post(contact), deps)));
    const leads = Object.values(store.dump("leads")) as { interactionCount: number }[];
    expect(leads).toHaveLength(1);
    expect(leads[0].interactionCount).toBe(10);
  });

  it("report: stores only email/tool origin; absent consent is never authorization and is never revoked silently", async () => {
    const { deps, store } = setup();
    const id = opaqueId(SECRET, "ld", "email:leitor@example.com");
    expect((await handleReport(postReport({ email: " Leitor@Example.com ", toolId: "rosi" }), deps)).status).toBe(202);
    expect(store.dump("leads")[id]).toMatchObject({ commercialConsent: false, origins: ["relatorio:rosi"] });
    await handleReport(postReport({ email: "leitor@example.com", toolId: "shadow-ai", commercialConsent: true }), deps);
    await handleReport(postReport({ email: "leitor@example.com", toolId: "shadow-ai" }), deps);
    const lead = store.dump("leads")[id] as { commercialConsent: boolean; origins: string[]; commercialConsentAt: string };
    expect(lead).toMatchObject({ commercialConsent: true, origins: ["relatorio:rosi", "relatorio:shadow-ai"], commercialConsentAt: NOW.toISOString() });
    expect(Object.keys(lead)).not.toContain("answers");
  });

  it("diagnostic and report identities are not merged", async () => {
    const { deps, store } = setup();
    await handleDiagnostic(post(contact), deps);
    await handleReport(postReport({ email: "a@example.com", toolId: "rosi" }), deps);
    expect(Object.keys(store.dump("leads"))).toHaveLength(2);
  });

  it("subscription: identical 202 body for new and existing addresses; confirmed/cancelled are untouched", async () => {
    const { deps, store } = setup();
    const body = { email: "leitor@example.com", editionSlug: "backup-e-recuperacao" };
    const first = await handleSubscription(postSubscription(body), deps);
    const id = opaqueId(SECRET, "sb", "email:leitor@example.com");
    expect(await transitionSubscription(store, id, "pending", "confirmed", NOW)).toBe("ok");
    const again = await handleSubscription(postSubscription({ email: "leitor@example.com", editionSlug: "outra-edicao" }), deps);
    expect(first.status).toBe(202);
    expect(await again.json()).toEqual(await first.json());
    expect(store.dump("subscriptions")[id]).toMatchObject({ status: "confirmed", requestedEditionSlug: "backup-e-recuperacao" });
    expect((await handleSubscription(postSubscription({ email: "a@example.com", editionSlug: "Bad Slug" }), deps)).status).toBe(400);
  });

  it("pending subscription keeps the latest requested edition", async () => {
    const store = createMemoryStore();
    await requestSubscription(store, SECRET, { email: "a@example.com", editionSlug: "um" }, NOW);
    await requestSubscription(store, SECRET, { email: "a@example.com" }, NOW);
    await requestSubscription(store, SECRET, { email: "a@example.com", editionSlug: "dois" }, NOW);
    expect(Object.values(store.dump("subscriptions"))).toMatchObject([{ status: "pending", requestedEditionSlug: "dois" }]);
  });
});

describe("transactions", () => {
  it("allows exactly one winner per ID for concurrent transitions", async () => {
    const store = createMemoryStore();
    await requestSubscription(store, SECRET, { email: "a@example.com" }, NOW);
    const id = opaqueId(SECRET, "sb", "email:a@example.com");
    const results = await Promise.all(Array.from({ length: 20 }, () => transitionSubscription(store, id, "pending", "confirmed", NOW)));
    expect(results.filter((r) => r === "ok")).toHaveLength(1);
    expect(results.filter((r) => r === "conflict")).toHaveLength(19);
    expect(await transitionSubscription(store, "sb_missing", "pending", "confirmed", NOW)).toBe("not_found");
  });

  it("rolls back every write when the transaction throws", async () => {
    const store = createMemoryStore();
    await expect(store.transaction(async (tx) => {
      tx.set("leads", "x", { id: "x" });
      throw new Error("abort");
    })).rejects.toThrow("abort");
    expect(store.dump("leads")).toEqual({});
    expect(await store.transaction(async (tx) => tx.get("leads", "x"))).toBeUndefined();
  });
});

describe("server isolation", () => {
  // Server-only readers of the public catalog (Server Components; never imported from "use client" files).
  const SERVER_READERS = ["src/features/newsletter/source.ts", "src/features/newsletter/current.ts"];

  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });

  it("only server code and API routes import lib/server", () => {
    const offenders = walk("src").filter((file) => {
      const normalized = file.replaceAll("\\", "/");
      if (normalized.startsWith("src/lib/server/") || normalized.startsWith("src/app/api/") || SERVER_READERS.includes(normalized)) return false;
      return /from\s+["'][^"']*(?:lib\/server|\/server\/|firebase-admin)/.test(readFileSync(file, "utf8"));
    });
    expect(offenders).toEqual([]);
  });

  it("never reads secrets with a NEXT_PUBLIC_ prefix", () => {
    const sources = walk("src/lib/server").map((file) => readFileSync(file, "utf8")).join("\n");
    expect(sources).not.toContain("NEXT_PUBLIC_");
  });
});
