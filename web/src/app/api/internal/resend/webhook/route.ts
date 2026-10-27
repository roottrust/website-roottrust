import { defaultDeps } from "@/lib/server/http";
import { hasIdSecret } from "@/lib/server/defense";
import { handleResendWebhook } from "@/lib/server/resend-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const deps = defaultDeps();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (deps.mode !== "pilot" || !deps.newsletterEmail || !hasIdSecret(deps.idSecret) || !webhookSecret) return new Response(null, { status: 503 });
  return handleResendWebhook(request, {
    apiKey: deps.newsletterEmail.apiKey,
    webhookSecret,
    idSecret: deps.idSecret,
    newsletterFrom: deps.newsletterEmail.from,
    allowlist: deps.newsletterEmail.allowlist,
    store: await deps.getStore(),
    now: deps.now,
  });
}
