$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host 'Sahra offline-sync validation' -ForegroundColor Cyan
Write-Host '1/3 Checking server JavaScript syntax...'
$serverFiles = @(
  'server.js',
  'backend/config/jwt.js',
  'backend/middleware/auth.js',
  'backend/middleware/idempotency.js',
  'backend/models/index.js',
  'backend/routes/auth.js',
  'backend/routes/dashboard.js'
)
foreach ($file in $serverFiles) { node --check $file; if ($LASTEXITCODE -ne 0) { throw "Syntax failed: $file" } }

Write-Host '2/3 Checking browser-module syntax...'
$browserFiles = @('app.js', 'scripts/local-database.js', 'scripts/offline-sync.js')
foreach ($file in $browserFiles) {
  Get-Content -Raw $file | node --input-type=module --check
  if ($LASTEXITCODE -ne 0) { throw "Syntax failed: $file" }
}

Write-Host 'Running offline-sync unit tests...'
node --test tests/offline-sync.test.mjs
if ($LASTEXITCODE -ne 0) { throw 'Offline-sync unit tests failed.' }

Write-Host '3/3 Optional REAL API + MongoDB test...' -ForegroundColor Yellow
if ($env:SAHRA_TEST_API_URL -and $env:SAHRA_TEST_EMAIL -and $env:SAHRA_TEST_PASSWORD) {
  node scripts/verify-mongo-sync.js
  if ($LASTEXITCODE -ne 0) { throw 'Real API/MongoDB end-to-end test failed.' }
} else {
  Write-Host 'SKIPPED: set SAHRA_TEST_API_URL, SAHRA_TEST_EMAIL and SAHRA_TEST_PASSWORD to run the real MongoDB test.' -ForegroundColor Yellow
}

Write-Host 'Static checks completed. Android offline behaviour still requires the device test described in OFFLINE_SYNC_VALIDATION.md.' -ForegroundColor Green
