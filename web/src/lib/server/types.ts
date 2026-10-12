// Firestore schema. Every access is get-by-ID inside a transaction, so no composite indexes are required.
export const COLLECTIONS = {
  leads: "leads",
  leadEvents: "lead_events",
  subscriptions: "subscriptions",
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
