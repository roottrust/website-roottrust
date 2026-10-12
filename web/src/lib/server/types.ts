// Firestore schema. Every access is get-by-ID inside a transaction, so no composite indexes are required.
export const COLLECTIONS = {
  leads: "leads",
  leadEvents: "lead_events",
  diagnostics: "diagnostics",
  subscriptions: "subscriptions",
  rateLimits: "rate_limits",
  replays: "replays",
  jobs: "jobs",
  reportDeliveries: "report_deliveries",
  emailQuota: "email_quota",
  editionDrafts: "edition_drafts",
  editionRevisions: "edition_revisions",
  editionsPublic: "editions_public",
} as const;
export type Collection = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export const TOOL_IDS = ["rosi", "shadow-ai", "divida-tecnica", "migracao-para-nuvem"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

// Origins: "diagnostico" (service request, NOT marketing authorization) and "relatorio:<toolId>". Lead IDs are per
// identity (WhatsApp or e-mail), so a diagnostic lead and a report lead are distinct records.
// Never holds tool answers or results: only contact data and origin.
export interface LeadRecord {
  id: string;
  name?: string;
  company?: string;
  whatsapp?: string;
  email?: string;
  origins: string[];
  commercialConsent: boolean;
  // Only an explicit report-form checkbox sets this; a request without it (or any diagnostic) never does, and never revokes.
  commercialConsentAt?: string;
  commercialConsentOrigin?: string;
  commercialConsentWithdrawnAt?: string;
  firstSeenAt: string;
  lastInteractionAt: string;
  interactionCount: number;
}

export interface LeadEventRecord {
  id: string;
  leadId: string;
  origin: string;
  requestId?: string;
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

export const JOB_KINDS = { diagnosticDiscord: "diagnostic.discord", reportEmail: "report.email" } as const;

// One record per diagnostic request, keyed by its team-visible ID, so repeated requests from the same WhatsApp keep
// their own Name/Company. `notifiedAt` is set once the private Discord message is confirmed.
export interface DiagnosticRecord {
  id: string;
  leadId: string;
  name: string;
  company: string;
  whatsapp: string;
  createdAt: string;
  notifiedAt?: string;
}

// One record per report request. Holds contact data only until the e-mail is confirmed sent (then `email` is dropped);
// never tool answers or results. `attemptStartedAt` marks a Resend call whose outcome may be unknown: the provider keeps
// its idempotency key for 24 h only, so past that window a resend would risk a duplicate and `reconcile` blocks it.
export interface ReportDeliveryRecord {
  id: string;
  leadId: string;
  email?: string;
  toolId: ToolId;
  createdAt: string;
  attemptStartedAt?: string;
  reservation?: { day: string; month: string };
  sentAt?: string;
  resendId?: string;
  reconcile?: boolean;
}

// Local counter of Resend sends: id `qt_day_YYYY-MM-DD` / `qt_month_YYYY-MM` (UTC). `expiresAt` lets the purge job sweep it.
export interface EmailQuotaRecord {
  id: string;
  used: number;
  expiresAt: string;
}

// Newsletter editions. `edition_revisions` is private (full body) and immutable: a revision is written once, never
// updated, so approval can bind to the exact text a reviewer saw. `edition_drafts` is the mutable head (current revision +
// workflow status). `editions_public` is the only collection the site reads, written solely by projectPublicEdition.
export interface EditionOpeningSegment {
  t: string;
  href?: string;
}
export interface EditionSource {
  titulo: string;
  href: string;
}

export interface EditionRevisionRecord {
  id: string; // `${draftId}.${revision}`
  draftId: string;
  revision: number;
  slug: string;
  data: string;
  pilar: string;
  titulo: string;
  corpo: string; // PRIVATE: full editorial body, never projected
  abertura: EditionOpeningSegment[]; // derived from `corpo` (first substantive paragraph, N08)
  fontes: EditionSource[];
  createdAt: string;
}

export type EditionDraftStatus = "pending" | "approved" | "rejected";
export interface EditionDraftRecord {
  id: string;
  slug: string;
  currentRevision: number;
  status: EditionDraftStatus;
  approvedRevision?: number;
  createdAt: string;
  updatedAt: string;
}

// Doc ID is the slug. `draftId`/`revision` are for audit and never reach the page.
export interface EditionPublicRecord {
  slug: string;
  data: string;
  pilar: string;
  titulo: string;
  abertura: EditionOpeningSegment[];
  fontes: EditionSource[];
  draftId: string;
  revision: number;
  publishedAt: string;
}
