import { NextRequest, NextResponse } from "next/server";
import { createTV, type TVInput } from "@/lib/mutations";
import { safeImageUrl } from "@/lib/ids";
import { sameOrigin } from "@/lib/guard";
import { jsonError, readJsonBody } from "@/lib/http";
import { dedupeSeasons, normalizeSeasonInput } from "@/lib/tv";
import { toText, toScore } from "../movies/route";
import type { Season } from "@/lib/types";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Rejects the whole request (returns null) rather than silently dropping a
// malformed season, so bad season data surfaces as a 400 instead of a season
// quietly vanishing from the stored record.
export function toTVInput(b: Record<string, unknown>): TVInput | null {
  const rawSeasons = Array.isArray(b.seasons) ? (b.seasons as Record<string, unknown>[]) : [];
  const seasons = rawSeasons.map(normalizeSeasonInput);
  if (seasons.some((s) => s === null)) return null;
  return {
    tmdb_id: toNum(b.tmdb_id),
    series: toText((b.series as string) || (b.title as string), 200) ?? "Untitled",
    year: toNum(b.year),
    poster_url: safeImageUrl(b.poster_url),
    director: toText(b.director, 300),
    user_score: toScore(b.user_score),
    overview: toText(b.overview),
    note: toText(b.note),
    seasons: dedupeSeasons(seasons as Season[]),
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await readJsonBody(req);
  if (body === null) return jsonError(400, "Invalid JSON body");
  const input = toTVInput(body);
  if (input === null) return jsonError(400, "Invalid season data");
  const id = await createTV(input);
  return NextResponse.json({ id });
}
