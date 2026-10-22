$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force "$PSScriptRoot/build" | Out-Null
$bitmap = [Drawing.Bitmap]::new(256,256)
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$font = [Drawing.Font]::new('Segoe UI',100,[Drawing.FontStyle]::Bold)
$brush = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#baff69'))
try {
    $graphics.Clear([Drawing.ColorTranslator]::FromHtml('#142c27'))
    $graphics.DrawString('AI',$font,$brush,20,45)
    $bitmap.Save("$PSScriptRoot/build/icon.png",[Drawing.Imaging.ImageFormat]::Png)
    $stream = [IO.MemoryStream]::new()
    $bitmap.Save($stream,[Drawing.Imaging.ImageFormat]::Png)
    $png = $stream.ToArray()
    $file = [IO.File]::Create("$PSScriptRoot/build/icon.ico")
    $writer = [IO.BinaryWriter]::new($file)
    try {
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]1)
        $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0)
        $writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$png.Length); $writer.Write([uint32]22); $writer.Write($png)
    } finally { $writer.Dispose(); $stream.Dispose() }
} finally { $brush.Dispose(); $font.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }

New-Item -ItemType Directory -Force "$PSScriptRoot/build/appx" | Out-Null
$source = [Drawing.Image]::FromFile("$PSScriptRoot/build/icon.png")
try {
    foreach ($asset in @(@('StoreLogo',50,50),@('Square44x44Logo',44,44),@('Square150x150Logo',150,150),@('Wide310x150Logo',310,150))) {
        $tile = [Drawing.Bitmap]::new([int]$asset[1],[int]$asset[2])
        $canvas = [Drawing.Graphics]::FromImage($tile)
        try {
            $canvas.Clear([Drawing.ColorTranslator]::FromHtml('#142c27'))
            $canvas.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $side = [Math]::Min([int]$asset[1],[int]$asset[2])
            $canvas.DrawImage($source,([int]$asset[1]-$side)/2,0,$side,$side)
            $tile.Save("$PSScriptRoot/build/appx/$($asset[0]).png",[Drawing.Imaging.ImageFormat]::Png)
        } finally { $canvas.Dispose(); $tile.Dispose() }
    }
} finally { $source.Dispose() }
