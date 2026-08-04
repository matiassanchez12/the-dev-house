import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectFollowCard } from './project-follow-card';
import { ProjectHero } from './project-hero';

const { postMock, deleteMock, dialogState } = vi.hoisted(() => ({
    postMock: vi.fn(),
    deleteMock: vi.fn(),
    dialogState: { open: false },
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, className, href }: { children: ReactNode; className?: string; href: string }) => <a className={className} href={href}>{children}</a>,
    router: {
        post: postMock,
        delete: deleteMock,
    },
}));

vi.mock('@/components/ui/image-gallery-dialog', () => ({
    ImageGalleryDialog: ({ open }: { open: boolean }) => <div data-testid="gallery-state">{open ? 'open' : 'closed'}</div>,
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
        success: vi.fn(),
        error: vi.fn(),
    },
}));

function renderImageHero(followSection?: ReactNode) {
    render(
        <ProjectHero
            title="Alpha"
            status="open"
            images={[{ path: 'projects/alpha/hero.jpg', url: 'https://example.com/hero.jpg' }]}
            followSection={followSection}
        />,
    );
}

describe('ProjectHero image interactions', () => {
    beforeEach(() => {
        postMock.mockClear();
        deleteMock.mockClear();
        dialogState.open = false;

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn((name: string, slug?: string) => {
                if (name === 'login') return '/login';
                if (name === 'register') return '/register';

                return `/${name}/${slug ?? ''}`;
            }),
        });
    });

    it('opens the gallery when the image hero itself is clicked', async () => {
        const user = userEvent.setup();

        renderImageHero();

        expect(screen.getByTestId('gallery-state')).toHaveTextContent('closed');

        await user.click(screen.getByRole('region', { name: 'Project hero' }));

        expect(screen.getByTestId('gallery-state')).toHaveTextContent('open');
    });

    it('does not open the gallery when authenticated viewers click follow inside the image hero', async () => {
        const user = userEvent.setup();

        renderImageHero(
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
        expect(screen.getByTestId('gallery-state')).toHaveTextContent('closed');
    });

    it('does not open the gallery when authenticated viewers click unfollow inside the image hero', async () => {
        const user = userEvent.setup();

        renderImageHero(
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
        expect(screen.getByTestId('gallery-state')).toHaveTextContent('closed');
    });

    it('does not open the gallery when guests click the follow CTA inside the image hero', async () => {
        const user = userEvent.setup();

        renderImageHero(
            <ProjectFollowCard
                projectSlug="alpha"
                followersCount={12}
                isAuthenticated={false}
            />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Seguir/ }));

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('gallery-state')).toHaveTextContent('closed');
    });
});
