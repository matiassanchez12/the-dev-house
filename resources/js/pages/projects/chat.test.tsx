import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Chat from './chat';

vi.mock('@/components/seo', () => ({
    default: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => (
        <div>
            <main>{children}</main>
        </div>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/projects/show', () => ({
    ProjectChat: ({ projectSlug }: { projectSlug: string }) => <div data-testid="project-chat">{projectSlug}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}));

describe('projects/chat page', () => {
    it('renders the dedicated chat layout and back link', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug: string) => {
                if (name === 'projects.show') {
                    return `/projects/${slug}`;
                }

                return `/projects/${slug}/chat`;
            }),
        });

        render(
            <Chat
                auth={{ user: { id: 1, name: 'Ada' } }}
                project={{
                    id: 1,
                    user_id: 1,
                    title: 'Alpha',
                    slug: 'alpha',
                    description: 'Desc',
                    status: 'open',
                    created_at: '2026-06-10T00:00:00.000Z',
                    updated_at: '2026-06-10T00:00:00.000Z',
                    creator: { id: 1, name: 'Ada', email: 'ada@example.com', created_at: '2026-06-10T00:00:00.000Z', updated_at: '2026-06-10T00:00:00.000Z' },
                    participants: [],
                    messages: [],
                }}
            />,
        );

        expect(screen.getByTestId('seo')).toHaveTextContent('Alpha · Chat');
        expect(screen.getByRole('link', { name: 'Volver al proyecto' })).toHaveAttribute('href', '/projects/alpha');
        expect(screen.getByTestId('project-chat')).toHaveTextContent('alpha');

        // @ts-expect-error test cleanup
        delete globalThis.route;
    });
});
