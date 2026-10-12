export type BackendMode = "off" | "demo" | "pilot";

// Anything other than the exact strings "demo" or "pilot" is "off".
export function resolveBackendMode(value: string | undefined): BackendMode {
  return value === "demo" || value === "pilot" ? value : "off";
}
