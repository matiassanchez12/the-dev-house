import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Index from './index';

const mockState = vi.hoisted(() => ({
    post: vi.fn(),
    reload: vi.fn(),
    route: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
    useForm: () => ({
        post: mockState.post,
        processing: false,
    }),
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('lucide-react', () => ({
    Check: () => <span />,
    X: () => <span />,
    Clock: () => <span />,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const receivedRequests = [
    {
        id: 1,
        project_id: 10,
        user_id: 20,
        message: 'Hola',
        status: 'pending' as const,
        created_at: '2026-06-10T00:00:00.000Z',
        updated_at: '2026-06-10T00:00:00.000Z',
        applicant: { id: 20, name: 'Ada', email: 'ada@example.com', created_at: '', updated_at: '', slug: 'ada' },
        project: { id: 10, user_id: 1, title: 'Project', slug: 'project', description: '', status: 'open', created_at: '', updated_at: '', creator: { id: 1, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '', slug: 'grace' } },
    },
];

const sentRequests = [
    {
        id: 2,
        project_id: 11,
        user_id: 20,
        message: 'Quiero unirme',
        status: 'pending' as const,
        created_at: '2026-06-10T00:00:00.000Z',
        updated_at: '2026-06-10T00:00:00.000Z',
        project: { id: 11, user_id: 1, title: 'Project 2', slug: 'project-2', description: '', status: 'open', created_at: '', updated_at: '', creator: { id: 1, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '', slug: 'grace' } },
    },
];

describe('JoinRequests index', () => {
    it('removes received requests optimistically and restores them on error', async () => {
        const user = userEvent.setup();
        let capturedOptions: { onError?: () => void } | undefined;

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: mockState.route,
        });

        mockState.route.mockImplementation((name: string) => {
            if (name === 'join-requests.approve') return '/join-requests/1/approve';
            return '/';
        });

        mockState.post.mockImplementation((_url: string, options: { onError?: () => void }) => {
            capturedOptions = options;
        });

        render(
            <Index
                auth={{ user: { id: 1, name: 'Grace' } }}
                receivedRequests={receivedRequests}
                sentRequests={sentRequests}
            />,
        );

        expect(screen.getByText('Ada')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /aprobar/i }));

        expect(screen.queryByText('Ada')).not.toBeInTheDocument();

        capturedOptions?.onError?.();

        await waitFor(() => {
            expect(screen.getByText('Ada')).toBeInTheDocument();
        });
    });

    it('removes sent requests optimistically', async () => {
        const user = userEvent.setup();

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: mockState.route,
        });

        mockState.route.mockImplementation((name: string) => {
            if (name === 'join-requests.cancel') return '/join-requests/2/cancel';
            return '/';
        });

        mockState.post.mockImplementation(() => undefined);

        render(
            <Index
                auth={{ user: { id: 1, name: 'Grace' } }}
                receivedRequests={receivedRequests}
                sentRequests={sentRequests}
            />,
        );

        expect(screen.getByText('Project 2')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(screen.queryByText('Project 2')).not.toBeInTheDocument();
    });
});
