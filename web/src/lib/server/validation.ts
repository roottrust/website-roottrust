import { validateContact, validateEmail } from "../forms";
import { TOOL_IDS, type ToolId } from "./types";

export const MAX_BODY_BYTES = 8 * 1024;

export type Parsed<T> = { ok: true; value: T } | { ok: false; fields: string[] };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
