import { NextRequest, NextResponse } from "next/server";
import { createTV, type TVInput } from "@/lib/mutations";
import { safeImageUrl } from "@/lib/ids";
import { TV_PLATFORMS } from "@/lib/platforms";
import { sameOrigin } from "@/lib/guard";
import { toText, toScore } from "../movies/route";
import type { Season, SeasonHolding, OwnedEpisodes } from "@/lib/types";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Keep only known platforms; clamp specific episode picks to 1..episode_count.
function toHolding(h: Record<string, unknown>, episodeCount: number): SeasonHolding | null {
  const platform = String(h?.platform || "");
  if (!TV_PLATFORMS.includes(platform)) return null;
  let episodes: OwnedEpisodes = "all";
  if (Array.isArray(h.episodes)) {
    episodes = (h.episodes as unknown[]).map(Number).filter((n) => Number.isFinite(n) && n >= 1 && n <= episodeCount);
  }
  return { platform, episodes };
}

function toSeason(s: Record<string, unknown>): Season {
  const episode_count = Number(s.episode_count) || 0;
  const owned_on = Array.isArray(s.owned_on)
    ? (s.owned_on as Record<string, unknown>[])
        .map((h) => toHolding(h, episode_count))
        .filter((h): h is SeasonHolding => !!h)
    : [];
  return { season: Number(s.season), episode_count, owned: !!s.owned || owned_on.length > 0, owned_on };
}

export function toTVInput(b: Record<string, unknown>): TVInput {
  return {
    tmdb_id: toNum(b.tmdb_id),
    series: toText((b.series as string) || (b.title as string), 200) ?? "Untitled",
    year: toNum(b.year),
    poster_url: safeImageUrl(b.poster_url),
    director: toText(b.director, 300),
    user_score: toScore(b.user_score),
    overview: toText(b.overview),
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
