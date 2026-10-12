import { describe, expect, it, vi } from "vitest";
import { claimJobs, completeJob, enqueueJob, failJob, PermanentFailure, processJobs, purgeExpired, RetryLater } from "../../../src/lib/server/jobs";
import { createFirestoreStore, createMemoryStore, type Store } from "../../../src/lib/server/store";
import { COLLECTIONS, type JobRecord } from "../../../src/lib/server/types";
import { createFakeFirestore, NOW, SECRET } from "./helpers";

const LEASE = 60_000;
const later = (ms: number) => new Date(NOW.getTime() + ms);
const get = async (store: Store, id: string) => store.transaction((tx) => tx.get<JobRecord>(COLLECTIONS.jobs, id));
const enqueue = (store: Store, key = "k1", extra: { maxAttempts?: number; runAt?: Date } = {}) =>
  store.transaction((tx) => enqueueJob(tx, SECRET, { kind: "notify", key, payload: { ref: "abc" }, ...extra }, NOW));
const claim = (store: Store, at = NOW, limit = 5) => claimJobs(store, { kinds: ["notify"], now: at, limit, leaseMs: LEASE });

const stores: Array<[string, () => Store]> = [
  ["memory store", () => createMemoryStore()],
  ["firestore adapter", () => createFirestoreStore(createFakeFirestore() as never)],
];

