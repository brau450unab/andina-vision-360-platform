"""
Módulo de proyección y fragmentación multirresolución para panorámicas 360° de dron.
Convierte proyecciones equirrectangulares (2:1) en mapas cúbicos y pirámides de mosaicos (tiles).
"""

import math
import os
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = 200_000_000

FACES = ['f', 'r', 'b', 'l', 'u', 'd']  # Front, Right, Back, Left, Up, Down

def _get_cube_face_coords(face: str, face_size: int):
    grid = np.linspace(-1.0, 1.0, face_size)
    u, v = np.meshgrid(grid, -grid)
    ones = np.ones_like(u)

    if face == 'f':
        return np.stack([u, v, ones], axis=-1)
    elif face == 'r':
        return np.stack([ones, v, -u], axis=-1)
    elif face == 'b':
        return np.stack([-u, v, -ones], axis=-1)
    elif face == 'l':
        return np.stack([-ones, v, u], axis=-1)
    elif face == 'u':
        return np.stack([u, ones, -v], axis=-1)
    elif face == 'd':
        return np.stack([u, -ones, v], axis=-1)
    else:
        raise ValueError(f"Cara desconocida: {face}")

def equirectangular_to_cubemap(img: Image.Image, face_size: int = 2048) -> dict[str, Image.Image]:
    img_rgb = img.convert("RGB")
    src_w, src_h = img_rgb.size
    src_data = np.array(img_rgb)

    cube_faces = {}

    for face in FACES:
        vecs = _get_cube_face_coords(face, face_size)
        x = vecs[..., 0]
        y = vecs[..., 1]
        z = vecs[..., 2]

        norm = np.sqrt(x**2 + y**2 + z**2)
        norm_x, norm_y, norm_z = x / norm, y / norm, z / norm

        theta = np.arctan2(norm_x, norm_z)
        phi = np.arcsin(norm_y)

        u_px = ((theta / (2 * math.pi) + 0.5) * (src_w - 1)).astype(np.float32)
        v_px = (((-phi / math.pi) + 0.5) * (src_h - 1)).astype(np.float32)

        u0 = np.floor(u_px).astype(int)
        u1 = np.clip(u0 + 1, 0, src_w - 1)
        v0 = np.floor(v_px).astype(int)
        v1 = np.clip(v0 + 1, 0, src_h - 1)

        wa = (u1 - u_px) * (v1 - v_px)
        wb = (u_px - u0) * (v1 - v_px)
        wc = (u1 - u_px) * (v_px - v0)
        wd = (u_px - u0) * (v_px - v0)

        face_pixels = (
            src_data[v0, u0] * wa[..., None] +
            src_data[v0, u1] * wb[..., None] +
            src_data[v1, u0] * wc[..., None] +
            src_data[v1, u1] * wd[..., None]
        ).astype(np.uint8)

        cube_faces[face] = Image.fromarray(face_pixels, mode="RGB")

    return cube_faces

def generate_tile_pyramid(
    cube_faces: dict[str, Image.Image],
    output_dir: str,
    tile_size: int = 512
) -> dict:
    os.makedirs(output_dir, exist_ok=True)
    tiles_base_dir = os.path.join(output_dir, "tiles")
    os.makedirs(tiles_base_dir, exist_ok=True)

    max_face_size = cube_faces['f'].size[0]
    
    levels_config = []
    current_size = tile_size
    level = 1

    while current_size <= max_face_size:
        levels_config.append({"level": level, "size": current_size})
        current_size *= 2
        level += 1

    if not levels_config:
        levels_config = [{"level": 1, "size": tile_size}]

    manifest_levels = []

    for cfg in levels_config:
        lvl = cfg["level"]
        lvl_size = cfg["size"]
        num_tiles = lvl_size // tile_size

        manifest_levels.append({
            "level": lvl,
            "tileSize": tile_size,
            "size": lvl_size,
            "tilesAcross": num_tiles,
            "quality": "low" if lvl == 1 else ("medium" if lvl == 2 else ("high" if lvl == 3 else "ultra"))
        })

        for face, img in cube_faces.items():
            face_dir = os.path.join(tiles_base_dir, str(lvl), face)
            os.makedirs(face_dir, exist_ok=True)

            resized_face = img.resize((lvl_size, lvl_size), Image.Resampling.LANCZOS)

            for row in range(num_tiles):
                for col in range(num_tiles):
                    left = col * tile_size
                    top = row * tile_size
                    right = left + tile_size
                    bottom = top + tile_size

                    tile = resized_face.crop((left, top, right, bottom))
                    tile_path = os.path.join(face_dir, f"{row}_{col}.webp")
                    tile.save(tile_path, "WEBP", quality=85, method=4)

    preview = cube_faces['f'].resize((256, 256), Image.Resampling.BILINEAR)
    preview_path = os.path.join(output_dir, "preview.webp")
    preview.save(preview_path, "WEBP", quality=60)

    nadir_path = os.path.join(output_dir, "nadir_raw.webp")
    cube_faces['d'].save(nadir_path, "WEBP", quality=95)

    return {
        "tileSize": tile_size,
        "maxFaceSize": max_face_size,
        "levels": manifest_levels,
        "faces": FACES
    }
