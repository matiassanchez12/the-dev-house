# Page Spec: Feedback

## Objetivo

Capturar feedback estructurado sobre la experiencia de uso de la app y detectar oportunidades concretas de mejora.

## Ruta y pagina

- Ruta: `/contact`
- Archivo React: `resources/js/pages/public/contact.tsx`
- Titulo SEO: `Feedback | The Dev House`

## Estructura de contenido

1. Hero corto
    - Titulo orientado a feedback de producto.
    - Texto de apoyo explicando que buscamos medir satisfacción y entender fricciones.
2. Formulario de feedback
    - Campos:
        - `nombre` (required)
        - `email` (required)
        - `satisfaction` (required, select 1-5)
        - `understood_purpose` (required, select)
        - `would_join_project` (required, select)
        - `missing_feature` (required, textarea)
        - `tech_stack` (required, input)
        - `preferred_project_type` (required, select)
        - `improvements` (required, textarea)
    - Boton enviar.
3. Post-submit
    - Estado de exito con CTA para enviar otra respuesta.

## Requisitos funcionales

- Validacion cliente basica (required + formato email).
- Estados de UI: idle, enviando, exito, error.
- Mensajes de error claros por campo.
- Persistir feedback en `contact_messages`.
- Enviar email con el feedback al destinatario configurado por SMTP.

## Requisitos de UI

- Form card centrada, max ancho legible.
- Inputs y botones usando componentes UI existentes (`Input`, `Textarea`, `Button`, `Label`, `Select`).
- Feedback visual accesible para estados de error/exito.

## Criterios de aceptacion

- Formulario usable en mobile sin friccion.
- Navegacion y estilo consistente con landing.
- Campos obligatorios correctamente validados.
- No mostrar el email estático debajo del formulario.
