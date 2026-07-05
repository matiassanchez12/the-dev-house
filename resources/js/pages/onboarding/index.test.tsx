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
        ],
        userTechs: [],
        totalSteps: 5,
        errors: { bio: 'La biografía es obligatoria' },
    },
}));

vi.mock('@inertiajs/react', () => ({
    router: { post: mockState.post },
    usePage: () => ({ props: mockState.props }),
}));

vi.mock('@/layouts/onboarding', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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

describe('OnboardingIndex', () => {
    it('exposes the bio field with a programmatic label and error state', async () => {
        const user = userEvent.setup();

        mockState.post.mockImplementation((_url: string, _data: unknown, options?: { onSuccess?: () => void; onFinish?: () => void }) => {
            options?.onSuccess?.();
            options?.onFinish?.();
        });

        render(<OnboardingIndex />);

        await user.click(screen.getByRole('button', { name: 'Siguiente' }));

        const bio = await screen.findByLabelText('Biografía');

        expect(bio).toHaveAttribute('aria-invalid', 'true');
        expect(bio).toHaveAttribute('aria-describedby', 'bio-error');
        expect(screen.getByRole('alert')).toHaveTextContent('La biografía es obligatoria');
    });
});
