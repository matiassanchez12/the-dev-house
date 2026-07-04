import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Show from './show';

// Stub AppLayout so children render in isolation.
vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

// The global `route` helper is referenced only inside the creator-only branch,
// but stub it so nothing blows up if the page ever calls it.
beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/'),
    });
});

// Capture the props the page wires into ProjectJoinForm and render a marker so
// we can assert the visible behaviour without pulling in the real form.
let capturedJoinFormProps: { isOpen: boolean; isParticipant: boolean; isCreator: boolean } | undefined;

vi.mock('@/components/projects/show', () => ({
    ProjectHero: () => <div data-testid="hero" />,
    ProjectDescription: () => <div />,
    ProjectVision: () => <div />,
    ProjectGallery: () => <div />,
    ProjectParticipants: () => <div />,
    ProjectCreatorCard: () => <div />,
    ProjectTechsCard: () => <div />,
    ProjectLinksCard: () => <div />,
    ProjectChatSummary: () => <div />,
    ProjectPhasesSection: () => <div />,
    ProjectStatusManager: () => <div />,
    ProjectDeleteDialog: () => <div />,
    ProjectJoinForm: (props: { isOpen: boolean; isParticipant: boolean; isCreator: boolean }) => {
        capturedJoinFormProps = props;
        return (
            <div>
                {props.isOpen ? <span>JOIN_FORM_OPEN</span> : <span>JOIN_FORM_CLOSED</span>}
            </div>
        );
    },
}));

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

        render(
            <Show
                auth={{ user: { id: 1, name: 'Ada' } }}
                project={baseProject({ status: 'in_progress' })}
            />,
        );

        // The join form is mounted (not hidden) for in_progress.
        expect(screen.getByText('JOIN_FORM_OPEN')).toBeInTheDocument();
        // And the page computes isOpen=true for that status.
        expect(capturedJoinFormProps).toBeDefined();
        expect(capturedJoinFormProps?.isOpen).toBe(true);
    });

    it('does not render the join UI for a completed project', () => {
        // Sanity: completed projects must not accept requests even though the
        // component is still mounted by the page.
        const { rerender } = render(
            <Show
                auth={{ user: { id: 1, name: 'Ada' } }}
                project={baseProject({ status: 'in_progress' })}
            />,
        );

        rerender(
            <Show
                auth={{ user: { id: 1, name: 'Ada' } }}
                project={baseProject({ status: 'completed' })}
            />,
        );

        expect(screen.getByText('JOIN_FORM_CLOSED')).toBeInTheDocument();
        expect(capturedJoinFormProps?.isOpen).toBe(false);
    });
});