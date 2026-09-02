import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ProjectIdea, Tech } from '@/types'
import { ProjectIdeaCard } from './project-idea-card'
import { ProjectIdeaInspiration } from './project-idea-inspiration'

function buildIdea(overrides: Partial<ProjectIdea> = {}): ProjectIdea {
    return {
        slug: 'clon-trello-kanban',
        title: 'Clon de Trello',
        summary: 'Un tablero kanban con listas y tarjetas.',
        category: 'clones',
        difficulty: 'intermedio',
        prefillTitle: 'Clon de Trello',
        prefillDescription: 'Descripción de scope.',
        prefillVision: 'Visión del resultado.',
        techIds: [1, 2],
        ...overrides,
    }
}

function buildTech(overrides: Partial<Tech> = {}): Tech {
    return {
        id: 1,
        name: 'React',
        slug: 'react',
        category: 'frontend',
        created_at: '',
        updated_at: '',
        ...overrides,
    }
}

describe('ProjectIdeaCard', () => {
    it('shows the title, summary, tech names and a difficulty badge', () => {
        render(
            <ProjectIdeaCard
                idea={buildIdea()}
                techNames={['React', 'Laravel']}
                onSelect={vi.fn()}
            />,
        )

        expect(screen.getByText('Clon de Trello')).toBeInTheDocument()
        expect(screen.getByText('Un tablero kanban con listas y tarjetas.')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('Laravel')).toBeInTheDocument()
        expect(screen.getByText('intermedio')).toBeInTheDocument()
    })

    it('omits the difficulty badge when difficulty is null', () => {
        render(
            <ProjectIdeaCard
                idea={buildIdea({ difficulty: null })}
                techNames={['React']}
                onSelect={vi.fn()}
            />,
        )

        expect(screen.queryByText('intermedio')).not.toBeInTheDocument()
    })

    it('calls onSelect with the idea when the CTA is pressed', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        const idea = buildIdea()

        render(<ProjectIdeaCard idea={idea} techNames={[]} onSelect={onSelect} />)

        await user.click(screen.getByRole('button', { name: 'Usar la idea: Clon de Trello' }))

        expect(onSelect).toHaveBeenCalledWith(idea)
    })
})

describe('ProjectIdeaInspiration', () => {
    it('renders null when there are no ideas', () => {
        const { container } = render(
            <ProjectIdeaInspiration ideas={[]} techs={[]} onSelect={vi.fn()} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders one heading per non-empty category and resolves tech names by id', async () => {
        const user = userEvent.setup()

        render(
            <ProjectIdeaInspiration
                ideas={[
                    buildIdea({ slug: 'a', category: 'clones', title: 'Clon A', techIds: [1] }),
                    buildIdea({
                        slug: 'b',
                        category: 'herramientas-dev',
                        title: 'Herramienta B',
                        techIds: [2],
                    }),
                ]}
                techs={[
                    buildTech({ id: 1, name: 'React' }),
                    buildTech({ id: 2, name: 'Go', slug: 'go' }),
                ]}
                onSelect={vi.fn()}
            />,
        )

        await user.click(screen.getByRole('button', { name: /ideas/i }))

        expect(screen.getByText('Herramientas para devs')).toBeInTheDocument()
        expect(screen.getByText('Clones de apps conocidas')).toBeInTheDocument()
        expect(screen.queryByText('Alternativas open source')).not.toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('Go')).toBeInTheDocument()
    })
})