describe.each(stores)("outbox on %s", (_name, make) => {
  it("enqueue is idempotent per (kind, key) and atomic with the surrounding transaction", async () => {
    const store = make();
    const [a, b] = await Promise.all([enqueue(store), enqueue(store)]);
    expect(a).toBe(b);
    expect(await claim(store)).toHaveLength(1);

    await expect(
      store.transaction(async (tx) => {
        await enqueueJob(tx, SECRET, { kind: "notify", key: "rolled-back" }, NOW);
        throw new Error("abort");
      }),
    ).rejects.toThrow("abort");
    expect(await claim(store, later(1))).toHaveLength(0);
  });

  it("concurrent claimers: exactly one gets the lease", async () => {
    const store = make();
    await enqueue(store);
    const results = await Promise.all(Array.from({ length: 6 }, () => claim(store)));
    expect(results.flat()).toHaveLength(1);
    expect(results.flat()[0]).toMatchObject({ status: "leased", attempts: 1 });
  });

  it("future jobs are not claimed; an expired lease is reclaimed and fences the old owner", async () => {
    const store = make();
    const id = await enqueue(store, "later", { runAt: later(5000) });
    expect(await claim(store)).toHaveLength(0);
    const [first] = await claim(store, later(5000));
    expect(first.id).toBe(id);
    expect(await claim(store, later(5000 + LEASE - 1))).toHaveLength(0);

    const [second] = await claim(store, later(5000 + LEASE + 1));
    expect(second.attempts).toBe(2);
    expect(second.leaseToken).not.toBe(first.leaseToken);
    expect(await completeJob(store, first, later(70_000))).toBe("lost");
    expect(await completeJob(store, second, later(70_000))).toBe("done");
    expect((await get(store, id))?.status).toBe("done");
    expect(await claim(store, later(1_000_000))).toHaveLength(0);
  });

  it("failures back off exponentially, honor Retry-After, and die at maxAttempts with a short code", async () => {
    const store = make();
    const id = await enqueue(store, "f", { maxAttempts: 3 });
    let [job] = await claim(store);
    expect(await failJob(store, job, "Boom", NOW)).toBe("retry");
    expect((await get(store, id))?.dueAt).toBe(later(30_000).toISOString());

    [job] = await claim(store, later(30_000));
    expect(await failJob(store, job, "Boom", later(30_000), { retryAfterMs: 600_000 })).toBe("retry");
    expect((await get(store, id))?.dueAt).toBe(later(630_000).toISOString());

    [job] = await claim(store, later(630_000));
    expect(await failJob(store, job, "Boom", later(630_000))).toBe("dead");
    expect(await get(store, id)).toMatchObject({ status: "dead", lastError: "Boom" });
    expect(await claim(store, later(10_000_000))).toHaveLength(0);
  });

  it("a job whose lease keeps expiring (crashed worker) ends dead instead of looping", async () => {
    const store = make();
    const id = await enqueue(store, "crash", { maxAttempts: 2 });
    await claim(store);
    await claim(store, later(LEASE + 1));
    expect(await claim(store, later(2 * LEASE + 2))).toHaveLength(0);
    expect(await get(store, id)).toMatchObject({ status: "dead", lastError: "lease_expired" });
  });

  it("processJobs: success, retry, permanent failure and handler timeout; errors never keep messages", async () => {
    const store = make();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const ids = await Promise.all(["ok", "boom", "perm", "slow", "later"].map((key) => enqueue(store, key)));
    const handler = vi.fn(async (job: JobRecord, { signal }: { signal: AbortSignal }) => {
      const key = ids.indexOf(job.id);
      if (key === 1) throw new Error("pessoa@example.com leaked?");
      if (key === 2) throw new PermanentFailure("no");
      if (key === 3) await new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted"))));
      if (key === 4) throw new RetryLater(120_000);
    });
    const summary = await processJobs(store, { notify: handler }, { now: () => NOW, limit: 5, leaseMs: LEASE, handlerTimeoutMs: 20 });
    expect(summary).toEqual({ claimed: 5, done: 1, retried: 3, dead: 1, lost: 0, uncertain: 0 });
    expect((await get(store, ids[1]))?.lastError).toBe("Error");
    expect((await get(store, ids[3]))?.lastError).toBe("JobTimeout");
    expect((await get(store, ids[4]))?.dueAt).toBe(later(120_000).toISOString());
    expect(warn.mock.calls.flat().join(" ")).not.toContain("pessoa");
    warn.mockRestore();
  });

  it("processJobs ignores kinds without a handler and requires timeout < lease", async () => {
    const store = make();
    await store.transaction((tx) => enqueueJob(tx, SECRET, { kind: "other", key: "x" }, NOW));
    const summary = await processJobs(store, { notify: async () => undefined }, { now: () => NOW, limit: 5, leaseMs: LEASE, handlerTimeoutMs: 10 });
    expect(summary.claimed).toBe(0);
    await expect(processJobs(store, {}, { now: () => NOW, limit: 1, leaseMs: 10, handlerTimeoutMs: 10 })).rejects.toThrow();
  });

  it("claims just in time: a slow first job never makes later jobs' leases age, so a competing processor cannot duplicate them", async () => {
    const store = make();
    await Promise.all(["a", "b", "c"].map((key) => enqueue(store, key)));
    const clock = { t: NOW.getTime() };
    const now = () => new Date(clock.t);
    const runs = new Map<string, number>();
    let invocations = 0;
    let competitor: Promise<unknown> | undefined;
    const handler = async (job: JobRecord) => {
      runs.set(job.id, (runs.get(job.id) ?? 0) + 1);
      invocations += 1;
      clock.t += 40_000; // each job "takes" 40 s of a 60 s lease: a batch claimed up front would have expired by job 3
      if (invocations === 2) competitor = processJobs(store, { notify: handler }, { now, limit: 5, leaseMs: LEASE, handlerTimeoutMs: 1000 });
    };
    await processJobs(store, { notify: handler }, { now, limit: 5, leaseMs: LEASE, handlerTimeoutMs: 1000 });
    await competitor;
    expect(runs.size).toBe(3);
    expect([...runs.values()]).toEqual([1, 1, 1]);
  });

  it("an empty handler map never reads the queue", async () => {
    const store = make();
    const query = vi.spyOn(store, "query");
    expect(await processJobs(store, {}, { now: () => NOW, limit: 5, leaseMs: LEASE, handlerTimeoutMs: 1000 })).toMatchObject({ claimed: 0 });
    expect(query).not.toHaveBeenCalled();
  });

  it("when completion cannot be persisted the job stays leased (uncertain), not failed or rescheduled", async () => {
    const real = make();
    const id = await enqueue(real);
    let broken = false;
    const flaky: Store = { ...real, transaction: (fn) => (broken ? Promise.reject(Object.assign(new Error("db down"), { code: "UNAVAILABLE" })) : real.transaction(fn)) };
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const summary = await processJobs(
      flaky,
      { notify: async () => void (broken = true) },
      { now: () => NOW, limit: 5, leaseMs: LEASE, handlerTimeoutMs: 1000 },
    );
    expect(summary).toMatchObject({ claimed: 1, done: 0, retried: 0, dead: 0, uncertain: 1 });
    broken = false;
    expect(await get(real, id)).toMatchObject({ status: "leased", attempts: 1, dueAt: later(LEASE).toISOString() });
    expect(error.mock.calls.flat().join(" ")).toContain("job_outcome_uncertain");
    expect(error.mock.calls.flat().join(" ")).not.toContain("db down");
    error.mockRestore();
  });

  it("a transient completion failure is retried once and the job completes", async () => {
    const real = make();
    const id = await enqueue(real);
    let failures = 0;
    const flaky: Store = {
      ...real,
      transaction: (fn) => {
        if (failures === 1) {
          failures = 2;
          return Promise.reject(new Error("blip"));
        }
        return real.transaction(fn);
      },
    };
    const summary = await processJobs(flaky, { notify: async () => void (failures = 1) }, { now: () => NOW, limit: 1, leaseMs: LEASE, handlerTimeoutMs: 1000 });
    expect(summary).toMatchObject({ done: 1, uncertain: 0 });
    expect((await get(real, id))?.status).toBe("done");
  });

  it("purgeExpired removes only expired counters and replay markers", async () => {
    const store = make();
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.rateLimits, "old", { id: "old", count: 1, windowStart: 0, expiresAt: NOW.toISOString() });
      tx.set(COLLECTIONS.rateLimits, "live", { id: "live", count: 1, windowStart: 0, expiresAt: later(1000).toISOString() });
      tx.set(COLLECTIONS.replays, "oldr", { id: "oldr", expiresAt: later(-1000).toISOString() });
    });
    expect(await purgeExpired(store, NOW, 10)).toBe(2);
    expect(await store.transaction((tx) => tx.get(COLLECTIONS.rateLimits, "live"))).toBeDefined();
    expect(await store.transaction((tx) => tx.get(COLLECTIONS.rateLimits, "old"))).toBeUndefined();
  });
});

