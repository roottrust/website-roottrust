import { DECISION_PATH, MAX_CUSTOM_ID_LENGTH, SNOWFLAKE, parseCustomId, type DecisionResult } from "../../src/lib/server/newsletter-protocol";

// Cloudflare Worker for Discord button interactions on the private newsletter review channel. It holds the Discord public
// key and the `publish` HMAC key; it never holds the Routine's `draft` key, the bot token or any storage credential. T4.2:
// it can reject or request regeneration; approving/publishing/sending belongs to T4.3.
export interface Env {
  DISCORD_PUBLIC_KEY: string; // hex, 64 chars (Developer Portal "Public Key")
  DISCORD_APPLICATION_ID: string;
  DISCORD_GUILD_ID: string;
  DISCORD_NEWSLETTER_CHANNEL_ID: string;
  SITE_ORIGIN: string; // https origin of the site that serves DECISION_PATH
  INTERNAL_KEY_PUBLISH: string; // secret
  ROUTINE_FIRE_URL?: string; // optional: best-effort wake-up of the Routine after "Gerar nova versão"
  ROUTINE_FIRE_TOKEN?: string; // secret
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

const ENCODER = new TextEncoder();
const TIMESTAMP_TOLERANCE_S = 300;
const MAX_BODY_BYTES = 16 * 1024;
const DECISION_TIMEOUT_MS = 2200; // Discord requires an answer within 3 s
const EPHEMERAL = 64;

const fromHex = (value: string): Uint8Array | undefined => {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) return undefined;
  const out = new Uint8Array(value.length / 2);
  for (let index = 0; index < out.length; index++) out[index] = parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return out;
};

