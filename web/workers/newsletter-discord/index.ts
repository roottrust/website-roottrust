import { DECISION_PATH, MAX_CUSTOM_ID_LENGTH, SNOWFLAKE, parseCustomId, type DecisionResult } from "../../src/lib/server/newsletter-protocol";

// Cloudflare Worker for Discord button interactions on the private newsletter review channel. It holds the Discord public
// key and the `publish` HMAC key; it never holds the Routine's `draft` key, the bot token or any storage credential. It
// forwards each decision with the original Discord interaction (`proof`), so the server re-verifies the Ed25519 signature
// itself and the HMAC key alone cannot approve anything. Approving only records the decision; publishing and sending are
// durable server jobs.
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
const DECISION_TIMEOUT_MS = 20_000; // ACK is immediate; leave time for the Discord update inside waitUntil's 30 s.
const REPLY_TIMEOUT_MS = 4000; // Decision (20 s) + Routine (5 s) + reply (4 s) leave 1 s inside waitUntil's 30 s.
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

// `closes`: the control message loses its buttons (the revision is finished). Otherwise the reply is private to the clicker.
const MESSAGES: Record<DecisionResult, { text: string; closes: boolean }> = {
  rejected: { text: "Revisão recusada. Nada foi publicado nem enviado.", closes: true },
  already_rejected: { text: "Esta revisão já estava recusada. Nada foi publicado nem enviado.", closes: true },
  regeneration_requested: { text: "Nova versão solicitada; esta revisão fica encerrada. Nada foi publicado nem enviado.", closes: true },
  already_regenerating: { text: "A nova versão já foi solicitada. Nada foi publicado nem enviado.", closes: true },
  approved: { text: "Edição aprovada. A prévia pública será publicada. O envio ao segmento piloto só ocorre se a configuração do piloto estiver ativa e a entrega rodar em até 24 h desta aprovação; depois disso, só a prévia pública permanece. Confirme a entrega no provedor.", closes: true },
  already_approved: { text: "Esta revisão já estava aprovada. Nada foi alterado.", closes: true },
  slug_unavailable: { text: "O endereço (slug) desta edição não está disponível. Nada foi publicado nem enviado.", closes: false },
  not_found: { text: "Edição não encontrada.", closes: false },
  stale: { text: "Há uma revisão mais recente; estes botões não valem mais.", closes: true },
  mismatch: { text: "Estes botões não correspondem à mensagem de controle desta revisão.", closes: false },
  conflict: { text: "Esta edição já foi decidida de outra forma. Nada foi alterado.", closes: false },
  regeneration_limit: { text: "Limite diário de novas versões desta edição atingido. Nada foi alterado.", closes: false },
};

const UNCERTAIN = "Não foi possível confirmar a decisão agora. Ela pode ter sido registrada: confira o estado da edição antes de tentar de novo.";

interface InteractionPayload {
  type?: unknown;
  token?: unknown;
  application_id?: unknown;
  guild_id?: unknown;
  channel_id?: unknown;
  message?: { id?: unknown; content?: unknown };
  data?: { custom_id?: unknown; component_type?: unknown };
}

