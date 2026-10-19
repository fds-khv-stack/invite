"""Вырезает 4 котика из присланной картинки: убирает белый фон (заливка от краёв)
и сохраняет PNG с прозрачностью в img/."""
import os
from PIL import Image, ImageDraw

SRC = r"C:\Users\Home\AppData\Roaming\Hermes\composer-images\image_bb4502.png"
OUT = r"G:\Мой диск\My_Project\invite\img"
NAMES = [["cat-play", "cat-love"], ["cat-lie", "cat-nibble"]]  # [ряд][колонка]

os.makedirs(OUT, exist_ok=True)
im = Image.open(SRC).convert("RGB")
W, H = im.size
print("исходник:", W, H)

for r in range(2):
    for c in range(2):
        box = (c * W // 2, r * H // 2, (c + 1) * W // 2, (r + 1) * H // 2)
        tile = im.crop(box).convert("RGBA")
        # рамка белого по краям, чтобы заливка не задела рисунок
        pad = 10
        canvas = Image.new("RGBA", (tile.width + pad * 2, tile.height + pad * 2), (255, 255, 255, 255))
        canvas.paste(tile, (pad, pad))

        MAGIC = (255, 0, 255, 255)
        for pt in [(0, 0), (canvas.width - 1, 0), (0, canvas.height - 1), (canvas.width - 1, canvas.height - 1)]:
            ImageDraw.floodfill(canvas, pt, MAGIC, thresh=38)

        px = canvas.load()
        for y in range(canvas.height):
            for x in range(canvas.width):
                pr, pg, pb, pa = px[x, y]
                if pr > 205 and pg < 75 and pb > 205:      # только залитый фон
                    px[x, y] = (255, 255, 255, 0)

        bbox = canvas.getbbox()
        if bbox:
            canvas = canvas.crop(bbox)
        name = NAMES[r][c] + ".png"
        path = os.path.join(OUT, name)
        canvas.save(path, optimize=True)
        print(f"  {name}: {canvas.width}x{canvas.height}, {os.path.getsize(path)//1024} КБ")
