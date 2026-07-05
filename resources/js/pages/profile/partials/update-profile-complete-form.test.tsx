import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import UpdateProfileCompleteForm from './update-profile-complete-form';

const mockState = vi.hoisted(() => ({
    setData: vi.fn(),
    post: vi.fn(),
    transform: vi.fn(),
    props: {
        auth: { user: { id: 1, name: 'Ada Lovelace', avatar: null, bio: '' } },
    },
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ props: mockState.props }),
    useForm: () => ({
        data: {
            bio: '',
            avatar: null,
            techs: [{ id: 1, years_experience: 3, proficiency: 'advanced' }],
        },
        setData: mockState.setData,
        post: mockState.post,
        processing: false,
        errors: { bio: 'La biografía es obligatoria' },
        recentlySuccessful: false,
        transform: mockState.transform,
    }),
}));

vi.mock('@/components/projects/project-utils', () => ({
    avatarUrl: () => null,
}));

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarFallback: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe('UpdateProfileCompleteForm', () => {
    it('wires the bio field and keeps the tech proficiency slider accessible', async () => {
        render(
            <UpdateProfileCompleteForm
                userTechs={[
                    {
                        id: 1,
                        name: 'React',
                        slug: 'react',
                        pivot: { years_experience: 3, proficiency: 'advanced' },
                    },
                ]}
                allTechs={[
                    { id: 1, name: 'React', slug: 'react' },
                ]}
            />,
        );

        const bio = screen.getByLabelText('Biografía');

        expect(bio).toHaveAttribute('aria-invalid', 'true');
        expect(bio).toHaveAttribute('aria-describedby', 'bio-error');
        expect(screen.getByRole('alert')).toHaveTextContent('La biografía es obligatoria');

        expect(screen.getByRole('slider', { name: /react.*nivel/i })).toHaveValue('3');
    });
});
