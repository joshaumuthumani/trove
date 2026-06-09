-- Trove — D1 schema (SQLite).
-- Based on PRD v0.2 §6, with two deliberate deviations where the design-handoff
-- README supersedes the PRD (README wins):
--   * games store ownership as a JSON `platforms` array ([{service,format}]) —
--     a game can be owned on several services/formats at once — instead of the
--     PRD's single service/format columns.
--   * games and tv_series carry a `year`; tv_series carries an optional `note`
--     ("owned, source unspecified" style annotations) used by the prototype.
-- Re-runnable as a dev reset: drops then recreates.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS tv_seasons;
DROP TABLE IF EXISTS tv_series;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS games;

-- MOVIES -------------------------------------------------------------------
CREATE TABLE movies (
  id           INTEGER PRIMARY KEY,
  tmdb_id      INTEGER,                 -- supplied on entry; drives metadata
  title        TEXT NOT NULL,           -- from TMDB; editable override
  year         INTEGER,
  poster_url   TEXT,                    -- from TMDB, cached
  digital      TEXT NOT NULL DEFAULT '[]', -- JSON: ["iTunes","Movies Anywhere",...]
  physical     TEXT NOT NULL DEFAULT '[]', -- JSON: ["Blu-Ray","DVD"]
  needs_review INTEGER NOT NULL DEFAULT 0, -- bulk backfill couldn't map -> fix later
  date_added   TEXT DEFAULT (datetime('now'))
);

-- TV -----------------------------------------------------------------------
CREATE TABLE tv_series (
  id           INTEGER PRIMARY KEY,
  tmdb_id      INTEGER,
  series       TEXT NOT NULL,
  year         INTEGER,
  poster_url   TEXT,
  note         TEXT,                    -- e.g. "owned, source unspecified"
  needs_review INTEGER NOT NULL DEFAULT 0,
  date_added   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tv_seasons (
  id            INTEGER PRIMARY KEY,
  series_id     INTEGER NOT NULL REFERENCES tv_series(id) ON DELETE CASCADE,
  season        INTEGER,
  episode_count INTEGER,               -- from TMDB, so "Specific" knows N
  episodes      TEXT NOT NULL DEFAULT 'unowned', -- "all" | "unowned" | JSON array of ints
  owned_on      TEXT NOT NULL DEFAULT '[]'       -- JSON: ["Apple TV","Amazon Video",...]
);

-- GAMES --------------------------------------------------------------------
CREATE TABLE games (
  id            INTEGER PRIMARY KEY,
  rawg_id       INTEGER,               -- supplied on entry; drives metadata
  title         TEXT NOT NULL,
  year          INTEGER,
  cover_url     TEXT,
  platforms     TEXT NOT NULL DEFAULT '[]', -- JSON: [{"service":"PlayStation","format":"Disc"}]
  needs_tagging INTEGER NOT NULL DEFAULT 0,  -- seed games missing service/format
  date_added    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_seasons_series ON tv_seasons(series_id);
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_tv_series_title ON tv_series(series);
CREATE INDEX idx_games_title ON games(title);
