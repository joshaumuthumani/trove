import { NextRequest, NextResponse } from "next/server";
import { extractTrailingId } from "@/lib/ids";
import { fetchTmdbMovie, fetchTmdbTV } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("id") || "";
  const type = req.nextUrl.searchParams.get("type") === "tv" ? "tv" : "movie";
  const id = extractTrailingId(raw);
  if (!id) return NextResponse.json({ error: "No id found in input." }, { status: 400 });
  try {
    const meta = type === "tv" ? await fetchTmdbTV(id) : await fetchTmdbMovie(id);
    return NextResponse.json({ id, ...meta });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
