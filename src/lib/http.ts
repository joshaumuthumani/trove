/* Trove — shared request-parsing helpers for mutating route handlers. */
import { NextResponse } from "next/server";

// Route params are opaque path segments; only a positive integer is a valid row id.
export function parsePositiveIntId(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

export function jsonError(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// Route bodies arrive as arbitrary JSON text; malformed input must 400, not 500.
// Arrays and primitives are valid JSON but never a valid request body here.
export async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// Shared PATCH flow for the /[id] routes: validate id + body, run the update,
// 404 if the row didn't exist. Keeps the movies/tv/games handlers to one call each.
// toInput may return null to reject a structurally-valid JSON body whose contents
// fail validation (e.g. malformed season data) with 400 instead of silently
// dropping the bad part and succeeding.
export async function handleIdMutation<TInput>(
  req: Request,
  rawId: string,
  toInput: (b: Record<string, unknown>) => TInput | null,
  update: (id: number, input: TInput) => Promise<boolean>
): Promise<NextResponse> {
  const id = parsePositiveIntId(rawId);
  if (id === null) return jsonError(400, "Invalid id");
  const body = await readJsonBody(req);
  if (body === null) return jsonError(400, "Invalid JSON body");
  const input = toInput(body);
  if (input === null) return jsonError(400, "Invalid input");
  const found = await update(id, input);
  if (!found) return jsonError(404, "Not found");
  return NextResponse.json({ ok: true });
}

// Shared DELETE flow for the /[id] routes: validate id, delete, 404 if missing.
export async function handleIdDelete(rawId: string, del: (id: number) => Promise<boolean>): Promise<NextResponse> {
  const id = parsePositiveIntId(rawId);
  if (id === null) return jsonError(400, "Invalid id");
  const found = await del(id);
  if (!found) return jsonError(404, "Not found");
  return NextResponse.json({ ok: true });
}
