import { createPublicKey, verify } from "node:crypto";
import { PROOF_TOLERANCE_S, parseCustomId, type DecisionAction } from "./newsletter-protocol";
import type { DiscordProof } from "./validation";

// DER SubjectPublicKeyInfo prefix for a raw 32-byte Ed25519 public key.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export const DISCORD_PUBLIC_KEY = /^[0-9a-f]{64}$/i;

export interface ProofExpectation {
  publicKeyHex: string;
  now: Date;
  action: DecisionAction;
  draftId: string;
  revision: number;
  applicationId: string;
  guildId: string;
  channelId: string;
  messageId: string;
}

export type ProofResult = { ok: true } | { ok: false; reason: "bad_key" | "bad_signature" | "stale_timestamp" | "mismatch" };

// Revalidates the original Discord interaction (Ed25519 over `timestamp + raw body`, the same check the Worker did) and then
// that what it says is exactly what the Worker's HMAC-signed decision claims. The HMAC proves the Worker spoke; this proves
// a human clicked this button, so a leaked HMAC key alone cannot approve anything.
export function verifyDiscordProof(proof: DiscordProof, expected: ProofExpectation): ProofResult {
  if (!DISCORD_PUBLIC_KEY.test(expected.publicKeyHex)) return { ok: false, reason: "bad_key" };
  if (Math.abs(expected.now.getTime() / 1000 - Number(proof.timestamp)) > PROOF_TOLERANCE_S) return { ok: false, reason: "stale_timestamp" };
  let valid = false;
  try {
    const key = createPublicKey({ key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(expected.publicKeyHex, "hex")]), format: "der", type: "spki" });
    valid = verify(null, Buffer.from(proof.timestamp + proof.body, "utf8"), key, Buffer.from(proof.signature, "hex"));
  } catch {
    valid = false;
  }
  if (!valid) return { ok: false, reason: "bad_signature" };

  let interaction: unknown;
  try {
    interaction = JSON.parse(proof.body);
  } catch {
    return { ok: false, reason: "mismatch" };
  }
  const payload = (typeof interaction === "object" && interaction !== null ? interaction : {}) as {
    type?: unknown;
    application_id?: unknown;
    guild_id?: unknown;
    channel_id?: unknown;
    message?: { id?: unknown };
    data?: { custom_id?: unknown; component_type?: unknown };
  };
  const custom = parseCustomId(payload.data?.custom_id);
  const matches =
    payload.type === 3 &&
    payload.data?.component_type === 2 &&
    custom?.action === expected.action &&
    custom.draftId === expected.draftId &&
    custom.revision === expected.revision &&
    payload.application_id === expected.applicationId &&
    payload.guild_id === expected.guildId &&
    payload.channel_id === expected.channelId &&
    payload.message?.id === expected.messageId;
  return matches ? { ok: true } : { ok: false, reason: "mismatch" };
}
