import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LandingStats from './landing-stats'

vi.mock('@/hooks/use-in-view', () => ({
    useInView: vi.fn(() => [vi.fn(), true]),
}))

vi.mock('@/hooks/use-count-up', () => ({
    useCountUp: vi.fn((target: number) => target),
}))

describe('LandingStats', () => {
    it('opens a top-edge blend that softens the hero glow bleeding into it', () => {
        const { container } = render(
            <LandingStats user_count={12} project_count={5} collaboration_count={3} />,
        )

        const section = container.querySelector('section') as HTMLElement

        // Top padding creates the breathing room that receives the hero bleed.
        // Asserting a top-padding scale (not an exact token) keeps the test
        // about the continuity contract, not a specific spacing value.
        expect(section.className).toMatch(/pt-\d+/)

        // The continuity receiver: an aria-hidden, non-interactive overlay that
        // blends from the page background down to transparent.
        const overlay = (Array.from(section.children) as HTMLElement[]).find(
            (node) =>
                node.getAttribute('aria-hidden') === 'true' &&
                node.className.includes('bg-gradient-to-b'),
        )

        expect(overlay).toBeDefined()
        expect(overlay).toHaveClass('pointer-events-none')
        // Blend direction: starts from a background tone and fades out downward,
        // softening the hero glow that bleeds in from above.
        expect(overlay!.className).toMatch(/from-/)
        expect(overlay!.className).toMatch(/to-transparent/)

        expect(screen.getByText('12')).toBeVisible()
        expect(screen.getByText('5')).toBeVisible()
        expect(screen.getByText('3')).toBeVisible()
    })
})