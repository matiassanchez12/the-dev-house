import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Collaborators from './collaborators';

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children, header }: { children: ReactNode; header?: ReactNode }) => (
        <div>
            {header}
            {children}
        </div>
    ),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}));

vi.mock('@/components/projects/collaborator-suggestion-card', () => ({
    default: ({ suggestion }: { suggestion: { user: { name: string } } }) => (
        <div data-testid="suggestion-card">{suggestion.user.name}</div>
    ),
}));

describe('projects/collaborators page', () => {
    it('renders the suggestion and pending invitation sections with a skip link', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string) => (name === 'projects.show' ? '/projects/alpha' : '/projects/alpha/collaborators')),
        });

        render(
            <Collaborators
                auth={{ user: { id: 1, name: 'Ada' } }}
                project={{
                    id: 1,
                    user_id: 1,
                    title: 'Alpha',
                    slug: 'alpha',
                    description: 'Desc',
                    status: 'open',
                    created_at: '2026-07-01T00:00:00.000Z',
                    updated_at: '2026-07-01T00:00:00.000Z',
                    creator: { id: 1, name: 'Ada', email: 'ada@example.com', created_at: '2026-07-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' },
                    techs: [{ id: 1, name: 'React', slug: 'react', created_at: '2026-07-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' }],
                }}
                suggestions={[{
                    user: {
                        id: 2,
                        name: 'Maya',
                        email: 'maya@example.com',
                        slug: 'maya',
                        bio: null,
                        avatar: null,
                        techs: [],
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                    },
                    matching_techs: [],
                    pending_invitation: null,
                }]}
                pendingInvitations={[{
                    id: 10,
                    project_id: 1,
                    invited_user_id: 3,
                    status: 'pending',
                    message: 'Join us',
                    cancelled_at: null,
                    created_at: '2026-07-01T00:00:00.000Z',
                    updated_at: '2026-07-01T00:00:00.000Z',
                    invitedUser: {
                        id: 3,
                        name: 'Nico',
                        email: 'nico@example.com',
                        slug: 'nico',
                        bio: null,
                        avatar: null,
                        techs: [],
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                    },
                }]}
            />,
        );

        expect(screen.getByText('Find collaborators')).toBeInTheDocument();
        expect(screen.getAllByTestId('suggestion-card')).toHaveLength(2);
        expect(screen.getByText('Maya')).toBeInTheDocument();
        expect(screen.getByText('Nico')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Skip for now' })).toHaveAttribute('href', '/projects/alpha');

        // @ts-expect-error test cleanup
        delete globalThis.route;
    });
});
