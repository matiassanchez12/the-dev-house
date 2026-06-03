# SEO Implementation Guide - The Dev House

## Overview

SEO técnico implementado siguiendo las mejores prácticas de Google Search Central y WCAG 2.2.

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `resources/views/app.blade.php` | Meta tags globales, structured data |
| `resources/js/components/seo.tsx` | Componente React para SEO por página |
| `public/favicon.svg` | Favicon oficial del proyecto |
| `public/og.jpg` | Open Graph image para redes sociales |

---

## Meta Tags Implementados

### Globales (app.blade.php)

- **Title**: Dinámico con `{{ config('app.name') }}`
- **Description**: Descripción general de la plataforma
- **Open Graph**: Para compartir en Facebook/LinkedIn
- **Twitter Cards**: Optimizado para Twitter
- **Canonical URL**: Previene contenido duplicado
- **Structured Data**: JSON-LD con Organization schema

### Por Página (componente Seo)

Usa el componente `<Seo />` en cada página:

```tsx
import Seo from '@/components/seo';

export default function MiPagina() {
    return (
        <>
            <Seo 
                title="Título específico de la página"
                description="Descripción única para esta página"
                type="website" // o 'article', 'product'
                canonicalUrl="https://the-dev-house-1.onrender.com/url-especifica"
            />
            {/* resto del contenido */}
        </>
    );
}
```

---

## Favicon

El proyecto usa un favicon SVG escalable:

```html
<!-- Implementado automáticamente en app.blade.php -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/favicon.svg">
```

**Diseño**: Casa (house) + corchetes de código, representando "DevHouse".

---

## Structured Data

### Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Dev House",
  "url": "https://the-dev-house-1.onrender.com",
  "description": "Una plataforma colaborativa para desarrolladores",
  "logo": "https://the-dev-house-1.onrender.com/favicon.svg",
  "sameAs": [
    "https://github.com/matiassanchez12/the-dev-house"
  ],
  "founder": {
    "@type": "Person",
    "name": "Matias Sanchez"
  }
}
```

---

## Páginas con `<Seo />`

Todas las páginas usan el componente `<Seo />`:

- [x] `landing.tsx` — Homepage
- [x] `public/about.tsx` — Acerca de
- [x] `public/contact.tsx` — Contacto
- [x] `public/how-start.tsx` — Cómo empezar
- [x] `public/privacy.tsx` — Privacidad
- [x] `public/terms.tsx` — Términos de uso
- [x] `dashboard.tsx` — Dashboard de usuario
- [x] `projects/index.tsx` — Listado de proyectos
- [x] `projects/show.tsx` — Detalle de proyecto (descripción dinámica)
- [x] `projects/create.tsx` — Crear proyecto
- [x] `projects/edit.tsx` — Editar proyecto
- [x] `users/index.tsx` — Listado de developers
- [x] `users/show.tsx` — Perfil de usuario (descripción dinámica)
- [x] `join_requests/index.tsx` — Solicitudes
- [x] `profile/edit.tsx` — Configuración
- [x] `onboarding/index.tsx` — Onboarding
- [x] `auth/login.tsx` — Iniciar sesión
- [x] `auth/register.tsx` — Crear cuenta
- [x] `auth/forgot-password.tsx` — Recuperar contraseña
- [x] `auth/reset-password.tsx` — Restablecer contraseña
- [x] `auth/confirm-password.tsx` — Confirmar contraseña
- [x] `auth/verify-email.tsx` — Verificar email

---

## Mejoras Futuras

### Prioridad Alta

1. **Sitemap XML**: Generar automáticamente con Laravel (ej: spatie/laravel-sitemap)
2. **robots.txt**: Agregar referencia al sitemap y reglas de crawling
3. **Schema para Projects**: Agregar Product/SoftwareApplication schema en detail page
4. **Schema para User Profiles**: Person schema para perfiles públicos

### Prioridad Media

5. **Breadcrumb Schema**: Para navegación jerárquica
6. **Hreflang**: Declarar `es_ES` para contenido en español
7. **Per-page OG images**: Generar OG images dinámicas para proyectos y perfiles

### Prioridad Baja

8. **FAQ Schema**: En landing page o secciones de ayuda
9. **Favicon dark mode**: Variante para `prefers-color-scheme: dark`
10. **`rel="prev"` / `rel="next"`**: Para páginas con paginación

---

## Herramientas de Validación

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)
- [Lighthouse SEO Audit](https://developer.chrome.com/docs/lighthouse/overview/)
- [Schema.org Validator](https://validator.schema.org/)

---

## Referencias

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [SEO Skill](.agents/skills/seo/SKILL.md)