async function callDecision(env: Env, fetcher: typeof fetch, body: Record<string, unknown>): Promise<{ result?: unknown } | undefined> {
  try {
    const encoded = ENCODER.encode(JSON.stringify(body));
    const timestamp = Date.now();
    const nonce = base64url(crypto.getRandomValues(new Uint8Array(18)));
    const signature = await signPublishRequest(env.INTERNAL_KEY_PUBLISH, { method: "POST", pathname: DECISION_PATH, timestamp, nonce, body: encoded });
    const response = await fetcher(new URL(DECISION_PATH, env.SITE_ORIGIN).toString(), {
      method: "POST",
      headers: { "content-type": "application/json", "x-rt-timestamp": String(timestamp), "x-rt-nonce": nonce, "x-rt-signature": signature },
      body: encoded as BodyInit,
      redirect: "manual", // Workers has no "error" mode; the non-2xx guard rejects redirects without forwarding credentials.
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
  let bodyText: string;
  try {
    bodyText = new TextDecoder("utf-8", { fatal: true }).decode(raw);
    const parsed: unknown = JSON.parse(bodyText);
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

  if (typeof context?.waitUntil !== "function") return new Response(null, { status: 503 });
  const token = payload.token;
  if (typeof token !== "string" || !token.length || token.length > 2048) return new Response(null, { status: 400 });

  context.waitUntil((async () => {
    const outcome = await callDecision(env, fetcher, {
      action: custom.action,
      draftId: custom.draftId,
      revision: custom.revision,
      applicationId,
      guildId,
      channelId,
      messageId,
      proof: { timestamp, signature, body: bodyText },
    });
    const result = typeof outcome?.result === "string" && Object.hasOwn(MESSAGES, outcome.result) ? (outcome.result as DecisionResult) : undefined;
    const message = result ? MESSAGES[result] : { text: UNCERTAIN, closes: false };
    const slug = slugOf(payload.message?.content, custom.draftId);
    const routineFeedback = result === "regeneration_requested"
      ? (await fireRoutine(env, fetcher, custom.draftId, custom.revision, slug)
        ? " Routine iniciada; execução e revisão pendentes."
        : " Disparo da Routine não confirmado. Confira o slug, a configuração e as sessões da Routine antes de acioná-la manualmente; não repita a decisão.")
      : "";
    const identity = `Edição ${slug ? `${slug} · ` : ""}ID ${custom.draftId} · revisão ${custom.revision}`;
    const webhook = `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${encodeURIComponent(token)}`;
    try {
      const response = await fetcher(message.closes ? `${webhook}/messages/@original` : webhook, {
        method: message.closes ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: `${message.text}${routineFeedback}\n${identity}`,
          allowed_mentions: { parse: [] },
          ...(message.closes ? { components: [] } : { flags: EPHEMERAL }),
        }),
        redirect: "manual",
        signal: AbortSignal.timeout(REPLY_TIMEOUT_MS),
      });
      await response.body?.cancel();
      if (!response.ok) console.warn("newsletter_discord_reply_failed", { status: response.status });
    } catch {
      // URLs contain the interaction token. Never log exceptions or retry the decision after a reply failure.
      console.warn("newsletter_discord_reply_failed");
    }
  })().catch(() => console.warn("newsletter_decision_background_failed")));
  return reply({ type: 6 });
}

// The control message starts with "Revisão N da edição <slug> (ID <draftId>)."; read the slug back only if that exact shape and ID match.
function slugOf(content: unknown, draftId: string): string | undefined {
  const match = typeof content === "string" ? /^Revisão \d{1,6} da edição ([a-z0-9]+(?:-[a-z0-9]+)*) \(ID (ed_[0-9a-f-]{36})\)\./.exec(content) : null;
  return match && match[2] === draftId && match[1].length <= 80 ? match[1] : undefined;
}

async function fireRoutine(env: Env, fetcher: typeof fetch, draftId: string, revision: number, slug: string | undefined): Promise<boolean> {
  if (!slug || !env.ROUTINE_FIRE_TOKEN?.trim() || !/^https:\/\/api\.anthropic\.com\/v1\/claude_code\/routines\/[A-Za-z0-9_-]+\/fire$/.test(env.ROUTINE_FIRE_URL ?? "")) {
    console.warn("newsletter_routine_not_configured");
    return false;
  }
  try {
    const signal = AbortSignal.timeout(5000);
    const response = await fetcher(env.ROUTINE_FIRE_URL as string, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.ROUTINE_FIRE_TOKEN}`,
        "anthropic-beta": "experimental-cc-routine-2026-04-01",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: `Regenerar a edição ${slug} (ID ${draftId}): a revisão ${revision} foi devolvida pelo revisor. Manter o mesmo ID e slug.` }),
      redirect: "manual",
      signal,
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => console.warn("newsletter_routine_cancel_failed"));
      console.warn("newsletter_routine_fire_failed", { status: response.status });
      return false;
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("missing_body");
    const abort = () => { void reader.cancel().catch(() => console.warn("newsletter_routine_cancel_failed")); };
    signal.addEventListener("abort", abort, { once: true });
    let bytes: Uint8Array = new Uint8Array();
    try {
      while (true) {
        signal.throwIfAborted();
        const { done, value } = await reader.read();
        signal.throwIfAborted();
        if (done) break;
        if (bytes.byteLength + value.byteLength > 8192) throw new Error("response_too_large");
        bytes = concat(bytes, value);
      }
    } finally {
      signal.removeEventListener("abort", abort);
      void reader.cancel().catch(() => console.warn("newsletter_routine_cancel_failed"));
      reader.releaseLock();
    }
    const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("invalid_response");
    const result = parsed as Record<string, unknown>;
    if (result.type !== "routine_fire" || typeof result.claude_code_session_id !== "string"
      || !result.claude_code_session_id || result.claude_code_session_id.trim() !== result.claude_code_session_id
      || /\p{Cc}/u.test(result.claude_code_session_id) || typeof result.claude_code_session_url !== "string") throw new Error("invalid_response");
    // Session IDs are opaque; the documented example does not constrain their prefix or the link's path.
    const sessionUrl = new URL(result.claude_code_session_url);
    if (sessionUrl.protocol !== "https:" || sessionUrl.hostname !== "claude.ai" || sessionUrl.username || sessionUrl.password || sessionUrl.port) throw new Error("invalid_response");
    return true;
  } catch {
    console.warn("newsletter_routine_fire_failed");
    return false;
  }
}

const worker = {
  fetch: (request: Request, env: Env, context: ExecutionContextLike): Promise<Response> => handleInteraction(request, env, context),
};

export default worker;
