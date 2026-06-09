/* Trove — defense-in-depth same-origin guard for mutating route handlers.
   Cloudflare Access already gates the whole app and we use no app-managed
   cookies, so cross-site request forgery isn't a live risk; this simply rejects
   browser writes whose Origin host doesn't match the request host. Requests
   without an Origin header (non-browser clients, same-origin navigations) pass. */
import "server-only";
import type { NextRequest } from "next/server";

export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}
