export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY (Hostinger migration): shows which client-IP headers reach the app, to choose TRUSTED_IP_HEADER.
// 404 unless DEBUG_IP_HEADERS is exactly "true". Values are echoed only for IP/forwarding headers of the caller's own
// request; every other header is listed by name only. Remove this route once the header is confirmed.
const IP_HEADER = /forward|real-ip|client-ip|connecting-ip|true-client|cluster-client|remote|via/;

export function GET(request: Request): Response {
  if (process.env.DEBUG_IP_HEADERS !== "true") return new Response(null, { status: 404 });
  const ipHeaders: Record<string, string> = {};
  const otherHeaderNames: string[] = [];
  for (const [name, value] of request.headers) {
    if (IP_HEADER.test(name)) ipHeaders[name] = value;
    else otherHeaderNames.push(name);
  }
  return Response.json(
    { ipHeaders, otherHeaderNames: otherHeaderNames.sort() },
    { headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } },
  );
}
