/* Trove — shared domain types (the app-level shape, post-DB-mapping). */

export type Catalog = "movies" | "tv" | "games";

export interface Movie {
  id: number;
  tmdb_id: number | null;
  title: string;
  year: number | null;
  poster_url: string | null;
  director: string | null; // TMDB director(s), comma-joined
  user_score: number | null; // TMDB vote_average (0–10)
  overview: string | null; // TMDB synopsis
  digital: string[]; // service names
  physical: string[]; // physical format names
  needs_review: boolean;
  date_added?: string;
}

/** Episodes owned on a given platform: "all" of the season, or specific numbers. */
export type OwnedEpisodes = "all" | number[];

/** A platform a season is owned on, with which episodes are owned there. Lets a
    season be owned differently per platform (e.g. all on Apple TV, pilot on YT). */
export interface SeasonHolding {
  platform: string;
  episodes: OwnedEpisodes;
}

export interface Season {
  id?: number;
  series_id?: number;
  season: number;
  episode_count: number;
  owned: boolean; // owned at all — may be true with no holdings ("source unspecified")
  owned_on: SeasonHolding[]; // per-platform holdings; [] when unowned or source-unspecified
}

export interface TVSeries {
  id: number;
  tmdb_id: number | null;
  series: string;
  year: number | null;
  poster_url: string | null;
  director: string | null; // TMDB creators (created_by), comma-joined
  user_score: number | null; // TMDB vote_average (0–10)
  overview: string | null; // TMDB synopsis
  needs_review: boolean;
  note: string | null;
  seasons: Season[];
  date_added?: string;
}

export interface GamePlatform {
  service: string;
  format: string; // "Digital" | "Disc"
}

export interface Game {
  id: number;
  rawg_id: number | null;
  title: string;
  year: number | null;
  cover_url: string | null;
  platforms: GamePlatform[];
  needs_tagging: boolean;
  date_added?: string;
}
