import { resolveReportAvailability } from "@/lib/server/report";

// Server Components import this instead of lib/server directly; only { mode, siteKey } reaches client components.
export const reportAvailability = () => resolveReportAvailability(process.env);
