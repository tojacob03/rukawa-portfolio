"""Builds the two material tiles of the Off the clock passport:
public/off-the-clock/leather-burgundy.jpg (the cover) and
public/off-the-clock/paper-security.jpg (the pages).

Source: two CC0 materials from ambientCG, 1K-JPG downloads
    https://ambientcg.com/get?file=Leather037_1K-JPG.zip
    https://ambientcg.com/get?file=Paper001_1K-JPG.zip

Their colour maps are almost flat; the grain lives in the displacement map.
So each tile is lit from that height map (normals from its gradient, one
light from the top left) and tinted, which bakes the relief into a plain
JPEG. The gradients wrap around, so the tiles stay seamless.

Run with Pillow and NumPy installed:
    python tools/passport/bake_textures.py Leather037_1K-JPG.zip Paper001_1K-JPG.zip
"""

import io
import os
import sys
import zipfile

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "off-the-clock")
LIGHT = np.array((-0.55, -0.6, 0.58), dtype=np.float32)
SIZE = 512


def height_map(zip_path):
    """The displacement map of an ambientCG zip, square-cropped to SIZE."""
    with zipfile.ZipFile(zip_path) as z:
        name = next(n for n in z.namelist() if n.endswith("_Displacement.jpg"))
        im = Image.open(io.BytesIO(z.read(name))).convert("L")
    w, h = im.size
    s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((SIZE, SIZE), Image.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0


def bake(h, base_rgb, strength, ambient, diffuse, spec, out_name):
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5
    n = np.dstack((-dx * strength, -dy * strength, np.ones_like(h)))
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    light = LIGHT / np.linalg.norm(LIGHT)
    lambert = np.clip((n * light).sum(axis=2), 0, 1)
    half = light + np.array((0, 0, 1), dtype=np.float32)
    half /= np.linalg.norm(half)
    gloss = np.clip((n * half).sum(axis=2), 0, 1) ** 40
    rgb = np.array(base_rgb, dtype=np.float32) / 255.0
    img = np.clip(rgb[None, None, :] * (ambient + diffuse * lambert)[..., None] + spec * gloss[..., None], 0, 1)
    path = os.path.join(OUT, out_name)
    Image.fromarray((img * 255).astype(np.uint8)).save(path, quality=80, optimize=True)
    print(f"{os.path.relpath(path)}: {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    leather_zip, paper_zip = sys.argv[1:]
    bake(height_map(leather_zip), (112, 30, 44), strength=14, ambient=0.62, diffuse=0.55, spec=0.10, out_name="leather-burgundy.jpg")
    bake(height_map(paper_zip), (238, 242, 245), strength=5, ambient=0.93, diffuse=0.1, spec=0.0, out_name="paper-security.jpg")
