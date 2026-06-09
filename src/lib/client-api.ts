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
  seasons?: { season: number; episode_count: number }[];
}
export interface RawgMeta {
  id: string;
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

export async function fetchTmdb(idOrUrl: string, type: "movie" | "tv"): Promise<TmdbMeta> {
  return json(await fetch(`/api/metadata/tmdb?type=${type}&id=${encodeURIComponent(idOrUrl)}`));
}
export async function fetchRawg(idOrUrl: string): Promise<RawgMeta> {
  return json(await fetch(`/api/metadata/rawg?id=${encodeURIComponent(idOrUrl)}`));
}
export async function searchRawg(name: string): Promise<RawgCandidate[]> {
  const r = await json<{ results: RawgCandidate[] }>(await fetch(`/api/metadata/rawg?q=${encodeURIComponent(name)}`));
  return r.results;
}
