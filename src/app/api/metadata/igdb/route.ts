import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/db";
import { searchIgdbGames } from "@/lib/igdb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "No search query." }, { status: 400 });
  const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = await getEnv();
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    return NextResponse.json({ error: "IGDB (Twitch) credentials are not set on the server." }, { status: 500 });
  }
  try {
    return NextResponse.json({ results: await searchIgdbGames(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, q) });
  } catch (e) {
    const code = ((e as Error).message || "").match(/(Twitch|IGDB) (\d+)/);
    return NextResponse.json(
      { error: code ? `${code[1]} request failed (HTTP ${code[2]}).` : "Upstream metadata request failed." },
      { status: 502 }
    );
  }
}
