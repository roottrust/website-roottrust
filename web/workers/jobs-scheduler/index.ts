export interface Env {
  SITE_ORIGIN: string;
  INTERNAL_KEY_JOBS: string;
  JOBS_ENABLED: string;
}

export const JOBS_PATH = "/api/internal/jobs/process";
const ENCODER = new TextEncoder();

export async function runJobs(env: Env): Promise<void> {
  if (env.JOBS_ENABLED !== "true") return;
  const origin = new URL(env.SITE_ORIGIN);
  if (origin.protocol !== "https:" || origin.origin !== env.SITE_ORIGIN || !env.INTERNAL_KEY_JOBS || env.INTERNAL_KEY_JOBS.trim() !== env.INTERNAL_KEY_JOBS || env.INTERNAL_KEY_JOBS.length < 32 || env.INTERNAL_KEY_JOBS.includes(",")) {
    throw new Error("jobs_scheduler_misconfigured");
  }
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  const bodyHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array())), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const canonical = ["v1", "jobs", "POST", JOBS_PATH, timestamp, nonce, bodyHash].join("\n");
  const key = await crypto.subtle.importKey("raw", ENCODER.encode(env.INTERNAL_KEY_JOBS), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, ENCODER.encode(canonical));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  let response: Response;
  try {
    response = await fetch(new URL(JOBS_PATH, origin), {
      method: "POST",
      redirect: "manual", // Never forward signed headers to a redirected destination.
      signal: AbortSignal.timeout(65_000),
      headers: { "x-rt-timestamp": String(timestamp), "x-rt-nonce": nonce, "x-rt-signature": signature },
    });
    await response.body?.cancel();
  } catch {
    throw new Error("jobs_scheduler_request_failed");
  }
  if (response.status !== 200) throw new Error(`jobs_scheduler_http_${response.status}`);
}

const worker = {
  scheduled(_controller: unknown, env: Env): Promise<void> {
    return runJobs(env);
  },
};

export default worker;
