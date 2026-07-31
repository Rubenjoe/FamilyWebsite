import os
from PIL import Image

def generate_icons():
    logo_path = "public/images/logo.png"
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found.")
        return
        
    img = Image.open(logo_path)
    print("Loaded original logo of size:", img.size)
    
    # 1. Crop to the top section containing the circular emblem
    # Based on our vertical profile, the emblem resides in y-range 0 to 352
    # We crop the emblem with horizontal bounds to ensure we capture it
    top_section = img.crop((50, 0, 450, 352))
    
    # 2. Find tight bounding box of alpha channel in the cropped emblem
    bbox = top_section.getbbox()
    if bbox:
        emblem = top_section.crop(bbox)
        print("Emblem tight bounding box cropped to size:", emblem.size)
    else:
        emblem = top_section
        print("No alpha bbox found, using full cropped section.")
        
    # 3. Center the emblem inside a transparent square
    w, h = emblem.size
    max_dim = max(w, h)
    square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    offset = ((max_dim - w) // 2, (max_dim - h) // 2)
    square.paste(emblem, offset)
    print("Emblem centered in square of size:", square.size)
    
    # 4. Generate app/favicon.ico containing 16x16, 32x32, and 48x48 sizes
    os.makedirs("app", exist_ok=True)
    square.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("Saved app/favicon.ico with sizes: 16x16, 32x32, 48x48")
    
    # 5. Generate app/icon.png (high-res PNG favicon)
    icon_png = square.resize((512, 512), Image.Resampling.LANCZOS)
    icon_png.save("app/icon.png", format="PNG")
    print("Saved app/icon.png (512x512)")
    
    # 6. Generate app/apple-icon.png (Apple touch icon)
    apple_icon = square.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save("app/apple-icon.png", format="PNG")
    print("Saved app/apple-icon.png (180x180)")
    
    # 7. Generate app/opengraph-image.png (Open Graph image)
    # 1200x630 background with the site bg color #fbf9f4
    og_bg = Image.new("RGBA", (1200, 630), (251, 249, 244, 255))
    emblem_og = square.resize((400, 400), Image.Resampling.LANCZOS)
    offset_x = (1200 - 400) // 2
    offset_y = (630 - 400) // 2
    og_bg.paste(emblem_og, (offset_x, offset_y), emblem_og)
    # Save as RGB to avoid transparency issues in social card display
    og_bg.convert("RGB").save("app/opengraph-image.png", format="PNG")
    print("Saved app/opengraph-image.png (1200x630)")

if __name__ == "__main__":
    generate_icons()
