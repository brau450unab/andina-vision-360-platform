"""
Rutas para la gestión de tours virtuales, escenas, subida de capturas y hotspots interactivos.
"""

import os
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import storage

from app.models import (
    Tour, Scene, Hotspot, CreateTourRequest, CreateSceneRequest,
    UploadUrlResponse, TriggerProcessRequest
)
from app.auth import get_current_user_and_tenant

router = APIRouter(prefix="/api/v1", tags=["Tours"])

_LOCAL_DB: dict[str, Tour] = {}

def get_db():
    try:
        from google.cloud import firestore
        return firestore.Client()
    except Exception:
        return None

@router.post("/tours", response_model=Tour)
def create_tour(req: CreateTourRequest, user: dict = Depends(get_current_user_and_tenant)):
    tour_id = f"tour_{uuid.uuid4().hex[:10]}"
    now = datetime.datetime.utcnow().isoformat()

    tour = Tour(
        id=tour_id,
        tenant_id=user["tenant_id"],
        title=req.title,
        description=req.description,
        is_public=req.is_public,
        password_protected=bool(req.password),
        allow_gyroscope=req.allow_gyroscope,
        default_quality=req.default_quality,
        created_at=now,
        updated_at=now,
        scenes=[]
    )

    db = get_db()
    if db:
        db.collection("tours").document(tour_id).set(tour.model_dump())
    else:
        _LOCAL_DB[tour_id] = tour

    return tour

@router.get("/tours", response_model=List[Tour])
def list_tours(user: dict = Depends(get_current_user_and_tenant)):
    db = get_db()
    if db:
        docs = db.collection("tours").where("tenant_id", "==", user["tenant_id"]).stream()
        return [Tour(**d.to_dict()) for d in docs]
    else:
        return [t for t in _LOCAL_DB.values() if t.tenant_id == user["tenant_id"]]

@router.get("/tours/{tour_id}", response_model=Tour)
def get_tour(tour_id: str):
    db = get_db()
    if db:
        doc = db.collection("tours").document(tour_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Tour no encontrado")
        return Tour(**doc.to_dict())
    else:
        if tour_id not in _LOCAL_DB:
            raise HTTPException(status_code=404, detail="Tour no encontrado")
        return _LOCAL_DB[tour_id]

@router.post("/tours/{tour_id}/scenes", response_model=UploadUrlResponse)
def add_scene_and_get_upload_url(
    tour_id: str,
    req: CreateSceneRequest,
    user: dict = Depends(get_current_user_and_tenant)
):
    """
    Registra una escena y genera una Signed URL de Google Cloud Storage
    para que el cliente suba directamente el archivo panorámico de alta resolución.
    """
    tour = get_tour(tour_id)
    scene_id = f"scene_{uuid.uuid4().hex[:8]}"
    raw_bucket_name = os.environ.get("RAW_BUCKET", "mock-andina-panoramas-raw")
    gcs_object_path = f"tours/{tour_id}/scenes/{scene_id}/raw.jpg"

    upload_url = f"https://storage.googleapis.com/{raw_bucket_name}/{gcs_object_path}"
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(raw_bucket_name)
        blob = bucket.blob(gcs_object_path)
        upload_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=15),
            method="PUT",
            content_type="image/jpeg"
        )
    except Exception as e:
        print(f"[!] Aviso: No se pudo generar GCS Signed URL real ({e}). Usando URL directa.")

    new_scene = Scene(
        id=scene_id,
        title=req.title,
        capture_device=req.capture_device,
        default_yaw=req.default_yaw,
        default_pitch=req.default_pitch,
        raw_object_path=gcs_object_path,
        status="pending_upload",
        hotspots=[]
    )

    tour.scenes.append(new_scene)
    if not tour.first_scene_id:
        tour.first_scene_id = scene_id

    db = get_db()
    if db:
        db.collection("tours").document(tour_id).set(tour.model_dump())
    else:
        _LOCAL_DB[tour_id] = tour

    return UploadUrlResponse(
        upload_url=upload_url,
        gcs_object_path=gcs_object_path,
        scene_id=scene_id,
        expires_in_seconds=900
    )

@router.post("/tours/{tour_id}/scenes/{scene_id}/hotspots", response_model=Scene)
def update_scene_hotspots(
    tour_id: str,
    scene_id: str,
    hotspots: List[Hotspot],
    user: dict = Depends(get_current_user_and_tenant)
):
    tour = get_tour(tour_id)
    target_scene = next((s for s in tour.scenes if s.id == scene_id), None)
    if not target_scene:
        raise HTTPException(status_code=404, detail="Escena no encontrada")

    target_scene.hotspots = hotspots

    db = get_db()
    if db:
        db.collection("tours").document(tour_id).set(tour.model_dump())
    else:
        _LOCAL_DB[tour_id] = tour

    return target_scene

@router.get("/embed/{tour_id}")
def get_embed_config(tour_id: str):
    tour = get_tour(tour_id)
    return {
        "id": tour.id,
        "title": tour.title,
        "allowGyroscope": tour.allow_gyroscope,
        "firstSceneId": tour.first_scene_id,
        "defaultQuality": tour.default_quality,
        "scenes": [s.model_dump() for s in tour.scenes if s.status in ["ready", "pending_upload"]]
    }
