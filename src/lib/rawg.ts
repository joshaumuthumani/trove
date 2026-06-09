/* Trove — RAWG metadata fetch (server-side). Returns normalized title/year/cover. */
import "server-only";
import { getEnv } from "./db";

export interface RawgGameMeta {
  title: string;
  year: number | null;
  cover_url: string | null;
}

export interface RawgCandidate {
  id: number;
  title: string;
  year: number | null;
  cover_url: string | null;
}

function yearOf(released?: string | null): number | null {
  return released && released.length >= 4 ? parseInt(released.slice(0, 4), 10) : null;
}

export async function fetchRawgGame(id: string | number): Promise<RawgGameMeta> {
  const { RAWG_API_KEY } = await getEnv();
  if (!RAWG_API_KEY) throw new Error("RAWG_API_KEY is not configured");
  const res = await fetch(`https://api.rawg.io/api/games/${encodeURIComponent(String(id))}?key=${RAWG_API_KEY}`);
  if (!res.ok) throw new Error(`RAWG ${res.status}`);
  const d = (await res.json()) as { name: string; released?: string; background_image?: string | null };
  return { title: d.name, year: yearOf(d.released), cover_url: d.background_image || null };
}

// RAWG has no paste-able numeric id like TMDB; games are discovered by name. This
// returns the top matches so the caller can confirm which one when there are many.
export async function searchRawgGames(query: string): Promise<RawgCandidate[]> {
  const { RAWG_API_KEY } = await getEnv();
  if (!RAWG_API_KEY) throw new Error("RAWG_API_KEY is not configured");
  const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(
    query
  )}&search_precise=true&page_size=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RAWG ${res.status}`);
  const d = (await res.json()) as {
    results?: { id: number; name: string; released?: string | null; background_image?: string | null }[];
  };
  return (d.results || []).map((g) => ({
    id: g.id,
    title: g.name,
    year: yearOf(g.released),
    cover_url: g.background_image || null,
  }));
}
