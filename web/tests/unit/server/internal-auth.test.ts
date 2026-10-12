import { describe, expect, it } from "vitest";
import { handleJobsProcess } from "../../../src/lib/server/http";
import { authenticateInternal, loadInternalKeys, signInternalRequest, SKEW_MS, type InternalScope } from "../../../src/lib/server/internal-auth";
import { createMemoryStore } from "../../../src/lib/server/store";
import { NOW, SECRET, setup } from "./helpers";

const KEY_JOBS = "j".repeat(40);
const KEY_DRAFT = "d".repeat(40);
const PATH = "/api/internal/jobs/process";

let seq = 0;
function signed(options: { scope?: InternalScope; key?: string; body?: string; path?: string; at?: number; nonce?: string; method?: string } = {}) {
  const { scope = "jobs", key = KEY_JOBS, body = "", path = PATH, at = NOW.getTime(), method = "POST" } = options;
  seq += 1;
  const nonce = options.nonce ?? `nonce-${String(seq).padStart(16, "0")}`;
  const signature = signInternalRequest(key, { scope, method, pathname: path, timestamp: at, nonce, body: Buffer.from(body) });
  return new Request(`http://localhost${PATH}`, {
    method,
    body: body || undefined,
    headers: { "x-rt-timestamp": String(at), "x-rt-nonce": nonce, "x-rt-signature": signature },
  });
}

const auth = (request: Request, store = createMemoryStore(), now = NOW) =>
  authenticateInternal(request, { scope: "jobs", keys: { jobs: [KEY_JOBS], draft: [KEY_DRAFT] }, store, idSecret: SECRET, now, maxBodyBytes: 1024 });

describe("loadInternalKeys", () => {
  it("parses rotation lists and rejects short or shared keys (fail closed)", () => {
    expect(loadInternalKeys({ INTERNAL_KEY_JOBS: `${KEY_JOBS},${"p".repeat(40)}` })?.jobs).toHaveLength(2);
    expect(loadInternalKeys({ INTERNAL_KEY_JOBS: "short" })).toBeUndefined();
    expect(loadInternalKeys({ INTERNAL_KEY_JOBS: KEY_JOBS, INTERNAL_KEY_DRAFT: KEY_JOBS })).toBeUndefined();
    expect(loadInternalKeys({})).toEqual({});
  });
});

describe("authenticateInternal", () => {
  it("accepts a valid signed request and returns the body", async () => {
    const result = await auth(signed({ body: "{}" }));
    expect(result.ok).toBe(true);
  });

  it("rejects another scope's key, a tampered body/path/method, and a wrong signature", async () => {
    expect(await auth(signed({ key: KEY_DRAFT }))).toMatchObject({ ok: false, reason: "bad_signature" });
    expect(await auth(signed({ scope: "draft", key: KEY_DRAFT }))).toMatchObject({ ok: false, reason: "bad_signature" });
    expect(await auth(signed({ path: "/api/internal/other" }))).toMatchObject({ ok: false, reason: "bad_signature" });
    const post = signed({ body: "x" });
    const put = new Request(post.url, { method: "PUT", body: "x", headers: post.headers });
    expect(await auth(put)).toMatchObject({ ok: false, reason: "bad_signature" });
    const original = signed({ body: "a" });
    const tampered = new Request(original.url, { method: "POST", body: "b", headers: original.headers });
    expect(await auth(tampered)).toMatchObject({ ok: false, reason: "bad_signature" });
  });

  it("rejects missing or malformed headers and clock skew beyond the window", async () => {
    expect(await auth(new Request(`http://localhost${PATH}`, { method: "POST" }))).toMatchObject({ ok: false, status: 401, reason: "malformed" });
    expect(await auth(signed({ at: NOW.getTime() - SKEW_MS - 1 }))).toMatchObject({ ok: false, reason: "bad_timestamp" });
    expect(await auth(signed({ at: NOW.getTime() + SKEW_MS + 1 }))).toMatchObject({ ok: false, reason: "bad_timestamp" });
    expect((await auth(signed({ at: NOW.getTime() - SKEW_MS }))).ok).toBe(true);
  });

  it("rejects oversized bodies", async () => {
    expect(await auth(signed({ body: "x".repeat(2000) }))).toMatchObject({ ok: false, status: 400, reason: "too_large" });
  });

  it("a replayed request is refused; concurrent replays have exactly one winner", async () => {
    const store = createMemoryStore();
    const first = signed({ nonce: "replay-nonce-0000001" });
    expect((await auth(first.clone(), store)).ok).toBe(true);
    expect(await auth(first.clone(), store)).toMatchObject({ ok: false, reason: "replay" });

    const race = signed({ nonce: "replay-nonce-0000002" });
    const results = await Promise.all(Array.from({ length: 6 }, () => auth(race.clone(), store)));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it("a failed signature does not consume the nonce", async () => {
    const store = createMemoryStore();
    await auth(signed({ key: "x".repeat(40), nonce: "same-nonce-00000001" }), store);
    expect((await auth(signed({ nonce: "same-nonce-00000001" }), store)).ok).toBe(true);
  });

  it("accepts the previous key during rotation", async () => {
    const previous = "o".repeat(40);
    const result = await authenticateInternal(signed({ key: previous }), {
      scope: "jobs",
      keys: { jobs: [KEY_JOBS, previous] },
      store: createMemoryStore(),
      idSecret: SECRET,
      now: NOW,
      maxBodyBytes: 1024,
    });
    expect(result.ok).toBe(true);
  });
});

describe("handleJobsProcess", () => {
  it("401 generic for bad credentials, 503 when unconfigured or not pilot, 200 when authorized", async () => {
    const { deps } = setup();
    deps.internalKeys = { jobs: [KEY_JOBS] };
    const bad = await handleJobsProcess(signed({ key: KEY_DRAFT }), deps);
    expect(bad.status).toBe(401);
    expect(await bad.json()).toEqual({ code: "unauthorized" });
    expect((await handleJobsProcess(new Request(`http://localhost${PATH}`, { method: "POST" }), deps)).status).toBe(401);

    const ok = await handleJobsProcess(signed(), deps);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ claimed: 0, purged: 0 });

    expect((await handleJobsProcess(signed(), { ...deps, internalKeys: undefined })).status).toBe(503);
    expect((await handleJobsProcess(signed(), { ...deps, mode: "demo" })).status).toBe(503);
  });
});
