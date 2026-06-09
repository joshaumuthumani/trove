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

export function toMovieInput(b: Record<string, unknown>): MovieInput {
  return {
    tmdb_id: toNum(b.tmdb_id),
    title: String(b.title || "").trim() || "Untitled",
    year: toNum(b.year),
    poster_url: safeImageUrl(b.poster_url),
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
