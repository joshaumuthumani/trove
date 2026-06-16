import { NextRequest, NextResponse } from "next/server";
import { extractTraktRef } from "@/lib/ids";
import { fetchTraktSeasons } from "@/lib/trakt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = extractTraktRef(req.nextUrl.searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "No Trakt id or slug found in input." }, { status: 400 });
  try {
    return NextResponse.json({ results: await fetchTraktSeasons(id) });
  } catch {
    return NextResponse.json({ error: "Upstream metadata request failed." }, { status: 502 });
  }
}
