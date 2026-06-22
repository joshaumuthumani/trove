/* Trove — IGDB game search + cover art. IGDB has proper titled box-art (RAWG only
   has key-art/screenshots). Auth is Twitch client-credentials: exchange the app
   Client ID/Secret for a ~60-day app token, cached here, then query IGDB's
   apicalypse API. Credentials are passed in by the route (sourced from getEnv),
   so the pure mappers stay unit-testable. */

const IMG_BASE = "https://images.igdb.com/igdb/image/upload/t_cover_big/";

export interface IgdbCandidate {
  id: number;
  title: string;
  year: number | null;
  cover_url: string | null;
}

export function igdbCoverUrl(imageId?: string | null): string | null {
  return imageId ? `${IMG_BASE}${imageId}.jpg` : null;
}

interface IgdbRaw {
  id: number;
  name?: string;
  first_release_date?: number; // unix seconds
  cover?: { image_id?: string };
}

export function mapIgdbGames(raw: unknown): IgdbCandidate[] {
  if (!Array.isArray(raw)) return [];
  return (raw as IgdbRaw[])
    .filter((g) => g && typeof g.id === "number" && typeof g.name === "string" && g.name)
    .map((g) => ({
      id: g.id,
      title: g.name as string,
      year: g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : null,
      cover_url: igdbCoverUrl(g.cover?.image_id),
    }));
}

// Cached app token (module scope; Worker isolates are short-lived and Twitch
// tokens last ~60 days, so refreshing per isolate is well within limits).
let cached: { token: string; expiresAt: number } | null = null;
export function _resetTokenCache() {
  cached = null;
}

export async function getIgdbToken(clientId: string, clientSecret: string, now: number = Date.now()): Promise<string> {
  if (cached && cached.expiresAt > now + 60_000) return cached.token;
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(
      clientSecret
    )}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Twitch ${res.status}`);
  const d = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: d.access_token, expiresAt: now + d.expires_in * 1000 };
  return cached.token;
}

export async function searchIgdbGames(clientId: string, clientSecret: string, query: string): Promise<IgdbCandidate[]> {
  const token = await getIgdbToken(clientId, clientSecret);
  // Quotes/backslashes would break the apicalypse search literal — strip them.
  const safe = query.replace(/["\\]/g, " ").trim();
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "Trove/1.0",
    },
    body: `search "${safe}"; fields name,first_release_date,cover.image_id; limit 8;`,
  });
  if (!res.ok) throw new Error(`IGDB ${res.status}`);
  return mapIgdbGames(await res.json());
}
