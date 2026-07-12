import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationList } from './notification-list';

const { patchMock, usePageMock } = vi.hoisted(() => ({
    patchMock: vi.fn(),
    usePageMock: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, onClick, ...props }: { children: ReactNode; onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void }) => (
        <a
            {...props}
            onClick={(event) => {
                event.preventDefault();
                onClick?.(event);
            }}
        >
            {children}
        </a>
    ),
    router: {
        patch: patchMock,
    },
    usePage: usePageMock,
}));

beforeEach(() => {
    patchMock.mockClear();
    usePageMock.mockReset();

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string, id?: string | number) => `/${name}/${id ?? ''}`),
    });
});

describe('NotificationList', () => {
    it('routes accepted invitation notifications to the project page', () => {
        usePageMock.mockReturnValue({
            props: {
                notifications: [
                    {
                        id: '1',
                        type: 'notification',
                        data: {
                            type: 'project_invitation_accepted',
                            project_id: 10,
                            project_slug: 'collab-app',
                            project_title: 'Collab App',
                            invited_user_id: 20,
                            invited_user_name: 'Grace',
                        },
                        read_at: null,
                        created_at: '2026-07-10T00:00:00.000000Z',
                    },
                ],
            },
        });

        render(<NotificationList />);

        expect(screen.getByText('joined your project')).toBeInTheDocument();
        expect(screen.getByText('Grace')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/projects.show/collab-app');

        fireEvent.click(screen.getByRole('link'));

        expect(patchMock).toHaveBeenCalledWith('/notifications.read/1', { preserveScroll: true });
    });
});
