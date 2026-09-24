import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.routes_tours import router as tours_router
from app.routes_ai import router as ai_router

app = FastAPI(
    title="Andina Vision 360 Engine API",
    description="Motor Cloud Native y Plataforma de Gestión de Recorridos Virtuales 360° para Drones DJI",
    version="1.0.0"
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

allowed_origins_raw = os.environ.get("CORS_ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tours_router)
app.include_router(ai_router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "andina-360-api",
        "version": "1.0.0",
        "environment": os.environ.get("ENVIRONMENT", "production")
    }
