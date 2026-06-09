import { NextRequest, NextResponse } from "next/server";
import { updateTV, deleteRow } from "@/lib/mutations";
import { toTVInput } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  await updateTV(Number(id), toTVInput(body));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteRow("tv_series", Number(id));
  return NextResponse.json({ ok: true });
}
