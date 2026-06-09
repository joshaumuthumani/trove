import { NextRequest, NextResponse } from "next/server";
import { updateMovie, deleteRow } from "@/lib/mutations";
import { toMovieInput } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  await updateMovie(Number(id), toMovieInput(body));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteRow("movies", Number(id));
  return NextResponse.json({ ok: true });
}
