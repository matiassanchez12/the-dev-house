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
        illustrationUrl: null,
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

    it('renders the illustration image with meaningful Spanish alt text when present', () => {
        render(
            <ProjectIdeaCard
                idea={buildIdea({
                    title: 'Clon de Trello',
                    illustrationUrl: 'https://cdn.test/project-ideas/clon-trello-kanban.webp',
                })}
                techNames={['React']}
                onSelect={vi.fn()}
            />,
        )

        const image = screen.getByRole('img', { name: /idea/i })
        expect(image).toHaveAttribute(
            'src',
            'https://cdn.test/project-ideas/clon-trello-kanban.webp',
        )
        expect(image.getAttribute('alt')).toMatch(/Clon de Trello/)
        expect(image.getAttribute('alt')?.length ?? 0).toBeGreaterThan(0)
    })

    it('renders a gradient fallback with an aria-hidden category icon when no illustration', () => {
        const { container } = render(
            <ProjectIdeaCard
                idea={buildIdea({ category: 'clones', illustrationUrl: null })}
                techNames={['React']}
                onSelect={vi.fn()}
            />,
        )

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        const icon = container.querySelector('svg[aria-hidden="true"]')
        expect(icon).not.toBeNull()
        expect(container.querySelector('.bg-gradient-to-br')).not.toBeNull()
    })

    it('clamps the summary to two lines and keeps the full text in a title attribute', () => {
        const summary =
            'Un tablero kanban muy largo con listas, tarjetas arrastrables, etiquetas y responsables.'

        render(
            <ProjectIdeaCard
                idea={buildIdea({ summary })}
                techNames={['React']}
                onSelect={vi.fn()}
            />,
        )

        const description = screen.getByText(summary)
        expect(description).toHaveAttribute('title', summary)
        // REVIEW(project-idea-illustrations): spec requires two-line clamp which is
        // only observable via the utility class in jsdom; class assertion is
        // intentional here despite the general "no CSS class assertion" guidance.
        expect(description).toHaveClass('line-clamp-2')
    })

    it('shows a +N badge when an idea has more techs than fit on one line', () => {
        render(
            <ProjectIdeaCard
                idea={buildIdea()}
                techNames={['React', 'Laravel', 'Postgres', 'Redis', 'Docker']}
                onSelect={vi.fn()}
            />,
        )

        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('Laravel')).toBeInTheDocument()
        expect(screen.getByText('Postgres')).toBeInTheDocument()
        expect(screen.queryByText('Redis')).not.toBeInTheDocument()
        expect(screen.getByText('+2')).toBeInTheDocument()
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
