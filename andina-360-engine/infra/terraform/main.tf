provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Habilitación de APIs de Google Cloud
locals {
  services = [
    "run.googleapis.com",
    "storage.googleapis.com",
    "firestore.googleapis.com",
    "aiplatform.googleapis.com",
    "eventarc.googleapis.com",
    "secretmanager.googleapis.com",
    "compute.googleapis.com",
    "artifactregistry.googleapis.com"
  ]
}

resource "google_project_service" "enabled_apis" {
  for_each           = toset(locals.services)
  service            = each.key
  disable_on_destroy = false
}

# 2. Cuentas de Servicio
resource "google_service_account" "api_sa" {
  account_id   = "andina-360-api-sa"
  display_name = "Cuenta de Servicio para la API Backend 360"
  depends_on   = [google_project_service.enabled_apis]
}

resource "google_service_account" "processor_sa" {
  account_id   = "andina-360-processor-sa"
  display_name = "Cuenta de Servicio para el Procesador de Imágenes 360"
  depends_on   = [google_project_service.enabled_apis]
}

# 3. Almacenamiento Cloud Storage (GCS)
# 3.1 Bucket de Imágenes Originales de Drones (Raw)
resource "google_storage_bucket" "raw_panoramas" {
  name                        = "${var.project_id}-panoramas-raw"
  location                    = var.region
  uniform_bucket_level_access = true
  storage_class               = "STANDARD"

  # Optimización de costes: Migrar originales a Nearline tras 60 días
  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
    condition {
      age = 60
    }
  }

  cors {
    origin          = var.cors_allowed_origins
    method          = ["GET", "PUT", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  depends_on = [google_project_service.enabled_apis]
}

# 3.2 Bucket de Tiles Procesados (Público / CDN)
resource "google_storage_bucket" "processed_tiles" {
  name                        = "${var.project_id}-panoramas-tiles"
  location                    = var.region
  uniform_bucket_level_access = true
  storage_class               = "STANDARD"

  cors {
    origin          = var.cors_allowed_origins
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 86400
  }

  depends_on = [google_project_service.enabled_apis]
}

# Lectura pública para los tiles servidos por CDN
resource "google_storage_bucket_iam_member" "public_tiles_reader" {
  bucket = google_storage_bucket.processed_tiles.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# 4. Cloud Firestore (Base de Datos NoSQL para Tours, Nodos y Hotspots)
resource "google_firestore_database" "database" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.enabled_apis]
}

# 5. Secret Manager para Claves JWT y Configuración Sensible
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "andina-jwt-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled_apis]
}

# 6. Artifact Registry para Imágenes Docker de la API y el Procesador
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "andina-360-containers"
  description   = "Repositorio Docker para contenedores de API y procesamiento 360"
  format        = "DOCKER"
  depends_on    = [google_project_service.enabled_apis]
}

# 7. Permisos IAM
# La API necesita firmar URLs y leer/escribir en Firestore
resource "google_storage_bucket_iam_member" "api_raw_admin" {
  bucket = google_storage_bucket.raw_panoramas.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

# El procesador necesita leer de raw, escribir en tiles y llamar a Vertex AI
resource "google_storage_bucket_iam_member" "processor_raw_reader" {
  bucket = google_storage_bucket.raw_panoramas.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.processor_sa.email}"
}

resource "google_storage_bucket_iam_member" "processor_tiles_writer" {
  bucket = google_storage_bucket.processed_tiles.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.processor_sa.email}"
}

resource "google_project_iam_member" "processor_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.processor_sa.email}"
}

# 8. Definición de Cloud Run Job para el Procesamiento Gráfico de Mosaicos
resource "google_cloud_run_v2_job" "image_processor" {
  name     = "andina-image-processor-job"
  location = var.region

  template {
    template {
      service_account = google_service_account.processor_sa.email
      timeout         = "900s" # 15 minutos máximo para gigapíxeles de dron
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/andina-360-containers/processor:latest"
        resources {
          limits = {
            cpu    = "4000m"
            memory = "8Gi"
          }
        }
        env {
          name  = "RAW_BUCKET"
          value = google_storage_bucket.raw_panoramas.name
        }
        env {
          name  = "TILES_BUCKET"
          value = google_storage_bucket.processed_tiles.name
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [template[0].template[0].containers[0].image]
  }

  depends_on = [google_artifact_registry_repository.docker_repo]
}

# 9. Cloud Run Service: API SaaS Backend
resource "google_cloud_run_v2_service" "api_service" {
  name     = "andina-360-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.api_sa.email
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/andina-360-containers/api:latest"
      resources {
        limits = {
          cpu    = "2000m"
          memory = "2Gi"
        }
      }
      env {
        name  = "RAW_BUCKET"
        value = google_storage_bucket.raw_panoramas.name
      }
      env {
        name  = "TILES_BUCKET"
        value = google_storage_bucket.processed_tiles.name
      }
      env {
        name  = "PROCESSOR_JOB_NAME"
        value = google_cloud_run_v2_job.image_processor.name
      }
      env {
        name  = "GCP_PROJECT"
        value = var.project_id
      }
      env {
        name  = "GCP_REGION"
        value = var.region
      }
    }
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image]
  }

  depends_on = [google_artifact_registry_repository.docker_repo]
}

# Acceso público a la API
resource "google_cloud_run_service_iam_member" "public_api_access" {
  location = google_cloud_run_v2_service.api_service.location
  project  = google_cloud_run_v2_service.api_service.project
  service  = google_cloud_run_v2_service.api_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
