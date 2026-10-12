import { resolveContactAvailability } from "@/lib/server/diagnostic";

// Server Components import this instead of lib/server directly; only { mode, siteKey } reaches client components.
export const contactAvailability = () => resolveContactAvailability(process.env);
