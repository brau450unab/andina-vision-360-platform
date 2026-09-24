from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class HotspotType(str, Enum):
    SCENE_LINK = "scene_link"
    INFO_POPUP = "info_popup"

class QualityLevel(str, Enum):
    AUTO = "auto"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    ULTRA = "ultra"

class Hotspot(BaseModel):
    id: str = Field(...)
    type: HotspotType = Field(default=HotspotType.SCENE_LINK)
    yaw: float = Field(...)
    pitch: float = Field(...)
    tooltip: Optional[str] = None
    target_scene_id: Optional[str] = None
    target_yaw: Optional[float] = 0.0
    target_pitch: Optional[float] = 0.0
    title: Optional[str] = None
    description: Optional[str] = None
    youtube_video_id: Optional[str] = None
    drive_url: Optional[str] = None
    drive_label: Optional[str] = "Ver recurso en Google Drive"

class Scene(BaseModel):
    id: str
    title: str
    capture_device: str = "DJI Drone"
    status: str = "pending_upload"
    progress: int = 0
    default_yaw: float = 0.0
    default_pitch: float = 0.0
    fov_min: float = 30.0
    fov_max: float = 110.0
    default_fov: float = 75.0
    raw_object_path: Optional[str] = None
    tiles_base_url: Optional[str] = None
    preview_url: Optional[str] = None
    nadir_url: Optional[str] = None
    manifest: Optional[Dict[str, Any]] = None
    hotspots: List[Hotspot] = []

class Tour(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str] = None
    is_public: bool = True
    password_protected: bool = False
    first_scene_id: Optional[str] = None
    allow_gyroscope: bool = True
    default_quality: QualityLevel = QualityLevel.AUTO
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    scenes: List[Scene] = []

class CreateTourRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    is_public: bool = True
    password: Optional[str] = None
    allow_gyroscope: bool = True
    default_quality: QualityLevel = QualityLevel.AUTO

class CreateSceneRequest(BaseModel):
    title: str
    capture_device: Optional[str] = "DJI Drone"
    default_yaw: Optional[float] = 0.0
    default_pitch: Optional[float] = 0.0

class UploadUrlResponse(BaseModel):
    upload_url: str
    gcs_object_path: str
    scene_id: str
    expires_in_seconds: int = 900

class TriggerProcessRequest(BaseModel):
    scene_id: str

class NadirPatchRequest(BaseModel):
    scene_id: str
    prompt: Optional[str] = "Seamless terrain texture blending, remove drone shadow and equipment"

class AISuggestHotspotsRequest(BaseModel):
    scene_id: str
    context: Optional[str] = "Propiedad inmobiliaria / Terreno capturado por dron"