const toHex = (bytes: ArrayBuffer): string => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
const base64url = (bytes: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export async function verifyDiscordSignature(publicKeyHex: string, signatureHex: string, timestamp: string, rawBody: Uint8Array): Promise<boolean> {
  const publicKey = fromHex(publicKeyHex);
  const signature = fromHex(signatureHex);
  if (publicKey?.length !== 32 || signature?.length !== 64) return false;
  try {
    const key = await crypto.subtle.importKey("raw", publicKey as BufferSource, { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify("Ed25519", key, signature as BufferSource, concat(ENCODER.encode(timestamp), rawBody) as BufferSource);
  } catch {
    return false;
  }
}

// Same canonical string and HMAC as src/lib/server/internal-auth.ts (signInternalRequest), via Web Crypto.
export async function signPublishRequest(
  key: string,
  parts: { method: string; pathname: string; timestamp: number; nonce: string; body: Uint8Array },
): Promise<string> {
  const bodyHash = toHex(await crypto.subtle.digest("SHA-256", parts.body as BufferSource));
  const canonical = ["v1", "publish", parts.method.toUpperCase(), parts.pathname, parts.timestamp, parts.nonce, bodyHash].join("\n");
  const hmac = await crypto.subtle.importKey("raw", ENCODER.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", hmac, ENCODER.encode(canonical)));
}

const reply = (data: Record<string, unknown>): Response => Response.json(data, { headers: { "Cache-Control": "no-store" } });
const ephemeral = (content: string) => reply({ type: 4, data: { content, flags: EPHEMERAL, allowed_mentions: { parse: [] } } });
const updateMessage = (content: string) => reply({ type: 7, data: { content, components: [], allowed_mentions: { parse: [] } } });

// `closes`: the control message loses its buttons (the revision is finished). Otherwise the reply is private to the clicker.
const MESSAGES: Record<DecisionResult, { text: string; closes: boolean }> = {
  rejected: { text: "Revisão recusada. Nada foi publicado nem enviado.", closes: true },
  already_rejected: { text: "Esta revisão já estava recusada. Nada foi publicado nem enviado.", closes: true },
  regeneration_requested: { text: "Nova versão solicitada; esta revisão fica encerrada. Nada foi publicado nem enviado.", closes: true },
  already_regenerating: { text: "A nova versão já foi solicitada. Nada foi publicado nem enviado.", closes: true },
  approval_unavailable: { text: "Aprovação indisponível nesta fase. Nada foi publicado nem enviado.", closes: false },
  not_found: { text: "Edição não encontrada.", closes: false },
  stale: { text: "Há uma revisão mais recente; estes botões não valem mais.", closes: true },
  mismatch: { text: "Estes botões não correspondem à mensagem de controle desta revisão.", closes: false },
  conflict: { text: "Esta edição já foi decidida de outra forma. Nada foi alterado.", closes: false },
  regeneration_limit: { text: "Limite diário de novas versões desta edição atingido. Nada foi alterado.", closes: false },
};

const UNCERTAIN = "Não foi possível confirmar a decisão agora. Nada indica que algo foi publicado ou enviado; confira o estado e tente novamente.";

interface InteractionPayload {
  type?: unknown;
  application_id?: unknown;
  guild_id?: unknown;
  channel_id?: unknown;
  message?: { id?: unknown; content?: unknown };
  data?: { custom_id?: unknown; component_type?: unknown };
}

async function callDecision(env: Env, fetcher: typeof fetch, body: Record<string, unknown>): Promise<{ result?: unknown } | undefined> {
  const encoded = ENCODER.encode(JSON.stringify(body));
  const timestamp = Date.now();
  const nonce = base64url(crypto.getRandomValues(new Uint8Array(18)));
  const signature = await signPublishRequest(env.INTERNAL_KEY_PUBLISH, { method: "POST", pathname: DECISION_PATH, timestamp, nonce, body: encoded });
  try {
    const response = await fetcher(new URL(DECISION_PATH, env.SITE_ORIGIN).toString(), {
      method: "POST",
      headers: { "content-type": "application/json", "x-rt-timestamp": String(timestamp), "x-rt-nonce": nonce, "x-rt-signature": signature },
      body: encoded as BodyInit,
      redirect: "error",
      signal: AbortSignal.timeout(DECISION_TIMEOUT_MS),
    });
    // Only a 2xx carries a decision; an error body must never be read as one.
    if (!response.ok) return undefined;
    const parsed: unknown = await response.json().catch(() => undefined);
    return { result: typeof parsed === "object" && parsed !== null ? (parsed as { result?: unknown }).result : undefined };
  } catch {
    return undefined;
  }
}

export async function handleInteraction(request: Request, env: Env, context?: ExecutionContextLike, fetcher: typeof fetch = fetch): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  const signature = request.headers.get("x-signature-ed25519") ?? "";
  const timestamp = request.headers.get("x-signature-timestamp") ?? "";
  if (!/^\d{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > TIMESTAMP_TOLERANCE_S) return new Response(null, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return new Response(null, { status: 413 });
  const raw = new Uint8Array(await request.arrayBuffer());
  if (raw.byteLength > MAX_BODY_BYTES) return new Response(null, { status: 413 });
  // Ed25519 over timestamp + the exact raw bytes, before anything is parsed.
  if (!(await verifyDiscordSignature(env.DISCORD_PUBLIC_KEY, signature, timestamp, raw))) return new Response(null, { status: 401 });

  let payload: InteractionPayload;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return new Response(null, { status: 400 });
    payload = parsed as InteractionPayload;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (payload.type === 1) return reply({ type: 1 });
  if (payload.type !== 3 || payload.data?.component_type !== 2) return ephemeral("Interação não suportada.");

  const customId = payload.data.custom_id;
  const custom = parseCustomId(customId);
  const { application_id: applicationId, guild_id: guildId, channel_id: channelId } = payload;
  const messageId = payload.message?.id;
  if (
    !custom ||
    typeof customId !== "string" ||
    customId.length >= MAX_CUSTOM_ID_LENGTH ||
    ![applicationId, guildId, channelId, messageId].every((id): id is string => typeof id === "string" && SNOWFLAKE.test(id)) ||
    applicationId !== env.DISCORD_APPLICATION_ID ||
    guildId !== env.DISCORD_GUILD_ID ||
    channelId !== env.DISCORD_NEWSLETTER_CHANNEL_ID
  ) {
    return ephemeral("Estes botões não são válidos neste canal.");
  }

  const outcome = await callDecision(env, fetcher, {
    action: custom.action,
    draftId: custom.draftId,
    revision: custom.revision,
    applicationId,
    guildId,
    channelId,
    messageId,
  });
  const result = typeof outcome?.result === "string" && Object.hasOwn(MESSAGES, outcome.result) ? (outcome.result as DecisionResult) : undefined;
  if (!result) return ephemeral(UNCERTAIN);
  if (result === "regeneration_requested" && env.ROUTINE_FIRE_URL && env.ROUTINE_FIRE_TOKEN && context) {
    // Best effort only: the request is already durable in storage; waitUntil is not a queue and may be dropped.
    context.waitUntil(fireRoutine(env, fetcher, custom.draftId, custom.revision));
  }
  const message = MESSAGES[result];
  // Replacing the control message must not drop the edition's identity: keep slug (when the original text is ours), ID and revision.
  const identity = `Edição ${slugOf(payload.message?.content, custom.draftId)}ID ${custom.draftId} · revisão ${custom.revision}`;
  return message.closes ? updateMessage(`${message.text}\n${identity}`) : ephemeral(message.text);
}

// The control message starts with "Revisão N da edição <slug> (ID <draftId>)."; read the slug back only if that exact shape and ID match.
function slugOf(content: unknown, draftId: string): string {
  const match = typeof content === "string" ? /^Revisão \d{1,6} da edição ([a-z0-9]+(?:-[a-z0-9]+)*) \(ID (ed_[0-9a-f-]{36})\)\./.exec(content) : null;
  return match && match[2] === draftId && match[1].length <= 80 ? `${match[1]} · ` : "";
}

async function fireRoutine(env: Env, fetcher: typeof fetch, draftId: string, revision: number): Promise<void> {
  try {
    await fetcher(env.ROUTINE_FIRE_URL as string, {
      method: "POST",
      headers: { authorization: `Bearer ${env.ROUTINE_FIRE_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ text: `Regenerar a edição ${draftId}: a revisão ${revision} foi devolvida pelo revisor.` }),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Nothing is logged: the error text could carry the URL or token. The reviewer can fire the Routine by hand with the draft ID.
  }
}

const worker = {
  fetch: (request: Request, env: Env, context: ExecutionContextLike): Promise<Response> => handleInteraction(request, env, context),
};

export default worker;
