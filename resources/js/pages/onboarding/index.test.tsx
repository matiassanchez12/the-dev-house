import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OnboardingIndex from './index';

const mockState = vi.hoisted(() => ({
    post: vi.fn(),
    props: {
        auth: { user: { id: 1, name: 'Ada Lovelace' } },
        user: { bio: null, avatar: null },
        allTechs: [
            { id: 1, name: 'React', slug: 'react', category: 'frontend' },
            { id: 2, name: 'Laravel', slug: 'laravel', category: 'backend' },
            { id: 3, name: 'TypeScript', slug: 'typescript', category: 'languages' },
            { id: 4, name: 'Python', slug: 'python', category: 'languages' },
            { id: 5, name: 'Zig', slug: 'zig', category: null },
        ],
        userTechs: [],
        totalSteps: 5,
        featuredIdeas: [
            {
                slug: 'cli-scaffold',
                title: 'CLI scaffold para proyectos',
                summary: 'Herramienta de línea de comandos para generar proyectos.',
                category: 'herramientas-dev',
                difficulty: 'intermedio',
                prefillTitle: 'CLI scaffold',
                prefillDescription: 'desc',
                prefillVision: '',
                techIds: [1],
                illustrationUrl: null,
            },
        ],
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
    it('groups techs by category, falls back uncategorized entries, and caps selection at 3', async () => {
        const user = userEvent.setup();

        render(<OnboardingIndex />);

        expect(screen.getByText('0 de 3 elegidas')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Frontend' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Backend' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Other' })).toBeInTheDocument();

        const reactButton = screen.getByRole('button', { name: 'React' });
        const laravelButton = screen.getByRole('button', { name: 'Laravel' });
        const tsButton = screen.getByRole('button', { name: 'TypeScript' });
        const pythonButton = screen.getByRole('button', { name: 'Python' });
        const zigButton = screen.getByRole('button', { name: 'Zig' });

        await user.click(reactButton);
        await user.click(laravelButton);
        await user.click(tsButton);

        expect(screen.getByText('3 de 3 elegidas')).toBeInTheDocument();
        expect(pythonButton).toBeDisabled();
        expect(zigButton).toBeDisabled();
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

// Step-5 coverage lives in its own describe: the wizard always mounts at step 1,
// so this drives through steps 1-4 (2 posts + 2 local advances) to reach step 5,
// then asserts the idea handoff payload. Lower friction than a dedicated file
// that would duplicate every mock above (design risk #4).
describe('OnboardingIndex step 5 idea handoff', () => {
    beforeEach(() => {
        mockState.post.mockReset();
        mockState.post.mockImplementation(
            (
                _url: string,
                _data: unknown,
                options?: { onSuccess?: () => void; onFinish?: () => void },
            ) => {
                options?.onSuccess?.();
                options?.onFinish?.();
            },
        );
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ projects: [] }),
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('posts the selected idea_slug in the step-4 payload after picking an idea', async () => {
        const user = userEvent.setup();

        render(<OnboardingIndex />);

        // steps 1 -> 2 -> 3 -> 4 -> 5
        for (let i = 0; i < 4; i++) {
            await user.click(screen.getByRole('button', { name: 'Siguiente' }));
        }

        const finalizar = await screen.findByRole('button', { name: 'Finalizar' });
        expect(
            screen.getByText('CLI scaffold para proyectos'),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('radio'));
        await user.click(finalizar);

        await waitFor(() => {
            expect(mockState.post).toHaveBeenCalledWith(
                '/onboarding/step-4',
                expect.objectContaining({ idea_slug: 'cli-scaffold' }),
                expect.any(Object),
            );
        });
    });
});
