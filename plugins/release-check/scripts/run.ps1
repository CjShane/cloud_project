$ErrorActionPreference = "Stop"

Write-Host "== Release Check (EC2) ==" -ForegroundColor Cyan

$requiredFiles = @(
  "README.md",
  "AGENTS.md",
  "docs/EC2_AGENT_CONTEXT.md",
  "docs/ARCHITECTURE.md",
  ".env.example"
)

$missing = @()
foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    $missing += $file
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Missing required files: " + ($missing -join ", "))
}

$envExample = Get-Content -Raw ".env.example"
if ($envExample -notmatch "(?m)^PORT=") {
  Write-Error "PORT is not documented in .env.example"
}

$readme = Get-Content -Raw "README.md"
if ($readme -notmatch "npm run build") {
  Write-Error "README.md is missing build command documentation."
}
if ($readme -notmatch "npm start") {
  Write-Error "README.md is missing start command documentation."
}

Write-Host "Release checks passed." -ForegroundColor Green
