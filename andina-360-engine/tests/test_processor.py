"""
Pruebas automatizadas del motor de proyección y tiles multirresolución.
"""

import os
import shutil
import tempfile
import numpy as np
from PIL import Image

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "processor")))
from projection import equirectangular_to_cubemap, generate_tile_pyramid

def create_synthetic_equirectangular(width=1024, height=512) -> Image.Image:
    """Crea una imagen de prueba equirrectangular 2:1 con cuadrícula y gradiente."""
    data = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        for x in range(width):
            data[y, x, 0] = int((x / width) * 255)
            data[y, x, 1] = int((y / height) * 255)
            data[y, x, 2] = 128
    return Image.fromarray(data, mode="RGB")

def test_cubemap_generation():
    img = create_synthetic_equirectangular(1024, 512)
    faces = equirectangular_to_cubemap(img, face_size=256)

    assert len(faces) == 6, "Debe generar exactamente 6 caras cúbicas"
    for face_key in ['f', 'r', 'b', 'l', 'u', 'd']:
        assert face_key in faces, f"Falta la cara {face_key}"
        assert faces[face_key].size == (256, 256), f"Dimensiones incorrectas para cara {face_key}"
    print("[PASS] Generación de Cubemap verificada con éxito.")

def test_tile_pyramid_generation():
    img = create_synthetic_equirectangular(1024, 512)
    faces = equirectangular_to_cubemap(img, face_size=512)

    with tempfile.TemporaryDirectory() as tmp_dir:
        manifest = generate_tile_pyramid(faces, tmp_dir, tile_size=256)

        assert os.path.exists(os.path.join(tmp_dir, "preview.webp")), "Falta preview.webp"
        assert os.path.exists(os.path.join(tmp_dir, "nadir_raw.webp")), "Falta nadir_raw.webp para IA"
        assert len(manifest["levels"]) >= 1, "Debe tener al menos un nivel multirres"
        
        level_dir = os.path.join(tmp_dir, "tiles", "1", "f")
        assert os.path.exists(level_dir), f"Directorio de tiles {level_dir} no existe"
        assert os.path.exists(os.path.join(level_dir, "0_0.webp")), "Falta el tile 0_0.webp"

    print("[PASS] Pirámide de tiles multirresolución verificada con éxito.")

if __name__ == "__main__":
    print("[*] Iniciando tests unitarios del procesador 360...")
    test_cubemap_generation()
    test_tile_pyramid_generation()
    print("[+] Todos los tests del procesador completados exitosamente.")
