#!/usr/bin/env bash
# Store the temporary AWS credentials for your Skillable sandbox as GitHub
# Actions secrets. Nothing is written to disk or committed to the repository.
#
# Usage:
#   export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... AWS_SESSION_TOKEN=...
#   ./scripts/configure-secrets.sh [owner/repo]
set -euo pipefail

: "${AWS_ACCESS_KEY_ID:?Set AWS_ACCESS_KEY_ID first}"
: "${AWS_SECRET_ACCESS_KEY:?Set AWS_SECRET_ACCESS_KEY first}"
REPO="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"

for name in AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN; do
  value="${!name:-}"
  if [ -n "$value" ]; then
    printf '%s' "$value" | gh secret set "$name" --repo "$REPO"
  fi
done

gh variable set AWS_REGION --repo "$REPO" --body "${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}"
echo "Secrets configured for $REPO. Push a commit or re-run the CI/CD workflow to deploy."
