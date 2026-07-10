import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CollaboratorSuggestionCard from './collaborator-suggestion-card';

vi.mock('@inertiajs/react', () => ({
    router: {
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string) => {
            if (name === 'project-invitations.store') {
                return '/project-invitations';
            }

            if (name === 'project-invitations.destroy') {
                return '/project-invitations/1';
            }

            return '/projects/alpha';
        }),
    });
});

describe('collaborator suggestion card', () => {
    it('sends an invitation for an eligible suggestion', () => {
        render(
            <CollaboratorSuggestionCard
                projectSlug="alpha"
                suggestion={{
                    user: {
                        id: 2,
                        name: 'Maya',
                        slug: 'maya',
                        bio: null,
                        avatar: null,
                        created_projects_count: 0,
                        joined_projects_count: 0,
                        techs: [{ id: 1, name: 'React', slug: 'react' }],
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                    },
                    matching_techs: [{ id: 1, name: 'React', slug: 'react' }],
                    pending_invitation: null,
                }}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));

        expect(globalThis.route).toHaveBeenCalledWith('project-invitations.store', 'alpha');
    });

    it('cancels a pending invitation instead of showing the invite button', () => {
        render(
            <CollaboratorSuggestionCard
                projectSlug="alpha"
                suggestion={{
                    user: {
                        id: 2,
                        name: 'Maya',
                        slug: 'maya',
                        bio: null,
                        avatar: null,
                        created_projects_count: 0,
                        joined_projects_count: 0,
                        techs: [{ id: 1, name: 'React', slug: 'react' }],
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                    },
                    matching_techs: [{ id: 1, name: 'React', slug: 'react' }],
                    pending_invitation: {
                        id: 1,
                        project_id: 10,
                        invited_user_id: 2,
                        status: 'pending',
                        message: 'Join us',
                        cancelled_at: null,
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                    },
                }}
            />,
        );

        expect(screen.queryByRole('button', { name: 'Send invitation' })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel invitation' }));

        expect(globalThis.route).toHaveBeenCalledWith('project-invitations.destroy', 1);
    });
});
