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
  if (m) return decodeURIComponent(m[1]);
  return s.split(/[?#]/)[0] || null;
}
