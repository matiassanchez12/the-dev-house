import { fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ProjectChat } from './project-chat';
import type { Message } from '@/types';

const mockState = vi.hoisted(() => ({
    private: vi.fn(),
    leave: vi.fn(),
    listen: vi.fn(),
    stopListening: vi.fn(),
    post: vi.fn(),
    data: { body: '' },
}));

let messageHandler: ((message: Message) => void) | undefined;

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: mockState.data,
        setData: vi.fn((field: string, value: string) => {
            if (field === 'body') {
                mockState.data.body = value;
            }
        }),
        post: mockState.post,
        processing: false,
        errors: {},
        reset: vi.fn(),
    }),
}));

vi.mock('lucide-react', () => ({
    Send: () => <span />,
    Loader2: () => <span />,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarFallback: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarImage: () => <img />,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock('@/components/ui/form-error', () => ({
    FormError: () => null,
}));

describe('ProjectChat', () => {
    beforeEach(() => {
        mockState.private.mockReturnValue({
            listen: mockState.listen,
            stopListening: mockState.stopListening,
        });

        Object.defineProperty(window, 'Echo', {
            configurable: true,
            value: {
                private: mockState.private,
                leave: mockState.leave,
            },
        });
    });

    afterEach(() => {
        mockState.private.mockClear();
        mockState.leave.mockClear();
        mockState.listen.mockClear();
        mockState.stopListening.mockClear();
        mockState.post.mockClear();
        mockState.data.body = '';
        // @ts-expect-error test cleanup
        delete window.Echo;
        // @ts-expect-error test cleanup
        delete globalThis.route;
    });

    it('does not subscribe when the server omits messages', async () => {
        render(<ProjectChat projectId={1} projectSlug="alpha" currentUserId={1} />);

        await waitFor(() => {
            expect(mockState.private).not.toHaveBeenCalled();
        });
    });

    it('subscribes when messages are available', async () => {
        render(
            <ProjectChat
                projectId={1}
                projectSlug="alpha"
                currentUserId={1}
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
                ]}
            />,
        );

        await waitFor(() => {
            expect(mockState.private).toHaveBeenCalledWith('project.1');
        });
    });

    it('shows the Ctrl + Enter hint text', async () => {
        const { getByText } = render(
            <ProjectChat
                projectId={1}
                projectSlug="alpha"
                currentUserId={1}
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
                ]}
            />,
        );

        expect(getByText('para enviar')).toBeInTheDocument();
    });

    it('sends the message when Ctrl + Enter is pressed', async () => {
        const { getByRole } = render(
            <ProjectChat
                projectId={1}
                projectSlug="alpha"
                currentUserId={1}
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
                ]}
            />,
        );

        const textarea = getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'Test message' } });
        fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

        await waitFor(() => {
            expect(mockState.post).toHaveBeenCalled();
        });
    });

    it('does not send when Enter is pressed without Ctrl', async () => {
        const { getByRole } = render(
            <ProjectChat
                projectId={1}
                projectSlug="alpha"
                currentUserId={1}
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
                ]}
            />,
        );

        const textarea = getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'Test message' } });
        fireEvent.keyDown(textarea, { key: 'Enter' });

        expect(mockState.post).not.toHaveBeenCalled();
    });

    it('shows the new messages button when a realtime message arrives while scrolled up', async () => {
        const { container, getByRole } = render(
            <ProjectChat
                projectId={1}
                projectSlug="alpha"
                currentUserId={1}
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
                ]}
            />,
        );

        const scrollContainer = container.querySelector('.scrollbar-chat') as HTMLDivElement;
        Object.defineProperty(scrollContainer, 'scrollHeight', { configurable: true, value: 1000 });
        Object.defineProperty(scrollContainer, 'clientHeight', { configurable: true, value: 200 });
        Object.defineProperty(scrollContainer, 'scrollTop', { configurable: true, value: 100, writable: true });

        scrollContainer.dispatchEvent(new Event('scroll'));

        messageHandler?.({
            id: 2,
            project_id: 1,
            user_id: 2,
            body: 'Nuevo mensaje',
            type: 'text',
            created_at: '2026-06-10T00:02:00.000Z',
            updated_at: '2026-06-10T00:02:00.000Z',
        });

        await waitFor(() => {
            expect(getByRole('button', { name: 'Ver nuevos mensajes' })).toBeInTheDocument();
        });
    });
});
