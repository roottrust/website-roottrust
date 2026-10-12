import { handleJobsProcess } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Time plan (jobs until ~35 s, retention/cleanup until 52 s) lives in lib/server/http.ts; keep its deadlines below this.
export const maxDuration = 60;

export const POST = (request: Request) => handleJobsProcess(request);
