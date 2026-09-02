# Project idea illustrations

Drop one illustration per idea here and re-seed to promote it. This directory is
tracked even though **zero images ship today** — that is a valid terminal state,
not a degraded one. With no file present, each idea card renders the per-category
gradient plus icon fallback.

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
