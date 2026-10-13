import { createHash } from "node:crypto";
import { DISCORD_PUBLIC_KEY } from "./discord-proof";
import { PermanentFailure, RetryLater, type JobHandler } from "./jobs";
import { buildCustomId, DRAFT_ID, SNOWFLAKE } from "./newsletter-protocol";
import { bindEditionNotification } from "./repository";
import { logEvent, safeErrorCode } from "./safe";
import type { Store } from "./store";
import { COLLECTIONS, type EditionDraftRecord, type EditionRevisionRecord } from "./types";

const DISCORD_API = "https://discord.com/api/v10";
const SEND_TIMEOUT_MS = 8_000;
const MESSAGE_LIMIT = 1900; // Discord caps a message at 2000 characters; leave room for the code-point/escape margin.
// Few inline messages on purpose: a 429 midway makes the job retry from the first message, so every extra inline chunk is
// one more possible repeat. Anything longer goes in a single .md attachment.
const MAX_INLINE_MESSAGES = 2;
const FLAG_SUPPRESS_EMBEDS = 4;

export interface NewsletterConfig {
  botToken: string;
  applicationId: string;
  guildId: string;
  channelId: string;
  // Ed25519 public key of the Discord application (64 hex): the server re-verifies the original interaction with it.
  publicKey: string;
  fetch?: typeof fetch;
}

// Fail closed: the review channel is operational only with the bot token, the three Discord IDs and the operator's
// statement that something triggers the job runner (same attestation as the diagnostic receipt) and the application public
// key. The bot token can post to the private channel; it cannot approve or send anything by itself.
export function loadNewsletterConfig(env: Record<string, string | undefined>): NewsletterConfig | undefined {
  const botToken = env.DISCORD_NEWSLETTER_BOT_TOKEN?.trim() ?? "";
  const applicationId = env.DISCORD_APPLICATION_ID?.trim() ?? "";
  const guildId = env.DISCORD_GUILD_ID?.trim() ?? "";
  const channelId = env.DISCORD_NEWSLETTER_CHANNEL_ID?.trim() ?? "";
  const publicKey = env.DISCORD_PUBLIC_KEY?.trim() ?? "";
  if (env.JOBS_TRIGGER_CONFIRMED !== "true" || !/^[\w.-]{20,200}$/.test(botToken)) return undefined;
  if (![applicationId, guildId, channelId].every((id) => SNOWFLAKE.test(id))) return undefined;
  if (!DISCORD_PUBLIC_KEY.test(publicKey)) return undefined;
  return { botToken, applicationId, guildId, channelId, publicKey: publicKey.toLowerCase() };
}

// The full body is for human reviewers in the private channel only: control characters, bidi overrides and zero-width
// characters are dropped; Markdown is kept as authored so the reviewer sees what would be sent.
function neutralize(value: string): string {
  return value
    .replace(/\r\n?|[\u0085\u2028\u2029]/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "");
}

const inline = (value: string): string => neutralize(value).replace(/\s+/g, " ").trim();

export function splitForDiscord(text: string, limit = MESSAGE_LIMIT): string[] {
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push(current);
    current = "";
  };
  for (const paragraph of text.split(/\n{2,}/)) {
    let rest = paragraph.trim();
    while (rest.length > limit) {
      const cut = Math.max(rest.lastIndexOf("\n", limit), rest.lastIndexOf(" ", limit));
      flush();
      const at = cut > limit / 2 ? cut : limit;
      chunks.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (!rest) continue;
    if (current && current.length + 2 + rest.length > limit) flush();
    current = current ? `${current}\n\n${rest}` : rest;
  }
  flush();
  return chunks;
}

function reviewHeader(record: EditionRevisionRecord): string {
  return [
    `**Edição para revisão** · ${inline(record.pilar)} · ${record.data}`,
    `**${inline(record.titulo)}**`,
    `Slug: ${record.slug} · ID ${record.draftId} · revisão ${record.revision}`,
  ].join("\n");
}

export function formatReviewText(record: EditionRevisionRecord): string {
  const sources = record.fontes.length
    ? `**Fontes**\n${record.fontes.map((source) => `- ${inline(source.titulo)}: <${source.href}>`).join("\n")}`
    : "**Fontes**\nNenhuma fonte informada.";
  return [reviewHeader(record), neutralize(record.corpo), sources].join("\n\n");
}

export function formatControlMessage(record: EditionRevisionRecord): string {
  return [
    `Revisão ${record.revision} da edição ${record.slug} (ID ${record.draftId}).`,
    "Nada foi publicado nem enviado. Aprovar publica a prévia pública (título, primeiro parágrafo e fontes) e agenda o envio ao segmento piloto, que só ocorre com o piloto configurado e em até 24 h da aprovação; Recusar ou Gerar nova versão não publicam nada.",
  ].join("\n");
}

