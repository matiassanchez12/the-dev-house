import { describe, expect, it } from 'vitest'
import type { ProjectIdea } from '@/types'
import {
    PROJECT_IDEA_CATEGORY_LABELS,
    PROJECT_IDEA_CATEGORY_ORDER,
    groupIdeasByCategory,
} from './project-idea-catalog'

function buildIdea(overrides: Partial<ProjectIdea> = {}): ProjectIdea {
    return {
        slug: 'idea-slug',
        title: 'Idea',
        summary: 'Una idea de proyecto.',
        category: 'herramientas-dev',
        difficulty: null,
        prefillTitle: 'Idea',
        prefillDescription: 'Descripción.',
        prefillVision: '',
        techIds: [],
        ...overrides,
    }
}

describe('project-idea-catalog', () => {
    it('exposes the five categories in enum declaration order', () => {
        expect(PROJECT_IDEA_CATEGORY_ORDER).toEqual([
            'herramientas-dev',
            'clones',
            'alternativas-oss',
            'bots-automatizacion',
            'aprendizaje',
        ])
    })

    it('maps every category to its Spanish label', () => {
        expect(PROJECT_IDEA_CATEGORY_LABELS['herramientas-dev']).toBe('Herramientas para devs')
        expect(PROJECT_IDEA_CATEGORY_LABELS.clones).toBe('Clones de apps conocidas')
        expect(PROJECT_IDEA_CATEGORY_LABELS['alternativas-oss']).toBe('Alternativas open source')
        expect(PROJECT_IDEA_CATEGORY_LABELS['bots-automatizacion']).toBe('Bots y automatización')
        expect(PROJECT_IDEA_CATEGORY_LABELS.aprendizaje).toBe('Proyectos de aprendizaje')
    })

    it('groups ideas by category following the declared order and omits empty groups', () => {
        const groups = groupIdeasByCategory([
            buildIdea({ slug: 'a', category: 'aprendizaje' }),
            buildIdea({ slug: 'b', category: 'herramientas-dev' }),
            buildIdea({ slug: 'c', category: 'aprendizaje' }),
        ])

        expect(groups.map((group) => group.key)).toEqual(['herramientas-dev', 'aprendizaje'])
        expect(groups[0]).toMatchObject({ label: 'Herramientas para devs' })
        expect(groups[0].ideas.map((idea) => idea.slug)).toEqual(['b'])
        expect(groups[1].ideas.map((idea) => idea.slug)).toEqual(['a', 'c'])
    })

    it('returns an empty array when there are no ideas', () => {
        expect(groupIdeasByCategory([])).toEqual([])
    })
})
