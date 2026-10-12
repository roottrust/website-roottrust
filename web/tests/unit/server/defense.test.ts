import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIpKey, loadDefenseConfig } from "../../../src/lib/server/defense";
import { handleDiagnostic, handleReport, handleSubscription } from "../../../src/lib/server/http";
import { DEFAULT_LIMITS, parseLimitOverrides } from "../../../src/lib/server/limits";
import { NOW, ORIGIN, postDiagnostic, postReport, postSubscription, setup } from "./helpers";

const contact = { name: "Pessoa de teste", company: "Empresa", whatsapp: "+55 (11) 94008-4692" };
const subscriber = { email: "pessoa@example.com", editionSlug: "ed-1" };
const report = { email: "pessoa@example.com", toolId: "rosi" };

afterEach(() => vi.restoreAllMocks());

describe("pilot fails closed", () => {
  it("503 without defense config, without id secret, and never persists", async () => {
    for (const options of [{ withDefense: false }, { idSecret: undefined }, { idSecret: "short" }]) {
      const { deps, store, getStore } = setup(options);
      const response = await handleDiagnostic(postDiagnostic(contact), deps);
      expect(response.status).toBe(503);
      expect(getStore).not.toHaveBeenCalled();
      expect(store.dump("leads")).toEqual({});
    }
  });

  it("loadDefenseConfig names missing variables and builds nothing partial", () => {
    expect(loadDefenseConfig({}).config).toBeUndefined();
    expect(loadDefenseConfig({}).missing).toEqual(expect.arrayContaining(["TURNSTILE_SECRET_KEY", "TRUSTED_ORIGINS", "TRUSTED_IP_HEADER"]));
    const ok = loadDefenseConfig({
      TURNSTILE_SECRET_KEY: "x",
      TURNSTILE_HOSTNAMES: "Roottrust.test",
      TRUSTED_ORIGINS: ORIGIN,
      TRUSTED_IP_HEADER: "X-Real-IP",
    });
    expect(ok.config?.turnstileHostnames).toEqual(["roottrust.test"]);
    expect(ok.config?.ipHeader).toBe("x-real-ip");
    expect(
      loadDefenseConfig({ TURNSTILE_SECRET_KEY: "x", TURNSTILE_HOSTNAMES: "a", TRUSTED_ORIGINS: "not a url", TRUSTED_IP_HEADER: "x-real-ip" }).config,
    ).toBeUndefined();
  });

  it("RATE_LIMITS_JSON overrides must be sane positive integers, otherwise fail closed", () => {
    expect(parseLimitOverrides(undefined)).toBeDefined();
    expect(parseLimitOverrides("{bad")).toBeUndefined();
    expect(parseLimitOverrides('{"ipBurst":0}')).toBeUndefined();
    expect(parseLimitOverrides('{"unknown":3}')).toBeUndefined();
    expect(parseLimitOverrides('{"ipBurst":3}')?.ipBurst).toBe(3);
  });

  it("RATE_LIMITS_JSON can only lower the defaults: above-default, fractional and non-number values are refused", () => {
    expect(parseLimitOverrides('{"ipBurst":10,"diagnosticWhatsappDaily":3}')).toEqual(DEFAULT_LIMITS);
    for (const raw of ['{"ipBurst":11}', '{"diagnosticWhatsappDaily":4}', '{"reportToolDaily":2}', '{"ipDaily":1.5}', '{"ipDaily":"5"}', '{"ipDaily":null}', "[]", "null"]) {
      expect(parseLimitOverrides(raw), raw).toBeUndefined();
    }
    expect(parseLimitOverrides('{"ipBurst":2,"ipDaily":5}')).toEqual({ ...DEFAULT_LIMITS, ipBurst: 2, ipDaily: 5 });
  });

  it("IP limiter counts requests that Turnstile later rejects (it runs before verification)", async () => {
    const { deps } = setup({ limits: { ipBurst: 2 } });
    for (let i = 0; i < 2; i += 1) expect((await handleDiagnostic(postDiagnostic(contact, { token: `bad!diagnostico:${i}` }), deps)).status).toBe(403);
    expect((await handleDiagnostic(postDiagnostic(contact), deps)).status).toBe(429);
  });
});

