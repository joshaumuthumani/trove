import { NextRequest, NextResponse } from "next/server";
import { createGame, type GameInput } from "@/lib/mutations";
import { safeImageUrl } from "@/lib/ids";
import { normalizeGamePlatforms } from "@/lib/platforms";
import { sameOrigin } from "@/lib/guard";
import { jsonError, readJsonBody } from "@/lib/http";
import { toText } from "../movies/route";

export const dynamic = "force-dynamic";

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function toGameInput(b: Record<string, unknown>): GameInput {
  const platforms = normalizeGamePlatforms(b.platforms);
  return {
    rawg_id: toNum(b.rawg_id),
    title: toText(b.title, 200) ?? "Untitled",
    year: toNum(b.year),
    cover_url: safeImageUrl(b.cover_url),
    platforms,
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await readJsonBody(req);
  if (body === null) return jsonError(400, "Invalid JSON body");
  const id = await createGame(toGameInput(body));
  return NextResponse.json({ id });
}
