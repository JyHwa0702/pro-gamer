Add-Type -AssemblyName System.Drawing

function Create-GoatIcon {
    param([int]$finalSize = 512)

    $size = 1024
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $g.Clear([System.Drawing.Color]::Transparent)

    # 1. Rounded Squircle Background Path
    $rad = 220
    $rect = New-Object System.Drawing.Rectangle(20, 20, ($size - 40), ($size - 40))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $rad * 2
    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc(($rect.Right - $d), $rect.Y, $d, $d, 270, 90)
    $path.AddArc(($rect.Right - $d), ($rect.Bottom - $d), $d, $d, 0, 90)
    $path.AddArc($rect.X, ($rect.Bottom - $d), $d, $d, 90, 90)
    $path.CloseFigure()

    # Fill base dark gradient
    $p1 = New-Object System.Drawing.Point(0, 0)
    $p2 = New-Object System.Drawing.Point(0, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($p1, $p2, [System.Drawing.Color]::FromArgb(255, 14, 20, 36), [System.Drawing.Color]::FromArgb(255, 6, 8, 15))
    $g.FillPath($bgBrush, $path)

    # Center Radial Glow
    $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $glowPath.AddEllipse(120, 80, 784, 784)
    $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
    $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(120, 14, 165, 233)
    $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 14, 165, 233))
    $g.FillPath($glowBrush, $glowPath)

    # Secondary Warm Gold Glow
    $goldGlowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $goldGlowPath.AddEllipse(220, 180, 584, 584)
    $goldGlowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($goldGlowPath)
    $goldGlowBrush.CenterColor = [System.Drawing.Color]::FromArgb(100, 245, 158, 11)
    $goldGlowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 245, 158, 11))
    $g.FillPath($goldGlowBrush, $goldGlowPath)

    # Cyber Grid Accent lines
    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(35, 56, 189, 248), 2)
    for ($x = 80; $x -lt $size; $x += 64) {
        $g.DrawLine($gridPen, $x, 30, $x, ($size - 30))
    }
    for ($y = 80; $y -lt $size; $y += 64) {
        $g.DrawLine($gridPen, 30, $y, ($size - 30), $y)
    }

    # Outer Glowing Rims
    $outerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 245, 158, 11), 12)
    $g.DrawPath($outerPen, $path)
    
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 254, 240, 138), 4)
    $g.DrawPath($innerPen, $path)

    # 2. Power ON Neon Ring (ON)
    $cx = 512
    $powerPenCyan = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(210, 14, 165, 233), 20)
    $powerPenWhite = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(250, 255, 255, 255), 6)
    
    # Power arc (gap at top)
    $arcRect = New-Object System.Drawing.Rectangle(240, 160, 544, 544)
    $g.DrawArc($powerPenCyan, $arcRect, 125, 290)
    $g.DrawArc($powerPenWhite, $arcRect, 125, 290)

    # Power top vertical neon bar
    $g.DrawLine($powerPenCyan, $cx, 120, $cx, 220)
    $g.DrawLine($powerPenWhite, $cx, 120, $cx, 220)

    # 3. Esports Golden Wings (Victory Wings)
    $goldBrushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 180, 83, 9))
    $goldBrushMain = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
    $goldBrushLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71))
    $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 254, 249, 195), 4)

    # Left Wing
    $leftWing = @(
        (New-Object System.Drawing.Point(420, 420)),
        (New-Object System.Drawing.Point(180, 230)),
        (New-Object System.Drawing.Point(90, 340)),
        (New-Object System.Drawing.Point(340, 510))
    )
    $g.FillPolygon($goldBrushDark, $leftWing)
    $g.DrawPolygon($goldPen, $leftWing)

    $leftWing2 = @(
        (New-Object System.Drawing.Point(400, 480)),
        (New-Object System.Drawing.Point(140, 430)),
        (New-Object System.Drawing.Point(120, 530)),
        (New-Object System.Drawing.Point(350, 590))
    )
    $g.FillPolygon($goldBrushMain, $leftWing2)
    $g.DrawPolygon($goldPen, $leftWing2)

    # Right Wing (Symmetric)
    $rightWing = @(
        (New-Object System.Drawing.Point(604, 420)),
        (New-Object System.Drawing.Point(844, 230)),
        (New-Object System.Drawing.Point(934, 340)),
        (New-Object System.Drawing.Point(684, 510))
    )
    $g.FillPolygon($goldBrushDark, $rightWing)
    $g.DrawPolygon($goldPen, $rightWing)

    $rightWing2 = @(
        (New-Object System.Drawing.Point(624, 480)),
        (New-Object System.Drawing.Point(884, 430)),
        (New-Object System.Drawing.Point(904, 530)),
        (New-Object System.Drawing.Point(674, 590))
    )
    $g.FillPolygon($goldBrushMain, $rightWing2)
    $g.DrawPolygon($goldPen, $rightWing2)

    # 4. The Royal GOAT Crown
    $crownBaseY = 510
    $crownPts = @(
        (New-Object System.Drawing.Point(300, ($crownBaseY - 20))),
        (New-Object System.Drawing.Point(270, ($crownBaseY - 140))),
        (New-Object System.Drawing.Point(370, ($crownBaseY - 70))),
        (New-Object System.Drawing.Point(410, ($crownBaseY - 210))),
        (New-Object System.Drawing.Point(470, ($crownBaseY - 80))),
        (New-Object System.Drawing.Point(512, ($crownBaseY - 280))),
        (New-Object System.Drawing.Point(554, ($crownBaseY - 80))),
        (New-Object System.Drawing.Point(614, ($crownBaseY - 210))),
        (New-Object System.Drawing.Point(654, ($crownBaseY - 70))),
        (New-Object System.Drawing.Point(754, ($crownBaseY - 140))),
        (New-Object System.Drawing.Point(724, ($crownBaseY - 20))),
        (New-Object System.Drawing.Point(512, ($crownBaseY + 40)))
    )
    # Crown Drop shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 0, 0, 0))
    $crownShadowPts = $crownPts | ForEach-Object { New-Object System.Drawing.Point(($_.X + 6), ($_.Y + 10)) }
    $g.FillPolygon($shadowBrush, $crownShadowPts)

    # Crown Body
    $g.FillPolygon($goldBrushMain, $crownPts)
    $g.DrawPolygon($goldPen, $crownPts)

    # Center Peak Highlight Facet
    $centerFacet = @(
        (New-Object System.Drawing.Point(512, ($crownBaseY - 280))),
        (New-Object System.Drawing.Point(470, ($crownBaseY - 80))),
        (New-Object System.Drawing.Point(512, ($crownBaseY + 40))),
        (New-Object System.Drawing.Point(554, ($crownBaseY - 80)))
    )
    $g.FillPolygon($goldBrushLight, $centerFacet)

    # Crown Jewels (Cyan Diamonds)
    $gemBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 14, 165, 233))
    $gemPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3)
    $gemPeaks = @(
        (New-Object System.Drawing.Point(270, ($crownBaseY - 140))),
        (New-Object System.Drawing.Point(410, ($crownBaseY - 210))),
        (New-Object System.Drawing.Point(512, ($crownBaseY - 280))),
        (New-Object System.Drawing.Point(614, ($crownBaseY - 210))),
        (New-Object System.Drawing.Point(754, ($crownBaseY - 140)))
    )
    foreach ($p in $gemPeaks) {
        $gw = if ($p.X -eq 512) { 20 } else { 14 }
        $dPts = @(
            (New-Object System.Drawing.Point($p.X, ($p.Y - $gw))),
            (New-Object System.Drawing.Point(($p.X + $gw), $p.Y)),
            (New-Object System.Drawing.Point($p.X, ($p.Y + $gw))),
            (New-Object System.Drawing.Point(($p.X - $gw), $p.Y))
        )
        $g.FillPolygon($gemBrush, $dPts)
        $g.DrawPolygon($gemPen, $dPts)
    }

    # Crown Base Pink Rubies
    $rubyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 236, 72, 153))
    foreach ($bx in @(380, 440, 512, 584, 644)) {
        $g.FillEllipse($rubyBrush, ($bx - 12), ($crownBaseY - 6), 24, 24)
        $g.DrawEllipse($gemPen, ($bx - 12), ($crownBaseY - 6), 24, 24)
    }

    # Crown GOAT Typography
    $fontFamily = New-Object System.Drawing.FontFamily("Malgun Gothic")
    $fontGoat = New-Object System.Drawing.Font($fontFamily, 44, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $goatRect = New-Object System.Drawing.RectangleF(312, ($crownBaseY - 125), 400, 70)
    $g.DrawString("GOAT", $fontGoat, $shadowBrush, [System.Drawing.RectangleF]::new(($goatRect.X + 3), ($goatRect.Y + 3), $goatRect.Width, $goatRect.Height), $sf)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString("GOAT", $fontGoat, $whiteBrush, $goatRect, $sf)

    # 5. Bottom Ribbon Banner Plate
    $bannerY = 740
    $bannerPts = @(
        (New-Object System.Drawing.Point(80, ($bannerY + 20))),
        (New-Object System.Drawing.Point(512, ($bannerY - 10))),
        (New-Object System.Drawing.Point(944, ($bannerY + 20))),
        (New-Object System.Drawing.Point(914, ($bannerY + 180))),
        (New-Object System.Drawing.Point(512, ($bannerY + 205))),
        (New-Object System.Drawing.Point(110, ($bannerY + 180)))
    )
    $bannerShadow = $bannerPts | ForEach-Object { New-Object System.Drawing.Point(($_.X + 6), ($_.Y + 8)) }
    $g.FillPolygon($shadowBrush, $bannerShadow)

    $plateBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 15, 23, 42))
    $g.FillPolygon($plateBrush, $bannerPts)
    $g.DrawPolygon($goldPen, $bannerPts)

    # Inner plate gold border
    $innerBannerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 245, 158, 11), 3)
    $g.DrawLine($innerBannerPen, 130, ($bannerY + 45), 894, ($bannerY + 45))
    $g.DrawLine($innerBannerPen, 130, ($bannerY + 160), 894, ($bannerY + 160))

    # Banner Subtext: ★ FROM ZERO TO GOAT ★
    $fontSub = New-Object System.Drawing.Font($fontFamily, 18, [System.Drawing.FontStyle]::Bold)
    $cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $subRect = New-Object System.Drawing.RectangleF(100, ($bannerY + 18), 824, 30)
    $g.DrawString("★  FROM ZERO TO GOAT  ★", $fontSub, $cyanBrush, $subRect, $sf)

    # Banner Main Text: safely decoded from base64
    $titleText = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("7Lyg6rmA7JeQIEdPQVTquYzsp4A="))
    $fontTitle = New-Object System.Drawing.Font($fontFamily, 50, [System.Drawing.FontStyle]::Bold)
    $titleRect = New-Object System.Drawing.RectangleF(80, ($bannerY + 68), 864, 85)
    $titleShadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 0, 0, 0))
    $titleGoldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
    
    $g.DrawString($titleText, $fontTitle, $titleShadowBrush, [System.Drawing.RectangleF]::new(($titleRect.X + 4), ($titleRect.Y + 4), $titleRect.Width, $titleRect.Height), $sf)
    $g.DrawString($titleText, $fontTitle, $titleGoldBrush, $titleRect, $sf)

    # Resize to final output size
    $finalBmp = New-Object System.Drawing.Bitmap($finalSize, $finalSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $fg = [System.Drawing.Graphics]::FromImage($finalBmp)
    $fg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $fg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $fg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $fg.DrawImage($bmp, 0, 0, $finalSize, $finalSize)

    $g.Dispose()
    $bmp.Dispose()
    $fg.Dispose()

    return $finalBmp
}

$baseDir = "C:\antigravity\pro-gamer"
$artDir = "C:\Users\livm2\.gemini\antigravity\brain\36ca6a7a-bcec-45de-bcf4-52e501097eee"

# 1. Generate 512x512
$icon512 = Create-GoatIcon 512
$icon512.Save("$baseDir\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Save("$baseDir\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
if (Test-Path "$baseDir\assets") {
    $icon512.Save("$baseDir\assets\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $icon512.Save("$baseDir\assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
}
$icon512.Save("$artDir\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Generate 192x192
$icon192 = Create-GoatIcon 192
$icon192.Save("$baseDir\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
if (Test-Path "$baseDir\assets") {
    $icon192.Save("$baseDir\assets\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
}
$icon192.Save("$artDir\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 3. Generate 64x64 favicon
$icon64 = Create-GoatIcon 64
$icon64.Save("$baseDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
if (Test-Path "$baseDir\assets") {
    $icon64.Save("$baseDir\assets\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
}
$icon64.Save("$artDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$icon512.Dispose()
$icon192.Dispose()
$icon64.Dispose()

Write-Output "SUCCESS: All app icons successfully generated and saved!"
