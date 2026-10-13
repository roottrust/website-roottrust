import { Resend } from "resend";
import { DRAFT_ID } from "./newsletter-protocol";
import { PermanentFailure, RetryLater, type JobHandler } from "./jobs";
import { logEvent, safeErrorCode } from "./safe";
import {
  PublicationBlocked,
  loadBroadcastBasis,
  publishApprovedEdition,
  updateBroadcastState,
  type BroadcastBasis,
} from "./repository";
import type { Store } from "./store";
import { type EditionBroadcastRecord, type EditionRevisionRecord } from "./types";
import { checkEmail, checkHttpsUrl } from "./validation";

// Resend marketing Broadcasts to a dedicated PILOT segment. Broadcasts have no idempotency key, so nothing here may repeat a
// create or a send blindly: every provider call whose outcome can be unknown is stamped in storage first, the provider ID is
// persisted before sending, and an unknown outcome is reconciled against the provider (by ID, or by the deterministic name)
// or handed to a person (`reconcile`). Resend Free allows 1000 marketing contacts and Broadcasts do not use the transactional
// quota of the report e-mails.
const CALL_TIMEOUT_MS = 15_000;
const MAX_ALLOWLIST = 100;
const MAX_LIST_PAGES = 5;
const UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";
// An approval authorizes a delivery only for a short time: a job parked for lack of configuration or by repeated failures must
// not send an edition days later, when the approver's context (segment, allowlist, sources) may no longer hold.
export const APPROVAL_VALIDITY_MS = 24 * 60 * 60_000;

export type ProviderResult<T> = { ok: true; value: T } | { ok: false; code: string; status: number | null };

export interface RemoteBroadcast {
  id: string;
  name: string | null;
  segmentId: string | null;
  status: string;
  subject: string | null;
  html: string | null;
}

// The only surface of the provider this feature uses; tests inject a fake.
export interface BroadcastProvider {
  // Emails of every contact in the segment (subscribed or not). `complete: false` means more than `max` contacts exist.
  listContacts(segmentId: string, max: number, signal: AbortSignal): Promise<ProviderResult<{ emails: string[]; complete: boolean }>>;
  createDraft(message: BroadcastMessage, signal: AbortSignal): Promise<ProviderResult<{ id: string }>>;
  get(id: string, signal: AbortSignal): Promise<ProviderResult<RemoteBroadcast>>;
  findByName(name: string, signal: AbortSignal): Promise<ProviderResult<{ matches: RemoteBroadcast[]; complete: boolean }>>;
  send(id: string, signal: AbortSignal): Promise<ProviderResult<{ id: string }>>;
}

export interface BroadcastMessage {
  name: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  segmentId: string;
}

export interface BroadcastConfig {
  apiKey: string;
  from: string;
  replyTo: string;
  segmentId: string;
  allowlist: readonly string[];
  provider?: BroadcastProvider; // test seam; production uses the Resend SDK
}

const senderAddress = (value: string): string | undefined => checkEmail(/<([^<>]+)>\s*$/.exec(value)?.[1] ?? value);

// Fail closed. Real sending needs: the API key, sender and reply-to, a dedicated segment, a server-side allowlist (1..100
// addresses) AND the operator statements that the sending domain is verified, that the jobs runner is triggered and that the
// segment is the dedicated pilot one. The statements are not provisioned or verified by this code.
export function loadBroadcastConfig(env: Record<string, string | undefined>): BroadcastConfig | undefined {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.NEWSLETTER_EMAIL_FROM?.trim();
  const replyTo = checkEmail(env.NEWSLETTER_EMAIL_REPLY_TO?.trim());
  const segmentId = env.RESEND_NEWSLETTER_SEGMENT_ID?.trim();
  if (!apiKey || !from || !senderAddress(from) || !replyTo || !segmentId || !/^[A-Za-z0-9_-]{8,64}$/.test(segmentId)) return undefined;
  if (env.RESEND_DOMAIN_CONFIRMED !== "true" || env.JOBS_TRIGGER_CONFIRMED !== "true" || env.NEWSLETTER_PILOT_SEGMENT_CONFIRMED !== "true") return undefined;
  const items = (env.NEWSLETTER_PILOT_ALLOWLIST ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const checked = items.map((item) => checkEmail(item));
  if (!items.length || items.length > MAX_ALLOWLIST || checked.some((item) => !item)) return undefined;
  return { apiKey, from, replyTo, segmentId, allowlist: [...new Set(checked as string[])] };
}

// Resend replaces `{{NAME}}` / `{{{NAME}}}` in subject, html and text. Editorial content must never reach that engine as
// template syntax (it could pull a contact property or the unsubscribe URL into the wrong place), so braces are defused:
// entities in html, a word joiner (U+2060, invisible) in plain text and subject, percent-encoding in URLs.
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"'{}]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "{": "&#123;", "}": "&#125;" })[char] as string);

const defuseText = (value: string): string => value.replace(/\{/g, "{\u2060").replace(/\}/g, "\u2060}");

const defuseUrl = (value: string): string => value.replace(/\{/g, "%7B").replace(/\}/g, "%7D");

const LINK = /\[([^\]\n]{1,300})\]\(([^)\s]{1,2048})\)/g;

