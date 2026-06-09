# Trove — Security Review

A vulnerability assessment of Trove (Next.js 16 App Router → Cloudflare Workers via
`@opennextjs/cloudflare`, backed by D1). This document records what was reviewed, the findings,
what was fixed, and the residual/accepted items.

## Threat model & the load-bearing control

Trove is a **single-user** personal media catalog. There is intentionally **no application-level
authentication** — the entire Worker is expected to sit behind **Cloudflare Access (Zero Trust)**,
which authenticates every request at the edge before it reaches the app.

> ⚠️ **Cloudflare Access is the primary access control.** If it is ever disabled or
> mis-scoped, every API route (including the `POST`/`PATCH`/`DELETE` mutation endpoints) becomes
> publicly writable. **Verify Access is enabled and enforced on the production domain
> (`trove.joshmuthumani.com`) and on the `*.workers.dev` URL** — the latter is easy to forget and
> bypasses a custom-domain-only policy.

## Findings & status

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| F1 | Info (by design) | No app-level auth on any route; relies on Cloudflare Access. | Accepted — documented above. |
| F2 | Medium | Metadata routes returned raw exception text (`"TMDB_API_KEY is not configured"`, upstream status) to clients. | **Fixed** — generic `"Upstream metadata request failed."` (502). |
| F3 | Medium | `poster_url` / `cover_url` stored unvalidated, rendered in a raw `<img src>` (not `next/image`, so `remotePatterns` did not apply). | **Fixed** — `safeImageUrl()` allowlist (https + TMDB/RAWG hosts) on write, plus CSP `img-src`. |
| F4 | Medium | `digital` / `physical` / `owned_on` / game `service`+`format` persisted as arbitrary strings. | **Fixed** — `filterKnown()` / enum checks against `platforms.ts`. |
| F5 | Medium | No security headers (CSP, frame-ancestors, nosniff, Referrer-Policy, HSTS). | **Fixed** — `next.config.ts` `headers()`. |
| F6 | Low | `extractRawgRef` could yield `..`/`/` interpolated unencoded into the RAWG path. | **Fixed** — slug/id charset validation + `encodeURIComponent` on the path. |
| F7 | Low | `deleteRow` interpolated a table name into SQL (type-only enum; not user-reachable). | **Fixed** — fixed per-table literal statements + runtime guard. |
| F8 | Low | API keys sent as TMDB/RAWG query params. | Accepted (see below). |
| F9 | Low | No CSRF token on mutations. | **Hardened** — same-origin `Origin` check (defense-in-depth). |
| F10 | Info | D1 `database_id` committed in `wrangler.jsonc`. | Accepted — not a secret; standard for a binding. |

### Confirmed NOT vulnerable
- **SQL injection** — all reads/writes use prepared statements with `.bind()`; the search `LIKE`
  escapes `%`/`_` with `ESCAPE '\'` (`src/lib/queries.ts`).
- **XSS** — no `dangerouslySetInnerHTML`; all dynamic values render through React escaping; stored
  URLs only feed `<img src>` (and `javascript:` in `img src` does not execute), now further locked
  by the host allowlist + CSP.
- **Secrets** — none committed; `.dev.vars` / `.env*` are gitignored. Keys come from Cloudflare
  secrets via `getEnv()`.
- **SSRF to internal services** — the `global_fetch_strictly_public` compatibility flag is set,
  blocking Worker `fetch` to private IP ranges.
- **Dependencies** — current (next 16.2.7, wrangler 4.98.x, react 19.x); lockfile present.

## What changed

- **Error sanitization** — `src/app/api/metadata/{tmdb,rawg}/route.ts`.
- **Stored-URL validation** — `safeImageUrl()` in `src/lib/ids.ts`, applied to `poster_url`/
  `cover_url` in the movies/tv/games input mappers.
- **Enum validation** — `filterKnown()` + `GAME_FORMATS` in `src/lib/platforms.ts`, applied in the
  three input mappers.
- **Security headers / CSP** — `src/lib/`… `next.config.ts` `headers()` on `/:path*`.
- **RAWG ref hardening** — charset check in `extractRawgRef`; `encodeURIComponent` on the RAWG/TMDB
  path ids (`src/lib/rawg.ts`, `src/lib/tmdb.ts`).
- **`deleteRow`** — fixed literal statements keyed by table, with an unknown-table guard
  (`src/lib/mutations.ts`).
- **CSRF defense-in-depth** — `sameOrigin()` (`src/lib/guard.ts`) gating every `POST`/`PATCH`/
  `DELETE` handler.

## Residual / accepted risk & follow-ups

- **F8 — API keys in query strings.** TMDB and RAWG (v3) only authenticate via a `key`/`api_key`
  query param, and these calls are **server→upstream only** (`server-only` modules) — the key is
  never sent to the browser. Risk is limited to upstream/proxy logs. *Optional follow-up:* migrate
  TMDB to a **v4 read access token** sent as `Authorization: Bearer …` to keep it out of URLs
  (requires storing a different secret).
- **CSP `'unsafe-inline'`** for `script-src`/`style-src` is a pragmatic baseline (inline poster
  gradient styles + Next's inline bootstrap script). *Follow-up:* tighten to per-request nonces.
- **`sameOrigin()` is defense-in-depth**, redundant with Cloudflare Access; it passes requests with
  no `Origin` header (non-browser clients).

## How this was verified
- `npx tsc --noEmit` and `npm run lint` clean.
- Unit-level checks of `safeImageUrl` (rejects `javascript:`, `data:`, non-https, foreign hosts)
  and `extractRawgRef` (rejects `..`, `/`).
- Regression: TMDB Re-fetch, RAWG search + slug URL, and global search still work end-to-end.
