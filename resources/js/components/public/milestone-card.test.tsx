import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MilestoneCard } from './milestone-card';

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/image-gallery-dialog', () => ({
    ImageGalleryDialog: () => null,
}));

beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
    });
});

describe('MilestoneCard unread state', () => {
    it('shows unread indicator when backend flag is true', () => {
        render(
            <MilestoneCard
                milestone={{
                    id: 1,
                    project_id: 7,
                    title: 'Ship it',
                    description: 'Release day',
                    created_at: '2026-07-30T10:00:00.000Z',
                    updated_at: '2026-07-30T10:00:00.000Z',
                    completed_at: '2026-07-30T10:00:00.000Z',
                    image: null,
                    project: {
                        id: 7,
                        user_id: 1,
                        title: 'Alpha',
                        slug: 'alpha',
                        description: 'Project',
                        status: 'open',
                        has_unread_public_updates: true,
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                        creator: { id: 1, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '' },
                    },
                }}
            />,
        );

        expect(screen.getByText('New updates')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute('href', '/projects.show/alpha');
    });

    it('does not show unread indicator when backend flag is false', () => {
        render(
            <MilestoneCard
                milestone={{
                    id: 1,
                    project_id: 7,
                    title: 'Ship it',
                    description: 'Release day',
                    created_at: '2026-07-30T10:00:00.000Z',
                    updated_at: '2026-07-30T10:00:00.000Z',
                    completed_at: '2026-07-30T10:00:00.000Z',
                    image: null,
                    project: {
                        id: 7,
                        user_id: 1,
                        title: 'Alpha',
                        slug: 'alpha',
                        description: 'Project',
                        status: 'open',
                        has_unread_public_updates: false,
                        created_at: '2026-07-01T00:00:00.000Z',
                        updated_at: '2026-07-01T00:00:00.000Z',
                        creator: { id: 1, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '' },
                    },
                }}
            />,
        );

        expect(screen.queryByText('New updates')).not.toBeInTheDocument();
    });
});
