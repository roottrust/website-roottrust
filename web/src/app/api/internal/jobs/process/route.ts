import { handleJobsProcess } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Claims stop at 50 s (JOBS_BUDGET_MS) minus one handler timeout (20 s), leaving margin for the last completion write.
export const maxDuration = 60;

export const POST = (request: Request) => handleJobsProcess(request);
