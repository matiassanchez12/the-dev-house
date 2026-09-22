import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OnboardingIdeaTeaser, type FeaturedIdea } from './onboarding-idea-teaser'

const techNamesById = new Map<number, string>([
    [1, 'React'],
    [2, 'Laravel'],
    [3, 'TypeScript'],
    [4, 'PostgreSQL'],
    [5, 'Redis'],
])

function makeIdea(overrides: Partial<FeaturedIdea> = {}): FeaturedIdea {
    return {
        slug: 'cli-scaffold',
        title: 'CLI scaffold para proyectos',
        summary: 'Una herramienta de línea de comandos para generar la estructura base de un proyecto nuevo.',
        category: 'herramientas-dev',
        difficulty: 'intermedio',
        prefillTitle: 'CLI scaffold',
        prefillDescription: 'desc',
        prefillVision: '',
        techIds: [1, 2, 3],
        illustrationUrl: null,
        ...overrides,
    }
}

describe('OnboardingIdeaTeaser', () => {
    it('renders one card per idea with title, summary, difficulty badge and tech names', () => {
        const ideas = [
            makeIdea(),
            makeIdea({
                slug: 'dashboard-metricas',
                title: 'Dashboard de métricas',
                summary: 'Panel para visualizar métricas de repositorios.',
                difficulty: null,
                techIds: [],
            }),
        ]

        render(
            <OnboardingIdeaTeaser
                ideas={ideas}
                selectedSlug={null}
                onSelect={vi.fn()}
                techNamesById={techNamesById}
            />,
        )

        expect(screen.getByText('CLI scaffold para proyectos')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Una herramienta de línea de comandos para generar la estructura base de un proyecto nuevo.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Dashboard de métricas')).toBeInTheDocument()

        expect(screen.getByText('intermedio')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('Laravel')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()

        const allTodas = screen.getByRole('link', { name: 'ver todas las ideas' })
        expect(allTodas).toHaveAttribute('href', '/projects/create')
    })

    it('caps tech chips at 3 and shows a +N overflow badge', () => {
        render(
            <OnboardingIdeaTeaser
                ideas={[makeIdea({ techIds: [1, 2, 3, 4, 5] })]}
                selectedSlug={null}
                onSelect={vi.fn()}
                techNamesById={techNamesById}
            />,
        )

        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('Laravel')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.queryByText('PostgreSQL')).not.toBeInTheDocument()
        expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('calls onSelect with the slug when an unselected idea is chosen', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()

        render(
            <OnboardingIdeaTeaser
                ideas={[makeIdea({ slug: 'cli-scaffold' })]}
                selectedSlug={null}
                onSelect={onSelect}
                techNamesById={techNamesById}
            />,
        )

        await user.click(screen.getByRole('radio'))

        expect(onSelect).toHaveBeenCalledWith('cli-scaffold')
    })

    it('calls onSelect with null when the already-selected idea is clicked again', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()

        render(
            <OnboardingIdeaTeaser
                ideas={[makeIdea({ slug: 'cli-scaffold' })]}
                selectedSlug="cli-scaffold"
                onSelect={onSelect}
                techNamesById={techNamesById}
            />,
        )

        await user.click(screen.getByRole('radio'))

        expect(onSelect).toHaveBeenCalledWith(null)
    })

    it('renders nothing when there are no ideas', () => {
        const { container } = render(
            <OnboardingIdeaTeaser
                ideas={[]}
                selectedSlug={null}
                onSelect={vi.fn()}
                techNamesById={techNamesById}
            />,
        )

        expect(container).toBeEmptyDOMElement()
        expect(screen.queryByText('ver todas las ideas')).not.toBeInTheDocument()
    })
})
