export type FormMode = "demo" | "unavailable";
export type DemoOutcome = "success" | "error";
export type ContactValues = { name: string; company: string; whatsapp: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export type FormRequest =
  | { kind: "contact"; values: ContactValues }
  | { kind: "newsletter"; email: string; editionSlug?: string }
  | { kind: "report"; email: string; toolId: string };
export type SubmissionResult = "accepted" | "error" | "unavailable";

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
