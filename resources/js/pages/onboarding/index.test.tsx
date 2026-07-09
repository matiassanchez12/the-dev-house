import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import OnboardingIndex from './index';

const mockState = vi.hoisted(() => ({
    post: vi.fn(),
    props: {
        auth: { user: { id: 1, name: 'Ada Lovelace' } },
        user: { bio: null, avatar: null },
        allTechs: [
            { id: 1, name: 'React', slug: 'react' },
            { id: 2, name: 'Laravel', slug: 'laravel' },
            { id: 3, name: 'TypeScript', slug: 'typescript' },
            { id: 4, name: 'Python', slug: 'python' },
        ],
        userTechs: [],
        totalSteps: 5,
        errors: {} as Record<string, string>,
    },
}));

vi.mock('@inertiajs/react', () => ({
    router: { post: mockState.post },
    usePage: () => ({ props: mockState.props }),
}));

vi.mock('@/layouts/onboarding', () => ({
    default: ({ children, onSkipRequest }: { children: ReactNode; onSkipRequest: () => void }) => (
        <div>
            <button type="button" onClick={onSkipRequest}>
                Finalizar más tarde
            </button>
            {children}
        </div>
    ),
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@/components/projects/project-utils', () => ({
    avatarUrl: () => null,
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

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
        open ? <div role="dialog">{children}</div> : null,
    DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

describe('OnboardingIndex', () => {
    it('caps tech selection at 3 and shows the visible counter', async () => {
        const user = userEvent.setup();

        render(<OnboardingIndex />);

        expect(screen.getByText('0 de 3 elegidas')).toBeInTheDocument();

        const reactButton = screen.getByRole('button', { name: 'React' });
        const laravelButton = screen.getByRole('button', { name: 'Laravel' });
        const tsButton = screen.getByRole('button', { name: 'TypeScript' });
        const pythonButton = screen.getByRole('button', { name: 'Python' });

        await user.click(reactButton);
        await user.click(laravelButton);
        await user.click(tsButton);

        expect(screen.getByText('3 de 3 elegidas')).toBeInTheDocument();
        expect(pythonButton).toBeDisabled();
    });

    it('opens a confirmation dialog before running the destructive skip', async () => {
        const user = userEvent.setup();
        mockState.post.mockClear();

        render(<OnboardingIndex />);

        await user.click(screen.getByRole('button', { name: /Finalizar más tarde/i }));

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toHaveTextContent('¿Finalizar el onboarding ahora?');
        expect(dialog).toHaveTextContent('tu perfil quedará marcado como completo');

        expect(mockState.post).not.toHaveBeenCalledWith('/onboarding/skip', expect.anything(), expect.anything());

        await user.click(screen.getByRole('button', { name: 'Sí, finalizar' }));

        await waitFor(() => {
            expect(mockState.post).toHaveBeenCalledWith('/onboarding/skip', {}, expect.any(Object));
        });
    });

    it('renders the bio step with a visible Spanish label and surfaces real validation errors', async () => {
        const user = userEvent.setup();

        mockState.post.mockImplementation((_url: string, _data: unknown, options?: { onSuccess?: () => void; onFinish?: () => void }) => {
            options?.onSuccess?.();
            options?.onFinish?.();
        });

        mockState.props.errors = { bio: 'La bio no puede exceder 1000 caracteres.' };
        const { rerender } = render(<OnboardingIndex />);

        await user.click(screen.getByRole('button', { name: 'Siguiente' }));

        rerender(<OnboardingIndex />);

        const label = screen.getByText('Objetivo o bio breve');
        expect(label).toBeVisible();

        const bio = await screen.findByLabelText('Objetivo o bio breve');
        expect(bio).toHaveAttribute('aria-invalid', 'true');
        expect(bio).toHaveAttribute('aria-describedby', 'bio-error');
        expect(screen.getByRole('alert')).toHaveTextContent('La bio no puede exceder 1000 caracteres.');

        mockState.props.errors = {};
    });
});
