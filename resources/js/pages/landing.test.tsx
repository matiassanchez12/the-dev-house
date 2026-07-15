import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import Landing from './landing'

const mockState = vi.hoisted(() => ({
    landingHeroProps: undefined as undefined | Record<string, unknown>,
    landingStatsProps: undefined as undefined | Record<string, unknown>,
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

vi.mock('@/components/landing/landing-stats', () => ({
    default: (props: Record<string, unknown>) => {
        mockState.landingStatsProps = props
        return <section data-testid="landing-stats">Stats</section>
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
    it('renders LandingStats below the hero with the controller counts', () => {
        mockState.landingHeroProps = undefined
        mockState.landingStatsProps = undefined

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

        const hero = screen.getByTestId('landing-hero')
        const stats = screen.getByTestId('landing-stats')

        expect(mockState.landingHeroProps).toMatchObject({ user_count: 19 })
        expect(mockState.landingStatsProps).toMatchObject({
            user_count: 19,
            project_count: 8,
            collaboration_count: 3,
        })
        expect(hero.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        )
    })

    it('keeps LandingStats wired to the explicit counts even when collections are empty', () => {
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

        expect(mockState.landingStatsProps).toMatchObject({
            user_count: 0,
            project_count: 0,
            collaboration_count: 0,
        })
    })
})
