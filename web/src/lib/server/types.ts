// Firestore schema. Every access is get-by-ID inside a transaction, so no composite indexes are required.
export const COLLECTIONS = {
  leads: "leads",
  leadEvents: "lead_events",
  subscriptions: "subscriptions",
  rateLimits: "rate_limits",
  replays: "replays",
  jobs: "jobs",
} as const;
export type Collection = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export const TOOL_IDS = ["rosi", "shadow-ai", "divida-tecnica", "migracao-para-nuvem"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

// Never holds tool answers or results: only contact data and origin.
export interface LeadRecord {
  id: string;
  name?: string;
  company?: string;
  whatsapp?: string;
  email?: string;
  origins: string[];
  commercialConsent: boolean;
  commercialConsentAt?: string;
  firstSeenAt: string;
  lastInteractionAt: string;
  interactionCount: number;
}

export interface LeadEventRecord {
  id: string;
  leadId: string;
  origin: string;
  commercialConsent?: boolean;
  at: string;
}

export type SubscriptionStatus = "pending" | "confirmed" | "cancelled";
export interface SubscriptionRecord {
  id: string;
  email: string;
  status: SubscriptionStatus;
  requestedEditionSlug?: string;
  createdAt: string;
  updatedAt: string;
}

// Counter documents carry only an HMAC'd identity in the ID; `expiresAt` (ISO) lets the purge job find them.
export interface RateLimitRecord {
  id: string;
  count: number;
  windowStart: number;
  expiresAt: string;
}

// Single-use markers (Turnstile tokens, internal request nonces).
export interface ReplayRecord {
  id: string;
  expiresAt: string;
}

export type JobStatus = "pending" | "leased" | "done" | "dead";

// `payload` holds opaque references only (record IDs), never contact data. `dueAt` exists only while claimable
// (pending: next attempt; leased: lease expiry) so one single-field query finds every claimable job.
export interface JobRecord {
  id: string;
  kind: string;
  payload: Record<string, string>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  dueAt?: string;
  leaseToken?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}
