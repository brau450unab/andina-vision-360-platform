# 🌐 Andina 360° Cloud — Plataforma Comercial SaaS de Tours Virtuales 360°

Plataforma SaaS B2B independiente de **Andina Visión** diseñada en **Modo Claro Formal (`Commercial Daylight`)** para la comercialización de propiedades inmobiliarias, proyectos constructivos (ITO), hotelería y retail mediante recorridos virtuales 360° interactivos en 8K HDR.

---

## ✨ Características Principales

- **Diseño Formal Comercial (Light Mode)**: Paleta clara de alto contraste (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#0284C7`, `#059669`) optimizada para salas de venta digitales, corredoras e inversionistas.
- **Autenticación Corporativa & Demo 1-Clic**: Inicio de sesión y registro formal para empresas, integración con Google Workspace SSO y botón de acceso inmediato a cuenta Demo B2B.
- **Centro de Control Ejecutivo**: Métricas de proyectos publicados, escenas 8K activas, hotspots comerciales y accesos rápidos.
- **Suite Integrada Photopea & Magnific AI 8K**: Retoque de panorámicas equirrectangulares 2:1 en el navegador mediante `photopea.js` (`postMessage` API) y perfiles de superresolución inmobiliaria/aérea 8K.
- **Tour Studio Interactivo & Visor WebGL**: Posicionamiento de puntos de navegación y fichas comerciales (UF/CLP) directamente sobre la esfera 3D, con radar de planta 2D interactivo.

---

## 🚀 Despliegue en Google Cloud Run

Este repositorio cuenta con `Dockerfile` multi-stage (Nginx en puerto `8080`) y `cloudbuild.yaml` preconfigurados para despliegue automático e independiente en **Google Cloud Run**:

```bash
bash scripts/deploy-gcp.sh
```
