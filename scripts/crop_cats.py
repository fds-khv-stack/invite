"""Режет присланную картинку с котиками на 4 отдельных файла.
Фон не трогаем: белый прямоугольник на странице живёт внутри белого «стикера»,
поэтому швов и ореолов нет."""
import os
from PIL import Image

SRC = r"C:\Users\Home\AppData\Roaming\Hermes\composer-images\image_bb4502.png"
OUT = r"G:\Мой диск\My_Project\invite\img"
NAMES = [["cat-play", "cat-love"], ["cat-lie", "cat-nibble"]]

os.makedirs(OUT, exist_ok=True)
im = Image.open(SRC).convert("RGB")
W, H = im.size
print("исходник:", W, H)

for r in range(2):
    for c in range(2):
        tile = im.crop((c * W // 2, r * H // 2, (c + 1) * W // 2, (r + 1) * H // 2))
        # обрезаем лишнее белое поле вокруг рисунка (пиксели не меняем)
        grey = tile.convert("L").point(lambda v: 255 if v < 246 else 0)
        box = grey.getbbox()
        if box:
            pad = 6
            box = (max(0, box[0] - pad), max(0, box[1] - pad),
                   min(tile.width, box[2] + pad), min(tile.height, box[3] + pad))
            tile = tile.crop(box)
        tile = tile.resize((tile.width * 2, tile.height * 2), Image.LANCZOS)  # 2x для ретины
        name = NAMES[r][c] + ".webp"
        path = os.path.join(OUT, name)
        tile.save(path, "WEBP", quality=88, method=6)
        print(f"  {name}: {tile.width}x{tile.height}, {os.path.getsize(path) // 1024} КБ")
