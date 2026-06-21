import { NextRequest, NextResponse } from "next/server";
import { createMovie, type MovieInput } from "@/lib/mutations";
import { safeImageUrl } from "@/lib/ids";
import { filterKnown, MOVIE_DIGITAL, MOVIE_PHYSICAL } from "@/lib/platforms";
import { sameOrigin } from "@/lib/guard";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Bounded text from untrusted bodies: trim, cap length, empty -> null.
export const toText = (v: unknown, max = 4000): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
};

// TMDB vote_average lives in 0–10; clamp and drop anything else.
export const toScore = (v: unknown): number | null => {
  const n = toNum(v);
  if (n === null) return null;
  return Math.min(10, Math.max(0, n));
};

export function toMovieInput(b: Record<string, unknown>): MovieInput {
  return {
    tmdb_id: toNum(b.tmdb_id),
    title: toText(b.title, 200) ?? "Untitled",
    year: toNum(b.year),
    poster_url: safeImageUrl(b.poster_url),
    director: toText(b.director, 300),
    user_score: toScore(b.user_score),
    overview: toText(b.overview),
    digital: filterKnown(b.digital, MOVIE_DIGITAL),
    physical: filterKnown(b.physical, MOVIE_PHYSICAL),
    needs_review: !!b.needs_review,
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as Record<string, unknown>;
  const id = await createMovie(toMovieInput(body));
  return NextResponse.json({ id });
}
