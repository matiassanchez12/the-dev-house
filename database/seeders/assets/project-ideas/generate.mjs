// Generates the 15 project-idea illustrations: one category-tinted gradient + a
// line-art motif per idea, matching the card's gradient/icon fallback language.
//
// Full pipeline (run from the repo root):
//
//   node database/seeders/assets/project-ideas/generate.mjs
//   cd database/seeders/assets/project-ideas
//   for f in svg/*.html; do s=$(basename "$f" .html); \
//     google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
//       --force-device-scale-factor=1 --window-size=1200,675 \
//       --screenshot="svg/$s.png" "$f"; \
//     ffmpeg -y -i "svg/$s.png" -c:v libwebp -quality 88 "$s.webp"; done
//   rm -rf svg
//
// Output: <slug>.webp at 1200x675. No third-party assets or licences involved.

import { writeFileSync, mkdirSync } from 'node:fs'

const WORK = new URL('./svg/', import.meta.url)
mkdirSync(WORK, { recursive: true })

// Category gradient stops — richer than the /20 card fallback so the standalone
// image reads on its own, same hue family as PROJECT_IDEA_CATEGORY_GRADIENTS.
const CATS = {
  'herramientas-dev': ['#fcd34d', '#b45309'], // amber 300 -> 700
  clones: ['#7dd3fc', '#0369a1'], // sky 300 -> 700
  'alternativas-oss': ['#6ee7b7', '#047857'], // emerald 300 -> 700
  'bots-automatizacion': ['#c4b5fd', '#6d28d9'], // violet 300 -> 700
  aprendizaje: ['#fda4af', '#be123c'], // rose 300 -> 700
}

// Each motif is line-art drawn in a 240x240 box, centered at (600,337) scaled x2.2.
// Stroke is translucent white; a soft filled slab sits behind for depth.
const M = {
  'cli-scaffold-proyectos': `
    <rect x="26" y="40" width="188" height="150" rx="14"/>
    <path d="M26 66 h188"/>
    <circle cx="44" cy="53" r="4" fill="currentColor" stroke="none"/>
    <circle cx="60" cy="53" r="4" fill="currentColor" stroke="none"/>
    <circle cx="76" cy="53" r="4" fill="currentColor" stroke="none"/>
    <path d="M46 92 l20 16 -20 16"/>
    <path d="M78 122 h40"/>
    <path d="M150 96 v60 M150 108 h22 M150 132 h34 M150 156 h22"/>`,
  'dashboard-metricas-repos': `
    <rect x="26" y="34" width="188" height="162" rx="14"/>
    <path d="M52 168 v-42 M86 168 v-74 M120 168 v-30 M154 168 v-92 M188 168 v-58"/>
    <path d="M44 132 l34 -30 34 22 34 -46 34 24" fill="none"/>
    <circle cx="112" cy="124" r="5" fill="currentColor" stroke="none"/>
    <circle cx="180" cy="102" r="5" fill="currentColor" stroke="none"/>`,
  'gestor-snippets-equipo': `
    <rect x="52" y="60" width="150" height="120" rx="14"/>
    <rect x="38" y="46" width="150" height="120" rx="14" fill="var(--slab)"/>
    <path d="M92 84 l-26 26 26 26 M150 84 l26 26 -26 26 M124 76 l-16 68"/>`,
  'clon-trello-kanban': `
    <rect x="24" y="34" width="58" height="168" rx="12"/>
    <rect x="94" y="34" width="58" height="168" rx="12"/>
    <rect x="164" y="34" width="58" height="168" rx="12"/>
    <rect x="34" y="48" width="38" height="26" rx="6" fill="var(--slab)"/>
    <rect x="34" y="84" width="38" height="26" rx="6" fill="var(--slab)"/>
    <rect x="104" y="48" width="38" height="26" rx="6" fill="var(--slab)"/>
    <rect x="104" y="84" width="38" height="26" rx="6" fill="var(--slab)"/>
    <rect x="104" y="120" width="38" height="26" rx="6" fill="var(--slab)"/>
    <rect x="174" y="48" width="38" height="26" rx="6" fill="var(--slab)"/>`,
  'clon-spotify-reproductor': `
    <circle cx="120" cy="92" r="58"/>
    <path d="M106 68 l36 24 -36 24 z" fill="currentColor" stroke="none"/>
    <path d="M44 214 v-16 M70 214 v-34 M96 214 v-14 M122 214 v-40 M148 214 v-24 M174 214 v-44 M200 214 v-18"/>`,
  'clon-twitter-hilos': `
    <path d="M52 40 h96 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-70 l-18 16 v-16 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12 z"/>
    <path d="M108 118 h96 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-70 l-18 14 v-14 a12 12 0 0 1 -12 -12 v-30 a12 12 0 0 1 12 -12 z"/>
    <path d="M72 92 v20 M164 170 v14"/>`,
  'alternativa-linktree': `
    <rect x="78" y="20" width="84" height="200" rx="18"/>
    <circle cx="120" cy="52" r="14"/>
    <rect x="92" y="80" width="56" height="20" rx="10" fill="var(--slab)"/>
    <rect x="92" y="110" width="56" height="20" rx="10" fill="var(--slab)"/>
    <rect x="92" y="140" width="56" height="20" rx="10" fill="var(--slab)"/>
    <rect x="92" y="170" width="56" height="20" rx="10" fill="var(--slab)"/>`,
  'alternativa-notas-colaborativas': `
    <path d="M56 28 h94 l34 34 v150 a10 10 0 0 1 -10 10 h-118 a10 10 0 0 1 -10 -10 v-174 a10 10 0 0 1 10 -10 z"/>
    <path d="M150 28 v34 h34"/>
    <path d="M74 96 h84 M74 120 h84 M74 144 h56"/>
    <path d="M150 150 l6 22 8 -8 z" fill="currentColor" stroke="none"/>
    <path d="M96 60 l5 18 7 -7 z" fill="currentColor" stroke="none"/>`,
  'acortador-urls-self-hosted': `
    <g transform="translate(38,26) scale(7)" stroke-width="0.93">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </g>
    <path d="M44 200 h150 m-28 -17 28 17 -28 17"/>
    <path d="M92 220 h58"/>`,
  'bot-discord-comunidad': `
    <rect x="58" y="70" width="124" height="98" rx="20"/>
    <path d="M120 46 v24 M120 46 a8 8 0 1 0 0.1 0"/>
    <circle cx="96" cy="118" r="9" fill="currentColor" stroke="none"/>
    <circle cx="144" cy="118" r="9" fill="currentColor" stroke="none"/>
    <path d="M96 144 h48"/>
    <path d="M58 108 h-16 v20 h16 M182 108 h16 v20 h-16"/>`,
  'bot-recordatorios-telegram': `
    <path d="M120 36 a54 54 0 0 1 54 54 v40 l18 26 h-144 l18 -26 v-40 a54 54 0 0 1 54 -54 z"/>
    <path d="M104 182 a16 16 0 0 0 32 0"/>
    <circle cx="170" cy="168" r="34" fill="var(--slab)"/>
    <path d="M170 148 v20 l14 10"/>`,
  'pipeline-reportes-automaticos': `
    <circle cx="44" cy="80" r="20"/>
    <circle cx="120" cy="80" r="20"/>
    <circle cx="196" cy="80" r="20"/>
    <path d="M64 80 h36 m-12 -8 12 8 -12 8 M140 80 h36 m-12 -8 12 8 -12 8"/>
    <path d="M120 100 v34 m-12 -12 12 12 12 -12"/>
    <rect x="76" y="140" width="88" height="72" rx="10"/>
    <path d="M94 162 h52 M94 182 h52 M94 200 h34"/>`,
  'interprete-lenguaje-juguete': `
    <path d="M78 34 a26 26 0 0 0 -26 26 v34 a20 20 0 0 1 -18 20 a20 20 0 0 1 18 20 v34 a26 26 0 0 0 26 26"/>
    <path d="M162 34 a26 26 0 0 1 26 26 v34 a20 20 0 0 0 18 20 a20 20 0 0 0 -18 20 v34 a26 26 0 0 1 -26 26"/>
    <circle cx="120" cy="86" r="12"/>
    <circle cx="94" cy="150" r="12"/>
    <circle cx="146" cy="150" r="12"/>
    <path d="M112 96 l-12 44 M128 96 l12 44"/>`,
  'motor-busqueda-mini': `
    <circle cx="110" cy="106" r="58"/>
    <path d="M151 147 l46 46"/>
    <path d="M84 92 h52 M84 112 h52 M84 132 h32"/>`,
  'clon-redis-en-memoria': `
    <path d="M48 66 c0 -14 32 -22 72 -22 s72 8 72 22 v96 c0 14 -32 22 -72 22 s-72 -8 -72 -22 z"/>
    <path d="M48 98 c0 14 32 22 72 22 s72 -8 72 -22"/>
    <path d="M48 130 c0 14 32 22 72 22 s72 -8 72 -22"/>
    <path d="M150 40 l-26 40 h22 l-20 40" fill="none"/>`,
}

