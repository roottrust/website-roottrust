import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { tools } from "../../features/tools/content";
import { resolveFormMode, type ContactFormConfig } from "../forms";
import { RESEND_DAILY_LIMIT, RESEND_MONTHLY_LIMIT, releaseReservation, releaseUnstartedAdmission, startAttempt } from "./capacity";
import { hasIdSecret, loadDefenseConfig } from "./defense";
import { loadInternalKeys } from "./internal-auth";
import { PermanentFailure, RetryLater, type JobHandler } from "./jobs";
import { resolveBackendMode } from "./mode";
import { logEvent, safeErrorCode } from "./safe";
import type { Store } from "./store";
import { COLLECTIONS, type ReportDeliveryRecord, type ToolId } from "./types";
import { checkEmail } from "./validation";

export { RESEND_DAILY_LIMIT, RESEND_MONTHLY_LIMIT };
// Resend keeps an idempotency key for 24 h. An uncertain send is retried with the same key only while the key is
// certainly alive (margin for clock skew); after that a resend could duplicate the e-mail, so a human must reconcile.
export const IDEMPOTENCY_WINDOW_MS = 23 * 60 * 60_000;
const SEND_TIMEOUT_MS = 15_000;

const PDF_FILES: Record<ToolId, string> = {
  rosi: "rosi-v1.pdf",
  "shadow-ai": "shadow-ai-v1.pdf",
  "divida-tecnica": "divida-tecnica-v1.pdf",
  "migracao-para-nuvem": "migracao-nuvem-v1.pdf",
};

export interface MailMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  attachment: { filename: string; content: Buffer };
}
export type MailResult = { ok: true; id: string } | { ok: false; code: string; status: number | null };
export type Mailer = (message: MailMessage, idempotencyKey: string) => Promise<MailResult>;

export interface ReportConfig {
  apiKey: string;
  from: string;
  replyTo: string;
  dailyLimit: number;
  monthlyLimit: number;
  // Empty in public mode (`mode: "public"` is the explicit marker); a missing allowlist never means "open".
  allowlist: readonly string[];
  mode?: "public";
  // Test seams; production uses the Resend SDK and the PDFs under private/reports.
  mailer?: Mailer;
  readPdf?: (toolId: ToolId) => Promise<Buffer>;
}

const clampLimit = (value: string | undefined, ceiling: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed < ceiling ? parsed : ceiling;
};

// A "Name <address>" sender is accepted; the address itself must be a valid e-mail.
const senderAddress = (value: string): string | undefined => checkEmail(/<([^<>]+)>\s*$/.exec(value)?.[1] ?? value);

// Fail closed: operational only with the API key, a sender and reply-to, the statement that the sending domain is verified
// at the provider (RESEND_DOMAIN_CONFIRMED) and that something triggers the job runner (JOBS_TRIGGER_CONFIRMED). The
// attestations are operator statements; the domain and the scheduler are not provisioned by this code.
export function loadReportConfig(env: Record<string, string | undefined>, mode?: "public"): ReportConfig | undefined {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.REPORT_EMAIL_FROM?.trim();
  const replyTo = checkEmail(env.REPORT_EMAIL_REPLY_TO?.trim());
  const items = (env.NEWSLETTER_PILOT_ALLOWLIST ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const emails = items.map(checkEmail);
  if (mode !== "public" && (!items.length || items.length > 100 || emails.some((email) => !email))) return undefined;
  if (!apiKey || !from || !senderAddress(from) || !replyTo) return undefined;
  if (env.RESEND_DOMAIN_CONFIRMED !== "true" || env.JOBS_TRIGGER_CONFIRMED !== "true") return undefined;
  return {
    apiKey,
    from,
    replyTo,
    dailyLimit: clampLimit(env.REPORT_EMAIL_DAILY_LIMIT, RESEND_DAILY_LIMIT),
    monthlyLimit: clampLimit(env.REPORT_EMAIL_MONTHLY_LIMIT, RESEND_MONTHLY_LIMIT),
    allowlist: mode === "public" ? [] : [...new Set(emails as string[])],
    ...(mode === "public" ? { mode } : {}),
  };
}

// Same contract as the contact form: FORM_MODE=demo wins; real mode needs the complete pilot plus the public site key.
// Pilot needs the allowlist; public needs the explicit public configuration. Capacity is checked at admission time.
export function resolveReportAvailability(env: Record<string, string | undefined>): ContactFormConfig {
  if (resolveFormMode(env.FORM_MODE) === "demo") return { mode: "demo" };
  const siteKey = env.TURNSTILE_SITE_KEY?.trim();
  const backend = resolveBackendMode(env.BACKEND_MODE);
  if (backend !== "pilot" && backend !== "public") return { mode: "unavailable" };
  const ready = loadDefenseConfig(env).config !== undefined
    && hasIdSecret(env.DATA_ID_SECRET)
    && Boolean(loadInternalKeys(env)?.jobs?.length)
    && loadReportConfig(env, backend === "public" ? "public" : undefined) !== undefined;
  return ready && siteKey ? { mode: backend, siteKey } : { mode: "unavailable" };
}

const nextDayStart = (at: Date) => Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1);
const nextMonthStart = (at: Date) => Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1);

