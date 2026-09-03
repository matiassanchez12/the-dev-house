import { Bot, Copy, GraduationCap, Package, Wrench, type LucideIcon } from 'lucide-react'
import type { ProjectIdea, ProjectIdeaCategory } from '@/types'

export type GroupedProjectIdeas = {
    key: ProjectIdeaCategory
    label: string
    ideas: ProjectIdea[]
}

// Declaration order mirrors app/Enums/ProjectIdeaCategory.php — it IS the render order.
export const PROJECT_IDEA_CATEGORY_ORDER: ReadonlyArray<ProjectIdeaCategory> = [
    'herramientas-dev',
    'clones',
    'alternativas-oss',
    'bots-automatizacion',
    'aprendizaje',
]

export const PROJECT_IDEA_CATEGORY_LABELS: Record<ProjectIdeaCategory, string> = {
    'herramientas-dev': 'Herramientas para devs',
    clones: 'Clones de apps conocidas',
    'alternativas-oss': 'Alternativas open source',
    'bots-automatizacion': 'Bots y automatización',
    aprendizaje: 'Proyectos de aprendizaje',
}

// 20% palette tint composited over --card (which flips in .dark), mirroring the
// existing STATUS_GRADIENTS shape. No dark: overrides — theming is token-flip only.
export const PROJECT_IDEA_CATEGORY_GRADIENTS: Record<ProjectIdeaCategory, string> = {
    'herramientas-dev': 'from-amber-400/20 to-amber-600/20',
    clones: 'from-sky-400/20 to-sky-600/20',
    'alternativas-oss': 'from-emerald-400/20 to-emerald-600/20',
    'bots-automatizacion': 'from-violet-400/20 to-violet-600/20',
    aprendizaje: 'from-rose-400/20 to-rose-600/20',
}

export const PROJECT_IDEA_CATEGORY_ICONS: Record<ProjectIdeaCategory, LucideIcon> = {
    'herramientas-dev': Wrench,
    clones: Copy,
    'alternativas-oss': Package,
    'bots-automatizacion': Bot,
    aprendizaje: GraduationCap,
}

/**
 * Group published ideas by category, following the declared category order and
 * omitting categories with no ideas. Idea order within a category is preserved
 * from the incoming payload (the server already sorts by sort_order).
 */
export function groupIdeasByCategory(ideas: ProjectIdea[]): GroupedProjectIdeas[] {
    const groups = new Map<ProjectIdeaCategory, ProjectIdea[]>()

    for (const idea of ideas) {
        if (!PROJECT_IDEA_CATEGORY_ORDER.includes(idea.category)) {
            continue
        }

        const bucket = groups.get(idea.category)

        if (bucket) {
            bucket.push(idea)
        } else {
            groups.set(idea.category, [idea])
        }
    }

    return PROJECT_IDEA_CATEGORY_ORDER.filter((category) => groups.has(category)).map(
        (category) => ({
            key: category,
            label: PROJECT_IDEA_CATEGORY_LABELS[category],
            ideas: groups.get(category) ?? [],
        }),
    )
}
