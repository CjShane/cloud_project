param(
  [int]$Port = 3100
)

$ErrorActionPreference = "Stop"

function Wait-ForHttp200 {
  param(
    [string]$Url,
    [int]$Attempts = 60
  )

  for ($i = 1; $i -le $Attempts; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  throw "Service did not become healthy at $Url"
}

Write-Host "== EC2-like Smoke Test ==" -ForegroundColor Cyan
Write-Host "Using port $Port" -ForegroundColor Gray

$workingDirectory = (Get-Location).Path
$job = Start-Job -ScriptBlock {
  param($wd, $targetPort)
  Set-Location $wd
  npm start -- --port $targetPort
} -ArgumentList $workingDirectory, $Port

try {
  Start-Sleep -Seconds 1
  if ($job.State -eq "Failed") {
    $jobError = (Receive-Job -Job $job -Keep | Out-String)
    throw "App process failed to start. Output: $jobError"
  }

  Wait-ForHttp200 -Url "http://127.0.0.1:$Port/"
  Wait-ForHttp200 -Url "http://127.0.0.1:$Port/bible"
  Wait-ForHttp200 -Url "http://127.0.0.1:$Port/daily"
  Wait-ForHttp200 -Url "http://127.0.0.1:$Port/compare"

  $apiUrl = "http://127.0.0.1:$Port/api/bible?reference=John%203%3A16&translation=web"
  $apiResponse = Invoke-RestMethod -Uri $apiUrl -TimeoutSec 5

  if (-not $apiResponse.data -or -not $apiResponse.data.verses -or $apiResponse.data.verses.Count -lt 1) {
    throw "API smoke test failed: expected at least one verse."
  }

  $dailyApiUrl = "http://127.0.0.1:$Port/api/daily?translation=web"
  $dailyApiResponse = Invoke-RestMethod -Uri $dailyApiUrl -TimeoutSec 5
  if (-not $dailyApiResponse.data -or -not $dailyApiResponse.data.passage) {
    throw "Daily API smoke test failed: expected passage payload."
  }

  $compareApiUrl = "http://127.0.0.1:$Port/api/compare?reference=John%203%3A16&primary=web&secondary=kjv"
  $compareApiResponse = Invoke-RestMethod -Uri $compareApiUrl -TimeoutSec 5
  if (-not $compareApiResponse.data -or -not $compareApiResponse.data.primary -or -not $compareApiResponse.data.secondary) {
    throw "Compare API smoke test failed: expected primary and secondary payloads."
  }

  Write-Host "Smoke test passed." -ForegroundColor Green
} finally {
  if ($job) {
    $jobOutput = Receive-Job -Job $job -Keep -ErrorAction SilentlyContinue | Out-String
    if ($jobOutput.Trim()) {
      Write-Host $jobOutput -ForegroundColor DarkGray
    }
  }

  if ($job) {
    Stop-Job -Job $job -ErrorAction SilentlyContinue | Out-Null
    Remove-Job -Job $job -Force -ErrorAction SilentlyContinue | Out-Null
  }
}
