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
    const detail = m.replace(/^Trakt \d+:?\s*/, "").slice(0, 200);
    return NextResponse.json(
      {
        error: code
          ? `Trakt HTTP ${code}${detail && detail !== m ? ` — ${detail}` : code === "403" ? " — invalid Client ID or blocked request." : "."}`
          : "Upstream metadata request failed.",
      },
      { status: 502 }
    );
  }
}
