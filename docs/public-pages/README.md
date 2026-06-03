## Public Pages Spec

Este paquete define las especificaciones funcionales y de UI para las nuevas paginas publicas, manteniendo el mismo vibe de la landing actual.

### Alcance

- `how-start`
- `about`
- `contact`
- `terms`
- `privacy`

### Base tecnica (React + Inertia)

- Cada pagina vive en `resources/js/pages/public/<slug>.tsx`.
- Todas comparten estructura:
  1. `LandingNav`
  2. contenido principal con `container mx-auto px-4 py-20`
  3. `LandingFooter`
- SEO via `Head` o `Seo` component.
- Estilos con tokens existentes: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-accent`.

### Criterios globales

- Consistencia visual con landing (tipografia, botones, cards, espaciados).
- Buen comportamiento mobile/desktop.
- Accesibilidad basica: labels en formularios, contraste, jerarquia semantica.
- Textos en espanol rioplatense neutro.

### Documentos

- `how-start.md`
- `about.md`
- `contact.md`
- `terms.md`
- `privacy.md`
