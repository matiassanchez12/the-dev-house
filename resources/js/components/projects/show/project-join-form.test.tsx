import { render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectJoinForm } from './project-join-form';

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
    useForm: () => ({
        data: { message: '' },
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
    });
});
