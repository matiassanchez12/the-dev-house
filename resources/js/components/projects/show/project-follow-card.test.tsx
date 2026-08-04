import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneElement, forwardRef, isValidElement } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectFollowCard } from './project-follow-card';

const { postMock, deleteMock, toastSuccessMock, toastErrorMock, dialogState } = vi.hoisted(() => ({
    postMock: vi.fn(),
    deleteMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    dialogState: { open: false },
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
    router: {
        post: postMock,
        delete: deleteMock,
    },
}));

vi.mock('@/components/ui/button', () => ({
    Button: forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
        function Button({ children, ...props }, ref) {
            return <button ref={ref} {...props}>{children}</button>;
        },
    ),
    buttonVariants: ({ className = '' }: { className?: string }) => className,
}));

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    AvatarImage: () => null,
    AvatarFallback: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    AvatarGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarGroupCount: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: { children: ReactNode; className?: string }) => <div data-testid="follow-card" className={className}>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: { children: ReactNode; open?: boolean }) => {
        dialogState.open = open ?? false;
        return <div>{children}</div>;
    },
    DialogContent: ({ children }: { children: ReactNode }) => dialogState.open ? <div role="dialog">{children}</div> : null,
    DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
    DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    DialogTrigger: ({ children, render: renderEl }: { children: ReactNode; render?: React.ReactElement<{ children?: ReactNode }> }) => {
        if (renderEl && isValidElement<{ children?: ReactNode }>(renderEl)) {
            return cloneElement(renderEl, undefined, children);
        }
        return <span>{children}</span>;
    },
}));

vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: ({ className }: { className?: string }) => <div className={className} />,
}));

vi.mock('sonner', () => ({
    toast: {
        success: toastSuccessMock,
        error: toastErrorMock,
    },
}));

beforeEach(() => {
    postMock.mockClear();
    deleteMock.mockClear();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
    dialogState.open = false;
});

describe('ProjectFollowCard', () => {
    it('shows the visitor empty state copy when there are no followers', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={0}
                isAuthenticated
            />,
        );

        expect(screen.getByText('Sé el primero en seguir este proyecto')).toBeInTheDocument();
        expect(screen.getByText('Recibí novedades apenas haya actividad')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Seguir/ })).toBeInTheDocument();
    });

    it('shows the visitor populated state copy and avatar preview when followers exist', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={3}
                followersPreview={[
                    { id: 1, name: 'Ada Lovelace', email: '', created_at: '', updated_at: '' },
                    { id: 2, name: 'Grace Hopper', email: '', created_at: '', updated_at: '' },
                ]}
                isAuthenticated
            />,
        );

        expect(screen.getByText('3 personas siguen este proyecto')).toBeInTheDocument();
        expect(screen.getByText('Sumate para recibir las novedades')).toBeInTheDocument();
        expect(screen.getByText('AL')).toBeInTheDocument();
        expect(screen.getByText('GH')).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('shows "Vos sos el único" when viewer is the only follower', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={1}
                followersPreview={[
                    { id: 1, name: 'Ada Lovelace', email: '', created_at: '', updated_at: '' },
                ]}
                isAuthenticated
                isFollowing
            />,
        );

        expect(screen.getByText('1 persona sigue este proyecto')).toBeInTheDocument();
        expect(screen.getByText('Vos sos el único que sigue este proyecto')).toBeInTheDocument();
    });

    it('submits a follow mutation for authenticated viewers', async () => {
        const user = userEvent.setup();

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={12}
                isAuthenticated
                isFollowing={false}
            />,
        );

        await user.click(screen.getByRole('button', { name: /Seguir/ }));

        expect(postMock).toHaveBeenCalledWith(
            '/projects.follow/alpha',
            {},
            expect.objectContaining({ preserveScroll: true }),
        );
        expect(deleteMock).not.toHaveBeenCalled();
    });

    it('submits an unfollow mutation for authenticated viewers', async () => {
        const user = userEvent.setup();

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={12}
                isAuthenticated
                isFollowing
            />,
        );

        await user.click(screen.getByRole('button', { name: /Siguiendo/ }));

        expect(deleteMock).toHaveBeenCalledWith(
            '/projects.unfollow/alpha',
            expect.objectContaining({ preserveScroll: true }),
        );
        expect(postMock).not.toHaveBeenCalled();
    });

    it('opens an authentication dialog for guests without submitting a follow mutation', async () => {
        const user = userEvent.setup();

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string) => {
                if (name === 'login') return '/login';
                if (name === 'register') return '/register';
                return `/${name}`;
            }),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={12}
                isAuthenticated={false}
            />,
        );

        expect(screen.getByText('12 personas siguen este proyecto')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Seguir/ }));

        const dialog = await screen.findByRole('dialog');

        expect(within(dialog).getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
        expect(within(dialog).getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register');
        expect(postMock).not.toHaveBeenCalled();
        expect(deleteMock).not.toHaveBeenCalled();
    });

    it('shows the creator empty state copy without follow actions', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={0}
                isAuthenticated
                readOnly
            />,
        );

        expect(screen.getByText('Todavía no tenés seguidores')).toBeInTheDocument();
        expect(screen.getByText('Compartí tu proyecto para que más gente lo descubra y lo siga')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Seguir|Siguiendo/ })).not.toBeInTheDocument();
    });

    it('shows the creator populated state copy and avatar preview without follow actions', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={3}
                followersPreview={[
                    { id: 1, name: 'Ada Lovelace', email: '', created_at: '', updated_at: '' },
                    { id: 2, name: 'Grace Hopper', email: '', created_at: '', updated_at: '' },
                ]}
                isAuthenticated
                readOnly
            />,
        );

        expect(screen.getByText('3 personas siguen tu proyecto')).toBeInTheDocument();
        expect(screen.getByText('Tu proyecto está generando interés')).toBeInTheDocument();
        expect(screen.getByText('AL')).toBeInTheDocument();
        expect(screen.getByText('GH')).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Seguir|Siguiendo/ })).not.toBeInTheDocument();
    });

    it('uses the high-contrast image treatment when rendered over a hero image', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={3}
                isAuthenticated={false}
                onImageBackground
            />,
        );

        expect(screen.getByTestId('follow-card')).toHaveClass('bg-black/45', 'text-white');
        expect(screen.getByText('3 personas siguen este proyecto')).toHaveClass('text-white');
        expect(screen.getByText('Sumate para recibir las novedades')).toHaveClass('text-white/80');
        expect(screen.getByRole('button', { name: /Seguir/ })).toHaveClass('border-white/20', 'text-white');
    });

    it('shows the follower count even when preview data is missing', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={3}
                followersPreview={[]}
                isAuthenticated={false}
            />,
        );

        expect(screen.getByText('3 personas siguen este proyecto')).toBeInTheDocument();
        expect(screen.queryByText('AL')).not.toBeInTheDocument();
        expect(screen.queryByText('+1')).not.toBeInTheDocument();
    });

    it('shows a partial avatar preview when only some follower data is available', () => {
        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => `/${name}/${slug ?? ''}`),
        });

        render(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={2}
                followersPreview={[
                    { id: 1, name: 'Ada Lovelace', email: '', created_at: '', updated_at: '' },
                ]}
                isAuthenticated
            />,
        );

        expect(screen.getByText('2 personas siguen este proyecto')).toBeInTheDocument();
        expect(screen.getByText('AL')).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument();
    });
});
