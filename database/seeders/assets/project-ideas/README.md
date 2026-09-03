# Project idea illustrations

One illustration per seeded idea. Re-seed after any change to promote it. With no
file present for a slug, that idea card falls back to the per-category gradient
plus icon.

## What ships here

15 generated line-art illustrations — a category-tinted gradient plus a motif for
each idea, in the same visual language as the card fallback. They are produced by
`generate.mjs` (Node + headless Chrome + ffmpeg), not hand-drawn, so they are
fully reproducible and carry no third-party licence.

Regenerate all 15:

```
node database/seeders/assets/project-ideas/generate.mjs   # writes ./svg/*.html
# then screenshot each with headless chrome and encode to webp (see the script header)
```

To replace one with a real photo, just drop `<slug>.webp` (1200x675, <=300 KB)
over the generated file and re-seed.

## File contract

- **Filename**: `<slug>.webp` — the stem MUST be the exact seeded idea slug.
- **Dimensions**: 1200x675 (16:9, matches the card's `aspect-video` media block).
- **Format**: WebP.
- **Size**: <= 300 KB each.

## Seeded slugs

```
cli-scaffold-proyectos
dashboard-metricas-repos
gestor-snippets-equipo
clon-trello-kanban
clon-spotify-reproductor
clon-twitter-hilos
alternativa-linktree
alternativa-notas-colaborativas
acortador-urls-self-hosted
bot-discord-comunidad
bot-recordatorios-telegram
pipeline-reportes-automaticos
interprete-lenguaje-juguete
motor-busqueda-mini
clon-redis-en-memoria
```

## Promote an asset

1. Add `<slug>.webp` to this directory.
2. Run:

   ```
   php artisan db:seed --class=ProjectIdeaSeeder
   ```

The seeder copies each present source to the deterministic media-disk path
`project-ideas/<slug>.webp` and sets that idea's `illustration_path`. Re-running
is idempotent: a `null` `illustration_path` is refreshed when a source appears,
and a removed source never nulls an already-populated column.
