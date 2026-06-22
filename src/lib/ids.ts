/* Trove — media id extraction. Accepts a pasted URL or a bare id and returns the
   numeric id. TMDB/RAWG canonical URLs put the id first and a slug after
   (themoviedb.org/movie/530915-1917 -> 530915), and that slug can itself be
   numeric, so we take the id from the /movie|tv|game(s)/ path segment, then fall
   back to the leading number of a bare "id-slug" string, then any number. Pure. */
export function extractMediaId(input: string): string | null {
  const s = (input || "").trim();
  // URL path form: /movie/530915-1917, /tv/1399-..., /games/28568-...
  const path = s.match(/\/(?:movie|tv|games?)\/(\d+)/i);
  if (path) return path[1];
  // Bare id, optionally followed by a slug: 530915-1917 -> 530915
  const lead = s.match(/^(\d+)/);
  if (lead) return lead[1];
  // Fallback: first number anywhere in the input.
  const any = s.match(/\d+/);
  return any ? any[0] : null;
}

/* RAWG games are addressed by slug (rawg.io/games/shadows-die-twice) or numeric
   id, and the slug — unlike TMDB — usually has no number to grab. Return the
   /games/<ref> path segment (slug or id), else a bare slug/id with any query or
   hash stripped. The RAWG API accepts either form at /api/games/<ref>. Pure. */
export function extractRawgRef(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;
  const m = s.match(/\/games\/([^/?#]+)/i);
  const ref = m ? decodeURIComponent(m[1]) : s.split(/[?#]/)[0];
  // RAWG refs are numeric ids or lowercase slugs; reject anything with path
  // separators or other unexpected chars to avoid upstream path traversal.
  return ref && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(ref) ? ref : null;
}

/* Trakt show refs come from trakt.tv/shows/<slug> URLs (or a bare slug / Trakt /
   IMDB id). Same shape as the RAWG extractor: pull the /shows/<ref> segment, else
   a bare token, charset-validated. Pure. */
export function extractTraktRef(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;
  const m = s.match(/\/shows\/([^/?#]+)/i);
  const ref = m ? decodeURIComponent(m[1]) : s.split(/[?#]/)[0];
  return ref && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(ref) ? ref : null;
}

const IMAGE_HOSTS = new Set(["image.tmdb.org", "media.rawg.io", "images.igdb.com"]);

/* Poster/cover URLs are persisted and later rendered into a raw <img src>, so
   they must be validated before storage: keep only https URLs served by the
   TMDB/RAWG image CDNs. Anything else (other hosts, javascript:/data: schemes,
   or non-URLs) becomes null. Pure. */
export function safeImageUrl(input: unknown): string | null {
  if (typeof input !== "string" || !input) return null;
  try {
    const u = new URL(input);
    return u.protocol === "https:" && IMAGE_HOSTS.has(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}
