$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$output = Join-Path $root 'desktop/assets'
New-Item -ItemType Directory -Force "$output/appx" | Out-Null
$source = [Drawing.Image]::FromFile((Join-Path $root 'assets/store-listing/Local-Model-Calculator-300.png'))
function Render-Png([int]$width, [int]$height) {
    $bitmap = [Drawing.Bitmap]::new($width, $height)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $stream = [IO.MemoryStream]::new()
    try {
        $graphics.Clear([Drawing.ColorTranslator]::FromHtml('#102e27'))
        $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $side = [Math]::Min($width, $height)
        $graphics.DrawImage($source, [int](($width-$side)/2), [int](($height-$side)/2), $side, $side)
        $bitmap.Save($stream, [Drawing.Imaging.ImageFormat]::Png)
        return ,$stream.ToArray()
    } finally { $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
}
try {
    [IO.File]::Copy((Join-Path $root 'assets/store-listing/Local-Model-Calculator-300.png'), "$output/icon.png", $true)
    $sizes = @(16,24,32,48,64,128,256)
    $frames = @($sizes | ForEach-Object { ,(Render-Png $_ $_) })
    $writer = [IO.BinaryWriter]::new([IO.File]::Create("$output/icon.ico"))
    try {
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$sizes.Count)
        $offset = 6 + 16 * $sizes.Count
        for ($i=0; $i -lt $sizes.Count; $i++) {
            $size = if ($sizes[$i] -eq 256) {0} else {$sizes[$i]}
            $writer.Write([byte]$size); $writer.Write([byte]$size)
            $writer.Write([byte]0); $writer.Write([byte]0)
            $writer.Write([uint16]1); $writer.Write([uint16]32)
            $writer.Write([uint32]$frames[$i].Length); $writer.Write([uint32]$offset)
            $offset += $frames[$i].Length
        }
        foreach ($frame in $frames) { $writer.Write([byte[]]$frame) }
    } finally { $writer.Dispose() }
    foreach ($tile in @(@('StoreLogo',50,50),@('Square44x44Logo',44,44),@('Square150x150Logo',150,150),@('Wide310x150Logo',310,150))) {
        [IO.File]::WriteAllBytes("$output/appx/$($tile[0]).png", (Render-Png $tile[1] $tile[2]))
    }
} finally { $source.Dispose() }
Write-Output 'Generated current app icons; historical build/ assets were not modified.'
