import { handleNewsletterCancellation } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (request: Request) => handleNewsletterCancellation(request);
