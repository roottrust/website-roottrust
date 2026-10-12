export type FormMode = "demo" | "unavailable";
export type DemoOutcome = "success" | "error";
export type ContactValues = { name: string; company: string; whatsapp: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export type FormRequest =
  | { kind: "contact"; values: ContactValues }
  | { kind: "newsletter"; email: string; editionSlug?: string }
  | { kind: "report"; email: string; toolId: string; commercialConsent?: boolean };
export type SubmissionResult = "accepted" | "error" | "unavailable" | "invalid" | "rate_limited" | "challenge" | "forbidden";

// "pilot" is the only mode that talks to the backend; it exists for the contact form alone.
export type ContactMode = FormMode | "pilot";
export type ContactFormConfig = { mode: ContactMode; siteKey?: string };

export function resolveFormMode(value: string | undefined): FormMode {
  return value === "demo" ? "demo" : "unavailable";
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = "Informe seu nome.";
  if (!values.company.trim()) errors.company = "Informe a empresa.";
  const phone = values.whatsapp.trim();
  let digits = phone.replace(/\D/g, "");
  const hasCountry = digits.startsWith("55") && (digits.length === 12 || digits.length === 13);
  if (hasCountry) digits = digits.slice(2);
  const subscriber = digits.slice(2);
  const plausible = /^\+?[\d\s().-]+$/.test(phone)
    && (!phone.startsWith("+") || hasCountry)
    && /^[1-9]{2}(?:[1-9]\d{7}|9\d{8})$/.test(digits)
    && !/^(\d)\1+$/.test(subscriber);
  if (!plausible) {
    errors.whatsapp = "Informe um número com DDD.";
  }
  return errors;
}

export function validateEmail(value: string): string | undefined {
  const parts = value.trim().split("@");
  const local = parts[0] ?? "";
  const labels = (parts[1] ?? "").split(".");
  const valid = parts.length === 2
    && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
    && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
    && labels.length >= 2
    && labels.every((label) => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
  return valid ? undefined : "Informe um endereço de e-mail válido.";
}

// This adapter deliberately has no transport or persistent state.
export async function submitLocalForm(
  request: FormRequest,
  mode: FormMode,
  outcome: DemoOutcome,
  signal: AbortSignal,
): Promise<SubmissionResult> {
  if (signal.aborted) throw new DOMException("Submission cancelled", "AbortError");
  const invalid = request.kind === "contact"
    ? Object.keys(validateContact(request.values)).length > 0
    : Boolean(validateEmail(request.email));
  if (invalid) throw new Error("Invalid form request");
  if (request.kind === "report" && !request.toolId.trim()) throw new Error("Missing tool ID");
  if (mode !== "demo") return "unavailable";

  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Submission cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 350);
    signal.addEventListener("abort", abort, { once: true });
  });
  return outcome === "error" ? "error" : "accepted";
}

export type DiagnosticOutcome = { result: SubmissionResult; reference?: string; retryAfter?: number };

const DIAGNOSTIC_REFERENCE = /^DG-[0-9A-Z]{10}$/;

// Real transport for the pilot forms. A network failure is "error": the outcome is unknown, never success.
async function postPilot(
  url: string,
  payload: Record<string, unknown>,
  token: string,
  signal: AbortSignal,
  fetchFn: typeof fetch,
): Promise<DiagnosticOutcome> {
  if (signal.aborted) throw new DOMException("Submission cancelled", "AbortError");
  let response: Response;
  try {
    response = await fetchFn(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-turnstile-token": token },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) throw error;
    return { result: "error" };
  }
  const body: unknown = await response.json().catch(() => undefined);
  const field = (name: string): unknown => (typeof body === "object" && body !== null ? (body as Record<string, unknown>)[name] : undefined);
  if (response.status === 202) {
    const id = field("id");
    return { result: "accepted", ...(typeof id === "string" && DIAGNOSTIC_REFERENCE.test(id) ? { reference: id } : {}) };
  }
  if (response.status === 400) return { result: "invalid" };
  if (response.status === 403) return { result: field("code") === "challenge_failed" ? "challenge" : "forbidden" };
  if (response.status === 429) {
    const wait = field("retryAfter");
    return { result: "rate_limited", ...(typeof wait === "number" && Number.isFinite(wait) && wait > 0 ? { retryAfter: wait } : {}) };
  }
  return { result: response.status === 503 ? "unavailable" : "error" };
}

export const submitDiagnostic = (values: ContactValues, token: string, signal: AbortSignal, fetchFn: typeof fetch = fetch) =>
  postPilot("/api/diagnostico", { name: values.name, company: values.company, whatsapp: values.whatsapp }, token, signal, fetchFn);

// Only the e-mail, the tool ID and the optional commercial checkbox leave the browser: never answers or results.
export const submitReport = (email: string, toolId: string, commercialConsent: boolean, token: string, signal: AbortSignal, fetchFn: typeof fetch = fetch) =>
  postPilot("/api/relatorios", { email, toolId, commercialConsent }, token, signal, fetchFn);
