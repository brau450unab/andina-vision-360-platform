terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "ID del proyecto en Google Cloud"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "Región de despliegue principal"
}

variable "cors_allowed_origins" {
  type        = list(string)
  default     = ["*"]
  description = "Orígenes permitidos para peticiones CORS (ej: dominio de la landing page)"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Entorno de ejecución (development, staging, production)"
}
