import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LandingHero from './landing-hero'
import LandingStats from './landing-stats'

// Only the inertia Link needs stubbing for the hero CTAs; the background and
// stats components render for real so we can assert the continuity contract.
vi.mock('@inertiajs/react', () => ({
    Link: ({
        children,
        href,
        className,
    }: {
        children: ReactNode
        href: string
        className?: string
    }) => (
        <a className={className} href={href}>
            {children}
        </a>
    ),
}))

vi.mock('@/hooks/use-in-view', () => ({
    useInView: vi.fn(() => [vi.fn(), true]),
}))

vi.mock('@/hooks/use-count-up', () => ({
    useCountUp: vi.fn((target: number) => target),
}))

beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string) => `/${name}`),
    })
})

describe('hero → stats visual continuity', () => {
    it('renders the hero background unclipped vertically above a stats blend overlay', () => {
        const { container } = render(
            <>
                <LandingHero auth={{ user: null }} techs={[]} user_count={12} />
                <LandingStats user_count={12} project_count={5} collaboration_count={3} />
            </>,
        )

        const sections = Array.from(container.querySelectorAll('section')) as HTMLElement[]
        expect(sections).toHaveLength(2)

        const [heroSection, statsSection] = sections

        // Stats follows the hero in document order — the bleed path.
        expect(
            heroSection.compareDocumentPosition(statsSection) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

        // The hero background layer is the first child of the hero section
        // (HeroBackground is rendered before HeroTechBackground).
        const heroBackground = heroSection.firstElementChild as HTMLElement
        expect(heroBackground).toHaveAttribute('aria-hidden', 'true')

        // Continuity contract: the hero background wrapper must NOT clip on the
        // vertical axis, so the lower glow can bleed down into the stats section.
        expect(heroBackground.className).not.toMatch(/overflow-hidden/)
        expect(heroBackground.className).not.toMatch(/overflow-y-hidden/)
        expect(heroBackground.className).not.toMatch(/overflow-y-clip/)

        // The stats section provides a top-edge blend overlay that softens the
        // incoming glow — aria-hidden, non-interactive, fading down to transparent.
        const blendOverlay = (Array.from(statsSection.children) as HTMLElement[]).find(
            (node) =>
                node.getAttribute('aria-hidden') === 'true' &&
                node.className.includes('bg-gradient-to-b') &&
                node.className.includes('to-transparent'),
        )
        expect(blendOverlay).toBeDefined()
        expect(blendOverlay).toHaveClass('pointer-events-none')
    })
})