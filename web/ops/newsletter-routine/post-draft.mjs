#!/usr/bin/env node
// Posts one newsletter draft (JSON file or stdin) to the site, signed with the Routine's `draft` key. No dependencies.
// This key can only create immutable draft revisions: it cannot approve, publish or send anything.
import { createHash, createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const DRAFT_PATH = "/api/internal/newsletter/draft";
const MIN_KEY_LENGTH = 32;

// Same canonical string as src/lib/server/internal-auth.ts (signInternalRequest), scope "draft".
export function signDraft(key, { timestamp, nonce, body }) {
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const canonical = ["v1", "draft", "POST", DRAFT_PATH, timestamp, nonce, bodyHash].join("\n");
  return createHmac("sha256", key).update(canonical).digest("base64url");
}

export function buildDraftRequest({ origin, key, body, now = Date.now(), nonce = randomBytes(18).toString("base64url") }) {
  const url = new URL(DRAFT_PATH, origin);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) throw new Error("SITE_ORIGIN must be https");
  if (typeof key !== "string" || key.length < MIN_KEY_LENGTH) throw new Error("INTERNAL_KEY_DRAFT is missing or too short");
  const bytes = Buffer.from(body);
  return {
    url: url.toString(),
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-rt-timestamp": String(now),
        "x-rt-nonce": nonce,
        "x-rt-signature": signDraft(key, { timestamp: now, nonce, body: bytes }),
      },
      body: bytes,
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    },
  };
}

// Prints only the HTTP status and the machine-readable code/ids from the answer; never the key, never the draft text.
export async function postDraft({ origin, key, body, fetcher = fetch }) {
  JSON.parse(body); // fail fast, locally, on malformed JSON
  const { url, init } = buildDraftRequest({ origin, key, body });
  const response = await fetcher(url, init);
  const answer = await response.json().catch(() => ({}));
  const pick = (name) => (typeof answer?.[name] === "string" || typeof answer?.[name] === "number" ? answer[name] : undefined);
  return { status: response.status, code: pick("code"), draftId: pick("draftId"), revision: pick("revision") };
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("usage: post-draft.mjs <draft.json | ->");
  const body = readFileSync(file === "-" ? 0 : file, "utf8");
  const result = await postDraft({ origin: process.env.SITE_ORIGIN, key: process.env.INTERNAL_KEY_DRAFT, body });
  console.log(JSON.stringify(result));
  // 202 queued. 409 slug_exists means an earlier attempt already stored this edition: do not post it again.
  process.exitCode = result.status === 202 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`post-draft failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 2;
  });
}
