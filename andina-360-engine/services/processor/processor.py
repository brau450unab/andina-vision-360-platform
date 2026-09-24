import json
import os
import shutil
import sys
import tempfile
from PIL import Image

from projection import equirectangular_to_cubemap, generate_tile_pyramid

def process_panorama_local(
    input_path: str,
    output_dir: str,
    face_size: int = 2048,
    tile_size: int = 512
) -> dict:
    with Image.open(input_path) as img:
        w, h = img.size
        target_face_size = min(face_size, w // 4)
        target_face_size = max(512, (target_face_size // 512) * 512)
        cube_faces = equirectangular_to_cubemap(img, face_size=target_face_size)

    manifest = generate_tile_pyramid(cube_faces, output_dir, tile_size=tile_size)
    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    return manifest

def run_cloud_job():
    from google.cloud import firestore, storage

    raw_bucket_name = os.environ.get("RAW_BUCKET")
    tiles_bucket_name = os.environ.get("TILES_BUCKET")
    raw_object_path = os.environ.get("RAW_OBJECT_PATH")
    tour_id = os.environ.get("TOUR_ID")
    scene_id = os.environ.get("SCENE_ID")

    if not all([raw_bucket_name, tiles_bucket_name, raw_object_path, tour_id, scene_id]):
        return

    storage_client = storage.Client()
    db = firestore.Client()

    raw_bucket = storage_client.bucket(raw_bucket_name)
    tiles_bucket = storage_client.bucket(tiles_bucket_name)

    scene_ref = db.collection("tours").document(tour_id).collection("scenes").document(scene_id)
    scene_ref.update({"status": "processing", "progress": 10})

    with tempfile.TemporaryDirectory() as tmp_dir:
        local_raw_path = os.path.join(tmp_dir, "raw_input.jpg")
        output_tiles_dir = os.path.join(tmp_dir, "output")

        blob = raw_bucket.blob(raw_object_path)
        blob.download_to_filename(local_raw_path)
        scene_ref.update({"progress": 30})

        manifest = process_panorama_local(local_raw_path, output_tiles_dir)
        scene_ref.update({"progress": 70})

        dest_prefix = f"tours/{tour_id}/scenes/{scene_id}"

        for root, _, files in os.walk(output_tiles_dir):
            for file in files:
                local_file = os.path.join(root, file)
                rel_path = os.path.relpath(local_file, output_tiles_dir).replace("\\", "/")
                dest_blob_path = f"{dest_prefix}/{rel_path}"

                content_type = "image/webp" if file.endswith(".webp") else "application/json"
                cache_control = "public, max-age=31536000" if file.endswith(".webp") else "public, max-age=3600"

                tile_blob = tiles_bucket.blob(dest_blob_path)
                tile_blob.upload_from_filename(
                    local_file,
                    content_type=content_type
                )
                tile_blob.cache_control = cache_control
                tile_blob.patch()

        cdn_base_url = f"https://storage.googleapis.com/{tiles_bucket_name}/{dest_prefix}"
        scene_ref.update({
            "status": "ready",
            "progress": 100,
            "manifest": manifest,
            "tilesBaseUrl": cdn_base_url,
            "previewUrl": f"{cdn_base_url}/preview.webp",
            "nadirUrl": f"{cdn_base_url}/nadir_raw.webp"
        })

if __name__ == "__main__":
    if len(sys.argv) > 2:
        inp = sys.argv[1]
        out = sys.argv[2]
        size = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
        process_panorama_local(inp, out, face_size=size)
    else:
        run_cloud_job()