export function controlComponents(draftId: string, revision: number) {
  return [
    {
      type: 1,
      components: [
        { type: 2, style: 3, label: "Aprovar e publicar", custom_id: buildCustomId("approve", draftId, revision) },
        { type: 2, style: 4, label: "Recusar", custom_id: buildCustomId("reject", draftId, revision) },
        { type: 2, style: 2, label: "Gerar nova versão", custom_id: buildCustomId("regenerate", draftId, revision) },
      ],
    },
  ];
}

function retryAfterMs(response: Response, body: unknown): number {
  const header = Number(response.headers.get("retry-after"));
  const fromBody = typeof body === "object" && body !== null ? Number((body as { retry_after?: unknown }).retry_after) : Number.NaN;
  const seconds = Number.isFinite(header) && header > 0 ? header : fromBody;
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
}

// `enforce_nonce` makes Discord drop a repeat of the same nonce for a short window, which covers a retry right after a
// send whose outcome was lost. Past that window a duplicate review message is possible but harmless: only the message
// whose ID is bound to the revision can decide anything.
const nonceOf = (jobId: string, index: number): string => createHash("sha256").update(`${jobId}:${index}`).digest("base64url").slice(0, 24);

async function postMessage(
  config: NewsletterConfig,
  send: typeof fetch,
  signal: AbortSignal,
  payload: Record<string, unknown>,
  nonce: string,
  file?: { name: string; text: string },
): Promise<string> {
  const json = { ...payload, nonce, enforce_nonce: true, allowed_mentions: { parse: [] }, flags: FLAG_SUPPRESS_EMBEDS };
  const headers: Record<string, string> = { authorization: `Bot ${config.botToken}`, "user-agent": "DiscordBot (roottrust-newsletter, 1.0)" };
  let body: string | FormData;
  if (file) {
    const form = new FormData();
    form.set("payload_json", JSON.stringify({ ...json, attachments: [{ id: 0, filename: file.name }] }));
    form.set("files[0]", new Blob([file.text], { type: "text/markdown; charset=utf-8" }), file.name);
    body = form;
  } else {
    headers["content-type"] = "application/json";
    body = JSON.stringify(json);
  }
  let response: Response;
  try {
    response = await send(`${DISCORD_API}/channels/${config.channelId}/messages`, {
      method: "POST",
      headers,
      body,
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(SEND_TIMEOUT_MS)]),
    });
  } catch (error) {
    logEvent("warn", "newsletter_send_failed", { error: safeErrorCode(error) });
    throw new Error("discord_unreachable");
  }
  if (response.status === 429) {
    const rate: unknown = await response.json().catch(() => undefined);
    throw new RetryLater(retryAfterMs(response, rate));
  }
  if (response.status >= 500 || response.status === 408) throw new Error(`discord_${response.status}`);
  if (!response.ok) throw new PermanentFailure(`discord_${response.status}`);
  const created: unknown = await response.json().catch(() => undefined);
  const id = typeof created === "object" && created !== null ? (created as { id?: unknown }).id : undefined;
  if (typeof id !== "string" || !SNOWFLAKE.test(id)) throw new PermanentFailure("discord_bad_response");
  return id;
}

// Outbox job `newsletter.discord` (payload: draftId + revision). Posts the full body and then a control message with the
// three buttons into the private channel, and only then binds that control message to the revision. A job for a revision
// that is no longer the current pending one posts nothing. Approval, publication and sending are T4.3.
export function createNewsletterHandler(store: Store, config: NewsletterConfig, now: () => Date): JobHandler {
  const send = config.fetch ?? fetch;
  return async (job, { signal }) => {
    const { draftId, revision: rawRevision } = job.payload;
    const revision = Number(rawRevision);
    if (!draftId || !DRAFT_ID.test(draftId) || !Number.isInteger(revision) || revision < 1) throw new PermanentFailure("bad_payload");
    const { draft, record } = await store.transaction(async (tx) => ({
      draft: await tx.get<EditionDraftRecord>(COLLECTIONS.editionDrafts, draftId),
      record: await tx.get<EditionRevisionRecord>(COLLECTIONS.editionRevisions, `${draftId}.${revision}`),
    }));
    if (!draft || !record) throw new PermanentFailure("edition_not_found");
    if (draft.currentRevision !== revision || draft.status !== "pending" || draft.notification) return;

    const chunks = splitForDiscord(formatReviewText(record));
    let index = 0;
    if (chunks.length <= MAX_INLINE_MESSAGES) {
      for (const content of chunks) await postMessage(config, send, signal, { content }, nonceOf(job.id, index++));
    } else {
      await postMessage(
        config,
        send,
        signal,
        { content: `${reviewHeader(record)}\n\nCorpo completo em anexo (longo demais para mensagens).` },
        nonceOf(job.id, index++),
        { name: `${record.slug}-r${revision}.md`, text: formatReviewText(record) },
      );
    }
    const messageId = await postMessage(
      config,
      send,
      signal,
      { content: formatControlMessage(record), components: controlComponents(draftId, revision) },
      nonceOf(job.id, index),
    );
    await bindEditionNotification(store, { draftId, revision, channelId: config.channelId, messageId }, now());
  };
}
