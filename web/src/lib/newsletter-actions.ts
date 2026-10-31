import { normalizeRetryAfter, retryAfterLabel } from "./forms";

export type NewsletterActionKind = "confirm" | "cancel";

export type NewsletterActionResult =
  | { result: "done"; editionQueued: boolean; editionUnavailable: boolean }
  | { result: "rate_limited"; retryAfter?: number }
  | { result: "invalid" | "stale" | "forbidden" | "unavailable" | "uncertain" };

export type NewsletterActionFeedback = {
  tone: "progress" | "success" | "problem";
  title: string;
  message: string;
  action?: "renew" | "contact";
};

const ENDPOINT: Record<NewsletterActionKind, string> = { confirm: "/api/newsletter/confirmar", cancel: "/api/newsletter/cancelar" };
const SUCCESS_STATUS: Record<NewsletterActionKind, string> = { confirm: "confirmed", cancel: "cancelled" };
const CONTACT = "contato@roottrust.com.br";

const abortError = () => new DOMException("Newsletter action cancelled", "AbortError");

// Only the token is sent. Only invalid/stale/done results consume it: availability, limit, network and 5xx
// outcomes keep it so an explicit retry can reuse the same (idempotent) link.
export async function performNewsletterAction(
  kind: NewsletterActionKind,
  token: string,
  signal: AbortSignal,
  fetchFn: typeof fetch = fetch,
): Promise<NewsletterActionResult> {
  if (signal.aborted) throw abortError();
  let response: Response;
  try {
    response = await fetchFn(ENDPOINT[kind], {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) throw error;
    return { result: "uncertain" };
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (signal.aborted) throw abortError();
  const field = (name: string): unknown => (typeof body === "object" && body !== null ? (body as Record<string, unknown>)[name] : undefined);
  const { status } = response;
  if (status === 200) {
    if (field("status") !== SUCCESS_STATUS[kind]) return { result: "uncertain" };
    return { result: "done", editionQueued: field("editionQueued") === true, editionUnavailable: field("selectedEditionUnavailable") === true };
  }
  if (status === 400) return { result: "invalid" };
  if (status === 403) return { result: "forbidden" };
  if (status === 409 || status === 410) return { result: "stale" };
  if (status === 429) {
    const wait = normalizeRetryAfter(field("retryAfter"));
    return { result: "rate_limited", ...(wait !== undefined ? { retryAfter: wait } : {}) };
  }
  return { result: status === 503 ? "unavailable" : "uncertain" };
}

// Results that leave the in-memory token usable for an explicit retry.
export const canRetryNewsletterAction = (result: NewsletterActionResult["result"]): boolean =>
  result === "unavailable" || result === "rate_limited" || result === "uncertain";

// Returns null for a fragment without a token key, so unrelated anchors (e.g. #conteudo) never reset the page.
export function tokenFromFragment(hash: string): string | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return params.has("token") ? params.get("token") ?? "" : null;
}

function confirmDone(done: Extract<NewsletterActionResult, { result: "done" }>): string {
  if (done.editionUnavailable) return "Endereço confirmado. A edição escolhida não está disponível para envio; você receberá apenas as próximas edições publicadas, sem garantia de chegada à caixa de entrada.";
  if (done.editionQueued) return "Endereço confirmado. O envio da edição foi colocado na fila; a entrega depende do provedor de e-mail e não é garantida. Os próximos envios seguem as edições publicadas.";
  return "Endereço confirmado. Você receberá as próximas edições publicadas, sem garantia de chegada à caixa de entrada.";
}

function waitMessage(retryAfter: number | undefined): string {
  return retryAfter === undefined
    ? "Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo; o link foi mantido nesta página."
    : `Muitas tentativas em pouco tempo. Tente de novo em ${retryAfterLabel(retryAfter)}; o link foi mantido nesta página.`;
}

export function newsletterActionFeedback(kind: NewsletterActionKind, state: "sending" | NewsletterActionResult): NewsletterActionFeedback {
  const confirm = kind === "confirm";
  if (state === "sending") return { tone: "progress", title: "Em andamento", message: confirm ? "Confirmando seu endereço…" : "Cancelando os próximos envios…" };
  switch (state.result) {
    case "done":
      return confirm
        ? { tone: "success", title: "Endereço confirmado", message: confirmDone(state) }
        : { tone: "success", title: "Envios cancelados", message: "Os próximos envios da newsletter foram cancelados. Isso não altera uma autorização separada para contato comercial ou relatórios." };
    case "invalid":
      return confirm
        ? { tone: "problem", title: "Link inválido", message: "Este link de confirmação não é válido ou está incompleto. Abra de novo o link do e-mail ou solicite um novo na página da newsletter.", action: "renew" }
        : { tone: "problem", title: "Link inválido", message: `Este link de cancelamento não é válido ou está incompleto. Abra de novo o link do e-mail da newsletter ou escreva para ${CONTACT}.`, action: "contact" };
    case "stale":
      return confirm
        ? { tone: "problem", title: "Link não pode ser usado", message: "Este link não pode mais ser usado. Solicite outro na página da newsletter.", action: "renew" }
        : { tone: "problem", title: "Link não pode ser usado", message: `Este link de cancelamento não pode mais ser usado. Use o link de um e-mail recente da newsletter ou escreva para ${CONTACT}.`, action: "contact" };
    case "forbidden":
      return { tone: "problem", title: "Ação não autorizada", message: `Esta página não está autorizada a concluir ${confirm ? "a confirmação" : "o cancelamento"}. Abra de novo o link do e-mail; se continuar, escreva para ${CONTACT}.`, action: "contact" };
    case "rate_limited":
      return { tone: "problem", title: "Aguarde um pouco", message: waitMessage(state.retryAfter) };
    case "unavailable":
      return { tone: "problem", title: "Serviço indisponível", message: `${confirm ? "A confirmação" : "O cancelamento"} está indisponível no momento. O link foi mantido nesta página; tente de novo em instantes. Se fechar ou recarregar a página, abra o link do e-mail outra vez.` };
    default:
      return { tone: "problem", title: "Resultado não confirmado", message: `Não foi possível confirmar se ${confirm ? "a confirmação" : "o cancelamento"} foi concluíd${confirm ? "a" : "o"}. Você pode tentar de novo com o mesmo link ou escrever para ${CONTACT}.` };
  }
}
