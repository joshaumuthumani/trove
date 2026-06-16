import { NextRequest, NextResponse } from "next/server";
import { extractTraktRef } from "@/lib/ids";
import { fetchTraktSeasons } from "@/lib/trakt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = extractTraktRef(req.nextUrl.searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "No Trakt id or slug found in input." }, { status: 400 });
  try {
    return NextResponse.json({ results: await fetchTraktSeasons(id) });
  } catch (e) {
    // This route sits behind Cloudflare Access (single admin), so a setup-level
    // hint here isn't a disclosure risk — and it's the difference between "key
    // missing" and "key rejected". The key value is never included.
    const m = (e as Error).message || "";
    if (m.includes("not configured")) {
      return NextResponse.json({ error: "TRAKT_API_KEY is not set on the server (add it as an encrypted Secret)." }, { status: 500 });
    }
    const code = m.match(/Trakt (\d+)/)?.[1];
    return NextResponse.json(
      {
        error: code
          ? `Trakt rejected the request (HTTP ${code})${code === "401" || code === "403" ? " — check the Client ID." : code === "404" ? " — show not found for that slug." : "."}`
          : "Upstream metadata request failed.",
      },
      { status: 502 }
    );
  }
}