describe("origin and client IP", () => {
  it("403 for foreign or missing origin and cross-site fetch metadata, before reading the body", async () => {
    const { deps, siteverify } = setup();
    for (const options of [{ origin: "https://evil.test" }, { origin: null }, { headers: { "sec-fetch-site": "cross-site" } }]) {
      const request = postDiagnostic(contact, options);
      expect((await handleDiagnostic(request, deps)).status).toBe(403);
      expect(request.bodyUsed).toBe(false);
    }
    expect(siteverify).not.toHaveBeenCalled();
  });

  it("accepts Referer when Origin is absent", async () => {
    const { deps } = setup();
    const response = await handleDiagnostic(postDiagnostic(contact, { origin: null, headers: { referer: `${ORIGIN}/diagnostico` } }), deps);
    expect(response.status).toBe(202);
  });

  it("503 when the trusted IP header is missing or not a single IP", async () => {
    const { deps, siteverify } = setup();
    for (const ip of [null, "1.2.3.4, 5.6.7.8", "not-an-ip"]) {
      expect((await handleDiagnostic(postDiagnostic(contact, { ip }), deps)).status).toBe(503);
    }
    expect(siteverify).not.toHaveBeenCalled();
  });

  it("buckets IPv6 by /64 and unwraps IPv4-mapped addresses", () => {
    const req = (ip: string) => new Request("http://x", { headers: { "x-real-ip": ip } });
    expect(clientIpKey(req("2001:db8:1:2:aaaa::1"), "x-real-ip")).toBe(clientIpKey(req("2001:db8:1:2::ffff"), "x-real-ip"));
    expect(clientIpKey(req("2001:db8:1:3::1"), "x-real-ip")).not.toBe(clientIpKey(req("2001:db8:1:2::1"), "x-real-ip"));
    expect(clientIpKey(req("::ffff:203.0.113.9"), "x-real-ip")).toBe("203.0.113.9");
  });
});

describe("Turnstile", () => {
  it("400 on invalid body is decided before any provider call", async () => {
    const { deps, siteverify } = setup();
    expect((await handleDiagnostic(postDiagnostic({ ...contact, whatsapp: "1" }), deps)).status).toBe(400);
    expect(siteverify).not.toHaveBeenCalled();
  });

  it("403 for missing token, failed challenge, wrong action, wrong hostname and stale challenge; nothing stored", async () => {
    const { deps, store } = setup();
    for (const token of [null, "bad!diagnostico:1", "wrong-action!diagnostico:2", "wrong-host!diagnostico:3", "stale!diagnostico:4"]) {
      const response = await handleDiagnostic(postDiagnostic(contact, { token }), deps);
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ code: "challenge_failed" });
    }
    expect(store.dump("leads")).toEqual({});
  });

  it("sends secret, token and remote IP to siteverify", async () => {
    const { deps, siteverify } = setup();
    await handleDiagnostic(postDiagnostic(contact, { token: "diagnostico:9", ip: "203.0.113.50" }), deps);
    expect(siteverify.calls[0].get("response")).toBe("diagnostico:9");
    expect(siteverify.calls[0].get("secret")).toBe("turnstile-secret-for-tests");
    expect(siteverify.calls[0].get("remoteip")).toBe("203.0.113.50");
  });

  it("a token is single use, also across concurrent requests (one winner, one provider call)", async () => {
    const { deps, siteverify } = setup({ limits: { diagnosticWhatsappDaily: 100 } });
    const responses = await Promise.all(
      Array.from({ length: 5 }, (_, i) => handleDiagnostic(postDiagnostic(contact, { token: "diagnostico:same", ip: `203.0.113.${i + 1}` }), deps)),
    );
    const statuses = responses.map((r) => r.status);
    expect(statuses.filter((s) => s === 202)).toHaveLength(1);
    expect(statuses.filter((s) => s === 403)).toHaveLength(4);
    expect(siteverify).toHaveBeenCalledTimes(1);
  });

  it("provider down or internal-error: 503", async () => {
    const { deps } = setup();
    for (const token of ["down!diagnostico:1", "internal!diagnostico:2"]) {
      const response = await handleDiagnostic(postDiagnostic(contact, { token }), deps);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ code: "challenge_unavailable" });
    }
  });

  it("the token reservation is released after a transient provider failure", async () => {
    const { deps, defense } = setup();
    let calls = 0;
    defense.fetch = (async () => {
      calls += 1;
      return calls === 1
        ? new Response("x", { status: 500 })
        : Response.json({ success: true, action: "diagnostico", hostname: "roottrust.test", challenge_ts: NOW.toISOString() });
    }) as typeof fetch;
    expect((await handleDiagnostic(postDiagnostic(contact, { token: "t-retry" }), deps)).status).toBe(503);
    expect((await handleDiagnostic(postDiagnostic(contact, { token: "t-retry" }), deps)).status).toBe(202);
  });

  it("a hanging provider is aborted by the timeout and answers 503", async () => {
    const { deps, defense } = setup();
    defense.fetch = ((_url: unknown, init?: RequestInit) =>
      new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "TimeoutError")));
      })) as typeof fetch;
    const response = await handleDiagnostic(postDiagnostic(contact), deps);
    expect(response.status).toBe(503);
  });

  it("works for subscription and report actions, and rejects a token minted for another action", async () => {
    const { deps } = setup();
    expect((await handleSubscription(postSubscription(subscriber), deps)).status).toBe(202);
    expect((await handleReport(postReport(report), deps)).status).toBe(202);
    expect((await handleReport(postReport({ ...report, email: "outra@example.com" }, { token: "diagnostico:1" }), deps)).status).toBe(403);
  });
});

