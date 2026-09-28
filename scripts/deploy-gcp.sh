#!/usr/bin/env bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-andina-vision-sistemas-saas}"
REGION="${GCP_REGION:-us-west1}"
SERVICE_NAME="andina-vision-360-platform"

echo "=== 1. Habilitando APIs y Servicios en Google Cloud ($PROJECT_ID) ==="
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  containerregistry.googleapis.com \
  iam.googleapis.com \
  --project "$PROJECT_ID"

echo "=== 2. Desplegando $SERVICE_NAME (Plataforma Comercial 360°) en Google Cloud Run ==="
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080

echo "=== 3. Habilitando permisos públicos de visualización (roles/run.invoker) ==="
gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --member="allUsers" \
  --role="roles/run.invoker"

echo "=== Despliegue de Andina 360° Platform completado exitosamente ==="
