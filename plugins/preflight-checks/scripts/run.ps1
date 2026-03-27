$ErrorActionPreference = "Stop"

Write-Host "== Preflight Checks ==" -ForegroundColor Cyan

if (-not (Test-Path "package.json")) {
  Write-Host "package.json not found. Skipping npm checks." -ForegroundColor Yellow
  exit 0
}

$packageJson = Get-Content -Raw "package.json" | ConvertFrom-Json
$scripts = @{}
if ($packageJson.scripts) {
  $packageJson.scripts.PSObject.Properties | ForEach-Object { $scripts[$_.Name] = $_.Value }
}

function Run-IfPresent {
  param(
    [string]$ScriptName,
    [string]$Command
  )

  if ($scripts.ContainsKey($ScriptName)) {
    Write-Host "Running: $Command" -ForegroundColor Green
    Invoke-Expression $Command
  } else {
    Write-Host "Skipping $ScriptName (not defined)." -ForegroundColor Yellow
  }
}

Run-IfPresent -ScriptName "build" -Command "npm run build"
Run-IfPresent -ScriptName "typecheck" -Command "npm run typecheck"
Run-IfPresent -ScriptName "test" -Command "npm test"

Write-Host "Preflight checks complete." -ForegroundColor Cyan
