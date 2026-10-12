import { vi } from "vitest";
import type { Deps } from "../../../src/lib/server/http";
import { DEFAULT_LIMITS, type Limits } from "../../../src/lib/server/limits";
import type { DiagnosticConfig } from "../../../src/lib/server/diagnostic";
import type { DefenseConfig } from "../../../src/lib/server/defense";
import { createMemoryStore } from "../../../src/lib/server/store";

export const SECRET = "s".repeat(32);
export const NOW = new Date("2026-10-12T12:00:00.000Z");
export const ORIGIN = "https://roottrust.test";
export const HOSTNAME = "roottrust.test";
export const WEBHOOK_URL = "https://discord.com/api/webhooks/123456789012345678/test-token_abc";
export const IP_HEADER = "x-real-ip";

export interface Clock {
  now: Date;
}

// Fake Cloudflare siteverify. Tokens are "<action>:<n>"; a "<mode>!" prefix changes the answer:
// bad! (success=false), down! (HTTP 502), wrong-host!, wrong-action!, stale! (challenge older than 5 min), internal! (internal-error).
export function fakeSiteverify(clock: Clock) {
  const calls: URLSearchParams[] = [];
  const fn = vi.fn<typeof fetch>(async (_url, init) => {
    const form = new URLSearchParams(String(init?.body));
    calls.push(form);
    const token = form.get("response") ?? "";
    const [mode, rest] = token.includes("!") ? token.split("!") : ["ok", token];
    if (mode === "down") return new Response("oops", { status: 502 });
    if (mode === "internal") return Response.json({ success: false, "error-codes": ["internal-error"] });
    return Response.json({
      success: mode !== "bad",
      action: mode === "wrong-action" ? "outra" : rest.split(":")[0],
      hostname: mode === "wrong-host" ? "evil.test" : HOSTNAME,
      challenge_ts: new Date(clock.now.getTime() - (mode === "stale" ? 6 * 60_000 : 0)).toISOString(),
    });
  });
  return Object.assign(fn, { calls });
}

export function setup(options: { mode?: Deps["mode"]; idSecret?: string | undefined; limits?: Partial<Limits>; withDefense?: boolean } = {}) {
  const { mode = "pilot", limits = {}, withDefense = true } = options;
  const idSecret = "idSecret" in options ? options.idSecret : SECRET;
  const store = createMemoryStore();
  const clock: Clock = { now: NOW };
  const siteverify = fakeSiteverify(clock);
  const getStore = vi.fn(async () => store);
  const defense: DefenseConfig = {
    turnstileSecret: "turnstile-secret-for-tests",
    turnstileHostnames: [HOSTNAME],
    trustedOrigins: [ORIGIN],
    ipHeader: IP_HEADER,
    // Generous IP ceilings by default so identity-limit tests are not masked; defense tests override them.
    limits: { ...DEFAULT_LIMITS, ipBurst: 1000, ipDaily: 1000, ...limits },
    fetch: siteverify as unknown as typeof fetch,
    turnstileTimeoutMs: 50,
  };
  const discord = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
  const diagnostic: DiagnosticConfig = { webhookUrl: WEBHOOK_URL, fetch: discord };
  const deps: Deps = { mode, idSecret, getStore, now: () => clock.now, diagnostic, internalKeys: { jobs: ["j".repeat(32)] }, ...(withDefense ? { defense } : {}) };
  return { store, getStore, deps, clock, siteverify, defense, discord };
}

let counter = 0;
export interface PostOptions {
  headers?: Record<string, string>;
  token?: string | null;
  ip?: string | null;
  origin?: string | null;
}

// Builds a browser-like POST. Every call gets a fresh single-use Turnstile token for `action` unless overridden.
export const postFor =
  (action: string) =>
  (body: unknown, options: PostOptions = {}) => {
    counter += 1;
    const headers: Record<string, string> = { "content-type": "application/json", ...options.headers };
    if (options.origin !== null) headers.origin = options.origin ?? ORIGIN;
    if (options.token !== null) headers["x-turnstile-token"] = options.token ?? `${action}:${counter}`;
    if (options.ip !== null) headers[IP_HEADER] = options.ip ?? "203.0.113.7";
    return new Request("http://localhost/api/x", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });
  };

export const postDiagnostic = postFor("diagnostico");
export const postSubscription = postFor("newsletter-inscricao");
export const postReport = postFor("relatorio");

// A FirestoreLike with optimistic concurrency: a transaction commits only if everything it read is unchanged,
// otherwise `fn` reruns (as the real SDK does). Reads after writes throw, like Firestore.
export function createFakeFirestore() {
  const docs = new Map<string, { data: object; version: number }>();
  let version = 0;
  const stats = { attempts: 0, commits: 0 };
  const yieldTurn = () => new Promise<void>((resolve) => setImmediate(resolve));
  const ref = (collection: string, id: string) => ({ path: `${collection}/${id}` });
  const db = {
    stats,
    docs,
    collection: (name: string) => ({
      doc: (id: string) => ref(name, id),
      where: (field: string, op: "<=" | "==", value: unknown) => {
        let max = Number.POSITIVE_INFINITY;
        const query = {
          orderBy: () => query,
          limit: (count: number) => {
            max = count;
            return query;
          },
          get: async () => ({
            docs: [...docs]
              .filter(([path, doc]) => path.startsWith(`${name}/`) && typeof (doc.data as Record<string, unknown>)[field] === "string" && (op === "==" ? (doc.data as Record<string, string>)[field] === String(value) : (doc.data as Record<string, string>)[field] <= String(value)))
              .sort((a, b) => ((a[1].data as Record<string, string>)[field] < (b[1].data as Record<string, string>)[field] ? -1 : 1))
              .slice(0, max)
              .map(([path]) => ({ id: path.slice(name.length + 1) })),
          }),
        };
        return query;
      },
    }),
    async runTransaction<T>(fn: (tx: never) => Promise<T>): Promise<T> {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        stats.attempts += 1;
        const reads = new Map<string, number>();
        const writes = new Map<string, object | undefined>();
        const tx = {
          get: async (target: { path: string }) => {
            if (writes.size) throw new Error("Firestore transactions require all reads to be executed before all writes");
            await yieldTurn();
            const doc = docs.get(target.path);
            reads.set(target.path, doc?.version ?? 0);
            return { exists: !!doc, data: () => (doc ? structuredClone(doc.data) : undefined) };
          },
          set: (target: { path: string }, value: object) => void writes.set(target.path, structuredClone(value)),
          delete: (target: { path: string }) => void writes.set(target.path, undefined),
        };
        const result = await fn(tx as never);
        await yieldTurn();
        if ([...reads].every(([path, seen]) => (docs.get(path)?.version ?? 0) === seen)) {
          for (const [path, value] of writes) {
            version += 1;
            if (value === undefined) docs.delete(path);
            else docs.set(path, { data: value, version });
          }
          stats.commits += 1;
          return result;
        }
      }
      throw new Error("too much contention");
    },
  };
  return db;
}