describe("RetryLater", () => {
  it("ignores invalid delays and clamps huge ones to the backoff cap", () => {
    for (const bad of [Number.NaN, -5, 0, Number.POSITIVE_INFINITY]) expect(new RetryLater(bad).retryAfterMs).toBe(0);
    expect(new RetryLater(1500.2).retryAfterMs).toBe(1501);
    expect(new RetryLater(10 * 24 * 3600_000).retryAfterMs).toBe(3600_000);
  });
});

describe("firestore adapter", () => {
  it("retries on contention, never double-applies, and keeps reads-before-writes", async () => {
    const db = createFakeFirestore();
    const store = createFirestoreStore(db as never);
    const increments = 8;
    await Promise.all(
      Array.from({ length: increments }, () =>
        store.transaction(async (tx) => {
          const current = await tx.get<{ n: number }>(COLLECTIONS.rateLimits, "counter");
          tx.set(COLLECTIONS.rateLimits, "counter", { n: (current?.n ?? 0) + 1 });
          // read-your-writes inside the same transaction
          expect(await tx.get(COLLECTIONS.rateLimits, "counter")).toBeDefined();
        }),
      ),
    );
    expect(await store.transaction((tx) => tx.get(COLLECTIONS.rateLimits, "counter"))).toEqual({ n: increments });
    expect(db.stats.attempts).toBeGreaterThan(db.stats.commits);
  });

  it("delete and query work", async () => {
    const db = createFakeFirestore();
    const store = createFirestoreStore(db as never);
    await store.transaction(async (tx) => {
      tx.set(COLLECTIONS.replays, "a", { id: "a", expiresAt: "2026-01-01" });
      tx.set(COLLECTIONS.replays, "b", { id: "b", expiresAt: "2027-01-01" });
    });
    expect(await store.query(COLLECTIONS.replays, "expiresAt", "2026-06-01", 10)).toEqual(["a"]);
    await store.transaction(async (tx) => tx.delete(COLLECTIONS.replays, "a"));
    expect(await store.query(COLLECTIONS.replays, "expiresAt", "2026-06-01", 10)).toEqual([]);
  });
});
