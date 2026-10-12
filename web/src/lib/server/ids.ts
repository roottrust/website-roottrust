import { createHmac } from "node:crypto";

// Opaque, stable ID: the same identity always maps to the same document, and it cannot be reversed without the secret.
export function opaqueId(secret: string, prefix: string, identity: string): string {
  return `${prefix}_${createHmac("sha256", secret).update(`${prefix}:${identity}`).digest("base64url").slice(0, 32)}`;
}
