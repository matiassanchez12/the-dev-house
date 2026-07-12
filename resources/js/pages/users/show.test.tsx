import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Show from './show'

const mockState = vi.hoisted(() => ({
    headerUser: undefined as undefined | Record<string, unknown>,
    showcaseProps: undefined as undefined | Record<string, unknown>,
}))

vi.mock('@/components/seo', () => ({
    default: () => null,
}))

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/user/user-profile-header', () => ({
    UserProfileHeader: ({ user }: { user: Record<string, unknown> }) => {
        mockState.headerUser = user
        return <div data-testid="profile-header" />
    },
}))

vi.mock('@/components/user/project-showcase', () => ({
    ProjectShowcase: (props: {
        createdProjects: unknown[]
        participatingProjects: unknown[]
        showActivity?: boolean
    }) => {
        mockState.showcaseProps = props
        return <div data-testid="project-showcase" />
    },
}))

vi.mock('@/components/user/tech-showcase', () => ({
    TechShowcase: () => <div data-testid="tech-showcase" />,
}))

describe('Users/Show', () => {
    beforeEach(() => {
        mockState.headerUser = undefined
        mockState.showcaseProps = undefined
    })

    it('passes the public profile data and derived activity visibility to child components', () => {
        render(
            <Show
                auth={{ user: null }}
                user={buildUser({
                    email: 'ada@example.com',
                    phone: '555-1234',
                    privacySetting: { show_activity: false },
                })}
            />,
        )

        expect(mockState.headerUser).toMatchObject({
            email: 'ada@example.com',
            phone: '555-1234',
            privacySetting: { show_activity: false },
        })
        expect(mockState.showcaseProps).toMatchObject({
            showActivity: false,
        })
    })

    it('defaults activity visibility to true when privacy settings are missing', () => {
        render(<Show auth={{ user: null }} user={buildUser()} />)

        expect(mockState.showcaseProps).toMatchObject({
            showActivity: true,
        })
    })
})

function buildUser(overrides?: Record<string, unknown>) {
    return {
        id: 1,
        name: 'Ada Lovelace',
        bio: null,
        avatar: null,
        created_at: '2026-01-01T00:00:00.000Z',
        socialLinks: [],
        createdProjects: [],
        participatingProjects: [],
        techs: [],
        ...overrides,
    }
}
