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

## Páginas a Actualizar

Las siguientes páginas deberían usar el componente `<Seo />`:

- [x] `landing.tsx` — Homepage
- [ ] `dashboard.tsx` — Dashboard de usuario
- [ ] `projects/index.tsx` — Listado de proyectos
- [ ] `projects/show.tsx` — Detalle de proyecto
- [ ] `projects/create.tsx` — Crear proyecto
- [ ] `users/index.tsx` — Listado de developers
- [ ] `users/show.tsx` — Perfil de usuario
- [ ] `join_requests/index.tsx` — Solicitudes
- [ ] `profile/edit.tsx` — Configuración

---

## Mejoras Futuras

### Prioridad Alta

1. **Sitemap XML**: Generar automáticamente con Laravel
2. **robots.txt**: Configurar reglas de crawling
3. **Schema para Projects**: Agregar Product/SoftwareApplication schema

### Prioridad Media

4. **Open Graph Images**: La imagen `/og.jpg` ya está configurada como default
5. **Breadcrumb Schema**: Para navegación jerárquica
6. **FAQ Schema**: En landing page o secciones de ayuda

### Prioridad Baja

7. **Twitter Cards personalizadas**: Imágenes específicas para Twitter
8. **Schema para User Profiles**: Person schema para perfiles públicos

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
