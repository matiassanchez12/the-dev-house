import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserProfileHeader } from './user-profile-header'

function buildUser(overrides?: Partial<Parameters<typeof UserProfileHeader>[0]['user']>) {
    return {
        id: 1,
        name: 'Ada Lovelace',
        bio: 'Bio corta de ejemplo.',
        avatar: null,
        created_at: '2026-01-01T00:00:00.000Z',
        socialLinks: [],
        createdProjects: [],
        participatingProjects: [],
        techs: [],
        ...overrides,
    }
}

describe('UserProfileHeader', () => {
    it('hides the toggle for short bios', () => {
        render(
            <UserProfileHeader
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    bio: 'Bio corta de ejemplo.',
                    avatar: null,
                    created_at: '2026-01-01T00:00:00.000Z',
                    socialLinks: [],
                    createdProjects: [],
                    participatingProjects: [],
                    techs: [],
                }}
            />,
        )

        expect(screen.queryByRole('button', { name: 'Ver más' })).not.toBeInTheDocument()
        expect(screen.getByText('Bio corta de ejemplo.')).toBeInTheDocument()
    })

    it('toggles the bio inline without opening a dialog', () => {
        const longBio = Array.from({ length: 30 }, (_, index) => `Texto largo ${index + 1}`).join(
            ' ',
        )

        render(
            <UserProfileHeader
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    bio: longBio,
                    avatar: null,
                    created_at: '2026-01-01T00:00:00.000Z',
                    socialLinks: [],
                    createdProjects: [],
                    participatingProjects: [],
                    techs: [],
                }}
            />,
        )

        const bio = screen.getByText(longBio)
        const toggle = screen.getByRole('button', { name: 'Ver más' })

        expect(bio).toHaveClass('line-clamp-3')
        expect(toggle).toHaveAttribute('aria-expanded', 'false')

        fireEvent.click(toggle)

        expect(screen.getByRole('button', { name: 'Ver menos' })).toHaveAttribute(
            'aria-expanded',
            'true',
        )
        expect(screen.getByText(longBio)).not.toHaveClass('line-clamp-3')
    })

    it('renders contact links when email and phone are present', () => {
        render(
            <UserProfileHeader
                user={buildUser({
                    email: 'ada@example.com',
                    phone: '555-1234',
                })}
            />,
        )

        expect(screen.getByRole('link', { name: 'ada@example.com' })).toHaveAttribute(
            'href',
            'mailto:ada@example.com',
        )
        expect(screen.getByRole('link', { name: '555-1234' })).toHaveAttribute(
            'href',
            'tel:555-1234',
        )
    })

    it('renders privacy indicators when contact data is hidden', () => {
        render(<UserProfileHeader user={buildUser()} />)

        expect(screen.getByText('Correo electrónico privado')).toBeInTheDocument()
        expect(screen.getByText('Teléfono privado')).toBeInTheDocument()
    })
})
