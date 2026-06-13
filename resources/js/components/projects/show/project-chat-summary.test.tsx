import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ProjectChatSummary } from './project-chat-summary';

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}));

vi.mock('lucide-react', () => ({
    MessageSquare: () => <span />, 
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

describe('ProjectChatSummary', () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn().mockReturnValue('/projects/alpha/chat'),
        });
    });

    afterEach(() => {
        // @ts-expect-error test cleanup
        delete globalThis.route;
    });

    it('renders the message count, latest message and chat link', () => {
        render(
            <ProjectChatSummary
                projectSlug="alpha"
                messagesCount={2}
                messages={[
                    {
                        id: 1,
                        project_id: 1,
                        user_id: 1,
                        body: 'Hola',
                        type: 'text',
                        created_at: '2026-06-10T00:00:00.000Z',
                        updated_at: '2026-06-10T00:00:00.000Z',
                    },
                    {
                        id: 2,
                        project_id: 1,
                        user_id: 1,
                        body: '¿Todo bien?',
                        type: 'text',
                        created_at: '2026-06-10T00:01:00.000Z',
                        updated_at: '2026-06-10T00:01:00.000Z',
                    },
                ]}
            />,
        );

        expect(screen.getByText('2 mensajes')).toBeInTheDocument();
        expect(screen.getByText(/Último:/)).toHaveTextContent('¿Todo bien?');
        expect(screen.getByRole('link', { name: 'Abrir chat' })).toHaveAttribute('href', '/projects/alpha/chat');
    });

    it('renders the empty state when there are no messages', () => {
        render(<ProjectChatSummary projectSlug="alpha" messagesCount={0} />);

        expect(screen.getByText('0 mensajes')).toBeInTheDocument();
        expect(screen.getByText('Todavía no hay mensajes.')).toBeInTheDocument();
    });
});
