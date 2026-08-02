import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Show from './show';

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children, header }: { children: ReactNode; header?: ReactNode }) => (
        <div>
            {header && <header>{header}</header>}
            {children}
        </div>
    ),
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, className, href }: { children: ReactNode; className?: string; href: string }) => <a className={className} href={href}>{children}</a>,
    router: {
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string, id?: number) => `/${name}/${id ?? ''}`),
    });
});

type JoinFormProps = { isOpen: boolean; isParticipant: boolean; isCreator: boolean };
type FollowCardProps = {
    projectSlug: string;
    isAuthenticated: boolean;
    readOnly?: boolean;
};

let capturedJoinFormProps: JoinFormProps | undefined;
let capturedFollowCardProps: FollowCardProps | undefined;

function requireCapturedJoinFormProps(): JoinFormProps {
    if (!capturedJoinFormProps) {
        throw new Error('Expected join form props to be captured');
    }

    return capturedJoinFormProps;
}

vi.mock('@/components/projects/show', async () => {
    const actual = await vi.importActual<typeof import('@/components/projects/show')>('@/components/projects/show');
    const ActualProjectFollowCard = actual.ProjectFollowCard;

    return {
        ...actual,
        ProjectDescription: () => <div />,
        ProjectVision: () => <div />,
        ProjectGallery: () => <div />,
        ProjectParticipants: () => <div />,
        ProjectCreatorCard: () => <div />,
        ProjectTechsCard: () => <div />,
        ProjectLinksCard: () => <div />,
        ProjectChatSummary: () => <div>CHAT_SUMMARY</div>,
        ProjectPhasesSection: () => <div />,
        ProjectStatusManager: () => <div />,
        ProjectDeleteDialog: () => <div />,
        ProjectFollowCard: (props: FollowCardProps) => {
            capturedFollowCardProps = props;
            return <ActualProjectFollowCard {...(props as Parameters<typeof ActualProjectFollowCard>[0])} />;
        },
        ProjectInvitationResponseCard: () => <div>INVITATION_RESPONSE_CARD</div>,
        ProjectJoinForm: (props: { isOpen: boolean; isParticipant: boolean; isCreator: boolean }) => {
            capturedJoinFormProps = props;
            return <div>{props.isOpen ? <span>JOIN_FORM_OPEN</span> : <span>JOIN_FORM_CLOSED</span>}</div>;
        },
    };
});

function baseProject(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 1,
        user_id: 99,
        title: 'Collab App',
        slug: 'collab-app',
        description: 'A project',
        status: 'in_progress',
        created_at: '',
        updated_at: '',
        creator: { id: 99, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '', slug: 'grace' },
        techs: [],
        participants: [],
        viewer_role: 'guest',
        ...overrides,
    } as never;
}

