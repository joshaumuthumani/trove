/* Trove — RAWG metadata fetch (server-side). Returns normalized title/year/cover. */
import "server-only";
import { getEnv } from "./db";

export interface RawgGameMeta {
  title: string;
  year: number | null;
  cover_url: string | null;
}

export async function fetchRawgGame(id: string | number): Promise<RawgGameMeta> {
  const { RAWG_API_KEY } = await getEnv();
  if (!RAWG_API_KEY) throw new Error("RAWG_API_KEY is not configured");
  const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
  if (!res.ok) throw new Error(`RAWG ${res.status}`);
  const d = (await res.json()) as { name: string; released?: string; background_image?: string | null };
  const year = d.released && d.released.length >= 4 ? parseInt(d.released.slice(0, 4), 10) : null;
  return { title: d.name, year, cover_url: d.background_image || null };
}
