/* Trove — tiny client-side fetch helpers for the mutation + metadata endpoints. */
import type { Catalog } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function createItem(catalog: Catalog, body: unknown): Promise<{ id: number }> {
  return json(await fetch(`/api/${catalog}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
}

export async function updateItem(catalog: Catalog, id: number, body: unknown): Promise<void> {
  await json(await fetch(`/api/${catalog}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
}

export async function deleteItem(catalog: Catalog, id: number): Promise<void> {
  await json(await fetch(`/api/${catalog}/${id}`, { method: "DELETE" }));
}

export interface TmdbMeta {
  id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  director: string | null;
  user_score: number | null;
  overview: string | null;
  seasons?: { season: number; episode_count: number }[];
}
export async function fetchTmdb(idOrUrl: string, type: "movie" | "tv"): Promise<TmdbMeta> {
  return json(await fetch(`/api/metadata/tmdb?type=${type}&id=${encodeURIComponent(idOrUrl)}`));
}

export interface IgdbCandidate {
  id: number;
  title: string;
  year: number | null;
  cover_url: string | null;
}
export async function searchIgdb(name: string): Promise<IgdbCandidate[]> {
  const r = await json<{ results: IgdbCandidate[] }>(await fetch(`/api/metadata/igdb?q=${encodeURIComponent(name)}`));
  return r.results;
}

export interface TraktSeason {
  season: number;
  episode_count: number;
}
export async function fetchTraktSeasons(ref: string): Promise<TraktSeason[]> {
  const r = await json<{ results: TraktSeason[] }>(
    await fetch(`/api/metadata/trakt/seasons?id=${encodeURIComponent(ref)}`)
  );
  return r.results;
}
