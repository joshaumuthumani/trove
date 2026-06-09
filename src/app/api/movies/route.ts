import { NextRequest, NextResponse } from "next/server";
import { createMovie, type MovieInput } from "@/lib/mutations";

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
    poster_url: (b.poster_url as string) || null,
    digital: Array.isArray(b.digital) ? (b.digital as string[]) : [],
    physical: Array.isArray(b.physical) ? (b.physical as string[]) : [],
    needs_review: !!b.needs_review,
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = await createMovie(toMovieInput(body));
  return NextResponse.json({ id });
}
