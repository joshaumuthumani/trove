import { NextRequest, NextResponse } from "next/server";
import { updateMovie, deleteRow } from "@/lib/mutations";
import { sameOrigin } from "@/lib/guard";
import { handleIdMutation, handleIdDelete } from "@/lib/http";
import { toMovieInput } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  return handleIdMutation(req, id, toMovieInput, updateMovie);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  return handleIdDelete(id, (movieId) => deleteRow("movies", movieId));
}
