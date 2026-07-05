import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ButtonHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectJoinForm } from './project-join-form';

const mockState = vi.hoisted(() => ({
    post: vi.fn(),
    setData: vi.fn(),
    reset: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
    useForm: () => ({
        data: { message: '' },
        setData: mockState.setData,
        post: mockState.post,
        processing: false,
        errors: {},
        reset: mockState.reset,
    }),
}));

vi.mock('lucide-react', () => ({
    Send: () => <span />,
    Clock: () => <span />,
    X: () => <span />,
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

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/label', () => ({
    Label: ({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock('@/components/input-error', () => ({
    default: () => null,
}));

describe('ProjectJoinForm', () => {
    it('replaces the form with a pending state when viewer has a pending join request', () => {
        render(
            <ProjectJoinForm
                projectId={1}
                isOpen
                isCreator={false}
                isParticipant={false}
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    created_at: '2026-06-07T00:00:00.000Z',
                    updated_at: '2026-06-07T00:00:00.000Z',
                }}
                viewerJoinRequest={{ id: 5, status: 'pending' }}
            />,
        );

        expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
        expect(screen.getByText('Ya enviaste una solicitud para unirte a este proyecto.')).toBeInTheDocument();
        expect(screen.queryByText('Enviar Solicitud')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar solicitud' })).toBeInTheDocument();
    });

    it('renders rejected state when the join request was rejected', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn().mockReturnValue('/projects'),
        });

        render(
            <ProjectJoinForm
                projectId={1}
                isOpen
                isCreator={false}
                isParticipant={false}
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    created_at: '2026-06-07T00:00:00.000Z',
                    updated_at: '2026-06-07T00:00:00.000Z',
                }}
                viewerJoinRequest={{ id: 5, status: 'rejected', message: 'Thanks but no thanks' }}
            />,
        );

        expect(screen.getByText('Solicitud rechazada')).toBeInTheDocument();
        expect(screen.getByText('Tu solicitud para unirte a este proyecto fue rechazada.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Explorar otros proyectos' })).toBeInTheDocument();
    });

    it('returns null when viewer is already a participant', () => {
        const { container } = render(
            <ProjectJoinForm
                projectId={1}
                isOpen
                isCreator={false}
                isParticipant
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    created_at: '2026-06-07T00:00:00.000Z',
                    updated_at: '2026-06-07T00:00:00.000Z',
                }}
            />,
        );

        expect(container.innerHTML).toBe('');
    });

    it('shows the not-accepting-requests state when the project no longer accepts join requests', () => {
        render(
            <ProjectJoinForm
                projectId={1}
                isOpen={false}
                isCreator={false}
                isParticipant={false}
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    created_at: '2026-06-07T00:00:00.000Z',
                    updated_at: '2026-06-07T00:00:00.000Z',
                }}
            />,
        );

        expect(screen.getByText('Este proyecto no acepta nuevas solicitudes')).toBeInTheDocument();
        expect(screen.queryByText('Enviar Solicitud')).not.toBeInTheDocument();
    });

    it('renders the join form when the project can accept requests', () => {
        render(
            <ProjectJoinForm
                projectId={1}
                isOpen
                isCreator={false}
                isParticipant={false}
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    created_at: '2026-06-07T00:00:00.000Z',
                    updated_at: '2026-06-07T00:00:00.000Z',
                }}
            />,
        );

        expect(screen.getByText('Enviar Solicitud')).toBeInTheDocument();
    });

    it('cancels the pending join request from the replacement state', async () => {
        const user = userEvent.setup();

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn().mockReturnValue('/join-requests/5/cancel'),
        });

        render(
            <ProjectJoinForm
                projectId={1}
                isOpen
                isCreator={false}
                isParticipant={false}
                user={{
                    id: 1,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    created_at: '2026-06-07T00:00:00.000Z',
                    updated_at: '2026-06-07T00:00:00.000Z',
                }}
                viewerJoinRequest={{ id: 5, status: 'pending' }}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Cancelar solicitud' }));

        expect(mockState.post).toHaveBeenCalledWith('/join-requests/5/cancel', expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        }));
    });
});
