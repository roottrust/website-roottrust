import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { JOBS_PATH, runJobs, type Env } from "../../../workers/jobs-scheduler/index";
import { authenticateInternal } from "../../../src/lib/server/internal-auth";
import { createMemoryStore } from "../../../src/lib/server/store";

const env: Env = { SITE_ORIGIN: "https://website-roottrust.vercel.app", INTERNAL_KEY_JOBS: "j".repeat(64), JOBS_ENABLED: "true" };
afterEach(() => { vi.unstubAllGlobals(); });

describe("jobs scheduler", () => {
  it("stays off without the explicit switch, even without credentials", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await worker.scheduled({}, { SITE_ORIGIN: "", INTERNAL_KEY_JOBS: "", JOBS_ENABLED: "false" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("sends a fresh signature compatible with the API and rejects replay", async () => {
    const store = createMemoryStore();
    const nonces = new Set<string>();
    vi.stubGlobal("fetch", vi.fn(async (url: URL, init: RequestInit) => {
      expect(url.href).toBe(`${env.SITE_ORIGIN}${JOBS_PATH}`);
      expect(init.redirect).toBe("manual");
      expect(init.signal).toBeInstanceOf(AbortSignal);
      expect(init.body).toBeUndefined();
      const request = new Request(url, init);
      const nonce = request.headers.get("x-rt-nonce")!;
      expect(nonces.has(nonce)).toBe(false);
      nonces.add(nonce);
      const options = { scope: "jobs" as const, keys: { jobs: [env.INTERNAL_KEY_JOBS] }, store, idSecret: "s".repeat(64), now: new Date(), maxBodyBytes: 1024 };
      expect(await authenticateInternal(request.clone(), options)).toMatchObject({ ok: true });
      expect(await authenticateInternal(request, options)).toMatchObject({ ok: false, reason: "replay" });
      return new Response("{}", { status: 200 });
    }));
    await runJobs(env);
    await runJobs(env);
    expect(nonces.size).toBe(2);
  });

  it.each([
    { SITE_ORIGIN: "http://example.com" },
    { SITE_ORIGIN: "https://example.com/path" },
    { SITE_ORIGIN: "https://user:pass@example.com" },
    { INTERNAL_KEY_JOBS: "short" },
    { INTERNAL_KEY_JOBS: `${env.INTERNAL_KEY_JOBS},${env.INTERNAL_KEY_JOBS}` },
    { INTERNAL_KEY_JOBS: ` ${env.INTERNAL_KEY_JOBS}` },
  ])("fails closed on invalid configuration: %j", async (override) => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(runJobs({ ...env, ...override })).rejects.toThrow("jobs_scheduler_misconfigured");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([302, 401, 429, 503])("reports HTTP %s without retrying or logging the response body", async (status) => {
    const fetcher = vi.fn(async () => new Response("private provider detail", { status }));
    vi.stubGlobal("fetch", fetcher);
    await expect(runJobs(env)).rejects.toThrow(`jobs_scheduler_http_${status}`);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("sanitizes network failure without exposing provider details", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("private network detail"); }));
    await expect(runJobs(env)).rejects.toThrow(/^jobs_scheduler_request_failed$/);
  });

  it("sanitizes a response cancellation failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream({
      cancel() { throw new Error("private_cancel_detail"); },
    }), { status: 503 })));
    await expect(runJobs(env)).rejects.toThrow(/^jobs_scheduler_request_failed$/);
  });
});
