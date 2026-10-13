import { handleNewsletterDecision } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = (request: Request) => handleNewsletterDecision(request);
