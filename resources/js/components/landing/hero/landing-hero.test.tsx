import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LandingHero from '../landing-hero'

vi.mock('@/components/landing/hero/hero-background', () => ({
    HeroBackground: () => <div data-testid="hero-background" />,
}))

vi.mock('@/components/landing/hero/hero-tech-background', () => ({
    HeroTechBackground: () => <div data-testid="hero-tech-background" />,
}))

vi.mock('@inertiajs/react', () => ({
    Link: ({
        children,
        className,
        href,
    }: {
        children: ReactNode
        className?: string
        href: string
    }) => (
        <a className={className} href={href}>
            {children}
        </a>
    ),
}))

beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string) => `/${name}`),
    })
})

describe('LandingHero', () => {
    it('lets the background bleed vertically by using overflow-x-clip (not overflow-x-hidden)', () => {
        const { container } = render(<LandingHero auth={{ user: null }} techs={[]} user_count={12} />)

        const section = container.querySelector('section') as HTMLElement
        expect(section).not.toBeNull()

        // overflow-x-hidden would rewrite overflow-y-visible to `auto` per the
        // CSS Overflow spec, clipping the lower glow's bleed into the stats
        // section. overflow-x-clip keeps the y axis truly visible.
        expect(section).toHaveClass('overflow-x-clip')
        expect(section).toHaveClass('overflow-y-visible')
        expect(section).not.toHaveClass('overflow-x-hidden')
        expect(section).not.toHaveClass('overflow-hidden')
    })

    it('renders a live trust badge, one headline, both CTAs, and a visible wordmark', () => {
        render(<LandingHero auth={{ user: null }} techs={[]} user_count={12} />)

        expect(screen.getByText('+12 developers building now')).toBeVisible()
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

        const primaryCta = screen.getByRole('link', { name: 'Crear mi perfil' })
        const secondaryCta = screen.getByRole('link', { name: 'Ver proyectos' })

        expect(primaryCta).toHaveAttribute('href', '/register')
        expect(secondaryCta).toHaveAttribute('href', '/projects.index')
        expect(primaryCta.querySelector('svg')).not.toBeNull()
        expect(screen.getByText(/build with intent/i)).toBeVisible()
    })

    it('keeps the badge valid at zero and switches the primary path for authenticated visitors', () => {
        render(<LandingHero auth={{ user: { id: 7, name: 'Ada' } }} techs={[]} user_count={0} />)

        expect(screen.getByText('+0 developers building now')).toBeVisible()

        const primaryCta = screen.getByRole('link', { name: 'Crear proyecto' })

        expect(primaryCta).toHaveAttribute('href', '/projects.create')
        expect(screen.getByText(/build with intent/i)).toBeVisible()
    })
})
