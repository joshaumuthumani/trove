#!/usr/bin/env bash
# One-time: create Trove's API secrets in GCP Secret Manager, using the exact
# names the sync (scripts/sync-secrets.sh) expects — so no mapping edits needed.
#
# Run where gcloud is authenticated (your machine, or Google Cloud Shell which is
# pre-authed): GCP_PROJECT=<project-id> bash scripts/create-gcp-secrets.sh
#
# Each value is read from a HIDDEN prompt — never printed, never written to disk.
set -euo pipefail

PROJECT="${GCP_PROJECT:-}"
[[ -z "$PROJECT" ]] && { echo "Set GCP_PROJECT=<your-gcp-project-id> and re-run." >&2; exit 1; }

gcloud services enable secretmanager.googleapis.com --project="$PROJECT" >/dev/null 2>&1 || true

NAMES=(TMDB_API_KEY RAWG_API_KEY TRAKT_API_KEY TWITCH_CLIENT_ID TWITCH_CLIENT_SECRET)

for name in "${NAMES[@]}"; do
  read -r -s -p "Value for ${name} (leave blank to skip): " val; echo
  [[ -z "$val" ]] && { echo "  – skipped"; continue; }
  if gcloud secrets describe "$name" --project="$PROJECT" >/dev/null 2>&1; then
    printf '%s' "$val" | gcloud secrets versions add "$name" --project="$PROJECT" --data-file=- >/dev/null
    echo "  ✓ ${name} (new version)"
  else
    printf '%s' "$val" | gcloud secrets create "$name" --project="$PROJECT" --replication-policy=automatic --data-file=- >/dev/null
    echo "  ✓ ${name} (created)"
  fi
done

echo "Done. Now push them to Cloudflare: GCP_PROJECT=${PROJECT} npm run secrets:sync"
