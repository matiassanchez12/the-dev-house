# Page Spec: How Start

## Objetivo

Guiar a una persona desde una idea inicial hasta el primer despliegue de un SaaS/proyecto colaborativo.

## Ruta y pagina

- Ruta: `/how-start`
- Archivo React: `resources/js/pages/public/how-start.tsx`
- Titulo SEO: `Como empezar | The Dev House`

## Estructura de contenido

1. Hero
   - Titulo: `Como empezar tu primer SaaS o proyecto colaborativo`
   - Subtitulo corto orientado a accion.
2. Bloque de contexto
   - Idea central: una buena idea no alcanza sin estructura y proceso.
3. Guia en 4 pasos
   - Paso 1: Definir proposito del proyecto (monetizar, networking, aprendizaje).
   - Paso 2: Validar la idea con preguntas clave (necesidad, competencia, diferenciacion).
   - Paso 3: Plan de desarrollo y armado de equipo.
   - Paso 4: Despliegue, difusion, feedback y mejora continua.
4. Recursos visuales (placeholder)
   - Cards para `videos`, `imagenes`, `graficos de proceso`.
5. Cierre con CTA
   - CTA primario: `Explorar proyectos`
   - CTA secundario: `Crear cuenta`

## Requisitos de UI

- Layout en bloques con cards y timeline vertical en mobile.
- En desktop, 2 columnas: contenido + panel visual de recursos.
- Mantener clases/tokens de landing.
- Animaciones suaves de entrada (si ya se usa `useInView`, reutilizar).

## Criterios de aceptacion

- El mensaje de los 4 pasos se entiende en lectura rapida.
- Copys sin fecha ni metadata de chat.
- Navegacion coherente con landing.
- Responsive correcto desde 320px.