// The PDF is read from private/reports (traced into the jobs route only); a missing or non-PDF file is a deploy defect.
async function readReportPdf(toolId: ToolId): Promise<Buffer> {
  const file = path.join(process.cwd(), "private", "reports", PDF_FILES[toolId]);
  let content: Buffer;
  try {
    content = await readFile(file);
  } catch {
    throw new PermanentFailure("report_pdf_missing");
  }
  if (content.length < 1024 || content.subarray(0, 5).toString("latin1") !== "%PDF-") throw new PermanentFailure("report_pdf_invalid");
  return content;
}

export function buildReportMessage(config: ReportConfig, toolId: ToolId, email: string, pdf: Buffer): MailMessage {
  const topic = tools[toolId].reportTopic;
  const lines = [
    "Olá,",
    `Segue em anexo o relatório geral da Root Trust sobre ${topic}, como você pediu no site.`,
    "O relatório é o mesmo para todas as pessoas: ele não usa respostas ou resultados de nenhuma ferramenta.",
    "Este pedido não inscreve você na newsletter. Se quiser conversar sobre o tema, responda a este e-mail.",
    "Root Trust",
  ];
  return {
    from: config.from,
    to: email,
    replyTo: config.replyTo,
    subject: `Seu relatório Root Trust: ${topic}`,
    text: lines.join("\n\n"),
    html: lines.map((line) => `<p>${line}</p>`).join(""),
    attachment: { filename: `root-trust-${toolId}.pdf`, content: pdf },
  };
}

function resendMailer(apiKey: string): Mailer {
  const client = new Resend(apiKey);
  return async (message, idempotencyKey) => {
    const { data, error } = await client.emails.send(
      {
        from: message.from,
        to: message.to,
        replyTo: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: [message.attachment],
      },
      { idempotencyKey },
    );
    if (error || !data) return { ok: false, code: error?.name ?? "no_response", status: error?.statusCode ?? null };
    return { ok: true, id: data.id };
  };
}

const QUOTA_CODES = { daily_quota_exceeded: "day", monthly_quota_exceeded: "month" } as const;

type Prepared = { kind: "done" | "reconcile" | "send" } | { kind: "defer"; waitMs: number };

