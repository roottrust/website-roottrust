import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// Opaque, stable ID: the same identity always maps to the same document, and it cannot be reversed without the secret.
export function opaqueId(secret: string, prefix: string, identity: string): string {
  return `${prefix}_${createHmac("sha256", secret).update(`${prefix}:${identity}`).digest("base64url").slice(0, 32)}`;
}

export const CONFIRMATION_TOKEN = /^(cf_[0-9a-f]{32})\.([A-Za-z0-9_-]{43})$/;

const confirmationMac = (secret: string, id: string) => createHmac("sha256", secret).update(`cf-token:${id}`).digest("base64url");

export const newConfirmationId = () => `cf_${randomUUID().replaceAll("-", "")}`;

// Opaque, single-purpose token. Only the ID is stored; the MAC makes the token underivable from the database alone.
export const confirmationToken = (secret: string, id: string) => `${id}.${confirmationMac(secret, id)}`;

// Returns the confirmation ID of an authentic token, or undefined (malformed or forged) without touching storage.
export function verifyConfirmationToken(secret: string, token: unknown): string | undefined {
  const match = typeof token === "string" ? CONFIRMATION_TOKEN.exec(token) : null;
  if (!match) return undefined;
  const expected = Buffer.from(confirmationMac(secret, match[1]));
  const received = Buffer.from(match[2]);
  return received.length === expected.length && timingSafeEqual(received, expected) ? match[1] : undefined;
}

const CANCELLATION_TOKEN = /^(sb_[A-Za-z0-9_-]{32})\.([A-Za-z0-9_-]{32})\.([A-Za-z0-9_-]{43})$/;
const cancellationMac = (secret: string, id: string, confirmedAt: string) => createHmac("sha256", secret).update(`cancel:${id}:${confirmedAt}`).digest("base64url");

// The confirmation timestamp makes older cancellation links unusable after a fresh opt-in.
export function cancellationToken(secret: string, id: string, confirmedAt: string): string {
  return `${id}.${Buffer.from(confirmedAt).toString("base64url")}.${cancellationMac(secret, id, confirmedAt)}`;
}

export function verifyCancellationToken(secret: string, token: unknown): { id: string; confirmedAt: string } | undefined {
  const match = typeof token === "string" ? CANCELLATION_TOKEN.exec(token) : null;
  if (!match) return undefined;
  const confirmedAt = Buffer.from(match[2], "base64url").toString("utf8");
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(confirmedAt)) return undefined;
  const expected = Buffer.from(cancellationMac(secret, match[1], confirmedAt));
  const received = Buffer.from(match[3]);
  return received.length === expected.length && timingSafeEqual(received, expected) ? { id: match[1], confirmedAt } : undefined;
}
