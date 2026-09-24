output "raw_bucket_name" {
  value       = google_storage_bucket.raw_panoramas.name
  description = "Nombre del bucket de imágenes originales"
}

output "tiles_bucket_name" {
  value       = google_storage_bucket.processed_tiles.name
  description = "Nombre del bucket de tiles procesados para CDN"
}

output "api_service_url" {
  value       = google_cloud_run_v2_service.api_service.uri
  description = "URL base del servicio de API en Cloud Run"
}

output "artifact_registry_repo" {
  value       = google_artifact_registry_repository.docker_repo.name
  description = "Repositorio de imágenes Docker"
}
