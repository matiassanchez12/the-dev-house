# Page Spec: Contact

## Objetivo

Ofrecer un canal simple para consultas, colaboraciones o soporte general.

## Ruta y pagina

- Ruta: `/contact`
- Archivo React: `resources/js/pages/public/contact.tsx`
- Titulo SEO: `Contacto | The Dev House`

## Estructura de contenido

1. Hero corto
   - Titulo: `Hablemos`
   - Texto de apoyo sobre tiempos de respuesta.
2. Formulario de contacto
   - Campos:
     - `nombre` (required)
     - `email` (required)
     - `motivo` (required, select)
     - `mensaje` (required, textarea)
   - Checkbox opcional de consentimiento de contacto.
   - Boton enviar.
3. Bloque alternativo de contacto
   - Mail de referencia y/o enlace a comunidad.

## Requisitos funcionales

- Validacion cliente basica (required + formato email).
- Estados de UI: idle, enviando, exito, error.
- Mensajes de error claros por campo.
- Si backend no esta definido, dejar submit preparado con TODO tecnico.

## Requisitos de UI

- Form card centrada, max ancho legible.
- Inputs y botones usando componentes UI existentes (`Input`, `Textarea`, `Button`, `Label`).
- Feedback visual accesible para estados de error/exito.

## Criterios de aceptacion

- Formulario usable en mobile sin friccion.
- Navegacion y estilo consistente con landing.
- Campos obligatorios correctamente validados.
