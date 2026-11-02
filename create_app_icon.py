# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

def create_pro_gamer_icon():
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Squircle with Dark Navy/Black Gradient
    # Create mask for rounded rectangle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_radius = 110
    mask_draw.rounded_rectangle([10, 10, size - 10, size - 10], radius=corner_radius, fill=255)

    # Base gradient background
    bg = Image.new("RGBA", (size, size), (11, 15, 28, 255))
    bg_draw = ImageDraw.Draw(bg)
    # Radial dark blue to deep violet gradient
    for r in range(260, 0, -2):
        alpha = int(255 * (1 - (r / 260) ** 1.3))
        # Golden & Electric Blue ambient glow in center
        color = (
            int(15 + 40 * (1 - r/260)),
            int(22 + 65 * (1 - r/260)),
            int(45 + 120 * (1 - r/260)),
            255
        )
        bg_draw.ellipse([size//2 - r, size//2 - r - 20, size//2 + r, size//2 + r - 20], fill=color)

    # Cyber grid / speed lines in background
    for x in range(40, size, 40):
        bg_draw.line([(x, 10), (x, size - 10)], fill=(30, 45, 80, 45), width=1)
    for y in range(40, size, 40):
        bg_draw.line([(10, y), (size - 10, y)], fill=(30, 45, 80, 45), width=1)

    img.paste(bg, (0, 0), mask)

    # 2. Golden / Cyan Beveled Shield Rim
    draw = ImageDraw.Draw(img)
    # Outer golden glowing rim
    draw.rounded_rectangle([12, 12, size - 12, size - 12], radius=corner_radius, outline=(245, 158, 11, 230), width=6)
    draw.rounded_rectangle([18, 18, size - 18, size - 18], radius=corner_radius - 6, outline=(253, 224, 71, 140), width=2)
    # Inner tech accent rim
    draw.rounded_rectangle([24, 24, size - 24, size - 24], radius=corner_radius - 12, outline=(59, 130, 246, 120), width=2)

    # 3. Central Emblem: Massive Golden Hammer striking with glowing sparks & Trophy Wings
    # Hammer Head (Metallic Gold beveled polygons)
    center_x = size // 2
    center_y = size // 2 - 25

    # Glowing back-aura behind the hammer
    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    for gr in range(140, 20, -10):
        g_alpha = int(35 * (1 - gr/140))
        glow_draw.ellipse([center_x - gr, center_y - gr, center_x + gr, center_y + gr], fill=(250, 204, 21, g_alpha))
    img = Image.alpha_composite(img, glow_layer)
    draw = ImageDraw.Draw(img)

    # Golden Trophy Wings (Esports Champion Vibe)
    wing_color_outer = (245, 158, 11, 220)
    wing_color_inner = (253, 224, 71, 255)
    
    # Left Wing feathers
    draw.polygon([(center_x - 45, center_y - 20), (center_x - 140, center_y - 95), (center_x - 175, center_y - 45), (center_x - 85, center_y + 20)], fill=wing_color_outer)
    draw.polygon([(center_x - 45, center_y - 15), (center_x - 130, center_y - 85), (center_x - 160, center_y - 40), (center_x - 80, center_y + 15)], fill=wing_color_inner)
    
    draw.polygon([(center_x - 50, center_y + 15), (center_x - 155, center_y - 10), (center_x - 165, center_y + 40), (center_x - 80, center_y + 65)], fill=wing_color_outer)
    draw.polygon([(center_x - 50, center_y + 20), (center_x - 145, center_y - 5), (center_x - 155, center_y + 35), (center_x - 75, center_y + 60)], fill=wing_color_inner)

    # Right Wing feathers (Symmetric)
    draw.polygon([(center_x + 45, center_y - 20), (center_x + 140, center_y - 95), (center_x + 175, center_y - 45), (center_x + 85, center_y + 20)], fill=wing_color_outer)
    draw.polygon([(center_x + 45, center_y - 15), (center_x + 130, center_y - 85), (center_x + 160, center_y - 40), (center_x + 80, center_y + 15)], fill=wing_color_inner)

    draw.polygon([(center_x + 50, center_y + 15), (center_x + 155, center_y - 10), (center_x + 165, center_y + 40), (center_x + 80, center_y + 65)], fill=wing_color_outer)
    draw.polygon([(center_x + 50, center_y + 20), (center_x + 145, center_y - 5), (center_x + 155, center_y + 35), (center_x + 75, center_y + 60)], fill=wing_color_inner)

    # The Legendary Hammer
    # Hammer Handle (Sleek dark obsidian steel with gold rings)
    handle_top = (center_x, center_y - 30)
    handle_bot = (center_x, center_y + 130)
    draw.line([handle_top, handle_bot], fill=(45, 55, 72, 255), width=18)
    draw.line([handle_top, handle_bot], fill=(203, 213, 225, 255), width=8) # Silver metallic highlight
    # Gold grip rings
    for ry in range(center_y + 20, center_y + 120, 20):
        draw.line([(center_x - 10, ry), (center_x + 10, ry)], fill=(245, 158, 11, 255), width=4)
    # Handle pommel (Bottom jewel)
    draw.polygon([(center_x - 14, center_y + 130), (center_x + 14, center_y + 130), (center_x, center_y + 148)], fill=(234, 179, 8, 255))

    # Hammer Head (Forged Steel & Gold)
    hw, hh = 75, 42
    hx, hy = center_x, center_y - 55
    # Beveled 3D block
    # Main front face
    draw.rectangle([hx - hw, hy - hh, hx + hw, hy + hh], fill=(245, 158, 11, 255), outline=(254, 240, 138, 255), width=4)
    # Inner cyber core (Glowing Cyan power cell)
    draw.rectangle([hx - hw + 16, hy - hh + 12, hx + hw - 16, hy + hh - 12], fill=(14, 165, 233, 255), outline=(56, 189, 248, 255), width=3)
    # Energy crack in core
    draw.line([(hx - 35, hy), (hx - 10, hy - 8), (hx + 10, hy + 8), (hx + 35, hy)], fill=(255, 255, 255, 255), width=3)

    # Striking Impact shockwave & sparkles
    spark_color = (254, 240, 138, 255)
    for angle in [0, 30, 60, 120, 150, 180, 210, 240, 300, 330]:
        rad = math.radians(angle)
        dist = 90
        sx = int(center_x + math.cos(rad) * dist)
        sy = int(hy + math.sin(rad) * (dist * 0.7))
        draw.polygon([(sx, sy - 8), (sx + 8, sy), (sx, sy + 8), (sx - 8, sy)], fill=spark_color)

    # 4. Ribbon / Banner Plate at Bottom
    by = size - 120
    draw.polygon([
        (40, by + 10), (center_x, by - 5), (size - 40, by + 10),
        (size - 30, by + 65), (center_x, by + 75), (30, by + 65)
    ], fill=(15, 23, 42, 245), outline=(234, 179, 8, 255), width=4)

    # Banner inner gold bar
    draw.line([(60, by + 20), (size - 60, by + 20)], fill=(245, 158, 11, 200), width=2)
    draw.line([(55, by + 58), (size - 55, by + 58)], fill=(245, 158, 11, 200), width=2)

    # Typography: "PRO GAMER" / "프로의 길"
    try:
        font_path = "C:/Windows/Fonts/malgunbd.ttf"
        font_main = ImageFont.truetype(font_path, 34)
        font_sub = ImageFont.truetype(font_path, 15)
        has_font = True
    except:
        has_font = False

    if has_font:
        # Title "프로의 길" with gold shadow & white-gold text
        txt = "프로의 길"
        # Shadow
        draw.text((center_x + 2, by + 40), txt, font=font_main, fill=(0, 0, 0, 240), anchor="mm")
        # Main text
        draw.text((center_x, by + 38), txt, font=font_main, fill=(255, 230, 100, 255), anchor="mm")
        
        # Sub title "PRO ROAD · BONDS"
        draw.text((center_x, by + 15), "★  PRO ROAD  ★", font=font_sub, fill=(56, 189, 248, 255), anchor="mm")
    else:
        # Fallback text
        draw.text((center_x, by + 35), "PRO ROAD", fill=(255, 215, 0, 255), anchor="mm")

    return img

if __name__ == "__main__":
    icon_512 = create_pro_gamer_icon()
    base_dir = "d:/antigravity/pro-gamer"
    
    # Save 512x512
    icon_512.save(os.path.join(base_dir, "icon-512.png"))
    icon_512.save(os.path.join(base_dir, "icon.png"))
    icon_512.save(os.path.join(base_dir, "assets", "icon.png"))
    icon_512.save(os.path.join(base_dir, "assets", "icon-512.png"))

    # Save 192x192
    icon_192 = icon_512.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(base_dir, "icon-192.png"))
    icon_192.save(os.path.join(base_dir, "assets", "icon-192.png"))

    # Save favicon
    icon_64 = icon_512.resize((64, 64), Image.Resampling.LANCZOS)
    icon_64.save(os.path.join(base_dir, "favicon.png"))
    icon_64.save(os.path.join(base_dir, "assets", "favicon.png"))

    # Copy to artifacts directory
    art_dir = "C:/Users/user/.gemini/antigravity/brain/17ba901c-f92b-4a0f-8c20-604ed502baa4"
    icon_512.save(os.path.join(art_dir, "icon-512.png"))
    icon_192.save(os.path.join(art_dir, "icon-192.png"))

    print("Successfully generated all app icon resolutions!")
