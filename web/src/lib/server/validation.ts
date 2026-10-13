import { validateContact, validateEmail } from "../forms";
import { PILARES } from "../../features/newsletter/catalog";
import { DECISION_ACTIONS, DRAFT_ID, MAX_PROOF_BODY_BYTES, PROOF_SIGNATURE, PROOF_TIMESTAMP, SNOWFLAKE, type DecisionAction } from "./newsletter-protocol";
import { TOOL_IDS, type EditionOpeningSegment, type EditionSource, type ToolId } from "./types";

export const MAX_BODY_BYTES = 8 * 1024;

export type Parsed<T> = { ok: true; value: T } | { ok: false; fields: string[] };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const MAX_EDITION_BYTES = 64 * 1024;

export function isEditionSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 80 && SLUG.test(value);
}

function asRecord(body: unknown): Record<string, unknown> | undefined {
  return typeof body === "object" && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : undefined;
}

// Unknown keys are rejected so tool answers/results can never ride along and be persisted.
function unknownKeys(body: Record<string, unknown>, allowed: readonly string[]): string[] {
  return Object.keys(body).filter((key) => !allowed.includes(key));
}

export function checkEmail(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 254 || validateEmail(value)) return undefined;
  return value.trim().toLowerCase();
}

export function parseDiagnostic(body: unknown): Parsed<{ name: string; company: string; whatsapp: string }> {
  const record = asRecord(body);
  if (!record) return { ok: false, fields: ["body"] };
  const extra = unknownKeys(record, ["name", "company", "whatsapp"]);
  const { name, company, whatsapp } = record;
  if (extra.length || typeof name !== "string" || typeof company !== "string" || typeof whatsapp !== "string"
    || name.length > 120 || company.length > 160 || whatsapp.length > 32) {
    return { ok: false, fields: extra.length ? extra : ["name", "company", "whatsapp"] };
  }
  const errors = Object.keys(validateContact({ name, company, whatsapp }));
  if (errors.length) return { ok: false, fields: errors };
  let digits = whatsapp.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  return { ok: true, value: { name: name.trim(), company: company.trim(), whatsapp: digits } };
}

export function parseSubscription(body: unknown): Parsed<{ email: string; editionSlug?: string }> {
  const record = asRecord(body);
  if (!record) return { ok: false, fields: ["body"] };
  const extra = unknownKeys(record, ["email", "editionSlug"]);
  const email = checkEmail(record.email);
  const slug = record.editionSlug;
  const slugOk = slug === undefined || (typeof slug === "string" && slug.length <= 80 && SLUG.test(slug));
  const fields = [...extra, ...(email ? [] : ["email"]), ...(slugOk ? [] : ["editionSlug"])];
  if (fields.length || !email) return { ok: false, fields };
  return { ok: true, value: typeof slug === "string" ? { email, editionSlug: slug } : { email } };
}

export function parseReport(body: unknown): Parsed<{ email: string; toolId: ToolId; commercialConsent: boolean }> {
  const record = asRecord(body);
  if (!record) return { ok: false, fields: ["body"] };
  const extra = unknownKeys(record, ["email", "toolId", "commercialConsent"]);
  const email = checkEmail(record.email);
  const toolId = TOOL_IDS.find((id) => id === record.toolId);
  const consent = record.commercialConsent;
  const consentOk = consent === undefined || typeof consent === "boolean";
  const fields = [...extra, ...(email ? [] : ["email"]), ...(toolId ? [] : ["toolId"]), ...(consentOk ? [] : ["commercialConsent"])];
  if (fields.length || !email || !toolId) return { ok: false, fields };
  return { ok: true, value: { email, toolId, commercialConsent: consent === true } };
}

// Only absolute https URLs without credentials. Returns the normalized href.
export function checkHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048 || /[\s\p{Cc}]/u.test(value)) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const STRUCTURAL_LINE = /^(#{1,6}\s|>|[-*+]\s|\d+[.)]\s|```|---|\|)/m;
const MIN_OPENING_CHARS = 40;
export const MAX_OPENING_CHARS = 2000;
const INLINE_LINK = /\[([^\]\n]{1,300})\]\(([^)\s]{1,2048})\)/g;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
}

// `corpo` is the editorial body only (title, greeting, preheader, signature and footer are not part of it), so the opening
// is its FIRST paragraph (N08), whole: if that paragraph is structural, too short, longer than MAX_OPENING_CHARS (never
// truncated; usually a missing separator) or has an invalid link, the body is rejected, never a later paragraph used.
// Only `[text](https://...)` is kept, as structured data; other markup stays literal text and is escaped on render.
// A URL with parentheses is rejected rather than published truncated.
export function extractOpening(corpo: string): EditionOpeningSegment[] | undefined {
  const first = corpo
    .replace(/\r\n?|[\u0085\u2028\u2029]/g, "\n")
    .split(/\n[^\S\n]*\n/)
    .map((block) => block.trim())
    .find((block) => block);
  if (!first || STRUCTURAL_LINE.test(first)) return undefined;
  const text = first.replace(/\s*\n\s*/g, " ");
  if (text.length < MIN_OPENING_CHARS || text.length > MAX_OPENING_CHARS || text.includes("![")) return undefined;
  const segments: EditionOpeningSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_LINK)) {
    const href = match[2].includes("(") ? undefined : checkHttpsUrl(match[2]);
    if (!href || !match[1].trim()) return undefined;
    if (match.index > last) segments.push({ t: text.slice(last, match.index) });
    segments.push({ t: match[1], href });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ t: text.slice(last) });
  return segments.some((segment) => segment.t.includes("](")) ? undefined : segments;
}

