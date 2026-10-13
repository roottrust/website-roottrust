// Pure contract shared by the API and the Discord Worker (which bundles this file): no Node or browser imports.
export const DECISION_ACTIONS = ["approve", "reject", "regenerate"] as const;
export type DecisionAction = (typeof DECISION_ACTIONS)[number];

export const DRAFT_PATH = "/api/internal/newsletter/draft";
export const DECISION_PATH = "/api/internal/newsletter/decision";
export const MAX_CUSTOM_ID_LENGTH = 100;
export const SNOWFLAKE = /^\d{17,20}$/;
export const DRAFT_ID = /^ed_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const CODES: Record<DecisionAction, string> = { approve: "a", reject: "r", regenerate: "g" };
const CUSTOM_ID = /^nl:([arg]):(ed_[0-9a-f-]{36})\.([1-9]\d{0,5})$/;

export function buildCustomId(action: DecisionAction, draftId: string, revision: number): string {
  const id = `nl:${CODES[action]}:${draftId}.${revision}`;
  if (id.length > MAX_CUSTOM_ID_LENGTH) throw new Error("custom_id_too_long");
  return id;
}

export function parseCustomId(value: unknown): { action: DecisionAction; draftId: string; revision: number } | undefined {
  const match = typeof value === "string" && value.length <= MAX_CUSTOM_ID_LENGTH ? CUSTOM_ID.exec(value) : null;
  if (!match || !DRAFT_ID.test(match[2])) return undefined;
  const action = DECISION_ACTIONS.find((candidate) => CODES[candidate] === match[1]);
  return action ? { action, draftId: match[2], revision: Number(match[3]) } : undefined;
}

// Business outcomes of POST DECISION_PATH. The Worker maps each one to a message; anything else is an error code.
export const DECISION_RESULTS = [
  "rejected",
  "already_rejected",
  "regeneration_requested",
  "already_regenerating",
  "approval_unavailable",
  "not_found",
  "stale",
  "mismatch",
  "conflict",
  "regeneration_limit",
] as const;
export type DecisionResult = (typeof DECISION_RESULTS)[number];

export const MAX_REGENERATIONS_PER_DAY = 3;