describe("rate limits", () => {
  it("per-IP burst: 429 with Retry-After before Turnstile is consulted", async () => {
    const { deps, siteverify } = setup({ limits: { ipBurst: 2, diagnosticWhatsappDaily: 100 } });
    for (let i = 0; i < 2; i += 1) {
      expect((await handleDiagnostic(postDiagnostic(contact), deps)).status).toBe(202);
    }
    const calls = siteverify.mock.calls.length;
    const response = await handleDiagnostic(postDiagnostic(contact), deps);
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(siteverify.mock.calls.length).toBe(calls);
    expect((await handleDiagnostic(postDiagnostic(contact, { ip: "198.51.100.1" }), deps)).status).toBe(202);
  });

  it("concurrent requests cannot overshoot the per-IP ceiling", async () => {
    const { deps } = setup({ limits: { ipBurst: 3, diagnosticWhatsappDaily: 100 } });
    const responses = await Promise.all(Array.from({ length: 10 }, () => handleDiagnostic(postDiagnostic(contact), deps)));
    const statuses = responses.map((r) => r.status);
    expect(statuses.filter((s) => s === 202)).toHaveLength(3);
    expect(statuses.filter((s) => s === 429)).toHaveLength(7);
  });

  it("whatsapp ceiling is atomic under concurrency and denied attempts store no extra lead", async () => {
    const { deps, store } = setup();
    const responses = await Promise.all(Array.from({ length: 8 }, () => handleDiagnostic(postDiagnostic(contact), deps)));
    const statuses = responses.map((r) => r.status);
    expect(statuses.filter((s) => s === 202)).toHaveLength(3);
    expect(statuses.filter((s) => s === 429)).toHaveLength(5);
    expect(Object.keys(store.dump("leads"))).toHaveLength(1);
  });

  it("window resets after it expires", async () => {
    const { deps, clock } = setup({ limits: { diagnosticWhatsappDaily: 1 } });
    expect((await handleDiagnostic(postDiagnostic(contact), deps)).status).toBe(202);
    expect((await handleDiagnostic(postDiagnostic(contact), deps)).status).toBe(429);
    clock.now = new Date(NOW.getTime() + 24 * 3600_000 + 1000);
    expect((await handleDiagnostic(postDiagnostic(contact), deps)).status).toBe(202);
  });

  it("subscription and report ceilings", async () => {
    const { deps } = setup();
    expect((await handleSubscription(postSubscription(subscriber), deps)).status).toBe(202);
    expect((await handleSubscription(postSubscription(subscriber), deps)).status).toBe(429);
    expect((await handleReport(postReport(report), deps)).status).toBe(202);
    expect((await handleReport(postReport(report), deps)).status).toBe(429);
  });
});

describe("no PII in logs or error bodies", () => {
  it("storage failures answer a fixed code and log only short codes", async () => {
    const { deps } = setup();
    deps.getStore = async () => {
      throw Object.assign(new Error("pessoa@example.com 94008-4692"), { code: "ECONN" });
    };
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await handleDiagnostic(postDiagnostic(contact), deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "storage_unavailable" });
    const logged = error.mock.calls.flat().join(" ");
    expect(logged).toContain("persistence_failed");
    expect(logged).not.toContain("pessoa");
    expect(logged).not.toContain("94008");
  });
});
