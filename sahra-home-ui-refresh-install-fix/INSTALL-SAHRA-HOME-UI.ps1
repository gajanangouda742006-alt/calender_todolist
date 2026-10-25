param(
  [string]$ProjectRoot = 'P:\MyProjects\calender_todolist'
)
$ErrorActionPreference = 'Stop'
$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)

Write-Host "`nSahra Home UI installer" -ForegroundColor Cyan
Write-Host "Patch files: $patchRoot"
Write-Host "Project:     $ProjectRoot"

foreach ($required in @('app.js', 'style.css', 'scripts\build-web.js', 'index.html')) {
  if (-not (Test-Path (Join-Path $ProjectRoot $required) -PathType Leaf)) {
    throw "Required project file not found: $(Join-Path $ProjectRoot $required). Check ProjectRoot and run again."
  }
}
foreach ($patchFile in @('app.js', 'style.css')) {
  if (-not (Test-Path (Join-Path $patchRoot $patchFile) -PathType Leaf)) {
    throw "Patch file is missing: $(Join-Path $patchRoot $patchFile)"
  }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
foreach ($file in @('app.js', 'style.css')) {
  Copy-Item (Join-Path $ProjectRoot $file) (Join-Path $ProjectRoot "$file.backup-home-ui-$stamp") -Force
  Copy-Item (Join-Path $patchRoot $file) (Join-Path $ProjectRoot $file) -Force
  Write-Host "Installed $file (backup saved)." -ForegroundColor Green
}

# Change the cache name in-place so an old installed PWA cache is discarded,
# without replacing the rest of the user's service-worker implementation.
$swPath = Join-Path $ProjectRoot 'service-worker.js'
if (Test-Path $swPath -PathType Leaf) {
  Copy-Item $swPath (Join-Path $ProjectRoot "service-worker.js.backup-home-ui-$stamp") -Force
  $sw = [System.IO.File]::ReadAllText($swPath)
  $pattern = '(?m)(const\s+CACHE_NAME\s*=\s*["''])([^"'']+)(["'']\s*;)'
  $matches = [regex]::Matches($sw, $pattern)
  if ($matches.Count -gt 0) {
    $newCacheName = "sahra-shell-home-ui-$stamp"
    $sw = [regex]::Replace($sw, $pattern, ('$1' + $newCacheName + '$3'), 1)
    [System.IO.File]::WriteAllText($swPath, $sw, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "Updated service-worker cache version to $newCacheName." -ForegroundColor Green
  } else {
    Write-Warning 'Could not identify CACHE_NAME in service-worker.js; it was backed up but not modified.'
  }
}

# Cache-bust the two assets so the browser cannot keep displaying an older JS bundle/CSS file.
$indexPath = Join-Path $ProjectRoot 'index.html'
$index = [System.IO.File]::ReadAllText($indexPath)
$indexOriginal = $index
$stylePattern = 'href=(["''])\.\/style\.css(?:\?[^"'']*)?\1'
$index = [regex]::Replace($index, $stylePattern, 'href="./style.css?v=home-ui-' + $stamp + '"')
$scriptPattern = 'src=(["''])\.\/web-app\.js(?:\?[^"'']*)?\1'
$index = [regex]::Replace($index, $scriptPattern, 'src="./web-app.js?v=home-ui-' + $stamp + '"')
if ($index -ne $indexOriginal) {
  Copy-Item $indexPath (Join-Path $ProjectRoot "index.html.backup-home-ui-$stamp") -Force
  [System.IO.File]::WriteAllText($indexPath, $index, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host 'Added cache-busting versions to style.css and web-app.js.' -ForegroundColor Green
} else {
  Write-Warning 'The expected ./style.css and ./web-app.js references were not found in index.html. Inspect index.html if stale UI persists.'
}

Push-Location $ProjectRoot
try {
  Write-Host "`nChecking JavaScript syntax..." -ForegroundColor Cyan
  & node --check .\app.js
  if ($LASTEXITCODE -ne 0) { throw 'node --check app.js failed.' }
  Write-Host 'Building web-app.js...' -ForegroundColor Cyan
  & node .\scripts\build-web.js
  if ($LASTEXITCODE -ne 0) { throw 'scripts/build-web.js failed.' }
  if (-not (Test-Path '.\web-app.js')) { throw 'Build reported success, but web-app.js was not found.' }
  $bundle = [System.IO.File]::ReadAllText((Join-Path $ProjectRoot 'web-app.js'))
  if ($bundle.Contains('View Weather') -and $bundle.Contains('Today''s Programs')) {
    Write-Host 'Verified: generated bundle contains View Weather and Today''s Programs.' -ForegroundColor Green
  } else {
    Write-Warning 'The generated bundle does not contain expected UI labels. Check that the app.js from this patch was copied.'
  }
} finally {
  Pop-Location
}

Write-Host "`nINSTALL COMPLETE" -ForegroundColor Green
Write-Host 'Next: open the LOCAL app, press Ctrl+Shift+R, then test View Weather and Today''s Programs.'
Write-Host 'This updates local files only. To update Render/GitHub, review git status and commit/push the intended changes.'
