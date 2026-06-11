import { render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ProjectChat } from './project-chat';

const mockState = vi.hoisted(() => ({
    private: vi.fn(),
    leave: vi.fn(),
    listen: vi.fn(),
    stopListening: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: { body: '' },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        reset: vi.fn(),
    }),
}));

vi.mock('lucide-react', () => ({
    Send: () => <span />,
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
        // @ts-expect-error test cleanup
        delete window.Echo;
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
});
