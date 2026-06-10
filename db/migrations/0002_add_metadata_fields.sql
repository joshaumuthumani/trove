-- Trove — additive migration: director / user_score / overview metadata fields.
-- These mirror the columns now declared in 0001_init.sql. Apply this to an
-- already-populated database (local or remote) to add the columns WITHOUT the
-- drop-and-recreate that 0001 performs. A fresh `db:reset:*` gets them from
-- 0001 directly; do NOT also run this migration on a freshly reset DB (the
-- columns would already exist and ADD COLUMN would error).
--
-- director: movies -> TMDB director(s); tv_series -> TMDB creators (created_by).
-- user_score: TMDB vote_average (0–10). overview: TMDB synopsis.

ALTER TABLE movies    ADD COLUMN director   TEXT;
ALTER TABLE movies    ADD COLUMN user_score REAL;
ALTER TABLE movies    ADD COLUMN overview   TEXT;

ALTER TABLE tv_series ADD COLUMN director   TEXT;
ALTER TABLE tv_series ADD COLUMN user_score REAL;
ALTER TABLE tv_series ADD COLUMN overview   TEXT;
