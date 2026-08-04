import type { Tech, TechCategory } from '@/types'

type GroupedTechs = {
    key: TechCategory | 'other'
    label: string
    techs: Tech[]
}

const TECH_CATEGORY_ORDER: ReadonlyArray<TechCategory | 'other'> = [
    'frontend',
    'backend',
    'languages',
    'mobile',
    'data',
    'devops-cloud',
    'api-integration',
    'design-tooling',
    'other',
]

const TECH_CATEGORY_LABELS: Record<TechCategory | 'other', string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    languages: 'Languages',
    mobile: 'Mobile',
    data: 'Data',
    'devops-cloud': 'DevOps & Cloud',
    'api-integration': 'API & Integration',
    'design-tooling': 'Design & Tooling',
    other: 'Other',
}

function normalizeCategory(category: Tech['category']): TechCategory | 'other' {
    if (!category) {
        return 'other'
    }

    return TECH_CATEGORY_ORDER.includes(category as TechCategory)
        ? (category as TechCategory)
        : 'other'
}

export function groupTechsByCategory(techs: Tech[]): GroupedTechs[] {
    const groups = new Map<TechCategory | 'other', Tech[]>()

    const sortedTechs = [...techs].sort((left, right) => {
        const leftCategory = normalizeCategory(left.category)
        const rightCategory = normalizeCategory(right.category)
        const categoryOrder =
            TECH_CATEGORY_ORDER.indexOf(leftCategory) - TECH_CATEGORY_ORDER.indexOf(rightCategory)

        if (categoryOrder !== 0) {
            return categoryOrder
        }

        return left.name.localeCompare(right.name)
    })

    for (const tech of sortedTechs) {
        const category = normalizeCategory(tech.category)

        if (!groups.has(category)) {
            groups.set(category, [])
        }

        groups.get(category)?.push(tech)
    }

    return Array.from(groups.entries()).map(([key, categoryTechs]) => ({
        key,
        label: TECH_CATEGORY_LABELS[key],
        techs: categoryTechs,
    }))
}