describe('Project show page wiring', () => {
    it('renders the join UI for an in_progress project so guests can request to join', () => {
        capturedJoinFormProps = undefined;

        render(<Show auth={{ user: { id: 1, name: 'Ada', email: 'ada@example.com', created_at: '2026-07-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' } }} project={baseProject({ status: 'in_progress' })} />);

        expect(screen.getByText('JOIN_FORM_OPEN')).toBeInTheDocument();
        expect(requireCapturedJoinFormProps().isOpen).toBe(true);
    });

    it('does not render the join UI for a completed project', () => {
        const { rerender } = render(<Show auth={{ user: { id: 1, name: 'Ada', email: 'ada@example.com', created_at: '2026-07-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' } }} project={baseProject({ status: 'in_progress' })} />);

        rerender(<Show auth={{ user: { id: 1, name: 'Ada', email: 'ada@example.com', created_at: '2026-07-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' } }} project={baseProject({ status: 'completed' })} />);

        expect(screen.getByText('JOIN_FORM_CLOSED')).toBeInTheDocument();
        expect(requireCapturedJoinFormProps().isOpen).toBe(false);
    });

    it('renders invitation response actions when the viewer has a pending invitation', () => {
        render(
            <Show
                auth={{ user: { id: 1, name: 'Ada', email: 'ada@example.com', created_at: '2026-07-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' } }}
                project={baseProject({
                    viewerPendingInvitation: {
                        id: 42,
                        project_id: 1,
                        invited_user_id: 1,
                        status: 'pending',
                        message: 'Vení a colaborar',
                        created_at: '',
                        updated_at: '',
                    },
                })}
            />,
        );

        expect(screen.getByText('INVITATION_RESPONSE_CARD')).toBeInTheDocument();
    });

    it('renders a mobile-first collaborators link for project creators', () => {
        render(
            <Show
                auth={{ user: { id: 99, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '' } }}
                project={baseProject({ viewer_role: 'creator' })}
            />,
        );

        const collaboratorsLink = screen.getByRole('link', { name: /colaboradores/i });

        expect(collaboratorsLink).toHaveAttribute('href', '/projects.collaborators/collab-app');
        expect(collaboratorsLink).toHaveClass('flex-1', 'sm:flex-none', 'w-full', 'sm:w-auto');
    });

    it('keeps member access when viewer_role is member even if participants are empty', () => {
        capturedJoinFormProps = undefined;

        render(
            <Show
                auth={{ user: { id: 5, name: 'Lin', email: 'lin@example.com', created_at: '', updated_at: '' } }}
                project={baseProject({
                    viewer_role: 'member',
                    participants: [],
                })}
            />,
        );

        expect(requireCapturedJoinFormProps().isParticipant).toBe(true);
        expect(requireCapturedJoinFormProps().isCreator).toBe(false);
        expect(screen.getByText('CHAT_SUMMARY')).toBeInTheDocument();
    });

    it('renders the follow section for non-creators in the main project content', () => {
        capturedFollowCardProps = undefined;

        render(
            <Show
                auth={{ user: null }}
                project={baseProject({
                    followers_count: 3,
                    is_followed_by_viewer: false,
                })}
            />,
        );

        const hero = screen.getByRole('region', { name: 'Project hero' });

        expect(within(hero).getByText('3 seguidores')).toBeInTheDocument();
        expect(within(hero).getByRole('button', { name: /Seguir/ })).toBeInTheDocument();
        expect(capturedFollowCardProps).toMatchObject({
            projectSlug: 'collab-app',
            isAuthenticated: false,
            readOnly: false,
        });
    });

    it('renders the follow section in read-only mode for project creators', () => {
        capturedFollowCardProps = undefined;

        render(
            <Show
                auth={{ user: { id: 99, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '' } }}
                project={baseProject({ viewer_role: 'creator', followers_count: 8 })}
            />,
        );

        const hero = screen.getByRole('region', { name: 'Project hero' });

        expect(within(hero).getByText('8 seguidores')).toBeInTheDocument();
        expect(within(hero).queryByRole('button', { name: /Seguir/ })).not.toBeInTheDocument();
        expect(within(hero).queryByRole('button', { name: /Siguiendo/ })).not.toBeInTheDocument();
        expect(capturedFollowCardProps).toMatchObject({
            projectSlug: 'collab-app',
            isAuthenticated: true,
            readOnly: true,
        });
    });

    it('keeps the follow section inside the image-backed hero for non-creators', () => {
        render(
            <Show
                auth={{ user: null }}
                project={baseProject({
                    followers_count: 3,
                    is_followed_by_viewer: false,
                    images: [{ path: 'projects/collab-app/hero.jpg', url: 'https://example.com/hero.jpg' }],
                })}
            />,
        );

        const hero = screen.getByRole('region', { name: 'Project hero' });

        expect(within(hero).getByRole('img', { name: 'Collab App' })).toBeInTheDocument();
        expect(within(hero).getByText('3 seguidores')).toBeInTheDocument();
        expect(within(hero).getByRole('button', { name: /Seguir/ })).toBeInTheDocument();
    });

    it('renders the read-only follow section inside the image-backed hero for creators', () => {
        render(
            <Show
                auth={{ user: { id: 99, name: 'Grace', email: 'grace@example.com', created_at: '', updated_at: '' } }}
                project={baseProject({
                    viewer_role: 'creator',
                    followers_count: 8,
                    images: [{ path: 'projects/collab-app/hero.jpg', url: 'https://example.com/hero.jpg' }],
                })}
            />,
        );

        const hero = screen.getByRole('region', { name: 'Project hero' });

        expect(within(hero).getByRole('img', { name: 'Collab App' })).toBeInTheDocument();
        expect(within(hero).getByText('8 seguidores')).toBeInTheDocument();
        expect(within(hero).queryByRole('button', { name: /Seguir/ })).not.toBeInTheDocument();
        expect(within(hero).queryByRole('button', { name: /Siguiendo/ })).not.toBeInTheDocument();
    });
});
