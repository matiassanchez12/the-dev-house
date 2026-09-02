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
