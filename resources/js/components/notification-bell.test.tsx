import { render, screen, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotificationBell from './notification-bell';

const { reloadMock, postMock, usePageMock, privateMock, notificationMock, leaveMock } = vi.hoisted(() => ({
    reloadMock: vi.fn(),
    postMock: vi.fn(),
    usePageMock: vi.fn(),
    privateMock: vi.fn(),
    notificationMock: vi.fn(),
    leaveMock: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
    router: {
        reload: reloadMock,
        post: postMock,
    },
    usePage: usePageMock,
}));

vi.mock('@/components/notification-list', () => ({
    NotificationList: () => <div data-testid="notification-list" />,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/dropdown', () => {
    const Dropdown = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    Dropdown.Trigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    Dropdown.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    return { Dropdown };
});

describe('NotificationBell', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        document.title = 'The Dev House';
    });

    it('does not render or subscribe when the user is not authenticated', () => {
        usePageMock.mockReturnValue({
            url: '/dashboard',
            props: {
                auth: {
                    user: null,
                },
            },
        });

        render(<NotificationBell />);

        expect(screen.queryByLabelText('Notificaciones')).not.toBeInTheDocument();
        expect(privateMock).not.toHaveBeenCalled();
    });

    it('subscribes to the private channel and reloads notifications on broadcast', async () => {
        usePageMock.mockReturnValue({
            props: {
                auth: {
                    user: {
                        id: 1,
                        name: 'Ada Lovelace',
                        slug: 'ada-lovelace',
                        unread_notifications_count: 2,
                    },
                },
            },
        });

        privateMock.mockReturnValue({
            notification: notificationMock,
        });

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn().mockReturnValue('/notifications'),
        });

        Object.defineProperty(window, 'Echo', {
            configurable: true,
            value: {
                private: privateMock,
                leave: leaveMock,
            },
        });

        render(<NotificationBell />);

        expect(privateMock).toHaveBeenCalledWith('user.1');
        expect(notificationMock).toHaveBeenCalledTimes(1);

        const callback = notificationMock.mock.calls[0][0] as () => void;

        act(() => {
            callback();
        });

        expect(reloadMock).toHaveBeenCalledWith({ only: ['auth', 'notifications'] });

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('pulses the document title when there are unread notifications', async () => {
        vi.useFakeTimers();
        document.title = 'The Dev House';

        usePageMock.mockReturnValue({
            url: '/dashboard',
            props: {
                auth: {
                    user: {
                        id: 1,
                        name: 'Ada Lovelace',
                        slug: 'ada-lovelace',
                        unread_notifications_count: 2,
                    },
                },
            },
        });

        privateMock.mockReturnValue({
            notification: notificationMock,
        });

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn().mockReturnValue('/notifications'),
        });

        Object.defineProperty(window, 'Echo', {
            configurable: true,
            value: {
                private: privateMock,
                leave: leaveMock,
            },
        });

        render(<NotificationBell />);

        expect(document.title).toBe('(2) The Dev House');

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(document.title).toBe('The Dev House');

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(document.title).toBe('(2) The Dev House');
    });

    it('restores the original title when unmounted', async () => {
        vi.useFakeTimers();
        document.title = 'The Dev House';

        usePageMock.mockReturnValue({
            url: '/dashboard',
            props: {
                auth: {
                    user: {
                        id: 1,
                        name: 'Ada Lovelace',
                        slug: 'ada-lovelace',
                        unread_notifications_count: 2,
                    },
                },
            },
        });

        privateMock.mockReturnValue({
            notification: notificationMock,
        });

        Object.defineProperty(globalThis, 'route', {
            configurable: true,
            value: vi.fn().mockReturnValue('/notifications'),
        });

        Object.defineProperty(window, 'Echo', {
            configurable: true,
            value: {
                private: privateMock,
                leave: leaveMock,
            },
        });

        const { unmount } = render(<NotificationBell />);

        expect(document.title).toBe('(2) The Dev House');

        unmount();

        expect(document.title).toBe('The Dev House');
    });
});
