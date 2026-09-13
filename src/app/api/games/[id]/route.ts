import { NextRequest, NextResponse } from "next/server";
import { updateGame, deleteRow } from "@/lib/mutations";
import { sameOrigin } from "@/lib/guard";
import { handleIdMutation, handleIdDelete } from "@/lib/http";
import { toGameInput } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  return handleIdMutation(req, id, toGameInput, updateGame);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  return handleIdDelete(id, (gameId) => deleteRow("games", gameId));
}
