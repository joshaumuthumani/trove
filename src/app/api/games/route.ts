import { NextRequest, NextResponse } from "next/server";
import { createGame, type GameInput } from "@/lib/mutations";
import type { GamePlatform } from "@/lib/types";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function toGameInput(b: Record<string, unknown>): GameInput {
  const platforms: GamePlatform[] = Array.isArray(b.platforms)
    ? (b.platforms as Record<string, unknown>[])
        .filter((e) => e && e.service)
        .map((e) => ({ service: String(e.service), format: String(e.format || "Disc") }))
    : [];
  return {
    rawg_id: toNum(b.rawg_id),
    title: String(b.title || "").trim() || "Untitled",
    year: toNum(b.year),
    cover_url: (b.cover_url as string) || null,
    platforms,
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const id = await createGame(toGameInput(body));
  return NextResponse.json({ id });
}
