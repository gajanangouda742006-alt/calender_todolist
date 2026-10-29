$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'images\DaySync-512.png'
if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Required DaySync logo not found: $sourcePath."
}
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile($sourcePath)
try {
  $sizes = @(
    @{ Density = 'mipmap-mdpi'; Size = 48 },
    @{ Density = 'mipmap-hdpi'; Size = 72 },
    @{ Density = 'mipmap-xhdpi'; Size = 96 },
    @{ Density = 'mipmap-xxhdpi'; Size = 144 },
    @{ Density = 'mipmap-xxxhdpi'; Size = 192 }
  )
  $resRoot = Join-Path $projectRoot 'android\app\src\main\res'
  foreach ($item in $sizes) {
    $directory = Join-Path $resRoot $item.Density
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    foreach ($name in @('ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png')) {
      $bitmap = [System.Drawing.Bitmap]::new($item.Size, $item.Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $item.Size, $item.Size)
        $bitmap.Save((Join-Path $directory $name), [System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $graphics.Dispose(); $bitmap.Dispose() }
    }
  }
  Write-Host 'DaySync launcher PNGs generated from image-512.png.'
} finally { $source.Dispose() }
