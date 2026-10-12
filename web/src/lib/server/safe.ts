// Logs and error responses carry fixed event names and short codes only: never messages, contact data or tokens.
export function safeErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return "unknown";
  const name = /^[A-Za-z0-9_]{1,40}$/.test(error.name) ? error.name : "Error";
  const code = (error as { code?: unknown }).code;
  const suffix = typeof code === "number" || (typeof code === "string" && /^[A-Za-z0-9_.-]{1,40}$/.test(code)) ? `:${code}` : "";
  return `${name}${suffix}`;
}

export function logEvent(level: "warn" | "error", event: string, fields: Record<string, string | number | boolean> = {}): void {
  console[level](JSON.stringify({ event, ...fields }));
}