// Never throws a plain Error unless the Resend outcome is unknown (the retry then reuses the same idempotency key).
// Quota is reserved in the same transaction that stamps the attempt, so concurrent jobs cannot oversubscribe it; the
// reservation is released only when the provider definitively did not send.
export function createReportHandler(store: Store, config: ReportConfig, now: () => Date): JobHandler {
  const mailer = config.mailer ?? resendMailer(config.apiKey);
  const readPdf = config.readPdf ?? readReportPdf;

  const readDelivery = (id: string) => store.transaction((tx) => tx.get<ReportDeliveryRecord>(COLLECTIONS.reportDeliveries, id));

  const prepare = (id: string): Promise<Prepared> =>
    store.transaction(async (tx) => {
      const current = await tx.get<ReportDeliveryRecord>(COLLECTIONS.reportDeliveries, id);
      if (!current || current.sentAt) return { kind: "done" };
      if (current.reconcile) return { kind: "reconcile" };
      const at = now();
      if (current.attemptStartedAt) {
        if (at.getTime() - Date.parse(current.attemptStartedAt) >= IDEMPOTENCY_WINDOW_MS) {
          tx.set(COLLECTIONS.reportDeliveries, id, { ...current, reconcile: true });
          return { kind: "reconcile" };
        }
        return { kind: "send" };
      }
      const reservation = await startAttempt(tx, current.reservation, at, config);
      if ("waitMs" in reservation) return { kind: "defer", waitMs: reservation.waitMs };
      tx.set(COLLECTIONS.reportDeliveries, id, { ...current, attemptStartedAt: at.toISOString(), reservation });
      return { kind: "send" };
    });

  // The provider rejected the send without sending: give the reservation back. When it reports an exhausted quota the
  // local counter was behind, so that scope is raised to its ceiling.
  const release = (id: string, exhausted?: "day" | "month") =>
    store.transaction(async (tx) => {
      const current = await tx.get<ReportDeliveryRecord>(COLLECTIONS.reportDeliveries, id);
      if (!current?.reservation || current.sentAt) return;
      await releaseReservation(tx, current.reservation, config, exhausted);
      const rest: Partial<ReportDeliveryRecord> = { ...current };
      delete rest.attemptStartedAt;
      delete rest.reservation;
      tx.set(COLLECTIONS.reportDeliveries, id, rest as ReportDeliveryRecord);
    });

  // Transient provider refusal: nothing was sent, the unit stays counted as an admission for the retry.
  const revertToAdmission = (id: string) =>
    store.transaction(async (tx) => {
      const current = await tx.get<ReportDeliveryRecord>(COLLECTIONS.reportDeliveries, id);
      if (!current?.reservation || current.sentAt) return;
      const rest: Partial<ReportDeliveryRecord> = { ...current, reservation: { ...current.reservation, kind: "admission" } };
      delete rest.attemptStartedAt;
      tx.set(COLLECTIONS.reportDeliveries, id, rest as ReportDeliveryRecord);
    });

  return async (job, { signal }) => {
    const id = job.payload.requestId;
    if (!id) throw new PermanentFailure("missing_request");
    const delivery = await readDelivery(id);
    if (!delivery) throw new PermanentFailure("request_not_found");
    if (delivery.sentAt) {
      await releaseUnstartedAdmission(store, COLLECTIONS.reportDeliveries, id, config);
      return;
    }
    if (delivery.reconcile) throw new PermanentFailure("reconciliation_required");
    if (!delivery.email) {
      await releaseUnstartedAdmission(store, COLLECTIONS.reportDeliveries, id, config);
      throw new PermanentFailure("missing_email");
    }
    if (config.mode !== "public" && !config.allowlist.includes(delivery.email)) {
      await releaseUnstartedAdmission(store, COLLECTIONS.reportDeliveries, id, config);
      throw new PermanentFailure("pilot_recipient_not_allowed");
    }
    const pdf = await readPdf(delivery.toolId).catch(async (error: unknown) => {
      if (error instanceof PermanentFailure) await releaseUnstartedAdmission(store, COLLECTIONS.reportDeliveries, id, config);
      throw error;
    });

    const prepared = await prepare(id);
    if (prepared.kind === "done") {
      await releaseUnstartedAdmission(store, COLLECTIONS.reportDeliveries, id, config);
      return;
    }
    if (prepared.kind === "reconcile") {
      logEvent("error", "report_reconciliation_required", {});
      throw new PermanentFailure("reconciliation_required");
    }
    if (prepared.kind === "defer") throw new RetryLater(prepared.waitMs, { deferral: true });

    let result: MailResult;
    try {
      const guard = AbortSignal.any([signal, AbortSignal.timeout(SEND_TIMEOUT_MS)]);
      result = await Promise.race([
        mailer(buildReportMessage(config, delivery.toolId, delivery.email, pdf), `report-${id}`),
        new Promise<never>((_, reject) => guard.addEventListener("abort", () => reject(new Error("send_timeout")), { once: true })),
      ]);
    } catch (error) {
      logEvent("warn", "report_send_uncertain", { error: safeErrorCode(error) });
      throw new Error("report_send_uncertain");
    }

    if (result.ok) {
      // The e-mail address is no longer needed once the send is confirmed.
      await store.transaction(async (tx) => {
        const current = await tx.get<ReportDeliveryRecord>(COLLECTIONS.reportDeliveries, id);
        if (!current || current.sentAt) return;
        const rest: Partial<ReportDeliveryRecord> = { ...current };
        delete rest.email;
        tx.set(COLLECTIONS.reportDeliveries, id, { ...rest, sentAt: now().toISOString(), resendId: result.id } as ReportDeliveryRecord);
      });
      return;
    }

    const { code, status } = result;
    // Unknown outcome (network-level, 5xx, 408, or another request holding the same key): keep the stamp and reservation.
    if (status === null || status >= 500 || status === 408 || code === "concurrent_idempotent_requests") {
      logEvent("warn", "report_send_uncertain", { error: code });
      throw new Error(`report_send_${status ?? "unknown"}`);
    }
    if (code === "rate_limit_exceeded") {
      await revertToAdmission(id);
      throw new RetryLater(60_000, { deferral: true });
    }
    const exhausted = QUOTA_CODES[code as keyof typeof QUOTA_CODES];
    await release(id, exhausted);
    if (exhausted) {
      const at = now();
      throw new RetryLater((exhausted === "day" ? nextDayStart(at) : nextMonthStart(at)) - at.getTime(), { deferral: true });
    }
    throw new PermanentFailure(`resend_${code}`.slice(0, 60));
  };
}
