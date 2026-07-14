import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroBackground } from './hero-background'

describe('HeroBackground', () => {
    it('lets the lower glow bleed past the hero bottom without clipping it vertically', () => {
        const { container } = render(<HeroBackground />)

        const root = container.firstElementChild as HTMLElement

        // The background layer is decorative and non-interactive.
        expect(root).toHaveAttribute('aria-hidden', 'true')
        expect(root).toHaveClass('pointer-events-none')

        // Continuity contract: the wrapper must NOT clip on the vertical axis,
        // otherwise the lower glow anchored below the hero box is cut off
        // before it can bleed into the stats section. We assert the ABSENCE
        // of vertical clipping (behavior) rather than a specific token.
        expect(root).not.toHaveClass('overflow-hidden')
        expect(root).not.toHaveClass('overflow-y-hidden')
        expect(root).not.toHaveClass('overflow-y-clip')

        const layers = Array.from(root.children) as HTMLElement[]
        expect(layers).toHaveLength(3)

        const lowerGlow = layers[2]

        // Only the lower glow is animated, and it respects reduced motion.
        expect(lowerGlow).toHaveClass('animate-float-slow')
        expect(lowerGlow).toHaveClass('motion-reduce:animate-none')

        // The lower glow is anchored below the hero box so it bleeds into stats.
        // Matching a negative-bottom pattern verifies bleed intent without
        // coupling the test to an exact pixel value.
        expect(lowerGlow.className).toMatch(/-bottom-\d+/)
    })
})