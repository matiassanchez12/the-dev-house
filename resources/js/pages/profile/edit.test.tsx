import { render, screen, within } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import type { NotificationSetting, PrivacySetting } from '@/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Edit from './edit';

const mockForms = vi.hoisted(() => ({
    capturePrivacyProps: vi.fn(),
    captureNotificationProps: vi.fn(),
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ header, children }: { header: ReactNode; children: ReactNode }) => (
        <div>
            <div>{header}</div>
            <div>{children}</div>
        </div>
    ),
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: { techs: [] },
    }),
}));

vi.mock('./partials/update-profile-information-form', () => ({
    default: () => (
        <section aria-label="profile information section">
            Profile information section
        </section>
    ),
}));

vi.mock('./partials/update-password-form', () => ({
    default: () => (
        <section aria-label="password section">
            Password section
        </section>
    ),
}));

vi.mock('./partials/delete-user-form', () => ({
    default: () => (
        <section aria-label="delete account section">
            Delete account section
        </section>
    ),
}));

vi.mock('./partials/update-profile-complete-form', () => ({
    default: () => (
        <section aria-label="complete profile form">Complete profile form</section>
    ),
}));

vi.mock('./partials/update-privacy-form', () => ({
    default: (props: { phone: string | null; privacySetting: PrivacySetting }) => {
        mockForms.capturePrivacyProps(props);

        return <section aria-label="privacy form">Privacy form</section>;
    },
}));

vi.mock('./partials/update-notification-settings-form', () => ({
    default: (props: { notificationSetting: NotificationSetting }) => {
        mockForms.captureNotificationProps(props);

        return (
            <section aria-label="notifications form">Notifications form</section>
        );
    },
}));

vi.mock('./partials/social-links-edit-form', () => ({
    default: () => (
        <section aria-label="social links form">Social links form</section>
    ),
}));

const privacySetting: PrivacySetting = {
    id: 1,
    user_id: 1,
    show_email: false,
    show_phone: false,
    is_discoverable: true,
    show_activity: true,
    email_notifications_enabled: false,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
};

const notificationSetting: NotificationSetting = {
    id: 1,
    user_id: 1,
    collaboration_emails: true,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
};

function renderEdit(overrides?: Partial<ComponentProps<typeof Edit>>) {
    return render(
        <Edit
            mustVerifyEmail={false}
            name="Ada"
            email="ada@example.com"
            emailVerifiedAt={null}
            userTechs={[]}
            phone={null}
            privacySetting={privacySetting}
            notificationSetting={notificationSetting}
            socialLinks={[]}
            {...overrides}
        />,
    );
}

function getProfileStack(container: HTMLElement) {
    const profileStack = container.querySelector('.mx-auto.max-w-7xl');

    expect(profileStack).not.toBeNull();

    return profileStack as HTMLElement;
}

function expectDirectStackChild(profileStack: HTMLElement, regionName: string) {
    expect(
        screen.getByRole('region', { name: regionName }).parentElement,
    ).toBe(profileStack);
}

function expectWrappedStackChild(profileStack: HTMLElement, regionName: string) {
    const wrapper = screen
        .getByRole('region', { name: regionName })
        .closest('.bg-card');

    expect(wrapper).not.toBeNull();
    expect(wrapper?.parentElement).toBe(profileStack);
    expect(
        within(wrapper as HTMLElement).getByRole('region', { name: regionName }),
    ).toBeVisible();
}

describe('Edit', () => {
    beforeEach(() => {
        mockForms.capturePrivacyProps.mockClear();
        mockForms.captureNotificationProps.mockClear();
    });

    it('renders scope-1 sections as direct stack children while deferred sections stay wrapped', () => {
        const { container } = renderEdit();
        const profileStack = getProfileStack(container);

        expectDirectStackChild(profileStack, 'profile information section');
        expectDirectStackChild(profileStack, 'password section');
        expectDirectStackChild(profileStack, 'delete account section');

        expectWrappedStackChild(profileStack, 'complete profile form');
        expectWrappedStackChild(profileStack, 'privacy form');
        expectWrappedStackChild(profileStack, 'notifications form');
        expectWrappedStackChild(profileStack, 'social links form');
    });

    it('forwards privacy and notification props to their deferred forms', () => {
        renderEdit();

        expect(mockForms.capturePrivacyProps).toHaveBeenCalledOnce();
        expect(mockForms.capturePrivacyProps).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: null,
                privacySetting: expect.objectContaining({
                    is_discoverable: true,
                    show_activity: true,
                }),
            }),
        );
        expect(mockForms.captureNotificationProps).toHaveBeenCalledOnce();
        expect(mockForms.captureNotificationProps).toHaveBeenCalledWith(
            expect.objectContaining({
                notificationSetting: expect.objectContaining({
                    collaboration_emails: true,
                }),
            }),
        );
    });

    it('omits the social links wrapper when socialLinks is undefined', () => {
        const { container } = render(
            <Edit
                mustVerifyEmail={false}
                name="Ada"
                email="ada@example.com"
                emailVerifiedAt={null}
                userTechs={[]}
                phone={null}
                privacySetting={privacySetting}
                notificationSetting={notificationSetting}
            />,
        );

        const profileStack = getProfileStack(container);

        expect(
            screen.queryByRole('region', { name: 'social links form' }),
        ).not.toBeInTheDocument();
        expectDirectStackChild(profileStack, 'password section');
        expectDirectStackChild(profileStack, 'delete account section');
    });
});
