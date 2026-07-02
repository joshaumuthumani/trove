#!/usr/bin/env bash
# Sync API secrets from GCP Secret Manager -> Cloudflare Worker Secrets.
#
# The Worker reads secrets from Cloudflare env bindings (getEnv()), so GCP is the
# source of truth and this pushes the current values into Cloudflare. Cloudflare
# secrets PERSIST across deploys, so this is NOT a per-deploy step — run it only
# when a secret is added or rotated.
#
# Requires (run from a trusted machine / CI):
#   - gcloud, authenticated with access to the secrets  (Secret Manager Accessor)
#   - wrangler, authenticated to Cloudflare  (wrangler login, or CLOUDFLARE_API_TOKEN)
#   - GCP_PROJECT set to your Google Cloud project id
#
# Secret values are never printed.
set -euo pipefail

PROJECT="${GCP_PROJECT:-}"
if [[ -z "$PROJECT" ]]; then
  echo "Set GCP_PROJECT=<your-gcp-project-id> and re-run." >&2
  exit 1
fi

# "CLOUDFLARE_SECRET_NAME:GCP_SECRET_NAME" — edit the GCP side if you named them
# differently there. (RAWG is legacy — the UI now uses IGDB — kept for the route.)
PAIRS=(
  "TMDB_API_KEY:TMDB_API_KEY"
  "RAWG_API_KEY:RAWG_API_KEY"
  "TRAKT_API_KEY:TRAKT_API_KEY"
  "TWITCH_CLIENT_ID:TWITCH_CLIENT_ID"
  "TWITCH_CLIENT_SECRET:TWITCH_CLIENT_SECRET"
)

for pair in "${PAIRS[@]}"; do
  cf="${pair%%:*}"
  gcp="${pair##*:}"
  echo "→ ${cf}  (GCP secret: ${gcp})"
  if ! val="$(gcloud secrets versions access latest --secret="$gcp" --project="$PROJECT" 2>/dev/null)"; then
    echo "  ⚠ skipped — not found in GCP Secret Manager" >&2
    continue
  fi
  printf '%s' "$val" | npx wrangler secret put "$cf" >/dev/null
  echo "  ✓ pushed to Cloudflare"
done

echo "Done. Cloudflare secrets persist across deploys — re-run only when a value changes."
