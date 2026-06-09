import { NextRequest, NextResponse } from "next/server";
import { extractMediaId } from "@/lib/ids";
import { fetchTmdbMovie, fetchTmdbTV } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("id") || "";
  const type = req.nextUrl.searchParams.get("type") === "tv" ? "tv" : "movie";
  const id = extractMediaId(raw);
  if (!id) return NextResponse.json({ error: "No id found in input." }, { status: 400 });
  try {
    const meta = type === "tv" ? await fetchTmdbTV(id) : await fetchTmdbMovie(id);
    return NextResponse.json({ id, ...meta });
  } catch {
    // Don't leak internals (missing key, upstream status) to the client.
    return NextResponse.json({ error: "Upstream metadata request failed." }, { status: 502 });
  }
}
