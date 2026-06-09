import { NextRequest, NextResponse } from "next/server";
import { updateGame, deleteRow } from "@/lib/mutations";
import { sameOrigin } from "@/lib/guard";
import { toGameInput } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  await updateGame(Number(id), toGameInput(body));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await deleteRow("games", Number(id));
  return NextResponse.json({ ok: true });
}
