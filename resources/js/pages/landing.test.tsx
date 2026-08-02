import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import Landing from './landing'

const mockState = vi.hoisted(() => ({
    landingHeroProps: undefined as undefined | Record<string, unknown>,
}))

vi.mock('@/components/seo', () => ({
    default: () => null,
}))

vi.mock('@/components/landing/landing-nav', () => ({
    default: () => <nav data-testid="landing-nav" />,
}))

vi.mock('@/components/landing/landing-hero', () => ({
    default: (props: Record<string, unknown>) => {
        mockState.landingHeroProps = props
        return <section data-testid="landing-hero">Hero</section>
    },
}))

vi.mock('@/components/landing/landing-how-it-works', () => ({
    default: () => <div data-testid="landing-how-it-works" />,
}))

vi.mock('@/components/landing/landing-manifesto', () => ({
    default: () => <div data-testid="landing-manifesto" />,
}))

vi.mock('@/components/landing/landing-footer', () => ({
    default: () => <footer data-testid="landing-footer" />,
}))

vi.mock('@/components/landing/landing-features', () => ({
    default: () => <div data-testid="landing-features" />,
}))

vi.mock('@/components/landing/landing-projects', () => ({
    default: ({ projects }: { projects: unknown }) => (
        <div data-testid="landing-projects" data-projects={JSON.stringify(projects)} />
    ),
}))

vi.mock('@/components/landing/landing-social', () => ({
    default: ({ developers }: { developers: unknown[] }) => (
        <div data-testid="landing-social" data-count={developers.length} />
    ),
}))

describe('Landing page wiring', () => {
    it('renders the current landing sections and passes the controller data to hero, social proof, and projects', () => {
        mockState.landingHeroProps = undefined

        render(
            <Landing
                auth={{ user: null }}
                projects={{ data: [], total: 0 }}
                user_count={19}
                project_count={8}
                collaboration_count={3}
                users={[]}
                techs={[]}
            />,
        )

        expect(mockState.landingHeroProps).toMatchObject({ user_count: 19 })
        expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
        expect(screen.queryByTestId('landing-stats')).not.toBeInTheDocument()
        expect(screen.getByTestId('landing-social')).toHaveAttribute('data-count', '0')
        expect(screen.getByTestId('landing-projects')).toHaveAttribute(
            'data-projects',
            JSON.stringify({ data: [], total: 0 }),
        )
    })

    it('keeps hero wiring stable when explicit counts are zero and collections are empty', () => {
        mockState.landingHeroProps = undefined

        render(
            <Landing
                auth={{ user: null }}
                projects={{ data: [], total: 0 }}
                user_count={0}
                project_count={0}
                collaboration_count={0}
                users={[]}
                techs={[]}
            />,
        )

        expect(mockState.landingHeroProps).toMatchObject({ user_count: 0 })
        expect(screen.getByTestId('landing-social')).toHaveAttribute('data-count', '0')
        expect(screen.getByTestId('landing-projects')).toHaveAttribute(
            'data-projects',
            JSON.stringify({ data: [], total: 0 }),
        )
    })
})
