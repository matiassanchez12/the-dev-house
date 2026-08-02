import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
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
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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
    DialogTrigger: ({ children, render: RenderEl }: { children: ReactNode; render?: React.ReactElement }) => {
        if (RenderEl) {
            return <RenderEl.type {...RenderEl.props}>{children}</RenderEl.type>;
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
    it('shows empty state with "Sé el primero en seguir" when no followers', () => {
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

        expect(screen.getByText('Sé el primero en seguir')).toBeInTheDocument();
        expect(screen.getByText('Nadie sigue este proyecto todavía')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Seguir/ })).toBeInTheDocument();
    });

    it('shows follower count and names when followers exist', () => {
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

        expect(screen.getByText('3 seguidores')).toBeInTheDocument();
        expect(screen.getByText(/Ada Lovelace, Grace Hopper y 1 más/)).toBeInTheDocument();
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

        expect(screen.getByText('12 seguidores')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Seguir/ }));

        const dialog = await screen.findByRole('dialog');

        expect(within(dialog).getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
        expect(within(dialog).getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register');
        expect(postMock).not.toHaveBeenCalled();
        expect(deleteMock).not.toHaveBeenCalled();
    });

    it('renders a read-only summary for creators without follow actions', () => {
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

        expect(screen.getByText('3 seguidores')).toBeInTheDocument();
        expect(screen.getByText(/Ada Lovelace, Grace Hopper y 1 más/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Seguir|Siguiendo/ })).not.toBeInTheDocument();
    });

    it('shows a generic fallback when follower preview data is missing', () => {
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

        expect(screen.getByText('3 seguidores')).toBeInTheDocument();
        expect(screen.getByText('3 personas siguen este proyecto')).toBeInTheDocument();
    });

    it('shows a partial preview summary without blank follower text', () => {
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

        expect(screen.getByText('2 seguidores')).toBeInTheDocument();
        expect(screen.getByText('Ada Lovelace y 1 más')).toBeInTheDocument();
    });
});
