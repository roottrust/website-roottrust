import { resolveBackendMode, type BackendMode } from "./mode";
import { recordDiagnostic, recordReportRequest, requestSubscription } from "./repository";
import { loadFirestoreStore, type Store } from "./store";
import { MAX_BODY_BYTES, parseDiagnostic, parseReport, parseSubscription, type Parsed } from "./validation";

if (typeof window !== "undefined") throw new Error("lib/server must not be imported in the browser");

export interface Deps {
  mode: BackendMode;
  idSecret: string | undefined;
  getStore(): Promise<Store>;
  now(): Date;
}

let firestoreStore: Store | undefined;

export function defaultDeps(): Deps {
  return {
    mode: resolveBackendMode(process.env.BACKEND_MODE),
    idSecret: process.env.DATA_ID_SECRET,
    getStore: async () => (firestoreStore ??= loadFirestoreStore()),
    now: () => new Date(),
  };
}

const MIN_SECRET_LENGTH = 32;

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const unavailable = (code: string) => json(503, { code });

// Content-Length is only a fast path; the stream is counted so a missing or spoofed header cannot buffer more than the cap.
async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return { ok: false };
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return { ok: false };
  const chunks: Uint8Array[] = [];
  let received = 0;
  if (request.body) {
    const reader = request.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { ok: false };
      }
      chunks.push(value);
    }
  }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))) as unknown };
  } catch {
    return { ok: false };
  }
}

// off: 503, body never read. demo: validates only, then 503 (never a fictitious success). pilot: 202 only after commit.
async function handle<T>(
  request: Request,
  deps: Deps,
  parse: (body: unknown) => Parsed<T>,
  persist: (store: Store, secret: string, value: T, now: Date) => Promise<Record<string, unknown>>,
): Promise<Response> {
  if (deps.mode === "off") return unavailable("unavailable");
  const read = await readJson(request);
  if (!read.ok) return json(400, { code: "invalid_request" });
  const parsed = parse(read.body);
  if (!parsed.ok) return json(400, { code: "invalid_request", fields: parsed.fields });
  if (deps.mode === "demo") return unavailable("demo_mode");
  const secret = deps.idSecret;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return unavailable("misconfigured");
  try {
    const result = await persist(await deps.getStore(), secret, parsed.value, deps.now());
    return json(202, { status: "accepted", ...result });
  } catch (error) {
    console.error("persistence_failed", error instanceof Error ? error.name : "unknown");
    return unavailable("storage_unavailable");
  }
}

export const handleDiagnostic = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, parseDiagnostic, async (store, secret, value, now) => ({
    id: await recordDiagnostic(store, secret, value, now),
  }));

// Same body for new, pending, confirmed and cancelled addresses (anti-enumeration).
export const handleSubscription = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, parseSubscription, async (store, secret, value, now) => {
    await requestSubscription(store, secret, value, now);
    return {};
  });

export const handleReport = (request: Request, deps: Deps = defaultDeps()) =>
  handle(request, deps, parseReport, async (store, secret, value, now) => {
    await recordReportRequest(store, secret, value, now);
    return {};
  });
