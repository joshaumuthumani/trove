import { NextRequest, NextResponse } from "next/server";
import { extractMediaId } from "@/lib/ids";
import { fetchRawgGame } from "@/lib/rawg";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("id") || "";
  const id = extractMediaId(raw);
  if (!id) return NextResponse.json({ error: "No id found in input." }, { status: 400 });
  try {
    const meta = await fetchRawgGame(id);
    return NextResponse.json({ id, ...meta });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
