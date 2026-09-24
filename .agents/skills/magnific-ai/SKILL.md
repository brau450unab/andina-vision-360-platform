---
name: magnific-ai
description: Directrices, flujos de trabajo y estándares para optimización, re-escalado con IA (upscaling), superresolución fotorrealista y mejora de texturas para capturas aéreas, tours virtuales 360° y renders de Andina Vision.
---

# Magnific AI Skill: Optimización y Superresolución Visual

Esta skill proporciona los protocolos de procesamiento y optimización de imagen con IA aplicados a la suite de servicios de **Andina Vision**:

## 1. Principios de Optimización Visual
* **Fidelidad Estructural**: Al re-escalar capturas aéreas e interiores 360°, mantener intactas las proporciones arquitectónicas, líneas de fuga y cotas de ingeniería.
* **Reducción de Ruido en Altas Sensibilidades**: Limpieza de grano en tomas nocturnas o crepusculares en el Desierto de Atacama manteniendo la nitidez de luces urbanas e industriales.
* **Texturizado Inteligente (Hallucination Control)**: 
  * Para fachadas y arquitectura: ajustar nivel de creatividad en 0.2 - 0.4 para evitar deformaciones en ventanales o líneas maestras.
  * Para texturas de paisaje (dunas, salares, mar): permitir hasta 0.6 para enriquecer el relieve natural y el contraste.

## 2. Flujo de Trabajo por Vertical
1. **Cinematografía & Marketing**:
   * Generación de fotogramas clave (*hero stills*) a partir de video 4K/5.1K.
   * Procesamiento en alta resolución (hasta 8K) para material promocional, afiches y portadas web.
2. **Inmobiliaria & Tours Virtuales 360°**:
   * Superresolución en panorámicas equirrectangulares.
   * Claridad en detalles de interiores (maderas, mármoles, vistas de ventanas sobreexpuestas con compensación HDR).
3. **Inspección Industrial**:
   * Aumento de nitidez en fisuras de fachadas, pernos y juntas estructurales sin alteración morfológica.

## 3. Especificaciones de Salida Web
* Formatos: WebP / PNG optimizado.
* Compresión gzip / brotli para tiempos de carga < 1.2s.
* Soporte para vistas retina y pantallas de ultra alta definición.
