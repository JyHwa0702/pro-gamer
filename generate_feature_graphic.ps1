Add-Type -AssemblyName System.Drawing

$width = 1024
$height = 500

$bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Background Gradient
$bgP1 = New-Object System.Drawing.Point(0, 0)
$bgP2 = New-Object System.Drawing.Point($width, $height)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bgP1, $bgP2,
    [System.Drawing.Color]::FromArgb(8, 12, 24),
    [System.Drawing.Color]::FromArgb(28, 16, 56)
)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# 2. Glowing Halo Accents
$centerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$centerPath.AddEllipse(212, -100, 600, 600)
$haloBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($centerPath)
$haloBrush.CenterColor = [System.Drawing.Color]::FromArgb(100, 139, 92, 246)
$haloBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 8, 12, 24))
$g.FillPath($haloBrush, $centerPath)

# Gold bottom glow
$goldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$goldPath.AddEllipse(312, 330, 400, 300)
$goldGlow = New-Object System.Drawing.Drawing2D.PathGradientBrush($goldPath)
$goldGlow.CenterColor = [System.Drawing.Color]::FromArgb(90, 245, 158, 11)
$goldGlow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 8, 12, 24))
$g.FillPath($goldGlow, $goldPath)

# 3. Outer Neon Border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 245, 158, 11), 3)
$g.DrawRectangle($borderPen, 14, 14, ($width - 28), ($height - 28))

# 4. Fonts
$fontFamilySegoe = New-Object System.Drawing.FontFamily("Segoe UI")
$fontFamilyMalgun = New-Object System.Drawing.FontFamily("Malgun Gothic")

$tagFont = New-Object System.Drawing.Font($fontFamilySegoe, 13, [System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font($fontFamilyMalgun, 48, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font($fontFamilyMalgun, 18, [System.Drawing.FontStyle]::Bold)
$badgeFont = New-Object System.Drawing.Font($fontFamilySegoe, 12, [System.Drawing.FontStyle]::Bold)
$calloutFont = New-Object System.Drawing.Font($fontFamilySegoe, 11, [System.Drawing.FontStyle]::Regular)

$tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 204, 21))
$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center

# Header Tag
$g.DrawString("◆ E-SPORTS CAREER & DATING SIMULATION ◆", $tagFont, $tagBrush, ($width / 2), 60, $sfCenter)

# Main Title: "켠김에 GOAT까지"
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 0, 0, 0))
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(253, 224, 71))

$g.DrawString("켠김에 GOAT까지", $titleFont, $shadowBrush, (($width / 2) + 4), 118, $sfCenter)
$g.DrawString("켠김에 GOAT까지", $titleFont, $goldBrush, ($width / 2), 115, $sfCenter)

# Subtitle
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 232, 240))
$g.DrawString("흙수저에서 LCK·월즈 전설, 그리고 세기의 사랑까지", $subFont, $subBrush, ($width / 2), 220, $sfCenter)

# Badges
function DrawBadge($x, $y, $w, $h, $text, $accentColor) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 18, 22, 40))
    $pen = New-Object System.Drawing.Pen($accentColor, 1.5)
    $g.FillRectangle($fillBrush, $rect)
    $g.DrawRectangle($pen, $rect)

    $bBrush = New-Object System.Drawing.SolidBrush($accentColor)
    $sfBadge = New-Object System.Drawing.StringFormat
    $sfBadge.Alignment = [System.Drawing.StringAlignment]::Center
    $sfBadge.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($text, $badgeFont, $bBrush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $sfBadge)
}

DrawBadge 100 300 190 52 "🏆 LCK & WORLDS" ([System.Drawing.Color]::FromArgb(253, 224, 71))
DrawBadge 310 300 190 52 "🇰🇷 아시안게임 금메달" ([System.Drawing.Color]::FromArgb(56, 189, 248))
DrawBadge 520 300 190 52 "💍 13인 히로인 결혼" ([System.Drawing.Color]::FromArgb(244, 114, 182))
DrawBadge 730 300 190 52 "👑 구단주 시뮬레이터" ([System.Drawing.Color]::FromArgb(168, 85, 247))

# Bottom Callout
$calloutBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString("10-YEAR EXPANSIVE CAREER · OFFICIAL GOOGLE PLAY RELEASE", $calloutFont, $calloutBrush, ($width / 2), 425, $sfCenter)

# Save
$outPath = "c:\antigravity\pro-gamer\feature-graphic.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$artPath = "C:\Users\livm2\.gemini\antigravity\brain\36ca6a7a-bcec-45de-bcf4-52e501097eee\feature-graphic.png"
$bmp.Save($artPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Host "SUCCESS: Generated 1024x500 Feature Graphic at $outPath"
