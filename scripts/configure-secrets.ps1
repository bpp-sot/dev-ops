# Store the temporary AWS credentials for your Skillable sandbox as GitHub
# Actions secrets. Nothing is written to disk or committed to the repository.
#
# Usage:
#   $env:AWS_ACCESS_KEY_ID = '...'; $env:AWS_SECRET_ACCESS_KEY = '...'; $env:AWS_SESSION_TOKEN = '...'
#   ./scripts/configure-secrets.ps1 [-Repo owner/repo]
param([string]$Repo)

$ErrorActionPreference = 'Stop'
if (-not $env:AWS_ACCESS_KEY_ID -or -not $env:AWS_SECRET_ACCESS_KEY) {
  throw 'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY first.'
}
if (-not $Repo) { $Repo = gh repo view --json nameWithOwner --jq .nameWithOwner }

foreach ($name in 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN') {
  $value = [Environment]::GetEnvironmentVariable($name)
  if ($value) { $value | gh secret set $name --repo $Repo }
}

$region = if ($env:AWS_REGION) { $env:AWS_REGION } elseif ($env:AWS_DEFAULT_REGION) { $env:AWS_DEFAULT_REGION } else { 'us-east-1' }
gh variable set AWS_REGION --repo $Repo --body $region
Write-Host "Secrets configured for $Repo. Push a commit or re-run the CI/CD workflow to deploy."
