import { resolveFormMode, type ContactFormConfig } from "../forms";
import { hasIdSecret, loadDefenseConfig } from "./defense";
import { loadInternalKeys } from "./internal-auth";
import { PermanentFailure, RetryLater, type JobHandler } from "./jobs";
import { resolveBackendMode } from "./mode";
import { logEvent, safeErrorCode } from "./safe";
import type { Store } from "./store";
import { COLLECTIONS, type DiagnosticRecord } from "./types";

const SEND_TIMEOUT_MS = 10_000;

export interface DiagnosticConfig {
  webhookUrl: string;
  fetch?: typeof fetch;
}

// Only the official Discord webhook endpoint is accepted as the private destination.
export function isDiscordWebhookUrl(value: string | undefined): value is string {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && (url.hostname === "discord.com" || url.hostname === "discordapp.com")
      && /^\/api\/webhooks\/\d+\/[\w-]+$/.test(url.pathname) && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

// Fail closed: the diagnostic endpoint is operational only with a valid private webhook, the explicit statement that the
// team answers requests on the next business day, and the explicit statement that something triggers the job runner
// (JOBS_TRIGGER_CONFIRMED). This flag is an operator attestation; the scheduler itself is not provisioned by this code.
export function loadDiagnosticConfig(env: Record<string, string | undefined>): DiagnosticConfig | undefined {
  const url = env.DISCORD_DIAGNOSTIC_WEBHOOK_URL?.trim();
  if (env.DIAGNOSTIC_FOLLOWUP_CONFIRMED !== "true" || env.JOBS_TRIGGER_CONFIRMED !== "true" || !isDiscordWebhookUrl(url)) return undefined;
  return { webhookUrl: url };
}

// What the page may offer. Only { mode, siteKey } (public) leaves this function; every other check stays server-side.
// FORM_MODE=demo wins so a demo build can never send. Real mode needs the complete pilot: defense config, ID secret,
// jobs key, diagnostic destination/follow-up/trigger attestations and the public Turnstile site key.
export function resolveContactAvailability(env: Record<string, string | undefined>): ContactFormConfig {
  if (resolveFormMode(env.FORM_MODE) === "demo") return { mode: "demo" };
  const siteKey = env.TURNSTILE_SITE_KEY?.trim();
  const ready = resolveBackendMode(env.BACKEND_MODE) === "pilot"
    && loadDefenseConfig(env).config !== undefined
    && hasIdSecret(env.DATA_ID_SECRET)
    && Boolean(loadInternalKeys(env)?.jobs?.length)
    && loadDiagnosticConfig(env) !== undefined;
  return ready && siteKey ? { mode: "pilot", siteKey } : { mode: "unavailable" };
}

// Contact data only goes to the private team channel; it is flattened, truncated and markdown/mention-neutralised.
const clean = (value: string): string =>
  value
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]+/g, " ")
    .replace(/[\\*_~`|>#[\]()<:@]/g, (char) => `\\${char}`)
    .trim()
    .slice(0, 200);

export function formatDiscordMessage(record: DiagnosticRecord): string {
  return [
    `Novo pedido de diagnóstico — ID ${record.id}`,
    `Nome: ${clean(record.name)}`,
    `Empresa: ${clean(record.company)}`,
    `WhatsApp: ${clean(record.whatsapp)}`,
    "Retorno prometido: ligação ou WhatsApp no próximo dia útil.",
  ].join("\n");
}

function retryAfterMs(response: Response, body: unknown): number {
  const header = Number(response.headers.get("retry-after"));
  const fromBody = typeof body === "object" && body !== null ? Number((body as { retry_after?: unknown }).retry_after) : Number.NaN;
  const seconds = Number.isFinite(header) && header > 0 ? header : fromBody;
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
}

// Discord webhooks have no idempotency key: `notifiedAt` stops repeats after a confirmed send, and the ID in the message
// lets the team spot the rare duplicate when a send succeeded but its outcome could not be stored.
export function createDiagnosticHandler(store: Store, config: DiagnosticConfig, now: () => Date): JobHandler {
  const send = config.fetch ?? fetch;
  return async (job, { signal }) => {
    const requestId = job.payload.requestId;
    if (!requestId) throw new PermanentFailure("missing_request");
    const record = await store.transaction((tx) => tx.get<DiagnosticRecord>(COLLECTIONS.diagnostics, requestId));
    if (!record) throw new PermanentFailure("request_not_found");
    if (record.notifiedAt) return;

    let response: Response;
    try {
      response = await send(config.webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: formatDiscordMessage(record), allowed_mentions: { parse: [] }, flags: 4 }),
        redirect: "error",
        signal: AbortSignal.any([signal, AbortSignal.timeout(SEND_TIMEOUT_MS)]),
      });
    } catch (error) {
      // Never forward the original error: undici messages can embed the (secret) webhook URL.
      logEvent("warn", "diagnostic_send_failed", { error: safeErrorCode(error) });
      throw new Error("discord_unreachable");
    }

    if (response.status === 429) {
      const body: unknown = await response.json().catch(() => undefined);
      throw new RetryLater(retryAfterMs(response, body));
    }
    if (response.status >= 500 || response.status === 408) throw new Error(`discord_${response.status}`);
    if (!response.ok) throw new PermanentFailure(`discord_${response.status}`);

    await store.transaction(async (tx) => {
      const current = await tx.get<DiagnosticRecord>(COLLECTIONS.diagnostics, requestId);
      if (current && !current.notifiedAt) tx.set(COLLECTIONS.diagnostics, requestId, { ...current, notifiedAt: now().toISOString() });
    });
  };
}
