import { NextRequest, NextResponse } from "next/server";
import { createTV, type TVInput } from "@/lib/mutations";
import { safeImageUrl } from "@/lib/ids";
import { filterKnown, TV_PLATFORMS } from "@/lib/platforms";
import { sameOrigin } from "@/lib/guard";
import type { Season, SeasonEpisodes } from "@/lib/types";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function toSeason(s: Record<string, unknown>): Season {
  let episodes: SeasonEpisodes;
  if (Array.isArray(s.episodes)) episodes = (s.episodes as number[]).map(Number);
  else episodes = s.episodes === "all" ? "all" : "unowned";
  return {
    season: Number(s.season),
    episode_count: Number(s.episode_count) || 0,
    episodes,
    owned_on: filterKnown(s.owned_on, TV_PLATFORMS),
  };
}

export function toTVInput(b: Record<string, unknown>): TVInput {
  return {
    tmdb_id: toNum(b.tmdb_id),
    series: String(b.series || b.title || "").trim() || "Untitled",
    year: toNum(b.year),
    poster_url: safeImageUrl(b.poster_url),
    note: (b.note as string) || null,
    seasons: Array.isArray(b.seasons) ? (b.seasons as Record<string, unknown>[]).map(toSeason) : [],
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as Record<string, unknown>;
  const id = await createTV(toTVInput(body));
  return NextResponse.json({ id });
}
