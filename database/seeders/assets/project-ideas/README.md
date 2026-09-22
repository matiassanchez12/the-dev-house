# Project idea illustrations

One illustration per seeded idea. Re-seed after any change to promote it. With no
file present for a slug, that idea card falls back to the per-category gradient
plus icon.

## What ships here

15 photos, one per seeded idea, sourced from [Unsplash](https://unsplash.com) and
cropped to the card's 16:9 media block. Every photo is free for commercial use
under the [Unsplash License](https://unsplash.com/license) with no attribution
required; the credits below are kept as courtesy, not obligation.

| Slug | Photographer | Source |
| --- | --- | --- |
| `cli-scaffold-proyectos` | Bernd Dittrich | https://unsplash.com/photos/fmH6yLBwEPw |
| `dashboard-metricas-repos` | Luke Chesser | https://unsplash.com/photos/JKUTrJ4vK00 |
| `gestor-snippets-equipo` | Huy Phan | https://unsplash.com/photos/JekEQkNITOQ |
| `clon-trello-kanban` | Paymo | https://unsplash.com/photos/AmhxmYXwbZM |
| `clon-spotify-reproductor` | Mustafi Numann | https://unsplash.com/photos/KeI2g1r_R3s |
| `clon-twitter-hilos` | Swello | https://unsplash.com/photos/7ljc7nkjNcc |
| `alternativa-linktree` | Szabó Viktor | https://unsplash.com/photos/9VPIy0a-OxE |
| `alternativa-notas-colaborativas` | Kelly Sikkema | https://unsplash.com/photos/hBdaqrr5Z3k |
| `acortador-urls-self-hosted` | Taylor Vick | https://unsplash.com/photos/M5tzZtFCOfs |
| `bot-discord-comunidad` | John Schnobrich | https://unsplash.com/photos/QckxruozjRg |
| `bot-recordatorios-telegram` | Towfiqu barbhuiya | https://unsplash.com/photos/jOeh3Lv88xA |
| `pipeline-reportes-automaticos` | Georg Eiermann | https://unsplash.com/photos/Wqc_tlCmzHI |
| `interprete-lenguaje-juguete` | Markus Winkler | https://unsplash.com/photos/5aiCc8n6tIE |
| `motor-busqueda-mini` | Daniel Forsman | https://unsplash.com/photos/Ph4ZJrwf4x8 |
| `clon-redis-en-memoria` | Liam Briese | https://unsplash.com/photos/lYxQ5F9xBDM |

### Replace or add one

Download the full-res JPG from the source URL and re-crop:

```
curl -sL "https://unsplash.com/photos/<id>/download?w=2000" -o src.jpg
ffmpeg -y -i src.jpg \
  -vf "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=1200:675:flags=lanczos" \
  -c:v libwebp -quality 82 <slug>.webp
```

Then update the table above and re-seed.

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
