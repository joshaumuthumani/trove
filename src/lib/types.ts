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

/** A season's episode ownership: "all", "unowned", or a list of owned ep numbers. */
export type SeasonEpisodes = "all" | "unowned" | number[];

export interface Season {
  id?: number;
  series_id?: number;
  season: number;
  episode_count: number;
  episodes: SeasonEpisodes;
  owned_on: string[]; // a season may be owned on several TV platforms
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
