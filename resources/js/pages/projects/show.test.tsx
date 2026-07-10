import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Show from './show';

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

beforeEach(() => {
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/'),
    });
});

type JoinFormProps = { isOpen: boolean; isParticipant: boolean; isCreator: boolean };

let capturedJoinFormProps: JoinFormProps | undefined;

function requireCapturedJoinFormProps(): JoinFormProps {
    if (!capturedJoinFormProps) {
        throw new Error('Expected join form props to be captured');
    }

    return capturedJoinFormProps;
}

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
        return <div>{props.isOpen ? <span>JOIN_FORM_OPEN</span> : <span>JOIN_FORM_CLOSED</span>}</div>;
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
});
