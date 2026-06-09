import { NextRequest, NextResponse } from "next/server";
import { createGame, type GameInput } from "@/lib/mutations";
import { safeImageUrl } from "@/lib/ids";
import { GAME_SERVICES, GAME_FORMATS } from "@/lib/platforms";
import { sameOrigin } from "@/lib/guard";
import type { GamePlatform } from "@/lib/types";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function toGameInput(b: Record<string, unknown>): GameInput {
  // Keep only known services; normalise an unknown/blank format to "Disc".
  const platforms: GamePlatform[] = Array.isArray(b.platforms)
    ? (b.platforms as Record<string, unknown>[])
        .map((e) => ({ service: String(e?.service || ""), format: String(e?.format || "Disc") }))
        .filter((e) => GAME_SERVICES.includes(e.service))
        .map((e) => ({ service: e.service, format: GAME_FORMATS.includes(e.format) ? e.format : "Disc" }))
    : [];
  return {
    rawg_id: toNum(b.rawg_id),
    title: String(b.title || "").trim() || "Untitled",
    year: toNum(b.year),
    cover_url: safeImageUrl(b.cover_url),
    platforms,
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as Record<string, unknown>;
  const id = await createGame(toGameInput(body));
  return NextResponse.json({ id });
}