function inlineParts(text: string): { t: string; href?: string }[] {
  const parts: { t: string; href?: string }[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const checked = match[2].includes("(") ? undefined : checkHttpsUrl(match[2]);
    if (!checked) continue;
    const href = defuseUrl(checked);
    if (match.index > last) parts.push({ t: text.slice(last, match.index) });
    parts.push({ t: match[1], href });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ t: text.slice(last) });
  return parts;
}

const paragraphs = (corpo: string): string[] =>
  corpo
    .replace(/\r\n?|[\u0085\u2028\u2029]/g, "\n")
    .split(/\n[^\S\n]*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

// Everything editorial is escaped and its braces defused; only `[text](https://...)` becomes a link; the Resend unsubscribe
// placeholder is the only template syntax, and it is a constant of this file, never taken from the edition. The reply-to is
// set on the Broadcast.
export function buildBroadcastMessage(config: Pick<BroadcastConfig, "from" | "replyTo" | "segmentId">, revision: EditionRevisionRecord, name: string): BroadcastMessage {
  const blocks = paragraphs(revision.corpo);
  const htmlBlocks = blocks.map(
    (block) =>
      `<p>${inlineParts(block)
        .map((part) => (part.href ? `<a href="${escapeHtml(part.href)}">${escapeHtml(part.t)}</a>` : escapeHtml(part.t)).replace(/\n/g, "<br>"))
        .join("")}</p>`,
  );
  const textBlocks = blocks.map((block) => inlineParts(block).map((part) => (part.href ? `${defuseText(part.t)} (${part.href})` : defuseText(part.t))).join(""));
  const sources = revision.fontes
    .map((source) => ({ titulo: source.titulo, href: checkHttpsUrl(source.href) }))
    .filter((source): source is { titulo: string; href: string } => Boolean(source.href))
    .map((source) => ({ titulo: source.titulo, href: defuseUrl(source.href) }));
  const subject = defuseText(revision.titulo);
  const html =
    `<!doctype html><html lang="pt-BR"><body>` +
    `<h1>${escapeHtml(revision.titulo)}</h1>${htmlBlocks.join("")}` +
    (sources.length ? `<h2>Fontes</h2><ul>${sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.titulo)}</a></li>`).join("")}</ul>` : "") +
    `<hr><p>Root Trust. Responda a este e-mail para falar com a equipe.</p>` +
    `<p><a href="${UNSUBSCRIBE_PLACEHOLDER}">Cancelar o recebimento desta newsletter</a></p></body></html>`;
  const text =
    [subject, ...textBlocks].join("\n\n") +
    (sources.length ? `\n\nFontes:\n${sources.map((source) => `- ${defuseText(source.titulo)}: ${source.href}`).join("\n")}` : "") +
    `\n\n--\nRoot Trust. Responda a este e-mail para falar com a equipe.\nCancelar o recebimento desta newsletter: ${UNSUBSCRIBE_PLACEHOLDER}`;
  return { name, from: config.from, replyTo: config.replyTo, subject, html, text, segmentId: config.segmentId };
}

const failure = (error: { name?: string; statusCode?: number | null } | null | undefined): { ok: false; code: string; status: number | null } => ({
  ok: false,
  code: error?.name ?? "no_response",
  status: error?.statusCode ?? null,
});

function toRemote(item: { id: string; name?: string | null; segment_id?: string | null; status?: string; subject?: string | null; html?: string | null }): RemoteBroadcast {
  return { id: item.id, name: item.name ?? null, segmentId: item.segment_id ?? null, status: item.status ?? "unknown", subject: item.subject ?? null, html: item.html ?? null };
}

function resendProvider(apiKey: string): BroadcastProvider {
  const client = new Resend(apiKey);
  return {
    async listContacts(segmentId, max, signal) {
      const emails: string[] = [];
      let after: string | undefined;
      for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
        const { data, error } = await client.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) }, { signal });
        if (error || !data) return failure(error);
        for (const contact of data.data) emails.push(contact.email.trim().toLowerCase());
        if (emails.length > max) return { ok: true, value: { emails, complete: false } };
        if (!data.has_more) return { ok: true, value: { emails, complete: true } };
        after = data.data.at(-1)?.id;
        if (!after) return { ok: false, code: "bad_pagination", status: null };
      }
      return { ok: true, value: { emails, complete: false } };
    },
    async createDraft(message, signal) {
      const { data, error } = await client.broadcasts.create(
        {
          name: message.name,
          from: message.from,
          replyTo: message.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
          segmentId: message.segmentId,
        },
        { signal },
      );
      return error || !data ? failure(error) : { ok: true, value: { id: data.id } };
    },
    async get(id, signal) {
      const { data, error } = await client.broadcasts.get(id, { signal });
      return error || !data ? failure(error) : { ok: true, value: toRemote(data) };
    },
    async findByName(name, signal) {
      const matches: RemoteBroadcast[] = [];
      let after: string | undefined;
      for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
        const { data, error } = await client.broadcasts.list({ limit: 100, ...(after ? { after } : {}) }, { signal });
        if (error || !data) return failure(error);
        for (const item of data.data) if (item.name === name) matches.push(toRemote(item));
        if (!data.has_more) return { ok: true, value: { matches, complete: true } };
        after = data.data.at(-1)?.id;
        if (!after) return { ok: false, code: "bad_pagination", status: null };
      }
      return { ok: true, value: { matches, complete: false } };
    },
    async send(id, signal) {
      const { data, error } = await client.broadcasts.send(id, undefined, { signal });
      return error || !data ? failure(error) : { ok: true, value: { id: data.id } };
    },
  };
}

// 4xx other than 408 (timeout), 409 (conflict) and 429 means the provider refused the request and did nothing.
const isDefiniteRefusal = (status: number | null): boolean => status !== null && status >= 400 && status < 500 && status !== 408 && status !== 409 && status !== 429;

// The guard signal reaches the SDK's fetch, so a timeout or a job abort cancels the HTTP request on our side. That says nothing
// about the provider: it may have processed a create/send whose response we never saw. A timeout is therefore an UNKNOWN
// outcome, never a failure: callers keep the attempt stamp and reconcile (by ID, by name, or a person), they do not retry blindly.
async function guarded<T>(signal: AbortSignal, call: (signal: AbortSignal) => Promise<ProviderResult<T>>): Promise<ProviderResult<T>> {
  const guard = AbortSignal.any([signal, AbortSignal.timeout(CALL_TIMEOUT_MS)]);
  if (guard.aborted) return { ok: false, code: "provider_aborted", status: null };
  try {
    return await Promise.race([
      call(guard),
      new Promise<never>((_, reject) => guard.addEventListener("abort", () => reject(new Error("provider_timeout")), { once: true })),
    ]);
  } catch (error) {
    return { ok: false, code: safeErrorCode(error), status: null };
  }
}

// Publication job: approved revision -> public projection + broadcast job. Idempotent; a slug that is not this draft's, or a
// revision that is not the approved one, is permanent (nothing is published and no delivery is scheduled).
export function createPublishHandler(store: Store, idSecret: string, now: () => Date, scheduleBroadcast: boolean): JobHandler {
  return async (job) => {
    const draftId = job.payload.draftId;
    const revision = Number(job.payload.revision);
    if (!draftId || !DRAFT_ID.test(draftId) || !Number.isInteger(revision) || revision < 1) throw new PermanentFailure("bad_payload");
    try {
      await publishApprovedEdition(store, idSecret, draftId, revision, now(), scheduleBroadcast);
    } catch (error) {
      if (error instanceof PublicationBlocked) {
        logEvent("error", "newsletter_publish_blocked", { reason: error.reason });
        throw new PermanentFailure(`publish_${error.reason}`);
      }
      throw error;
    }
  };
}

type Safety = "ok" | "unavailable" | "unsafe";

export function createBroadcastHandler(store: Store, config: BroadcastConfig, now: () => Date): JobHandler {
  const provider = config.provider ?? resendProvider(config.apiKey);
  const allowed = new Set(config.allowlist);

  // Pilot guard: EVERY contact of the dedicated segment must be allowlisted. Anything else (provider down, partial list,
  // empty segment, foreign or unparsable address, more contacts than the allowlist) blocks the call. Nothing is logged but codes.
  const checkSegment = async (signal: AbortSignal): Promise<Safety> => {
    const listed = await guarded(signal, (guard) => provider.listContacts(config.segmentId, allowed.size, guard));
    if (!listed.ok) {
      logEvent("warn", "newsletter_segment_unavailable", { status: listed.status ?? 0 });
      return "unavailable";
    }
    const { emails, complete } = listed.value;
    if (!complete || !emails.length || emails.some((email) => !allowed.has(email))) {
      logEvent("error", "newsletter_segment_unsafe", { complete, empty: emails.length === 0 });
      return "unsafe";
    }
    return "ok";
  };

  // A segment with a contact outside the allowlist is not transient: retrying cannot fix it, and a retry loop would keep
  // probing a contaminated list. It fails permanently (job dead, error alert); nothing re-queues it. Recovery is a manual,
  // inspected procedure (workers/newsletter-discord/README.md).
  const requireSafeSegment = async (signal: AbortSignal): Promise<void> => {
    const safety = await checkSegment(signal);
    if (safety === "unavailable") throw new Error("segment_check_unavailable");
    if (safety === "unsafe") throw new PermanentFailure("segment_not_pilot_safe");
  };

  // The approval is valid for APPROVAL_VALIDITY_MS. A missing or unparsable instant counts as stale. Checked right before
  // each stamp (the point of no return); the public edition is untouched, only the delivery is refused.
  const requireFreshApproval = (approvedAt: string | undefined): void => {
    const approved = approvedAt ? Date.parse(approvedAt) : Number.NaN;
    if (!Number.isFinite(approved) || now().getTime() - approved > APPROVAL_VALIDITY_MS) {
      logEvent("error", "newsletter_approval_expired", {});
      throw new PermanentFailure("approval_expired");
    }
  };

  const markReconcile = async (id: string): Promise<never> => {
    await updateBroadcastState(store, id, now(), () => ({ set: { reconcile: true } }));
    logEvent("error", "newsletter_reconciliation_required", {});
    throw new PermanentFailure("reconciliation_required");
  };

  const persistId = async (id: string, broadcastId: string): Promise<EditionBroadcastRecord> => {
    const { state } = await updateBroadcastState(store, id, now(), (current) =>
      current.broadcastId ? undefined : { set: { broadcastId }, clear: ["createAttemptAt"] },
    );
    if (state.broadcastId !== broadcastId) return markReconcile(id);
    return state;
  };

  // Existing remote Broadcast for this state must be exactly ours: right name, right segment.
  const isOurs = (remote: RemoteBroadcast, state: EditionBroadcastRecord) => remote.name === state.name && remote.segmentId === state.segmentId;

  const ensureCreated = async (basis: BroadcastBasis, signal: AbortSignal): Promise<EditionBroadcastRecord> => {
    const { state } = basis;
    if (state.broadcastId) return state;

    if (state.createAttemptAt) {
      // A create whose outcome is unknown: only a positive, unique match by the deterministic name is believed. Absence (or
      // anything else) is never taken as proof that the request died: that is a person's call, never a second create.
      const found = await guarded(signal, (guard) => provider.findByName(state.name, guard));
      if (!found.ok) throw new Error("reconcile_unavailable");
      if (found.value.matches.length !== 1) return markReconcile(state.id);
      const [remote] = found.value.matches;
      if (!isOurs(remote, state)) return markReconcile(state.id);
      return persistId(state.id, remote.id);
    }

    requireFreshApproval(basis.approvedAt);
    await requireSafeSegment(signal);
    signal.throwIfAborted();
    const stamped = await updateBroadcastState(store, state.id, now(), (current) =>
      current.broadcastId || current.createAttemptAt || current.reconcile || current.sentAt ? undefined : { set: { createAttemptAt: now().toISOString() } },
    );
    // Another run holds the stamp or the state moved on: this run must not create.
    if (!stamped.applied) throw new Error("broadcast_state_changed");
    const created = await guarded(signal, (guard) => provider.createDraft(buildBroadcastMessage(config, basis.revision, stamped.state.name), guard));
    if (created.ok) return persistId(state.id, created.value.id);
    if (created.status === 429) {
      await updateBroadcastState(store, state.id, now(), (current) => (current.broadcastId ? undefined : { clear: ["createAttemptAt"] }));
      throw new RetryLater(0);
    }
    if (isDefiniteRefusal(created.status)) {
      await updateBroadcastState(store, state.id, now(), (current) => (current.broadcastId ? undefined : { clear: ["createAttemptAt"] }));
      logEvent("error", "newsletter_create_refused", { status: created.status ?? 0 });
      throw new PermanentFailure("broadcast_create_refused");
    }
    // Unknown outcome: keep the stamp; the retry reconciles by name instead of creating again.
    logEvent("warn", "newsletter_create_uncertain", { error: created.code });
    throw new Error("broadcast_create_uncertain");
  };

  const markSent = async (id: string): Promise<void> => {
    await updateBroadcastState(store, id, now(), (current) => (current.sentAt ? undefined : { set: { sentAt: now().toISOString() }, clear: ["sendAttemptAt"] }));
  };

  // What would go out must be exactly what was approved: the remote draft can be edited by anyone with dashboard access.
  const sameContent = (remote: RemoteBroadcast, message: BroadcastMessage): boolean => {
    const normal = (value: string) => value.replace(/\r\n?/g, "\n").trim();
    return remote.subject !== null && remote.html !== null && normal(remote.subject) === normal(message.subject) && normal(remote.html) === normal(message.html);
  };

  const ensureSent = async (basis: BroadcastBasis, state: EditionBroadcastRecord, signal: AbortSignal): Promise<void> => {
    const broadcastId = state.broadcastId as string;
    const remote = await guarded(signal, (guard) => provider.get(broadcastId, guard));
    if (!remote.ok) throw new Error("broadcast_state_unavailable");
    if (!isOurs(remote.value, state)) return void (await markReconcile(state.id));

    if (remote.value.status === "sent" || remote.value.status === "queued") {
      // The provider already accepted the send (this run, an earlier uncertain one, or a person): record it, never send twice.
      await markSent(state.id);
      return;
    }
    if (remote.value.status !== "draft") return void (await markReconcile(state.id));

    // Still a draft after a send whose outcome is unknown: the request may be lost or in flight, and the status alone cannot
    // tell. Never send again on that evidence; a person confirms with the provider.
    if (state.sendAttemptAt) return void (await markReconcile(state.id));
    requireFreshApproval(basis.approvedAt);
    if (!sameContent(remote.value, buildBroadcastMessage(config, basis.revision, state.name))) {
      logEvent("error", "newsletter_remote_diverged", {});
      return void (await markReconcile(state.id));
    }
    await requireSafeSegment(signal);
    signal.throwIfAborted();
    const stamped = await updateBroadcastState(store, state.id, now(), (current) =>
      current.sentAt || current.reconcile || current.sendAttemptAt ? undefined : { set: { sendAttemptAt: now().toISOString() } },
    );
    if (!stamped.applied) throw new Error("broadcast_state_changed");
    const sent = await guarded(signal, (guard) => provider.send(broadcastId, guard));
    if (sent.ok) {
      await markSent(state.id);
      return;
    }
    if (sent.status === 429) {
      await updateBroadcastState(store, state.id, now(), (current) => (current.sentAt ? undefined : { clear: ["sendAttemptAt"] }));
      throw new RetryLater(0);
    }
    if (isDefiniteRefusal(sent.status)) {
      await updateBroadcastState(store, state.id, now(), (current) => (current.sentAt ? undefined : { clear: ["sendAttemptAt"] }));
      logEvent("error", "newsletter_send_refused", { status: sent.status ?? 0 });
      throw new PermanentFailure("broadcast_send_refused");
    }
    logEvent("warn", "newsletter_send_uncertain", { error: sent.code });
    throw new Error("broadcast_send_uncertain");
  };

  return async (job, { signal }) => {
    const draftId = job.payload.draftId;
    const revision = Number(job.payload.revision);
    if (!draftId || !DRAFT_ID.test(draftId) || !Number.isInteger(revision) || revision < 1) throw new PermanentFailure("bad_payload");
    let basis: BroadcastBasis;
    try {
      basis = await loadBroadcastBasis(store, draftId, revision, config.segmentId, now());
    } catch (error) {
      if (error instanceof PublicationBlocked) throw new PermanentFailure(`broadcast_${error.reason}`);
      throw error;
    }
    const { state } = basis;
    if (state.sentAt) return;
    if (state.reconcile) throw new PermanentFailure("reconciliation_required");
    if (state.segmentId !== config.segmentId) throw new PermanentFailure("segment_changed");
    const created = await ensureCreated(basis, signal);
    await ensureSent(basis, created, signal);
  };
}