export interface EditionInput {
  slug: string;
  data: string;
  pilar: string;
  titulo: string;
  corpo: string;
  fontes: EditionSource[];
  abertura: EditionOpeningSegment[];
}

// Draft contract for the routine (T4.2): exact keys, 64 KiB cap, opening derived here (never trusted from the caller).
export function parseEditionInput(body: unknown): Parsed<EditionInput> {
  const record = asRecord(body);
  if (!record) return { ok: false, fields: ["body"] };
  const extra = unknownKeys(record, ["slug", "data", "pilar", "titulo", "corpo", "fontes"]);
  const { slug, data, pilar, titulo, corpo, fontes } = record;
  const fields = [...extra];
  if (!isEditionSlug(slug)) fields.push("slug");
  if (!isIsoDate(data)) fields.push("data");
  if (typeof pilar !== "string" || !(PILARES as readonly string[]).includes(pilar)) fields.push("pilar");
  const title = typeof titulo === "string" ? titulo.trim() : "";
  if (!title || title.length > 200 || /\p{Cc}/u.test(title)) fields.push("titulo");
  const abertura = typeof corpo === "string" && Buffer.byteLength(corpo) <= MAX_EDITION_BYTES ? extractOpening(corpo) : undefined;
  if (!abertura) fields.push("corpo");
  const sources: EditionSource[] = [];
  let sourcesOk = Array.isArray(fontes) && fontes.length >= 1 && fontes.length <= 20;
  for (const item of sourcesOk ? (fontes as unknown[]) : []) {
    const source = asRecord(item);
    const href = source && !unknownKeys(source, ["titulo", "href"]).length ? checkHttpsUrl(source.href) : undefined;
    const label = typeof source?.titulo === "string" ? source.titulo.trim() : "";
    if (!href || !label || label.length > 200 || /\p{Cc}/u.test(label)) sourcesOk = false;
    else sources.push({ titulo: label, href });
  }
  if (!sourcesOk) fields.push("fontes");
  if (fields.length || !abertura) return { ok: false, fields };
  return { ok: true, value: { slug: slug as string, data: data as string, pilar: pilar as string, titulo: title, corpo: corpo as string, fontes: sources, abertura } };
}

// Draft endpoint body: the edition plus an optional `draftId` that turns it into the next revision of a draft a reviewer
// asked to regenerate. Anything else is rejected, so the routine cannot send a status, notification or approval field.
export function parseDraftRequest(body: unknown): Parsed<EditionInput & { draftId?: string }> {
  const record = asRecord(body);
  if (!record) return { ok: false, fields: ["body"] };
  const { draftId, ...rest } = record;
  if (draftId !== undefined && (typeof draftId !== "string" || !DRAFT_ID.test(draftId))) return { ok: false, fields: ["draftId"] };
  const parsed = parseEditionInput(rest);
  if (!parsed.ok) return parsed;
  return { ok: true, value: typeof draftId === "string" ? { ...parsed.value, draftId } : parsed.value };
}

export interface DecisionInput {
  action: DecisionAction;
  draftId: string;
  revision: number;
  applicationId: string;
  guildId: string;
  channelId: string;
  messageId: string;
  proof: DiscordProof;
}

// The Discord interaction as received (see PROOF_* in newsletter-protocol): `body` is the exact raw text that was signed.
export interface DiscordProof {
  timestamp: string;
  signature: string;
  body: string;
}

// Decision endpoint body, signed by the Discord Worker: exact keys, every binding field present, plus the Discord proof.
export function parseDecision(body: unknown): Parsed<DecisionInput> {
  const record = asRecord(body);
  if (!record) return { ok: false, fields: ["body"] };
  const extra = unknownKeys(record, ["action", "draftId", "revision", "applicationId", "guildId", "channelId", "messageId", "proof"]);
  const action = DECISION_ACTIONS.find((candidate) => candidate === record.action);
  const { draftId, revision, applicationId, guildId, channelId, messageId } = record;
  const fields = [...extra];
  if (!action) fields.push("action");
  if (typeof draftId !== "string" || !DRAFT_ID.test(draftId)) fields.push("draftId");
  if (typeof revision !== "number" || !Number.isInteger(revision) || revision < 1 || revision > 999_999) fields.push("revision");
  for (const [name, value] of [["applicationId", applicationId], ["guildId", guildId], ["channelId", channelId], ["messageId", messageId]] as const) {
    if (typeof value !== "string" || !SNOWFLAKE.test(value)) fields.push(name);
  }
  const proofRecord = asRecord(record.proof);
  const proofOk =
    proofRecord !== undefined &&
    !unknownKeys(proofRecord, ["timestamp", "signature", "body"]).length &&
    typeof proofRecord.timestamp === "string" &&
    PROOF_TIMESTAMP.test(proofRecord.timestamp) &&
    typeof proofRecord.signature === "string" &&
    PROOF_SIGNATURE.test(proofRecord.signature) &&
    typeof proofRecord.body === "string" &&
    proofRecord.body.length > 0 &&
    Buffer.byteLength(proofRecord.body) <= MAX_PROOF_BODY_BYTES;
  if (!proofOk) fields.push("proof");
  if (fields.length || !action || !proofRecord) return { ok: false, fields };
  return {
    ok: true,
    value: {
      proof: { timestamp: proofRecord.timestamp as string, signature: proofRecord.signature as string, body: proofRecord.body as string },
      action,
      draftId: draftId as string,
      revision: revision as number,
      applicationId: applicationId as string,
      guildId: guildId as string,
      channelId: channelId as string,
      messageId: messageId as string,
    },
  };
}