const IDEAS = {
  'cli-scaffold-proyectos': 'herramientas-dev',
  'dashboard-metricas-repos': 'herramientas-dev',
  'gestor-snippets-equipo': 'herramientas-dev',
  'clon-trello-kanban': 'clones',
  'clon-spotify-reproductor': 'clones',
  'clon-twitter-hilos': 'clones',
  'alternativa-linktree': 'alternativas-oss',
  'alternativa-notas-colaborativas': 'alternativas-oss',
  'acortador-urls-self-hosted': 'alternativas-oss',
  'bot-discord-comunidad': 'bots-automatizacion',
  'bot-recordatorios-telegram': 'bots-automatizacion',
  'pipeline-reportes-automaticos': 'bots-automatizacion',
  'interprete-lenguaje-juguete': 'aprendizaje',
  'motor-busqueda-mini': 'aprendizaje',
  'clon-redis-en-memoria': 'aprendizaje',
}

const W = 1200, H = 675

for (const [slug, cat] of Object.entries(IDEAS)) {
  const [c0, c1] = CATS[cat]
  const motif = M[slug].trim()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c0}"/>
      <stop offset="1" stop-color="${c1}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g stroke="#ffffff" stroke-opacity="0.16" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<path d="M0 ${i * 56} H${W}"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 56} 0 V${H}"/>`).join('')}
  </g>
  <g transform="translate(${W / 2}, ${H / 2}) scale(2.3) translate(-120,-120)"
     fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"
     color="#ffffff" style="--slab: rgba(255,255,255,0.14)">
    ${motif}
  </g>
</svg>`
  writeFileSync(new URL(`${slug}.svg`, WORK), svg)
  writeFileSync(
    new URL(`${slug}.html`, WORK),
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0}svg{display:block}</style>${svg}`,
  )
}
console.log(`generated ${Object.keys(IDEAS).length} svg/html pairs in ${WORK.pathname}`)
