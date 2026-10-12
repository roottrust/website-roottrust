import { handleReport } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (request: Request) => handleReport(request);
