export type BackendMode = "off" | "demo" | "pilot" | "public";

// Anything other than the exact strings "demo", "pilot" or "public" is "off".
export function resolveBackendMode(value: string | undefined): BackendMode {
  return value === "demo" || value === "pilot" || value === "public" ? value : "off";
}

// Modes that talk to real providers and therefore run every defense block.
export function isOperationalMode(mode: BackendMode): mode is "pilot" | "public" {
  return mode === "pilot" || mode === "public";
}
